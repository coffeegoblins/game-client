define([
    './tests/cameraTest',
    './tests/renderableMapTest',
    './tests/transitionEffectTest'
], function (CameraTest, RenderableMapTest, TransitionEffectTest)
{
    'use strict';
    return [
        new CameraTest(),
        new RenderableMapTest(),
        new TransitionEffectTest()
    ];
});
