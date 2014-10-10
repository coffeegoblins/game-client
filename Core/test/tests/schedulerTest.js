define(['core/src/scheduler'], function (Scheduler)
{
    'use strict';

    function SchedulerTest()
    {
        this.name = 'Scheduler Test';
    }

    SchedulerTest.prototype.setup = function ()
    {
        Scheduler.start();
    };

    SchedulerTest.prototype.tearDown = function ()
    {
        Scheduler.stop();
        Scheduler.clear();
    };

    SchedulerTest.prototype.testIntervalMethodIsCalled = function ()
    {
        var wasExecuted = false;
        Scheduler.schedule({method: function () { wasExecuted = true; }});

        async(function ()
        {
            return wasExecuted;
        }, 'Scheduled event was not called', 100);
    };

    SchedulerTest.prototype.testCompletedMethodIsNotCalled = function ()
    {
        var wasExecuted = false;
        var wasCompletedExecuted = false;

        Scheduler.schedule({completedMethod: function () { wasCompletedExecuted = true; },
            method: function () { wasExecuted = true; }});

        async(function ()
        {
            if (wasExecuted)
            {
                assertFalsy(wasCompletedExecuted);
            }

            return wasExecuted;
        }, 'Scheduled event was not called', 100);
    };

    SchedulerTest.prototype.testCompletedMethodIsCalledWhenEndTimeSet = function ()
    {
        var wasExecuted = false;
        Scheduler.schedule({endTime: 0, completedMethod: function () { wasExecuted = true; }});

        async(function ()
        {
            return wasExecuted;
        }, 'Scheduled event was not called', 100);
    };

    SchedulerTest.prototype.testUnscheduleRemovesEvent = function ()
    {
        var wasExecuted = false;
        var scheduledEvent = {method: function () { wasExecuted = true; }};

        Scheduler.schedule(scheduledEvent);
        Scheduler.unschedule(scheduledEvent);

        asyncWait(40);
        async(function ()
        {
            assertFalsy(wasExecuted);
        });
    };

    SchedulerTest.prototype.testUnscheduleById = function ()
    {
        var wasExecuted;
        Scheduler.schedule({id: 'testEvent', method: function () { wasExecuted = true; }});
        Scheduler.unscheduleById('testEvent');

        asyncWait(40);
        async(function ()
        {
            assertFalsy(wasExecuted);
        });
    };

    SchedulerTest.prototype.testPriority = function ()
    {
        var executionOrder = [];
        var scheduledMethod = function (e)
        {
            executionOrder.push(e.name);
            Scheduler.unschedule(e);
        };

        Scheduler.schedule({name: 'method1', priority: 1, method: scheduledMethod});
        Scheduler.schedule({name: 'method2', priority: 3, method: scheduledMethod});
        Scheduler.schedule({name: 'method3', priority: 2, method: scheduledMethod});

        async(function ()
        {
            return executionOrder.length === 3;
        }, 'The scheduled events were not called');

        async(function ()
        {
            assertEquals('method2', executionOrder[0]);
            assertEquals('method3', executionOrder[1]);
            assertEquals('method1', executionOrder[2]);
        });
    };

    return SchedulerTest;
});
