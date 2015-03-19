var util = require('util');
var React = require('react');
var path = require('path');
var LRUCache = require('lru-cache');
var Routr = require('routr');
var extend = util._extend || require('util-extend');

var COMPONENTS_DIR = path.join(process.cwd(), 'components');
var CONF_DIR = path.join(process.cwd(), 'conf');

function ViewRouter(config){
  if (!(this instanceof ViewRouter)){
    return new ViewRouter(config);
  }
  if(util.isUndefined(config)){
    config = 'viewRoutes.json';
  }
  if(util.isString(config)){
    config = require(path.join(CONF_DIR, config));
  }
  if(!util.isObject(config)){
    throw new ReferenceError('config must be an object');
  }
  Routr.apply(this, arguments);
  this._reqCache = LRUCache({max: 10});
}
util.inherits(ViewRouter, Routr);
function createCacheKey(req){
  return [req.path(),req.method.toUpperCase()].join(':#!:');
}
function componentFromModuleAndProps(module, props){
  var Component = React.createFactory(module);
  return Component(props || {});
}
function componentModuleFromPath(componentPath){
  return require(path.join(COMPONENTS_DIR, componentPath + '.js'));
}
function componentFromPath(componentPath, props){
  var module = componentModuleFromPath(componentPath);
  return componentFromModuleAndProps(module, props);
}
ViewRouter.prototype.componentFromPath = componentFromPath;
function componentFromViewRoute(viewRoute){
  return componentFromModuleAndProps(viewRoute.component, viewRoute.params);
}
ViewRouter.prototype.componentFromViewRoute = componentFromViewRoute;
function viewRouteFromRouteAndReq(route, req){
  return {
    params: extend(req.params, route.params),
    componentPath: route.componentPath,
    component: componentModuleFromPath(route.componentPath),
    config: route.config
  };
}
ViewRouter.prototype.viewRouteFromRouteAndReq = viewRouteFromRouteAndReq;
ViewRouter.prototype.componentFromNameAndReq = function(name, req){
  var viewRoute = this.viewRouteFromRouteAndReq(this._routes[name], req);
  var component = this.componentFromViewRoute(viewRoute);
  return component;
};
ViewRouter.prototype.getRoutes = function (url, options) {
    var keys = Object.keys(this._routes);
    var route;
    var match;
    var routes = null;
    options.method = options.method || options.req.method;

    for (var i = 0, len = keys.length; i < len; i++) {
      route = this._routes[keys[i]];
      match = route.match(url, options);
      if (match) {
        routes = routes || [];
        var viewRoute = extend(viewRouteFromRouteAndReq(route, options.req), {
          name: keys[i],
          url: url,
          navigate: options && options.navigate
        });
        routes.push(viewRoute);
      }
    }

    return routes;
};
ViewRouter.prototype.getRoutesFromReq = function getRoutesFromReq(req){
  var cacheKey = createCacheKey(req);
  var routes = this._reqCache.get(cacheKey);
  if(!routes){
    routes = this.getRoutes(req.path(), {method: req.method, req: req});
    this._reqCache.set(cacheKey, routes);
  }
  return routes;
};
ViewRouter.prototype.routesFromReq = ViewRouter.prototype.getRoutesFromReq;

module.exports = ViewRouter;
