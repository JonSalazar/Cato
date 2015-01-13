var catoApp = angular.module('catoApp', []);

catoApp.controller('GameCtrl', function($scope) {
    var socket = io();

    $scope.isLogged = false;
    $scope.isLoading = false;
    $scope.isMyTurn = false;
    $scope.nemesis = '';
    $scope.isNemesisPlaying = true;
    $scope.markType = '';
    $scope.result = false;
    $scope.win = false;
    $scope.board = [];

    for(var i = 0; i < 3; i++) {
        $scope.board.push([]);
        for(var j = 0; j < 3; j++) {
            $scope.board[i].push({type:'-'});
        }
    }

    $scope.startGame = function() {
        $scope.isLoading = true;
        $scope.$apply();

        socket.emit('wantGame', { 
            username: $scope.username 
        });
    };

    $scope.newMove = function(row, column) {
        if ( $scope.board[row][column].type !== '-') {
            return;
        }

        if ( $scope.isNemesisPlaying ) { 
            return;
        }

        $scope.isNemesisPlaying = true;
        //$scope.board[row][column] = {
        //    type: $scope.markType
        //};
        socket.emit('newMove', {
            x: column,
            y: row
        });
        $scope.$apply();
    };

    socket.on('start', function(data) {
        $scope.isLoading = false;
        $scope.isLogged  = true;
        $scope.markType  = data.tipo;
        $scope.nemesis   = data.nemesis;

        $scope.$apply();
    });

    socket.on('updateBoard', function(data) {
        $scope.board[data.y][data.x] = {
            type: data.tipo
        };
        $scope.$apply();
    });

    socket.on('go', function() {
        $scope.isNemesisPlaying = false;
        $scope.$apply();
    });

    socket.on('endGame', function(result) {
        $scope.result = true;
        $scope.win = result.resultado;

        $scope.$apply();
    });
});
