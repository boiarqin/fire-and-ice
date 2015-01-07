directive('piece', function(){
	return {
		restrict: 'E',
		scope: {
			team: '&',
			rank: '&',
		},
		link: function(scope, el, attr){
			el.on('click', function(){
				alert(scope.team + scope.rank);
			})
		}
	}

});