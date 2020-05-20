

// dependecies

var http = require('http');
var https = require('https');
var url  = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// the server should respond to all request

var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});




// start the server 

httpServer.listen(config.httpPort, function(){
    console.log(`The server is listening on port ${config.httpPort}`);
});

// instantiate the https server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// start the https server
httpsServer.listen(config.httpsPort, function(){
    console.log(`The server is listening on port ${config.httpsPort}`);
});


//  all the server logic 
var unifiedServer = function(req, res) {
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
};

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