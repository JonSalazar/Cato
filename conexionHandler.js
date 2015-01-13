module.exports = function(socket) 
{
	var globales = require('./globales');
	var myName;
	var binUser;
	var myType;
	var index;
	var indexGame;
	var countTurns = 0;

	var wantGame = function(data) {
		myName = data.username;
		console.log('user ' + myName + ' wants to play');

		globales.playerName.push(myName);
		globales.player.push(socket);

		index = globales.player.length - 1;
		
		binUser = globales.player.length % 2 === 0 ? 1 : 0;
		myType = binUser === 0 ? 'O' : 'X';

		indexGame = globales.playerTurn.length;
		if (binUser === 1) {
			globales.playerTurn.push(0);

			console.log('Start Game');
			var otherPlayer = globales.player[ index - 1 ];
			var otherName = globales.playerName[ index - 1 ];

			socket.emit('start', {nemesis: otherName, tipo: 'O'});
			otherPlayer.emit('start', {nemesis: myName, tipo: 'X'});
			otherPlayer.emit('go');

			var newBoard = [[],[],[]];
			for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
				newBoard[ i ][ j ] = '*';
			}
			globales.board.push(newBoard);
		}
	}

	var newMove = function(data) {
		var who = globales.playerTurn[ indexGame ];
		if (binUser === who) {
			if (data.x >= 3 || data.y >= 3 || globales.board[ indexGame ][data.x][data.y] !== '*') {
				console.log('invalid move from ' + myName);
				thisPlayer.emit('error', {message: 'movimiento invalido'});
				return;
			}
			console.log('player ' + myName + ' put on ' + data.x + ' ' + data.y);

			var otherIndex = binUser === 0 ? index + 1 : index - 1;
			if (globales.board[ indexGame ][data.x][data.y] === '*') {
				globales.board[ indexGame ][data.x][data.y] = myType;
				socket.emit('updateBoard', {tipo: myType, x: data.x, y: data.y});
				globales.player[ otherIndex ].emit('updateBoard', {tipo: myType, x: data.x, y: data.y});
				
				globales.playerTurn[ indexGame ] = (who + 1) % 2;
				globales.player[ otherIndex ].emit('go');

				countTurns++;
				if (win()) { // win or lose
					socket.emit('endGame', {resultado: 'Win'});
					globales.player[ otherIndex ].emit('endGame', {resultado: 'Lose'});

					console.log("END GAME");
					socket.disconnect();
					globales.player[ otherIndex ].disconnect();
				}
				if (countTurns >= 5) { // draw
					socket.emit('endGame', {resultado: 'Draw'});
					globales.player[ otherIndex ].emit('endGame', {resultado: 'Draw'});
					socket.disconnect();
					globales.player[ otherIndex ].disconnect();
				}
			}
		}
	}

	var bye = function() {
		console.log(myName + ' abandoned');
		if (globales.player.length - 1 == index) { // out with no opponent
			globales.player.splice(index, 1);
		}
	}

	socket.on('wantGame', wantGame);
	socket.on('newMove', newMove);
	socket.on('disconnect', bye);


	function win() {
		var cont = 0;
		// check rows
		for (var i = 0; i < 3; i++) {
			cont = 0;
			for (var j = 0; j < 3; j++) if (globales.board[ indexGame ][ i ][ j ] === myType) {
				cont++;
			}
			if (cont === 3) return true;
		}
		// check columns
		for (var i = 0; i < 3; i++) {
			cont = 0;
			for (var j = 0; j < 3; j++) if (globales.board[ indexGame ][ j ][ i ] === myType) {
				cont++;
			}
			if (cont === 3) return true;
		}
		// check diagonals
		cont = 0;
		for (var i = 0; i < 3; i++) {
			if (globales.board[ indexGame ][ i ][ i ] === myType) cont++;
		}
		if (cont === 3) return true;
		cont = 0;
		for (var i = 0; i < 3; i++) {
			if (globales.board[ indexGame ][ 2 - i ][ i ] === myType) cont++;
		}
		return cont === 3;
	}
}