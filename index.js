

// dependecies

var http = require('http');

// the server should respond to all request

var server = http.createServer(function(req, res) {
    res.end('Hello world\n');
});

// start the server 

server.listen(3000, function(){
    console.log("The server is listening on port 3000");
});