var React = require('react');
var util = require('util');
var extend = util._extend || require('util-extend');

var _resCache = {};

function cacheResComponent(res, component){
  _resCache[res.id] = _resCache[res.id] || [];
  _resCache[res.id].push(component);
}
function cachedResComponents(res){
  return _resCache[res.id];
}
function decacheRes(res){
  delete _resCache[res.id];
}

function reduceComponent(props){
  return function(renderBuffer, component){
    component._store.props = extend(component._store.props, props);
    return renderBuffer + React.renderToString(component);
  };
}

function sendHTML(res, render){
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(render),
    'Content-Type': 'text/html'
  });
  res.write(render);
  res.end();
}

function componentsReadyForRes(res){
  return function(components, props, next){
    if(!util.isArray(components) && util.isObject(components)){
      next = props;
      props = components;
      components = cachedResComponents(res);
    }

    if(util.isFunction(props)){
      next = props;
      props = {};
    }

    res.emit('components:willrender', components);
    var render = components.reduce(reduceComponent(props), '');
    res.emit('components:didrender', components, render);

    sendHTML(res, render);

    decacheRes(res);

    next();
  };
}

module.exports = function(req, res, next){
  res.on('component:ready', function(component){
    cacheResComponent(res, component);
  });
  res.on('components:ready', componentsReadyForRes(res));

  next();
};
