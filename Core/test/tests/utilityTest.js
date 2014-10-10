define(['core/src/utility'], function (Utility)
{
    'use strict';

    function UtilityTest()
    {
        this.name = 'Utility Test';
    }

    UtilityTest.prototype.testRemoveElement = function ()
    {
        var input = [1, 2];
        Utility.removeElement(input, 2);
        assertEquals(1, input.length);
    };

    UtilityTest.prototype.testRemoveElementByProperty = function ()
    {
        var input = [
            {property1: 'value1', property2: 'otherValue'},
            {property1: 'value2', property2: 'removeMe'},
            {property1: 'value3', property2: 'otherValue'}
        ];

        Utility.removeElementByProperty(input, 'property2', 'removeMe');
        assertEquals(2, input.length);
        assertEquals('value1', input[0].property1);
        assertEquals('value3', input[1].property1);
    };

    return UtilityTest;
});
