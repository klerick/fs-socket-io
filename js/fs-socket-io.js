/**
 * Created by klerick on 15.11.15.
 */
'use strict';

(function (angular) {

    var socketUrl = null;
    var prefixShare = 'fs-share-socket';

    angular.module('fs-socket-io', [])
        .provider('fsSocketIo', fsSocketIoProvider);

    fsSocketIoProvider.$inject = [];

    function randomStr() {
        return Math.random().toString(36).substring(7);
    }

    function fsSocketIoProvider() {

        this.prefixShare = function (key) {
            if (key) {
                prefixShare = key;
                return this;
            } else {
                return prefixShare;
            }
        };

        this.socketUrl = function (url) {
            if (url) {
                socketUrl = url;
                return this;
            } else {
                return socketUrl;
            }

        };

        this.$get = fsSocketIo;
    }

    fsSocketIo.$inject = ['$window', '$log', '$rootScope', '$interval'];
    function fsSocketIo($window, $log, $rootScope, $interval) {

        var id = randomStr();
        var isMaster = false;
        var clientKey = prefixShare + '.' + 'clients';
        var socket;
        var socketEventPublish = prefixShare + '.on';
        var socketLiveKey = prefixShare + '.live';
        var socketEventEmit = prefixShare + '.emit';
        var trigger = function (name, value) {
            if (isMaster) {
                var dataValue = {
                    value: value,
                    randomStr: randomStr(),
                    name: name
                };
                var dataEvent = angular.toJson(dataValue);

                $window.localStorage.setItem(socketEventPublish, dataEvent);
            }

            $rootScope.$broadcast('socket:' + name, value);
        };

        var emit = function (name, value) {
            if (isMaste) {
                socket.emit(name, value);
            }
            else {
                var value = {
                    value: value,
                    name: name,
                    randomStr: randomStr()
                };
                $window.localStorage.setItem(socketEventEmit, angular.toJson(value));
            }
        };

        var connect = function () {
            if (!io) {
                $log.error('Socket.io not installed');
                return;
            }
            var config = {
                reconnect: true
            };

            if (socketUrl) {
                config.path = socketUrl;
            }
            socket = io(config);
            isMaster = true;

            socket.onevent = function (packet) {
                var arg = packet.data || [];

                trigger(arg[0], arg[1]);
            };

            $interval(function () {
                $window.localStorage.setItem(socketLiveKey, Date.now());
            }, 1000);

        };

        $window.addEventListener('unload', function () {

            var value;
            try {
                value = $window.localStorage.getItem(clientKey);
                value = angular.fromJson(value);
                delete value[id];
                if (isMaster) {
                    for (var first in value) {
                        if (!value[first]) {
                            value[first] = true;
                        }
                        break;
                    }
                }
                $window.localStorage.setItem(clientKey, angular.toJson(value));
            } catch (e) {
                $log.error(e);
            }
        });

        $window.addEventListener('storage', function (e) {

            var params;
            try {
                params = angular.fromJson(e.newValue);
            } catch (e) {
                params = null;
            }
            switch (e.key) {
                case clientKey:
                    if (params && params[id]) {
                        connect();
                    }
                    break;
                case socketEventPublish:
                    if (!isMaster) {
                        trigger(params.name, params.value);
                    }
                    break;
                case socketEventEmit:
                    if (!this.isMaster) {
                        socket.emit(params.value, params.value);
                    }
                    break;
                default :
                    break
            }
        });

        var clients = $window.localStorage.getItem(clientKey);
        if (!clients) {
            clients = {};
        } else {
            clients = angular.fromJson(clients);
        }
        var masterLive = Date.now() - $window.localStorage.getItem(socketLiveKey) < 1000 * 5;
        if (masterLive) {
            var masterExist = [];
            angular.forEach(clients, function (val, key) {
                masterExist.push(key);
            });

            clients[id] = !masterExist.some(function (item) {
                return item;
            });
        } else {
            clients = {};
            clients[id] = true;
        }
        $window.localStorage.setItem(clientKey, angular.toJson(clients));
        if (clients[id]) {
            connect();
        }


        return {
            emit: emit
        }
    }

})(angular);
