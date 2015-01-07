var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('src'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


var game = io.of('/game');
game.on('connection', function(socket){
	console.log('User connected to /game');
	socket.broadcast.emit('SECONDPLAYERJOINED', {id:'sdf'});
	socket.on('JOINGAME', function(data){
		var gameId = data.gameId + '';
		var opponentId;
		//does room exist? if so, you are first player
		if (game.adapter.rooms[gameId] === undefined){
			console.log('User ' + socket.id + ' has joined Game #' + gameId);
			socket.join(gameId);
		}
		//room exists. You are second player.
		else if (game.adapter.rooms[gameId] && Object.keys(game.adapter.rooms[gameId]).length < 2){
			console.log('User ' + socket.id + ' has joined Game #' + gameId);
			socket.join(gameId);
			game.to(gameId).emit('SECONDPLAYERJOINED');
		}
		//room already has 2 players. You are observer
		else{
			console.log('Game #' + gameId + ' is full.');
		}

	});
  	socket.on('CHOOSETEAM', function(data){
  		game.to(data.gameId).emit('INITTEAM',{team: (data.team === 'ice' ? 'fire' : 'ice')});
  	});
  	socket.on('CONFIGUREDPIECES', function(data){
  		socket.broadcast.to(data.gameId).emit('BEGINGAMEPLAY');
  	});
	socket.on('ATTACKPIECE', function(data){
		console.log('ATTACKPIECE')
		console.log(data);
		game.to(data.gameId).emit('IDENTIFYPIECE', data);
	});
	socket.on('DEFENDPIECE', function(data){
		console.log('DEFENDPIECE');
		console.log(data);
		game.to(data.gameId).emit('ATTACKPIECE2', data);
	});
	socket.on('MOVEPIECE', function(data){
		game.to(data.gameId).emit('MOVEPIECE', data);
	});
	socket.on('NOMOVESLEFT', function(data){
		console.log('NOMOVESLEFT');
		game.to(data.gameId).emit('GAMEOVER', data);
	});
	socket.on('CAPTUREDFLAG', function(data){
		console.log('CAPTUREDFLAG');
		game.to(data.gameId).emit('GAMEOVER', data);
	});
	socket.on('reconnect', function(data){
		console.log('RECONNECT');
	})
});
/*
io.on('connection', function(socket){
});
*/
http.listen(3000, function(){
  console.log('Listening on *:3000');
});