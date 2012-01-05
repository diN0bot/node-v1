var Buffer = require('buffer').Buffer;

var sprintf = require('sprintf').sprintf;
var http = require('http');
var https = require('https');

/** low level API objects that simply perform HTTP requests. */

var PROTOS = {
  'http': http,
  'https': https
};

function setInitialFields(obj, fields) {
  fields.forEach(function(field) {
    obj['_' + field] = null;
  });
}

// attaches prototype methods to a builder object.
function builderFactory(obj, fields) {
  // return this builder as a simple hash.
  obj.prototype.toHash = function(stripNulls) {
    if (stripNulls !== false) {
      stripNulls = true;
    }
    var hash = {},
        self = this;
    fields.forEach(function(field) {
      if (self['_' + field] === null && !stripNulls || self['_' + field]) {
        hash[field] = self['_' + field];
      }
    });
    return hash;
  };
  
  // shallow clone method.
  obj.prototype.clone = function() {
    var newObj = new obj();
    var self = this;
    fields.forEach(function(field) {
      newObj['_' + field] = self['_' + field]; 
    });
    return newObj;
  };
  
  // create a builder function for each property.
  fields.forEach(function(field) {
    obj.prototype[field] = function(s) {
      this['_' + field] = s;
      return this;
    }
  });  
}

var CONNECTION_FIELDS = ['host', 'port', 'proto', 'org', 'version', 'user', 'pass']; 
var QUERY_FIELDS = ['sel', 'find', 'findin', 'where'];

/** Builder for connection information. see CONNECTION_FIELDS */
function ConnectionBuilder() {
  setInitialFields(this, CONNECTION_FIELDS);
}
builderFactory(ConnectionBuilder, CONNECTION_FIELDS);

/** Builder for query string. see QUERY_FIELDS */
function QueryBuilder() {
  setInitialFields(this, QUERY_FIELDS);
}
builderFactory(QueryBuilder, QUERY_FIELDS);

/**
 * converts query to URI encoded string.
 */
QueryBuilder.prototype.toString = function() {
  var s = '?',
      self = this;
  QUERY_FIELDS.forEach(function(field) {
    if (self['_' + field] != null && self['_' + field] !== undefined) {
      s += field + '=' +  encodeURIComponent(self['_' + field]) + '&';
    }
  });
  if (s[s.length-1] === '&') {
    s = s.substring(0, s.length - 1);
  }
  return s;
};

// lower cases the first letter of a string.
function lowerFirstChar(s) {
  if (s && s.length > 0) {
    return s[0].toLowerCase() + s.substring(1);
  } else {
    return s;
  }
}

// we'll probably add asset types as we begin caring about them.
var ASSET_TYPES = ['Story', 'Defect', 'Task'];

/**
 * create a V1 instance.
 * @param {ConnectionBuilder} config v1 configuration.
 */
function RawV1(config) {
  this.options = config.toHash();
}

// create the methods for each asset type. that way you can call new V1().defect(...);
ASSET_TYPES.forEach(function(asset) {
  // all callbacks are callback(err, statusCode, results).
  RawV1.prototype[lowerFirstChar(asset)] = function(queryBuilder, callback) {
    doRequest(this, asset, queryBuilder, callback);
  }
  
});


/**
 * creates a URL suitable for an HTTP request. Exposed for testing.
 * @param {String} asset V1 asset type.
 * @param {QueryBuilder} queryBuilder query builder.
 */
RawV1.prototype.makeUrl = function(asset, queryBuilder) {
  var path = sprintf('/%s/%s/Data/%s', this.options.org, this.options.version, asset);
  if (queryBuilder) {
    path += queryBuilder.toString();
  }
  return path;
};

/**
 * performs the HTTP work for all requests.
 * @param {RawV1} v1 instance to operate on
 * @param {String} asset type of asset (Story, Defect, etc.)
 * @param {QueryBuilder} queryBuilder builds the query string.
 * @param {Function} callback expects (error, statusCode, results);
 */
function doRequest(v1, asset, queryBuilder, callback) {
  var path = v1.makeUrl(asset, queryBuilder);
  var headers = {};
  
  // address basic auth.
  if (v1.options.user) {
    headers['Authorization'] = 'Basic ' + new Buffer(v1.options.user + ':' + v1.options.pass).toString('base64')
  }
  
  // perform the request.
  var req = PROTOS[v1.options.proto].request({
    host: v1.options.host,
    port: v1.options.port,
    method: 'GET', // everything in V1 is via GET.
    path: path,
    headers: headers
  }, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk.toString('utf8');
    });
    res.on('end', function() {
      callback(null, res.statusCode, data);    
    });
  });
  req.on('error', function(e) {
    callback(e, null, null);
  });
  req.end();
};

exports.QueryBuilder = QueryBuilder;
exports.ConnectionBuilder = ConnectionBuilder;
exports.RawV1 = RawV1;


