module.exports = function(viewRouter){
  return function viewRouterMatcher(req, res, next){
    var viewRoutes = viewRouter.routesFromReq(req);
    if(!viewRoutes) return next();

    var components = viewRoutes.map(viewRouter.componentFromViewRoute);

    res.emit('components:ready', components, next);
  };
};
