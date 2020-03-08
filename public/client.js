$(function(){
	var socket = io();

	var nick;
	var usercolor;

	/*checking for cookies*/
	user = getCookie("userId");
	color = getCookie("userColor");
	if (user != ""){
		nick = user;
		usercolor = color
		socket.emit("new user", true, nick, usercolor);
	}
	else{
		socket.emit("new user", false, "", "");
	}


	socket.on("load messages", function(userMessages){
		for(var i = 0; i < userMessages.length; i++)
        {
            $('#messages').append(userMessages[i]);
        }
        updateScroll();
	})

	socket.on("name generated", function(user){
		nick = user.nick;
		usercolor = user.color;
		setCookie("userId", user.nick,365);
		setCookie("userColor", user.color,365);
		$('#welcome').text('Welcome ' + nick);
		socket.emit("user joined", nick, usercolor);
	});

	socket.on("joined chat", function(time, name,color, userList){
		/*notifying other users a user has joined*/
		if (nick === name){
			$('#messages').append('<p>'+ time + '<span style= color:'+color+'>'+name+'</span><b> has joined the chat</b></p>');
		}
		else{
			$('#messages').append('<p>'+ time + '<span style= color:'+color+'>'+name+'</span> has joined the chat</p>');
		}
		updateUsers(userList);
		updateScroll();
	});


	/*taken from w3school.com */
	var input = document.getElementById("message")

	input.addEventListener("keyup", function(event) {
  	// Number 13 is the "Enter" key on the keyboard
  		if (event.keyCode === 13) {
    // Cancel the default action, if needed
    		event.preventDefault();
    // Trigger the button element with a click
    	document.getElementById("send").click();
  	}
	});

	/*when a message is sent*/
	$("#send").click(function(e){
		e.preventDefault();
		let message = $("#message").val();
		message = message.trimStart();
		if (!checkForEmpty(message)){
			if (message.charAt(0) === "/"){
				let words = message.split(' ');
				if (words[0] === '/nickcolor'){
					newColor = words[1];
					usercolor = "#"+newColor;
					setCookie("userColor", usercolor, 365);
					socket.emit("changedColors", nick, usercolor);
				}
				else if (words[0] === '/nick'){
					var new_words = words.shift();
					var newNick = words.join(" ")
					socket.emit("changedNick", nick, newNick);
				}
				else{
					$("#messages").append('<p style = color:red>'+ 'Invalid \"/\" command!' + ' </p>');
				}
			}
			else{
				socket.emit('chat', message, nick, usercolor)
			}

			$("#message").val(' ');
	}
	});

	socket.on("changedNick", function(newNick){
		nick = newNick;
		setCookie("userId", nick, 365);
		$('#welcome').text('Welcome ' + nick);
	});

	socket.on('chat', function(time,msg, name, color){
		if (nick === name){
			$("#messages").append('<p>'+ time + '<span style= color:'+color+'>'+name+'</span><b>: ' + msg +'</b></p>');
		}
		else{
			$("#messages").append('<p>'+ time + '<span style= color:'+color+'>'+name+'</span>: ' + msg +'</p>');
		}
		updateScroll();
	});

	socket.on('updateUsers', function(userList){
		updateUsers(userList);
	});

	socket.on("user taken", function(nick){
		$("#messages").append('<p style = color:red>'+ nick + ' is already taken</p>');
	});

	socket.on("disconnected", function(){
		socket.emit("delPerson", nick, usercolor);
	});


	var objDiv = $("#messages");
    console.log(objDiv.scrollTop);

});


function updateUsers(userList){
	$("#users").empty();
	for (let value of userList){
		let user = $('<p>').text(value.nick);
		/*user.css('color', value.color);*/
		$('#users').append(user);
	};
}


/*taken from stack overflow */
function updateScroll(){
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

/*taken from w3school.com */
function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function setCookie(cookiename, cookievalue, expirydays) {
  	var d = new Date();
  	d.setTime(d.getTime() + (expirydays * 24 * 60 * 60 * 1000));
  	var expires = "expires="+d.toUTCString();
  	document.cookie = cookiename + "=" + cookievalue + ";" + expires + ";path=/";
}

function checkForEmpty(value){
	return (!value || value == undefined || value == "" || value.length == 0);
}