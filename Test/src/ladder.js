define(['./utility', './worldObject'], function (Utility, WorldObject)
{
    'use strict';

    var defaults = {
        direction: 'top',
        isClimbable: true
    };

    function Ladder(properties)
    {
        properties = Utility.merge({}, defaults, properties);
        WorldObject.call(this, properties);
    }

    Ladder.prototype = Object.create(WorldObject.prototype);
    Ladder.prototype.constructor = Ladder;

    return Ladder;
});
