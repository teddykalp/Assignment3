/*server variables*/
var express = require("express");
var app = require('express')();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var Sentencer = require("sentencer");
var port = 8080;
/*cookie variables*/
var cookie = require('cookies');
var cookieParser = require('cookie-parser');
/*users and message history*/
var userList = [];
var userMessages = [];
var userCount = 0;

/*variables for the user*/
io.on('connection', function(socket){

	/* anytime a user joins the chat, has a cookie or not*/
	socket.on('new user', function(bool,name,usercolor){
		if (bool != true){
			var valid = true
			while(valid){
				var user = getRandomNick();
				if(!checkforUser(user.nick)){
					valid = false;
					userList.push(user);
				}
				
			}
		}
		else{
			var user = {
				nick: name,
				color: usercolor
			};
			console.log(userList);
			if (!checkforUser(user.nick)){
				userList.push(user);
			}
			else{
				user = getRandomNick();
				userList.push(user);
			}
		}
		socket.emit("name generated", user);
		socket.emit("load messages", userMessages);
	});



	/*client has verified the user*/
	socket.on("user joined", function(name,color){
		let time = currentTime();
		message = ('<p>'+ time + '<span style= color:'+color+'>'+name+'</span> has joined the chat</p>');
		userMessages.push(message)
		userCount = userCount + 1;
		io.emit("joined chat", time, name, color, userList);
	});

	/* any message that is sent*/
	socket.on('chat', function(msg,name,color){
		let time = currentTime();
		let message = ('<p>'+ time + '<span style= color:'+color+'>'+name+'</span>: ' + msg +'</p>');
		userMessages.push(message);
		io.emit('chat', time,msg,name,color);
	});

	/* user has requested to change colors*/
	socket.on('changedColors', function(nick, newColor){
		for (var i in userList) {
			if (userList[i].nick === nick) {
	        	userList[i].color = "newColor";
	        	break;
			};
		};
		io.emit("updateUsers", userList);
	});

	/* user has requested to change names*/
	socket.on('changedNick', function(oldnick,newNick){
		if(!checkforUser(newNick)){
			for (var i in userList) {
				if (userList[i].nick === oldnick) {
		        	userList[i].nick = newNick;
		        	break;
				};
			};
			console.log(userList);
			io.emit("updateUsers", userList);
		}
		else{
			socket.emit("user taken", newNick);
		}
	});

	/* user has disconnected, update userlist */
	socket.on("delPerson", function(name, usercolor){
		var user = {
			nick: name,
			color: usercolor
		};
		if (!checkforUser(user.nick)){
			userList.push(user);
		}
		io.emit("updateUsers", userList);
	});

	/* user has disconnected */
	socket.on("disconnect", function(){
		userList = [];
		userCount = userCount - 1;
		console.log(userCount);
		io.emit("disconnected");
	});


});


/* checking if user is part of array */
function checkforUser(nick){
	for (var i in userList){
		if(userList[i].nick === nick){
			return true;
		}
	}
	return false;
}



/* generating a funny random nickname*/
function getRandomNick(){
	var nick_name = getRandomUser();
	var nick_color = getRandomColor();
	var user = {
		nick: nick_name,
		color: nick_color
	}
	return user;
}

function getRandomUser(){
	var ad = Sentencer.make("{{ adjective }}");
	ad = ad.charAt(0).toUpperCase() + ad.substring(1);

	var noun = Sentencer.make("{{ noun }}");
	noun = noun.charAt(0).toUpperCase() + noun.substring(1);

	return ad + " " + noun;
	
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function currentTime() {
    var displayTime;
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();

    if(minute < 10)
    {
        minute = "0" + minute;
    }
    if (hour >= 12){
        hour = hour -12;
        displayTime = hour + ":" + minute + "pm" + "   ";
    }
    else{
        displayTime = hour + ":" + minute + "am" + "   ";
    }
    return displayTime;
}


http.listen(port, function(){
	console.log("Connected on port: " + port)
});


app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

