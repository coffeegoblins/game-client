define(['./floatingPanel', 'core/src/spriteSheet'], function (FloatingPanel, SpriteSheet)
{
    'use strict';

    function ActionPanel()
    {
        this.actionIconSheet = new SpriteSheet('actionIcons', 'renderer/content/images/actionIcons.png',
        {
            tileHeight: 64,
            tileWidth: 64
        });

        FloatingPanel.call(this);

        this.element.classList.add('action-panel');
        this.element.on('click', '.action', this.onActionClick.bind(this));

        this.actions = [
            {
                name: 'move',
                displayName: 'Move'
            },
            {
                name: 'endturn',
                displayName: 'End Turn'
            }
        ];
    }

    ActionPanel.prototype = Object.create(FloatingPanel.prototype);
    ActionPanel.prototype.constructor = ActionPanel;

    ActionPanel.prototype.onActionClick = function (e)
    {
        if (this.isVisible)
        {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!e.target.classList.contains('disabled'))
            {
                var actionName = e.target.getAttribute('data-action-name');
                for (var i = 0; i < this.actions.length; i++)
                {
                    var action = this.actions[i];
                    if (action.name === actionName)
                    {
                        this.trigger('actionSelected', this.target, action);
                        break;
                    }
                }
            }
        }
    };

    ActionPanel.prototype.open = function (target, attacks)
    {
        FloatingPanel.prototype.open.apply(this, arguments);
        this.element.innerHTML = '';

        this.actions.length = 2;
        this.actions.push.apply(this.actions, attacks);

        var deltaAngle = Math.PI * 2 / this.actions.length;
        var radius = 96;
        var angle = 0;

        for (var i = 0; i < this.actions.length; i++)
        {
            var action = this.actions[i];
            var actionElement = document.createElement('div');

            if (action.isDisabled)
                actionElement.classList.add('disabled');
            else
                actionElement.classList.remove('disabled');

            actionElement.className = 'action';
            actionElement.title = action.displayName;
            actionElement.setAttribute('data-action-name', action.name);
            actionElement.style.backgroundImage = 'url(renderer/content/images/actions/' + action.name + '.png)';
            actionElement.style.top = radius * Math.cos(angle) * -1 + "px";
            actionElement.style.left = radius * Math.sin(angle) + "px";

            angle += deltaAngle;

            this.element.appendChild(actionElement);
        }
    };

    ActionPanel.prototype.updateActions = function ()
    {
        for (var i = 0; i < this.actions.length; i++)
        {
            var action = this.actions[i];
            var actionElement;

            if (action.attackCost != null)
            {
                actionElement = this.element.children[i];
                if (action.attackCost > this.target.ap)
                    actionElement.classList.add('disabled');
                else
                    actionElement.classList.remove('disabled');
            }

            if (action.isDisabled)
            {
                actionElement = this.element.children[i];
                actionElement.classList.add('disabled');
            }
        }
    };

    ActionPanel.prototype.disableAction = function (actionName)
    {
        for (var i = 0; i < this.actions.length; i++)
        {
            var action = this.actions[i];

            if (action.name === actionName)
            {
                this.element.children[i].classList.add('disabled');
            }
        }
    };

    return ActionPanel;
});
