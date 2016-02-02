var express = require("express"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	nicknames = {},
	user = {}
	
server.listen(3000);

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});
	
io.sockets.on("connection", function(socket) {

	socket.on("new user", function(data, callback) {
		if (data in nicknames) {
			//callback(false);
			
			callback(true);
			socket.nickname = data;
			/**
				nicknames.user = {}
				user = nicknames.user
				user.username = socket.nickname
				user.socket = socket
			**/
			//nicknames.username = socket.nickname
			nicknames[socket.nickname] = socket;
			updateUsers();
		}
		else {
			callback(true);
			socket.nickname = data;
			nicknames[socket.nickname] = socket;
			updateUsers();
		}
	});
	
	socket.on("send message", function(data) {
		data = data.trim();
		if (data.substr(0, 1) === "@") {
			
			delimiter = data.indexOf(" ");
			var name = data.substr(1, delimiter).trim();
			var message = data.substr(delimiter + 1);
			
			console.log("Private Message");
			console.log(name);
			console.log(name == "Katz");
			console.log("Message: " + message);
			
			//console.log(name in nicknames);
			console.log("nicknames: ",  nicknames[name]);
			
			//console.log("nicknames (hardcoded): ",  nicknames['Katz']);
			
			if (name in nicknames) {
				nicknames[name].emit("private message", {
					user: socket.nickname, 
					message: message
				});
			}
			else {
				console.log("Name not found!");
			}
		}
		else {
			io.sockets.emit("new message", {
				user: socket.nickname, 
				message: data
			});
		}
	});
	
	socket.on("disconnect", function(data) {
		if (!socket.nickname) {
			return;
		}
		//delete nicknames[socket.nickname];
		//nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		//updateUsers();
	});
	
	function updateUsers() {
	
		io.sockets.emit("usernames", Object.keys(nicknames));
	}
});