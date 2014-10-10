define(['core/src/scheduler'],
    function (Scheduler)
    {
        'use strict';
        function BlinkEffect()
        {

        }

        BlinkEffect.prototype.stopBlink = function (control)
        {
            Scheduler.unscheduleById(control.id + "opacity");
            control.style.opacity = 1;
        };

        BlinkEffect.prototype.blink = function (control, seconds)
        {
            // Stop existing operation on that style's opacity
            this.stopBlink(control);

            var currentValue = parseFloat(control.style.opacity);

            this.blinkEvent = {
                id: control.id + "opacity",
                control: control,
                currentDegree: 0,
                currentValue: currentValue,
                deltaValue: seconds,
                context: this,
                method: this.onBlinkUpdate
            };

            Scheduler.schedule(this.blinkEvent);
        };

        BlinkEffect.prototype.onBlinkUpdate = function(eventData, deltaTime)
        {
            // Cosine is in radians
            eventData.currentDegree += Math.PI * deltaTime / eventData.deltaValue;
            eventData.currentValue = Math.abs(Math.cos(eventData.currentDegree)); // Abs to stay between 0 and 1

            eventData.control.style.opacity = eventData.currentValue;
        };

        return new BlinkEffect();
    });
