define(['core/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableMap(map)
    {
        this.map = map;
        if (map.spriteSheet)
        {
            var filePath = 'renderer/content/images/' + map.spriteSheet + '.png';
            this.tileSheet = new SpriteSheet(map.spriteSheet, filePath, {
                tileHeight: 48,
                tileWidth: 96
            });
        }
    }

    RenderableMap.prototype.getTileAtCoordinate = function (x, y, scale)
    {
        return this.map.getTile(Math.floor(x / scale), Math.floor(y / scale));
    };

    RenderableMap.prototype.onClick = function (e, position)
    {
        this.map.onClick(e, position.x, position.y);
    };

    RenderableMap.prototype.render = function (context, camera)
    {
        if (!this.tileSheet.isLoaded())
            return;

        var viewportLeft = camera.viewportRect.x;
        var viewportTop = camera.viewportRect.y;

        for (var x = 0; x < this.map.width; x++)
        {
            for (var y = 0; y < this.map.height; y++)
            {
                var position = camera.tileToScreen(x, y);
                position.x -= viewportLeft;
                position.y -= viewportTop;

                if (!camera.isInView(position.x, position.y, camera.tileWidth, camera.tileHeight))
                    continue;

                var tile = this.map.getTile(x, y);
                if (!tile.spriteIndex)
                    continue;

                var tileRect = this.tileSheet.getTileBounds(tile.spriteIndex - 1);
                if (tileRect)
                {
                    context.drawImage(this.tileSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height,
                        position.x, position.y, camera.tileWidth, camera.tileHeight);
                }
            }
        }
    };

    return RenderableMap;
});
