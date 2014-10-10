define(['./events', './scheduler', './utility'], function (Events, Scheduler, Utility)
{
    'use strict';

    function InputHandler()
    {
        this.InputState = {
            DOWN: 0,
            UP: 1,
            DRAGGING: 2,
            FLICKING: 3
        };

        this.activeTouches = {};
        this.handleInput = false;
        this.registeredClickEvents = {};
    }

    var inputHandler = new InputHandler();

    InputHandler.addClickListener = function (element, method)
    {
        element.addEventListener('click', function (e)
        {
            if (inputHandler.handleInput)
            {
                if (method(e) === false)
                {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, false);

        element.addEventListener('touchstart', function (e)
        {
            if (inputHandler.handleInput && e.targetTouches && e.targetTouches.length === 1)
            {
                if (method.call(element, e.targetTouches[0]) === false)
                {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, false);
    };

    InputHandler.disableInput = function ()
    {
        inputHandler.handleInput = false;
    };

    InputHandler.enableInput = function ()
    {
        inputHandler.handleInput = true;
    };

    InputHandler.getInstance = function ()
    {
        return inputHandler;
    };

    InputHandler.registerClickEvent = function (id, method, context)
    {
        inputHandler.registeredClickEvents[id] = {
            context: context,
            method: method
        };
    };

    InputHandler.unregisterClickEvent = function (id)
    {
        inputHandler.registeredClickEvents[id] = undefined;
    };


    InputHandler.prototype.flick = function (eventData, deltaTime)
    {
        if (!this.flickEvent)
        {
            Scheduler.unscheduleById('flick');
            return;
        }

        var dragX = this.flickEvent.currentX + this.flickEvent.velocityX;
        var dragY = this.flickEvent.currentY + this.flickEvent.velocityY;
        this.sendDrag(this.flickEvent, this.flickEvent.currentX, this.flickEvent.currentY, dragX, dragY);

        this.flickEvent.velocityX *= 0.9;
        this.flickEvent.velocityY *= 0.9;

        if (Math.floor(Math.abs(this.flickEvent.velocityX)) === 0 && Math.floor(Math.abs(this.flickEvent.velocityY)) === 0)
        {
            Scheduler.unscheduleById('flick');
            this.flickEvent = null;
            return;
        }

        this.flickEvent.currentX = dragX;
        this.flickEvent.currentY = dragY;
    };

    InputHandler.prototype.handlePressEvent = function (currentEvent)
    {
        Scheduler.unscheduleById('flick');

        return {
            initialEvent: currentEvent,
            currentEvent: currentEvent,
            dragEvents: [],
            state: this.InputState.DOWN
        };
    };

    InputHandler.prototype.handleMoveEvent = function (moveEvent, currentEvent)
    {
        switch (moveEvent.state)
        {
            case this.InputState.DOWN:
                if (this.hasMovedEnough(moveEvent.initialEvent, currentEvent))
                    moveEvent.state = this.InputState.DRAGGING;
                break;

            case this.InputState.DRAGGING:
                currentEvent.currentTime = new Date().getTime();
                moveEvent.dragEvents.push(currentEvent);

                for (var i = 0; i < moveEvent.dragEvents.length; ++i)
                {
                    var deltaTime = currentEvent.currentTime - moveEvent.dragEvents[i].currentTime;
                    if (deltaTime < 100)
                        break;

                    moveEvent.dragEvents.splice(i, 1);
                    --i;
                }

                this.sendDrag(moveEvent, currentEvent.pageX, currentEvent.pageY, moveEvent.currentEvent.pageX, moveEvent.currentEvent.pageY);

                moveEvent.currentEvent = currentEvent;
                break;
        }
    };

    InputHandler.prototype.handleReleaseEvent = function (releaseEvent)
    {
        switch (releaseEvent.state)
        {
            case this.InputState.DOWN:
                this.sendClick(releaseEvent.currentEvent || releaseEvent.initialEvent);
                break;

            case this.InputState.DRAGGING:
                this.flickEvent = releaseEvent;
                this.flickEvent.state = this.InputState.FLICKING;

                var totalVelocityX = 0;
                var totalVelocityY = 0;

                var eventCount = this.flickEvent.dragEvents.length - 1;
                for (var i = 0; i < eventCount; ++i)
                {
                    totalVelocityX += this.flickEvent.dragEvents[i].pageX - this.flickEvent.dragEvents[i + 1].pageX;
                    totalVelocityY += this.flickEvent.dragEvents[i].pageY - this.flickEvent.dragEvents[i + 1].pageY;
                }

                this.flickEvent.currentX = this.flickEvent.currentEvent.pageX;
                this.flickEvent.currentY = this.flickEvent.currentEvent.pageY;
                this.flickEvent.velocityX = Utility.validateNumber(totalVelocityX / eventCount);
                this.flickEvent.velocityY = Utility.validateNumber(totalVelocityY / eventCount);

                if (this.flickEvent.velocityX || this.flickEvent.velocityY)
                {
                    Scheduler.schedule(
                        {
                            id: 'flick',
                            method: this.flick,
                            context: this
                        });
                    return;
                }
        }

        releaseEvent.state = this.InputState.UP;
    };

    InputHandler.prototype.hasMovedEnough = function (event1, event2)
    {
        return Math.abs(event1.pageX - event2.pageX) + Math.abs(event1.pageY - event2.pageY) > 10;
    };

    InputHandler.prototype.sendClick = function (e)
    {
        var registeredEvent = this.registeredClickEvents[e.target.id];
        if (registeredEvent)
        {
            registeredEvent.method.call(registeredEvent.context || e.target, e);
        }
        else
        {
            e.target.click();
            if (e.preventDefault)
                e.preventDefault();
        }
    };

    InputHandler.prototype.sendDrag = function (event, previousX, previousY, targetX, targetY)
    {
        var deltaX = targetX - previousX;
        var deltaY = targetY - previousY;
        InputHandler.trigger('drag', event, deltaX, deltaY);
    };


    function onMouseDown(e)
    {
        if (inputHandler.handleInput && e.which === 1)
        {
            inputHandler.mouseEvent = inputHandler.handlePressEvent(e);
        }
    }

    function onMouseMove(e)
    {
        if (inputHandler.handleInput && inputHandler.mouseEvent)
            inputHandler.handleMoveEvent(inputHandler.mouseEvent, e);
    }

    function onMouseUp()
    {
        if (inputHandler.handleInput && inputHandler.mouseEvent)
        {
            inputHandler.handleReleaseEvent(inputHandler.mouseEvent);
        }
    }

    function getEventObj(e)
    {
        return {identifier: e.identifier, pageX: e.pageX, pageY: e.pageY, target: e.target};
    }

    function onTouchStart(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = getEventObj(e.changedTouches[i]);
                inputHandler.activeTouches[touch.identifier] = inputHandler.handlePressEvent(touch);
            }

            e.preventDefault();
        }
    }

    function onTouchMove(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = getEventObj(e.changedTouches[i]);
                var activeTouch = inputHandler.activeTouches[touch.identifier];
                if (activeTouch)
                {
                    inputHandler.handleMoveEvent(activeTouch, touch);
                }
            }

            e.preventDefault();
        }
    }

    function onTouchEnd(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = getEventObj(e.changedTouches[i]);
                var activeTouch = inputHandler.activeTouches[touch.identifier];
                if (activeTouch)
                {
                    inputHandler.handleReleaseEvent(activeTouch);
                    delete inputHandler.activeTouches[touch.identifier];
                }
            }
        }
    }

    function onTouchCancel(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
                delete inputHandler.activeTouches[e.changedTouches.identifier];
        }
    }

    function onWindowBlur()
    {
        inputHandler.activeTouches = {};
    }


    // Block anything we don't want to happen
    var preventDefault = function (e)
    {
        if (inputHandler.handleInput)
            e.preventDefault();
    };

    window.addEventListener('contextmenu', preventDefault, false);
    window.addEventListener('MSHoldVisual', preventDefault, false);
    window.addEventListener('selectstart', preventDefault, false);
    window.addEventListener('wheel', preventDefault, false);

    // Hook into input events
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('blur', onWindowBlur, false);

    if (('ontouchstart' in window) || ('onmsgesturechange' in window))
    {
        window.addEventListener('touchstart', onTouchStart, false);
        window.addEventListener('touchmove', onTouchMove, false);
        window.addEventListener('touchend', onTouchEnd, false);
        window.addEventListener('touchcancel', onTouchCancel, false);
        document.body.style.msTouchAction = 'none';
    }

    Events.register(InputHandler);
    return InputHandler;
});