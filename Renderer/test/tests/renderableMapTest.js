define(['renderer/src/renderableMap', 'core/src/map'], function (RenderableMap, Map)
{
    'use strict';

    var mapWidth = 20;
    var mapHeight = 20;
    var tileSize = 10;

    function RenderableMapTest()
    {
        this.name = 'Renderable Map Test';
    }

    RenderableMapTest.prototype.setup = function ()
    {
        this.map = new Map(mapWidth, mapHeight);
    };

    RenderableMapTest.prototype.getTileAtPosition = function ()
    {
        var renderableMap = new RenderableMap(this.map);

        var tileIndex = 0;
        for (var y = tileSize / 2; y < mapHeight * tileSize; y += tileSize)
        {
            for (var x = tileSize / 2; x < mapWidth * tileSize; x += tileSize)
            {
                assertEquals(this.map.tiles[tileIndex++], renderableMap.getTileAtCoordinate(x, y, tileSize));
            }
        }
    };

    return RenderableMapTest;
});
