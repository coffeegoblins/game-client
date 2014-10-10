define([], function ()
{
    'use strict';

    function LocalJSONLoader()
    {

    }

    LocalJSONLoader.prototype.loadLevel = function (levelName, onComplete)
    {
        var request = new XMLHttpRequest();
        request.overrideMimeType('application/json');
        request.open('GET', 'core/content/' + levelName + '.json');

        request.onreadystatechange = function ()
        {
            if (request.readyState === 4 && request.status === 200)
            {
                onComplete(JSON.parse(request.responseText));
            }
        };

        request.send();
    };

    return LocalJSONLoader;
});
