define([
        'core/src/events',
        'core/src/imageCache',
        'core/src/inputHandler',
        'core/src/scheduler',
        'core/src/utility',
        'renderer/src/renderableMap',
        'renderer/src/renderableLadder',
        'renderer/src/renderableObject',
        'renderer/src/renderableSoldier',
        'renderer/src/camera/camera',
        'renderer/src/renderablePath'
    ],
    function (Events, ImageCache, InputHandler, Scheduler, Utility, RenderableMap, RenderableLadder, RenderableObject, RenderableSoldier, Camera, RenderablePath)
    {
        'use strict';

        function Renderer()
        {
            this.renderables = [];
            this.renderablePaths = [];

            Events.register(this);
            this.onResizeBound = this.onResize.bind(this);

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';

            this.context = this.canvas.getContext('2d');
            this.camera = new Camera();
        }

        Renderer.prototype.initialize = function ()
        {
            document.body.appendChild(this.canvas);

            this.renderables.length = 0;
            this.renderablePaths.length = 0;

            InputHandler.on('drag', this, this.onDrag);
            InputHandler.registerClickEvent('game-canvas', this.onClick, this);
            window.addEventListener('resize', this.onResizeBound, false);

            this.onResize();
            Scheduler.schedule(
            {
                id: 'renderer',
                context: this,
                method: this.update,
                priority: Scheduler.priority.render
            });
        };

        Renderer.prototype.onClick = function (e)
        {
            if (this.renderableMap)
            {
                var position = this.camera.screenToTile(e.pageX + this.camera.viewportRect.x, e.pageY + this.camera.viewportRect.y);
                this.renderableMap.onClick(e, position);
            }
        };

        Renderer.prototype.onDrag = function (e, deltaX, deltaY)
        {
            this.camera.moveViewport(deltaX, deltaY);
        };

        Renderer.prototype.onResize = function ()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.camera.handleResize(this.canvas.width, this.canvas.height);
            this.trigger('resize', this.canvas.width, this.canvas.height);
        };

        Renderer.prototype.createLevelImage = function (levelName, levelData)
        {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            var renderables = [];
            var renderableMap = new RenderableMap(levelData.map);

            for (var i = 0; i < levelData.objects.length; i++)
            {
                renderables.push(new RenderableObject(levelData.objects[i]));
            }

            this.renderLevelPreview(levelName, levelData, renderables, renderableMap);
        };

        Renderer.prototype.renderLevelPreview = function (levelName, levelData, renderables, renderableMap, loadedCallback)
        {
            if (ImageCache.isLoading())
            {
                setTimeout(this.renderLevelPreview.bind(this, levelName, levelData, renderables, renderableMap, loadedCallback), 100);
                return;
            }

            var camera = new Camera();
            camera.viewportRect.x = -levelData.map.height * camera.halfTileWidth;
            camera.viewportRect.width = (levelData.map.width + levelData.map.height) * camera.halfTileWidth;
            camera.viewportRect.height = (levelData.map.width + levelData.map.height) * camera.halfTileHeight;

            this.canvas.width = camera.viewportRect.width;
            this.canvas.height = camera.viewportRect.height;

            var context = this.canvas.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            renderableMap.render(context, camera);
            for (var i = 0; i < renderables.length; i++)
            {
                renderables[i].render(context, 0, camera);
            }

            ImageCache.setImage(levelName, this.canvas.toDataURL());
        };

        Renderer.prototype.renderPreview = function (canvas, map, objects)
        {
            if (this.levelPreviewTimer)
                clearTimeout(this.levelPreviewTimer);

            var camera = new Camera();
            camera.viewportRect.x = -map.height * camera.halfTileWidth;
            camera.viewportRect.width = (map.width + map.height) * camera.halfTileWidth;
            camera.viewportRect.height = (map.width + map.height) * camera.halfTileHeight;

            canvas.width = camera.viewportRect.width;
            canvas.height = camera.viewportRect.height;

            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);

            var renderables = [];
            var renderableMap = new RenderableMap(map);
            for (var i = 0; i < objects.length; i++)
                renderables.push(new RenderableObject(objects[i]));

            this.levelPreviewTimer = setTimeout(function renderPreviewMap()
            {
                if (ImageCache.isLoading())
                {
                    this.levelPreviewTimer = setTimeout(renderPreviewMap, 100);
                    return;
                }

                renderableMap.render(context, camera);
                for (i = 0; i < renderables.length; i++)
                {
                    renderables[i].render(context, 0, camera);
                }
            }, 0);
        };

        Renderer.prototype.sortRenderables = function ()
        {
            for (var i = 1; i < this.renderables.length; i++)
            {
                var obj1 = this.renderables[i];
                for (var j = i - 1; j >= 0; j--)
                {
                    var obj2 = this.renderables[j];
                    if (obj2.isDead)
                        break;

                    if (!obj1.isDead)
                    {
                        var obj1Position = obj1.getTileRight() + obj1.getTileBottom();
                        var obj2Position = obj2.getTileRight() + obj2.getTileBottom();

                        if (obj1Position > obj2Position)
                            break;
                    }

                    this.renderables[j + 1] = this.renderables[j];
                }

                this.renderables[j + 1] = obj1;
            }
        };

        Renderer.prototype.uninitialize = function ()
        {
            this.clearEvents();
            InputHandler.off('drag', this);
            InputHandler.unregisterClickEvent('game-canvas');
            window.removeEventListener('resize', this.onResizeBound, false);
        };

        Renderer.prototype.update = function (e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);
            if (!this.renderableMap)
                return;

            this.camera.update(deltaTime);
            this.renderableMap.render(this.context, this.camera);

            // Pathing needs to be drawn after the map and before the objects
            for (var i = 0; i < this.renderablePaths.length; i++)
                this.renderablePaths[i].render(this.context, this.camera);

            // Make sure the objects are drawn in the right order
            this.sortRenderables();
            for (i = 0; i < this.renderables.length; i++)
                this.renderables[i].render(this.context, deltaTime, this.camera);
        };


        Renderer.prototype.addRenderableLadder = function (ladder)
        {
            this.renderables.unshift(new RenderableLadder(ladder));
        };

        Renderer.prototype.addRenderableMap = function (map)
        {
            this.renderableMap = new RenderableMap(map);
        };

        Renderer.prototype.addRenderableObject = function (object)
        {
            this.renderables.unshift(new RenderableObject(object));
        };

        Renderer.prototype.addRenderablePath = function (id, nodes, isSelected)
        {
            this.renderablePaths.push(new RenderablePath(id, nodes, isSelected));
        };

        Renderer.prototype.addRenderableSoldier = function (soldier)
        {
            var renderableSoldier = new RenderableSoldier(soldier);
            this.renderables.push(renderableSoldier);

            soldier.on('death', this, function ()
            {
                Utility.removeElement(this.renderables, renderableSoldier);
            });
        };

        Renderer.prototype.clearRenderablePaths = function ()
        {
            this.renderablePaths = [];
        };

        Renderer.prototype.clearRenderablePathById = function (id)
        {
            Utility.removeElementByProperty(this.renderablePaths, 'id', id);
        };


        return new Renderer();
    });
