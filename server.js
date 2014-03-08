var http = require("http");
var filesys = require('fs');
var url = require("url");
var path = require('path');
var mime = require('mime');

var app = http.createServer(function(request, response) {
   var reqFile = url.parse(request.url).pathname;
   var filename = path.join("public/", reqFile);
   if (reqFile == "/") {
      filename = "views/index.html";
   }
   filesys.readFile(filename, "utf-8", function(error, data) {
      if (error) {
         response.writeHead(500);
         return response.end("Error");
      }
      response.writeHead(200, {'Content-Type': mime.lookup(filename)});
      response.write(data);
      response.end();
   });
});

app.listen(8080);

var socketsIO = require('socket.io').listen(app);

socketsIO.sockets.on('connection', function(socket) {
   socket.emit('sendMessageToClient', { message : "Welcome to the chat server" });
   socket.on('receiveMessageFromClient', function(data) {
      socketsIO.sockets.emit('sendMessageToClient', data);
   });
});
