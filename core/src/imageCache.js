define(function ()
{
    'use strict';

    function ImageCache()
    {
        this.images = {};
        this.syncedImages = {};
        this.globalIndex = 0;
    }

    ImageCache.prototype.onImageLoaded = function (image)
    {
        image.width = image.data.width;
        image.height = image.data.height;
        image.isLoaded = true;

        var syncedImageList = this.syncedImages[image.id];
        if (syncedImageList)
        {
            for (var i = 0; i < syncedImageList.length; ++i)
            {
                syncedImageList[i].src = image.path;
            }
        }
    };

    ImageCache.prototype.getImage = function (id)
    {
        return this.images[id];
    };

    ImageCache.prototype.isLoading = function ()
    {
        for (var i in this.images)
        {
            if (!this.images[i].isLoaded)
            {
                return true;
            }
        }

        return false;
    };

    ImageCache.prototype.unbindImage = function (imageID, imgElement)
    {
        if (this.syncedImages[imageID])
        {
            var index = this.syncedImages[imageID].indexOf(imgElement);
            if (index > -1)
            {
                this.syncedImages[imageID].splice(index, 1);
            }
        }
    };

    ImageCache.prototype.bindImage = function (imageID, imgElement)
    {
        if (!this.syncedImages[imageID])
        {
            this.syncedImages[imageID] = [];
        }

        this.syncedImages[imageID].push(imgElement);
        if (this.images[imageID])
        {
            imgElement.src = this.images[imageID].path;
        }
    };

    ImageCache.prototype.setImage = function (id, path)
    {
        var image = this.images[id];
        if (!image)
        {
            image = {
                id: id,
                data: new Image(),
                path: path,
                isLoaded: false
            };

            image.globalIndex = this.globalIndex++;
            image.data.onload = this.onImageLoaded.bind(this, image);

            this.images[id] = image;
        }

        image.data.src = path;

        return image;
    };

    return new ImageCache();
});
