window.onload = function() {
   var socket = io.connect("");
   var chatDiv = document.getElementById("chatMessages");
   var messageInput = document.getElementById("messageInput");
   var joinChatRoom = document.getElementById("joinChatRoom");
   var submitMessage = document.getElementById("submitMessage");
   var partipicants = document.getElementById("participants");

   var currentChatroom;
   var currentUsername;
   var currentParticipants;   

   submitMessage.onclick = sendMessage;
   function sendMessage() {
      socket.emit('sendMessage', { message : messageInput.value, user : currentUsername, chatroom : currentChatroom });
      messageInput.value = "";
   }

   joinChatRoom.onclick = regUserJoinChat;
   function regUserJoinChat() {
      var chatrooms = document.getElementsByName("chatroom");
      var user = document.getElementById("username");
      if (user.value != null && user.value.length > 0) {
         for (var i = 0; i < chatrooms.length; i++) {
            var room = chatrooms[i];
            if (room.checked == true) {
               socket.emit('newUser', { username : user.value, chatroom : room.value } );
               currentChatroom = room.value;
               currentUsername = user.value;
               break;
            }
         }
      }
   } 

   function updateParticipants() {
      participants.innerHTML = "";
      for (var i = 0; i < currentParticipants.length; i++) {
         participants.innerHTML += currentParticipants[i] + "<br>";
      }
   }

   socket.on('receiveMessage', function(data) {
      if (data.message) {
         chatDiv.innerHTML = chatDiv.innerHTML + "<br>" + data.user + ": " + data.message;
      }
   });

   socket.on('joinChatroom', function(data) {
      currentParticipants = data.participants;
      updateParticipants();
      document.getElementById("chatWindow").style.display = 'block';
   });

   socket.on('userLeft', function(data) {
      participants.innerHTML = "";
      for (var i = 0; i < currentParticipants.length; i++) {
         if (data.user === currentParticipants[i]) {
            currentParticipants.splice(i, 1);
            break;
         }
      }
      updateParticipants();
   });

   socket.on('userJoined', function(data) {
      participants.innerHTML += data.username + "<br>";
   });
   window.onbeforeunload = function() {
      socket.disconnect();
   };
}
