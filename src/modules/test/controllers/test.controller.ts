import { Controller } from '../../../core/decorators/controller.decorator';
import { Get, Post, Put, Delete } from '../../../http/decorators/request-mapping.decorator';
import { Param, Query, Body, Req, Res, Headers } from '../../../http/decorators/route-params.decorator';
import { UseMiddleware } from '../../../middleware/decorators/use-middleware.decorator';
import { AuthMiddleware } from '../../../middleware/built-in/auth.middleware';
import { LoggingMiddleware } from '../../../middleware/built-in/logging.middleware';
import { AnxietyRequest, AnxietyResponse } from '../../../middleware/interfaces/middleware.interface';
import { TestService } from '../services/test.service';

/**
 * Test controller for handling test-related HTTP requests
 */
@Controller('/api/test')
@UseMiddleware(LoggingMiddleware)
export class TestController {
  private testService: TestService;

  constructor() {
    this.testService = new TestService();
  }
  
  /**
   * Get all tests
   */
  @Get()
  getAllTests(@Query() query: any): object {
    return this.testService.getAllTests(query);
  }

  /**
   * Get test by ID with authentication
   */
  @Get('/:id')
  @UseMiddleware(AuthMiddleware)
  getTestById(
    @Param('id') id: string, 
    @Query('include') include?: string,
    @Headers('user-agent') userAgent?: string
  ): object {
    return this.testService.getTestById(id, include, userAgent);
  }

  /**
   * Create a new test with authentication
   */
  @Post()
  @UseMiddleware(AuthMiddleware)
  createTest(
    @Body() body: any, 
    @Req() req: AnxietyRequest
  ): object {
    return this.testService.createTest(body, req.user, req.context);
  }

  /**
   * Update test by ID with authentication
   */
  @Put('/:id')
  @UseMiddleware(AuthMiddleware)
  updateTest(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: AnxietyRequest
  ): object {
    return this.testService.updateTest(id, body, req.user);
  }

  /**
   * Delete test by ID with authentication
   */
  @Delete('/:id')
  @UseMiddleware(AuthMiddleware)
  deleteTest(@Param('id') id: string): object {
    return this.testService.deleteTest(id);
  }

  /**
   * Custom endpoint with manual response handling
   */
  @Get('/custom/:name')
  customEndpoint(
    @Param('name') name: string,
    @Query() queryParams: any,
    @Req() req: AnxietyRequest,
    @Res() res: AnxietyResponse
  ): void {
    const result = this.testService.customEndpoint(name, queryParams, req.context);
    res.status(200).json(result);
  }

  /**
   * Health check endpoint
   */
  @Get('/health')
  healthCheck(): object {
    return this.testService.healthCheck();
  }
}