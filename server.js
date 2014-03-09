var http = require("http");
var filesys = require("fs");
var url = require("url");
var path = require("path");
var mime = require("mime");

var clients = [];

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
   
   socket.on('sendMessage', function(data) {
      for (var i = 0; i < clients.length; i++) {
         var user = clients[i];
         if (user.chatroom === data.chatroom) {
            socketsIO.sockets.socket(user.id).emit('receiveMessage', data);
         }
      }
   });

   socket.on('newUser', function(data) {
      var user = new Object();
      user.id = socket.id;
      user.username = data.username;
      user.chatroom = data.chatroom;

      var participants = [];
      for (var i = 0; i < clients.length; i++) {
         var client = clients[i];
         if (client.username === user.username) {
            socket.emit('joinChatroom', {status : "Fail", message : "username taken"});
            return;
         } else if (client.chatroom == data.chatroom) {
            participants.push(client.username);
            socketsIO.sockets.socket(client.id).emit('receiveMessage', { user : "admin", message : data.username + " has joined the chat!" });
            socketsIO.sockets.socket(client.id).emit('userJoined', { username : data.username });
         }
      }
      participants.push(user.username);
      clients.push(user);
      socket.emit('receiveMessage', { user : "admin", message : "Welcome to the " + user.chatroom + ", " + user.username + "!<br>" 
                                                                + user.username + " has joined the chat!"} );
      socket.emit('joinChatroom', {status : "Success", participants : participants} );
   });

   socket.on('disconnect', function() {
      var chatroomLeft;
      var userLeft;
      for (var i = 0; i < clients.length; i++) {
         var client = clients[i];
         if (client.id == socket.id) {
            if (client.chatroom != null && client.username != null) {
               chatroomLeft = client.chatroom;
               userLeft = client.username;
            }
            clients.splice(i, 1);
            break;
         }
      }
      console.log(userLeft + '' + chatroomLeft);
      if (userLeft == null || chatroomLeft == null) {
         return;
      } 
      for (var q = 0; q < clients.length; q++) {
         if (clients[q].chatroom == chatroomLeft) {
            socketsIO.sockets.socket(clients[q].id).emit('userLeft', {user : userLeft});
            break;
         }
      }
   });
});
