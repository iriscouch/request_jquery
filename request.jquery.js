(function() {
var define = window.define
if(!define) define = function(deps, definer) {
  if(!window.jQuery)
    throw new Error("Can't find jQuery");
  return definer(window.jQuery);
}

define(['jquery'], function(jQuery) {

//
// request.jquery
//

var DEFAULT_TIMEOUT = 3 * 60 * 1000; // 3 minutes

function request(options, callback) {
  options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  if (!options.uri)
    throw new Error("options.uri is a required argument");
  else if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  ; ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect'].forEach(function(opt) {
    if(options[opt])
      throw new Error("options." + opt + " is not supported");
  })

  options.method = options.method || 'GET';
  options.headers = options.headers || {};

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.body)
    options.headers['content-length'] = options.body.length;

  var beforeSend = function(xhr, settings) {
    for (var key in options.headers)
      xhr.setRequestHeader(key, options.headers[key]);
  }

  // Establish a place where the callback arguments will go.
  var result = [];

  var onSuccess = function(data, reason, xhr) {
    result = [null, xhr, data];
  }

  var onError = function (xhr, reason, er) {
    var body = undefined;

    if(!er) {
      if(reason == 'timeout') {
        er = new Error("Request timeout");
      } else if(reason == 'error') {
        if(xhr.status > 299 && xhr.responseText.length > 0) {
          // Looks like HTTP worked, so there is no error as far as request is concerned. Simulate a success scenario.
          er = null;
          body = xhr.responseText;
        }
      } else {
        er = new Error("Unknown error; reason = " + reason);
      }
    }

    result = [er, xhr, body];
  }

  var onComplete = function(xhr, reason) {
    if(result.length === 0)
      result = [new Error("Result does not exist at completion time")];
    return callback && callback.apply(this, result);
  }


  var cors_creds = !!( options.creds || options.withCredentials );

  return jQuery.ajax({ 'async'      : true
                     , 'cache'      : (options.cache || false)
                     , 'contentType': (options.headers['content-type'] || 'application/x-www-form-urlencoded')
                     , 'type'       : options.method
                     , 'url'        : options.uri
                     , 'data'       : (options.body || undefined)
                     , 'timeout'    : (options.timeout || DEFAULT_TIMEOUT)
                     , 'dataType'   : 'text'
                     , 'processData': false
                     , 'beforeSend' : beforeSend
                     , 'success'    : onSuccess
                     , 'error'      : onError
                     , 'complete'   : onComplete
                     , 'xhrFields'  : { 'withCredentials': cors_creds
                                      }
                     });

};

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  request[shortcut.toLowerCase()] = function(opts) {
    opts = JSON.parse(JSON.stringify(opts));
    opts.method = shortcut.toUpperCase();

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

request.json = function(options, callback) {
  options = JSON.parse(JSON.stringify(options));
  options.headers = options.headers || {};
  options.headers['accept'] = options.headers['accept'] || 'application/json';

  if(options.method !== 'GET')
    options.headers['content-type'] = 'application/json';

  return request(options, function(er, resp, body) {
    if(!er)
      body = JSON.parse(body)
    return callback && callback(er, resp, body);
  })
}

request.couch = function(options, callback) {
  return request.json(options, function(er, resp, body) {
    if(er)
      return callback && callback(er, resp, body);

    if((resp.status < 200 || resp.status > 299) && body.error)
      // The body is a Couch JSON object indicating the error.
      return callback && callback(body, resp);

    return callback && callback(er, resp, body);
  })
}

jQuery(document).ready(function() {
  jQuery.request = request;
})

  });
})();
