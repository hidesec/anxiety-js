import { TestController } from './controllers/test.controller';
import { TestService } from './services/test.service';

/**
 * Test module configuration
 */
export class TestModule {
  static controllers = [TestController];
  static services = [TestService];
  
  /**
   * Get all controllers in this module
   */
  static getControllers() {
    return this.controllers;
  }
  
  /**
   * Get all services in this module
   */
  static getServices() {
    return this.services;
  }
}