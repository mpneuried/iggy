(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IGGY = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Facets, FctArray, FctDateRange, FctEvent, FctNumber, FctRange, FctSelect, FctString, IGGY, MainView, Results,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MainView = require("./views/main");

Facets = require("./models/facets");

FctString = require("./models/facet_string");

FctArray = require("./models/facet_array");

FctSelect = require("./models/facet_select");

FctNumber = require("./models/facet_number");

FctRange = require("./models/facet_range");

FctDateRange = require("./models/facet_daterange");

FctEvent = require("./models/facet_event");

Results = require("./models/results");

IGGY = (function(superClass) {
  extend(IGGY, superClass);

  IGGY.prototype.$ = jQuery;

  function IGGY(el, facets, options) {
    if (facets == null) {
      facets = [];
    }
    if (options == null) {
      options = {};
    }
    this._initErrors = bind(this._initErrors, this);
    this.triggerChange = bind(this.triggerChange, this);
    this.getQuery = bind(this.getQuery, this);
    this._error = bind(this._error, this);
    this.addFacet = bind(this.addFacet, this);
    this._prepareFacets = bind(this._prepareFacets, this);
    this._prepareEl = bind(this._prepareEl, this);
    _.extend(this, Backbone.Events);
    this._initErrors();
    this.$el = this._prepareEl(el);
    this.el = this.$el[0];
    this.$el.data("iggy", this);
    this.facets = this._prepareFacets(facets, options);
    this.results = new Results(null, options);
    this.results.on("add", this.triggerChange);
    this.results.on("remove", this.triggerChange);
    this.results.on("change", this.triggerChange);
    this.view = new MainView({
      el: this.$el,
      collection: this.facets,
      results: this.results
    });
    return;
  }

  IGGY.prototype._prepareEl = function(el) {
    var _$el;
    if (el == null) {
      throw this._error("EMISSINGEL");
    }
    if (_.isString(el)) {
      if (!el.length) {
        throw this._error("EEMPTYELSTRING");
      }
      _$el = this.$(el);
      if (!(_$el != null ? _$el.length : void 0)) {
        throw this._error("EINVALIDELSTRING");
      }
      return _$el;
    }
    if (el instanceof jQuery) {
      if (!el.length) {
        throw this._error("EEMPTYELJQUERY");
      }
      if (el.length > 1) {
        throw this._error("ESIZEELJQUERY");
      }
      return el;
    }
    if (el instanceof Element) {
      return this.$(el);
    }
    throw this._error("EINVALIDELTYPE");
  };

  IGGY.prototype._prepareFacets = function(facets, options) {
    var _fct, _idx, _ret, facet, i, len;
    if (options == null) {
      options = {};
    }
    _ret = [];
    for (_idx = i = 0, len = facets.length; i < len; _idx = ++i) {
      facet = facets[_idx];
      if (!((_fct = this._createFacet(facet)) != null)) {
        continue;
      }
      _fct._idx = _idx;
      _ret.push(_fct);
    }
    return new Facets(_ret, options);
  };

  IGGY.prototype._createFacet = function(facet) {
    switch (facet.type.toLowerCase()) {
      case "string":
        return new FctString(facet, {
          main: this
        });
      case "select":
        return new FctSelect(facet, {
          main: this
        });
      case "array":
        return new FctArray(facet, {
          main: this
        });
      case "number":
        return new FctNumber(facet, {
          main: this
        });
      case "range":
        return new FctRange(facet, {
          main: this
        });
      case "daterange":
        return new FctDateRange(facet, {
          main: this
        });
      case "event":
        return new FctEvent(facet, {
          main: this
        });
    }
  };

  IGGY.prototype.addFacet = function(facet) {
    var _fct;
    if (this.facets == null) {
      return;
    }
    if ((_fct = this._createFacet(facet)) != null) {
      this.facets.add(_fct);
    }
    return this;
  };

  IGGY.prototype._error = function(type, data) {
    var _err, _msg;
    if (data == null) {
      data = {};
    }
    if (this.errors[type] != null) {
      _msg = this.errors[type](data);
    } else {
      _msg = "-";
    }
    _err = new Error();
    _err.name = type;
    _err.message = _msg;
    return _err;
  };

  IGGY.prototype.getQuery = function() {
    return this.results;
  };

  IGGY.prototype.triggerChange = function() {
    this.trigger("change", this.results);
  };

  IGGY.prototype._initErrors = function() {
    var _k, _tmpl, ref;
    this.errors = {};
    ref = this.ERRORS();
    for (_k in ref) {
      _tmpl = ref[_k];
      this.errors[_k] = _.template(_tmpl);
    }
  };

  IGGY.prototype.ERRORS = function() {
    return {
      "EINVALIDELSTRING": "If you define a `el` as String it has to be a valid selector for an existing DOM element.",
      "EEMPTYELSTRING": "The `el` as string can not be empty.",
      "EEMPTYELJQUERY": "The `el` as jOuery object can not be an empty collection.",
      "ESIZEELJQUERY": "The `el` as jOuery object can not be a result of one el.",
      "EINVALIDELTYPE": "The `el` can only be a selector string, dom element or jQuery collection",
      "EMISSINGEL": "Please define a target `el`"
    };
  };

  return IGGY;

})(Backbone.Events);

module.exports = IGGY;


},{"./models/facet_array":3,"./models/facet_daterange":5,"./models/facet_event":6,"./models/facet_number":7,"./models/facet_range":8,"./models/facet_select":9,"./models/facet_string":10,"./models/facets":11,"./models/results":12,"./views/main":34}],2:[function(require,module,exports){

/*
EXAMPLE USAGE

	parentColl = new Backbone.Collection.Sub()
	
	 * by Array
	subCollA = parentColl.sub( [ 1, 2, 3 ] )
	
	 * or by Object
	subCollO = parentColl.sub( { name: "Foo", age: 42 } )
	
	 * or by Number
	subCollN = parentColl.sub( 13 )
	
	 * or by Function
	subCollF = parentColl.sub( (( model )-> if model.get( "age" ) > 23 ) )
	
	 * subcollection of subcollection
	subCollA_O = subCollA.sub( { name: "Foo", age: 42 } )
	
	 * update the filter of a subcollection. For this a `reset` will be fired on the subcollection
	subCollA = subCollA.updateSubFilter( { name: "Bar", age: 42 } )
 */
var BackboneSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BackboneSub = (function(superClass) {
  extend(BackboneSub, superClass);

  function BackboneSub() {
    this.updateSubFilter = bind(this.updateSubFilter, this);
    this._subCollectionOptions = bind(this._subCollectionOptions, this);
    this.sub = bind(this.sub, this);
    return BackboneSub.__super__.constructor.apply(this, arguments);
  }


  /*
  	## sub
  	
  	`collection.sub( filter )`
  	
  	Generate a sub-collection by a filter.
  	The models will be distributed within all involved collections under consideration of the filter.
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters.
  	
  	@return { Collection } A Sub-Collection based on the filter
  	
  	@api public
   */

  BackboneSub.prototype.sub = function(filter) {
    var _models, _sub, fnFilter;
    this.subColls || (this.subColls = []);
    fnFilter = this._generateSubFilter(filter);
    _models = this.filter(fnFilter);
    _sub = new this.constructor(_models, this._subCollectionOptions());
    _sub._parentCol = this;
    _sub._fnFilter = fnFilter;
    this.on("change", _.bind(function(_m) {
      var added, toAdd;
      toAdd = this._fnFilter(_m);
      added = this.get(_m) != null;
      if (added && !toAdd) {
        this.remove(_m);
      } else if (!added && toAdd) {
        this.add(_m);
      }
    }, _sub));
    _sub.on("add", _.bind(function(_m) {
      this.add(_m);
    }, this));
    this.on("add", _.bind(function(_m) {
      if (this._fnFilter(_m)) {
        this.add(_m);
      }
    }, _sub));
    _sub.on("remove", _.bind(function(_m) {}, this));
    this.on("remove", _.bind(function(_m) {
      this.remove(_m);
    }, _sub));
    this.on("reset", _.bind(function(_m) {
      this.updateSubFilter();
    }, _sub));
    this.subColls.push(_sub);
    return _sub;
  };


  /*
  	## _subCollectionOptions
  	
  	`collection._subCollectionOptions()`
  	
  	Overwritable method to set the constructor options for sub collections
  	
  	@return { Object } The options object
  	
  	@api private
   */

  BackboneSub.prototype._subCollectionOptions = function() {
    var _opts;
    _opts = {
      comparator: this.comparator
    };
    return _opts;
  };


  /*
  	## updateSubFilter
  	
  	`collection.updateSubFilter( filter )`
  	
  	Method to update the filter of a subcollection. Then all models will be resete by the new filter. So you have to listen to teh reset event
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters.
  	
  	@return { Self } itself
  	
  	@api public
   */

  BackboneSub.prototype.updateSubFilter = function(filter, asReset) {
    var _addIds, _models, currids, i, j, len, len1, mdl, newids, ref, ref1, rid;
    if (asReset == null) {
      asReset = true;
    }
    if (this._parentCol != null) {
      if (filter != null) {
        this._fnFilter = this._generateSubFilter(filter);
      }
      _models = this._parentCol.filter(this._fnFilter);
      if (asReset) {
        this.reset(_models);
        return this;
      }
      newids = _.pluck(_models, "cid");
      currids = _.pluck(this.models, "cid");
      ref = _.difference(currids, newids);
      for (i = 0, len = ref.length; i < len; i++) {
        rid = ref[i];
        this.remove(rid);
      }
      _addIds = _.difference(newids, currids);
      for (j = 0, len1 = _models.length; j < len1; j++) {
        mdl = _models[j];
        if (ref1 = mdl.cid, indexOf.call(_addIds, ref1) >= 0) {
          this.add(mdl);
        }
      }
    }
    return this;
  };


  /*
  	## _generateSubFilter
  	
  	`collection._generateSubFilter( filter )`
  	
  	Internal method th convert a filter argument to a filter function
  	
  	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters.
  	
  	@return { Function } The generated filter function
  	
  	@api private
   */

  BackboneSub.prototype._generateSubFilter = function(filter) {
    var fnFilter;
    if (_.isFunction(filter)) {
      fnFilter = filter;
    } else if (_.isArray(filter)) {
      fnFilter = function(_m) {
        var ref;
        return ref = _m.id, indexOf.call(filter, ref) >= 0;
      };
    } else if (_.isString(filter) || _.isNumber(filter)) {
      fnFilter = function(_m) {
        return _m.id === filter;
      };
    } else {
      fnFilter = function(_m) {
        var _nm, _vl;
        for (_nm in filter) {
          _vl = filter[_nm];
          if (_m.get(_nm) !== _vl) {
            return false;
          }
        }
        return true;
      };
    }
    return fnFilter;
  };

  return BackboneSub;

})(Backbone.Collection);

module.exports = BackboneSub;


},{}],3:[function(require,module,exports){
var FctArray,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctArray = (function(superClass) {
  extend(FctArray, superClass);

  function FctArray() {
    return FctArray.__super__.constructor.apply(this, arguments);
  }

  FctArray.prototype.SubView = require("../views/facets/subarray");

  return FctArray;

})(require("./facet_string"));

module.exports = FctArray;


},{"../views/facets/subarray":29,"./facet_string":10}],4:[function(require,module,exports){
var FacetBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetBase = (function(superClass) {
  extend(FacetBase, superClass);

  FacetBase.prototype.idAttribute = "name";

  FacetBase.prototype.SubView = require("../views/facets/base");

  function FacetBase(attrs, options) {
    this.match = bind(this.match, this);
    this.getLabel = bind(this.getLabel, this);
    this.main = options.main;
    FacetBase.__super__.constructor.apply(this, arguments);
    return;
  }

  FacetBase.prototype.defaults = function() {
    return {
      type: "string",
      name: "name",
      label: "Description",
      sort: 0
    };
  };

  FacetBase.prototype.getLabel = function() {
    return this.get("label");
  };

  FacetBase.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("name") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  FacetBase.prototype.comparator = function(mdl) {
    return mdl.id;
  };

  return FacetBase;

})(Backbone.Model);

module.exports = FacetBase;


},{"../views/facets/base":26}],5:[function(require,module,exports){
var FctDateRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctDateRange = (function(superClass) {
  extend(FctDateRange, superClass);

  function FctDateRange() {
    this.defaults = bind(this.defaults, this);
    return FctDateRange.__super__.constructor.apply(this, arguments);
  }

  FctDateRange.prototype.SubView = require("../views/facets/daterange");

  FctDateRange.prototype.defaults = function() {
    return $.extend(FctDateRange.__super__.defaults.apply(this, arguments), {
      opts: {},
      value: null
    });
  };

  return FctDateRange;

})(require("./facet_base"));

module.exports = FctDateRange;


},{"../views/facets/daterange":27,"./facet_base":4}],6:[function(require,module,exports){
var FctEvent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctEvent = (function(superClass) {
  extend(FctEvent, superClass);

  function FctEvent() {
    this.exec = bind(this.exec, this);
    this.defaults = bind(this.defaults, this);
    return FctEvent.__super__.constructor.apply(this, arguments);
  }

  FctEvent.prototype.SubView = null;

  FctEvent.prototype.onlyExec = true;

  FctEvent.prototype.defaults = function() {
    return $.extend(FctEvent.__super__.defaults.apply(this, arguments), {
      options: []
    });
  };

  FctEvent.prototype.exec = function() {
    this.main.trigger(this.get("event"), this.toJSON());
  };

  return FctEvent;

})(require("./facet_base"));

module.exports = FctEvent;


},{"./facet_base":4}],7:[function(require,module,exports){
var FctNumber,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctNumber = (function(superClass) {
  extend(FctNumber, superClass);

  function FctNumber() {
    this.defaults = bind(this.defaults, this);
    return FctNumber.__super__.constructor.apply(this, arguments);
  }

  FctNumber.prototype.SubView = require("../views/facets/subnumber");

  FctNumber.prototype.defaults = function() {
    return $.extend(FctNumber.__super__.defaults.apply(this, arguments), {
      min: null,
      max: null,
      step: 1,
      value: null
    });
  };

  return FctNumber;

})(require("./facet_base"));

module.exports = FctNumber;


},{"../views/facets/subnumber":30,"./facet_base":4}],8:[function(require,module,exports){
var FctRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctRange = (function(superClass) {
  extend(FctRange, superClass);

  function FctRange() {
    this.defaults = bind(this.defaults, this);
    return FctRange.__super__.constructor.apply(this, arguments);
  }

  FctRange.prototype.SubView = require("../views/facets/subrange");

  FctRange.prototype.defaults = function() {
    return $.extend(FctRange.__super__.defaults.apply(this, arguments), {
      min: null,
      max: null,
      step: 1,
      value: null
    });
  };

  return FctRange;

})(require("./facet_base"));

module.exports = FctRange;


},{"../views/facets/subrange":31,"./facet_base":4}],9:[function(require,module,exports){
var FctSelect,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctSelect = (function(superClass) {
  extend(FctSelect, superClass);

  function FctSelect() {
    this.defaults = bind(this.defaults, this);
    return FctSelect.__super__.constructor.apply(this, arguments);
  }

  FctSelect.prototype.SubView = require("../views/facets/subselect");

  FctSelect.prototype.defaults = function() {
    return $.extend(FctSelect.__super__.defaults.apply(this, arguments), {
      options: [],
      waitForAsync: true
    });
  };

  return FctSelect;

})(require("./facet_base"));

module.exports = FctSelect;


},{"../views/facets/subselect":32,"./facet_base":4}],10:[function(require,module,exports){
var FctString,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FctString = (function(superClass) {
  extend(FctString, superClass);

  function FctString() {
    this.defaults = bind(this.defaults, this);
    return FctString.__super__.constructor.apply(this, arguments);
  }

  FctString.prototype.SubView = require("../views/facets/substring");

  FctString.prototype.defaults = function() {
    return $.extend(FctString.__super__.defaults.apply(this, arguments), {
      options: []
    });
  };

  return FctString;

})(require("./facet_base"));

module.exports = FctString;


},{"../views/facets/substring":33,"./facet_base":4}],11:[function(require,module,exports){
var IggyFacets, fnGet, sortColl,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

sortColl = require("sortcoll");

fnGet = function(el, key) {
  return el.get(key);
};

IggyFacets = (function(superClass) {
  extend(IggyFacets, superClass);

  function IggyFacets(models, options) {
    var _forward;
    if (options == null) {
      options = {};
    }
    this._subCollecctionOptions = bind(this._subCollecctionOptions, this);
    if (options.comparator == null) {
      _forward = (function() {
        switch (options.dir) {
          case "asc":
            return true;
          case "desc":
            return false;
          default:
            return true;
        }
      })();
      options.comparator = sortColl(["sort"].concat(options.sortby || "name"), {
        sort: false,
        "?": _forward
      }, fnGet);
    }
    return IggyFacets.__super__.constructor.call(this, models, options);
  }

  IggyFacets.prototype._subCollecctionOptions = function() {
    var opt;
    opt = IggyFacets.__super__._subCollecctionOptions.apply(this, arguments);
    opt.dir = this.forward ? "asc" : "desc";
    return opt;
  };

  IggyFacets.prototype.modelId = function(attrs) {
    return attrs.name;
  };

  return IggyFacets;

})(require("./backbone_sub"));

module.exports = IggyFacets;


},{"./backbone_sub":2,"sortcoll":39}],12:[function(require,module,exports){
var IggyResult, IggyResults,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

IggyResult = (function(superClass) {
  extend(IggyResult, superClass);

  function IggyResult() {
    return IggyResult.__super__.constructor.apply(this, arguments);
  }

  IggyResult.prototype.idAttribute = "name";

  IggyResult.prototype.defaults = {
    type: "string",
    name: null,
    value: null
  };

  return IggyResult;

})(Backbone.Model);

IggyResults = (function(superClass) {
  extend(IggyResults, superClass);

  function IggyResults() {
    this.parse = bind(this.parse, this);
    this.initialize = bind(this.initialize, this);
    return IggyResults.__super__.constructor.apply(this, arguments);
  }

  IggyResults.prototype.model = IggyResult;

  IggyResults.prototype.initialize = function(mdls, opts) {
    var ref;
    if ((ref = opts.modifyKey) != null ? ref.length : void 0) {
      this.modifyKey = opts.modifyKey;
    }
  };

  IggyResults.prototype.parse = function(attr, options) {
    var _key, _modify, ref;
    _key = options._facet.get("modifyKey") || this.modifyKey || "value";
    _modify = (ref = options._facet) != null ? ref.get("modify") : void 0;
    if ((_modify != null) && _.isFunction(_modify)) {
      attr[_key] = _modify(attr.value, options._facet, attr);
    }
    return attr;
  };

  return IggyResults;

})(Backbone.Collection);

module.exports = IggyResults;


},{}],13:[function(require,module,exports){
var BaseResult, BaseResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseResult = (function(superClass) {
  extend(BaseResult, superClass);

  function BaseResult() {
    this.getLabel = bind(this.getLabel, this);
    return BaseResult.__super__.constructor.apply(this, arguments);
  }

  BaseResult.prototype.idAttribute = "value";

  BaseResult.prototype.getLabel = function() {
    return this.get("label") || this.get(this.idAttribute) || "-";
  };

  return BaseResult;

})(Backbone.Model);

BaseResults = (function(superClass) {
  extend(BaseResults, superClass);

  function BaseResults() {
    return BaseResults.__super__.constructor.apply(this, arguments);
  }

  BaseResults.prototype.model = BaseResult;

  return BaseResults;

})(require("./backbone_sub"));

module.exports = BaseResults;


},{"./backbone_sub":2}],14:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (custom, id, txt) {
buf.push("<span class=\"txt\">" + (jade.escape(null == (jade_interp = txt) ? "" : jade_interp)) + "</span><span class=\"btn-wrp\"><i" + (jade.attr("data-id", id, true, false)) + " class=\"rm-result-btn fa fa-remove\"></i>");
if ( custom)
{
buf.push("<i" + (jade.attr("data-id", id, true, false)) + " class=\"edit-result-btn fa fa-pencil\"></i>");
}
buf.push("</span>");}.call(this,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"txt" in locals_for_with?locals_for_with.txt:typeof txt!=="undefined"?txt:undefined));;return buf.join("");
};
},{"jade/runtime":38}],15:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + " class=\"daterange-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined));;return buf.join("");
};
},{"jade/runtime":38}],16:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, operator, operators, undefined, value) {
if ( operators && operators.length)
{
buf.push("<div class=\"operator\"><select" + (jade.attr("id", "" + (cid) + "op", true, false)) + ">");
// iterate operators
;(function(){
  var $$obj = operators;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + (jade.attr("selected", ( operator == op ), true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var op = $$obj[idx];

buf.push("<option" + (jade.attr("value", op, true, false)) + (jade.attr("selected", ( operator == op ), true, false)) + ">" + (jade.escape(null == (jade_interp = op) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");
}
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"number-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"operator" in locals_for_with?locals_for_with.operator:typeof operator!=="undefined"?operator:undefined,"operators" in locals_for_with?locals_for_with.operators:typeof operators!=="undefined"?operators:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":38}],17:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<div class=\"rangeinp\">");
var _vals = value ? value : []
buf.push("<input" + (jade.attr("id", "" + (cid) + "_from", true, false)) + (jade.attr("value", _vals[0], true, false)) + " class=\"number-inp range-from\"/><span class=\"separator\">-</span><input" + (jade.attr("id", "" + (cid) + "_to", true, false)) + (jade.attr("value", _vals[1], true, false)) + " class=\"number-inp range-to\"/></div>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":38}],18:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
};
},{"jade/runtime":38}],19:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, multiple, optionGroups, options, undefined, value) {
buf.push("<select" + (jade.attr("id", cid, true, false)) + " multiple=\"multiple\" class=\"select-inp\">");
if ( optionGroups)
{
// iterate optionGroups
;(function(){
  var $$obj = optionGroups;
  if ('number' == typeof $$obj.length) {

    for (var gname = 0, $$l = $$obj.length; gname < $$l; gname++) {
      var opts = $$obj[gname];

buf.push("<optgroup" + (jade.attr("label", gname, true, false)) + "></optgroup>");
// iterate opts
;(function(){
  var $$obj = opts;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

    }

  } else {
    var $$l = 0;
    for (var gname in $$obj) {
      $$l++;      var opts = $$obj[gname];

buf.push("<optgroup" + (jade.attr("label", gname, true, false)) + "></optgroup>");
// iterate opts
;(function(){
  var $$obj = opts;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

    }

  }
}).call(this);

}
else
{
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<option" + (jade.attr("value", el.value, true, false)) + (jade.attr("selected", ( value && value.indexOf( el.value ) >= 0 ), true, false)) + ">" + (jade.escape(null == (jade_interp = el.label) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

}
buf.push("</select>");
if ( multiple)
{
buf.push("<span class=\"btn btn-xs btn-success select-check fa fa-check\"></span>");
}}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"multiple" in locals_for_with?locals_for_with.multiple:typeof multiple!=="undefined"?multiple:undefined,"optionGroups" in locals_for_with?locals_for_with.optionGroups:typeof optionGroups!=="undefined"?optionGroups:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":38}],20:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, inpval) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", inpval, true, false)) + " class=\"selector-inp\"/><ul" + (jade.attr("id", "" + (cid) + "typelist", true, false)) + " class=\"typelist\"></ul>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"inpval" in locals_for_with?locals_for_with.inpval:typeof inpval!=="undefined"?inpval:undefined));;return buf.join("");
};
},{"jade/runtime":38}],21:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (activeIdx, custom, list, query, undefined) {
var add = 0;
if ( custom && query)
{
add = 1;
buf.push("<li><a data-id=\"_custom\" data-idx=\"-1\"" + (jade.cls([{active:0 === activeIdx}], [true])) + "><i>\"" + (((jade_interp = query) == null ? '' : jade_interp)) + "\"</i></a></li>");
}
if ( list.length)
{
// iterate list
;(function(){
  var $$obj = list;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<li" + (jade.cls([el.cssclass], [true])) + "><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li" + (jade.cls([el.cssclass], [true])) + "><a" + (jade.attr("data-id", el.id, true, false)) + (jade.attr("data-idx", idx, true, false)) + (jade.cls([{active:(idx + add) === activeIdx}], [true])) + ">" + (((jade_interp = el.label) == null ? '' : jade_interp)) + "</a></li>");
    }

  }
}).call(this);

}
else if ( !custom)
{
buf.push("<li><a class=\"emptyres\">no result for \"" + (jade.escape((jade_interp = query) == null ? '' : jade_interp)) + "\"</a></li>");
}}.call(this,"activeIdx" in locals_for_with?locals_for_with.activeIdx:typeof activeIdx!=="undefined"?activeIdx:undefined,"custom" in locals_for_with?locals_for_with.custom:typeof custom!=="undefined"?custom:undefined,"list" in locals_for_with?locals_for_with.list:typeof list!=="undefined"?list:undefined,"query" in locals_for_with?locals_for_with.query:typeof query!=="undefined"?query:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":38}],22:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (cid, value) {
buf.push("<input" + (jade.attr("id", cid, true, false)) + (jade.attr("value", value, true, false)) + " class=\"string-inp\"/>");}.call(this,"cid" in locals_for_with?locals_for_with.cid:typeof cid!=="undefined"?cid:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
},{"jade/runtime":38}],23:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (label, selected, undefined) {
buf.push("<div class=\"rm-facet-btn fa fa-remove\"></div><span class=\"sublabel\">" + (jade.escape((jade_interp = label) == null ? '' : jade_interp)) + ":</span><ul class=\"subresults\">");
if ( selected && selected.length)
{
// iterate selected
;(function(){
  var $$obj = selected;
  if ('number' == typeof $$obj.length) {

    for (var idx = 0, $$l = $$obj.length; idx < $$l; idx++) {
      var el = $$obj[idx];

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-remove\"></i></li>");
    }

  } else {
    var $$l = 0;
    for (var idx in $$obj) {
      $$l++;      var el = $$obj[idx];

buf.push("<li><span class=\"txt\">" + (jade.escape(null == (jade_interp = el) ? "" : jade_interp)) + "</span><i class=\"rm-facet-btn fa fa-remove\"></i></li>");
    }

  }
}).call(this);

}
buf.push("</ul><div class=\"subselect\"></div><div class=\"loader\"><i class=\"fa fa-cog fa-spin\"></i></div>");}.call(this,"label" in locals_for_with?locals_for_with.label:typeof label!=="undefined"?label:undefined,"selected" in locals_for_with?locals_for_with.selected:typeof selected!=="undefined"?selected:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":38}],24:[function(require,module,exports){
var jade = require("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"add-facet-btn fa fa-plus\"></div>");;return buf.join("");
};
},{"jade/runtime":38}],25:[function(require,module,exports){
module.exports = {
  "LEFT": 37,
  "RIGHT": 39,
  "UP": 38,
  "DOWN": 40,
  "ESC": [229, 27],
  "ENTER": 13,
  "TAB": 9
};


},{}],26:[function(require,module,exports){
var FacetSubsBase, KEYCODES, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KEYCODES = require("../../utils/keycodes");

SubResults = require("../../models/subresults");

FacetSubsBase = (function(superClass) {
  extend(FacetSubsBase, superClass);

  function FacetSubsBase() {
    this.set = bind(this.set, this);
    this.select = bind(this.select, this);
    this._checkSelectEmpty = bind(this._checkSelectEmpty, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.render = bind(this.render, this);
    this.reopen = bind(this.reopen, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this._onKey = bind(this._onKey, this);
    this.input = bind(this.input, this);
    this.open = bind(this.open, this);
    this.renderResult = bind(this.renderResult, this);
    this.focus = bind(this.focus, this);
    this.events = bind(this.events, this);
    this.initialize = bind(this.initialize, this);
    return FacetSubsBase.__super__.constructor.apply(this, arguments);
  }

  FacetSubsBase.prototype.resultTemplate = require("../../tmpls/result_base.jade");

  FacetSubsBase.prototype.initialize = function(options) {
    this.sub = options.sub;
    this.result = new SubResults();
  };

  FacetSubsBase.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj
    );
  };

  FacetSubsBase.prototype.focus = function() {
    this.$inp.focus();
  };

  FacetSubsBase.prototype.renderResult = function(renderEmpty) {
    var _list, i, idx, len, model, ref;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _list.push(model.getLabel());
    }
    return "<li>" + _list.join("</li><li>") + "</li>";
  };

  FacetSubsBase.prototype.open = function() {
    this.$el.addClass("open");
    this.isOpen = true;
    this.trigger("opened");
  };

  FacetSubsBase.prototype.input = function(evnt) {
    if (evnt.type === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.ENTER:
          this.select();
      }
    }
  };

  FacetSubsBase.prototype._onKey = function(evnt) {
    var ref;
    if (evnt.keyCode === KEYCODES.TAB || (ref = evnt.keyCode, indexOf.call(KEYCODES.TAB, ref) >= 0)) {
      this._onTabAction(evnt);
      return;
    }
  };

  FacetSubsBase.prototype.getTemplateData = function() {
    var ref;
    return {
      cid: this.cid,
      value: (ref = this.model) != null ? ref.get("value") : void 0
    };
  };

  FacetSubsBase.prototype._getInpSelector = function() {
    return "input#" + this.cid;
  };

  FacetSubsBase.prototype.reopen = function(pView) {
    this.$el.removeClass("closed");
    this.$el.addClass("open");
    this.render();
    pView.open();
  };

  FacetSubsBase.prototype.render = function() {
    var _tmpl;
    _tmpl = this.template(this.getTemplateData());
    this.$el.html(_tmpl);
    this.$inp = this.$el.find(this._getInpSelector());
    if (this._hasTabListener(true)) {
      $(document).on(this._hasTabEvent(), this._onKey);
    }
  };

  FacetSubsBase.prototype._hasTabEvent = function() {
    return "keydown";
  };

  FacetSubsBase.prototype._hasTabListener = function() {
    return true;
  };

  FacetSubsBase.prototype._onTabAction = function(evnt) {
    evnt.preventDefault();
    evnt.stopPropagation();
    this.select();
  };

  FacetSubsBase.prototype.close = function(evnt) {
    if (this._hasTabListener(false)) {
      $(document).off(this._hasTabEvent(), this._onKey);
    }
    this.$el.removeClass("open");
    this.$el.addClass("closed");
    this.isOpen = false;
    this.trigger("closed", this.result);
  };

  FacetSubsBase.prototype.getResults = function() {
    return {
      value: this.getValue()
    };
  };

  FacetSubsBase.prototype.getValue = function() {
    return this.$inp.val();
  };

  FacetSubsBase.prototype.getSelectModel = function() {
    return SubResults.prototype.model;
  };

  FacetSubsBase.prototype._checkSelectEmpty = function(_val) {
    if (_.isEmpty(_val) && !_.isNumber(_val) && !_.isBoolean(_val)) {
      this.close();
      return true;
    }
    return false;
  };

  FacetSubsBase.prototype.select = function() {
    var _val;
    _val = this.getValue();
    if (this._checkSelectEmpty(_val)) {
      return;
    }
    this.set(_val);
  };

  FacetSubsBase.prototype.set = function(val) {
    var _ModelConst, _model;
    _model = this.result.first();
    if (_model == null) {
      _ModelConst = this.getSelectModel();
      _model = new _ModelConst({
        value: val
      });
      this.result.add(_model);
    } else {
      _model.set({
        value: val
      });
    }
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsBase;

})(Backbone.View);

module.exports = FacetSubsBase;


},{"../../models/subresults":13,"../../tmpls/result_base.jade":18,"../../utils/keycodes":25}],27:[function(require,module,exports){
var FacetSubsDateRange, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

FacetSubsDateRange = (function(superClass) {
  extend(FacetSubsDateRange, superClass);

  function FacetSubsDateRange() {
    this.select = bind(this.select, this);
    this.getValue = bind(this.getValue, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this._dateReturn = bind(this._dateReturn, this);
    this.renderResult = bind(this.renderResult, this);
    this.remove = bind(this.remove, this);
    this.close = bind(this.close, this);
    this.focus = bind(this.focus, this);
    this.events = bind(this.events, this);
    this.forcedDateRangeOpts = bind(this.forcedDateRangeOpts, this);
    return FacetSubsDateRange.__super__.constructor.apply(this, arguments);
  }

  FacetSubsDateRange.prototype.template = require("../../tmpls/daterange.jade");

  FacetSubsDateRange.prototype.forcedDateRangeOpts = function() {
    return {
      opens: "right"
    };
  };

  FacetSubsDateRange.prototype.events = function() {};

  FacetSubsDateRange.prototype.focus = function() {
    var _opts, ref;
    if (this.daterangepicker == null) {
      _opts = _.extend({}, this.model.get("opts"), this.forcedDateRangeOpts());
      this.$inp.daterangepicker(_opts, this._dateReturn);
      this.daterangepicker = this.$inp.data("daterangepicker");
      if ((ref = this.daterangepicker.container) != null) {
        ref.addClass("daterange-iggy");
      }
      this.daterangepicker.container.on("click", function(evnt) {
        evnt.stopPropagation();
        return false;
      });
    } else {
      this.daterangepicker.element = this.$inp;
      this.daterangepicker.show();
    }
    this.$inp.on("cancel.daterangepicker", this.close);
    this.$inp.on("hide.daterangepicker", this.close);
    return FacetSubsDateRange.__super__.focus.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.close = function() {
    FacetSubsDateRange.__super__.close.apply(this, arguments);
    this.$inp.off("cancel.daterangepicker", this.close);
    this.$inp.off("hide.daterangepicker", this.close);
  };

  FacetSubsDateRange.prototype.remove = function() {
    var ref;
    if ((ref = this.daterangepicker) != null) {
      ref.remove();
    }
    this.daterangepicker = null;
    return FacetSubsDateRange.__super__.remove.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.renderResult = function() {
    var _endDate, _res, _s, _startDate, _time;
    _res = this.getResults();
    _startDate = moment(_res.value[0]);
    if (_res.value[1] != null) {
      _endDate = moment(_res.value[1]);
    }
    _time = this.model.get("opts").timePicker;
    _s = "<li>";
    _s += _startDate.format((_time ? "LLLL" : "LL"));
    if (_endDate != null) {
      _s += " - ";
      _s += _endDate.format((_time ? "LLLL" : "LL"));
    }
    _s += "</li>";
    return _s;
  };

  FacetSubsDateRange.prototype._hasTabListener = function() {
    return false;
  };

  FacetSubsDateRange.prototype._dateReturn = function(startDate, endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.model.set("value", this.getValue(false));
    this.select();
  };

  FacetSubsDateRange.prototype.getTemplateData = function() {
    return FacetSubsDateRange.__super__.getTemplateData.apply(this, arguments);
  };

  FacetSubsDateRange.prototype.getValue = function(predef) {
    var _out, _predefVal;
    if (predef == null) {
      predef = true;
    }
    if (predef) {
      _predefVal = this.model.get("value");
      if (_predefVal != null) {
        if (!_.isArray(_predefVal)) {
          _predefVal = [_predefVal];
        }
        this.startDate = _predefVal[0], this.endDate = _predefVal[1];
        return _predefVal;
      }
    }
    _out = [this.startDate.valueOf()];
    if (this.endDate != null) {
      _out.push(this.endDate.valueOf());
    }
    return _out;
  };

  FacetSubsDateRange.prototype.select = function() {
    var _ModelConst, _model;
    _ModelConst = this.getSelectModel();
    _model = new _ModelConst({
      value: this.getValue()
    });
    this.result.add(_model);
    this.trigger("selected", _model);
    this.close();
  };

  return FacetSubsDateRange;

})(require("./base"));

module.exports = FacetSubsDateRange;


},{"../../tmpls/daterange.jade":15,"../../utils/keycodes":25,"./base":26}],28:[function(require,module,exports){
var FacetNumberBase, KEYCODES, nearest, precision,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../../utils/keycodes");

nearest = function(n, v) {
  n = n / v;
  n = Math.round(n) * v;
  return n;
};

precision = function(n, dp) {
  dp = Math.pow(10, dp);
  n = n * dp;
  n = Math.round(n);
  n = n / dp;
  return n;
};

FacetNumberBase = (function(superClass) {
  extend(FacetNumberBase, superClass);

  function FacetNumberBase() {
    this._setNumber = bind(this._setNumber, this);
    this.getValue = bind(this.getValue, this);
    this.crement = bind(this.crement, this);
    this.input = bind(this.input, this);
    this.events = bind(this.events, this);
    this.setNumber = _.throttle(this._setNumber, 300, {
      leading: false,
      trailing: false
    });
    FacetNumberBase.__super__.constructor.apply(this, arguments);
    return;
  }

  FacetNumberBase.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj
    );
  };

  FacetNumberBase.prototype.input = function(evnt) {
    var _$el, _v;
    _$el = $(evnt.currentTarget);
    if (evnt.type === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.UP:
          this.crement(this.model.get("step"), _$el);
          return;
        case KEYCODES.DOWN:
          this.crement(this.model.get("step") * -1, _$el);
          return;
        case KEYCODES.ENTER:
          this.select();
          return;
      }
    }
    if (evnt.type === "keyup") {
      _v = evnt.currentTarget.value.replace(/[^\d]?[^-\d]+/g, "");
      _v = parseInt(_v, 10);
      this.setNumber(_v, _$el);
    }
  };

  FacetNumberBase.prototype.crement = function(change, el) {
    var _v;
    if (el == null) {
      el = this.$inp;
    }
    _v = el.val();
    if (!(_v != null ? _v.length : void 0)) {
      _v = this.model.get("value");
    } else {
      _v = parseInt(_v, 10);
    }
    this._setNumber(_v + change, el);
  };

  FacetNumberBase.prototype.getValue = function() {
    var _v;
    _v = this.$inp.val();
    if (!(_v != null ? _v.length : void 0)) {
      return null;
    }
    return parseInt(this.valueByDefinition(_v), 10);
  };

  FacetNumberBase.prototype._setNumber = function(_v, el) {
    var _curr;
    if (el == null) {
      el = this.$inp;
    }
    if (isNaN(_v)) {
      return;
    }
    _curr = el.val();
    _v = this.valueByDefinition(_v);
    if (_curr !== _v.toString()) {
      el.val(_v);
    }
  };

  FacetNumberBase.prototype.valueByDefinition = function(_value) {
    var _precision, _tmp, max, min, step;
    max = this.model.get("max");
    min = this.model.get("min");
    step = this.model.get("step");
    if (min > max) {
      _tmp = min;
      min = max;
      max = _tmp;
    }
    if ((min != null) && _value < min) {
      return min;
    }
    if ((max != null) && _value > max) {
      return max;
    }
    if (step !== 1) {
      _value = nearest(_value, step);
    }
    _precision = Math.max(0, Math.ceil(Math.log(1 / step) / Math.log(10)));
    if (_precision > 0) {
      _value = precision(_value, _precision);
    } else {
      _value = Math.round(_value);
    }
    return _value;
  };

  return FacetNumberBase;

})(require("./base"));

module.exports = FacetNumberBase;


},{"../../utils/keycodes":25,"./base":26}],29:[function(require,module,exports){
var ArrayOption, ArrayOptions, FacetSubArray, KEYCODES, StringOption, StringOptions, SubResults,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubResults = require("../../models/subresults");

KEYCODES = require("../../utils/keycodes");

StringOption = (function(superClass) {
  extend(StringOption, superClass);

  function StringOption() {
    this.match = bind(this.match, this);
    return StringOption.__super__.constructor.apply(this, arguments);
  }

  StringOption.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("value") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  return StringOption;

})(SubResults.prototype.model);

StringOptions = (function(superClass) {
  extend(StringOptions, superClass);

  function StringOptions() {
    return StringOptions.__super__.constructor.apply(this, arguments);
  }

  StringOptions.prototype.model = StringOption;

  return StringOptions;

})(SubResults);

ArrayOption = (function(superClass) {
  extend(ArrayOption, superClass);

  function ArrayOption() {
    this.match = bind(this.match, this);
    this.getLabel = bind(this.getLabel, this);
    return ArrayOption.__super__.constructor.apply(this, arguments);
  }

  ArrayOption.prototype.idAttribute = "value";

  ArrayOption.prototype.getLabel = function() {
    return this.get("label") || this.get("name") || "-";
  };

  ArrayOption.prototype.match = function(crit) {
    var _s, found;
    _s = this.get("value") + " " + this.get("label");
    found = _s.toLowerCase().indexOf(crit.toLowerCase());
    return found >= 0;
  };

  return ArrayOption;

})(Backbone.Model);

ArrayOptions = (function(superClass) {
  extend(ArrayOptions, superClass);

  function ArrayOptions() {
    return ArrayOptions.__super__.constructor.apply(this, arguments);
  }

  ArrayOptions.prototype.model = ArrayOption;

  return ArrayOptions;

})(require("../../models/backbone_sub"));

FacetSubArray = (function(superClass) {
  extend(FacetSubArray, superClass);

  FacetSubArray.prototype.templateResLi = require("../../tmpls/array_resultli.jade");

  FacetSubArray.prototype.optDefault = {
    label: "-",
    value: "-"
  };

  FacetSubArray.prototype.selectCount = 0;

  FacetSubArray.prototype.optColl = StringOptions;

  FacetSubArray.prototype.events = function() {
    var _evnts;
    _evnts = FacetSubArray.__super__.events.apply(this, arguments);
    _evnts["blur input#" + this.cid] = "close";
    return _evnts;
  };

  FacetSubArray.prototype.close = function(evnt) {
    if (this.loading) {
      if (evnt != null) {
        evnt.preventDefault();
      }
      if (evnt != null) {
        evnt.stopPropagation();
      }
      this.focus();
      return;
    }
    return FacetSubArray.__super__.close.apply(this, arguments);
  };

  FacetSubArray.prototype.rmRes = function(evnt) {
    var _id, ref;
    _id = (ref = $(evnt.target)) != null ? ref.data("id") : void 0;
    this.result.remove(_id);
    this.searchcoll.remove(_id);
  };

  FacetSubArray.prototype.editRes = function(evnt) {
    var _id, _v, ref;
    _id = (ref = $(evnt.target)) != null ? ref.data("id") : void 0;
    _v = this._editval = this.result.get(_id).get("value");
    this.result.remove(_id);
    this.searchcoll.remove(_id);
    this.sub.reopen();
    console.log(this.searchcoll);
    this.search(_v);
  };

  FacetSubArray.prototype.getTemplateData = function() {
    var _data, ref;
    _data = FacetSubArray.__super__.getTemplateData.apply(this, arguments);
    if ((ref = this._editval) != null ? ref.length : void 0) {
      _data.inpval = this._editval;
      this._editval = null;
    }
    return _data;
  };

  FacetSubArray.prototype.renderResult = function(renderEmpty) {
    var _list, i, idx, len, model, ref;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _list.push(this.templateResLi({
        txt: model.getLabel(),
        id: model.id,
        custom: model.get("custom")
      }));
    }
    return "<li>" + _list.join("</li><li>") + "</li>";
  };

  function FacetSubArray(options) {
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.getResults = bind(this.getResults, this);
    this.reopen = bind(this.reopen, this);
    this.select = bind(this.select, this);
    this._isFull = bind(this._isFull, this);
    this.renderResult = bind(this.renderResult, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.editRes = bind(this.editRes, this);
    this.rmRes = bind(this.rmRes, this);
    this.close = bind(this.close, this);
    this.events = bind(this.events, this);
    this.loading = false;
    if (options.model.get("count") != null) {
      this.selectCount = options.model.get("count");
    }
    options.custom = true;
    if (options.model.get("custom") != null) {
      options.custom = Boolean(options.model.get("custom"));
    }
    this.collection = this._createOptionCollection(options.model.get("options"));
    if (!options.custom && this.selectCount <= 0) {
      this.selectCount = this.collection.length;
    }
    FacetSubArray.__super__.constructor.call(this, options);
    this.result.on("remove", (function(_this) {
      return function(mdl, coll) {
        if (coll.length) {
          options.sub.renderResult();
        }
        _this.searchcoll.add(mdl);
        _this.trigger("removed", mdl);
      };
    })(this));
    return;
  }

  FacetSubArray.prototype._isFull = function() {
    if (this.selectCount <= 0) {
      return false;
    }
    return (this.result || []).length >= this.selectCount;
  };

  FacetSubArray.prototype.select = function() {
    var _mdl, _val, _vals, i, len, ref;
    if (this.loading) {
      return;
    }
    _vals = this.model.get("value");
    if ((_vals != null) && !_.isArray(_vals)) {
      _vals = [_vals];
    }
    if (!(_vals != null ? _vals.length : void 0)) {
      return;
    }
    ref = (this.selectCount <= 0 ? _vals : _vals.slice(0, this.selectCount));
    for (i = 0, len = ref.length; i < len; i++) {
      _val = ref[i];
      _mdl = this.collection.get(_val);
      if (_mdl == null) {
        _mdl = new this.collection.model({
          value: _val,
          custom: true
        });
      }
      this.selected(_mdl);
    }
    this.close();
  };

  FacetSubArray.prototype.reopen = function(pView) {
    if (this._isFull()) {
      return;
    }
    FacetSubArray.__super__.reopen.apply(this, arguments);
  };

  FacetSubArray.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  FacetSubArray.prototype._onTabAction = function(evnt) {
    var searchContent;
    evnt.preventDefault();
    evnt.stopPropagation();
    searchContent = this.$inp.val();
    if (searchContent != null ? searchContent.length : void 0) {
      this.selectActive();
      return;
    }
    this.close();
  };

  FacetSubArray.prototype._createOptionCollection = function(options) {
    var _coll, _opts, i, len, opt;
    if (_.isFunction(options)) {
      this.loading = true;
      _coll = new this.optColl([]);
      setTimeout((function(_this) {
        return function() {
          _this.$el.parent().addClass("loading");
          return options(_this.result, _this.model, function(aOpts) {
            var _opt, i, idx, len;
            for (idx = i = 0, len = aOpts.length; i < len; idx = ++i) {
              _opt = aOpts[idx];
              aOpts[idx] = _.extend({}, _this.optDefault, _opt, {
                custom: false
              });
            }
            _coll.add(aOpts);
            _this.loading = false;
            _this.$el.parent().removeClass("loading");
            _this.select();
          });
        };
      })(this), 0);
      return _coll;
    }
    _opts = [];
    for (i = 0, len = options.length; i < len; i++) {
      opt = options[i];
      if (_.isString(opt) || _.isNumber(opt)) {
        _opts.push({
          value: opt,
          label: opt
        });
      } else if (_.isObject(opt)) {
        _opts.push(_.extend({}, this.optDefault, opt));
      }
    }
    return new this.optColl(_opts);
  };

  return FacetSubArray;

})(require("../selector"));

module.exports = FacetSubArray;


},{"../../models/backbone_sub":2,"../../models/subresults":13,"../../tmpls/array_resultli.jade":14,"../../utils/keycodes":25,"../selector":35}],30:[function(require,module,exports){
var FacetSubsNumber,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsNumber = (function(superClass) {
  extend(FacetSubsNumber, superClass);

  function FacetSubsNumber() {
    this.getResults = bind(this.getResults, this);
    this._onTabAction = bind(this._onTabAction, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.reopen = bind(this.reopen, this);
    this.focus = bind(this.focus, this);
    this._opSelected = bind(this._opSelected, this);
    this.select = bind(this.select, this);
    this.close = bind(this.close, this);
    this.renderResult = bind(this.renderResult, this);
    this.render = bind(this.render, this);
    this.events = bind(this.events, this);
    return FacetSubsNumber.__super__.constructor.apply(this, arguments);
  }

  FacetSubsNumber.prototype.template = require("../../tmpls/number.jade");

  FacetSubsNumber.prototype.events = function() {
    var _evnts;
    _evnts = FacetSubsNumber.__super__.events.apply(this, arguments);
    _evnts["blur " + (this._getInpSelector())] = "select";
    return _evnts;
  };

  FacetSubsNumber.prototype.render = function() {
    var ref;
    FacetSubsNumber.__super__.render.apply(this, arguments);
    if ((ref = this.model.get("operators")) != null ? ref.length : void 0) {
      this.$inpOp = this.$el.find("select#" + this.cid + "op");
      this.$inpOp.select2({
        width: "auto"
      });
      this.$inpOp.on("select2:close", this._opSelected);
    }
  };

  FacetSubsNumber.prototype.renderResult = function(renderEmpty) {
    var _res, _s;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
    _res = this.getResults();
    _s = "<li>";
    if (_res.operator != null) {
      _s += _res.operator + " ";
    }
    _s += _res.value;
    _s += "</li>";
    return _s;
  };

  FacetSubsNumber.prototype.close = function(evnt) {
    if (this.$inpOp != null) {
      this.$inpOp.select2("destroy");
      this.$inpOp.remove();
      this.$inpOp = null;
    }
    FacetSubsNumber.__super__.close.apply(this, arguments);
  };

  FacetSubsNumber.prototype.select = function(evnt) {
    var _posWrp, ref;
    if ((evnt != null ? evnt.relatedTarget : void 0) != null) {
      _posWrp = this.el.compareDocumentPosition(evnt != null ? evnt.relatedTarget : void 0);
      if (!(_posWrp === 0 || _posWrp - 16 >= 0)) {
        evnt.stopPropagation();
        return;
      }
    }
    if ((evnt != null) && ((evnt != null ? evnt.relatedTarget : void 0) === this.$inp.get(0) || (evnt != null ? evnt.relatedTarget : void 0) === ((ref = this.$inpOp) != null ? ref.get(0) : void 0))) {
      evnt.stopPropagation();
      return;
    }
    if (this.$inpOp != null) {
      this.model.set({
        operator: this.$inpOp.val()
      });
    }
    FacetSubsNumber.__super__.select.apply(this, arguments);
  };

  FacetSubsNumber.prototype._opSelected = function() {
    this.selectedOP = true;
    this.focus();
  };

  FacetSubsNumber.prototype.focus = function(inp) {
    if (inp == null) {
      inp = false;
    }
    if ((this.$inpOp != null) && !this.selectedOP) {
      this.$inpOp.select2("open");
      return;
    }
    FacetSubsNumber.__super__.focus.apply(this, arguments);
  };

  FacetSubsNumber.prototype.reopen = function(pView) {
    var _oldOp, _oldVal;
    _oldVal = this.result.first().get("value");
    _oldOp = this.result.first();
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubsNumber.__super__.reopen.apply(this, arguments);
  };

  FacetSubsNumber.prototype.getTemplateData = function() {
    return _.extend(FacetSubsNumber.__super__.getTemplateData.apply(this, arguments), {
      operators: this.model.get("operators"),
      operator: this.model.get("operator")
    });
  };

  FacetSubsNumber.prototype._onTabAction = function(evnt) {
    var _val;
    _val = this.getValue();
    evnt.preventDefault();
    evnt.stopPropagation();
    if (!isNaN(_val)) {
      this.select();
    }
  };

  FacetSubsNumber.prototype.getResults = function() {
    var _ret;
    if (this.$inpOp != null) {
      _ret = {
        value: this.getValue(),
        operator: this.$inpOp.val()
      };
    } else {
      _ret = {
        value: this.getValue()
      };
    }
    return _ret;
  };

  return FacetSubsNumber;

})(require("./number_base"));

module.exports = FacetSubsNumber;


},{"../../tmpls/number.jade":16,"./number_base":28}],31:[function(require,module,exports){
var FacetSubsRange,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubsRange = (function(superClass) {
  extend(FacetSubsRange, superClass);

  function FacetSubsRange() {
    this._onTabAction = bind(this._onTabAction, this);
    this.getValue = bind(this.getValue, this);
    this.getResults = bind(this.getResults, this);
    this.close = bind(this.close, this);
    this.select = bind(this.select, this);
    this.reopen = bind(this.reopen, this);
    this.focus = bind(this.focus, this);
    this.render = bind(this.render, this);
    this.renderResult = bind(this.renderResult, this);
    this.events = bind(this.events, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    return FacetSubsRange.__super__.constructor.apply(this, arguments);
  }

  FacetSubsRange.prototype.template = require("../../tmpls/range.jade");

  FacetSubsRange.prototype._getInpSelector = function(ext) {
    if (ext == null) {
      ext = "_from";
    }
    return "input#" + this.cid + ext;
  };

  FacetSubsRange.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj["keyup " + (this._getInpSelector("_to"))] = "input",
      obj["keydown " + (this._getInpSelector("_to"))] = "input",
      obj["blur " + (this._getInpSelector())] = "select",
      obj["blur " + (this._getInpSelector("_to"))] = "select",
      obj
    );
  };

  FacetSubsRange.prototype.renderResult = function(renderEmpty) {
    var _res;
    if (renderEmpty == null) {
      renderEmpty = false;
    }
    if (renderEmpty) {
      return "<li></li>";
    }
    _res = this.getResults();
    return "<li>" + _res.value.join(" - ") + "</li>";
  };

  FacetSubsRange.prototype.render = function() {
    FacetSubsRange.__super__.render.apply(this, arguments);
    this.$inpTo = this.$el.find(this._getInpSelector("_to"));
  };

  FacetSubsRange.prototype.focus = function(inp) {
    if (inp == null) {
      inp = false;
    }
    FacetSubsRange.__super__.focus.apply(this, arguments);
  };

  FacetSubsRange.prototype.reopen = function(pView) {
    var _oldVal;
    _oldVal = this.result.first().get("value");
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubsRange.__super__.reopen.apply(this, arguments);
  };

  FacetSubsRange.prototype.select = function(evnt) {
    if ((evnt != null) && ((evnt != null ? evnt.relatedTarget : void 0) === this.$inp.get(0) || (evnt != null ? evnt.relatedTarget : void 0) === this.$inpTo.get(0))) {
      evnt.stopPropagation();
      return;
    }
    FacetSubsRange.__super__.select.apply(this, arguments);
  };

  FacetSubsRange.prototype.close = function() {
    try {
      this.$(".rangeinp").remove();
    } catch (undefined) {}
    FacetSubsRange.__super__.close.apply(this, arguments);
  };

  FacetSubsRange.prototype.getResults = function() {
    var _ret;
    _ret = {
      value: this.getValue()
    };
    return _ret;
  };

  FacetSubsRange.prototype.getValue = function() {
    var _v, _vFrom, _vTo;
    _vFrom = FacetSubsRange.__super__.getValue.apply(this, arguments);
    _v = this.$inpTo.val();
    if (!(_v != null ? _v.length : void 0)) {
      return null;
    }
    _vTo = parseInt(this.valueByDefinition(_v), 10);
    return [_vFrom, _vTo];
  };

  FacetSubsRange.prototype._onTabAction = function(evnt) {
    var _val;
    _val = this.getValue();
    if ((_val != null ? _val.length : void 0) >= 2) {
      evnt.preventDefault();
      evnt.stopPropagation();
      this.select();
    }
  };

  return FacetSubsRange;

})(require("./number_base"));

module.exports = FacetSubsRange;


},{"../../tmpls/range.jade":17,"./number_base":28}],32:[function(require,module,exports){
var FacetSubsSelect, KEYCODES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KEYCODES = require("../../utils/keycodes");

FacetSubsSelect = (function(superClass) {
  extend(FacetSubsSelect, superClass);

  function FacetSubsSelect() {
    this._select = bind(this._select, this);
    this.select = bind(this.select, this);
    this.close = bind(this.close, this);
    this.unselect = bind(this.unselect, this);
    this._createOptionCollection = bind(this._createOptionCollection, this);
    this.getResults = bind(this.getResults, this);
    this._convertValue = bind(this._convertValue, this);
    this.getValue = bind(this.getValue, this);
    this._hasTabListener = bind(this._hasTabListener, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.remove = bind(this.remove, this);
    this._initSelect2 = bind(this._initSelect2, this);
    this._checkIntValue = bind(this._checkIntValue, this);
    this.reopen = bind(this.reopen, this);
    this._isFull = bind(this._isFull, this);
    this.focus = bind(this.focus, this);
    this.render = bind(this.render, this);
    this._getInpSelector = bind(this._getInpSelector, this);
    this.events = bind(this.events, this);
    return FacetSubsSelect.__super__.constructor.apply(this, arguments);
  }

  FacetSubsSelect.prototype.template = require("../../tmpls/select.jade");

  FacetSubsSelect.prototype.forcedModuleOpts = {};

  FacetSubsSelect.prototype.defaultModuleOpts = {
    width: "auto",
    multiple: false
  };

  FacetSubsSelect.prototype.initialize = function() {
    this.convertValueToInt = this._checkIntValue(this.model.get("options"));
    FacetSubsSelect.__super__.initialize.apply(this, arguments);
  };

  FacetSubsSelect.prototype.events = function() {
    var _evnts;
    _evnts = {};
    if (this.model.get("multiple")) {
      _evnts["click .select-check"] = "select";
    }
    return _evnts;
  };

  FacetSubsSelect.prototype._getInpSelector = function() {
    return "select#" + this.cid;
  };

  FacetSubsSelect.prototype.render = function() {
    FacetSubsSelect.__super__.render.apply(this, arguments);
  };

  FacetSubsSelect.prototype.focus = function() {
    this.model.set("waitForAsync", false);
    this._initSelect2();
    this.select2.$container.show();
    this.select2.open();
    return FacetSubsSelect.__super__.focus.apply(this, arguments);
  };

  FacetSubsSelect.prototype._isFull = function() {
    if (this.selectCount <= 0) {
      return false;
    }
    return (this.result || []).length >= this.selectCount;
  };

  FacetSubsSelect.prototype.reopen = function(pView) {
    var _oldVals;
    if (this._isFull()) {
      return;
    }
    _oldVals = this.result.pluck("value");
    this.model.set({
      value: _oldVals
    });
    pView.$results.empty();
    this.select2.$container.off();
    this.select2.destroy();
    this.result.reset();
    this.select2 = null;
    return FacetSubsSelect.__super__.reopen.apply(this, arguments);
  };

  FacetSubsSelect.prototype._checkIntValue = function(_opts) {
    var _v, i, len;
    if (_opts == null) {
      _opts = [];
    }
    if (!_opts || !_opts.length) {
      return false;
    }
    for (i = 0, len = _opts.length; i < len; i++) {
      _v = _opts[i];
      if ((_v.value != null) && _.isString(_v.value)) {
        return false;
      }
      if ((_v.id != null) && _.isString(_v.id)) {
        return false;
      }
      if ((_v != null) && _.isString(_v)) {
        return false;
      }
    }
    return true;
  };

  FacetSubsSelect.prototype._initSelect2 = function() {
    var _opts;
    if (this.select2 == null) {
      _opts = _.extend({}, this.defaultModuleOpts, this.model.get("opts"), {
        multiple: this.model.get("multiple") || false
      }, this.forcedModuleOpts);
      this.$inp.select2(_opts);
      this.select2 = this.$inp.data("select2");
      if (!this.model.get("multiple")) {
        this.$inp.on("select2:select select2:close", this.select);
      }
      this.select2.on("results:all", (function(_this) {
        return function(results) {
          var ref, ref1, ref2;
          _this.convertValueToInt = _this._checkIntValue(results != null ? (ref = results.data) != null ? ref.results : void 0 : void 0);
          if ((ref1 = _this.select2.selection) != null) {
            if ((ref2 = ref1.$search) != null) {
              if (typeof ref2.focus === "function") {
                ref2.focus();
              }
            }
          }
        };
      })(this));
      this.select2.dataAdapter.current((function(_this) {
        return function(results) {
          var _data, i, len, result;
          if (_this.model.get("waitForAsync")) {
            _data = [];
            for (i = 0, len = results.length; i < len; i++) {
              result = results[i];
              _data.push(_this._convertValue(result));
            }
            _this._select(_data);
            _this.close();
          }
        };
      })(this));
      this.select2.$container.on("click", this._sel2open);
      this.select2.$element.hide();
      if (this.model.get("multiple")) {
        $(document).on(this._hasTabEvent(), this._onKey);
      }
    }
    return this.select2;
  };

  FacetSubsSelect.prototype._sel2open = function(evnt) {
    evnt.stopPropagation();
    return false;
  };

  FacetSubsSelect.prototype.remove = function() {
    return FacetSubsSelect.__super__.remove.apply(this, arguments);
  };

  FacetSubsSelect.prototype.getTemplateData = function() {
    var _data, _groups, _idx, _v, _vlist, i, j, len, len1, ref, ref1;
    _data = _.extend({}, FacetSubsSelect.__super__.getTemplateData.apply(this, arguments), {
      multiple: this.model.get("multiple"),
      options: this._createOptionCollection(this.model.get("options"))
    });
    if ((_data.value != null) && _.isArray(_data.value)) {
      ref = _data.value;
      for (_idx = i = 0, len = ref.length; i < len; _idx = ++i) {
        _v = ref[_idx];
        _data.value[_idx] = this.convertValueToInt ? parseFloat(_v) : _v.toString();
      }
    } else if (_data.value != null) {
      _data.value = [this.convertValueToInt ? parseFloat(_data.value) : _data.value.toString()];
    }
    if (_data.value != null) {
      _vlist = _.pluck(_data.options, "value");
      ref1 = _data.value;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        _v = ref1[j];
        if (indexOf.call(_vlist, _v) < 0) {
          _data.options.push({
            value: (this.convertValueToInt ? parseFloat(_v) : _v.toString()),
            label: _v,
            group: void 0
          });
        }
      }
    }
    _groups = _.groupBy(_data.options, "group");
    if (_.compact(_.keys(_groups || {})).length > 1) {
      _data.optionGroups = _groups;
    }
    return _data;
  };

  FacetSubsSelect.prototype._hasTabListener = function(create) {
    if (create) {
      return false;
    }
    return this.model.get("multiple");
  };

  FacetSubsSelect.prototype._hasTabEvent = function() {
    return "keyup";
  };

  FacetSubsSelect.prototype.getValue = function() {
    var _vals, data, i, len, ref, ref1;
    _vals = [];
    ref1 = ((ref = this._initSelect2()) != null ? ref.data() : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      data = ref1[i];
      _vals.push(this._convertValue(data));
    }
    return _vals;
  };

  FacetSubsSelect.prototype._convertValue = function(data) {
    var _data;
    _data = {};
    if (this.convertValueToInt) {
      _data.value = parseFloat(data.id);
    } else {
      _data.value = data.id;
    }
    if (data.text != null) {
      _data.label = data.text;
    }
    return _data;
  };

  FacetSubsSelect.prototype.getResults = function() {
    return {
      value: this.result.pluck("value")
    };
  };

  FacetSubsSelect.prototype._createOptionCollection = function(options) {
    var _opts, i, len, opt;
    if (_.isFunction(options)) {
      return options(this._createOptionCollection);
    }
    _opts = [];
    for (i = 0, len = options.length; i < len; i++) {
      opt = options[i];
      if (_.isString(opt) || _.isNumber(opt)) {
        _opts.push({
          value: (this.convertValueToInt ? parseFloat(opt) : opt.toString()),
          label: opt,
          group: null
        });
      } else if (_.isObject(opt)) {
        opt.value = this.convertValueToInt ? parseFloat(opt.value) : opt.value.toString();
        _opts.push(_.extend({}, this.optDefault, opt));
      }
    }
    return _opts;
  };

  FacetSubsSelect.prototype.unselect = function(evnt) {
    var ref, ref1;
    this.result.remove((ref = evnt.params) != null ? (ref1 = ref.data) != null ? ref1.id : void 0 : void 0);
  };

  FacetSubsSelect.prototype.close = function() {
    var ref;
    if (this.model.get("waitForAsync")) {
      return;
    }
    if (this.select2 != null) {
      this.select2.$container.hide();
    }
    if ((ref = this.$inp) != null) {
      ref.remove();
    }
    this.$(".select-check").remove();
    FacetSubsSelect.__super__.close.apply(this, arguments);
  };

  FacetSubsSelect.prototype.select = function(evnt) {
    var _vals;
    if (evnt != null ? evnt.stopPropagation : void 0) {
      evnt.stopPropagation();
    }
    _vals = this.getValue();
    if (!(_vals != null ? _vals.length : void 0)) {
      this.close();
      if (!this.model.get("waitForAsync")) {
        this.sub.del();
      }
      return;
    }
    this._select(_vals);
    this.close();
  };

  FacetSubsSelect.prototype._select = function(_vals) {
    var ModelConst, _val, i, len;
    this.model.set("waitForAsync", false);
    ModelConst = this.getSelectModel();
    for (i = 0, len = _vals.length; i < len; i++) {
      _val = _vals[i];
      this.result.add(new ModelConst(_val));
    }
    this.trigger("selected", this.result);
  };

  return FacetSubsSelect;

})(require("./base"));

module.exports = FacetSubsSelect;


},{"../../tmpls/select.jade":19,"../../utils/keycodes":25,"./base":26}],33:[function(require,module,exports){
var FacetSubString,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetSubString = (function(superClass) {
  extend(FacetSubString, superClass);

  function FacetSubString() {
    this.reopen = bind(this.reopen, this);
    this.close = bind(this.close, this);
    this.events = bind(this.events, this);
    return FacetSubString.__super__.constructor.apply(this, arguments);
  }

  FacetSubString.prototype.template = require("../../tmpls/string.jade");

  FacetSubString.prototype.events = function() {
    var obj;
    return (
      obj = {},
      obj["keyup " + (this._getInpSelector())] = "input",
      obj["keydown " + (this._getInpSelector())] = "input",
      obj["blur " + (this._getInpSelector())] = "select",
      obj
    );
  };

  FacetSubString.prototype.close = function(evnt) {
    var ref;
    FacetSubString.__super__.close.apply(this, arguments);
    try {
      if ((ref = this.$inp) != null) {
        ref.remove();
      }
    } catch (undefined) {}
  };

  FacetSubString.prototype.reopen = function(pView) {
    var _oldVal;
    _oldVal = this.result.first().get("value");
    this.model.set({
      value: _oldVal
    });
    pView.$results.empty().html(this.renderResult(true));
    FacetSubString.__super__.reopen.apply(this, arguments);
  };

  return FacetSubString;

})(require("./base"));

module.exports = FacetSubString;


},{"../../tmpls/string.jade":22,"./base":26}],34:[function(require,module,exports){
var KEYCODES, MainView, SelectorView, SubView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SubView = require("./sub");

SelectorView = require("./selector");

KEYCODES = require("../utils/keycodes");

MainView = (function(superClass) {
  extend(MainView, superClass);

  function MainView() {
    this._outerClick = bind(this._outerClick, this);
    this._outerClickListen = bind(this._outerClickListen, this);
    this.addFacet = bind(this.addFacet, this);
    this.genSub = bind(this.genSub, this);
    this.setFacet = bind(this.setFacet, this);
    this.remFacet = bind(this.remFacet, this);
    this.exit = bind(this.exit, this);
    this._onKey = bind(this._onKey, this);
    this._addFacet = bind(this._addFacet, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.template = require("../tmpls/wrapper.jade");

  MainView.prototype.events = {
    "click .add-facet-btn": "_addFacet",
    "click": "_addFacet"
  };

  MainView.prototype.initialize = function(options) {
    var _cl, _fnSort, _valueFacets, fct, i, len, ref, ref1, subview;
    this.results = options.results;
    this.collection.on("iggy:rem", this.remFacet);
    _cl = "iggy clearfix";
    if ((ref = this.el.className) != null ? ref.length : void 0) {
      _cl = " " + _cl;
    }
    this.el.className += _cl;
    this.render();
    $(document).on("keyup", this._onKey);
    this._outerClickListen();
    _valueFacets = this.collection.filter(function(fct) {
      return (fct != null ? fct.get("value") : void 0) != null;
    });
    _fnSort = function(key) {
      return function(v1, v2) {
        if (v1[key] > v2[key]) {
          return 1;
        }
        if (v1[key] < v2[key]) {
          return -1;
        }
        return 0;
      };
    };
    ref1 = _valueFacets.sort(_fnSort("_idx"));
    for (i = 0, len = ref1.length; i < len; i++) {
      fct = ref1[i];
      subview = this.genSub(fct, false);
    }
    this.collection.on("add", (function(_this) {
      return function() {
        _this.$addBtn.show();
      };
    })(this));
  };

  MainView.prototype.render = function() {
    this.$el.html(this.template());
    this.$addBtn = this.$(".add-facet-btn");
  };

  MainView.prototype._addFacet = function(evnt) {
    this.addFacet();
  };

  MainView.prototype._onKey = function(evnt) {
    var ref;
    if (evnt.keyCode === KEYCODES.ESC || (ref = evnt.keyCode, indexOf.call(KEYCODES.ESC, ref) >= 0)) {
      this.exit();
      return;
    }
  };

  MainView.prototype.exit = function(nextAdd) {
    if (nextAdd == null) {
      nextAdd = true;
    }
    if (this.subview) {
      this.subview.close();
      this.subview = null;
      if (nextAdd) {
        this.addFacet();
      }
      return;
    }
    if (this.selectview) {
      this.selectview.close();
      this.selectview = null;
    }
  };

  MainView.prototype.remFacet = function(facetM) {
    this.results.remove(facetM.get("name"));
  };

  MainView.prototype.setFacet = function(facetM, data) {
    this.collection.remove(facetM);
    this.results.add(_.extend(data, {
      name: facetM.get("name"),
      type: facetM.get("type")
    }), {
      merge: true,
      parse: true,
      _facet: facetM
    });
    if (!this.collection.length) {
      this.$addBtn.hide();
    }
  };

  MainView.prototype.genSub = function(facetM, addAfter) {
    var subview;
    if (addAfter == null) {
      addAfter = true;
    }
    subview = new SubView({
      model: facetM,
      collection: this.collection,
      parent: this
    });
    subview.on("closed", (function(_this) {
      return function(results) {
        if (!(results != null ? results.length : void 0)) {
          subview.remove();
        }
        _this.subview = null;
        if (addAfter) {
          _this.addFacet();
        }
      };
    })(this));
    subview.on("reopen", (function(_this) {
      return function() {
        var ref;
        if ((ref = _this.selectview) != null) {
          ref.close();
        }
      };
    })(this));
    subview.on("selected", this.setFacet);
    this.$addBtn.before(subview.render());
    return subview;
  };

  MainView.prototype.addFacet = function() {
    if (this.selectview != null) {
      this.selectview.focus();
      return;
    }
    if (this.subview != null) {
      this.subview.close();
      return;
    }
    if (!this.collection.length) {
      return;
    }
    this.selectview = new SelectorView({
      collection: this.collection,
      custom: false
    });
    this.$addBtn.before(this.selectview.render());
    this.selectview.focus();
    this.selectview.on("closed", (function(_this) {
      return function(results) {
        _this.selectview.remove();
        _this.selectview = null;
        if (!(results != null ? results.length : void 0) && (_this.subview != null)) {
          _this.subview.remove();
          _this.subview = null;
        }
      };
    })(this));
    this.selectview.on("selected", (function(_this) {
      return function(facetM) {
        facetM.set("value", null);
        _this.subview = _this.genSub(facetM);
        _this.subview.open();
      };
    })(this));
  };

  MainView.prototype._outerClickListen = function() {
    jQuery(document).on("click", this._outerClick);
  };

  MainView.prototype._outerClick = function(evnt) {
    var _posWrp;
    evnt.stopPropagation();
    _posWrp = this.el.compareDocumentPosition(evnt.target);
    if (!(_posWrp === 0 || _posWrp - 16 >= 0)) {
      this.exit(false);
    }
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;


},{"../tmpls/wrapper.jade":24,"../utils/keycodes":25,"./selector":35,"./sub":36}],35:[function(require,module,exports){
var KEYCODES, SelectorView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KEYCODES = require("../utils/keycodes");

SelectorView = (function(superClass) {
  extend(SelectorView, superClass);

  SelectorView.prototype.template = require("../tmpls/selector.jade");

  SelectorView.prototype.templateEl = require("../tmpls/selectorli.jade");

  SelectorView.prototype.selectCount = 1;

  SelectorView.prototype.className = function() {
    var cls;
    cls = ["add-facet"];
    if (this.custom) {
      cls.push("custom");
    }
    return cls.join(" ");
  };

  SelectorView.prototype.events = function() {
    var obj;
    return (
      obj = {
        "mousedown a": "_onClick"
      },
      obj["focus input#" + this.cid] = "open",
      obj["keydown input#" + this.cid] = "search",
      obj["keyup input#" + this.cid] = "search",
      obj
    );
  };

  function SelectorView(options) {
    this.selectActive = bind(this.selectActive, this);
    this.select = bind(this.select, this);
    this.move = bind(this.move, this);
    this.search = bind(this.search, this);
    this.focus = bind(this.focus, this);
    this.selected = bind(this.selected, this);
    this._isFull = bind(this._isFull, this);
    this._onClick = bind(this._onClick, this);
    this.checkOptionsEmpty = bind(this.checkOptionsEmpty, this);
    this.scrollHelper = bind(this.scrollHelper, this);
    this._checkScroll = bind(this._checkScroll, this);
    this.renderRes = bind(this.renderRes, this);
    this.render = bind(this.render, this);
    this.getTemplateData = bind(this.getTemplateData, this);
    this.initialize = bind(this.initialize, this);
    this.events = bind(this.events, this);
    this.className = bind(this.className, this);
    this.custom = options.custom || false;
    this.activeIdx = 0;
    this.currQuery = "";
    SelectorView.__super__.constructor.call(this, options);
    return;
  }

  SelectorView.prototype.initialize = function(options) {
    SelectorView.__super__.initialize.apply(this, arguments);
    this.searchcoll = this.collection.sub(function() {
      return true;
    });
    this.result = new this.collection.constructor();
    this.listenTo(this.searchcoll, "add", this.renderRes);
    this.listenTo(this.searchcoll, "remove", this.renderRes);
    this.listenTo(this.searchcoll, "remove", this.checkOptionsEmpty);
  };

  SelectorView.prototype.getTemplateData = function() {
    return _.extend(SelectorView.__super__.getTemplateData.apply(this, arguments), {
      custom: this.custom
    });
  };

  SelectorView.prototype.render = function() {
    SelectorView.__super__.render.apply(this, arguments);
    this.$list = this.$el.find("#" + this.cid + "typelist");
    this.renderRes();
    return this.el;
  };

  SelectorView.prototype.renderRes = function() {
    var _cssclass, _id, _lbl, _list, _tmpl, i, idx, len, model, ref, ref1;
    this.$list.empty();
    _list = [];
    ref = this.searchcoll.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      _lbl = model.getLabel();
      _tmpl = model.get("labeltemplate");
      if (_tmpl != null) {
        _lbl = _tmpl.replace("{{label}}", _lbl);
      }
      _id = model.id;
      _cssclass = model.get("cssclass");
      if (((ref1 = this.currQuery) != null ? ref1.length : void 0) > 1) {
        _lbl = _lbl.replace(new RegExp(this.currQuery, "gi"), (function(str) {
          return "<b>" + str + "</b>";
        }));
      }
      _list.push({
        label: _lbl,
        id: _id,
        cssclass: _cssclass
      });
    }
    this.$list.append(this.templateEl({
      list: _list,
      query: this.currQuery,
      activeIdx: this.activeIdx,
      custom: this.custom
    }));
    this._checkScroll();
    return this.$list;
  };

  SelectorView.prototype._scrollTill = 198;

  SelectorView.prototype._checkScroll = function() {
    var _height;
    _height = this.$list.height();
    if (_height > 0) {
      this.scrollHelper(_height);
      return;
    }
    setTimeout((function(_this) {
      return function() {
        return _this.scrollHelper(_this.$list.height());
      };
    })(this), 0);
  };

  SelectorView.prototype.scrollHelper = function(height) {
    if (height >= this._scrollTill) {
      this.scrolling = true;
    } else {
      this.scrolling = false;
    }
  };

  SelectorView.prototype.checkOptionsEmpty = function() {};

  SelectorView.prototype._onClick = function(evnt) {
    var _id, _mdl;
    evnt.stopPropagation();
    evnt.preventDefault();
    _id = this.$(evnt.currentTarget).data("id");
    if (_id == null) {
      return;
    }
    _mdl = this.collection.get(_id);
    if (_mdl == null) {
      return;
    }
    this.selected(_mdl);
    return false;
  };

  SelectorView.prototype._isFull = function() {
    return true;
  };

  SelectorView.prototype.selected = function(mdl) {
    var _err, _errerr, error, error1;
    try {
      if (mdl.onlyExec != null) {
        if (mdl != null) {
          if (typeof mdl.exec === "function") {
            mdl.exec();
          }
        }
        return;
      }
    } catch (error) {
      _err = error;
      try {
        console.error("Issue #23: CATCH - Class:" + this.constructor.name + " - activeIdx:" + this.activeIdx + " - collection:" + (JSON.stringify(this.collection.toJSON())));
      } catch (error1) {
        _errerr = error1;
        console.error("Issue #23: CATCH");
      }
    }
    if (mdl != null) {
      this.searchcoll.remove(mdl);
      this.result.add(mdl);
      this.trigger("selected", mdl);
    }
    if (this._isFull()) {
      this.close();
    }
  };

  SelectorView.prototype.focus = function() {
    var _el;
    this.$inp.focus();
    _el = this.$inp.get(0);
    _el.selectionStart = _el.selectionEnd = _el.value.length;
  };

  SelectorView.prototype.search = function(evnt) {
    var _q;
    if ((evnt != null ? evnt.type : void 0) === "keydown") {
      switch (evnt.keyCode) {
        case KEYCODES.UP:
          this.move(true);
          return;
        case KEYCODES.DOWN:
          this.move(false);
          return;
        case KEYCODES.ENTER:
          this.selectActive(true);
          return;
      }
      return;
    }
    if (_.isString(evnt)) {
      _q = evnt;
    } else {
      _q = evnt.currentTarget.value.toLowerCase();
    }
    if (_q === this.currQuery) {
      return;
    }
    this.currQuery = _q;
    this.searchcoll.updateSubFilter((function(_this) {
      return function(mdl) {
        var _match;
        if (_this.result.get(mdl.id) != null) {
          return false;
        }
        if (!(_q != null ? _q.length : void 0)) {
          return true;
        }
        _match = mdl.match(_q);
        return _match;
      };
    })(this), false);
    this.activeIdx = 0;
    this.renderRes();
  };

  SelectorView.prototype.move = function(up) {
    var _$elnew, _$list, _customElementChange, _elH, _list, _newidx, _pos, _scrollT, _top, ref;
    if (up == null) {
      up = false;
    }
    _list = this.$el.find(".typelist a");
    _customElementChange = ((ref = this.currQuery) != null ? ref.length : void 0) ? 0 : 1;
    _top = 0;
    if (up) {
      if ((this.activeIdx - 1) < _top) {
        return;
      }
      _newidx = this.activeIdx - 1;
    } else {
      if (this.searchcoll.length - _customElementChange <= this.activeIdx) {
        return;
      }
      _newidx = this.activeIdx + 1;
    }
    this.$(_list[this.activeIdx]).removeClass("active");
    _$elnew = this.$(_list[_newidx]).addClass("active");
    if (this.scrolling) {
      _elH = _$elnew.outerHeight();
      _pos = _elH * (_newidx + 1);
      _$list = this.$el.find(".typelist");
      _scrollT = _$list.scrollTop();
      if (_pos > _scrollT + this._scrollTill) {
        _$list.scrollTop(_pos - this._scrollTill);
      } else if (_pos < _scrollT + _elH) {
        _$list.scrollTop(_pos - _elH);
      }
    }
    this.activeIdx = _newidx;
  };

  SelectorView.prototype.select = function() {};

  SelectorView.prototype.selectActive = function(isEnterEvent) {
    var _search, _sel, ref;
    if (isEnterEvent == null) {
      isEnterEvent = false;
    }
    _sel = this.$el.find(".typelist a.active").removeClass("active").data();
    _search = this.$inp.val();
    if ((_sel == null) && this.selectCount !== 1 && isEnterEvent && !(_search != null ? _search.length : void 0)) {
      this.close();
      return;
    }
    if (_sel == null) {
      return;
    }
    this.activeIdx = 0;
    if ((_sel != null ? _sel.idx : void 0) >= 0 && this.searchcoll.length) {
      this.selected(this.collection.get(_sel.id));
    } else if ((ref = this.currQuery) != null ? ref.length : void 0) {
      this.selected(new this.collection.model({
        value: this.currQuery,
        custom: true
      }));
      this.$inp.val("");
    } else {
      return;
    }
  };

  return SelectorView;

})(require("./facets/base"));

module.exports = SelectorView;


},{"../tmpls/selector.jade":20,"../tmpls/selectorli.jade":21,"../utils/keycodes":25,"./facets/base":26}],36:[function(require,module,exports){
var ViewSub,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewSub = (function(superClass) {
  extend(ViewSub, superClass);

  function ViewSub() {
    this.open = bind(this.open, this);
    this.attachSubEvents = bind(this.attachSubEvents, this);
    this.generateSub = bind(this.generateSub, this);
    this.close = bind(this.close, this);
    this.focus = bind(this.focus, this);
    this.isOpen = bind(this.isOpen, this);
    this.renderResult = bind(this.renderResult, this);
    this.removed = bind(this.removed, this);
    this.selected = bind(this.selected, this);
    this.remove = bind(this.remove, this);
    this.del = bind(this.del, this);
    this.reopen = bind(this.reopen, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    this.className = bind(this.className, this);
    return ViewSub.__super__.constructor.apply(this, arguments);
  }

  ViewSub.prototype.template = require("../tmpls/sub.jade");

  ViewSub.prototype.className = function() {
    var _name, _std, _type;
    _std = "sub";
    _type = this.model.get("type");
    if (_type != null) {
      _std += " sub-type-" + _type;
    }
    _name = this.model.get("name");
    if (_name != null) {
      _std += " sub-name-" + _name;
    }
    return _std;
  };

  ViewSub.prototype.initialize = function(options) {
    this._isOpen = false;
    this.result = new Backbone.Collection();
    this.$el.on("click", this.reopen);
    this.parent = options.parent;
  };

  ViewSub.prototype.events = {
    "click .rm-facet-btn": "del"
  };

  ViewSub.prototype.render = function(optMdl) {
    var _err, _errerr, _list, error, error1, i, idx, len, model, ref;
    _list = [];
    ref = this.result.models;
    for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
      model = ref[idx];
      try {
        _list.push(model.getLabel());
      } catch (error) {
        _err = error;
        try {
          console.error("Issue #24: CATCH - Class:" + this.constructor.name + " - model:" + (JSON.stringify(this.model.toJSON())) + " - result:" + (JSON.stringify(this.result.toJSON())));
        } catch (error1) {
          _errerr = error1;
          console.error("Issue #24: CATCH");
        }
      }
    }
    this.$el.html(this.template({
      label: this.model.getLabel(),
      selected: _list,
      type: this.model.get("type"),
      name: this.model.get("name")
    }));
    this.$sub = this.$(".subselect");
    this.$results = this.$(".subresults");
    this.generateSub();
    return this.el;
  };

  ViewSub.prototype.reopen = function(evnt) {
    var ref, ref1;
    if ((evnt != null) && $(evnt.target).is(".rm-result-btn") && (((ref = this.selectview) != null ? ref.rmRes : void 0) != null)) {
      this.selectview.rmRes(evnt);
      evnt.preventDefault();
      evnt.stopPropagation();
      return;
    }
    if ((evnt != null) && $(evnt.target).is(".edit-result-btn") && (((ref1 = this.selectview) != null ? ref1.editRes : void 0) != null)) {
      this.selectview.editRes(evnt);
      evnt.preventDefault();
      evnt.stopPropagation();
      return;
    }
    if (!this._isOpen && (this.selectview != null)) {
      this.selectview.reopen(this);
    }
    if (evnt != null) {
      evnt.preventDefault();
    }
    if (evnt != null) {
      evnt.stopPropagation();
    }
    this.trigger("reopen");
  };

  ViewSub.prototype.del = function(evnt) {
    if (evnt != null) {
      evnt.stopPropagation();
    }
    if (evnt != null) {
      evnt.preventDefault();
    }
    this.collection.trigger("iggy:rem", this.model);
    this.collection.add(this.model);
    this.remove();
    this.trigger("closed");
    return false;
  };

  ViewSub.prototype.remove = function() {
    var ref;
    this._isOpen = false;
    if ((ref = this.selectview) != null) {
      ref.remove();
    }
    this.parent = null;
    return ViewSub.__super__.remove.apply(this, arguments);
  };

  ViewSub.prototype.selected = function(optMdl) {
    this.result.add(optMdl, {
      merge: true
    });
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults());
  };

  ViewSub.prototype.removed = function(optMdl) {
    this.result.remove(optMdl);
    this.renderResult();
    this.trigger("selected", this.model, this.selectview.getResults());
    if (this.result.length <= 0) {
      this.del();
    }
  };

  ViewSub.prototype.renderResult = function() {
    this.$results.html(this.selectview.renderResult());
  };

  ViewSub.prototype.isOpen = function() {
    return this.selectview != null;
  };

  ViewSub.prototype.focus = function() {
    var ref;
    if (this.selectview != null) {
      if ((ref = this.selectview) != null) {
        ref.focus();
      }
      return;
    }
    this.open();
  };

  ViewSub.prototype.close = function() {
    var ref, ref1;
    this._isOpen = false;
    if (this.selectview != null) {
      if ((ref = this.selectview) != null) {
        ref.off();
      }
      if ((ref1 = this.selectview) != null) {
        ref1.close();
      }
      return;
    }
  };

  ViewSub.prototype.generateSub = function() {
    var ref;
    if (this.selectview != null) {
      this.attachSubEvents();
      return this.selectview;
    }
    this.selectview = new this.model.SubView({
      sub: this,
      model: this.model,
      el: this.$sub
    });
    this.attachSubEvents();
    this.$el.append(this.selectview.render());
    if (((ref = this.model) != null ? ref.get("value") : void 0) != null) {
      this.selectview.select();
    }
  };

  ViewSub.prototype.attachSubEvents = function() {
    this.selectview.on("closed", (function(_this) {
      return function(result) {
        _this._isOpen = false;
        if (!result.length) {
          _this.selectview.remove();
        }
        _this.trigger("closed", result);
        if (!result.length) {
          _this.remove();
        }
      };
    })(this));
    this.selectview.on("selected", (function(_this) {
      return function(mdl) {
        if (mdl) {
          _this.selected(mdl);
        }
      };
    })(this));
    this.selectview.on("removed", (function(_this) {
      return function(mdl) {
        if (mdl) {
          _this.removed(mdl);
        }
      };
    })(this));
  };

  ViewSub.prototype.open = function() {
    var ref;
    this.generateSub();
    if ((ref = this.selectview) != null) {
      ref.focus();
    }
    this._isOpen = true;
  };

  return ViewSub;

})(Backbone.View);

module.exports = ViewSub;


},{"../tmpls/sub.jade":23}],37:[function(require,module,exports){

},{}],38:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || require('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"fs":37}],39:[function(require,module,exports){
(function() {
  var _getKey, isArray, toString;

  toString = {}.toString;

  isArray = Array.isArray || function(arr) {
    return toString.call(arr) === '[object Array]';
  };

  _getKey = function(el, key) {
    return el[key];
  };

  module.exports = function(keys, forward, getKey) {
    var fnsort, ref;
    if (forward == null) {
      forward = true;
    }
    if (getKey == null) {
      getKey = _getKey;
    }
    if (!isArray(keys)) {
      keys = [keys];
    }
    fnsort = function(forward, key, nextkeys) {
      var _fwrd, _k, nextSort, ref;
      if (nextkeys != null ? nextkeys.length : void 0) {
        _k = (ref = nextkeys.splice(0, 1)) != null ? ref[0] : void 0;
        if (_k != null) {
          nextSort = fnsort(forward, _k, nextkeys);
        }
      }
      _fwrd = (forward[key] != null ? forward[key] : (forward["?"] != null ? forward["?"] : forward));
      return function(elA, elB) {
        var _a, _b;
        _a = getKey(elA, key);
        _b = getKey(elB, key);
        if (_a < _b) {
          if (_fwrd) {
            return -1;
          } else {
            return 1;
          }
        } else if (_a > _b) {
          if (_fwrd) {
            return 1;
          } else {
            return -1;
          }
        } else if (_a === _b) {
          if (nextSort != null) {
            return nextSort(elA, elB);
          } else {
            return 0;
          }
        }
      };
    };
    return fnsort(forward, (ref = keys.splice(0, 1)) != null ? ref[0] : void 0, keys);
  };

}).call(this);

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfc3JjL2pzL21haW4uY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvYmFja2JvbmVfc3ViLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2FycmF5LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2Jhc2UuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfZGF0ZXJhbmdlLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X2V2ZW50LmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0X251bWJlci5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9yYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9mYWNldF9zZWxlY3QuY29mZmVlIiwiX3NyYy9qcy9tb2RlbHMvZmFjZXRfc3RyaW5nLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL2ZhY2V0cy5jb2ZmZWUiLCJfc3JjL2pzL21vZGVscy9yZXN1bHRzLmNvZmZlZSIsIl9zcmMvanMvbW9kZWxzL3N1YnJlc3VsdHMuY29mZmVlIiwiX3NyYy9qcy90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlIiwiX3NyYy9qcy90bXBscy9kYXRlcmFuZ2UuamFkZSIsIl9zcmMvanMvdG1wbHMvbnVtYmVyLmphZGUiLCJfc3JjL2pzL3RtcGxzL3JhbmdlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3Jlc3VsdF9iYXNlLmphZGUiLCJfc3JjL2pzL3RtcGxzL3NlbGVjdC5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3Rvci5qYWRlIiwiX3NyYy9qcy90bXBscy9zZWxlY3RvcmxpLmphZGUiLCJfc3JjL2pzL3RtcGxzL3N0cmluZy5qYWRlIiwiX3NyYy9qcy90bXBscy9zdWIuamFkZSIsIl9zcmMvanMvdG1wbHMvd3JhcHBlci5qYWRlIiwiX3NyYy9qcy91dGlscy9rZXljb2Rlcy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9iYXNlLmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL2RhdGVyYW5nZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9udW1iZXJfYmFzZS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJhcnJheS5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL2ZhY2V0cy9zdWJudW1iZXIuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3VicmFuZ2UuY29mZmVlIiwiX3NyYy9qcy92aWV3cy9mYWNldHMvc3Vic2VsZWN0LmNvZmZlZSIsIl9zcmMvanMvdmlld3MvZmFjZXRzL3N1YnN0cmluZy5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL21haW4uY29mZmVlIiwiX3NyYy9qcy92aWV3cy9zZWxlY3Rvci5jb2ZmZWUiLCJfc3JjL2pzL3ZpZXdzL3N1Yi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2phZGUvcnVudGltZS5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0Y29sbC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsNEdBQUE7RUFBQTs7OztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVMsY0FBVDs7QUFDWCxNQUFBLEdBQVMsT0FBQSxDQUFTLGlCQUFUOztBQUNULFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxTQUFBLEdBQVksT0FBQSxDQUFTLHVCQUFUOztBQUNaLFNBQUEsR0FBWSxPQUFBLENBQVMsdUJBQVQ7O0FBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUyxzQkFBVDs7QUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFTLDBCQUFUOztBQUNm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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkEsTUFBTSxDQUFDLE9BQVAsR0FDQztFQUFBLE1BQUEsRUFBUSxFQUFSO0VBQ0EsT0FBQSxFQUFTLEVBRFQ7RUFFQSxJQUFBLEVBQU0sRUFGTjtFQUdBLE1BQUEsRUFBUSxF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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJNYWluVmlldyA9IHJlcXVpcmUoIFwiLi92aWV3cy9tYWluXCIgKVxuRmFjZXRzID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldHNcIiApXG5GY3RTdHJpbmcgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X3N0cmluZ1wiIClcbkZjdEFycmF5ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9hcnJheVwiIClcbkZjdFNlbGVjdCA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfc2VsZWN0XCIgKVxuRmN0TnVtYmVyID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9udW1iZXJcIiApXG5GY3RSYW5nZSA9IHJlcXVpcmUoIFwiLi9tb2RlbHMvZmFjZXRfcmFuZ2VcIiApXG5GY3REYXRlUmFuZ2UgPSByZXF1aXJlKCBcIi4vbW9kZWxzL2ZhY2V0X2RhdGVyYW5nZVwiIClcbkZjdEV2ZW50ID0gcmVxdWlyZSggXCIuL21vZGVscy9mYWNldF9ldmVudFwiIClcblJlc3VsdHMgPSByZXF1aXJlKCBcIi4vbW9kZWxzL3Jlc3VsdHNcIiApXG5cbmNsYXNzIElHR1kgZXh0ZW5kcyBCYWNrYm9uZS5FdmVudHNcblx0JDogalF1ZXJ5XG5cdGNvbnN0cnVjdG9yOiAoIGVsLCBmYWNldHMgPSBbXSwgb3B0aW9ucyA9IHt9ICktPlxuXHRcdF8uZXh0ZW5kIEAsIEJhY2tib25lLkV2ZW50c1xuXHRcdEBfaW5pdEVycm9ycygpXG5cdFx0XG5cdFx0IyBpbml0IGVsZW1lbnRcblx0XHRAJGVsID0gQF9wcmVwYXJlRWwoIGVsIClcblx0XHRAZWwgPSBAJGVsWzBdXG5cdFx0QCRlbC5kYXRhKCBcImlnZ3lcIiwgQCApXG5cblx0XHQjIGluaXQgZmFjZXRzXG5cdFx0QGZhY2V0cyA9IEBfcHJlcGFyZUZhY2V0cyggZmFjZXRzLCBvcHRpb25zIClcblx0XHRAcmVzdWx0cyA9IG5ldyBSZXN1bHRzKCBudWxsLCBvcHRpb25zIClcblxuXHRcdEByZXN1bHRzLm9uIFwiYWRkXCIsIEB0cmlnZ2VyQ2hhbmdlXG5cdFx0QHJlc3VsdHMub24gXCJyZW1vdmVcIiwgQHRyaWdnZXJDaGFuZ2Vcblx0XHRAcmVzdWx0cy5vbiBcImNoYW5nZVwiLCBAdHJpZ2dlckNoYW5nZVxuXG5cdFx0QHZpZXcgPSBuZXcgTWFpblZpZXcoIGVsOiBAJGVsLCBjb2xsZWN0aW9uOiBAZmFjZXRzLCByZXN1bHRzOiBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X3ByZXBhcmVFbDogKCBlbCApPT5cblxuXHRcdGlmIG5vdCBlbD9cblx0XHRcdHRocm93IEBfZXJyb3IoIFwiRU1JU1NJTkdFTFwiIClcblxuXHRcdGlmIF8uaXNTdHJpbmcoIGVsIClcblx0XHRcdGlmIG5vdCBlbC5sZW5ndGhcblx0XHRcdFx0dGhyb3cgQF9lcnJvciggXCJFRU1QVFlFTFNUUklOR1wiIClcblxuXHRcdFx0XyRlbCA9IEAkKCBlbCApXG5cdFx0XHRpZiBub3QgXyRlbD8ubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUlOVkFMSURFTFNUUklOR1wiIClcblxuXHRcdFx0cmV0dXJuIF8kZWxcblxuXHRcdGlmIGVsIGluc3RhbmNlb2YgalF1ZXJ5XG5cdFx0XHRpZiBub3QgZWwubGVuZ3RoXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRUVNUFRZRUxKUVVFUllcIiApXG5cblx0XHRcdCMgVE9ETyBoYW5kbGUgbXVsdGlwbGUgalF1ZXJ5IGVsZW1lbnRzIHRvIElHR1kgaW5zdGFuY2VzXG5cdFx0XHRpZiBlbC5sZW5ndGggPiAxXG5cdFx0XHRcdHRocm93IEBfZXJyb3IoIFwiRVNJWkVFTEpRVUVSWVwiIClcblxuXHRcdFx0cmV0dXJuIGVsXG5cblx0XHRpZiBlbCBpbnN0YW5jZW9mIEVsZW1lbnRcblx0XHRcdHJldHVybiBAJCggZWwgKVxuXG5cdFx0dGhyb3cgQF9lcnJvciggXCJFSU5WQUxJREVMVFlQRVwiIClcblxuXHRcdHJldHVyblxuXG5cdF9wcmVwYXJlRmFjZXRzOiAoIGZhY2V0cywgb3B0aW9ucz17fSApPT5cblx0XHRfcmV0ID0gW11cblx0XHRmb3IgZmFjZXQsIF9pZHggaW4gZmFjZXRzIHdoZW4gKCBfZmN0ID0gQF9jcmVhdGVGYWNldCggZmFjZXQgKSApP1xuXHRcdFx0X2ZjdC5faWR4ID0gX2lkeFxuXHRcdFx0X3JldC5wdXNoIF9mY3Rcblx0XHRcblx0XHRyZXR1cm4gbmV3IEZhY2V0cyggX3JldCwgb3B0aW9ucyApXG5cblx0X2NyZWF0ZUZhY2V0OiAoIGZhY2V0ICktPlxuXHRcdHN3aXRjaCBmYWNldC50eXBlLnRvTG93ZXJDYXNlKClcblx0XHRcdHdoZW4gXCJzdHJpbmdcIiB0aGVuIHJldHVybiBuZXcgRmN0U3RyaW5nKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwic2VsZWN0XCIgdGhlbiByZXR1cm4gbmV3IEZjdFNlbGVjdCggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImFycmF5XCIgdGhlbiByZXR1cm4gbmV3IEZjdEFycmF5KCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwibnVtYmVyXCIgdGhlbiByZXR1cm4gbmV3IEZjdE51bWJlciggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcInJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdFJhbmdlKCBmYWNldCwgbWFpbjogQCApXG5cdFx0XHR3aGVuIFwiZGF0ZXJhbmdlXCIgdGhlbiByZXR1cm4gbmV3IEZjdERhdGVSYW5nZSggZmFjZXQsIG1haW46IEAgKVxuXHRcdFx0d2hlbiBcImV2ZW50XCIgdGhlbiByZXR1cm4gbmV3IEZjdEV2ZW50KCBmYWNldCwgbWFpbjogQCApXG5cblx0YWRkRmFjZXQ6ICggZmFjZXQgKT0+XG5cdFx0aWYgbm90IEBmYWNldHM/XG5cdFx0XHRyZXR1cm5cblx0XHRpZiAoIF9mY3QgPSBAX2NyZWF0ZUZhY2V0KCBmYWNldCApICk/XG5cdFx0XHRAZmFjZXRzLmFkZCggX2ZjdCApXG5cdFx0cmV0dXJuIEBcblxuXHRfZXJyb3I6ICggdHlwZSwgZGF0YSA9IHt9ICk9PlxuXHRcdGlmIEBlcnJvcnNbIHR5cGUgXT9cblx0XHRcdF9tc2cgPSBAZXJyb3JzWyB0eXBlIF0oIGRhdGEgKVxuXHRcdGVsc2Vcblx0XHRcdF9tc2cgPSBcIi1cIlxuXHRcdF9lcnIgPSBuZXcgRXJyb3IoKVxuXHRcdF9lcnIubmFtZSA9IHR5cGVcblx0XHRfZXJyLm1lc3NhZ2UgPSBfbXNnXG5cdFx0cmV0dXJuIF9lcnJcblxuXHRnZXRRdWVyeTogPT5cblx0XHRyZXR1cm4gQHJlc3VsdHNcblxuXHR0cmlnZ2VyQ2hhbmdlOiA9PlxuXHRcdEB0cmlnZ2VyKCBcImNoYW5nZVwiLCBAcmVzdWx0cyApXG5cdFx0cmV0dXJuXG5cblx0X2luaXRFcnJvcnM6ID0+XG5cdFx0QGVycm9ycyA9IHt9XG5cdFx0Zm9yIF9rLCBfdG1wbCBvZiBARVJST1JTKClcblx0XHRcdEBlcnJvcnNbIF9rIF0gPSBfLnRlbXBsYXRlKCBfdG1wbCApXG5cdFx0cmV0dXJuXG5cblx0RVJST1JTOiAtPlxuXHRcdFwiRUlOVkFMSURFTFNUUklOR1wiOiBcIklmIHlvdSBkZWZpbmUgYSBgZWxgIGFzIFN0cmluZyBpdCBoYXMgdG8gYmUgYSB2YWxpZCBzZWxlY3RvciBmb3IgYW4gZXhpc3RpbmcgRE9NIGVsZW1lbnQuXCJcblx0XHRcIkVFTVBUWUVMU1RSSU5HXCI6IFwiVGhlIGBlbGAgYXMgc3RyaW5nIGNhbiBub3QgYmUgZW1wdHkuXCJcblx0XHRcIkVFTVBUWUVMSlFVRVJZXCI6IFwiVGhlIGBlbGAgYXMgak91ZXJ5IG9iamVjdCBjYW4gbm90IGJlIGFuIGVtcHR5IGNvbGxlY3Rpb24uXCJcblx0XHRcIkVTSVpFRUxKUVVFUllcIjogXCJUaGUgYGVsYCBhcyBqT3Vlcnkgb2JqZWN0IGNhbiBub3QgYmUgYSByZXN1bHQgb2Ygb25lIGVsLlwiXG5cdFx0XCJFSU5WQUxJREVMVFlQRVwiOiBcIlRoZSBgZWxgIGNhbiBvbmx5IGJlIGEgc2VsZWN0b3Igc3RyaW5nLCBkb20gZWxlbWVudCBvciBqUXVlcnkgY29sbGVjdGlvblwiXG5cdFx0XCJFTUlTU0lOR0VMXCI6IFwiUGxlYXNlIGRlZmluZSBhIHRhcmdldCBgZWxgXCJcblxubW9kdWxlLmV4cG9ydHMgPSBJR0dZXG4iLCIjIyNcbkVYQU1QTEUgVVNBR0VcblxuXHRwYXJlbnRDb2xsID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24uU3ViKClcblx0XG5cdCMgYnkgQXJyYXlcblx0c3ViQ29sbEEgPSBwYXJlbnRDb2xsLnN1YiggWyAxLCAyLCAzIF0gKVxuXHRcblx0IyBvciBieSBPYmplY3Rcblx0c3ViQ29sbE8gPSBwYXJlbnRDb2xsLnN1YiggeyBuYW1lOiBcIkZvb1wiLCBhZ2U6IDQyIH0gKVxuXHRcblx0IyBvciBieSBOdW1iZXJcblx0c3ViQ29sbE4gPSBwYXJlbnRDb2xsLnN1YiggMTMgKVxuXHRcblx0IyBvciBieSBGdW5jdGlvblxuXHRzdWJDb2xsRiA9IHBhcmVudENvbGwuc3ViKCAoKCBtb2RlbCApLT4gaWYgbW9kZWwuZ2V0KCBcImFnZVwiICkgPiAyMyApIClcblx0XG5cdCMgc3ViY29sbGVjdGlvbiBvZiBzdWJjb2xsZWN0aW9uXG5cdHN1YkNvbGxBX08gPSBzdWJDb2xsQS5zdWIoIHsgbmFtZTogXCJGb29cIiwgYWdlOiA0MiB9IClcblx0XG5cdCMgdXBkYXRlIHRoZSBmaWx0ZXIgb2YgYSBzdWJjb2xsZWN0aW9uLiBGb3IgdGhpcyBhIGByZXNldGAgd2lsbCBiZSBmaXJlZCBvbiB0aGUgc3ViY29sbGVjdGlvblxuXHRzdWJDb2xsQSA9IHN1YkNvbGxBLnVwZGF0ZVN1YkZpbHRlciggeyBuYW1lOiBcIkJhclwiLCBhZ2U6IDQyIH0gKVxuIyMjXG5cbmNsYXNzIEJhY2tib25lU3ViIGV4dGVuZHMgQmFja2JvbmUuQ29sbGVjdGlvblxuXHQjIyNcblx0IyMgc3ViXG5cdFxuXHRgY29sbGVjdGlvbi5zdWIoIGZpbHRlciApYFxuXHRcblx0R2VuZXJhdGUgYSBzdWItY29sbGVjdGlvbiBieSBhIGZpbHRlci5cblx0VGhlIG1vZGVscyB3aWxsIGJlIGRpc3RyaWJ1dGVkIHdpdGhpbiBhbGwgaW52b2x2ZWQgY29sbGVjdGlvbnMgdW5kZXIgY29uc2lkZXJhdGlvbiBvZiB0aGUgZmlsdGVyLlxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBDb2xsZWN0aW9uIH0gQSBTdWItQ29sbGVjdGlvbiBiYXNlZCBvbiB0aGUgZmlsdGVyXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0c3ViOiAoIGZpbHRlciApPT5cblx0XHRAc3ViQ29sbHMgb3I9IFtdXG5cdFx0Zm5GaWx0ZXIgPSBAX2dlbmVyYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKVxuXG5cdFx0IyBmaWx0ZXIgdGhlIGNvbGxlY3Rpb25cblx0XHRfbW9kZWxzID0gQGZpbHRlciBmbkZpbHRlclxuXHRcdCMgY3JlYXRlIHRoZSBzdWJjb2xsZWN0aW9uXG5cdFx0X3N1YiA9IG5ldyBAY29uc3RydWN0b3IoIF9tb2RlbHMsIEBfc3ViQ29sbGVjdGlvbk9wdGlvbnMoKSApXG5cblx0XHRfc3ViLl9wYXJlbnRDb2wgPSBAXG5cdFx0X3N1Yi5fZm5GaWx0ZXIgPSBmbkZpbHRlclxuXG5cdFx0IyBhZGQgZXZlbnQgaGFuZGxlcnMgdG8gZGlzdHJpYnV0ZSB0aGUgbW9kZWxzIHRocm91Z2ggdGhlIHN1YiBjb2xsZWN0aW9ucyB0cmVlXG5cblx0XHQjIHJlY2hlY2sgdGhlIG1vZGVsIGFnYWluc3QgdGhlIGZpbHRlciBvbiBjaGFuZ2Vcblx0XHRAb24gXCJjaGFuZ2VcIiwgXy5iaW5kKCAoIF9tICktPlxuXHRcdFx0dG9BZGQgPSBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRhZGRlZCA9IEBnZXQoIF9tICk/XG5cdFx0XHRpZiBhZGRlZCBhbmQgbm90IHRvQWRkXG5cdFx0XHRcdEByZW1vdmUoIF9tIClcblx0XHRcdGVsc2UgaWYgbm90IGFkZGVkIGFuZCB0b0FkZFxuXHRcdFx0XHRAYWRkKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyBhZGQgbW9kZWwgdG8gYmFzZSBjb2xsZWN0aW9uIG9uIGFkZCB0byBzdWJcblx0XHRfc3ViLm9uIFwiYWRkXCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgQClcblxuXHRcdCMgYWRkIG1vZGVsIHRvIHN1YiBjb2xsZWN0aW9uIG9uIGFkZCB0byBiYXNlIGlmIGl0IG1hdGNoZXMgdGhlIGZpbHRlclxuXHRcdEBvbiBcImFkZFwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRpZiBAX2ZuRmlsdGVyKCBfbSApXG5cdFx0XHRcdEBhZGQoIF9tIClcblx0XHRcdHJldHVyblxuXHRcdCwgX3N1YiApXG5cblx0XHQjIHJlbW92ZSBtb2RlbCBmcm9tIGJhc2UgY29sbGVjdGlvbiBvbiByZW1vdmUgb2Ygc3ViXG5cdFx0X3N1Yi5vbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHQjQHJlbW92ZSggX20gKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBAKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlbW92ZVwiLCBfLmJpbmQoICggX20gKS0+XG5cdFx0XHRAcmVtb3ZlKCBfbSApXG5cdFx0XHRyZXR1cm5cblx0XHQsIF9zdWIgKVxuXG5cdFx0IyByZW1vdmUgbW9kZWwgZnJvbSBiYXNlIGNvbGxlY3Rpb24gb24gcmVtb3ZlIG9mIHN1YlxuXHRcdEBvbiBcInJlc2V0XCIsIF8uYmluZCggKCBfbSApLT5cblx0XHRcdEB1cGRhdGVTdWJGaWx0ZXIoKVxuXHRcdFx0cmV0dXJuXG5cdFx0LCBfc3ViIClcblxuXHRcdCMgc3RvcmUgdGhlIHN1YmNvbGxlY3Rpb24gdW5kZXIgdGhlIGN1cnJlbnQgY29sbGVjdGlvblxuXHRcdEBzdWJDb2xscy5wdXNoKCBfc3ViIClcblxuXHRcdHJldHVybiBfc3ViXG5cdFxuXHQjIyNcblx0IyMgX3N1YkNvbGxlY3Rpb25PcHRpb25zXG5cdFxuXHRgY29sbGVjdGlvbi5fc3ViQ29sbGVjdGlvbk9wdGlvbnMoKWBcblx0XG5cdE92ZXJ3cml0YWJsZSBtZXRob2QgdG8gc2V0IHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGZvciBzdWIgY29sbGVjdGlvbnNcblx0XG5cdEByZXR1cm4geyBPYmplY3QgfSBUaGUgb3B0aW9ucyBvYmplY3Rcblx0XG5cdEBhcGkgcHJpdmF0ZVxuXHQjIyNcblx0X3N1YkNvbGxlY3Rpb25PcHRpb25zOiA9PlxuXHRcdF9vcHRzID1cblx0XHRcdGNvbXBhcmF0b3I6IEBjb21wYXJhdG9yXG5cdFx0cmV0dXJuIF9vcHRzXG5cblx0IyMjXG5cdCMjIHVwZGF0ZVN1YkZpbHRlclxuXHRcblx0YGNvbGxlY3Rpb24udXBkYXRlU3ViRmlsdGVyKCBmaWx0ZXIgKWBcblx0XG5cdE1ldGhvZCB0byB1cGRhdGUgdGhlIGZpbHRlciBvZiBhIHN1YmNvbGxlY3Rpb24uIFRoZW4gYWxsIG1vZGVscyB3aWxsIGJlIHJlc2V0ZSBieSB0aGUgbmV3IGZpbHRlci4gU28geW91IGhhdmUgdG8gbGlzdGVuIHRvIHRlaCByZXNldCBldmVudFxuXHRcblx0QHBhcmFtIHsgRnVuY3Rpb258QXJyYXl8U3RyaW5nfE51bWJlcnxPYmplY3QgfSBmaWx0ZXIgVGhlIGZpbHRlciB0byByZWR1Y2UgdGhlIGN1cnJlbnQgY29sbGVjdGlvbi4gQ2FuIGJlIGEgZnVuY3Rpb24gbGlrZSB1bmRlcnNjb3JlIGBfLmZpbHRlcmAgb3IgYW4gYXJyYXkgb2YgaWRzLCBhIHNpbmdsZSBpZCBhcyBzdHJpbmcgb3IgbnVtYmVyIG9yIGEgZmlsdGVyIG9iamVjdCBjb250YWluaW5ncyBrZXkgdmFsdWUgZmlsdGVycy5cblx0XG5cdEByZXR1cm4geyBTZWxmIH0gaXRzZWxmXG5cdFxuXHRAYXBpIHB1YmxpY1xuXHQjIyNcblx0dXBkYXRlU3ViRmlsdGVyOiAoIGZpbHRlciwgYXNSZXNldCA9IHRydWUgKT0+XG5cdFx0aWYgQF9wYXJlbnRDb2w/XG5cblx0XHRcdCMgc2V0IHRoZSBuZXcgZmlsdGVyIG1ldGhvZFxuXHRcdFx0QF9mbkZpbHRlciA9IEBfZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApIGlmIGZpbHRlcj9cblxuXHRcdFx0X21vZGVscyA9IEBfcGFyZW50Q29sLmZpbHRlciggQF9mbkZpbHRlciApXG5cblx0XHRcdCMgcmVzZXQgdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgbmV3IG1vZGVsc1xuXHRcdFx0aWYgYXNSZXNldFxuXHRcdFx0XHRAcmVzZXQoIF9tb2RlbHMgKVxuXHRcdFx0XHRyZXR1cm4gQFxuXG5cdFx0XHRuZXdpZHMgPSBfLnBsdWNrKCBfbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGN1cnJpZHMgPSBfLnBsdWNrKCBAbW9kZWxzLCBcImNpZFwiIClcblx0XHRcdGZvciByaWQgaW4gXy5kaWZmZXJlbmNlKCBjdXJyaWRzLCBuZXdpZHMgKVxuXHRcdFx0XHRAcmVtb3ZlKCByaWQgKVxuXHRcdFx0XHRcblx0XHRcdF9hZGRJZHMgPSBfLmRpZmZlcmVuY2UoIG5ld2lkcywgY3VycmlkcyApXG5cdFx0XHRmb3IgbWRsIGluIF9tb2RlbHMgd2hlbiBtZGwuY2lkIGluIF9hZGRJZHNcblx0XHRcdFx0QGFkZCggbWRsIClcblxuXHRcdHJldHVybiBAXG5cblxuXHQjIyNcblx0IyMgX2dlbmVyYXRlU3ViRmlsdGVyXG5cdFxuXHRgY29sbGVjdGlvbi5fZ2VuZXJhdGVTdWJGaWx0ZXIoIGZpbHRlciApYFxuXHRcblx0SW50ZXJuYWwgbWV0aG9kIHRoIGNvbnZlcnQgYSBmaWx0ZXIgYXJndW1lbnQgdG8gYSBmaWx0ZXIgZnVuY3Rpb25cblx0XG5cdEBwYXJhbSB7IEZ1bmN0aW9ufEFycmF5fFN0cmluZ3xOdW1iZXJ8T2JqZWN0IH0gZmlsdGVyIFRoZSBmaWx0ZXIgdG8gcmVkdWNlIHRoZSBjdXJyZW50IGNvbGxlY3Rpb24uIENhbiBiZSBhIGZ1bmN0aW9uIGxpa2UgdW5kZXJzY29yZSBgXy5maWx0ZXJgIG9yIGFuIGFycmF5IG9mIGlkcywgYSBzaW5nbGUgaWQgYXMgc3RyaW5nIG9yIG51bWJlciBvciBhIGZpbHRlciBvYmplY3QgY29udGFpbmluZ3Mga2V5IHZhbHVlIGZpbHRlcnMuXG5cdFxuXHRAcmV0dXJuIHsgRnVuY3Rpb24gfSBUaGUgZ2VuZXJhdGVkIGZpbHRlciBmdW5jdGlvblxuXHRcblx0QGFwaSBwcml2YXRlXG5cdCMjI1xuXHRfZ2VuZXJhdGVTdWJGaWx0ZXI6ICggZmlsdGVyICktPlxuXHRcdCMgY29uc3RydWN0IHRoZSBmaWx0ZXIgZnVuY3Rpb25cblx0XHRpZiBfLmlzRnVuY3Rpb24oIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9IGZpbHRlclxuXHRcdGVsc2UgaWYgXy5pc0FycmF5KCBmaWx0ZXIgKVxuXHRcdFx0Zm5GaWx0ZXIgPSAoIF9tICktPlxuXHRcdFx0XHRfbS5pZCBpbiBmaWx0ZXJcblx0XHRlbHNlIGlmIF8uaXNTdHJpbmcoIGZpbHRlciApIG9yIF8uaXNOdW1iZXIoIGZpbHRlciApXG5cdFx0XHRmbkZpbHRlciA9ICggX20gKS0+XG5cdFx0XHRcdF9tLmlkIGlzIGZpbHRlclxuXHRcdGVsc2Vcblx0XHRcdGZuRmlsdGVyID0gKCBfbSApLT5cblx0XHRcdFx0Zm9yIF9ubSwgX3ZsIG9mIGZpbHRlclxuXHRcdFx0XHRcdGlmIF9tLmdldCggX25tICkgaXNudCBfdmxcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXG5cdFx0cmV0dXJuIGZuRmlsdGVyXG5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmVTdWJcbiIsImNsYXNzIEZjdEFycmF5IGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X3N0cmluZ1wiIClcblx0U3ViVmlldzogcmVxdWlyZSggXCIuLi92aWV3cy9mYWNldHMvc3ViYXJyYXlcIiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RBcnJheVxuIiwiY2xhc3MgRmFjZXRCYXNlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwibmFtZVwiXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL2Jhc2VcIiApXG5cdFxuXHRjb25zdHJ1Y3RvcjogKCBhdHRycywgb3B0aW9ucyApLT5cblx0XHRAbWFpbiA9IG9wdGlvbnMubWFpblxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRkZWZhdWx0czogLT5cblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0bmFtZTogXCJuYW1lXCJcblx0XHRsYWJlbDogXCJEZXNjcmlwdGlvblwiXG5cdFx0c29ydDogMFxuXG5cdGdldExhYmVsOiA9PlxuXHRcdHJldHVybiBAZ2V0KCBcImxhYmVsXCIgKVxuXG5cdG1hdGNoOiAoIGNyaXQgKT0+XG5cdFx0X3MgPSAgQGdldCggXCJuYW1lXCIgKSArIFwiIFwiICsgQGdldCggXCJsYWJlbFwiIClcblx0XHRmb3VuZCA9IF9zLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggY3JpdC50b0xvd2VyQ2FzZSgpIClcblx0XHRyZXR1cm4gZm91bmQgPj0gMFxuXG5cdGNvbXBhcmF0b3I6ICggbWRsICktPlxuXHRcdHJldHVybiBtZGwuaWRcblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldEJhc2VcbiIsImNsYXNzIEZjdERhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9kYXRlcmFuZ2VcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCBzdXBlcixcblx0XHRcdG9wdHM6IHt9XG5cdFx0XHR2YWx1ZTogbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdERhdGVSYW5nZVxuIiwiY2xhc3MgRmN0RXZlbnQgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRfYmFzZVwiIClcblx0U3ViVmlldzogbnVsbFxuXHRvbmx5RXhlYzogdHJ1ZVxuXHRkZWZhdWx0czogPT5cblx0XHRyZXR1cm4gJC5leHRlbmQgc3VwZXIsXG5cdFx0XHRvcHRpb25zOiBbXVxuXHRcdFxuXHRleGVjOiAoICk9PlxuXHRcdEBtYWluLnRyaWdnZXIoIEBnZXQoIFwiZXZlbnRcIiApLCBAdG9KU09OKCkgKVxuXHRcdHJldHVyblxubW9kdWxlLmV4cG9ydHMgPSBGY3RFdmVudFxuIiwiY2xhc3MgRmN0TnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1Ym51bWJlclwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0TnVtYmVyXG4iLCJjbGFzcyBGY3RSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJyYW5nZVwiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0bWluOiBudWxsXG5cdFx0XHRtYXg6IG51bGxcblx0XHRcdHN0ZXA6IDFcblx0XHRcdHZhbHVlOiBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gRmN0UmFuZ2VcbiIsImNsYXNzIEZjdFNlbGVjdCBleHRlbmRzIHJlcXVpcmUoIFwiLi9mYWNldF9iYXNlXCIgKVxuXHRTdWJWaWV3OiByZXF1aXJlKCBcIi4uL3ZpZXdzL2ZhY2V0cy9zdWJzZWxlY3RcIiApXG5cdGRlZmF1bHRzOiA9PlxuXHRcdHJldHVybiAkLmV4dGVuZCggc3VwZXIsIHtcblx0XHRcdG9wdGlvbnM6IFtdXG5cdFx0XHR3YWl0Rm9yQXN5bmM6IHRydWVcblx0XHR9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZjdFNlbGVjdFxuIiwiY2xhc3MgRmN0U3RyaW5nIGV4dGVuZHMgcmVxdWlyZSggXCIuL2ZhY2V0X2Jhc2VcIiApXG5cdFN1YlZpZXc6IHJlcXVpcmUoIFwiLi4vdmlld3MvZmFjZXRzL3N1YnN0cmluZ1wiIClcblx0ZGVmYXVsdHM6ID0+XG5cdFx0cmV0dXJuICQuZXh0ZW5kIHN1cGVyLFxuXHRcdFx0b3B0aW9uczogW11cblxubW9kdWxlLmV4cG9ydHMgPSBGY3RTdHJpbmdcbiIsInNvcnRDb2xsID0gcmVxdWlyZSggXCJzb3J0Y29sbFwiIClcblxuZm5HZXQgPSAoIGVsLCBrZXkgKS0+XG5cdHJldHVybiBlbC5nZXQoIGtleSApXG5cbmNsYXNzIElnZ3lGYWNldHMgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFja2JvbmVfc3ViXCIgKVxuXHRcblx0Y29uc3RydWN0b3I6ICggbW9kZWxzLCBvcHRpb25zPXt9ICktPlxuXHRcdGlmIG5vdCBvcHRpb25zLmNvbXBhcmF0b3I/XG5cdFx0XHRfZm9yd2FyZCA9IHN3aXRjaCBvcHRpb25zLmRpclxuXHRcdFx0XHR3aGVuIFwiYXNjXCIgdGhlbiB0cnVlXG5cdFx0XHRcdHdoZW4gXCJkZXNjXCIgdGhlbiBmYWxzZVxuXHRcdFx0XHRlbHNlIHRydWVcblx0XHRcdFxuXHRcdFx0b3B0aW9ucy5jb21wYXJhdG9yID0gc29ydENvbGwoIFsgXCJzb3J0XCIgXS5jb25jYXQoIG9wdGlvbnMuc29ydGJ5IG9yIFwibmFtZVwiICksIHsgc29ydDogZmFsc2UsIFwiP1wiOiBfZm9yd2FyZCB9LCBmbkdldCApXG5cdFx0cmV0dXJuIHN1cGVyKCBtb2RlbHMsIG9wdGlvbnMgKVxuXHRcblx0X3N1YkNvbGxlY2N0aW9uT3B0aW9uczogPT5cblx0XHRvcHQgPSBzdXBlclxuXHRcdG9wdC5kaXIgPSBpZiBAZm9yd2FyZCB0aGVuIFwiYXNjXCIgZWxzZSBcImRlc2NcIlxuXHRcdHJldHVybiBvcHRcblx0XG5cdG1vZGVsSWQ6IChhdHRycyktPlxuXHRcdHJldHVybiBhdHRycy5uYW1lXG5cdFx0XG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lGYWNldHNcbiIsImNsYXNzIElnZ3lSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXHRpZEF0dHJpYnV0ZTogXCJuYW1lXCJcblx0ZGVmYXVsdHM6XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdG5hbWU6IG51bGxcblx0XHR2YWx1ZTogbnVsbFxuXG5jbGFzcyBJZ2d5UmVzdWx0cyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cblx0bW9kZWw6IElnZ3lSZXN1bHRcblx0aW5pdGlhbGl6ZTogKCBtZGxzLCBvcHRzICk9PlxuXHRcdGlmIG9wdHMubW9kaWZ5S2V5Py5sZW5ndGhcblx0XHRcdEBtb2RpZnlLZXkgPSBvcHRzLm1vZGlmeUtleVxuXHRcdHJldHVyblxuXHRwYXJzZTogKCBhdHRyLCBvcHRpb25zICk9PlxuXHRcdF9rZXkgPSBvcHRpb25zLl9mYWNldC5nZXQoIFwibW9kaWZ5S2V5XCIgKSBvciBAbW9kaWZ5S2V5IG9yIFwidmFsdWVcIlxuXHRcdF9tb2RpZnkgPSBvcHRpb25zLl9mYWNldD8uZ2V0KCBcIm1vZGlmeVwiIClcblx0XHRpZiBfbW9kaWZ5PyBhbmQgXy5pc0Z1bmN0aW9uKCBfbW9kaWZ5IClcblx0XHRcdGF0dHJbIF9rZXkgXSA9IF9tb2RpZnkoIGF0dHIudmFsdWUsIG9wdGlvbnMuX2ZhY2V0LCBhdHRyIClcblx0XHRyZXR1cm4gYXR0clxuXG5tb2R1bGUuZXhwb3J0cyA9IElnZ3lSZXN1bHRzXG4iLCJjbGFzcyBCYXNlUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0aWRBdHRyaWJ1dGU6IFwidmFsdWVcIlxuXHRnZXRMYWJlbDogPT5cblx0XHRyZXR1cm4gQGdldCggXCJsYWJlbFwiICkgb3IgQGdldCggQGlkQXR0cmlidXRlICkgb3IgXCItXCJcblxuXG5jbGFzcyBCYXNlUmVzdWx0cyBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYWNrYm9uZV9zdWJcIiApXG5cdG1vZGVsOiBCYXNlUmVzdWx0XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVJlc3VsdHNcbiIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGN1c3RvbSwgaWQsIHR4dCkge1xuYnVmLnB1c2goXCI8c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IHR4dCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxzcGFuIGNsYXNzPVxcXCJidG4td3JwXFxcIj48aVwiICsgKGphZGUuYXR0cihcImRhdGEtaWRcIiwgaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwicm0tcmVzdWx0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT5cIik7XG5pZiAoIGN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGlcIiArIChqYWRlLmF0dHIoXCJkYXRhLWlkXCIsIGlkLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcImVkaXQtcmVzdWx0LWJ0biBmYSBmYS1wZW5jaWxcXFwiPjwvaT5cIik7XG59XG5idWYucHVzaChcIjwvc3Bhbj5cIik7fS5jYWxsKHRoaXMsXCJjdXN0b21cIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmN1c3RvbTp0eXBlb2YgY3VzdG9tIT09XCJ1bmRlZmluZWRcIj9jdXN0b206dW5kZWZpbmVkLFwiaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmlkOnR5cGVvZiBpZCE9PVwidW5kZWZpbmVkXCI/aWQ6dW5kZWZpbmVkLFwidHh0XCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC50eHQ6dHlwZW9mIHR4dCE9PVwidW5kZWZpbmVkXCI/dHh0OnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwiZGF0ZXJhbmdlLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIG9wZXJhdG9yLCBvcGVyYXRvcnMsIHVuZGVmaW5lZCwgdmFsdWUpIHtcbmlmICggb3BlcmF0b3JzICYmIG9wZXJhdG9ycy5sZW5ndGgpXG57XG5idWYucHVzaChcIjxkaXYgY2xhc3M9XFxcIm9wZXJhdG9yXFxcIj48c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgXCJcIiArIChjaWQpICsgXCJvcFwiLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIpO1xuLy8gaXRlcmF0ZSBvcGVyYXRvcnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3BlcmF0b3JzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgb3AgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBvcCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIG9wZXJhdG9yID09IG9wICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IG9wKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+PC9kaXY+XCIpO1xufVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgdmFsdWUsIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucFxcXCIvPlwiKTt9LmNhbGwodGhpcyxcImNpZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguY2lkOnR5cGVvZiBjaWQhPT1cInVuZGVmaW5lZFwiP2NpZDp1bmRlZmluZWQsXCJvcGVyYXRvclwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3BlcmF0b3I6dHlwZW9mIG9wZXJhdG9yIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcjp1bmRlZmluZWQsXCJvcGVyYXRvcnNcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLm9wZXJhdG9yczp0eXBlb2Ygb3BlcmF0b3JzIT09XCJ1bmRlZmluZWRcIj9vcGVyYXRvcnM6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCxcInZhbHVlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC52YWx1ZTp0eXBlb2YgdmFsdWUhPT1cInVuZGVmaW5lZFwiP3ZhbHVlOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicmFuZ2VpbnBcXFwiPlwiKTtcbnZhciBfdmFscyA9IHZhbHVlID8gdmFsdWUgOiBbXVxuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl9mcm9tXCIsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgX3ZhbHNbMF0sIHRydWUsIGZhbHNlKSkgKyBcIiBjbGFzcz1cXFwibnVtYmVyLWlucCByYW5nZS1mcm9tXFxcIi8+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+LTwvc3Bhbj48aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBcIlwiICsgKGNpZCkgKyBcIl90b1wiLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIF92YWxzWzFdLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcIm51bWJlci1pbnAgcmFuZ2UtdG9cXFwiLz48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbjtyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgbXVsdGlwbGUsIG9wdGlvbkdyb3Vwcywgb3B0aW9ucywgdW5kZWZpbmVkLCB2YWx1ZSkge1xuYnVmLnB1c2goXCI8c2VsZWN0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgXCIgbXVsdGlwbGU9XFxcIm11bHRpcGxlXFxcIiBjbGFzcz1cXFwic2VsZWN0LWlucFxcXCI+XCIpO1xuaWYgKCBvcHRpb25Hcm91cHMpXG57XG4vLyBpdGVyYXRlIG9wdGlvbkdyb3Vwc1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRpb25Hcm91cHM7XG4gIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgJCRvYmoubGVuZ3RoKSB7XG5cbiAgICBmb3IgKHZhciBnbmFtZSA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgZ25hbWUgPCAkJGw7IGduYW1lKyspIHtcbiAgICAgIHZhciBvcHRzID0gJCRvYmpbZ25hbWVdO1xuXG5idWYucHVzaChcIjxvcHRncm91cFwiICsgKGphZGUuYXR0cihcImxhYmVsXCIsIGduYW1lLCB0cnVlLCBmYWxzZSkpICsgXCI+PC9vcHRncm91cD5cIik7XG4vLyBpdGVyYXRlIG9wdHNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0cztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBnbmFtZSBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIG9wdHMgPSAkJG9ialtnbmFtZV07XG5cbmJ1Zi5wdXNoKFwiPG9wdGdyb3VwXCIgKyAoamFkZS5hdHRyKFwibGFiZWxcIiwgZ25hbWUsIHRydWUsIGZhbHNlKSkgKyBcIj48L29wdGdyb3VwPlwiKTtcbi8vIGl0ZXJhdGUgb3B0c1xuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBvcHRzO1xuICBpZiAoJ251bWJlcicgPT0gdHlwZW9mICQkb2JqLmxlbmd0aCkge1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMCwgJCRsID0gJCRvYmoubGVuZ3RoOyBpZHggPCAkJGw7IGlkeCsrKSB7XG4gICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxvcHRpb25cIiArIChqYWRlLmF0dHIoXCJ2YWx1ZVwiLCBlbC52YWx1ZSwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJzZWxlY3RlZFwiLCAoIHZhbHVlICYmIHZhbHVlLmluZGV4T2YoIGVsLnZhbHVlICkgPj0gMCApLCB0cnVlLCBmYWxzZSkpICsgXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9vcHRpb24+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlXG57XG4vLyBpdGVyYXRlIG9wdGlvbnNcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gb3B0aW9ucztcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8b3B0aW9uXCIgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgZWwudmFsdWUsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwic2VsZWN0ZWRcIiwgKCB2YWx1ZSAmJiB2YWx1ZS5pbmRleE9mKCBlbC52YWx1ZSApID49IDAgKSwgdHJ1ZSwgZmFsc2UpKSArIFwiPlwiICsgKGphZGUuZXNjYXBlKG51bGwgPT0gKGphZGVfaW50ZXJwID0gZWwubGFiZWwpID8gXCJcIiA6IGphZGVfaW50ZXJwKSkgKyBcIjwvb3B0aW9uPlwiKTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICB2YXIgJCRsID0gMDtcbiAgICBmb3IgKHZhciBpZHggaW4gJCRvYmopIHtcbiAgICAgICQkbCsrOyAgICAgIHZhciBlbCA9ICQkb2JqW2lkeF07XG5cbmJ1Zi5wdXNoKFwiPG9wdGlvblwiICsgKGphZGUuYXR0cihcInZhbHVlXCIsIGVsLnZhbHVlLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInNlbGVjdGVkXCIsICggdmFsdWUgJiYgdmFsdWUuaW5kZXhPZiggZWwudmFsdWUgKSA+PSAwICksIHRydWUsIGZhbHNlKSkgKyBcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsLmxhYmVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L29wdGlvbj5cIik7XG4gICAgfVxuXG4gIH1cbn0pLmNhbGwodGhpcyk7XG5cbn1cbmJ1Zi5wdXNoKFwiPC9zZWxlY3Q+XCIpO1xuaWYgKCBtdWx0aXBsZSlcbntcbmJ1Zi5wdXNoKFwiPHNwYW4gY2xhc3M9XFxcImJ0biBidG4teHMgYnRuLXN1Y2Nlc3Mgc2VsZWN0LWNoZWNrIGZhIGZhLWNoZWNrXFxcIj48L3NwYW4+XCIpO1xufX0uY2FsbCh0aGlzLFwiY2lkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jaWQ6dHlwZW9mIGNpZCE9PVwidW5kZWZpbmVkXCI/Y2lkOnVuZGVmaW5lZCxcIm11bHRpcGxlXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5tdWx0aXBsZTp0eXBlb2YgbXVsdGlwbGUhPT1cInVuZGVmaW5lZFwiP211bHRpcGxlOnVuZGVmaW5lZCxcIm9wdGlvbkdyb3Vwc1wiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgub3B0aW9uR3JvdXBzOnR5cGVvZiBvcHRpb25Hcm91cHMhPT1cInVuZGVmaW5lZFwiP29wdGlvbkdyb3Vwczp1bmRlZmluZWQsXCJvcHRpb25zXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5vcHRpb25zOnR5cGVvZiBvcHRpb25zIT09XCJ1bmRlZmluZWRcIj9vcHRpb25zOnVuZGVmaW5lZCxcInVuZGVmaW5lZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudW5kZWZpbmVkOnR5cGVvZiB1bmRlZmluZWQhPT1cInVuZGVmaW5lZFwiP3VuZGVmaW5lZDp1bmRlZmluZWQsXCJ2YWx1ZVwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgudmFsdWU6dHlwZW9mIHZhbHVlIT09XCJ1bmRlZmluZWRcIj92YWx1ZTp1bmRlZmluZWQpKTs7cmV0dXJuIGJ1Zi5qb2luKFwiXCIpO1xufTsiLCJ2YXIgamFkZSA9IHJlcXVpcmUoXCJqYWRlL3J1bnRpbWVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdGVtcGxhdGUobG9jYWxzKSB7XG52YXIgYnVmID0gW107XG52YXIgamFkZV9taXhpbnMgPSB7fTtcbnZhciBqYWRlX2ludGVycDtcbjt2YXIgbG9jYWxzX2Zvcl93aXRoID0gKGxvY2FscyB8fCB7fSk7KGZ1bmN0aW9uIChjaWQsIGlucHZhbCkge1xuYnVmLnB1c2goXCI8aW5wdXRcIiArIChqYWRlLmF0dHIoXCJpZFwiLCBjaWQsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5hdHRyKFwidmFsdWVcIiwgaW5wdmFsLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInNlbGVjdG9yLWlucFxcXCIvPjx1bFwiICsgKGphZGUuYXR0cihcImlkXCIsIFwiXCIgKyAoY2lkKSArIFwidHlwZWxpc3RcIiwgdHJ1ZSwgZmFsc2UpKSArIFwiIGNsYXNzPVxcXCJ0eXBlbGlzdFxcXCI+PC91bD5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwiaW5wdmFsXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5pbnB2YWw6dHlwZW9mIGlucHZhbCE9PVwidW5kZWZpbmVkXCI/aW5wdmFsOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGFjdGl2ZUlkeCwgY3VzdG9tLCBsaXN0LCBxdWVyeSwgdW5kZWZpbmVkKSB7XG52YXIgYWRkID0gMDtcbmlmICggY3VzdG9tICYmIHF1ZXJ5KVxue1xuYWRkID0gMTtcbmJ1Zi5wdXNoKFwiPGxpPjxhIGRhdGEtaWQ9XFxcIl9jdXN0b21cXFwiIGRhdGEtaWR4PVxcXCItMVxcXCJcIiArIChqYWRlLmNscyhbe2FjdGl2ZTowID09PSBhY3RpdmVJZHh9XSwgW3RydWVdKSkgKyBcIj48aT5cXFwiXCIgKyAoKChqYWRlX2ludGVycCA9IHF1ZXJ5KSA9PSBudWxsID8gJycgOiBqYWRlX2ludGVycCkpICsgXCJcXFwiPC9pPjwvYT48L2xpPlwiKTtcbn1cbmlmICggbGlzdC5sZW5ndGgpXG57XG4vLyBpdGVyYXRlIGxpc3RcbjsoZnVuY3Rpb24oKXtcbiAgdmFyICQkb2JqID0gbGlzdDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIHZhciAkJGwgPSAwO1xuICAgIGZvciAodmFyIGlkeCBpbiAkJG9iaikge1xuICAgICAgJCRsKys7ICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGlcIiArIChqYWRlLmNscyhbZWwuY3NzY2xhc3NdLCBbdHJ1ZV0pKSArIFwiPjxhXCIgKyAoamFkZS5hdHRyKFwiZGF0YS1pZFwiLCBlbC5pZCwgdHJ1ZSwgZmFsc2UpKSArIChqYWRlLmF0dHIoXCJkYXRhLWlkeFwiLCBpZHgsIHRydWUsIGZhbHNlKSkgKyAoamFkZS5jbHMoW3thY3RpdmU6KGlkeCArIGFkZCkgPT09IGFjdGl2ZUlkeH1dLCBbdHJ1ZV0pKSArIFwiPlwiICsgKCgoamFkZV9pbnRlcnAgPSBlbC5sYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiPC9hPjwvbGk+XCIpO1xuICAgIH1cblxuICB9XG59KS5jYWxsKHRoaXMpO1xuXG59XG5lbHNlIGlmICggIWN1c3RvbSlcbntcbmJ1Zi5wdXNoKFwiPGxpPjxhIGNsYXNzPVxcXCJlbXB0eXJlc1xcXCI+bm8gcmVzdWx0IGZvciBcXFwiXCIgKyAoamFkZS5lc2NhcGUoKGphZGVfaW50ZXJwID0gcXVlcnkpID09IG51bGwgPyAnJyA6IGphZGVfaW50ZXJwKSkgKyBcIlxcXCI8L2E+PC9saT5cIik7XG59fS5jYWxsKHRoaXMsXCJhY3RpdmVJZHhcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmFjdGl2ZUlkeDp0eXBlb2YgYWN0aXZlSWR4IT09XCJ1bmRlZmluZWRcIj9hY3RpdmVJZHg6dW5kZWZpbmVkLFwiY3VzdG9tXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC5jdXN0b206dHlwZW9mIGN1c3RvbSE9PVwidW5kZWZpbmVkXCI/Y3VzdG9tOnVuZGVmaW5lZCxcImxpc3RcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmxpc3Q6dHlwZW9mIGxpc3QhPT1cInVuZGVmaW5lZFwiP2xpc3Q6dW5kZWZpbmVkLFwicXVlcnlcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnF1ZXJ5OnR5cGVvZiBxdWVyeSE9PVwidW5kZWZpbmVkXCI/cXVlcnk6dW5kZWZpbmVkLFwidW5kZWZpbmVkXCIgaW4gbG9jYWxzX2Zvcl93aXRoP2xvY2Fsc19mb3Jfd2l0aC51bmRlZmluZWQ6dHlwZW9mIHVuZGVmaW5lZCE9PVwidW5kZWZpbmVkXCI/dW5kZWZpbmVkOnVuZGVmaW5lZCkpOztyZXR1cm4gYnVmLmpvaW4oXCJcIik7XG59OyIsInZhciBqYWRlID0gcmVxdWlyZShcImphZGUvcnVudGltZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0ZW1wbGF0ZShsb2NhbHMpIHtcbnZhciBidWYgPSBbXTtcbnZhciBqYWRlX21peGlucyA9IHt9O1xudmFyIGphZGVfaW50ZXJwO1xuO3ZhciBsb2NhbHNfZm9yX3dpdGggPSAobG9jYWxzIHx8IHt9KTsoZnVuY3Rpb24gKGNpZCwgdmFsdWUpIHtcbmJ1Zi5wdXNoKFwiPGlucHV0XCIgKyAoamFkZS5hdHRyKFwiaWRcIiwgY2lkLCB0cnVlLCBmYWxzZSkpICsgKGphZGUuYXR0cihcInZhbHVlXCIsIHZhbHVlLCB0cnVlLCBmYWxzZSkpICsgXCIgY2xhc3M9XFxcInN0cmluZy1pbnBcXFwiLz5cIik7fS5jYWxsKHRoaXMsXCJjaWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLmNpZDp0eXBlb2YgY2lkIT09XCJ1bmRlZmluZWRcIj9jaWQ6dW5kZWZpbmVkLFwidmFsdWVcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnZhbHVlOnR5cGVvZiB2YWx1ZSE9PVwidW5kZWZpbmVkXCI/dmFsdWU6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG47dmFyIGxvY2Fsc19mb3Jfd2l0aCA9IChsb2NhbHMgfHwge30pOyhmdW5jdGlvbiAobGFiZWwsIHNlbGVjdGVkLCB1bmRlZmluZWQpIHtcbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwicm0tZmFjZXQtYnRuIGZhIGZhLXJlbW92ZVxcXCI+PC9kaXY+PHNwYW4gY2xhc3M9XFxcInN1YmxhYmVsXFxcIj5cIiArIChqYWRlLmVzY2FwZSgoamFkZV9pbnRlcnAgPSBsYWJlbCkgPT0gbnVsbCA/ICcnIDogamFkZV9pbnRlcnApKSArIFwiOjwvc3Bhbj48dWwgY2xhc3M9XFxcInN1YnJlc3VsdHNcXFwiPlwiKTtcbmlmICggc2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoKVxue1xuLy8gaXRlcmF0ZSBzZWxlY3RlZFxuOyhmdW5jdGlvbigpe1xuICB2YXIgJCRvYmogPSBzZWxlY3RlZDtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiAkJG9iai5sZW5ndGgpIHtcblxuICAgIGZvciAodmFyIGlkeCA9IDAsICQkbCA9ICQkb2JqLmxlbmd0aDsgaWR4IDwgJCRsOyBpZHgrKykge1xuICAgICAgdmFyIGVsID0gJCRvYmpbaWR4XTtcblxuYnVmLnB1c2goXCI8bGk+PHNwYW4gY2xhc3M9XFxcInR4dFxcXCI+XCIgKyAoamFkZS5lc2NhcGUobnVsbCA9PSAoamFkZV9pbnRlcnAgPSBlbCkgPyBcIlwiIDogamFkZV9pbnRlcnApKSArIFwiPC9zcGFuPjxpIGNsYXNzPVxcXCJybS1mYWNldC1idG4gZmEgZmEtcmVtb3ZlXFxcIj48L2k+PC9saT5cIik7XG4gICAgfVxuXG4gIH0gZWxzZSB7XG4gICAgdmFyICQkbCA9IDA7XG4gICAgZm9yICh2YXIgaWR4IGluICQkb2JqKSB7XG4gICAgICAkJGwrKzsgICAgICB2YXIgZWwgPSAkJG9ialtpZHhdO1xuXG5idWYucHVzaChcIjxsaT48c3BhbiBjbGFzcz1cXFwidHh0XFxcIj5cIiArIChqYWRlLmVzY2FwZShudWxsID09IChqYWRlX2ludGVycCA9IGVsKSA/IFwiXCIgOiBqYWRlX2ludGVycCkpICsgXCI8L3NwYW4+PGkgY2xhc3M9XFxcInJtLWZhY2V0LWJ0biBmYSBmYS1yZW1vdmVcXFwiPjwvaT48L2xpPlwiKTtcbiAgICB9XG5cbiAgfVxufSkuY2FsbCh0aGlzKTtcblxufVxuYnVmLnB1c2goXCI8L3VsPjxkaXYgY2xhc3M9XFxcInN1YnNlbGVjdFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1cXFwibG9hZGVyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY29nIGZhLXNwaW5cXFwiPjwvaT48L2Rpdj5cIik7fS5jYWxsKHRoaXMsXCJsYWJlbFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGgubGFiZWw6dHlwZW9mIGxhYmVsIT09XCJ1bmRlZmluZWRcIj9sYWJlbDp1bmRlZmluZWQsXCJzZWxlY3RlZFwiIGluIGxvY2Fsc19mb3Jfd2l0aD9sb2NhbHNfZm9yX3dpdGguc2VsZWN0ZWQ6dHlwZW9mIHNlbGVjdGVkIT09XCJ1bmRlZmluZWRcIj9zZWxlY3RlZDp1bmRlZmluZWQsXCJ1bmRlZmluZWRcIiBpbiBsb2NhbHNfZm9yX3dpdGg/bG9jYWxzX2Zvcl93aXRoLnVuZGVmaW5lZDp0eXBlb2YgdW5kZWZpbmVkIT09XCJ1bmRlZmluZWRcIj91bmRlZmluZWQ6dW5kZWZpbmVkKSk7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwidmFyIGphZGUgPSByZXF1aXJlKFwiamFkZS9ydW50aW1lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRlbXBsYXRlKGxvY2Fscykge1xudmFyIGJ1ZiA9IFtdO1xudmFyIGphZGVfbWl4aW5zID0ge307XG52YXIgamFkZV9pbnRlcnA7XG5cbmJ1Zi5wdXNoKFwiPGRpdiBjbGFzcz1cXFwiYWRkLWZhY2V0LWJ0biBmYSBmYS1wbHVzXFxcIj48L2Rpdj5cIik7O3JldHVybiBidWYuam9pbihcIlwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPVxuXHRcIkxFRlRcIjogMzdcblx0XCJSSUdIVFwiOiAzOVxuXHRcIlVQXCI6IDM4XG5cdFwiRE9XTlwiOiA0MFxuXHRcIkVTQ1wiOiBbIDIyOSwgMjcgXVxuXHRcIkVOVEVSXCI6IDEzXG5cdFwiVEFCXCI6IDlcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuXG5jbGFzcyBGYWNldFN1YnNCYXNlIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHRyZXN1bHRUZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9yZXN1bHRfYmFzZS5qYWRlXCIgKVxuXG5cdGluaXRpYWxpemU6ICggb3B0aW9ucyApPT5cblx0XHRAc3ViID0gb3B0aW9ucy5zdWJcblx0XHRAcmVzdWx0ID0gbmV3IFN1YlJlc3VsdHMoKVxuXHRcdHJldHVyblxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXG5cdGZvY3VzOiA9PlxuXHRcdEAkaW5wLmZvY3VzKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdF9saXN0LnB1c2ggbW9kZWwuZ2V0TGFiZWwoKVxuXG5cdFx0cmV0dXJuIFwiPGxpPlwiICsgX2xpc3Quam9pbiggXCI8L2xpPjxsaT5cIiApICsgXCI8L2xpPlwiXG5cdFx0XG5cdG9wZW46ID0+XG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEBpc09wZW4gPSB0cnVlXG5cdFx0QHRyaWdnZXIoIFwib3BlbmVkXCIgKVxuXHRcdHJldHVyblxuXG5cdGlucHV0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudC50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblx0XG5cdF9vbktleTogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQua2V5Q29kZSBpcyBLRVlDT0RFUy5UQUIgb3IgZXZudC5rZXlDb2RlIGluIEtFWUNPREVTLlRBQlxuXHRcdFx0QF9vblRhYkFjdGlvbiggZXZudCApXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblx0XHRcblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdGNpZDogQGNpZFxuXHRcdHZhbHVlOiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ID0+XG5cdFx0cmV0dXJuIFwiaW5wdXQjI3tAY2lkfVwiXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0QCRlbC5yZW1vdmVDbGFzcyggXCJjbG9zZWRcIiApXG5cdFx0QCRlbC5hZGRDbGFzcyggXCJvcGVuXCIgKVxuXHRcdEByZW5kZXIoKVxuXHRcdHBWaWV3Lm9wZW4oKVxuXHRcdHJldHVyblxuXHRcblx0cmVuZGVyOiA9PlxuXHRcdF90bXBsID0gQHRlbXBsYXRlKCAgQGdldFRlbXBsYXRlRGF0YSgpIClcblx0XHRAJGVsLmh0bWwoIF90bXBsIClcblx0XHRAJGlucCA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvcigpIClcblx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAX2hhc1RhYkxpc3RlbmVyKCB0cnVlIClcblx0XHRyZXR1cm5cblx0XG5cdF9oYXNUYWJFdmVudDogLT5cblx0XHRyZXR1cm4gXCJrZXlkb3duXCJcblx0XHRcblx0X2hhc1RhYkxpc3RlbmVyOiAtPlxuXHRcdHJldHVybiB0cnVlXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ICggZXZudCApPT5cblx0XHQkKCBkb2N1bWVudCApLm9mZiBAX2hhc1RhYkV2ZW50KCksIEBfb25LZXkgaWYgQF9oYXNUYWJMaXN0ZW5lciggZmFsc2UgKVxuXHRcdEAkZWwucmVtb3ZlQ2xhc3MoIFwib3BlblwiIClcblx0XHRAJGVsLmFkZENsYXNzKCBcImNsb3NlZFwiIClcblx0XHRAaXNPcGVuID0gZmFsc2Vcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgQHJlc3VsdCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHR2YWx1ZTogQGdldFZhbHVlKClcblxuXHRnZXRWYWx1ZTogPT5cblx0XHRyZXR1cm4gQCRpbnAudmFsKClcblxuXHRnZXRTZWxlY3RNb2RlbDogLT5cblx0XHRyZXR1cm4gU3ViUmVzdWx0cy5wcm90b3R5cGUubW9kZWxcblxuXHRfY2hlY2tTZWxlY3RFbXB0eTogKCBfdmFsICk9PlxuXHRcdGlmIF8uaXNFbXB0eSggX3ZhbCApIGFuZCBub3QgXy5pc051bWJlciggX3ZhbCApIGFuZCBub3QgXy5pc0Jvb2xlYW4oIF92YWwgKVxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0c2VsZWN0OiA9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBpZiBAX2NoZWNrU2VsZWN0RW1wdHkoIF92YWwgKVxuXHRcdEBzZXQoIF92YWwgKVxuXHRcdHJldHVyblxuXG5cdHNldDogKCB2YWwgKT0+XG5cdFx0X21vZGVsID0gQHJlc3VsdC5maXJzdCgpXG5cdFx0aWYgbm90IF9tb2RlbD9cblx0XHRcdF9Nb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IHZhbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRlbHNlXG5cdFx0XHRfbW9kZWwuc2V0KCB2YWx1ZTogdmFsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YnNCYXNlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbmNsYXNzIEZhY2V0U3Vic0RhdGVSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9kYXRlcmFuZ2UuamFkZVwiIClcblxuXHRmb3JjZWREYXRlUmFuZ2VPcHRzOiA9PlxuXHRcdG9wZW5zOiBcInJpZ2h0XCJcblxuXHRldmVudHM6ID0+XG5cdFx0cmV0dXJuXG5cblx0Zm9jdXM6ICgpPT5cblx0XHRpZiBub3QgQGRhdGVyYW5nZXBpY2tlcj9cblx0XHRcdF9vcHRzID0gXy5leHRlbmQoIHt9LCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCBAZm9yY2VkRGF0ZVJhbmdlT3B0cygpIClcblx0XHRcdEAkaW5wLmRhdGVyYW5nZXBpY2tlciggX29wdHMsIEBfZGF0ZVJldHVybiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyID0gQCRpbnAuZGF0YSggXCJkYXRlcmFuZ2VwaWNrZXJcIiApXG5cdFx0XHRAZGF0ZXJhbmdlcGlja2VyLmNvbnRhaW5lcj8uYWRkQ2xhc3MoIFwiZGF0ZXJhbmdlLWlnZ3lcIiApXG5cdFx0XHRcblx0XHRcdCMgcHJldmVudCBmcm9tIGhhbmRsaWNoIHRoZSBvdXRlcmNsaWNrIGV4aXQgZnJvbSBNYWluVmlld1xuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5jb250YWluZXIub24gXCJjbGlja1wiLCAoIGV2bnQgKS0+XG5cdFx0XHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0ZWxzZVxuXHRcdFx0QGRhdGVyYW5nZXBpY2tlci5lbGVtZW50ID0gQCRpbnBcblx0XHRcdEBkYXRlcmFuZ2VwaWNrZXIuc2hvdygpXG5cdFx0XHRcblx0XHRAJGlucC5vbiggXCJjYW5jZWwuZGF0ZXJhbmdlcGlja2VyXCIsIEBjbG9zZSApXG5cdFx0QCRpbnAub24oIFwiaGlkZS5kYXRlcmFuZ2VwaWNrZXJcIiwgQGNsb3NlIClcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0Y2xvc2U6ID0+XG5cdFx0c3VwZXJcblx0XHRAJGlucC5vZmYoIFwiY2FuY2VsLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdEAkaW5wLm9mZiggXCJoaWRlLmRhdGVyYW5nZXBpY2tlclwiLCBAY2xvc2UgKVxuXHRcdHJldHVyblxuXG5cdHJlbW92ZTogPT5cblx0XHRAZGF0ZXJhbmdlcGlja2VyPy5yZW1vdmUoKVxuXHRcdEBkYXRlcmFuZ2VwaWNrZXIgPSBudWxsXG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0cmVuZGVyUmVzdWx0OiA9PlxuXHRcdF9yZXMgPSBAZ2V0UmVzdWx0cygpXG5cblx0XHRfc3RhcnREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAwIF0gKVxuXHRcdF9lbmREYXRlID0gbW9tZW50KCBfcmVzLnZhbHVlWyAxIF0gKSBpZiBfcmVzLnZhbHVlWyAxIF0/XG5cblx0XHRfdGltZSA9IEBtb2RlbC5nZXQoIFwib3B0c1wiICkudGltZVBpY2tlclxuXG5cdFx0X3MgPSBcIjxsaT5cIlxuXHRcdF9zICs9IF9zdGFydERhdGUuZm9ybWF0KCAoIGlmIF90aW1lIHRoZW4gXCJMTExMXCIgZWxzZSBcIkxMXCIgKSApXG5cblx0XHRpZiBfZW5kRGF0ZT9cblx0XHRcdF9zICs9IFwiIC0gXCJcblx0XHRcdF9zICs9IF9lbmREYXRlLmZvcm1hdCggKCBpZiBfdGltZSB0aGVuIFwiTExMTFwiIGVsc2UgXCJMTFwiICkgKVxuXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3Ncblx0XG5cdF9oYXNUYWJMaXN0ZW5lcjogLT5cblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9kYXRlUmV0dXJuOiAoIEBzdGFydERhdGUsIEBlbmREYXRlICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwidmFsdWVcIiwgQGdldFZhbHVlKCBmYWxzZSApIClcblx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0cmV0dXJuIHN1cGVyXG5cblx0Z2V0VmFsdWU6ICggcHJlZGVmID0gdHJ1ZSApPT5cblx0XHRpZiBwcmVkZWZcblx0XHRcdF9wcmVkZWZWYWwgPSBAbW9kZWwuZ2V0KCBcInZhbHVlXCIgKVxuXHRcdFx0aWYgX3ByZWRlZlZhbD9cblx0XHRcdFx0aWYgbm90IF8uaXNBcnJheSggX3ByZWRlZlZhbCApXG5cdFx0XHRcdFx0X3ByZWRlZlZhbCA9ICBbIF9wcmVkZWZWYWwgXVxuXHRcdFx0XHRbIEBzdGFydERhdGUsIEBlbmREYXRlIF0gPSBfcHJlZGVmVmFsXG5cdFx0XHRcdHJldHVybiBfcHJlZGVmVmFsXG5cdFx0X291dCA9IFsgQHN0YXJ0RGF0ZS52YWx1ZU9mKCkgXVxuXHRcdF9vdXQucHVzaCBAZW5kRGF0ZS52YWx1ZU9mKCkgaWYgQGVuZERhdGU/XG5cdFx0cmV0dXJuIF9vdXRcblxuXHRzZWxlY3Q6ID0+XG5cdFx0X01vZGVsQ29uc3QgPSBAZ2V0U2VsZWN0TW9kZWwoKVxuXHRcdF9tb2RlbCA9IG5ldyBfTW9kZWxDb25zdCggdmFsdWU6IEBnZXRWYWx1ZSgpIClcblx0XHRAcmVzdWx0LmFkZCggX21vZGVsIClcblx0XHRAdHJpZ2dlciggXCJzZWxlY3RlZFwiLCBfbW9kZWwgKVxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzRGF0ZVJhbmdlXG4iLCJLRVlDT0RFUyA9IHJlcXVpcmUoIFwiLi4vLi4vdXRpbHMva2V5Y29kZXNcIiApXG5cbm5lYXJlc3QgPSAobiwgdiktPlxuXHRuID0gbiAvIHZcblx0biA9IE1hdGgucm91bmQobikgKiB2XG5cdHJldHVybiBuXG5cdFxucHJlY2lzaW9uID0gKG4sIGRwKS0+XG5cdGRwID0gTWF0aC5wb3coMTAsIGRwKVxuXHRuID0gbiAqIGRwXG5cdG4gPSBNYXRoLnJvdW5kKG4pXG5cdG4gPSBuIC8gZHBcblx0cmV0dXJuIG5cblxuY2xhc3MgRmFjZXROdW1iZXJCYXNlIGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QHNldE51bWJlciA9IF8udGhyb3R0bGUoIEBfc2V0TnVtYmVyLCAzMDAsIHtsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IGZhbHNlfSApXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblxuXG5cblx0aW5wdXQ6ICggZXZudCApPT5cblx0XHRfJGVsID0gJCggZXZudC5jdXJyZW50VGFyZ2V0IClcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXlkb3duXCJcblx0XHRcdHN3aXRjaCBldm50LmtleUNvZGVcblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5VUFxuXHRcdFx0XHRcdEBjcmVtZW50KCBAbW9kZWwuZ2V0KCBcInN0ZXBcIiApLCBfJGVsIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0d2hlbiBLRVlDT0RFUy5ET1dOXG5cdFx0XHRcdFx0QGNyZW1lbnQoIEBtb2RlbC5nZXQoIFwic3RlcFwiICkgKiAtMSwgXyRlbCApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0KClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBldm50LnR5cGUgaXMgXCJrZXl1cFwiXG5cdFx0XHRfdiA9IGV2bnQuY3VycmVudFRhcmdldC52YWx1ZS5yZXBsYWNlKCAvW15cXGRdP1teLVxcZF0rL2csIFwiXCIgKVxuXHRcdFx0X3YgPSBwYXJzZUludCggX3YsIDEwIClcblx0XHRcdCBcblx0XHRcdEBzZXROdW1iZXIoIF92LCBfJGVsIClcblx0XHRyZXR1cm5cblxuXHRjcmVtZW50OiAoIGNoYW5nZSwgZWwgPSBAJGlucCApPT5cblx0XHRfdiA9IGVsLnZhbCgpXG5cdFx0aWYgbm90IF92Py5sZW5ndGhcblx0XHRcdF92ID0gQG1vZGVsLmdldCggXCJ2YWx1ZVwiIClcblx0XHRlbHNlXG5cdFx0XHRfdiA9IHBhcnNlSW50KCBfdiwgMTAgKVxuXG5cdFx0QF9zZXROdW1iZXIoIF92ICsgY2hhbmdlLCBlbCApXG5cdFx0cmV0dXJuXG5cblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3YgPSBAJGlucC52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdHJldHVybiBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRfc2V0TnVtYmVyOiAoIF92LCBlbCA9IEAkaW5wICk9PlxuXHRcdGlmIGlzTmFOKCBfdiApXG5cdFx0XHQjQCRpbnAudmFsKFwiXCIpXG5cdFx0XHRyZXR1cm5cblxuXHRcdF9jdXJyID0gZWwudmFsKClcblxuXHRcdF92ID0gQHZhbHVlQnlEZWZpbml0aW9uKCBfdilcblx0XHRpZiBfY3VyciAhPSBfdi50b1N0cmluZygpXG5cdFx0XHRlbC52YWwoIF92IClcblx0XHRyZXR1cm5cblxuXHR2YWx1ZUJ5RGVmaW5pdGlvbjogKCBfdmFsdWUgKS0+XG5cdFx0bWF4ID0gQG1vZGVsLmdldCggXCJtYXhcIiApXG5cdFx0bWluID0gQG1vZGVsLmdldCggXCJtaW5cIiApXG5cdFx0c3RlcCA9IEBtb2RlbC5nZXQoIFwic3RlcFwiIClcblx0XHRcblx0XHQjIGZpeCByZXZlcnNlZCBtaW4vbWF4IHNldHRpbmdcblx0XHRpZiBtaW4gPiBtYXhcblx0XHRcdF90bXAgPSBtaW5cblx0XHRcdG1pbiA9IG1heFxuXHRcdFx0bWF4ID0gX3RtcFxuXHRcdFxuXHRcdCMgb24gZXh4ZWRkaW5nIHRoZSBsaW1pdHMgdXNlIHRoZSBsaW1pdFxuXHRcdGlmIG1pbj8gYW5kIF92YWx1ZSA8IG1pblxuXHRcdFx0cmV0dXJuIG1pblxuXHRcdGlmIG1heD8gYW5kIF92YWx1ZSA+IG1heFxuXHRcdFx0cmV0dXJuIG1heFxuXG5cdFx0IyBzZWFyY2ggdGhlIG5lYXJlc3QgX3ZhbHVlIHRvIHRoZSBzdGVwXG5cdFx0aWYgc3RlcCBpc250IDFcblx0XHRcdF92YWx1ZSA9IG5lYXJlc3QoIF92YWx1ZSwgc3RlcCApXG5cdFx0XG5cdFx0IyBjYWxjIHRoZSBwcmVjaXNpb24gYnkgc3RlcFxuXHRcdF9wcmVjaXNpb24gPSBNYXRoLm1heCggMCwgTWF0aC5jZWlsKCBNYXRoLmxvZyggMS9zdGVwICkgLyBNYXRoLmxvZyggMTAgKSApIClcblx0XHRpZiBfcHJlY2lzaW9uID4gMFxuXHRcdFx0X3ZhbHVlID0gcHJlY2lzaW9uKCBfdmFsdWUsIF9wcmVjaXNpb24gKVxuXHRcdGVsc2Vcblx0XHRcdF92YWx1ZSA9IE1hdGgucm91bmQoIF92YWx1ZSApXG5cdFx0XHRcblx0XHRyZXR1cm4gX3ZhbHVlXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNldE51bWJlckJhc2VcbiIsIlN1YlJlc3VsdHMgPSByZXF1aXJlKCBcIi4uLy4uL21vZGVscy9zdWJyZXN1bHRzXCIgKVxuS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uLy4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTdHJpbmdPcHRpb24gZXh0ZW5kcyBTdWJSZXN1bHRzLnByb3RvdHlwZS5tb2RlbFxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIFN0cmluZ09wdGlvbnMgZXh0ZW5kcyBTdWJSZXN1bHRzXG5cdG1vZGVsOiBTdHJpbmdPcHRpb25cblxuXG5jbGFzcyBBcnJheU9wdGlvbiBleHRlbmRzIEJhY2tib25lLk1vZGVsXG5cdGlkQXR0cmlidXRlOiBcInZhbHVlXCJcblx0Z2V0TGFiZWw6ID0+XG5cdFx0cmV0dXJuIEBnZXQoIFwibGFiZWxcIiApIG9yIEBnZXQoIFwibmFtZVwiICkgb3IgXCItXCJcblxuXHRtYXRjaDogKCBjcml0ICk9PlxuXHRcdF9zID0gIEBnZXQoIFwidmFsdWVcIiApICsgXCIgXCIgKyBAZ2V0KCBcImxhYmVsXCIgKVxuXHRcdGZvdW5kID0gX3MudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBjcml0LnRvTG93ZXJDYXNlKCkgKVxuXHRcdHJldHVybiBmb3VuZCA+PSAwXG5cbmNsYXNzIEFycmF5T3B0aW9ucyBleHRlbmRzIHJlcXVpcmUoIFwiLi4vLi4vbW9kZWxzL2JhY2tib25lX3N1YlwiIClcblx0bW9kZWw6IEFycmF5T3B0aW9uXG5cbmNsYXNzIEZhY2V0U3ViQXJyYXkgZXh0ZW5kcyByZXF1aXJlKCBcIi4uL3NlbGVjdG9yXCIgKVxuXHRcblx0dGVtcGxhdGVSZXNMaTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9hcnJheV9yZXN1bHRsaS5qYWRlXCIgKVxuXHRcblx0b3B0RGVmYXVsdDpcblx0XHRsYWJlbDogXCItXCJcblx0XHR2YWx1ZTogXCItXCJcblxuXHRzZWxlY3RDb3VudDogMFxuXG5cdG9wdENvbGw6IFN0cmluZ09wdGlvbnNcblx0XG5cdGV2ZW50czogPT5cblx0XHRfZXZudHMgPSBzdXBlclxuXHRcdCNpZiBub3QgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRfZXZudHNbIFwiYmx1ciBpbnB1dCMje0BjaWR9XCIgXSA9IFwiY2xvc2VcIlxuXHRcdHJldHVybiBfZXZudHNcblx0XG5cdGNsb3NlOiAoIGV2bnQgKT0+XG5cdFx0aWYgQGxvYWRpbmdcblx0XHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRcdGV2bnQ/LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAZm9jdXMoKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRybVJlczogKCBldm50ICk9PlxuXHRcdF9pZCA9ICQoIGV2bnQudGFyZ2V0ICk/LmRhdGEoIFwiaWRcIiApXG5cdFx0QHJlc3VsdC5yZW1vdmUoIF9pZCApXG5cdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRlZGl0UmVzOiAoIGV2bnQgKT0+XG5cdFx0X2lkID0gJCggZXZudC50YXJnZXQgKT8uZGF0YSggXCJpZFwiIClcblx0XHRfdiA9IEBfZWRpdHZhbCA9IEByZXN1bHQuZ2V0KCBfaWQgKS5nZXQoIFwidmFsdWVcIiApXG5cdFx0QHJlc3VsdC5yZW1vdmUoIF9pZCApXG5cdFx0QHNlYXJjaGNvbGwucmVtb3ZlKCBfaWQgKVxuXHRcdEBzdWIucmVvcGVuKClcblx0XHRjb25zb2xlLmxvZyBAc2VhcmNoY29sbFxuXHRcdEBzZWFyY2goX3YpXG5cdFx0cmV0dXJuXG5cdFxuXHRnZXRUZW1wbGF0ZURhdGE6ID0+XG5cdFx0X2RhdGEgPSBzdXBlclxuXHRcdGlmIEBfZWRpdHZhbD8ubGVuZ3RoXG5cdFx0XHRfZGF0YS5pbnB2YWwgPSBAX2VkaXR2YWxcblx0XHRcdEBfZWRpdHZhbCA9IG51bGxcblx0XHRyZXR1cm4gX2RhdGFcblx0XG5cdHJlbmRlclJlc3VsdDogKCByZW5kZXJFbXB0eSA9IGZhbHNlICk9PlxuXHRcdGlmIHJlbmRlckVtcHR5XG5cdFx0XHRyZXR1cm4gXCI8bGk+PC9saT5cIlxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAcmVzdWx0Lm1vZGVsc1xuXHRcdFx0X2xpc3QucHVzaCBAdGVtcGxhdGVSZXNMaSggdHh0OiBtb2RlbC5nZXRMYWJlbCgpLCBpZDogbW9kZWwuaWQsIGN1c3RvbTogbW9kZWwuZ2V0KCBcImN1c3RvbVwiICkgIClcblxuXHRcdHJldHVybiBcIjxsaT5cIiArIF9saXN0LmpvaW4oIFwiPC9saT48bGk+XCIgKSArIFwiPC9saT5cIlxuXHRcblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAbG9hZGluZyA9IGZhbHNlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApP1xuXHRcdFx0QHNlbGVjdENvdW50ID0gb3B0aW9ucy5tb2RlbC5nZXQoIFwiY291bnRcIiApXG5cdFx0b3B0aW9ucy5jdXN0b20gPSB0cnVlXG5cdFx0aWYgb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKT9cblx0XHRcdG9wdGlvbnMuY3VzdG9tID0gQm9vbGVhbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwiY3VzdG9tXCIgKSApXG5cdFx0XHRcblx0XHRAY29sbGVjdGlvbiA9IEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiggb3B0aW9ucy5tb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdFxuXHRcdGlmIG5vdCBvcHRpb25zLmN1c3RvbSBhbmQgQHNlbGVjdENvdW50IDw9IDBcblx0XHRcdEBzZWxlY3RDb3VudCA9IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0XG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdFxuXHRcdEByZXN1bHQub24gXCJyZW1vdmVcIiwgKCBtZGwsIGNvbGwgKT0+XG5cdFx0XHRpZiBjb2xsLmxlbmd0aFxuXHRcdFx0XHRvcHRpb25zLnN1Yi5yZW5kZXJSZXN1bHQoKVxuXHRcdFx0QHNlYXJjaGNvbGwuYWRkKCBtZGwgKVxuXHRcdFx0QHRyaWdnZXIoIFwicmVtb3ZlZFwiLCBtZGwgKVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFx0XG5cdHNlbGVjdDogPT5cblx0XHRpZiBAbG9hZGluZ1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRfdmFscyA9IEBtb2RlbC5nZXQoIFwidmFsdWVcIiApXG5cdFx0aWYgX3ZhbHM/IGFuZCBub3QgXy5pc0FycmF5KCBfdmFscyApXG5cdFx0XHRfdmFscyA9IFsgX3ZhbHMgXVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGZvciBfdmFsIGluICggaWYgQHNlbGVjdENvdW50IDw9IDAgdGhlbiBfdmFscyBlbHNlIF92YWxzWy4uLkBzZWxlY3RDb3VudF0gKVxuXHRcdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX3ZhbCApXG5cdFx0XHRpZiBub3QgX21kbD9cblx0XHRcdFx0X21kbCA9IG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IF92YWwsIGN1c3RvbTogdHJ1ZSApXG5cdFx0XHRAc2VsZWN0ZWQoIF9tZGwgKVxuXHRcdFxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRldm50LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0c2VhcmNoQ29udGVudCA9IEAkaW5wLnZhbCgpXG5cdFx0aWYgc2VhcmNoQ29udGVudD8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0QWN0aXZlKClcblx0XHRcdHJldHVyblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdF9jcmVhdGVPcHRpb25Db2xsZWN0aW9uOiAoIG9wdGlvbnMgKT0+XG5cdFx0aWYgXy5pc0Z1bmN0aW9uKCBvcHRpb25zIClcblx0XHRcdEBsb2FkaW5nID0gdHJ1ZVxuXHRcdFx0X2NvbGwgPSBuZXcgQG9wdENvbGwoIFtdIClcblx0XHRcdFxuXHRcdFx0c2V0VGltZW91dCggPT5cblx0XHRcdFx0QCRlbC5wYXJlbnQoKS5hZGRDbGFzcyggXCJsb2FkaW5nXCIgKVxuXHRcdFx0XHRvcHRpb25zIEByZXN1bHQsIEBtb2RlbCwgKCBhT3B0cyApPT5cblx0XHRcdFx0XHRmb3IgX29wdCwgaWR4IGluIGFPcHRzXG5cdFx0XHRcdFx0XHRhT3B0c1tpZHhdID0gXy5leHRlbmQoIHt9LCBAb3B0RGVmYXVsdCwgX29wdCwgeyBjdXN0b206IGZhbHNlIH0gKVxuXHRcdFx0XHRcdF9jb2xsLmFkZCggYU9wdHMgKVxuXHRcdFx0XHRcdEBsb2FkaW5nID0gZmFsc2Vcblx0XHRcdFx0XHRAJGVsLnBhcmVudCgpLnJlbW92ZUNsYXNzKCBcImxvYWRpbmdcIiApXG5cdFx0XHRcdFx0QHNlbGVjdCgpXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XG5cdFx0XHQsIDAgKVxuXHRcdFx0cmV0dXJuIF9jb2xsXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6IG9wdCwgbGFiZWw6IG9wdCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3Qob3B0KVxuXHRcdFx0XHRfb3B0cy5wdXNoIF8uZXh0ZW5kKCB7fSwgQG9wdERlZmF1bHQsIG9wdCApXG5cdFx0cmV0dXJuIG5ldyBAb3B0Q29sbCggX29wdHMgKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJBcnJheVxuIiwiY2xhc3MgRmFjZXRTdWJzTnVtYmVyIGV4dGVuZHMgcmVxdWlyZSggXCIuL251bWJlcl9iYXNlXCIgKVxuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi8uLi90bXBscy9udW1iZXIuamFkZVwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0gc3VwZXJcblx0XHQjaWYgbm90IEBtb2RlbC5nZXQoIFwib3BlcmF0b3JzXCIgKT8ubGVuZ3RoXG5cdFx0X2V2bnRzWyBcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCIgXSA9IFwic2VsZWN0XCJcblx0XHRyZXR1cm4gX2V2bnRzXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0aWYgQG1vZGVsLmdldCggXCJvcGVyYXRvcnNcIiApPy5sZW5ndGhcblx0XHRcdEAkaW5wT3AgPSBAJGVsLmZpbmQoIFwic2VsZWN0IyN7QGNpZH1vcFwiIClcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggeyB3aWR0aDogXCJhdXRvXCIgfSApXG5cdFx0XHRAJGlucE9wLm9uKCBcInNlbGVjdDI6Y2xvc2VcIiwgQF9vcFNlbGVjdGVkIClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ICggcmVuZGVyRW1wdHkgPSBmYWxzZSApPT5cblx0XHRpZiByZW5kZXJFbXB0eVxuXHRcdFx0cmV0dXJuIFwiPGxpPjwvbGk+XCJcblx0XHRfcmVzID0gQGdldFJlc3VsdHMoKVxuXHRcdF9zID0gXCI8bGk+XCJcblx0XHRfcyArPSBfcmVzLm9wZXJhdG9yICsgXCIgXCIgaWYgX3Jlcy5vcGVyYXRvcj9cblx0XHRfcyArPSBfcmVzLnZhbHVlXG5cdFx0X3MgKz0gXCI8L2xpPlwiXG5cblx0XHRyZXR1cm4gX3NcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdGlmIEAkaW5wT3A/XG5cdFx0XHRAJGlucE9wLnNlbGVjdDIoIFwiZGVzdHJveVwiIClcblx0XHRcdEAkaW5wT3AucmVtb3ZlKClcblx0XHRcdEAkaW5wT3AgPSBudWxsXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XHRcblx0c2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0aWYgZXZudD8ucmVsYXRlZFRhcmdldD9cblx0XHRcdF9wb3NXcnAgPSBAZWwuY29tcGFyZURvY3VtZW50UG9zaXRpb24oIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgKVxuXHRcdFx0aWYgbm90ICggX3Bvc1dycCBpcyAwIG9yIF9wb3NXcnAgLSAxNiA+PSAwIClcblx0XHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBldm50PyBhbmQgKCBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wLmdldCgwKSBvciBldm50Py5yZWxhdGVkVGFyZ2V0IGlzIEAkaW5wT3A/LmdldCgwKSApXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRpZiBAJGlucE9wP1xuXHRcdFx0QG1vZGVsLnNldCggeyBvcGVyYXRvcjogQCRpbnBPcC52YWwoKSB9IClcblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblxuXHRfb3BTZWxlY3RlZDogPT5cblx0XHRAc2VsZWN0ZWRPUCA9IHRydWVcblx0XHRAZm9jdXMoKVxuXHRcdHJldHVyblxuXG5cdGZvY3VzOiAoIGlucCA9IGZhbHNlICk9PlxuXHRcdGlmIEAkaW5wT3A/IGFuZCBub3QgQHNlbGVjdGVkT1Bcblx0XHRcdEAkaW5wT3Auc2VsZWN0MiggXCJvcGVuXCIgKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRfb2xkT3AgPSBAcmVzdWx0LmZpcnN0KClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0VGVtcGxhdGVEYXRhOiA9PlxuXHRcdHJldHVybiBfLmV4dGVuZCggc3VwZXIsIHsgb3BlcmF0b3JzOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yc1wiICksIG9wZXJhdG9yOiBAbW9kZWwuZ2V0KCBcIm9wZXJhdG9yXCIgKX0gKVxuXG5cdF9vblRhYkFjdGlvbjogKCBldm50ICk9PlxuXHRcdF92YWwgPSBAZ2V0VmFsdWUoKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRpZiBub3QgaXNOYU4oIF92YWwgKVxuXHRcdFx0QHNlbGVjdCgpXG5cdFx0cmV0dXJuXG5cdFx0XG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0aWYgQCRpbnBPcD9cblx0XHRcdF9yZXQgPVxuXHRcdFx0XHR2YWx1ZTogQGdldFZhbHVlKClcblx0XHRcdFx0b3BlcmF0b3I6IEAkaW5wT3AudmFsKClcblx0XHRlbHNlXG5cdFx0XHRfcmV0ID1cblx0XHRcdFx0dmFsdWU6IEBnZXRWYWx1ZSgpXG5cdFx0cmV0dXJuIF9yZXRcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzTnVtYmVyXG4iLCJjbGFzcyBGYWNldFN1YnNSYW5nZSBleHRlbmRzIHJlcXVpcmUoIFwiLi9udW1iZXJfYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvcmFuZ2UuamFkZVwiIClcblxuXHRfZ2V0SW5wU2VsZWN0b3I6ICggZXh0ID0gXCJfZnJvbVwiICk9PlxuXHRcdHJldHVybiBcImlucHV0IyN7QGNpZH0je2V4dH1cIlxuXG5cdGV2ZW50czogPT5cblx0XHRcImtleXVwICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImtleWRvd24gI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5dXAgI3tAX2dldElucFNlbGVjdG9yKCBcIl90b1wiICl9XCI6IFwiaW5wdXRcIlxuXHRcdFwia2V5ZG93biAje0BfZ2V0SW5wU2VsZWN0b3IoIFwiX3RvXCIgKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcInNlbGVjdFwiXG5cdFx0XCJibHVyICN7QF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApfVwiOiBcInNlbGVjdFwiXG5cblx0cmVuZGVyUmVzdWx0OiAoIHJlbmRlckVtcHR5ID0gZmFsc2UgKT0+XG5cdFx0aWYgcmVuZGVyRW1wdHlcblx0XHRcdHJldHVybiBcIjxsaT48L2xpPlwiXG5cdFx0X3JlcyA9IEBnZXRSZXN1bHRzKClcblx0XHRyZXR1cm4gXCI8bGk+XCIgK19yZXMudmFsdWUuam9pbiggXCIgLSBcIiApICsgXCI8L2xpPlwiXG5cblx0cmVuZGVyOiA9PlxuXHRcdHN1cGVyXG5cdFx0QCRpbnBUbyA9IEAkZWwuZmluZCggQF9nZXRJbnBTZWxlY3RvciggXCJfdG9cIiApIClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCBpbnAgPSBmYWxzZSApPT5cblx0XHRzdXBlclxuXHRcdHJldHVyblxuXHRcblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAoIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnAuZ2V0KDApIG9yIGV2bnQ/LnJlbGF0ZWRUYXJnZXQgaXMgQCRpbnBUby5nZXQoMCkgKVxuXHRcdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0cmV0dXJuXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdGNsb3NlOiA9PlxuXHRcdHRyeVxuXHRcdFx0QCQoIFwiLnJhbmdlaW5wXCIgKS5yZW1vdmUoKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cblx0Z2V0UmVzdWx0czogPT5cblx0XHRfcmV0ID1cblx0XHRcdHZhbHVlOiBAZ2V0VmFsdWUoKVxuXHRcdHJldHVybiBfcmV0XG5cdFxuXHRnZXRWYWx1ZTogPT5cblx0XHRfdkZyb20gPSBzdXBlclxuXHRcdF92ID0gQCRpbnBUby52YWwoKVxuXHRcdGlmIG5vdCBfdj8ubGVuZ3RoXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdF92VG8gPSBwYXJzZUludCggQHZhbHVlQnlEZWZpbml0aW9uKCBfdiksIDEwIClcblxuXHRcdHJldHVybiBbIF92RnJvbSwgX3ZUbyBdXG5cdFxuXHRfb25UYWJBY3Rpb246ICggZXZudCApPT5cblx0XHRfdmFsID0gQGdldFZhbHVlKClcblx0XHRpZiBfdmFsPy5sZW5ndGggPj0gMlxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRAc2VsZWN0KClcblx0XHRyZXR1cm5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjZXRTdWJzUmFuZ2VcbiIsIktFWUNPREVTID0gcmVxdWlyZSggXCIuLi8uLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgRmFjZXRTdWJzU2VsZWN0IGV4dGVuZHMgcmVxdWlyZSggXCIuL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uLy4uL3RtcGxzL3NlbGVjdC5qYWRlXCIgKVxuXG5cdGZvcmNlZE1vZHVsZU9wdHM6e31cblx0I1x0bXVsdGlwbGU6IHRydWVcblxuXHRkZWZhdWx0TW9kdWxlT3B0czpcblx0XHQjbWF4aW11bVNlbGVjdGlvbkxlbmd0aDogMVxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHRcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAY29udmVydFZhbHVlVG9JbnQgPSBAX2NoZWNrSW50VmFsdWUoIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0X2V2bnRzID0ge31cblx0XHRfZXZudHNbIFwiY2xpY2sgLnNlbGVjdC1jaGVja1wiIF0gPSBcInNlbGVjdFwiIGlmIEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApXG5cdFx0cmV0dXJuIF9ldm50c1xuXG5cdF9nZXRJbnBTZWxlY3RvcjogPT5cblx0XHRyZXR1cm4gXCJzZWxlY3QjI3tAY2lkfVwiXG5cdFx0XG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdCNAX2luaXRTZWxlY3QyKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogKCk9PlxuXHRcdCMgcHJldmVudCBmcm9tIGFzeW5jIGxpc3RlbmluZyBvbiBtYW51YWwgYWNjZXNzXG5cdFx0QG1vZGVsLnNldCggXCJ3YWl0Rm9yQXN5bmNcIiwgZmFsc2UgKVxuXHRcdEBfaW5pdFNlbGVjdDIoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIuc2hvdygpXG5cdFx0QHNlbGVjdDIub3BlbigpXG5cdFx0I2Vsc2Vcblx0XHRcdCNAJGlucC5zZWxlY3QyKCBcIm9wZW5cIiApXG5cdFx0cmV0dXJuIHN1cGVyXG5cdFxuXHRfaXNGdWxsOiA9PlxuXHRcdGlmIEBzZWxlY3RDb3VudCA8PSAwXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRyZXR1cm4gKCBAcmVzdWx0IG9yIFtdKS5sZW5ndGggPj0gQHNlbGVjdENvdW50XG5cdFxuXHRyZW9wZW46ICggcFZpZXcgKT0+XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0IyBzZXQgdGhlIGN1cnJlbnQgdmFsdWVzXG5cdFx0X29sZFZhbHMgPSBAcmVzdWx0LnBsdWNrKCBcInZhbHVlXCIgKVxuXHRcdEBtb2RlbC5zZXQoIHZhbHVlOiBfb2xkVmFscyApXG5cdFx0XG5cdFx0IyByZXNldCByZXN1bHRzIGFuZCBzZWxlY3QyXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKVxuXHRcdEBzZWxlY3QyLiRjb250YWluZXIub2ZmKClcblx0XHRAc2VsZWN0Mi5kZXN0cm95KClcblx0XHRAcmVzdWx0LnJlc2V0KClcblx0XHRAc2VsZWN0MiA9IG51bGxcblx0XHRcblx0XHRyZXR1cm4gc3VwZXJcblx0XHRcblx0X2NoZWNrSW50VmFsdWU6ICggX29wdHMgPSBbXSApPT5cblx0XHRpZiBub3QgX29wdHMgb3Igbm90IF9vcHRzLmxlbmd0aFxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0Zm9yIF92IGluIF9vcHRzXG5cdFx0XHRpZiBfdi52YWx1ZT8gYW5kIF8uaXNTdHJpbmcoIF92LnZhbHVlIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdi5pZD8gYW5kIF8uaXNTdHJpbmcoIF92LmlkIClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRpZiBfdj8gYW5kIF8uaXNTdHJpbmcoIF92IClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXG5cdF9pbml0U2VsZWN0MjogPT5cblx0XHRcblx0XHRpZiBub3QgQHNlbGVjdDI/XG5cdFx0XHRfb3B0cyA9IF8uZXh0ZW5kKCB7fSwgQGRlZmF1bHRNb2R1bGVPcHRzLCBAbW9kZWwuZ2V0KCBcIm9wdHNcIiApLCB7IG11bHRpcGxlOiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKSBvciBmYWxzZSB9LCBAZm9yY2VkTW9kdWxlT3B0cyApXG5cdFx0XHRAJGlucC5zZWxlY3QyKCBfb3B0cyApXG5cdFx0XHRAc2VsZWN0MiA9IEAkaW5wLmRhdGEoIFwic2VsZWN0MlwiIClcblx0XHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdFx0XHRAJGlucC5vbiBcInNlbGVjdDI6c2VsZWN0IHNlbGVjdDI6Y2xvc2VcIiwgQHNlbGVjdFxuXHRcdFx0XG5cdFx0XHQjIGFmdGVyIGxvYWRpbmcgdHJ5IHRvIHNldCB0aGUgY3Vyc29yIGZvY3VzXG5cdFx0XHRAc2VsZWN0Mi5vbiBcInJlc3VsdHM6YWxsXCIsICggcmVzdWx0cyApPT5cblx0XHRcdFx0QGNvbnZlcnRWYWx1ZVRvSW50ID0gQF9jaGVja0ludFZhbHVlKCByZXN1bHRzPy5kYXRhPy5yZXN1bHRzIClcblx0XHRcdFx0QHNlbGVjdDIuc2VsZWN0aW9uPy4kc2VhcmNoPy5mb2N1cz8oKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdFx0IyBsaXN0ZW4gdG8gYXN5bmMgcmVzdWx0IGNoYW5nZXMgYW5kIHNldCB0aGUgc2VsZWN0aW9uXG5cdFx0XHRAc2VsZWN0Mi5kYXRhQWRhcHRlci5jdXJyZW50ICggcmVzdWx0cyApPT5cblx0XHRcdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRcdFx0X2RhdGEgPSBbXVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciByZXN1bHQgaW4gcmVzdWx0c1xuXHRcdFx0XHRcdFx0X2RhdGEucHVzaCBAX2NvbnZlcnRWYWx1ZSggcmVzdWx0IClcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdCMgc2VsZWN0IHRoZSBhY3RpdmUvcHJlZGVmaW5lZCByZXN1bHRzXG5cdFx0XHRcdFx0QF9zZWxlY3QoIF9kYXRhIClcblx0XHRcdFx0XHRAY2xvc2UoKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLm9uIFwiY2xpY2tcIiwgQF9zZWwyb3BlblxuXHRcdFx0QHNlbGVjdDIuJGVsZW1lbnQuaGlkZSgpXG5cdFx0XHQkKCBkb2N1bWVudCApLm9uIEBfaGFzVGFiRXZlbnQoKSwgQF9vbktleSBpZiBAbW9kZWwuZ2V0KCBcIm11bHRpcGxlXCIgKVxuXHRcdHJldHVybiBAc2VsZWN0MlxuXG5cdF9zZWwyb3BlbjogKCBldm50ICktPlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdHJlbW92ZTogPT5cblx0XHQjQCRpbnAuc2VsZWN0MiggXCJkZXN0cm95XCIgKVxuXHRcdHJldHVybiBzdXBlclxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRfZGF0YSA9IF8uZXh0ZW5kKCB7fSwgc3VwZXIsIHsgbXVsdGlwbGU6IEBtb2RlbC5nZXQoIFwibXVsdGlwbGVcIiApLCBvcHRpb25zOiBAX2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb24oIEBtb2RlbC5nZXQoIFwib3B0aW9uc1wiICkgKSB9IClcblx0XHRpZiBfZGF0YS52YWx1ZT8gYW5kIF8uaXNBcnJheSggX2RhdGEudmFsdWUgKVxuXHRcdFx0Zm9yIF92LCBfaWR4IGluIF9kYXRhLnZhbHVlXG5cdFx0XHRcdF9kYXRhLnZhbHVlWyBfaWR4IF0gPSBpZiBAY29udmVydFZhbHVlVG9JbnQgdGhlbiBwYXJzZUZsb2F0KCBfdiApIGVsc2UgX3YudG9TdHJpbmcoKVxuXHRcdGVsc2UgaWYgX2RhdGEudmFsdWU/XG5cdFx0XHRfZGF0YS52YWx1ZSA9IFsgaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX2RhdGEudmFsdWUgKSBlbHNlIF9kYXRhLnZhbHVlLnRvU3RyaW5nKCkgXVxuXHRcdFxuXHRcdGlmIF9kYXRhLnZhbHVlP1xuXHRcdFx0X3ZsaXN0ID0gXy5wbHVjayggX2RhdGEub3B0aW9ucywgXCJ2YWx1ZVwiIClcblx0XHRcdGZvciBfdiBpbiBfZGF0YS52YWx1ZSB3aGVuIF92IG5vdCBpbiBfdmxpc3Rcblx0XHRcdFx0X2RhdGEub3B0aW9ucy5wdXNoIHsgdmFsdWU6ICggaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggX3YgKSBlbHNlIF92LnRvU3RyaW5nKCkgKSwgbGFiZWw6IF92LCBncm91cDogdW5kZWZpbmVkIH1cblx0XHRcblx0XHRfZ3JvdXBzID0gXy5ncm91cEJ5KCBfZGF0YS5vcHRpb25zLCBcImdyb3VwXCIgKVxuXHRcdGlmIF8uY29tcGFjdCggXy5rZXlzKCBfZ3JvdXBzIG9yIHt9ICkgKS5sZW5ndGggPiAxXG5cdFx0XHRfZGF0YS5vcHRpb25Hcm91cHMgPSBfZ3JvdXBzXG5cdFx0cmV0dXJuIF9kYXRhXG5cdFxuXHRfaGFzVGFiTGlzdGVuZXI6ICggY3JlYXRlICk9PlxuXHRcdGlmIGNyZWF0ZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0cmV0dXJuIEBtb2RlbC5nZXQoXCJtdWx0aXBsZVwiKVxuXHRcblx0X2hhc1RhYkV2ZW50OiAtPlxuXHRcdHJldHVybiBcImtleXVwXCJcblx0XHRcblx0Z2V0VmFsdWU6ID0+XG5cdFx0X3ZhbHMgPSBbXVxuXHRcdGZvciBkYXRhIGluIEBfaW5pdFNlbGVjdDIoKT8uZGF0YSgpIG9yIFtdXG5cdFx0XHRcblx0XHRcdF92YWxzLnB1c2goIEBfY29udmVydFZhbHVlKCBkYXRhICkgKVxuXHRcdHJldHVybiBfdmFsc1xuXHRcblx0X2NvbnZlcnRWYWx1ZTogKCBkYXRhICk9PlxuXHRcdF9kYXRhID0ge31cblx0XHRpZiBAY29udmVydFZhbHVlVG9JbnRcblx0XHRcdF9kYXRhLnZhbHVlID0gcGFyc2VGbG9hdCggZGF0YS5pZCApXG5cdFx0ZWxzZVxuXHRcdFx0X2RhdGEudmFsdWUgPSBkYXRhLmlkXG5cdFx0X2RhdGEubGFiZWwgPSBkYXRhLnRleHQgaWYgZGF0YS50ZXh0P1xuXHRcdHJldHVybiBfZGF0YVxuXG5cdGdldFJlc3VsdHM6ID0+XG5cdFx0dmFsdWU6IEByZXN1bHQucGx1Y2soIFwidmFsdWVcIiApXG5cblx0X2NyZWF0ZU9wdGlvbkNvbGxlY3Rpb246ICggb3B0aW9ucyApPT5cblx0XHRpZiBfLmlzRnVuY3Rpb24oIG9wdGlvbnMgKVxuXHRcdFx0cmV0dXJuIG9wdGlvbnMoIEBfY3JlYXRlT3B0aW9uQ29sbGVjdGlvbiApXG5cblx0XHRfb3B0cyA9IFtdXG5cdFx0Zm9yIG9wdCBpbiBvcHRpb25zXG5cdFx0XHRpZiBfLmlzU3RyaW5nKCBvcHQgKSBvciBfLmlzTnVtYmVyKCBvcHQgKVxuXHRcdFx0XHRfb3B0cy5wdXNoIHsgdmFsdWU6ICggaWYgQGNvbnZlcnRWYWx1ZVRvSW50IHRoZW4gcGFyc2VGbG9hdCggb3B0ICkgZWxzZSBvcHQudG9TdHJpbmcoKSApLCBsYWJlbDogb3B0LCBncm91cDogbnVsbCB9XG5cdFx0XHRlbHNlIGlmIF8uaXNPYmplY3QoIG9wdCApXG5cdFx0XHRcdG9wdC52YWx1ZSA9IGlmIEBjb252ZXJ0VmFsdWVUb0ludCB0aGVuIHBhcnNlRmxvYXQoIG9wdC52YWx1ZSApIGVsc2Ugb3B0LnZhbHVlLnRvU3RyaW5nKClcblx0XHRcdFx0X29wdHMucHVzaCBfLmV4dGVuZCgge30sIEBvcHREZWZhdWx0LCBvcHQgKVxuXHRcdHJldHVybiBfb3B0c1xuXG5cdHVuc2VsZWN0OiAoIGV2bnQgKT0+XG5cdFx0QHJlc3VsdC5yZW1vdmUoIGV2bnQucGFyYW1zPy5kYXRhPy5pZCApXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6ID0+XG5cdFx0aWYgQG1vZGVsLmdldCggXCJ3YWl0Rm9yQXN5bmNcIiApXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0Mj9cblx0XHRcdCNAc2VsZWN0Mj8uZGVzdHJveSgpXG5cdFx0XHRAc2VsZWN0Mi4kY29udGFpbmVyLmhpZGUoKVxuXHRcdEAkaW5wPy5yZW1vdmUoKVxuXHRcdEAkKCBcIi5zZWxlY3QtY2hlY2tcIiApLnJlbW92ZSgpXG5cdFx0c3VwZXJcblx0XHRyZXR1cm5cblx0XG5cdHNlbGVjdDogKCBldm50ICk9PlxuXHRcdGV2bnQuc3RvcFByb3BhZ2F0aW9uKCkgaWYgZXZudD8uc3RvcFByb3BhZ2F0aW9uXG5cdFx0X3ZhbHMgPSBAZ2V0VmFsdWUoKVxuXHRcdGlmIG5vdCBfdmFscz8ubGVuZ3RoXG5cdFx0XHQjIElzc3VlIzQ5IGlmIG5vdGhpbmcgd2FzIHNlbGVjdGVkIGNsb3NlIHRoZSBzZWxlY3QtdmlldyBhbmQgcmVtb3ZlIHRoZSB3aG9sZSBmYWNldFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdGlmIG5vdCBAbW9kZWwuZ2V0KCBcIndhaXRGb3JBc3luY1wiIClcblx0XHRcdFx0QHN1Yi5kZWwoKVxuXHRcdFx0cmV0dXJuXG5cdFx0QF9zZWxlY3QoIF92YWxzIClcblxuXHRcdEBjbG9zZSgpXG5cdFx0cmV0dXJuXG5cdFxuXHRfc2VsZWN0OiAoIF92YWxzICk9PlxuXHRcdEBtb2RlbC5zZXQoIFwid2FpdEZvckFzeW5jXCIsIGZhbHNlIClcblx0XHRNb2RlbENvbnN0ID0gQGdldFNlbGVjdE1vZGVsKClcblx0XHRmb3IgX3ZhbCBpbiBfdmFsc1xuXHRcdFx0QHJlc3VsdC5hZGQoIG5ldyBNb2RlbENvbnN0KCBfdmFsICkgKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEByZXN1bHQgKVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhY2V0U3Vic1NlbGVjdFxuIiwiY2xhc3MgRmFjZXRTdWJTdHJpbmcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vYmFzZVwiIClcblx0dGVtcGxhdGU6IHJlcXVpcmUoIFwiLi4vLi4vdG1wbHMvc3RyaW5nLmphZGVcIiApXG5cdFxuXHRldmVudHM6ID0+XG5cdFx0XCJrZXl1cCAje0BfZ2V0SW5wU2VsZWN0b3IoKX1cIjogXCJpbnB1dFwiXG5cdFx0XCJrZXlkb3duICN7QF9nZXRJbnBTZWxlY3RvcigpfVwiOiBcImlucHV0XCJcblx0XHRcImJsdXIgI3tAX2dldElucFNlbGVjdG9yKCl9XCI6IFwic2VsZWN0XCJcblxuXHRjbG9zZTogKCBldm50ICk9PlxuXHRcdHN1cGVyXG5cdFx0dHJ5XG5cdFx0XHRAJGlucD8ucmVtb3ZlKClcblx0XHRyZXR1cm5cblx0XG5cdHJlb3BlbjogKCBwVmlldyApPT5cblx0XHRfb2xkVmFsID0gQHJlc3VsdC5maXJzdCgpLmdldCggXCJ2YWx1ZVwiIClcblx0XHRAbW9kZWwuc2V0KCB2YWx1ZTogX29sZFZhbCApXG5cdFx0cFZpZXcuJHJlc3VsdHMuZW1wdHkoKS5odG1sKCBAcmVuZGVyUmVzdWx0KCB0cnVlICkgKVxuXHRcdHN1cGVyXG5cdFx0cmV0dXJuXG5cdFx0XHRcdFxubW9kdWxlLmV4cG9ydHMgPSBGYWNldFN1YlN0cmluZ1xuIiwiU3ViVmlldyA9IHJlcXVpcmUoIFwiLi9zdWJcIiApXG5TZWxlY3RvclZpZXcgPSByZXF1aXJlKCBcIi4vc2VsZWN0b3JcIiApXG5cbktFWUNPREVTID0gcmVxdWlyZSggXCIuLi91dGlscy9rZXljb2Rlc1wiIClcblxuY2xhc3MgTWFpblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3dyYXBwZXIuamFkZVwiIClcblxuXHRldmVudHM6XG5cdFx0XCJjbGljayAuYWRkLWZhY2V0LWJ0blwiOiBcIl9hZGRGYWNldFwiXG5cdFx0XCJjbGlja1wiOiBcIl9hZGRGYWNldFwiXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdFxuXHRcdEByZXN1bHRzID0gb3B0aW9ucy5yZXN1bHRzXG5cblx0XHRAY29sbGVjdGlvbi5vbiBcImlnZ3k6cmVtXCIsIEByZW1GYWNldFxuXHRcdFxuXHRcdF9jbCA9IFwiaWdneSBjbGVhcmZpeFwiXG5cdFx0aWYgQGVsLmNsYXNzTmFtZT8ubGVuZ3RoXG5cdFx0XHRfY2wgPSBcIiBcIiArIF9jbFxuXHRcdEBlbC5jbGFzc05hbWUgKz0gX2NsXG5cdFx0QHJlbmRlcigpXG5cdFx0JCggZG9jdW1lbnQgKS5vbiBcImtleXVwXCIsIEBfb25LZXlcblx0XHRAX291dGVyQ2xpY2tMaXN0ZW4oKVxuXHRcdFxuXHRcdF92YWx1ZUZhY2V0cyA9IEBjb2xsZWN0aW9uLmZpbHRlciggKCBmY3QgKS0+cmV0dXJuIGZjdD8uZ2V0KCBcInZhbHVlXCIgKT8gKVxuXHRcdFxuXHRcdF9mblNvcnQgPSAoIGtleSApLT5cblx0XHRcdHJldHVybiAoIHYxLCB2MiApLT5cblx0XHRcdFx0aWYgdjFbIGtleSBdID4gdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIDFcblx0XHRcdFx0aWYgdjFbIGtleSBdIDwgdjJbIGtleSBdXG5cdFx0XHRcdFx0cmV0dXJuIC0xXG5cdFx0XHRcdHJldHVybiAwXG5cdFx0XG5cdFx0Zm9yIGZjdCBpbiBfdmFsdWVGYWNldHMuc29ydCggX2ZuU29ydCggXCJfaWR4XCIgKSApXG5cdFx0XHRzdWJ2aWV3ID0gQGdlblN1YiggZmN0LCBmYWxzZSApXG5cdFx0XG5cdFx0QGNvbGxlY3Rpb24ub24gXCJhZGRcIiwgPT5cblx0XHRcdEAkYWRkQnRuLnNob3coKVxuXHRcdFx0cmV0dXJuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVuZGVyOiA9PlxuXHRcdEAkZWwuaHRtbCggQHRlbXBsYXRlKCkgKVxuXHRcdEAkYWRkQnRuID0gQCQoIFwiLmFkZC1mYWNldC1idG5cIiApXG5cdFx0cmV0dXJuXG5cblx0X2FkZEZhY2V0OiAoIGV2bnQgKT0+XG5cdFx0QGFkZEZhY2V0KClcblx0XHRyZXR1cm5cblxuXHRfb25LZXk6ICggZXZudCApPT5cblx0XHRpZiBldm50LmtleUNvZGUgaXMgS0VZQ09ERVMuRVNDIG9yIGV2bnQua2V5Q29kZSBpbiBLRVlDT0RFUy5FU0Ncblx0XHRcdEBleGl0KClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0ZXhpdDogKCBuZXh0QWRkID0gdHJ1ZSApPT5cblx0XHRpZiBAc3Vidmlld1xuXHRcdFx0QHN1YnZpZXcuY2xvc2UoKVxuXHRcdFx0QHN1YnZpZXcgPSBudWxsXG5cdFx0XHRAYWRkRmFjZXQoKSBpZiBuZXh0QWRkXG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRpZiBAc2VsZWN0dmlld1xuXHRcdFx0I2NvbnNvbGUubG9nIFwiTUFJTiBSRU1PVkUgU0VMRUNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmNsb3NlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXG5cdFx0XG5cdFx0cmV0dXJuXG5cblx0cmVtRmFjZXQ6ICggZmFjZXRNICk9PlxuXHRcdEByZXN1bHRzLnJlbW92ZSggZmFjZXRNLmdldCggXCJuYW1lXCIgKSApXG5cdFx0cmV0dXJuXG5cblx0c2V0RmFjZXQ6ICggZmFjZXRNLCBkYXRhICk9PlxuXHRcdEBjb2xsZWN0aW9uLnJlbW92ZSggZmFjZXRNIClcblxuXHRcdEByZXN1bHRzLmFkZCggXy5leHRlbmQoIGRhdGEsIHsgbmFtZTogZmFjZXRNLmdldCggXCJuYW1lXCIgKSwgdHlwZTogZmFjZXRNLmdldCggXCJ0eXBlXCIgKSB9ICksIHsgbWVyZ2U6IHRydWUsIHBhcnNlOiB0cnVlLCBfZmFjZXQ6IGZhY2V0TSB9IClcblx0XHRpZiBub3QgQGNvbGxlY3Rpb24ubGVuZ3RoXG5cdFx0XHRAJGFkZEJ0bi5oaWRlKClcblx0XHRyZXR1cm5cblxuXHRnZW5TdWI6ICggZmFjZXRNLCBhZGRBZnRlciA9IHRydWUgKT0+XG5cdFx0c3VidmlldyA9IG5ldyBTdWJWaWV3KCBtb2RlbDogZmFjZXRNLCBjb2xsZWN0aW9uOiBAY29sbGVjdGlvbiwgcGFyZW50OiBAIClcblx0XHRcblx0XHRzdWJ2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNVQiBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNzdWJ2aWV3Lm9mZigpXG5cdFx0XHRzdWJ2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdEBzdWJ2aWV3ID0gbnVsbFxuXHRcdFx0QGFkZEZhY2V0KCkgaWYgYWRkQWZ0ZXJcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdHN1YnZpZXcub24gXCJyZW9wZW5cIiwgPT5cblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdHN1YnZpZXcub24oIFwic2VsZWN0ZWRcIiwgQHNldEZhY2V0IClcblx0XHRcblx0XHRAJGFkZEJ0bi5iZWZvcmUoIHN1YnZpZXcucmVuZGVyKCkgKVxuXHRcdHJldHVybiBzdWJ2aWV3XG5cblx0YWRkRmFjZXQ6ID0+XG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU0VMRUNUIEVYSVNUXCJcblx0XHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgQHN1YnZpZXc/XG5cdFx0XHQjY29uc29sZS5sb2cgXCJTVE9QIEAgU1VCIEVYSVNUXCJcblx0XHRcdEBzdWJ2aWV3LmNsb3NlKClcblx0XHRcdHJldHVyblxuXG5cdFx0aWYgbm90IEBjb2xsZWN0aW9uLmxlbmd0aFxuXHRcdFx0I2NvbnNvbGUubG9nIFwiU1RPUCBAIEVNUFRZIENPTExcIlxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldyA9IG5ldyBTZWxlY3RvclZpZXcoIGNvbGxlY3Rpb246IEBjb2xsZWN0aW9uLCBjdXN0b206IGZhbHNlIClcblxuXHRcdEAkYWRkQnRuLmJlZm9yZSggQHNlbGVjdHZpZXcucmVuZGVyKCkgKVxuXHRcdEBzZWxlY3R2aWV3LmZvY3VzKClcblx0XHRcblxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwiY2xvc2VkXCIsICggcmVzdWx0cyApPT5cblx0XHRcdCNjb25zb2xlLmxvZyBcIlNFTEVDVCBWSUVXIENMT1NFRFwiLCByZXN1bHRzPy5sZW5ndGhcblx0XHRcdCNAc2VsZWN0dmlldy5vZmYoKVxuXHRcdFx0QHNlbGVjdHZpZXcucmVtb3ZlKClcblx0XHRcdEBzZWxlY3R2aWV3ID0gbnVsbFxuXHRcdFx0aWYgbm90IHJlc3VsdHM/Lmxlbmd0aCBhbmQgQHN1YnZpZXc/XG5cdFx0XHRcdCNAc3Vidmlldy5vZmYoKVxuXHRcdFx0XHRAc3Vidmlldy5yZW1vdmUoKVxuXHRcdFx0XHRAc3VidmlldyA9IG51bGxcblx0XHRcdHJldHVyblxuXG5cdFx0QHNlbGVjdHZpZXcub24gXCJzZWxlY3RlZFwiLCAoIGZhY2V0TSApPT5cblx0XHRcdGZhY2V0TS5zZXQoIFwidmFsdWVcIiwgbnVsbCApXG5cdFx0XHRAc3VidmlldyA9IEBnZW5TdWIoIGZhY2V0TSApXG5cdFx0XHRAc3Vidmlldy5vcGVuKClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcblx0X291dGVyQ2xpY2tMaXN0ZW46ID0+XG5cdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uIFwiY2xpY2tcIiwgQF9vdXRlckNsaWNrXG5cdFx0cmV0dXJuXG5cblx0X291dGVyQ2xpY2s6ICggZXZudCApPT5cblx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0X3Bvc1dycCA9IEBlbC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiggZXZudC50YXJnZXQgKVxuXHRcdGlmIG5vdCAoIF9wb3NXcnAgaXMgMCBvciBfcG9zV3JwIC0gMTYgPj0gMCApXG5cdFx0XHRAZXhpdCggZmFsc2UgKVxuXHRcdHJldHVyblxuXHRcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluVmlld1xuIiwiS0VZQ09ERVMgPSByZXF1aXJlKCBcIi4uL3V0aWxzL2tleWNvZGVzXCIgKVxuXG5jbGFzcyBTZWxlY3RvclZpZXcgZXh0ZW5kcyByZXF1aXJlKCBcIi4vZmFjZXRzL2Jhc2VcIiApXG5cdHRlbXBsYXRlOiByZXF1aXJlKCBcIi4uL3RtcGxzL3NlbGVjdG9yLmphZGVcIiApXG5cdHRlbXBsYXRlRWw6IHJlcXVpcmUoIFwiLi4vdG1wbHMvc2VsZWN0b3JsaS5qYWRlXCIgKVxuXHRzZWxlY3RDb3VudDogMVxuXG5cdGNsYXNzTmFtZTogPT5cblx0XHRjbHMgPSBbIFwiYWRkLWZhY2V0XCIgXVxuXHRcdGlmIEBjdXN0b21cblx0XHRcdGNscy5wdXNoIFwiY3VzdG9tXCJcblx0XHRyZXR1cm4gY2xzLmpvaW4oIFwiIFwiIClcblxuXHRldmVudHM6ID0+XG5cdFx0XCJtb3VzZWRvd24gYVwiOiBcIl9vbkNsaWNrXCJcblx0XHRcImZvY3VzIGlucHV0IyN7QGNpZH1cIjogXCJvcGVuXCJcblx0XHQjXCJibHVyIGlucHV0IyN7QGNpZH1cIjogXCJjbG9zZVwiXG5cdFx0XCJrZXlkb3duIGlucHV0IyN7QGNpZH1cIjogXCJzZWFyY2hcIlxuXHRcdFwia2V5dXAgaW5wdXQjI3tAY2lkfVwiOiBcInNlYXJjaFwiXG5cblx0Y29uc3RydWN0b3I6ICggb3B0aW9ucyApLT5cblx0XHRAY3VzdG9tID0gb3B0aW9ucy5jdXN0b20gb3IgZmFsc2Vcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdEBjdXJyUXVlcnkgPSBcIlwiXG5cdFx0c3VwZXIoIG9wdGlvbnMgKVxuXHRcdHJldHVyblxuXHRcdFxuXHRpbml0aWFsaXplOiAoIG9wdGlvbnMgKT0+XG5cdFx0c3VwZXJcblx0XHRAc2VhcmNoY29sbCA9IEBjb2xsZWN0aW9uLnN1YiggLT50cnVlIClcblx0XHRAcmVzdWx0ID0gbmV3IEBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yKClcblx0XHRcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcImFkZFwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAcmVuZGVyUmVzIClcblx0XHRAbGlzdGVuVG8oIEBzZWFyY2hjb2xsLCBcInJlbW92ZVwiLCBAY2hlY2tPcHRpb25zRW1wdHkgKVxuXHRcdFxuXHRcdHJldHVyblxuXG5cdGdldFRlbXBsYXRlRGF0YTogPT5cblx0XHRyZXR1cm4gXy5leHRlbmQoIHN1cGVyLCBjdXN0b206IEBjdXN0b20gKVxuXG5cdHJlbmRlcjogPT5cblx0XHRzdXBlclxuXHRcdEAkbGlzdCA9IEAkZWwuZmluZCggXCIjI3tAY2lkfXR5cGVsaXN0XCIgKVxuXHRcdEByZW5kZXJSZXMoKVxuXHRcdHJldHVybiBAZWxcblxuXHRyZW5kZXJSZXM6ID0+XG5cdFx0QCRsaXN0LmVtcHR5KClcblxuXHRcdF9saXN0ID0gW11cblx0XHRmb3IgbW9kZWwsIGlkeCBpbiBAc2VhcmNoY29sbC5tb2RlbHNcblx0XHRcdF9sYmwgPSBtb2RlbC5nZXRMYWJlbCgpXG5cdFx0XHRfdG1wbCA9IG1vZGVsLmdldCggXCJsYWJlbHRlbXBsYXRlXCIgKVxuXHRcdFx0aWYgX3RtcGw/XG5cdFx0XHRcdF9sYmwgPSBfdG1wbC5yZXBsYWNlKCBcInt7bGFiZWx9fVwiLCBfbGJsIClcblx0XHRcdFx0XG5cdFx0XHRfaWQgPSBtb2RlbC5pZFxuXHRcdFx0X2Nzc2NsYXNzID0gbW9kZWwuZ2V0KCBcImNzc2NsYXNzXCIgKVxuXHRcdFx0aWYgQGN1cnJRdWVyeT8ubGVuZ3RoID4gMVxuXHRcdFx0XHRfbGJsID0gX2xibC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBAY3VyclF1ZXJ5LCBcImdpXCIgKSwgKCggc3RyICktPnJldHVybiBcIjxiPiN7c3RyfTwvYj5cIiApIClcblx0XHRcdF9saXN0LnB1c2ggbGFiZWw6IF9sYmwsIGlkOiBfaWQsIGNzc2NsYXNzOiBfY3NzY2xhc3Ncblx0XHRAJGxpc3QuYXBwZW5kKCBAdGVtcGxhdGVFbCggbGlzdDogX2xpc3QsIHF1ZXJ5OiBAY3VyclF1ZXJ5LCBhY3RpdmVJZHg6IEBhY3RpdmVJZHgsIGN1c3RvbTogQGN1c3RvbSApIClcblxuXHRcdEBfY2hlY2tTY3JvbGwoKVxuXHRcdFxuXHRcdHJldHVybiBAJGxpc3RcblxuXHRfc2Nyb2xsVGlsbDogMTk4XG5cdF9jaGVja1Njcm9sbDogPT5cblx0XHRfaGVpZ2h0ID0gQCRsaXN0LmhlaWdodCgpXG5cdFx0aWYgX2hlaWdodCA+IDBcblx0XHRcdEBzY3JvbGxIZWxwZXIoIF9oZWlnaHQgKVxuXHRcdFx0cmV0dXJuXG5cblx0XHQjIGV4aXQgdGhlIHRoZSBjYWxsIHN0YWNrIHRvIGNoZWNrIGhlaWdodCBhZnRlciB0aGUgbW9kdWxlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBkb21cblx0XHRzZXRUaW1lb3V0KCA9PlxuXHRcdFx0QHNjcm9sbEhlbHBlciggQCRsaXN0LmhlaWdodCgpIClcblx0XHQsIDAgKVxuXHRcdHJldHVyblxuXG5cdHNjcm9sbEhlbHBlcjogKCBoZWlnaHQgKT0+XG5cdFx0aWYgaGVpZ2h0ID49IEBfc2Nyb2xsVGlsbFxuXHRcdFx0QHNjcm9sbGluZyA9IHRydWVcblx0XHRlbHNlXG5cdFx0XHRAc2Nyb2xsaW5nID0gZmFsc2Vcblx0XHRyZXR1cm5cblxuXHRjaGVja09wdGlvbnNFbXB0eTogPT5cblx0XHQjaWYgQHNlYXJjaGNvbGwubGVuZ3RoIDw9IDBcblx0XHQjXHRAY2xvc2UoKVxuXHRcdHJldHVyblxuXG5cdF9vbkNsaWNrOiAoIGV2bnQgKT0+XG5cdFx0ZXZudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdGV2bnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0X2lkID0gQCQoIGV2bnQuY3VycmVudFRhcmdldCApLmRhdGEoIFwiaWRcIiApXG5cdFx0aWYgbm90IF9pZD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0X21kbCA9IEBjb2xsZWN0aW9uLmdldCggX2lkIClcblx0XHRpZiBub3QgX21kbD9cblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0QHNlbGVjdGVkKCBfbWRsIClcblx0XHRyZXR1cm4gZmFsc2Vcblx0XG5cdF9pc0Z1bGw6ID0+XG5cdFx0cmV0dXJuIHRydWVcblx0XG5cdHNlbGVjdGVkOiAoIG1kbCApPT5cblx0XHR0cnlcblx0XHRcdGlmIG1kbC5vbmx5RXhlYz9cblx0XHRcdFx0bWRsPy5leGVjPygpXG5cdFx0XHRcdHJldHVyblxuXHRcdGNhdGNoIF9lcnJcblx0XHRcdHRyeVxuXHRcdFx0XHRjb25zb2xlLmVycm9yIFwiSXNzdWUgIzIzOiBDQVRDSCAtIENsYXNzOiN7IEBjb25zdHJ1Y3Rvci5uYW1lIH0gLSBhY3RpdmVJZHg6I3tAYWN0aXZlSWR4fSAtIGNvbGxlY3Rpb246I3tKU09OLnN0cmluZ2lmeSggQGNvbGxlY3Rpb24udG9KU09OKCkpfVwiXG5cdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgXCJJc3N1ZSAjMjM6IENBVENIXCJcblx0XHRcblx0XHRpZiBtZGw/XG5cdFx0XHRAc2VhcmNoY29sbC5yZW1vdmUoIG1kbCApXG5cdFx0XHRAcmVzdWx0LmFkZCggbWRsIClcblx0XHRcdEB0cmlnZ2VyIFwic2VsZWN0ZWRcIiwgbWRsXG5cdFx0XG5cdFx0aWYgQF9pc0Z1bGwoKVxuXHRcdFx0QGNsb3NlKClcblx0XHRyZXR1cm5cblxuXHRmb2N1czogPT5cblx0XHRAJGlucC5mb2N1cygpXG5cdFx0X2VsID0gQCRpbnAuZ2V0KDApXG5cdFx0XG5cdFx0X2VsLnNlbGVjdGlvblN0YXJ0ID0gX2VsLnNlbGVjdGlvbkVuZCA9IF9lbC52YWx1ZS5sZW5ndGhcblx0XHRyZXR1cm5cblxuXHRzZWFyY2g6ICggZXZudCApPT5cblx0XHRpZiBldm50Py50eXBlIGlzIFwia2V5ZG93blwiXG5cdFx0XHRzd2l0Y2ggZXZudC5rZXlDb2RlXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuVVBcblx0XHRcdFx0XHRAbW92ZSggdHJ1ZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRE9XTlxuXHRcdFx0XHRcdEBtb3ZlKCBmYWxzZSApXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdHdoZW4gS0VZQ09ERVMuRU5URVJcblx0XHRcdFx0XHRAc2VsZWN0QWN0aXZlKCB0cnVlIClcblx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdGlmIF8uaXNTdHJpbmcoIGV2bnQgKVxuXHRcdFx0X3EgPSBldm50XG5cdFx0ZWxzZVxuXHRcdFx0X3EgPSBldm50LmN1cnJlbnRUYXJnZXQudmFsdWUudG9Mb3dlckNhc2UoKVxuXHRcdGlmIF9xIGlzIEBjdXJyUXVlcnlcblx0XHRcdHJldHVyblxuXG5cdFx0QGN1cnJRdWVyeSA9IF9xXG5cblx0XHRAc2VhcmNoY29sbC51cGRhdGVTdWJGaWx0ZXIoICggbWRsICk9PlxuXHRcdFx0aWYgQHJlc3VsdC5nZXQoIG1kbC5pZCApP1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdGlmIG5vdCBfcT8ubGVuZ3RoXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRfbWF0Y2ggPSBtZGwubWF0Y2goIF9xIClcblx0XHRcdHJldHVybiBfbWF0Y2hcblx0XHQsIGZhbHNlIClcblxuXG5cdFx0QGFjdGl2ZUlkeCA9IDBcblx0XHRAcmVuZGVyUmVzKClcblx0XHRyZXR1cm5cblxuXHRtb3ZlOiAoIHVwID0gZmFsc2UgKT0+XG5cdFx0X2xpc3QgPSBAJGVsLmZpbmQoIFwiLnR5cGVsaXN0IGFcIiApXG5cdFxuXHRcdF9jdXN0b21FbGVtZW50Q2hhbmdlID0gaWYgQGN1cnJRdWVyeT8ubGVuZ3RoIHRoZW4gMCBlbHNlIDFcblx0XHRfdG9wID0gMFxuXHRcdGlmIHVwXG5cdFx0XHRpZiAoIEBhY3RpdmVJZHggLSAxICkgPCBfdG9wXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0X25ld2lkeCA9IEBhY3RpdmVJZHggLSAxXG5cdFx0ZWxzZVxuXHRcdFx0aWYgQHNlYXJjaGNvbGwubGVuZ3RoIC0gX2N1c3RvbUVsZW1lbnRDaGFuZ2UgPD0gQGFjdGl2ZUlkeFxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdF9uZXdpZHggPSBAYWN0aXZlSWR4ICsgMVxuXG5cdFx0XG5cdFx0QCQoIF9saXN0WyBAYWN0aXZlSWR4IF0gKS5yZW1vdmVDbGFzcyggXCJhY3RpdmVcIiApXG5cdFx0XyRlbG5ldyA9IEAkKCBfbGlzdFsgX25ld2lkeCBdICkuYWRkQ2xhc3MoIFwiYWN0aXZlXCIgKVxuXG5cdFx0aWYgQHNjcm9sbGluZ1xuXHRcdFx0X2VsSCA9IF8kZWxuZXcub3V0ZXJIZWlnaHQoKVxuXHRcdFx0X3BvcyA9IF9lbEggKiAoIF9uZXdpZHggKyAxIClcblx0XHRcdF8kbGlzdCA9IEAkZWwuZmluZCggXCIudHlwZWxpc3RcIiApXG5cdFx0XHRfc2Nyb2xsVCA9IF8kbGlzdC5zY3JvbGxUb3AoKVxuXHRcdFx0aWYgX3BvcyA+IF9zY3JvbGxUICsgQF9zY3JvbGxUaWxsXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBAX3Njcm9sbFRpbGwgKVxuXHRcdFx0ZWxzZSBpZiBfcG9zIDwgX3Njcm9sbFQgKyBfZWxIXG5cdFx0XHRcdF8kbGlzdC5zY3JvbGxUb3AoIF9wb3MgLSBfZWxIIClcblxuXHRcdEBhY3RpdmVJZHggPSBfbmV3aWR4XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0Oj0+XG5cdFx0cmV0dXJuXG5cblx0c2VsZWN0QWN0aXZlOiAoIGlzRW50ZXJFdmVudD1mYWxzZSApPT5cblx0XHRcblx0XHRfc2VsID0gQCRlbC5maW5kKCBcIi50eXBlbGlzdCBhLmFjdGl2ZVwiICkucmVtb3ZlQ2xhc3MoIFwiYWN0aXZlXCIgKS5kYXRhKClcblx0XHRcdFxuXHRcdF9zZWFyY2ggPSBAJGlucC52YWwoKVxuXHRcdFxuXHRcdGlmICBub3QgX3NlbD8gYW5kIEBzZWxlY3RDb3VudCBpc250IDEgYW5kIGlzRW50ZXJFdmVudCBhbmQgbm90IF9zZWFyY2g/Lmxlbmd0aFxuXHRcdFx0QGNsb3NlKClcblx0XHRcdHJldHVyblxuXHRcdFx0XG5cdFx0aWYgbm90IF9zZWw/XG5cdFx0XHRyZXR1cm5cblx0XHRcblx0XHRAYWN0aXZlSWR4ID0gMFxuXHRcdGlmIF9zZWw/LmlkeCA+PSAwIGFuZCBAc2VhcmNoY29sbC5sZW5ndGhcblx0XHRcdEBzZWxlY3RlZCggQGNvbGxlY3Rpb24uZ2V0KCBfc2VsLmlkICkgKVxuXHRcdGVsc2UgaWYgQGN1cnJRdWVyeT8ubGVuZ3RoXG5cdFx0XHRAc2VsZWN0ZWQoIG5ldyBAY29sbGVjdGlvbi5tb2RlbCggdmFsdWU6IEBjdXJyUXVlcnksIGN1c3RvbTogdHJ1ZSApIClcblx0XHRcdEAkaW5wLnZhbCggXCJcIiApXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0b3JWaWV3XG4iLCJjbGFzcyBWaWV3U3ViIGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSggXCIuLi90bXBscy9zdWIuamFkZVwiIClcblx0Y2xhc3NOYW1lOiA9PlxuXHRcdF9zdGQgPSBcInN1YlwiXG5cdFx0X3R5cGUgPSBAbW9kZWwuZ2V0KCBcInR5cGVcIiApXG5cdFx0aWYgX3R5cGU/XG5cdFx0XHRfc3RkICs9IFwiIHN1Yi10eXBlLVwiICsgX3R5cGVcblx0XHRcblx0XHRfbmFtZSA9IEBtb2RlbC5nZXQoIFwibmFtZVwiIClcblx0XHRpZiBfbmFtZT9cblx0XHRcdF9zdGQgKz0gXCIgc3ViLW5hbWUtXCIgKyBfbmFtZVxuXHRcdHJldHVybiBfc3RkXG5cblx0aW5pdGlhbGl6ZTogKCBvcHRpb25zICk9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAcmVzdWx0ID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuXHRcdEAkZWwub24gXCJjbGlja1wiLCBAcmVvcGVuXG5cdFx0QHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cdFx0cmV0dXJuXG5cblx0ZXZlbnRzOlxuXHRcdFwiY2xpY2sgLnJtLWZhY2V0LWJ0blwiOiBcImRlbFwiXG5cblx0cmVuZGVyOiAoIG9wdE1kbCApPT5cblx0XHRfbGlzdCA9IFtdXG5cdFx0Zm9yIG1vZGVsLCBpZHggaW4gQHJlc3VsdC5tb2RlbHNcblx0XHRcdHRyeVxuXHRcdFx0XHRfbGlzdC5wdXNoIG1vZGVsLmdldExhYmVsKClcblx0XHRcdGNhdGNoIF9lcnJcblx0XHRcdFx0dHJ5XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0ggLSBDbGFzczojeyBAY29uc3RydWN0b3IubmFtZSB9IC0gbW9kZWw6I3tKU09OLnN0cmluZ2lmeShAbW9kZWwudG9KU09OKCkpfSAtIHJlc3VsdDoje0pTT04uc3RyaW5naWZ5KCBAcmVzdWx0LnRvSlNPTigpKX1cIlxuXHRcdFx0XHRjYXRjaCBfZXJyZXJyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvciBcIklzc3VlICMyNDogQ0FUQ0hcIlxuXHRcdFxuXHRcdEAkZWwuaHRtbCBAdGVtcGxhdGUoIGxhYmVsOiBAbW9kZWwuZ2V0TGFiZWwoKSwgc2VsZWN0ZWQ6IF9saXN0LCB0eXBlOiBAbW9kZWwuZ2V0KCBcInR5cGVcIiApLCBuYW1lOiBAbW9kZWwuZ2V0KCBcIm5hbWVcIiApIClcblx0XHRAJHN1YiA9IEAkKCBcIi5zdWJzZWxlY3RcIiApXG5cdFx0QCRyZXN1bHRzID0gQCQoIFwiLnN1YnJlc3VsdHNcIiApXG5cblx0XHRAZ2VuZXJhdGVTdWIoKVxuXHRcdHJldHVybiBAZWxcblx0XG5cdHJlb3BlbjogKCBldm50ICk9PlxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5ybS1yZXN1bHQtYnRuXCIgKSBhbmQgQHNlbGVjdHZpZXc/LnJtUmVzP1xuXHRcdFx0QHNlbGVjdHZpZXcucm1SZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIGV2bnQ/IGFuZCAkKCBldm50LnRhcmdldCApLmlzKCBcIi5lZGl0LXJlc3VsdC1idG5cIiApIGFuZCBAc2VsZWN0dmlldz8uZWRpdFJlcz9cblx0XHRcdEBzZWxlY3R2aWV3LmVkaXRSZXMoIGV2bnQgKVxuXHRcdFx0ZXZudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRldm50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRyZXR1cm5cblx0XHRcdFxuXHRcdGlmIG5vdCBAX2lzT3BlbiBhbmQgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldy5yZW9wZW4oIEAgKVxuXHRcdGV2bnQ/LnByZXZlbnREZWZhdWx0KClcblx0XHRldm50Py5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdEB0cmlnZ2VyKCBcInJlb3BlblwiIClcblx0XHRyZXR1cm5cblx0XHRcblx0ZGVsOiAoIGV2bnQgKT0+XG5cdFx0ZXZudD8uc3RvcFByb3BhZ2F0aW9uKClcblx0XHRldm50Py5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0QGNvbGxlY3Rpb24udHJpZ2dlciggXCJpZ2d5OnJlbVwiLCBAbW9kZWwgKVxuXHRcdEBjb2xsZWN0aW9uLmFkZCggQG1vZGVsIClcblx0XHRAcmVtb3ZlKClcblx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiApXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0cmVtb3ZlOiA9PlxuXHRcdEBfaXNPcGVuID0gZmFsc2Vcblx0XHRAc2VsZWN0dmlldz8ucmVtb3ZlKClcblx0XHRAcGFyZW50ID0gbnVsbFxuXHRcdHJldHVybiBzdXBlclxuXG5cdHNlbGVjdGVkOiAoIG9wdE1kbCApPT5cblx0XHRAcmVzdWx0LmFkZCggb3B0TWRsLCB7IG1lcmdlOiB0cnVlIH0gKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRyZXR1cm5cblx0XG5cdHJlbW92ZWQ6ICggb3B0TWRsICk9PlxuXHRcdEByZXN1bHQucmVtb3ZlKCBvcHRNZGwgKVxuXHRcdEByZW5kZXJSZXN1bHQoKVxuXHRcdEB0cmlnZ2VyKCBcInNlbGVjdGVkXCIsIEBtb2RlbCwgQHNlbGVjdHZpZXcuZ2V0UmVzdWx0cygpIClcblx0XHRpZiBAcmVzdWx0Lmxlbmd0aCA8PSAwXG5cdFx0XHRAZGVsKClcblx0XHRyZXR1cm5cblxuXHRyZW5kZXJSZXN1bHQ6ID0+XG5cdFx0QCRyZXN1bHRzLmh0bWwoIEBzZWxlY3R2aWV3LnJlbmRlclJlc3VsdCgpIClcblx0XHRyZXR1cm5cblxuXHRpc09wZW46ID0+XG5cdFx0cmV0dXJuIEBzZWxlY3R2aWV3P1xuXG5cdGZvY3VzOiA9PlxuXHRcdGlmIEBzZWxlY3R2aWV3P1xuXHRcdFx0QHNlbGVjdHZpZXc/LmZvY3VzKClcblx0XHRcdHJldHVyblxuXHRcdEBvcGVuKClcblx0XHRyZXR1cm5cblxuXHRjbG9zZTogPT5cblx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0aWYgQHNlbGVjdHZpZXc/XG5cdFx0XHRAc2VsZWN0dmlldz8ub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3Py5jbG9zZSgpXG5cdFx0XHRyZXR1cm5cblx0XHRyZXR1cm5cblxuXHRnZW5lcmF0ZVN1YjogPT5cblx0XHRpZiBAc2VsZWN0dmlldz9cblx0XHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0cmV0dXJuIEBzZWxlY3R2aWV3XG5cdFx0XHRcblx0XHRAc2VsZWN0dmlldyA9IG5ldyBAbW9kZWwuU3ViVmlldyggc3ViOiBALCBtb2RlbDogQG1vZGVsLCBlbDogQCRzdWIgKVxuXHRcdEBhdHRhY2hTdWJFdmVudHMoKVxuXHRcdFx0XG5cdFx0QCRlbC5hcHBlbmQoIEBzZWxlY3R2aWV3LnJlbmRlcigpIClcblx0XHRpZiBAbW9kZWw/LmdldCggXCJ2YWx1ZVwiICk/XG5cdFx0XHRAc2VsZWN0dmlldy5zZWxlY3QoKVxuXHRcdHJldHVyblxuXHRcdFxuXHRhdHRhY2hTdWJFdmVudHM6ID0+XG5cdFx0QHNlbGVjdHZpZXcub24gXCJjbG9zZWRcIiwgKCByZXN1bHQgKT0+XG5cdFx0XHRAX2lzT3BlbiA9IGZhbHNlXG5cdFx0XHQjQHNlbGVjdHZpZXcub2ZmKClcblx0XHRcdEBzZWxlY3R2aWV3LnJlbW92ZSgpIGlmIG5vdCByZXN1bHQubGVuZ3RoXG5cdFx0XHQjQHNlbGVjdHZpZXcgPSBudWxsXG5cdFx0XHRAdHJpZ2dlciggXCJjbG9zZWRcIiwgcmVzdWx0IClcblx0XHRcdEByZW1vdmUoKSBpZiBub3QgcmVzdWx0Lmxlbmd0aFxuXHRcdFx0cmV0dXJuXG5cblx0XHRAc2VsZWN0dmlldy5vbiBcInNlbGVjdGVkXCIsICggbWRsICk9PlxuXHRcdFx0aWYgbWRsXG5cdFx0XHRcdEBzZWxlY3RlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdFxuXHRcdEBzZWxlY3R2aWV3Lm9uIFwicmVtb3ZlZFwiLCAoIG1kbCApPT5cblx0XHRcdGlmIG1kbFxuXHRcdFx0XHRAcmVtb3ZlZCggbWRsIClcblx0XHRcdHJldHVyblxuXHRcdHJldHVyblxuXHRcdFxuXHRvcGVuOiA9PlxuXHRcdEBnZW5lcmF0ZVN1YigpXG5cblx0XHRAc2VsZWN0dmlldz8uZm9jdXMoKVxuXHRcdEBfaXNPcGVuID0gdHJ1ZVxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdTdWJcbiIsIiIsIihmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZil9ZWxzZXt2YXIgZztpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7Zz13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7Zz1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe2c9c2VsZn1lbHNle2c9dGhpc31nLmphZGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgdHdvIGF0dHJpYnV0ZSBvYmplY3RzIGdpdmluZyBwcmVjZWRlbmNlXG4gKiB0byB2YWx1ZXMgaW4gb2JqZWN0IGBiYC4gQ2xhc3NlcyBhcmUgc3BlY2lhbC1jYXNlZFxuICogYWxsb3dpbmcgZm9yIGFycmF5cyBhbmQgbWVyZ2luZy9qb2luaW5nIGFwcHJvcHJpYXRlbHlcbiAqIHJlc3VsdGluZyBpbiBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH0gYVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICB2YXIgYXR0cnMgPSBhWzBdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgYXR0cnMgPSBtZXJnZShhdHRycywgYVtpXSk7XG4gICAgfVxuICAgIHJldHVybiBhdHRycztcbiAgfVxuICB2YXIgYWMgPSBhWydjbGFzcyddO1xuICB2YXIgYmMgPSBiWydjbGFzcyddO1xuXG4gIGlmIChhYyB8fCBiYykge1xuICAgIGFjID0gYWMgfHwgW107XG4gICAgYmMgPSBiYyB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYWMpKSBhYyA9IFthY107XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGJjKSkgYmMgPSBbYmNdO1xuICAgIGFbJ2NsYXNzJ10gPSBhYy5jb25jYXQoYmMpLmZpbHRlcihudWxscyk7XG4gIH1cblxuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGlmIChrZXkgIT0gJ2NsYXNzJykge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgbnVsbCBgdmFsYHMuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBudWxscyh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJyc7XG59XG5cbi8qKlxuICogam9pbiBhcnJheSBhcyBjbGFzc2VzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydHMuam9pbkNsYXNzZXMgPSBqb2luQ2xhc3NlcztcbmZ1bmN0aW9uIGpvaW5DbGFzc2VzKHZhbCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkodmFsKSA/IHZhbC5tYXAoam9pbkNsYXNzZXMpIDpcbiAgICAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKHZhbCkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIHZhbFtrZXldOyB9KSA6XG4gICAgW3ZhbF0pLmZpbHRlcihudWxscykuam9pbignICcpO1xufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gY2xhc3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBjbGFzc2VzXG4gKiBAcGFyYW0ge0FycmF5LjxCb29sZWFuPn0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmNscyA9IGZ1bmN0aW9uIGNscyhjbGFzc2VzLCBlc2NhcGVkKSB7XG4gIHZhciBidWYgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGVzY2FwZWQgJiYgZXNjYXBlZFtpXSkge1xuICAgICAgYnVmLnB1c2goZXhwb3J0cy5lc2NhcGUoam9pbkNsYXNzZXMoW2NsYXNzZXNbaV1dKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWYucHVzaChqb2luQ2xhc3NlcyhjbGFzc2VzW2ldKSk7XG4gICAgfVxuICB9XG4gIHZhciB0ZXh0ID0gam9pbkNsYXNzZXMoYnVmKTtcbiAgaWYgKHRleHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcgY2xhc3M9XCInICsgdGV4dCArICdcIic7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59O1xuXG5cbmV4cG9ydHMuc3R5bGUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIGlmICh2YWwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsKS5tYXAoZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgICByZXR1cm4gc3R5bGUgKyAnOicgKyB2YWxbc3R5bGVdO1xuICAgIH0pLmpvaW4oJzsnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIGF0dHJpYnV0ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGVzY2FwZWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGVyc2VcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gYXR0cihrZXksIHZhbCwgZXNjYXBlZCwgdGVyc2UpIHtcbiAgaWYgKGtleSA9PT0gJ3N0eWxlJykge1xuICAgIHZhbCA9IGV4cG9ydHMuc3R5bGUodmFsKTtcbiAgfVxuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwgfHwgbnVsbCA9PSB2YWwpIHtcbiAgICBpZiAodmFsKSB7XG4gICAgICByZXR1cm4gJyAnICsgKHRlcnNlID8ga2V5IDoga2V5ICsgJz1cIicgKyBrZXkgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfSBlbHNlIGlmICgwID09IGtleS5pbmRleE9mKCdkYXRhJykgJiYgJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeSh2YWwpLmluZGV4T2YoJyYnKSAhPT0gLTEpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2luY2UgSmFkZSAyLjAuMCwgYW1wZXJzYW5kcyAoYCZgKSBpbiBkYXRhIGF0dHJpYnV0ZXMgJyArXG4gICAgICAgICAgICAgICAgICAgJ3dpbGwgYmUgZXNjYXBlZCB0byBgJmFtcDtgJyk7XG4gICAgfTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwudG9JU09TdHJpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUud2FybignSmFkZSB3aWxsIGVsaW1pbmF0ZSB0aGUgZG91YmxlIHF1b3RlcyBhcm91bmQgZGF0ZXMgaW4gJyArXG4gICAgICAgICAgICAgICAgICAgJ0lTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyBcIj0nXCIgKyBKU09OLnN0cmluZ2lmeSh2YWwpLnJlcGxhY2UoLycvZywgJyZhcG9zOycpICsgXCInXCI7XG4gIH0gZWxzZSBpZiAoZXNjYXBlZCkge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIGV4cG9ydHMuZXNjYXBlKHZhbCkgKyAnXCInO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWwgJiYgdHlwZW9mIHZhbC50b0lTT1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS53YXJuKCdKYWRlIHdpbGwgc3RyaW5naWZ5IGRhdGVzIGluIElTTyBmb3JtIGFmdGVyIDIuMC4wJyk7XG4gICAgfVxuICAgIHJldHVybiAnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIic7XG4gIH1cbn07XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBhdHRyaWJ1dGVzIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge09iamVjdH0gZXNjYXBlZFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnRzLmF0dHJzID0gZnVuY3Rpb24gYXR0cnMob2JqLCB0ZXJzZSl7XG4gIHZhciBidWYgPSBbXTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXVxuICAgICAgICAsIHZhbCA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoJ2NsYXNzJyA9PSBrZXkpIHtcbiAgICAgICAgaWYgKHZhbCA9IGpvaW5DbGFzc2VzKHZhbCkpIHtcbiAgICAgICAgICBidWYucHVzaCgnICcgKyBrZXkgKyAnPVwiJyArIHZhbCArICdcIicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWYucHVzaChleHBvcnRzLmF0dHIoa2V5LCB2YWwsIGZhbHNlLCB0ZXJzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWYuam9pbignJyk7XG59O1xuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gc3RyaW5nIG9mIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIGphZGVfZW5jb2RlX2h0bWxfcnVsZXMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7J1xufTtcbnZhciBqYWRlX21hdGNoX2h0bWwgPSAvWyY8PlwiXS9nO1xuXG5mdW5jdGlvbiBqYWRlX2VuY29kZV9jaGFyKGMpIHtcbiAgcmV0dXJuIGphZGVfZW5jb2RlX2h0bWxfcnVsZXNbY10gfHwgYztcbn1cblxuZXhwb3J0cy5lc2NhcGUgPSBqYWRlX2VzY2FwZTtcbmZ1bmN0aW9uIGphZGVfZXNjYXBlKGh0bWwpe1xuICB2YXIgcmVzdWx0ID0gU3RyaW5nKGh0bWwpLnJlcGxhY2UoamFkZV9tYXRjaF9odG1sLCBqYWRlX2VuY29kZV9jaGFyKTtcbiAgaWYgKHJlc3VsdCA9PT0gJycgKyBodG1sKSByZXR1cm4gaHRtbDtcbiAgZWxzZSByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBSZS10aHJvdyB0aGUgZ2l2ZW4gYGVycmAgaW4gY29udGV4dCB0byB0aGVcbiAqIHRoZSBqYWRlIGluIGBmaWxlbmFtZWAgYXQgdGhlIGdpdmVuIGBsaW5lbm9gLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGluZW5vXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnJldGhyb3cgPSBmdW5jdGlvbiByZXRocm93KGVyciwgZmlsZW5hbWUsIGxpbmVubywgc3RyKXtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRXJyb3IpKSB0aHJvdyBlcnI7XG4gIGlmICgodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyB8fCAhZmlsZW5hbWUpICYmICFzdHIpIHtcbiAgICBlcnIubWVzc2FnZSArPSAnIG9uIGxpbmUgJyArIGxpbmVubztcbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgdHJ5IHtcbiAgICBzdHIgPSBzdHIgfHwgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4JylcbiAgfSBjYXRjaCAoZXgpIHtcbiAgICByZXRocm93KGVyciwgbnVsbCwgbGluZW5vKVxuICB9XG4gIHZhciBjb250ZXh0ID0gM1xuICAgICwgbGluZXMgPSBzdHIuc3BsaXQoJ1xcbicpXG4gICAgLCBzdGFydCA9IE1hdGgubWF4KGxpbmVubyAtIGNvbnRleHQsIDApXG4gICAgLCBlbmQgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIGxpbmVubyArIGNvbnRleHQpO1xuXG4gIC8vIEVycm9yIGNvbnRleHRcbiAgdmFyIGNvbnRleHQgPSBsaW5lcy5zbGljZShzdGFydCwgZW5kKS5tYXAoZnVuY3Rpb24obGluZSwgaSl7XG4gICAgdmFyIGN1cnIgPSBpICsgc3RhcnQgKyAxO1xuICAgIHJldHVybiAoY3VyciA9PSBsaW5lbm8gPyAnICA+ICcgOiAnICAgICcpXG4gICAgICArIGN1cnJcbiAgICAgICsgJ3wgJ1xuICAgICAgKyBsaW5lO1xuICB9KS5qb2luKCdcXG4nKTtcblxuICAvLyBBbHRlciBleGNlcHRpb24gbWVzc2FnZVxuICBlcnIucGF0aCA9IGZpbGVuYW1lO1xuICBlcnIubWVzc2FnZSA9IChmaWxlbmFtZSB8fCAnSmFkZScpICsgJzonICsgbGluZW5vXG4gICAgKyAnXFxuJyArIGNvbnRleHQgKyAnXFxuXFxuJyArIGVyci5tZXNzYWdlO1xuICB0aHJvdyBlcnI7XG59O1xuXG5leHBvcnRzLkRlYnVnSXRlbSA9IGZ1bmN0aW9uIERlYnVnSXRlbShsaW5lbm8sIGZpbGVuYW1lKSB7XG4gIHRoaXMubGluZW5vID0gbGluZW5vO1xuICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG59XG5cbn0se1wiZnNcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbn0se31dfSx7fSxbMV0pKDEpXG59KTsiLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2V0S2V5LCBpc0FycmF5LCB0b1N0cmluZztcblxuICB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG4gIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKGFycikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgX2dldEtleSA9IGZ1bmN0aW9uKGVsLCBrZXkpIHtcbiAgICByZXR1cm4gZWxba2V5XTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleXMsIGZvcndhcmQsIGdldEtleSkge1xuICAgIHZhciBmbnNvcnQsIHJlZjtcbiAgICBpZiAoZm9yd2FyZCA9PSBudWxsKSB7XG4gICAgICBmb3J3YXJkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGdldEtleSA9PSBudWxsKSB7XG4gICAgICBnZXRLZXkgPSBfZ2V0S2V5O1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXkoa2V5cykpIHtcbiAgICAgIGtleXMgPSBba2V5c107XG4gICAgfVxuICAgIGZuc29ydCA9IGZ1bmN0aW9uKGZvcndhcmQsIGtleSwgbmV4dGtleXMpIHtcbiAgICAgIHZhciBfZndyZCwgX2ssIG5leHRTb3J0LCByZWY7XG4gICAgICBpZiAobmV4dGtleXMgIT0gbnVsbCA/IG5leHRrZXlzLmxlbmd0aCA6IHZvaWQgMCkge1xuICAgICAgICBfayA9IChyZWYgPSBuZXh0a2V5cy5zcGxpY2UoMCwgMSkpICE9IG51bGwgPyByZWZbMF0gOiB2b2lkIDA7XG4gICAgICAgIGlmIChfayAhPSBudWxsKSB7XG4gICAgICAgICAgbmV4dFNvcnQgPSBmbnNvcnQoZm9yd2FyZCwgX2ssIG5leHRrZXlzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX2Z3cmQgPSAoZm9yd2FyZFtrZXldICE9IG51bGwgPyBmb3J3YXJkW2tleV0gOiAoZm9yd2FyZFtcIj9cIl0gIT0gbnVsbCA/IGZvcndhcmRbXCI/XCJdIDogZm9yd2FyZCkpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGVsQSwgZWxCKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIF9hID0gZ2V0S2V5KGVsQSwga2V5KTtcbiAgICAgICAgX2IgPSBnZXRLZXkoZWxCLCBrZXkpO1xuICAgICAgICBpZiAoX2EgPCBfYikge1xuICAgICAgICAgIGlmIChfZndyZCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoX2EgPiBfYikge1xuICAgICAgICAgIGlmIChfZndyZCkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoX2EgPT09IF9iKSB7XG4gICAgICAgICAgaWYgKG5leHRTb3J0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0U29ydChlbEEsIGVsQik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBmbnNvcnQoZm9yd2FyZCwgKHJlZiA9IGtleXMuc3BsaWNlKDAsIDEpKSAhPSBudWxsID8gcmVmWzBdIDogdm9pZCAwLCBrZXlzKTtcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
