define(['core/src/map'], function (Map)
{
    'use strict';

    function MapTest()
    {
        this.name = 'Map Test';
    }

    MapTest.prototype.getTile = function ()
    {
        var map = new Map(20, 20);

        var tileIndex = 0;
        for (var y = 0; y < 20; y++)
        {
            for (var x = 0; x < 20; x++)
            {
                assertEquals(map.tiles[tileIndex++], map.getTile(x, y));
            }
        }
    };

    return MapTest;
});
