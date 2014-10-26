define(['./floatingPanel'], function (FloatingPanel)
{
    'use strict';

    function ConfirmationPanel()
    {
        FloatingPanel.call(this);

        this.element.classList.add('confirmation-panel');
        this.element.on('click', '.action', this.onActionClick.bind(this));

        this.confirmationElement = document.createElement('div');
        this.confirmationElement.className = 'action disabled';
        this.confirmationElement.title = 'Confirm';
        this.confirmationElement.setAttribute('data-action-name', 'confirm');
        this.confirmationElement.style.backgroundImage = 'url(renderer/content/images/confirmIcon.png)';

        this.cancelElement = document.createElement('div');
        this.cancelElement.className = 'action disabled';
        this.cancelElement.title = 'Cancel';
        this.cancelElement.setAttribute('data-action-name', 'cancel');
        this.cancelElement.style.backgroundImage = 'url(renderer/content/images/cancelIcon.png)';

        this.element.appendChild(this.confirmationElement);
        this.element.appendChild(this.cancelElement);
    }

    ConfirmationPanel.prototype = Object.create(FloatingPanel.prototype);
    ConfirmationPanel.prototype.constructor = ConfirmationPanel;

    ConfirmationPanel.prototype.disableConfirm = function ()
    {
        this.confirmationElement.classList.add('disabled');
        this.cancelElement.classList.add('disabled');

        this.cancelElement.style.opacity = "0";
        this.cancelElement.style.left = "0";
        this.confirmationElement.style.opacity = "0";
        this.confirmationElement.style.left = "0";
    };

    ConfirmationPanel.prototype.enableConfirm = function ()
    {
        this.confirmationElement.classList.remove('disabled');
        this.cancelElement.classList.remove('disabled');

        this.cancelElement.style.opacity = "1";
        this.confirmationElement.style.opacity = "1";
        this.confirmationElement.style.left = "-96px";
        this.cancelElement.style.left = "96px";
    };

    ConfirmationPanel.prototype.onActionClick = function (e)
    {
        if (this.isVisible)
        {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!e.target.classList.contains('disabled'))
            {
                this.trigger('actionSelected', e.target.getAttribute('data-action-name'));
                this.close();
            }
        }
    };

    ConfirmationPanel.prototype.showCancel = function (unit)
    {
        this.open(unit);
        this.confirmationElement.style.opacity = "0";
        this.cancelElement.style.opacity = "1";
        this.cancelElement.classList.remove('disabled');
    };

    return ConfirmationPanel;
});
