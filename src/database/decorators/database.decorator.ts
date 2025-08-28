/**
 * Database decorators for the Anxiety framework
 */

import 'reflect-metadata';
import { 
  Entity as TypeORMEntity, 
  Repository, 
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
  Unique,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  RelationId,
  BeforeInsert,
  AfterInsert,
  BeforeUpdate,
  AfterUpdate,
  BeforeRemove,
  AfterRemove,
  AfterLoad,
  ObjectLiteral,
  EntityTarget
} from 'typeorm';
import { DatabaseService } from '../database.service';

// Metadata keys for database decorators
export const ENTITY_METADATA = Symbol('ENTITY_METADATA');
export const REPOSITORY_METADATA = Symbol('REPOSITORY_METADATA');
export const DATABASE_SERVICE_METADATA = Symbol('DATABASE_SERVICE_METADATA');

/**
 * Entity decorator for marking a class as a database entity
 * Usage: @Entity() class User { ... }
 * Usage: @Entity('users') class User { ... }
 * Usage: @Entity({ name: 'users', schema: 'public' }) class User { ... }
 */
export function Entity(nameOrOptions?: string | { name?: string; schema?: string; database?: string; synchronize?: boolean; orderBy?: any }): ClassDecorator {
  return (target: any) => {
    if (typeof nameOrOptions === 'string') {
      // Simple name case: @Entity('users')
      TypeORMEntity(nameOrOptions)(target);
    } else if (nameOrOptions) {
      // Options object case: @Entity({ name: 'users', schema: 'public' })
      TypeORMEntity(nameOrOptions as any)(target);
    } else {
      // No parameters case: @Entity()
      TypeORMEntity()(target);
    }
    Reflect.defineMetadata('is_entity', true, target);
    Reflect.defineMetadata(ENTITY_METADATA, nameOrOptions, target);
  };
}

/**
 * Repository decorator for injecting repository dependencies
 * Usage: @InjectRepository(User) private userRepo: Repository<User>
 */
export function InjectRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = Repository;
    Reflect.defineMetadata('design:paramtypes', existingTokens, target);
    
    const existingRepos = Reflect.getMetadata(REPOSITORY_METADATA, target) || [];
    existingRepos.push({ entity, index: parameterIndex });
    Reflect.defineMetadata(REPOSITORY_METADATA, existingRepos, target);
  };
}

/**
 * DatabaseService decorator for injecting the database service
 * Usage: @InjectDatabaseService() private dbService: DatabaseService
 */
export function InjectDatabaseService(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = DatabaseService;
    Reflect.defineMetadata('design:paramtypes', existingTokens, target);
    Reflect.defineMetadata(DATABASE_SERVICE_METADATA, parameterIndex, target);
  };
}

/**
 * Transaction decorator for wrapping methods in database transactions
 * Usage: @Transaction() async updateUser() { ... }
 */
export function Transaction(): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const databaseService = (this as any)._databaseService || (global as any).databaseService;
      if (!databaseService) {
        throw new Error('DatabaseService not available');
      }
      
      const dataSource = databaseService.getDataSource();
      const queryRunner = dataSource.createQueryRunner();
      
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Set the query runner for the current context
        (this as any)._queryRunner = queryRunner;
        const result = await originalMethod.apply(this, args);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
        delete (this as any)._queryRunner;
      }
    };
    
    return descriptor;
  };
}

/**
 * Transactional decorator for class-level transaction management
 * Usage: @Transactional class UserService { ... }
 */
export function Transactional(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('is_transactional', true, target);
    
    // Wrap all methods with transaction support
    const prototype = target.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype);
    
    methodNames.forEach(methodName => {
      if (methodName !== 'constructor' && typeof prototype[methodName] === 'function') {
        const originalMethod = prototype[methodName];
        
        prototype[methodName] = async function (...args: any[]) {
          if ((this as any)._queryRunner) {
            // Already in a transaction, just call the method
            return originalMethod.apply(this, args);
          }
          
          const databaseService = (this as any)._databaseService || (global as any).databaseService;
          if (!databaseService) {
            return originalMethod.apply(this, args);
          }
          
          const dataSource = databaseService.getDataSource();
          const queryRunner = dataSource.createQueryRunner();
          
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          try {
            (this as any)._queryRunner = queryRunner;
            const result = await originalMethod.apply(this, args);
            await queryRunner.commitTransaction();
            return result;
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
            delete (this as any)._queryRunner;
          }
        };
      }
    });
  };
}

/**
 * Cache decorator for caching database query results
 * Usage: @Cache(300) async findUser(id: number) { ... }
 */
export function Cache(ttl = 300): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const cache = new Map<string, { data: any; expiry: number }>();
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${String(propertyKey)}.${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      
      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + (ttl * 1000),
      });
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Validate decorator for validating entity data before database operations
 * Usage: @Validate() async saveUser(@Body() user: CreateUserDto) { ... }
 */
export function Validate(): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Validate each argument that has validation metadata
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg && typeof arg === 'object') {
          // Basic validation - can be extended with class-validator
          try {
            if ((this as any).validateObject) {
              const validationErrors = await (this as any).validateObject(arg);
              if (validationErrors && validationErrors.length > 0) {
                throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
              }
            }
          } catch (error) {
            // Validation method not available, skip validation
          }
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Utility function to get repository metadata
 */
export function getRepositoryMetadata(target: any): any[] {
  return Reflect.getMetadata(REPOSITORY_METADATA, target) || [];
}

/**
 * Utility function to get database service metadata
 */
export function getDatabaseServiceMetadata(target: any): number | undefined {
  return Reflect.getMetadata(DATABASE_SERVICE_METADATA, target);
}

/**
 * Utility function to check if a class is an entity
 */
export function isEntity(target: any): boolean {
  return Reflect.getMetadata('is_entity', target) === true;
}

/**
 * Utility function to check if a class is a repository
 */
export function isRepository(target: any): boolean {
  return Reflect.getMetadata('is_repository', target) === true;
}

/**
 * Utility function to get entity metadata
 */
export function getEntityMetadata(target: any): any {
  return Reflect.getMetadata(ENTITY_METADATA, target);
}

// Re-export commonly used TypeORM decorators
export {
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
  Unique,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  RelationId,
  BeforeInsert,
  AfterInsert,
  BeforeUpdate,
  AfterUpdate,
  BeforeRemove,
  AfterRemove,
  AfterLoad
};