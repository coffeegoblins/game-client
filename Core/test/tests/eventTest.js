define(['core/src/events'], function (Events)
{
    'use strict';

    function EventTest()
    {
        this.name = 'Event Manager Tests';
    }

    function TestObject() { }

    EventTest.prototype.scenarioSetup = function ()
    {
        Events.register(TestObject.prototype);
    };

    EventTest.prototype.testOnMethod = function ()
    {
        var wasHit;
        var object = new TestObject();
        object.on('testEvent', function () { wasHit = true; });

        object.trigger('testEvent');
        assertTruthy('The event did not fire', wasHit);
    };

    EventTest.prototype.testOffMethod = function ()
    {
        var wasHit;
        var method = function () { wasHit = true; };

        var object = new TestObject();
        object.on('testEvent', method);
        object.off('testEvent');

        object.trigger('testEvent');
        assertFalsy('The event fired', wasHit);
    };

    EventTest.prototype.testOffWithMultipleMethods = function ()
    {
        var wasHit, secondWasHit;
        var method = function () { wasHit = true; };

        var object = new TestObject();
        object.on('testEvent', method);
        object.on('testEvent', function () {secondWasHit = true;});
        object.off('testEvent', method);

        object.trigger('testEvent');
        assertFalsy('The event fired', wasHit);
        assertTruthy('The event did not fire', secondWasHit);
    };

    EventTest.prototype.testOffWithContext = function ()
    {
        var wasHit, secondWasHit;
        var method = function () { wasHit = true; };

        var object = new TestObject();
        object.on('testEvent', 'context', method);
        object.on('testEvent', 'otherContext', function () {secondWasHit = true;});
        object.off('testEvent', 'context', method);

        object.trigger('testEvent');
        assertFalsy('The event fired', wasHit);
        assertTruthy('The event did not fire', secondWasHit);
    };

    EventTest.prototype.testMethodParameters = function ()
    {
        var parameters;
        var object = new TestObject();
        object.on('testEvent', function () { parameters = arguments; });

        object.trigger('testEvent', 'arg1', 'arg2');
        assertEquals('The wrong number of parameters were passed in', parameters.length, 2);
        assertEquals('Parameter 1 is incorrect', parameters[0], 'arg1');
        assertEquals('Parameter 2 is incorrect', parameters[1], 'arg2');
    };

    EventTest.prototype.testContext = function ()
    {
        var context;
        var object = new TestObject();
        object.on('testEvent', 'myContext', function () { context = this; });

        object.trigger('testEvent');
        assertEquals('The method was executed with the wrong context', context, 'myContext');
    };

    EventTest.prototype.testMultipleHandlers = function ()
    {
        var wasFirstHit, wasSecondHit;
        var object = new TestObject();
        object.on('testEvent', function () { wasFirstHit = true; });
        object.on('testEvent', function () { wasSecondHit = true; });

        object.trigger('testEvent');
        assertTruthy('The event did not fire', wasFirstHit && wasSecondHit);
    };

    return EventTest;
});
