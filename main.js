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
                document.body.innerHTML = e.error.message;
            }
        });

        // Wait for device API libraries to load
        document.addEventListener('deviceready', function ()
        {
            // device APIs are available
            console.log("Test 2");
        }, false);

        function onDocumentReady()
        {
            console.log("Test 1");
            Scheduler.start();
            MainMenu.show(MenuNavigator.createContentDiv());
            console.log("Test 3");
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });
