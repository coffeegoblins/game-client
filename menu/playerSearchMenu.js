define(['text!menu/playerSearchMenu.html', 'menu/menuNavigator', 'core/src/events'], function (PlayerSearchTemplate, MenuNavigator, Events)
{
    'use strict';

    function PlayerSearchMenu()
    {}

    PlayerSearchMenu.prototype.show = function (parentElement, searchResults)
    {
        MenuNavigator.insertTemplate(parentElement, PlayerSearchTemplate);

        var itemPanel = document.getElementById('searchResults');
        itemPanel.on('click', 'button', this.challengePlayer.bind(this));

        var itemTemplate = itemPanel.firstElementChild;
        itemPanel.removeChild(itemTemplate);

        // TODO: Should we show the number of active games/challenges with the players?

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < searchResults.length; i++)
        {
            var searchResult = searchResults[i];

            var element = itemTemplate.cloneNode(true);
            element.children[0].textContent = searchResult.username;
            element.children[1].id = searchResult.username;

            fragment.appendChild(element);
        }

        itemPanel.appendChild(fragment);
    };

    PlayerSearchMenu.prototype.challengePlayer = function (e)
    {
        this.trigger('challengeDeclared', e.target.id);
    };

    Events.register(PlayerSearchMenu.prototype);
    return PlayerSearchMenu;
});
