var server = require('./lib/reactiveRestifyServer');


/*
 * Mirror the React Component paths in conf/componentRoutes.json
 * as Restify endpoints
 */
server.loadViewRoutesAsRestEndpoints();


/*
 * Demonstrate one-shot component emission
 */
server.get('/animal-farm', function(req,res,next){
  var componentRouter = this.componentLayer.componentRouter;
  var cat = componentRouter.componentFromPath('cat', {id: 'Gato'});
  var dog = componentRouter.componentFromPath('dog', {id: 'Perro'});
  res.emit('components:ready', [cat,dog], {everybody:'Let\'s dance now'},  next);
});


/*
 * Demonstrate aggregation-based component rendering
 */
server.param('aggregation', function(req,res,next){
  var componentRouter = this.componentLayer.componentRouter;
  var dog = componentRouter.componentFromPath('dog', {id: 'Perro'});
  res.emit('component:ready', dog, next);
});

server.param('aggregation', function(req,res,next){
  var componentRouter = this.componentLayer.componentRouter;
  var cat = componentRouter.componentFromPath('cat', {id: 'Gato'});
  res.emit('component:ready', cat, next);
});

server.get('/animal-farm/:aggregation', function(req,res,next){
  res.emit('components:ready', {everybody:'Let\'s dance now'},  next);
});


server.start();
