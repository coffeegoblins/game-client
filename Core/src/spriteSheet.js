define(['core/src/events', './imageCache', './utility'], function (Events, ImageCache, Utility)
{
    'use strict';

    var defaults = {
        speed: 0.0167,
        tileWidth: 64,
        tileHeight: 64
    };

    function SpriteSheet(id, path, properties)
    {
        this.animations = {};
        this.currentTile = 0;
        Utility.merge(this, defaults, properties);

        if (id && path)
        {
            this.image = ImageCache.setImage(id, path);
        }
    }

    SpriteSheet.prototype.defineAnimation = function (name, properties)
    {
        if (!properties.frames)
            properties.frames = {};

        properties.name = name;
        this.animations[name] = properties;
    };

    SpriteSheet.prototype.getCurrentTileBounds = function ()
    {
        if (!this.currentTileBounds)
            this.currentTileBounds = this.getTileBounds(this.currentTile);

        return this.currentTileBounds;
    };

    SpriteSheet.prototype.getTile = function (x, y)
    {
        if (this.image.isLoaded)
            return x + y * Math.floor(this.image.width / this.tileWidth);
    };

    SpriteSheet.prototype.getTileBounds = function (tileIndex)
    {
        if (this.image.isLoaded)
        {
            var tilesPerRow = Math.floor(this.image.width / this.tileWidth);
            var horizontalOffset = (tileIndex % tilesPerRow) * this.tileWidth;
            var verticalOffset = Math.floor(tileIndex / tilesPerRow) * this.tileHeight;

            return {
                x: horizontalOffset,
                y: verticalOffset,
                width: this.tileWidth,
                height: this.tileHeight
            };
        }
    };

    SpriteSheet.prototype.isLoaded = function ()
    {
        return this.image && this.image.isLoaded;
    };

    SpriteSheet.prototype.playAnimation = function (name, isReversed)
    {
        this.currentAnimation = this.animations[name];
        this.currentAnimation.isComplete = false;
        this.currentAnimation.isReversed = (isReversed === true);
        this.animationTime = 0;

        if (isReversed)
            this.setCurrentTile(this.currentAnimation.end);
        else
            this.setCurrentTile(this.currentAnimation.start);
    };

    SpriteSheet.prototype.setCurrentTile = function (index)
    {
        if (this.currentTile !== index)
        {
            this.currentTile = index;
            this.currentTileBounds = null;
        }
    };

    SpriteSheet.prototype.setImage = function (image)
    {
        this.image = image;
    };

    SpriteSheet.prototype.updateAnimation = function (deltaTime)
    {
        if (!this.currentAnimation || this.currentAnimation.isComplete)
            return;

        var frameTime = 0;
        this.animationTime += deltaTime;

        var startFrame, endFrame, direction;
        if (this.currentAnimation.isReversed)
        {
            startFrame = this.currentAnimation.end;
            endFrame = this.currentAnimation.start - 1;
            direction = -1;
        }
        else
        {
            startFrame = this.currentAnimation.start;
            endFrame = this.currentAnimation.end + 1;
            direction = 1;
        }

        var frame = startFrame;
        while (frame !== endFrame)
        {
            if (this.currentAnimation.frames[frame] != null)
                frameTime += this.currentAnimation.frames[frame];
            else
                frameTime += this.currentAnimation.speed;

            if (this.animationTime < frameTime)
            {
                this.setCurrentTile(frame);
                return;
            }

            frame += direction;
        }

        if (this.currentAnimation.reverseOnComplete && !this.currentAnimation.isReversed)
        {
            this.animationTime -= frameTime;
            this.currentAnimation.isReversed = true;
            this.setCurrentTile(this.currentAnimation.end);
        }
        else if (this.currentAnimation.isLooping)
        {
            this.animationTime -= frameTime;
            this.currentAnimation.isReversed = false;
            this.setCurrentTile(this.currentAnimation.start);
        }
        else
        {
            this.currentAnimation.isComplete = true;
            this.trigger('animationComplete', this.currentAnimation);
        }
    };

    Events.register(SpriteSheet.prototype);
    return SpriteSheet;
});
