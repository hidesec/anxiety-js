export const Controller = (prefix = ''): ClassDecorator =>{
  return (target: any) => {
    Reflect.defineMetadata('prefix', prefix, target);

    if (!Reflect.hasOwnMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };
};
