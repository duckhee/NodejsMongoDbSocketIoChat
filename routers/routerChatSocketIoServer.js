// Setup basic express server
var express = require('express');
var www = require('../bin/www');
var repositoryUser = require('../repository/repositoryUser');
var io;
var routeChatSocketIoServer = express.Router();

routeChatSocketIoServer.get('/', function(request, response) {

});
console.log('io ' + io);
routeChatSocketIoServer.post('/', function(request, response) {

	io = www.socketIo.connection;
	// user details which are currently connected to the chat
	var clients = [];
	io.sockets.on('connection', function(socket) {
		console.info("socketio connection open");

		// when the client emits 'add user', this listens and executes
		socket.on('add user', function(userId) {
			console.info("login userId " + userId);
			var client = clients.filter(function(clientItem) {
				console.info("login clientItem userId " + clientItem.clientId);
				return (clientItem.clientId == userId);
			});
			if (client.length > 0) {
				console.info("already login");
				socket.emit('login', {
					socketId : socket.id
				});
				return;
			} else {
				// we store the username,status in the socket session for this client
				socket.username = userId;
				socket.status = "Available";

				// add the client's details to the global list
				clients.push({
					clientId : socket.username,
					socketId : socket.id,
					status : socket.status
				});
			}

			socket.emit('login', {
				socketId : socket.id
			});

		});

		// when the client emits 'getuserList', this listens and executes
		socket.on('getUserList', function(data) {
			console.log("get User List for user " + data);
			repositoryUser.getUserList( function(err, docs) {
				if (err) {
					console.log("get user List error" + err);
					socket.userList = null;
				}
				if (docs != null) {
					socket.userList = docs;
					socket.userList.forEach(function(item) {
						var client = clients.filter(function(clientItem) {
							return (clientItem.clientId == item.id);
						});
						if (client.length > 0) {
							console.log(client);
							item.socketId = client[0].socketId;
							item.status = client[0].status;
						}
						if (item.socketId != '') {
							console.log("user joined " + item.socketId);
							// echo globally (all clients) that a person has connected
							io.to(item.socketId).emit('user joined', {
								clientId : socket.username,
								socketId : socket.id,
								status : socket.status
							});
						}
					});
				}
				socket.emit('getUserList', {
					userList : JSON.stringify(socket.userList)
				});
				console.log("get user List " + JSON.stringify(socket.userList));

			});

		});

		// when the client emits 'new message', this listens and executes
		socket.on('new message', function(data) {
			console.log("new message : " + JSON.stringify(data));
			var sendData = JSON.parse(data);
			// we tell the client to execute 'new message'
			io.to(sendData.toSocketId).emit('new message', {
				fromSocketId : socket.id,
				messageData : sendData.messageData
			});
		});

		// when the client emits 'typing', we emit it to others
		socket.on('typing', function(data) {
			console.log("typing " + data);
			io.to(data).emit('typing', {
				socketId : socket.id
			});
		});

		// when the client emits 'stop typing', we emit it to others
		socket.on('stop typing', function(data) {
			console.log("stop typing " + data);
			io.to(data).emit('stop typing', {
				socketId : socket.id
			});
		});

		// when the client emits 'status', we emit it to others
		socket.on('status', function(data) {
			console.log("status " + socket.id + ' ' + data);
			socket.status = data;

			socket.userList.forEach(function(item) {
				if (item.socketId != '') {
					console.log("status " + item.socketId);
					io.to(item.socketId).emit('status', {
						status : socket.status,
						socketId : socket.id
					});
				}
			});
			var client = clients.filter(function(clientItem) {
				return (clientItem.socketId == socket.id);
			});
			if (client.length > 0) {
				client[0].status = data;
			}
		});

		// when the user disconnects.. perform this
		socket.on('disconnect', function() {
			console.log(("disconnect " + socket.id));
			if (socket.userList != null && socket.List != '' && socket.userList != undefined && socket.userList.length > 0) {
				socket.userList.forEach(function(item) {
					if (item.socketId != '') {
						io.to(item.socketId).emit('user left', {
							clientId : socket.username,
							socketId : socket.id
						});
					}
				});
			}
			var client = clients.filter(function(clientItem) {
				return (clientItem.socketId == socket.id);
			});
			console.log("disconnect " + client.length);
			if (client.length > 0) {
				var index = clients.indexOf(client[0]);
				console.log("disconnect " + index);
				delete clients[index];
			}
		});
	});

	console.log("socketio server created");
});
module.exports = routeChatSocketIoServer;

