export type RouteDefinitionInterface = {
    // path to route
    path: string;
    // HTTP Request method
    requestMethod: 'get' | 'post' | 'delete' | 'options' | 'put';
    // Method name within our class responsible for this route
    methodName: string | symbol;
}
