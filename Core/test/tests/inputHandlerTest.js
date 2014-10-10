define(['core/src/inputHandler', 'core/src/scheduler'], function (InputHandler, Scheduler)
{
    'use strict';

    function InputHandlerTest()
    {
        this.name = 'Input Handler Test';
    }

    InputHandlerTest.prototype.setup = function ()
    {
        this.canvas = document.getElementById('canvas');
        this.inputHandler = InputHandler.getInstance();
        this.inputState = this.inputHandler.InputState;

        this.mouseEvent = document.createEvent('MouseEvents');
    };

    InputHandlerTest.prototype.testPressEventStopsInputFlick = function ()
    {
        var methodCalled;

        Scheduler.schedule({id: 'flick', context: this, method: function ()
        {
            methodCalled = true;
        }});

        var mouseEvent = this.inputHandler.handlePressEvent();

        assertTruthy("Mouse event is null.", mouseEvent);
        assertTruthy("Msg Status is incorrect.", mouseEvent.state === this.inputState.DOWN);

        asyncWait(100);
        async(function ()
        {
            assertFalsy(methodCalled);
        });
    };

    InputHandlerTest.prototype.testDragEventsAreTrackedAndRemoved = function ()
    {
        var removedEvent = {id: '1', currentTime: 0};
        var keptEvent = {id: '2', currentTime: new Date().getTime()};

        var moveEvent = { currentEvent: { pageX: 0, pageY: 0 }, state: this.inputState.DRAGGING, dragEvents: [
            removedEvent, keptEvent
        ]};

        var currentEvent = { pageX: 10, pageY: 10 };
        this.inputHandler.handleMoveEvent(moveEvent, currentEvent);

        assertTruthy('The first event should have been deleted.', moveEvent.dragEvents.indexOf(removedEvent) === -1);
        assertTruthy('The second event should not have been deleted.', moveEvent.dragEvents.indexOf(keptEvent) !== -1);
        assertTruthy('The second event should not have been deleted.', moveEvent.dragEvents.indexOf(currentEvent) !== -1);
    };

    InputHandlerTest.prototype.testReleaseWhileDraggingStartsFlick = function ()
    {
        var releaseEvent = {
            state: this.inputHandler.InputState.DRAGGING,
            dragEvents: [
                {pageX: 0, pageY: 0},
                {pageX: 1, pageY: 1},
                {pageX: 2, pageY: 4}
            ],
            currentEvent: {pageX: 0, pageY: 0}
        };

        this.inputHandler.handleReleaseEvent(releaseEvent);

        assertTruthy('The input state should be flicking.', releaseEvent.state === this.inputHandler.InputState.FLICKING);
        assertTruthy('Flick event is null.', this.inputHandler.flickEvent);
        assertTruthy('Incorrect velocity was calculated.', this.inputHandler.flickEvent.velocityX === -1);
        assertTruthy('Incorrect velocity was calculated.', this.inputHandler.flickEvent.velocityY === -2);
    };

    InputHandlerTest.prototype.testZeroVelocityDoesntFlick = function ()
    {
        var releaseEvent = {
            state: this.inputHandler.InputState.DRAGGING,
            dragEvents: [
                {pageX: 0, pageY: 0},
                {pageX: 0, pageY: 0},
                {pageX: 0, pageY: 0}
            ],
            currentEvent: {pageX: 0, pageY: 0}
        };

        this.inputHandler.handleReleaseEvent(releaseEvent);

        assertTruthy('The input state should be flicking.', releaseEvent.state !== this.inputHandler.InputState.FLICKING);
    };

    InputHandlerTest.prototype.testFlickIsFinite = function ()
    {
        this.inputHandler.flickEvent = {currentX: 0, currentY: 0, velocityX: 1, velocityY: 1};

        this.inputHandler.flick(null, null);

        assertFalsy('Flick event is still active', this.inputHandler.flickEvent);
    };

    return InputHandlerTest;
});
