var path = require('path');
var restify = require('restify');
var componentRouterMatcher = require('./componentRouterMatcher');
var componentRenderCenter = require('./componentRenderCenter');

/* CONFIGURATION */
var CONF_DIR = path.join(process.cwd(), 'conf');
var conf = require(path.join(CONF_DIR, 'server'));

var packageJSON = require(path.join(process.cwd(), 'package.json'));
var server = restify.createServer({
  name: packageJSON.name,
  version: packageJSON.version
});

/* MIDDLEWARE */
var componentRoutesPath = path.join(CONF_DIR, 'componentRoutes.json');
var componentRoutesJSON = require(componentRoutesPath);
server.componentLayer = {
  routes: componentRoutesJSON,
  componentRouter: require('./componentRouter')(),
  componentRenderCenter: componentRenderCenter,
  componentRouterMatcher: componentRouterMatcher
};
server.use(componentRenderCenter);
server.use(componentRouterMatcher(server.componentLayer.componentRouter));

server.on('after', function (request, response, route, err) {
  if (!err) return;
  console.error(err);
});

server.loadViewRoutesAsRestEndpoints = function(){
  var componentRouteCache = {get:{},post:{},del:{},put:{}};

  function restNoop(req, res, next){return next();}

  Object.keys(componentRoutesJSON).forEach(function(componentRouteKey){
    var route = componentRoutesJSON[componentRouteKey];
    if(!componentRouteCache[route.method][route.path]){
      componentRouteCache[route.method][route.path] = restNoop;
      server[route.method](route.path, restNoop);
    }
  });

  return componentRouteCache;
};


/* STARTUP */
server.start = function(){
  server.listen(conf.port, function () {
    console.info('%s listening at %s', server.name, server.url);
  });
};

module.exports = server;
