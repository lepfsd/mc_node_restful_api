

// dependecies

var http = require('http');
var url  = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// the server should respond to all request

var server = http.createServer(function(req, res) {


    // get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    var queryStringObject = parsedUrl.query;

    // get the http method
    var method = req.method.toLowerCase();

    //get the headers
    var headers = req.headers;

    // get the payloads
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        //choose the handler
        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
        // construct the data
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // route the request to the handler
        choosenHandler(data, function(statusCode, payload){

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            
            // send the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);   
            console.log('returning this response: ' , statusCode, payloadString); 
        });
        
    });

});



// start the server 

server.listen(3000, function(){
    console.log("The server is listening on port 3000");
});

// define handlers 
var handlers = {};

handlers.sample = function(data, callback) {
    callback(406,{'name': 'sample handler'});
};

handlers.notFound = function(data, callback) {
    callback(404);
};


// define a request router
var router = {
    'sample': handlers.sample
};