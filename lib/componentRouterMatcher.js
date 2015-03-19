module.exports = function(componentRouter){
  return function componentRouterMatcher(req, res, next){
    var componentRoutes = componentRouter.routesFromReq(req);
    if(!componentRoutes) return next();

    var components = componentRoutes.map(componentRouter.componentFromViewRoute);

    res.emit('components:ready', components, next);
  };
};
