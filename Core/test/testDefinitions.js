define([
    './tests/eventTest',
    './tests/inputHandlerTest',
    './tests/mapTest',
    './tests/pathManagerTest',
    './tests/schedulerTest',
    './tests/turnManagerTest',
    './tests/utilityTest'
], function (EventTest, InputHandlerTest, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
{
    'use strict';
    return [
        new EventTest(),
        new InputHandlerTest(),
        new MapTest(),
        new PathManagerTest(),
        new SchedulerTest(),
        new TurnManagerTest(),
        new UtilityTest()
    ];
});
