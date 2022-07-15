import 'reflect-metadata';
import express, {Request, Response} from 'express';
import {controllers} from './controllers';
import {RouteDefinitionInterface} from './package/interface/decorator/http-interface/RouteDefinition.interface';

const app = express();

app.get('/', (req: Request, res: Response)=> {
  res.send('hello there!');
});

controllers.forEach((controller) => {
  const instance = new controller() as any;
  const prefix = Reflect.getMetadata('prefix', controller);
  const routes: Array<RouteDefinitionInterface> = Reflect.getMetadata('routes', controller);

  routes.forEach((route) => {
    app[route.requestMethod]('/' + prefix + route.path, (req: express.Request, res: express.Response) => {
      instance[route.methodName](req, res);
    });
  });
});

app.listen(3000, () => {
  console.log('app running on port 3000!');
});
