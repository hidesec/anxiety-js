import 'reflect-metadata';

export function Controller(prefix: string = ''): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('controller_prefix', prefix, target);
    Reflect.defineMetadata('is_controller', true, target);
  };
}