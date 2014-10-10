define(['./utility'], function (Utility)
{
    'use strict';

    function on()
    {
        var eventName = arguments[0];
        if (!this.events)
            this.events = {};

        if (!this.events[eventName])
            this.events[eventName] = [];

        var context, method;
        if (arguments.length > 2)
        {
            context = arguments[1];
            method = arguments[2];
        }
        else
        {
            context = this;
            method = arguments[1];
        }

        this.events[eventName].push({context: context, method: method});
    }

    function off()
    {
        if (!this.events)
            return;

        var eventName = arguments[0];
        var handlers = this.events[eventName];
        if (!handlers || !handlers.length)
            return;

        if (arguments.length >= 3)
        {
            Utility.removeElementByProperties(handlers, {context: arguments[1], method: arguments[2]});
        }
        else if (arguments.length === 2)
        {
            if (typeof arguments[1] === 'function')
                Utility.removeElementByProperty(handlers, 'method', arguments[1]);
            else
                Utility.removeElementByProperty(handlers, 'context', arguments[1]);
        }
        else
        {
            this.events[eventName] = undefined;
        }
    }

    function trigger()
    {
        if (!this.events)
            return;

        var handlers = this.events[arguments[0]];
        if (handlers && handlers.length)
        {
            Array.prototype.shift.call(arguments);
            for (var i = 0; i < handlers.length; i++)
            {
                var handler = handlers[i];
                handler.method.apply(handler.context, arguments);
            }
        }
    }

    function clearEvents()
    {
        this.events = null;
    }

    return {
        register: function (object)
        {
            object.on = on;
            object.off = off;
            object.clearEvents = clearEvents;
            object.trigger = trigger;
        }
    };
});
