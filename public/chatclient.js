window.onload = function() {
   var socket = io.connect("http://54.186.49.63:8080/");
   var chatDiv = document.getElementById("chatDiv");
   var messageInput = document.getElementById("messageInput");
   var submitMessage = document.getElementById("submitMessage");
   submitMessage.onclick = sendMessage;
   function sendMessage() {
      socket.emit('receiveMessageFromClient', { message : messageInput.value });
      messageInput.value = "";
   } 
   socket.on('sendMessageToClient', function(data) {
      if (data.message) {
         chatDiv.innerHTML = chatDiv.innerHTML + "<br>" + data.message;
      }
   });
}
