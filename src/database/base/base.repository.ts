import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions, DeepPartial, UpdateResult, DeleteResult, ObjectLiteral } from 'typeorm';

/**
 * Base repository class with common database operations
 * Provides a standardized interface for all repositories
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  /**
   * Find all entities
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Find entities with pagination
   */
  async findWithPagination(
    page = 1,
    limit = 10,
    options?: FindManyOptions<T>
  ): Promise<{ data: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find one entity by criteria
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * Find one entity by ID
   */
  async findById(id: string | number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  /**
   * Find entities by IDs
   */
  async findByIds(ids: (string | number)[]): Promise<T[]> {
    return this.repository.findByIds(ids as any[]);
  }

  /**
   * Create and save a new entity
   */
  async create(entityData: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(entityData);
    return this.repository.save(entity);
  }

  /**
   * Create and save multiple entities
   */
  async createMany(entitiesData: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(entitiesData);
    return this.repository.save(entities);
  }

  /**
   * Update an entity by ID
   */
  async updateById(id: string | number, updateData: DeepPartial<T>): Promise<UpdateResult> {
    return this.repository.update(id, updateData as any);
  }

  /**
   * Update entities by criteria
   */
  async update(criteria: FindOptionsWhere<T>, updateData: DeepPartial<T>): Promise<UpdateResult> {
    return this.repository.update(criteria, updateData as any);
  }

  /**
   * Save an entity (create or update)
   */
  async save(entity: DeepPartial<T>): Promise<T> {
    return this.repository.save(entity);
  }

  /**
   * Save multiple entities
   */
  async saveMany(entities: DeepPartial<T>[]): Promise<T[]> {
    return this.repository.save(entities);
  }

  /**
   * Delete an entity by ID
   */
  async deleteById(id: string | number): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  /**
   * Delete entities by criteria
   */
  async delete(criteria: FindOptionsWhere<T>): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }

  /**
   * Soft delete an entity by ID (if entity supports soft delete)
   */
  async softDeleteById(id: string | number): Promise<UpdateResult> {
    return this.repository.softDelete(id);
  }

  /**
   * Restore a soft deleted entity by ID
   */
  async restoreById(id: string | number): Promise<UpdateResult> {
    return this.repository.restore(id);
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  /**
   * Check if entity exists
   */
  async exists(options: FindOneOptions<T>): Promise<boolean> {
    const count = await this.repository.count({
      where: options.where,
      take: 1,
    });
    return count > 0;
  }

  /**
   * Check if entity exists by ID
   */
  async existsById(id: string | number): Promise<boolean> {
    return this.exists({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  /**
   * Execute raw SQL query
   */
  async query(sql: string, parameters?: any[]): Promise<any> {
    return this.repository.query(sql, parameters);
  }

  /**
   * Create query builder
   */
  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * Get the underlying TypeORM repository
   */
  getRepository(): Repository<T> {
    return this.repository;
  }

  /**
   * Begin transaction
   */
  async transaction<R>(fn: (repository: Repository<T>) => Promise<R>): Promise<R> {
    return this.repository.manager.transaction(async (transactionalEntityManager) => {
      const transactionalRepository = transactionalEntityManager.getRepository(this.repository.target) as Repository<T>;
      return fn(transactionalRepository);
    });
  }

  /**
   * Find one entity or throw error if not found
   */
  async findOneOrFail(options: FindOneOptions<T>): Promise<T> {
    return this.repository.findOneOrFail(options);
  }

  /**
   * Find one entity by ID or throw error if not found
   */
  async findByIdOrFail(id: string | number): Promise<T> {
    return this.repository.findOneOrFail({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }
}