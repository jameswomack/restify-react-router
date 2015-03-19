var server = require('./lib/reactiveRestifyServer');


/*
 * Mirror the React Component paths in conf/viewRoutes.json
 * as Restify endpoints
 */
server.loadViewRoutesAsRestEndpoints();


/*
 * Demonstrate one-shot component emission
 */
server.get('/animal-farm', function(req,res,next){
  var viewRouter = this.componentLayer.viewRouter;
  var cat = viewRouter.componentFromPath('cat', {id: 'Gato'});
  var dog = viewRouter.componentFromPath('dog', {id: 'Perro'});
  res.emit('components:ready', [cat,dog], {everybody:'Let\'s dance now'},  next);
});


/*
 * Demonstrate aggregation-based component rendering
 */
server.param('aggregation', function(req,res,next){
  var viewRouter = this.componentLayer.viewRouter;
  var cat = viewRouter.componentFromPath('cat', {id: 'Gato'});
  res.emit('component:ready', cat);
  next();
});

server.param('aggregation', function(req,res,next){
  var viewRouter = this.componentLayer.viewRouter;
  var dog = viewRouter.componentFromPath('dog', {id: 'Perro'});
  res.emit('component:ready', dog);
  next();
});

server.get('/animal-farm/:aggregation', function(req,res,next){
  res.emit('components:ready', {everybody:'Let\'s dance now'},  next);
});


server.start();
