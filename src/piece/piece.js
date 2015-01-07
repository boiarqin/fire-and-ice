angular.module('myApp.piece',[])
.directive('piece', function(){
	return {
		restrict: 'E',
		templateUrl: 'piece/piece.html',
		replace: false,
		scope: {
			team: '@',
			rank: '@',
			position: '@',
		},
		//controller: 'boardCtrl',
		link: function($scope, el, attr, controller){
			$scope.isVisible = true;
			//$scope.isVisible = (controller.game.team);
			//console.log($scope.$parent.$parent.$parent.team);
			$scope.clickPiece = function(){
				//console.log('clickPiece');
				if ($scope.$parent.$parent.$parent.game.start && $scope.$parent.$parent.$parent.game.team === $scope.$parent.$parent.$parent.game.turn){
					if ($scope.$parent.$parent.selected){
						//el.removeClass('selected');
						$scope.$emit('CANCELPIECE');
					}
					//SECOND CLICK: ALREADY HIGHLIGHTED
					else if ($scope.$parent.$parent.highlighted) {
						$scope.$emit('ATTACKPIECE', $scope);	
					}
					//FIRST CLICK
					else{
						if ($scope.team === $scope.$parent.$parent.$parent.game.team){
							$scope.$emit('SELECTPIECE', $scope);

						}
					}
				}
				
			};
		}
	}

});