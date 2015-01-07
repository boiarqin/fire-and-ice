'use strict';

angular.module('myApp.board', ['ngRoute'])
.controller('boardCtrl', ['$scope','$log', '$routeParams', 'mySocket', function($scope, $log, $routeParams, mySocket) {

	$scope.game = {
		gameId: $routeParams.gameId,
		team: '',
		opponent: '',
		teamNames: {fire:"Fire Nation", ice: "Ice Kingdom"},
		turn: '',
		activePiece: null,
		highlightedPieces: [],
		river: [42,43,52,53,46,47,56,57],
		board: Array(100),
		lastmove: {},
		roster: null,
		victor: null,
		hasSecondPlayer: false,
		start: false
	};
	$scope.connection = {
		roomFull: false,
		opponentDisconnect: false,
		opponentJoined: false,


	};
	$scope.deboer = [
		["2","6","5","9","2","6","2","10","6","2","7","2","T","S","8","4","2","7","8","4","5","4","T","2","7","3","5","6","5","T","3","T","4","2","3","T","3","3","T","F"],
		["9","6","2","4","2","2","2","3","6","2","3","2","8","7","T","5","10","7","5","8","T","6","S","7","5","2","6","5","T","4","4","2","3","T","4","3","3","T","F","T"],
		["2","8","5","2","6","2","9","3","2","6","10","2","7","8","2","6","T","5","T","5","6","4","7","S","7","5","T","4","T","4","3","2","3","3","4","T","F","T","3","2"],
		["6","2","4","9","6","2","2","10","2","6","5","2","7","5","T","2","7","7","8","3","4","8","S","3","T","2","6","5","5","T","3","T","4","T","4","2","3","3","T","F"],
		["10","6","5","3","2","6","2","2","2","6","4","2","8","8","9","2","4","T","T","5","7","2","7","S","6","5","T","4","5","2","7","3","3","3","4","T","F","T","T","3"],
		["6","2","2","5","2","6","3","10","2","6","5","4","T","S","9","2","7","7","8","2","4","T","4","7","8","5","T","5","6","4","2","3","T","2","3","T","F","T","3","3"],
		//["F","2","2","5","2","6","3","10","2","6","5","4","T","S","9","2","7","7","8","2","4","T","4","7","8","5","T","5","6","4","2","3","T","2","3","T","6","T","3","3"],
		//["T","T","2","5","T","T","3","10","T","T","5","4","2","S","9","2","7","7","8","2","4","F","4","7","8","5","2","5","6","4","2","3","6","2","3","2","6","6","3","3"],
   	];
	$scope.init = function(){
		for (var k=0; k < 100; k++){
			if ($scope.game.river.indexOf(k) >= 0){
				$scope.game.board[k] = 'void';
			}
			else{
				$scope.game.board[k] = {team: null};
			}
		}
		mySocket.emit('JOINGAME', {gameId: $scope.game.gameId});
		/*
		mySocket.on('reconnect', function(){
			console.log('reconnect');
			loadGame();
		});
*/
		mySocket.on('INITTEAM', function(data){
			if ($scope.game.team === ''){
				$scope.setTeam(data.team, true);
				$scope.game.turn = $scope.game.team;
			}
		});
		mySocket.on('SECONDPLAYERJOINED', function(data){
			$scope.game.hasSecondPlayer = true;
		});
		mySocket.on('BEGINGAMEPLAY', function(data){
			$scope.game.start = true;
			$scope.$watch('game.turn', function(newValue, oldValue){
				if (newValue === $scope.game.team && $scope.game.roster && !$scope.game.victor){
					//when it's my turn, check if my team is dead
					var deadTeam = isTeamDead();
					if (deadTeam){
						mySocket.emit('NOMOVESLEFT', {gameId: $scope.game.gameId, victor: $scope.game.victor, gameover: {noMovesLeft: true}});
					}
				}
			});
		});
		mySocket.on('MOVEPIECE', function(data){
			if (data.activePiece.team !== $scope.game.team){
				data.activePiece.position = translatePosition(data.activePiece.position);
				movePiece(data.activePiece, translatePosition(data.position));
				$scope.game.turn = $scope.game.team;
			}
			//saveGame();
		});
		mySocket.on('ATTACKPIECE2', function(data){
			if (data.attacker.team !== $scope.game.team){
				data.attacker.position = translatePosition(data.attacker.position);
				data.defender.position = translatePosition(data.defender.position);
			}
			attackPiece(data.attacker, data.defender);
			
			if (data.attacker.team !== $scope.game.team){
				if ($scope.game.victor){
					mySocket.emit('CAPTUREDFLAG', {gameId: $scope.game.gameId, victor: $scope.game.victor, gameover:{capturedFlag: true}});
				}
				$scope.game.turn = $scope.game.team;
			}
			else{
				$scope.game.turn = $scope.game.opponent;
			}
			//saveGame();
		});
		mySocket.on('IDENTIFYPIECE', function(data){
			if (data.defender.team === $scope.game.team){
				var defenderPosition = translatePosition(data.defender.position);
				data.defender.rank = $scope.game.board[defenderPosition].rank;

				mySocket.emit('DEFENDPIECE', data);
				console.log('IDENTIFYPIECE');
				console.log(data);
			}
		});
		mySocket.on('GAMEOVER', function(data){
			console.log('GAMEOVER');
			$scope.game.victor = data.victor;
			$scope.game.gameover = data.gameover;
			$scope.game.start = false;
		});
	};
	$scope.setTeam = function(team, fromServer){
		var fromServer = fromServer || false;

		$scope.game.team = team;
		$scope.game.opponent = (team === 'ice' ? 'fire' : 'ice');
		if (!fromServer){
			mySocket.emit('CHOOSETEAM', {gameId: $scope.game.gameId, team: team, teamName: $scope.game.teamNames[team]});
			$scope.game.turn = $scope.game.opponent;
		}
	};

	$scope.initPieces = function(configNumber){
		var addToBoard = function(element, index, array){
			$scope.game.board[39-index] = {team: $scope.game.opponent, rank: null};
			//team
			$scope.game.board[60+index] = {team: $scope.game.team, rank: element};

			if($scope.game.roster[element]){
				$scope.game.roster[element] += 1;	
			}
			else{
				$scope.game.roster[element] = 1;
			}
		}
		$scope.game.roster = {};
		$scope.deboer[parseInt(configNumber)].forEach(addToBoard);
		mySocket.emit('CONFIGUREDPIECES', {gameId: $scope.game.gameId});
		
	};
	$scope.clickme = function(){
		console.log('clickme');
	};
	var saveGame = function(){
		var gameDB = localStorage['fire-ice'];
		if (gameDB){
			gameDB = JSON.parse(gameDB);
			var saved = false;
			for (var i in gameDB){
				if (gameDB[i].gameState.gameId === $scope.game.gameId){
					gameDB[i].gameState = $scope.game;
					saved = true;
				}
			}
			if(!saved){
				gameDB.push({gameState: $scope.game});
			}
		}
		else{
			gameDB = [{gameState: $scope.game}];
		}
		localStorage['fire-ice'] = JSON.stringify(gameDB);
	};
	var loadGame = function(){
		var gameDB = localStorage['fire-ice'];
		if (gameDB){
			gameDB = JSON.parse(gameDB);
			var saved = false;
			for (var i in gameDB){
				if (gameDB[i].gameState.gameId === $scope.game.gameId){
					$scope.game = gameDB[i].gameState;
					return true;
				}
			}
		}
		return false;
	};
	var unhighlight = function(){
		$scope.game.highlightedPieces.forEach(function(obj){
			obj['highlighted'] = null;
		});
		$scope.game.highlightedPieces = [];
		if ($scope.game.activePiece){
			$scope.game.activePiece.$parent.$parent.selected = false;
			$scope.game.activePiece = null;
		}
	}
	
	var calculateMoves = function(piece, board){
		board = $scope.game.board;
		piece.position = parseInt(piece.position);
		var posX = Math.floor(piece.position / 10);
		var posY = piece.position % 10;
		//board is 10x10 array
		var moveList = [];
		var addCoord = function(coord){
			if(coord < 0 || coord >= board.length){
				return false;
			}
			else if(board[coord].team === null){
				moveList.push(coord);
				return true;
			}
			else if(board[coord].team && board[coord].team !== piece.team){
				moveList.push(coord);
				return false;
			}
			else {
				return false;
			}
		};

		if (piece.rank === 'T' || piece.rank === 'F'){
			return [];
		}
		else if (piece.rank === '2'){
			
			var xMinus = true,
				xPlus = true,
				yMinus = true,
				yPlus = true;
			
			for (var i = 1; i < 10; i++){
				// X - 1
				if (xMinus && (posY - i >= 0)){
					xMinus = addCoord(posX * 10 + posY - i);	
				}
				// X + 1
				if (xPlus && (posY + i <= 9)){
					xPlus = addCoord(posX * 10 + posY + i);	
				}
				// Y - 1
				if (yMinus){
					yMinus = addCoord((posX - i) * 10 + posY);	
				}
				// Y + 1
				if (yPlus){
					yPlus = addCoord((posX + i) * 10 + posY);	
				}
			}
		}
		else {
			var i = 1;
			if (posY - i >= 0){
				addCoord(posX * 10 + posY - i);	
			}
			if (posY + i <= 9){
				addCoord(posX * 10 + posY + i);	
			}
			addCoord((posX - i) * 10 + posY);	
			addCoord((posX + i) * 10 + posY);	
				
		}

		return moveList;
	};
	
	var isTeamDead = function(team, board){
		//for each of team's pieces, check moves.
		team = $scope.game.team;
		board = $scope.game.board;

		for (var i=0; i < board.length; i++){
			if (board[i].team && board[i].team === team){
				board[i].position = i;
				//console.log(i);
				//console.log(calculateMoves(board[i]).length);
				if (calculateMoves(board[i]).length > 0){
					//if even one piece is able to move, team is not dead
					return false;
				}
			}
		}
		//if none of team's pieces are able to move
		$scope.game.victor = $scope.game.opponent;
		return true;
	};

	var translatePosition = function(opponentPosition, board){
		board = $scope.game.board;
		return board.length - opponentPosition - 1;
	};
	
	var movePiece = function(piece, newPosition, board){
		board = $scope.game.board;
		newPosition = parseInt(newPosition);
		var oldPosition = parseInt(piece.position);
		unhighlight();
		if (board[newPosition].team === null){
			var temp = board[newPosition];
			board[newPosition] = board[oldPosition];
			board[oldPosition] = temp;
			console.log(piece.team + piece.rank + ' moved to ' + newPosition + '.');
		}
		$scope.game.lastmove = {type: 'move',
			attacker: {rank: piece.rank, team: piece.team, position: newPosition}};
	};
	
	var attackPiece = function(attacker, defender, board){
		board = $scope.game.board;
		var attackerRankInt = parseInt(attacker.rank),
			defenderRankInt = parseInt(defender.rank),
			attackSuccess;
		unhighlight();
		if (!isNaN(attackerRankInt)){
			if (!isNaN(defenderRankInt)){
				attackSuccess = (attackerRankInt >= defenderRankInt);
			}
			else if (defender.rank === 'T'){
				attackSuccess = (attackerRankInt === 3);
			}
			else{
				if (defender.rank === 'F'){
					//$scope.victory = true;
					$scope.game.victor = attacker.team;
				}
				//if defender is S or F
				attackSuccess = true;
			}
		}
		else {//if(attacker.rank === 'S'){
			attackSuccess = (defenderRankInt === 10);
		}

		console.log(attacker.team + attacker.rank + ' attacked ' + defender.team + defender.rank + '.');

		if (attackSuccess){
			board[defender.position] = board[attacker.position];
		}
		else{
			$scope.game.roster[attacker.rank] -= 1;
		}
		board[attacker.position] = {team: null};

		$scope.game.lastmove = {type: 'attack',
							attacker: {rank: attacker.rank, team: attacker.team, position: defender.position},
							defender: {rank: defender.rank, team: defender.team},
							outcome: (attackSuccess ? 'won' : 'lost')};

		return attackSuccess;
	};
	
	$scope.$on('SELECTPIECE', function(e, piece){
		if ($scope.game.activePiece === null){
			$scope.game.activePiece = piece;
			piece.$parent.$parent.selected = true;

			//TODO: calculate moveList
			var moveList = calculateMoves(piece);
			
			for (var i in moveList){
				$scope.game.board[moveList[i]]['highlighted'] = true;
				$scope.game.highlightedPieces.push($scope.game.board[moveList[i]]);
			}
			
			
		}
	});
	
	$scope.$on('CANCELPIECE', function(e){
		unhighlight();
	});
	
	$scope.$on('ATTACKPIECE', function(e, data){
		mySocket.emit('ATTACKPIECE',
			{gameId: $scope.game.gameId,
			attacker: {team: $scope.game.activePiece.team, rank: $scope.game.activePiece.rank, position: $scope.game.activePiece.position},
			defender: {team: data.team, position: data.position}});
		//attackPiece($scope.activePiece, data);
		//$scope.turn = $scope.opponent;
	});

	$scope.$on('MOVEPIECE', function(e, data){
		mySocket.emit('MOVEPIECE', {gameId: $scope.game.gameId, activePiece: {team: $scope.game.activePiece.team, position: $scope.game.activePiece.position}, position: data})
		movePiece($scope.game.activePiece, data);
		$scope.game.turn = $scope.game.opponent;
	});

	$scope.init();
}]);


