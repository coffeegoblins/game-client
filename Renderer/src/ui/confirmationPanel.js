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
        this.element.appendChild(this.confirmationElement);

        var cancelElement = document.createElement('div');
        cancelElement.className = 'action';
        cancelElement.title = 'Cancel';
        cancelElement.setAttribute('data-action-name', 'cancel');
        this.element.appendChild(cancelElement);
    }

    ConfirmationPanel.prototype = Object.create(FloatingPanel.prototype);
    ConfirmationPanel.prototype.constructor = ConfirmationPanel;

    ConfirmationPanel.prototype.disableConfirm = function ()
    {
        this.confirmationElement.classList.add('disabled');
    };

    ConfirmationPanel.prototype.enableConfirm = function ()
    {
        this.confirmationElement.classList.remove('disabled');
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

    return ConfirmationPanel;
});