var path = require('path');
var restify = require('restify');
var viewRouterMatcher = require('./viewRouterMatcher');
var componentReadyListener = require('./componentReadyListener');

/* CONFIGURATION */
var CONF_DIR = path.join(process.cwd(), 'conf');
var conf = require(path.join(CONF_DIR, 'server'));

var packageJSON = require(path.join(process.cwd(), 'package.json'));
var server = restify.createServer({
  name: packageJSON.name,
  version: packageJSON.version
});

/* MIDDLEWARE */
var viewRoutesPath = path.join(CONF_DIR, 'viewRoutes.json');
var viewRoutesJSON = require(viewRoutesPath);
server.componentLayer = {
  routes: viewRoutesJSON,
  viewRouter: require('./viewRouter')(),
  componentReadyListener: componentReadyListener,
  viewRouterMatcher: viewRouterMatcher
};
server.use(componentReadyListener);
server.use(viewRouterMatcher(server.componentLayer.viewRouter));

server.on('after', function (request, response, route, err) {
  if (!err) return;
  console.error(err);
});

server.loadViewRoutesAsRestEndpoints = function(){
  var viewRouteCache = {get:{},post:{},del:{},put:{}};

  function restNoop(req, res, next){return next();}

  Object.keys(viewRoutesJSON).forEach(function(viewRouteKey){
    var route = viewRoutesJSON[viewRouteKey];
    if(!viewRouteCache[route.method][route.path]){
      viewRouteCache[route.method][route.path] = restNoop;
      server[route.method](route.path, restNoop);
    }
  });

  return viewRouteCache;
};


/* STARTUP */
server.start = function(){
  server.listen(conf.port, function () {
    console.info('%s listening at %s', server.name, server.url);
  });
};

module.exports = server;
