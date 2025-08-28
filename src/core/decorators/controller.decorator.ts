import 'reflect-metadata';

/**
 * Controller decorator that defines a class as a controller with an optional route prefix.
 * @param prefix - Optional route prefix for all routes in this controller
 */
export function Controller(prefix = ''): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('controller_prefix', prefix, target);
    Reflect.defineMetadata('is_controller', true, target);
  };
}