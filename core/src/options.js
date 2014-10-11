define(['./browserNavigation', './utility'], function (BrowserNavigation, Utility)
{
    'use strict';
    var defaults = {
        playSound: 'all', // All, Background, Effects
        showTurnIndicator: 'always', // Always, Selected, Never
        showEnemyHP: 'always',  // Always, Selected, Never
        showEnemyAP: 'always',  // Always, Selected, Never
        showTeamHP: 'always',   // Always, Selected, Never
        showTeamAP: 'always'    // Always, Selected, Never
    };

    var cachedOptions;
    if (window.localStorage)
    {
        cachedOptions = window.localStorage.getItem('options');
        if (cachedOptions)
            cachedOptions = JSON.parse(cachedOptions);
    }

    var options = Utility.merge({}, defaults, cachedOptions);
    options.reset = function ()
    {
        Utility.merge(this, defaults);
    };

    options.save = function ()
    {
        if (window.localStorage)
        {
            try
            {
                window.localStorage.setItem('options', JSON.stringify(options));
            }
            catch (e)
            {
                if (console && console.log)
                    console.log(e);
            }
        }
    };

    BrowserNavigation.on('exit', options.save.bind(options));
    return options;
});
