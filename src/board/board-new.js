'use strict';

angular.module('myApp.board', ['ngRoute'])
/*
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/board', {
    templateUrl: 'board/board.html',
    controller: 'boardCtrl'
  });
}])
*/
.controller('boardCtrl', ['$scope','$log', function($scope, $log) {
	$scope.team = '';
	$scope.opponent = '';
	$scope.teamNames = {fire:"Fire Nation", ice: "Ice Kingdom"};
	$scope.activePiece = null;
	$scope.river = [42,43,52,53,46,47,56,57];
	$scope.board = Array(100);
	$scope.roster = {};
	$scope.victor = null;
	$scope.deboer = ["2","6","5","9","2","6","2","10","6","2","7","2","T","S","8","4","2","7","8","4","5","4","T","2","7","3","5","6","5","T","3","T","4","2","3","T","3","3","T","F"];

	$scope.init = function(){
		for (var k=0; k < 100; k++){
			if ($scope.river.indexOf(k) >= 0){
				$scope.board[k] = 'void';
			}
			else{
				$scope.board[k] = null;
			}
		}
	};
	$scope.setTeam = function(team){
		$scope.team = team;
		$scope.opponent = (team === 'ice' ? 'fire' : 'ice');
		//$scope.$apply();
		//$scope.sdfs(team);
		$scope.initPieces(team);
	};
	$scope.initPieces = function(team){
		var addToBoard = function(element, index, array){
			console.log(typeof index);
			$scope.board[39-index] = {team: $scope.opponent, rank: element};
			//team
			$scope.board[60+index] = {team: $scope.team, rank: element};

			if($scope.roster[element]){
				$scope.roster[element] += 1;	
			}
			else{
				$scope.roster[element] = 1;
			}
		}
		$scope.deboer.forEach(addToBoard);
	};
	/*
	$scope.sdfs = function(team){
		$scope.board = [];
		
		//console.log($scope.piecesList);

		for (var k in $scope.piecesList){
			var currentPiece = $scope.piecesList[k];
			for (var i=0; i < currentPiece.total; i++){
				var newPiece = {
					team: $scope.opponent,
					rank: currentPiece.rank
				};
				//console.log(currentPiece.rank);
				$scope.board.push(newPiece);
			}
		}
		//for (var i=0; i< 40; i++){
		//	$scope.board.push({team: $scope.opponent, rank: null});
		//}
		for (var i=0; i< 20; i++){
			$scope.board.push(null);
		}
		for (var k in $scope.piecesList){
			var currentPiece = $scope.piecesList[k];
			for (var i=0; i < currentPiece.total; i++){
				var newPiece = {
					team: $scope.team,
					rank: currentPiece.rank
				};
				$scope.board.push(newPiece);
			}
			$scope.roster[currentPiece.rank] = currentPiece.total;
		}
		for (var k in $scope.river){
			$scope.board[$scope.river[k]] = 'void';
		}
	}; */
	/*
	$scope.initFromData = function (data){
		$scope.board = data;
	};
	*/
	var unhighlight = function(){
		//unhighlight
		$('[data-location].highlighted').removeClass('highlighted');
		$('[data-location].selected').removeClass('selected');
	}
	var calculateMoves = function(piece, board){
		board = $scope.board;
		piece.position = parseInt(piece.position);
		var posX = Math.floor(piece.position / 10);
		var posY = piece.position % 10;
		//board is 10x10 array
		var moveList = [];
		var addCoord = function(coord){
			if(coord < 0 || coord > board.length){
				return false;
			}
			else if(board[coord] === null){
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
	var teamIsDead = function(team, board){
		//for each of team's pieces, check moves.
		team = $scope.team;
		board = $scope.board;

		for (var i=0; i < board.length; i++){
			if (board[i].team && board[i].team === team){
				if (calculateMoves(board[i], board).length > 0){
					//if even one piece is able to move, team is not dead
					return false;
				}
			}
		}
		//if none of team's pieces are able to move
		$scope.victor = $scope.opponent;
		return true;
	};
	var movePiece = function(piece, newPosition, board){
		board = $scope.board;
		newPosition = parseInt(newPosition);
		var oldPosition = parseInt(piece.attr('position'));
		if (board[newPosition] === null){
			board[newPosition] = board[oldPosition];
			board[oldPosition] = null;
			console.log(piece.attr('team') + piece.attr('rank') + ' moved to ' + newPosition + '.');
			$scope.$apply();

			unhighlight();
		}
	};
	var attackPiece = function(attacker, defender, board){
		board = $scope.board;
		var attackerRankInt = parseInt(attacker.rank),
			defenderRankInt = parseInt(defender.rank),
			attackSuccess;

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
					$scope.victor = attacker.team;
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
			$scope.roster[attacker.rank] -= 1;
		}
		board[attacker.position] = null;
		$scope.$apply();

		unhighlight();

		return attackSuccess;
	};
	$scope.$on('SELECTPIECE', function(e, data){
		if ($('[data-location].selected').length < 1){
			$('[data-location='+data.piece.position+']').addClass('selected');
			$scope.$apply();

			//TODO: calculate moveList
			var moveList = calculateMoves(data.piece);
			for (var i in moveList){
				$('[data-location='+moveList[i]+']').addClass('highlighted');
			}
		}
	});
	$scope.$on('CANCELPIECE', function(e){
		unhighlight();
	});
	$scope.$on('ATTACKPIECE', function(e, data){
		var attacker = $('[data-location].selected piece');
		var defender = data.piece;
		
		//TODO: implement attack logic
		attackPiece({team: attacker.attr('team'), rank: attacker.attr('rank'), position: attacker.attr('position') }, defender);
	});
	$scope.$on('MOVEPIECE', function(e, data){
		var attacker = $('[data-location].selected piece');

		//TODO: implement move logic
		movePiece(attacker, data.position);
	});

	$scope.init();
}])
.directive('boardsquare', function(){
	return {
		restrict: 'C',
		scope: {
			position: '@'
		},
		link: function($scope, el, attr){
			el.on('click', function(e){
				if (el.hasClass('highlighted')) {
					$scope.$emit('MOVEPIECE', {position: $scope.position});	
				}
			});
		}
	}
})
.directive('piece', function(){
	return {
		restrict: 'E',
		scope: {
			team: '@',
			rank: '@',
			position: '@',
		},
		link: function($scope, el, attr){
			el.on('click', function(e){
				//console.log('CLICK PIECE');
				e.stopPropagation();
				//SECOND CLICK: ALREADY SELECTED
				if (el.parent().hasClass('selected')){
					//el.removeClass('selected');
					$scope.$emit('CANCELPIECE');
				}
				//SECOND CLICK: ALREADY HIGHLIGHTED
				else if (el.parent().hasClass('highlighted')) {
					$scope.$emit('ATTACKPIECE', {piece: {team: $scope.team, rank: $scope.rank, position: $scope.position}});	
				}
				//FIRST CLICK
				else{
					if ($scope.team === $scope.$parent.team){
						$scope.$emit('SELECTPIECE', {piece: {team: $scope.team, rank: $scope.rank, position: $scope.position}});

					}
				}
			});
		}
	}

});

//init board
//change to Pieces
//