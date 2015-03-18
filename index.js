var util = require('util');
var path = require('path');
var LRUCache = require('lru-cache');
var React = require('react');
var restify = require('restify');
var Routr = require('routr');
var extend = util._extend || require('util-extend');

var COMPONENTS_DIR = path.join(process.cwd(), 'components');
var COMPONENT_READY = 'component:ready';

function ViewRouter(){
  Routr.apply(this, arguments);
  this._reqCache = LRUCache({max: 10});
}
util.inherits(ViewRouter, Routr);
function createCacheKey(req){
  return [req.path(),req.method.toUpperCase()].join(':#!:');
}
ViewRouter.prototype.getRoute = function getRoute(){
  var route = Routr.prototype.getRoute.apply(this, arguments);
  route.componentPath = route.config.componentPath;
  route.component = require(path.join(COMPONENTS_DIR, route.componentPath + '.js'));
  return route;
};
ViewRouter.prototype.getRouteFromReq = function getRouteFromReq(req){
  var cacheKey = createCacheKey(req);
  var route = this._reqCache.get(cacheKey);
  if(!route){
    route = this.getRoute(req.path(), {method: req.method});
    route.params = req.params ? extend(req.params,route.params) : route.params;
    this._reqCache.set(cacheKey, route);
  }
  return route;
};
ViewRouter.prototype.routeFromReq = ViewRouter.prototype.getRouteFromReq;


var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

var viewRouter = new ViewRouter({
  view_cat: {
    path: '/cat/:id',
    method: 'get',
    componentPath: 'cat'
  }
});

// http.IncomingMessage
// http.ServerResponse
// next function matching the same signature
server.use(function componentReadyListener(req, res, next){
  res.on(COMPONENT_READY, function(component, next){
    var render = React.renderToString(component);
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(render),
      'Content-Type': 'text/html'
    });
    res.write(render);
    res.end();
    next();
  });
  next();
});

server.use(function viewRouterMatcher(req, res, next){
  var viewRoute = viewRouter.routeFromReq(req);
  if(!viewRoute){
    return next();
  }

  console.log('viewRoute', viewRoute);

  var Component = React.createFactory(viewRoute.component);
  var component = Component(viewRoute.params);
  res.emit(COMPONENT_READY, component, next);
});

server.on('after',
    function (request, response, route, err) {
  console.log('after');

  if (!err) {
    return;
  }

  console.log(err);
});

server.get('/cat/:id', function (req, res, next) {
  return next();
});

server.listen(3030, function () {
  console.log('%s listening at %s', server.name, server.url);
});
