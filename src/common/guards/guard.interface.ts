import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Interface for route guards that control access to endpoints
 */
export type GuardInterface = {
  /**
   * Determines if the request should be allowed to proceed
   * @param req - The request object
   * @param res - The response object
   * @returns Promise<boolean> - True if access is granted, false otherwise
   */
  canActivate(req: AnxietyRequest, res: AnxietyResponse): Promise<boolean> | boolean;
}

/**
 * Next handler function type for guards
 */
export type GuardNextHandler = () => void;