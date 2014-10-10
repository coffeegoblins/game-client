define(function ()
{
    'use strict';

    if (!document.documentElement.matches)
    { // Reassignment of matches to the proper variable, if the standard isn't already supported
        var matchMethods = ['webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'];
        for (var i = 0; i < matchMethods.length; i++)
        {
            if (document.documentElement[matchMethods[i]])
            {
                Element.prototype.matches = document.documentElement[matchMethods[i]];
                break;
            }
        }
    }

    function isMatchingHandler(handlerData, namespace, selector, method)
    {
        if (method)
            return method === handlerData.method;

        if (namespace && namespace !== handlerData.namespace)
            return false;

        if (selector && selector !== handlerData.selector)
            return false;

        return true;
    }

    Element.prototype.on = function (eventName, selector, method)
    {
        var handler;
        if (arguments.length === 2)
        { // This handler is targeting the source element
            method = selector;
            handler = method;
            selector = null;
        }
        else
        {
            handler = function (e)
            {
                var childElement = e.target;
                while (childElement && childElement !== e.currentTarget)
                {
                    if (childElement.matches(selector))
                    {
                        method.call(e.currentTarget, e);
                        break;
                    }

                    childElement = childElement.parentNode;
                }
            };
        }

        if (!this._events)
            this._events = {};

        var fullName = eventName.split('.');
        var name = fullName[0];
        var namespace = fullName[1];

        if (!this._events[name])
            this._events[name] = [];

        this._events[name].push({
            name: name,
            namespace: namespace,
            handler: handler,
            method: method,
            selector: selector
        });

        this.addEventListener(name, handler, false);
    };

    Element.prototype.off = function (eventName, selector, method)
    {
        if (!this._events)
            return;

        var i;
        var handlers = [];
        if (eventName)
        {
            var namespace = eventName.split('.');
            eventName = namespace[0];
            namespace = namespace[1];

            var eventHandlers = this._events[eventName];
            if (eventHandlers)
            {
                if (arguments.length === 1)
                { // Removing by event name
                    handlers = eventHandlers;
                    delete this._events[eventName];
                }
                else
                { // Removing by selector and/or method
                    if (arguments.length === 2 && typeof selector === 'function')
                    {
                        method = selector;
                        selector = null;
                    }

                    for (i = eventHandlers.length - 1; i >= 0; i--)
                    {
                        if (isMatchingHandler(eventHandlers[i], namespace, selector, method))
                        {
                            handlers.push(eventHandlers[i]);
                            eventHandlers.splice(i, 1);
                        }
                    }

                    if (!eventHandlers.length)
                        delete this._events[eventName];
                }
            }
        }
        else
        { // Remove all events
            for (var name in this._events)
                handlers.push.apply(handlers, this._events[name]);

            this._events = null;
        }

        for (i = 0; i < handlers.length; i++)
        {
            var handlerData = handlers[i];
            this.removeEventListener(handlerData.name, handlerData.handler, false);
        }
    };
});