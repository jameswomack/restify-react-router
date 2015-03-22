module.exports = Object.create({
  _resCache: {},
  add: function(res, component){
    this._resCache[res.id] = this._resCache[res.id] || [];
    this._resCache[res.id].push(component);
  },
  get: function(res){
    return this._resCache[res.id];
  },
  rm: function(res){
    delete this._resCache[res.id];
  }
});
