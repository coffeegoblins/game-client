define(function ()
{
    'use strict';

    // All major browsers besides IE9 support request animation frame
    var vendorTags = ['ms', 'moz', 'webkit', 'o'];
    for (var i = 0; i < vendorTags.length && !window.requestAnimationFrame; i++)
    {
        var vendorTag = vendorTags[i];
        window.requestAnimationFrame = window[vendorTag + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendorTag + 'CancelAnimationFrame'] || window[vendorTag + 'CancelRequestAnimationFrame'];
    }

    function Scheduler()
    {
        this.isRunning = false;
    }

    Scheduler.prototype.clear = function ()
    {
        eventQueue = {};
    };

    Scheduler.prototype.start = function ()
    {
        this.isRunning = true;
        updateLoopId = window.requestAnimationFrame(update);
    };

    Scheduler.prototype.stop = function ()
    {
        this.isRunning = false;
        window.cancelAnimationFrame(updateLoopId);
    };

    Scheduler.prototype.schedule = function (eventData)
    {
        if (eventData.interval == null)
            eventData.interval = 0;

        if (eventData.priority == null)
            eventData.priority = this.priority.update;

        eventData.timeRemaining = eventData.interval;

        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent && currentEvent.eventData.priority > eventData.priority)
        {
            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }

        previousEvent.next = {eventData: eventData, next: currentEvent};
    };

    Scheduler.prototype.unschedule = function (eventData, completeEvent)
    {
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            if (currentEvent.eventData === eventData)
            {
                previousEvent.next = currentEvent.next;
                if (completeEvent && currentEvent.eventData.completedMethod)
                    currentEvent.eventData.completedMethod.call(currentEvent.eventData.context, currentEvent.eventData);

                break;
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }
    };

    Scheduler.prototype.unscheduleById = function (id, completeEvent)
    {
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            if (currentEvent.eventData.id === id)
            {
                previousEvent.next = currentEvent.next;
                if (completeEvent && currentEvent.eventData.completedMethod)
                    currentEvent.eventData.completedMethod.call(currentEvent.eventData.context, currentEvent.eventData);

                break;
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }
    };

    Scheduler.prototype.priority = {
        update: 1000,
        render: 100
    };


    var scheduler = new Scheduler();
    var updateLoopId;
    var lastUpdateTime = 0;
    var eventQueue = {};

    function update(time)
    {
        if (!scheduler.isRunning)
            return;

        var deltaTime = (time - lastUpdateTime) * 0.001;
        lastUpdateTime = time;

        // Don't let the game clock sink lower than 20fps
        if (deltaTime > 0.05)
            deltaTime = 0.05;

        // Update any events that have registered with the game
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            var eventData = currentEvent.eventData;

            if (eventData.endTime != null)
            {
                eventData.endTime -= deltaTime;
                if (eventData.endTime < 0)
                {
                    if (eventData.completedMethod)
                        eventData.completedMethod.call(eventData.context, eventData);

                    scheduler.unschedule(eventData);

                    previousEvent = currentEvent;
                    currentEvent = currentEvent.next;

                    continue;
                }
            }

            eventData.timeRemaining -= deltaTime;
            if (eventData.timeRemaining < 0)
            {
                if (eventData.method)
                    eventData.method.call(eventData.context, eventData, deltaTime);

                eventData.timeRemaining += eventData.interval;
                if (eventData.timeRemaining < 0)
                    eventData.timeRemaining = 0;
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }

        updateLoopId = window.requestAnimationFrame(update);
    }

    return scheduler;
});
