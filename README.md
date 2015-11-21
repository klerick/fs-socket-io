## An Angularjs module with full a simple functional of socket.Io.
with Sharing connection between Browser's windows and tabs across local storage


## Install
1. download the files
	1. Bower
		1. add `"fs-socket-io": "latest"` to your `bower.json` file then run `bower install` OR run `bower install fs-socket-io`
    2. include the files in your app
	    1. `fs-socket-io.js`

2. include the module in angular (i.e. in `app.js`) - `fs-socket-io`
	```javascript
	angular.module("testApp", ['fs-socket-io']);
	```
3. config path and prefix	
    ```javascript
    	angular.config("testApp", ['fsSocketIoProvider', function(fsSocketIoProvider){
    	    fsSocketIoProvider.prefixShare('somePrefix');
    	    fsSocketIoProvider.socketUrl('some/path/socket/connect');
    	}]);
    ```
    
4. init connect
    ```javascript
        angular.run("testApp", ['fsSocketIo', function(fsSocketIo){
        }]);
    ```
5. In your controller
    ```javascript
        $scope.$on('socket:YourSocketEvent')
               fsSocketIo.emit('YourSocketEmitEvent', param)
           ```