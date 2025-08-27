import { TestModule } from './test/test.module';

/**
 * Root application module
 */
export class AppModule {
  static imports = [TestModule];
  
  /**
   * Get all imported modules
   */
  static getImports() {
    return this.imports;
  }
  
  /**
   * Get all controllers from imported modules
   */
  static getAllControllers() {
    const controllers: any[] = [];
    
    this.imports.forEach(module => {
      if (module.getControllers) {
        controllers.push(...module.getControllers());
      }
    });
    
    return controllers;
  }
  
  /**
   * Get all services from imported modules
   */
  static getAllServices() {
    const services: any[] = [];
    
    this.imports.forEach(module => {
      if (module.getServices) {
        services.push(...module.getServices());
      }
    });
    
    return services;
  }
}