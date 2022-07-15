import {Controller} from '../package/decorators/core/controller.decorator';
import {Get} from '../package/decorators/http/request-map.decorator';
import {Request, Response} from 'express';

@Controller('user')
export default class TestController {
  @Get('/')
  index(req: Request, res: Response) {
    return res.send('Test Index');
  }
  @Get('/:name')
  detail(req: Request, res: Response) {
    return res.send(`Test Detail with params of ${req.params.name}`);
  }
}
