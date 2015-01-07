angular.module('myApp.boardsquare',[])
.directive('boardsquare', function(){
	return {
		restrict: 'E',
		templateUrl: 'boardsquare/boardsquare.html',
		replace: true,
		scope: {
			isVoid: '@',
			position: '@',
			highlighted: '@squareHighlighted',
			selected: '@squareSelected',
			piece: '=boardsquareObject',
			lastmove: '@squareLastmove'
		},
		link: function($scope, el, attr){
			$scope.$watch($scope.isVoid, function(){
				$scope.isVoid = ($scope.isVoid === 'true');
			});
			$scope.clickSquare = function(){
				//console.log('clickSquare');
				if ($scope.highlighted){
					$scope.$emit('MOVEPIECE', $scope.position);
				}
			};
		}
	}
});