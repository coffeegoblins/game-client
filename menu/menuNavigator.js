define(function ()
{
    'use strict';

    return {
        createContentDiv: function ()
        {
            this.contentDiv = document.createElement('div');
            this.contentDiv.id = 'contentWrapper';
            document.body.appendChild(this.contentDiv);

            return this.contentDiv;
        },

        findParentElement: function (element, selector)
        {
            while (element && element.matches)
            {
                if (element.matches(selector))
                    return element;

                element = element.parentNode;
            }
        },

        insertTemplate: function (element, template)
        {
            element.insertAdjacentHTML('beforeend', template);
            this.removeWhitespace(element);
        },

        removeChildren: function (parentElement)
        {
            while (parentElement.lastChild)
            {
                parentElement.removeChild(parentElement.lastChild);
            }
        },

        removeWhitespace: function (element)
        {
            for (var i = element.childNodes.length - 1; i >= 0; i--)
            {
                var childNode = element.childNodes[i];
                if (childNode.nodeType === 3 && !/\S/.test(childNode.nodeValue))
                    element.removeChild(childNode);
                else if (childNode.nodeType === 1)
                    this.removeWhitespace(childNode);
            }
        }
    };
});
