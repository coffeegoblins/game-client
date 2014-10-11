define(['core/src/utility'], function (Utility)
{
    'use strict';
    function RenderableProgressBar(element)
    {
        this.element = element;
        this.foregroundElement = element.querySelector('.innerBar');
        this.previewElement = element.querySelector('.innerBarPreview');
    }

    RenderableProgressBar.prototype.disableTransitions = function ()
    {
        this.previewElement.classList.add('no-transition');
        this.foregroundElement.classList.add('no-transition');
    };

    RenderableProgressBar.prototype.enableTransitions = function ()
    {
        this.previewElement.classList.remove('no-transition');
        this.foregroundElement.classList.remove('no-transition');
    };

    RenderableProgressBar.prototype.previewProgress = function (portion)
    {
        if (portion)
        {
            this.previewElement.classList.add('blink');
            this.previewElement.style.width = this.progress / this.maxProgress * 100 + '%';
            this.foregroundElement.style.width = (this.progress - portion) / this.maxProgress * 100 + '%';
        }
        else if (this.previewElement.classList.contains('blink'))
        {
            this.previewElement.classList.remove('blink');
            this.foregroundElement.style.width = this.progress / this.maxProgress * 100 + '%';
        }
    };

    RenderableProgressBar.prototype.setProgress = function (progress, maxProgress)
    {
        this.progress = progress;
        this.maxProgress = maxProgress;
        this.foregroundElement.style.width = (progress / maxProgress * 100) + '%';
    };

    return RenderableProgressBar;
});
