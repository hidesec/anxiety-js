import { Controller } from '../package/decorators/core/controller.decorator';
import { Get, Post, Put, Delete } from '../package/decorators/http/request-map.decorator';
import { Param, Query, Body, Req, Res, Headers } from '../package/decorators/http/route-param.decorator';
import { UseMiddleware } from '../package/decorators/middleware/use-middleware.decorator';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { LoggingMiddleware } from '../middleware/logging.middleware';
import { AnxietyRequest, AnxietyResponse } from '../package/interface/middleware/middleware.interface';

@Controller('/api/test')
@UseMiddleware(LoggingMiddleware)
export class TestController {
  
  @Get()
  getAllTests(@Query() query: any): object {
    return {
      message: 'All tests retrieved',
      query,
      timestamp: new Date().toISOString()
    };
  }

  @Get('/:id')
  @UseMiddleware(AuthMiddleware)
  getTestById(
    @Param('id') id: string, 
    @Query('include') include?: string,
    @Headers('user-agent') userAgent?: string
  ): object {
    return {
      id,
      include,
      userAgent,
      message: 'Test retrieved successfully'
    };
  }

  @Post()
  @UseMiddleware(AuthMiddleware)
  createTest(
    @Body() body: any, 
    @Req() req: AnxietyRequest
  ): object {
    return {
      message: 'Test created successfully',
      data: body,
      user: req.user,
      context: req.context
    };
  }

  @Put('/:id')
  @UseMiddleware(AuthMiddleware)
  updateTest(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: AnxietyRequest
  ): object {
    return {
      message: `Test ${id} updated successfully`,
      data: body,
      user: req.user
    };
  }

  @Delete('/:id')
  @UseMiddleware(AuthMiddleware)
  deleteTest(@Param('id') id: string): object {
    return {
      message: `Test ${id} deleted successfully`,
      timestamp: new Date().toISOString()
    };
  }

  @Get('/custom/:name')
  customEndpoint(
    @Param('name') name: string,
    @Query() queryParams: any,
    @Req() req: AnxietyRequest,
    @Res() res: AnxietyResponse
  ): void {
    res.status(200).json({
      greeting: `Hello ${name}! Welcome to Anxiety Framework`,
      params: queryParams,
      context: req.context,
      timestamp: new Date().toISOString()
    });
  }

  @Get('/health')
  healthCheck(): object {
    return {
      status: 'OK',
      service: 'Anxiety Framework',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}