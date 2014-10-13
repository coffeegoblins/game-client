var testRequest = new XMLHttpRequest();
testRequest.open('POST', "https://nodejs-coffeegoblins.rhcloud.com/login");
testRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
testRequest.onreadystatechange = function ()
{
    if (testRequest.readyState === 4)
    {
        if (testRequest.status === 200)
        {
            console.log("200");
        }
    }
};

testRequest.send('username=' + encodeURIComponent("fawcett") + "&password=" + encodeURIComponent(""));
