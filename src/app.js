'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  	'ngRoute',
  	'btford.socket-io',
	'myApp.board',
	'myApp.stats'
])
.factory('mySocket', function (socketFactory) {
	var mySocket = socketFactory({
		ioSocket : io('/game')
	});

	mySocket.emit('hello');

  	return mySocket;
})
.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/', {
			templateUrl: 'lobby/lobby.html'
		}).
		when('/game/:gameId',{
			templateUrl: 'game/game.html'
		}).
		otherwise({
			redirectTo: '/'
		});
}])
.controller('myAppController', ['$scope', function($scope){
	//$scope.piecesList = [ {"rank":"10","pieceName":"Dragon","total":1,"ability":"Can fly in a straight line over occupied squares" }, {"rank":"9","pieceName":"Sorceress","total":1,"ability":"Can force a pieceName up to 2 squares away to reveal itself" }, {"rank":"8","pieceName":"Knight","total":2,"ability":"Can move 2 spaces in a straight line by revealing itself" }, {"rank":"7","pieceName":"Shifter","total":3,"ability":"Can move 2 spaces in a straight line by revealing itself" }, {"rank":"6","pieceName":"Mage","total":4,"ability":"Can Hypnotize a pieceName to join you if it's a lower level and it's 1 or 2 squares away" }, {"rank":"5","pieceName":"Elemental","total":4,"ability":"Can attack all adjacent and diagonal squares" }, {"rank":"4","pieceName":"Elf","total":4,"ability":"Can attack something up to three squares away without risk" }, {"rank":"3","pieceName":"Dwarf","total":5,"ability":"Can take out traps" }, {"rank":"2","pieceName":"Scout","total":8,"ability":"Can move any distance in a straight line" }, {"rank":"S","pieceName":"Slayer","total":1,"ability":"Can defeat the Dragon, but is beaten by all including dragon if it is attacked first" }, {"rank":"T","pieceName":"Trap","total":6,"ability":"Destroys any pieceName except Dwarf, cannot move" }, {"rank":"F","pieceName":"Flag","total":1,"ability":"Wins/loses the game when captured, cannot move" }];
	$scope.piecesList = [ {"rank":"10","pieceName":"Dragon","total":1,"ability":"" }, {"rank":"9","pieceName":"Sorceress","total":1,"ability":"" }, {"rank":"8","pieceName":"Knight","total":2,"ability":"" }, {"rank":"7","pieceName":"Shifter","total":3,"ability":"" }, {"rank":"6","pieceName":"Mage","total":4,"ability":"" }, {"rank":"5","pieceName":"Elemental","total":4,"ability":"" }, {"rank":"4","pieceName":"Elf","total":4,"ability":"" }, {"rank":"3","pieceName":"Dwarf","total":5,"ability":"Can take out traps" }, {"rank":"2","pieceName":"Scout","total":8,"ability":"Can move any distance in a straight line" }, {"rank":"S","pieceName":"Slayer","total":1,"ability":"Can defeat the Dragon, but is beaten by all including Dragon if it is attacked first" }, {"rank":"T","pieceName":"Trap","total":6,"ability":"Destroys any piece except Dwarf; cannot move" }, {"rank":"F","pieceName":"Flag","total":1,"ability":"Wins/loses the game when captured; cannot move" }];
	$scope.unfinishedGames = [];

	$scope.openRules = function(){
		$('.rules-modal').show();
	};
	$scope.closeRules = function(){
		$('.rules-modal').hide();
		return false;
	}
}]);
