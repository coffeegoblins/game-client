define(['core/src/scheduler', 'core/src/utility'], function (Scheduler, Utility)
{
    'use strict';

    function onValueUpdate(e, deltaTime)
    {
        e.currentValue += e.deltaValue * deltaTime / e.duration;

        var value = e.currentValue;
        if (e.truncateValue)
            value = Math.floor(value);

        if (e.suffix)
            value += e.suffix;

        e.source[e.property] = value;
    }

    function onValueUpdateCompleted(e)
    {
        var value = e.targetValue;
        if (e.suffix)
            value += e.suffix;

        e.source[e.property] = value;
    }

    return {
        transitionFloat: function (options)
        {
            // Stop existing operation on that style's value
            if (options.id)
                Scheduler.unscheduleById(options.id);

            var transitionEvent = Utility.merge({duration: 1, method: onValueUpdate}, options);
            transitionEvent.currentValue = parseFloat(transitionEvent.source[transitionEvent.property]);
            transitionEvent.deltaValue = transitionEvent.targetValue - transitionEvent.currentValue;
            transitionEvent.endTime = transitionEvent.duration;

            var completedMethod = transitionEvent.completedMethod;
            transitionEvent.completedMethod = function (e)
            {
                onValueUpdateCompleted(e);
                if (completedMethod)
                    completedMethod.call(options.context);
            };

            Scheduler.schedule(transitionEvent);
        }
    };
});
