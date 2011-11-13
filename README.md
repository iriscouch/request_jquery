# jQuery Request: The easiest HTTP library you'll ever see

jQuery Request is a port of Mikeal Rogers's excellent [request][req] library to the browser.

If you are secretly jealous of NodeJS people with their clever callbacks and no-nonsense APIs, jQuery Request is for you.

If you don't care about NodeJS, but simply want less tedium and verbosity for your AJAX code, jQuery Request is for you too.

# Examples

GET a resource:

    $.request('/some/resource.txt', function(er, resp, body) {
      if(er)
        throw er;
      console.log("I got: " + body);
    })

PUT a resource:

    $.request.put({uri:'/some/resource.xml', body:'<foo><bar/></foo>'}, function(er, resp, body) {
      if(er)
        throw new Error("XML PUT failed (" + er + "): HTTP status was " + resp.status);
      console.log("Stored the XML");
    })

To work with JSON, set `options.json` to be truthy and `$.request` will conveniently set the `Content-Type` and `Accept` headers, and handle parsing and serialization.

    $.request({json: true, method:'POST', url:'/db/', body:{"relaxed":true}, function(er, resp, result) {
      if(er)
        throw er;

      if(result.ok)
        console.log('Server ok, id = ' + result.id);
    })

You can also use this shorthand version (pass data into the `json` option directly):

    $.request({json: {"relaxed":true}, method:'POST', url:'/db/'} ...

## Convenient CouchDB

Finally, jQuery Request provides a CouchDB wrapper. It is the same as the JSON wrapper, however it will indicate an error if the HTTP query was fine, but there was a problem at the database level. The most common example is `409 Conflict`.

    $.request.couch({method:'PUT', url:'/db/existing_doc', body:{"will_conflict":"you bet!"}}, function(er, resp, result) {
      if(er.error === 'conflict')
        return console.error("Couch said no: " + er.reason); // Output: Couch said no: Document update conflict.

      if(er)
        throw er;

      console.log("Existing doc stored. This must have been the first run.");
    })

See the [NodeJS Request README][req] for several more examples. jQuery Request intends to maintain feature parity with Node request (except what the browser disallows). If you find a discrepancy, please submit a bug report. Thanks!

# Usage

The traditional way is to reference it like any other Javascript library.

    <script src="http://code.jquery.com/jquery-1.6.2.min.js"></script>
    <script src="request.jquery.js"></script>

jQuery Request also supports [RequireJS][rjs].

    define(['request.jquery'], function(request) {
      // `request` is ready
    })

[req]: https://github.com/mikeal/request
[rjs]: http://requirejs.org/
