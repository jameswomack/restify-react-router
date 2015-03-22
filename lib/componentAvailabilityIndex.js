var path = require('path');
var walkSync = require('walk-sync');

var JS = /.js$/;
var JSX = /.jsx$/;

var paths = walkSync(path.join(process.cwd(), 'components'));

var componentAvailabilityIndex = {};

paths.forEach(function(componentPath){
  var isJSX = componentPath.match(JSX);
  if(isJSX){
    var key = componentPath.replace(JSX,'');
    return componentAvailabilityIndex[key] = 'jsx';
  }
  var isJS = componentPath.match(JS);
  if(isJS){
    var key = componentPath.replace(JS,'');
    return componentAvailabilityIndex[key] = 'js';
  }
});

module.exports = componentAvailabilityIndex;
