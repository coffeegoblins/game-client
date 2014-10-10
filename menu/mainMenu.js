define(['menu/loginMenu', 'menu/multiplayerMenu', 'menu/menuNavigator', 'core/src/eventListener'],
    function (LoginMenu, MultiplayerMenu, MenuNavigator, EventListener)
    {
        return {
            show: function (parentElement)
            {
                this.parentElement = parentElement;

                MenuNavigator.removeChildren(this.parentElement);
                LoginMenu.show(this.parentElement, this.onLoggedIn.bind(this));
            },

            onLoggedIn: function (socket)
            {
                socket.on('events', function (events)
                {
                    socket.events = events;

                    socket.on(events.connection.response.userInfo, function (user)
                    {
                        socket.user = user;
                        socket.on(events.listeners.disconnect, this.onDisconnected.bind(this));

                        // TODO Prefetch and Cache manager
                        socket.emit(socket.events.getGames.url);
                        socket.emit(socket.events.getLevels.url);
                        socket.emit(socket.events.getNotifications.url);

                        MenuNavigator.removeChildren(this.parentElement);
                        MultiplayerMenu.show(this.parentElement, socket);

                        EventListener.listen(socket, events.listeners);
                    }.bind(this));

                }.bind(this));
            },

            onDisconnected: function ()
            {
                localStorage.removeItem('token');

                this.show(this.parentElement);
            },
        };
    });
