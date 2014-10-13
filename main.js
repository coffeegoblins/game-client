require.config(
{
    baseUrl: '',
    shim:
    {},
    paths:
    {
        text: 'lib/text',
        jsonLoader: 'core/src/functions/loadRemoteJSON'
    }
});

require(['core/src/domEvents', 'core/src/scheduler', 'core/src/commandManager', 'menu/menuNavigator', 'menu/mainMenu'],
    function (DomEvents, Scheduler, CommandManager, MenuNavigator, MainMenu)
    {
        'use strict';
        window.addEventListener('error', function (e)
        {
            if (e.error)
            {
                console.log(e.error.message);
                console.log(e.error.stack);
            }
        });

        // Wait for device API libraries to load
        document.addEventListener('deviceready', function () {}, false);

        function onDocumentReady()
        {
            var postRequest = new XMLHttpRequest();
            postRequest.open('POST', "https://nodejs-coffeegoblins.rhcloud.com/login");
            postRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            postRequest.onreadystatechange = function ()
            {
                if (postRequest.readyState === 4)
                {
                    if (postRequest.status === 200)
                    {
                        console.log("200");
                    }
                }
            };

            postRequest.send('username=' + encodeURIComponent("fawcett") + "&password=" + encodeURIComponent(""));

            Scheduler.start();
            MainMenu.show(MenuNavigator.createContentDiv());
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });
