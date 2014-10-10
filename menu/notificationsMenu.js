define(['text!menu/notificationsMenu.html', 'text!menu/notification.html', 'menu/menuNavigator',
        'core/src/events', 'core/src/imageCache'],
    function (NotificationsMenuTemplate, NotificationTemplate, MenuNavigator, Events, ImageCache)
    {
        return {
            hide: function ()
            {
                this.notificationsSideBar.className = 'collapsed';
            },

            show: function (parentElement, socket, challengeAcceptedCallback, challengeDeclinedCallback)
            {
                this.parentElement = parentElement;
                MenuNavigator.insertTemplate(parentElement, NotificationsMenuTemplate);

                this.notificationsSideBar = document.getElementById('notifications');
                this.notificationsSideBar.on('click', '.acceptButton', this.acceptChallenge.bind(this, socket, challengeAcceptedCallback));
                this.notificationsSideBar.on('click', '.declineButton', this.declineChallenge.bind(this, socket, challengeDeclinedCallback));

                this.hide();
            },

            toggle: function ()
            {
                if (this.notificationsSideBar.className)
                {
                    this.notificationsSideBar.className = '';
                }
                else
                {
                    this.notificationsSideBar.className = 'collapsed';
                }
            },

            onNotificationsReceived: function (notifications)
            {
                var fragment = document.createDocumentFragment();
                for (var i = 0; i < notifications.length; ++i)
                {
                    var notification = notifications[i];
                    var div = document.createElement('div');
                    MenuNavigator.insertTemplate(div, NotificationTemplate);

                    div.setAttribute('data-id', notification._id);
                    div.querySelector('.username').textContent = notification.sourceUsername;
                    div.querySelector('.levelName').textContent = notification.data;

                    ImageCache.bindImage(notification.data, div.querySelector('.levelImage'));

                    fragment.appendChild(div);
                }

                this.notificationsSideBar.appendChild(fragment);
            },

            acceptChallenge: function (socket, acceptedCallback, e)
            {
                var element = MenuNavigator.findParentElement(e.target, '[data-id]');
                var id = element.getAttribute('data-id');
                var levelName = element.querySelector('.levelName').textContent.trim();

                // TODO: Disable buttons while waiting for response?

                acceptedCallback(id, levelName, function ()
                {
                    if (element.parentNode)
                    {
                        element.parentElement.removeChild(element);
                    }
                });
            },

            declineChallenge: function (socket, declinedCallback, e)
            {
                var notificationElement = MenuNavigator.findParentElement(e.target, '[data-id]');
                var id = notificationElement.getAttribute('data-id');

                // TODO: What happens on error?

                declinedCallback(id, function ()
                {
                    this.notificationsSideBar.removeChild(notificationElement);
                }.bind(this));
            }
        };
    });
