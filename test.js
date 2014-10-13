var testRequest = new XMLHttpRequest();
testRequest.open('GET', "https://nodejs-coffeegoblins.rhcloud.com");
testRequest.onreadystatechange = function ()
{
    if (testRequest.readyState === 4)
    {
        document.body.innerHTML = "4";
        if (testRequest.status === 200)
        {
            console.log("200");
        }

        document.body.innerHTML = testRequest.status.toString();
        document.body.innerHTML += testRequest.responseText;
    }
};

testRequest.send();

var postRequest = new XMLHttpRequest();
postRequest.open('POST', "https://nodejs-coffeegoblins.rhcloud.com/login");
postRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
postRequest.onreadystatechange = function ()
{
    if (postRequest.readyState === 4)
    {
        document.body.innerHTML = "4";
        if (postRequest.status === 200)
        {
            console.log("200");
        }

        document.body.innerHTML = postRequest.status.toString();
        document.body.innerHTML += postRequest.responseText;
    }
};

postRequest.send('username=' + encodeURIComponent("fawcett") + "&password=" + encodeURIComponent(""));
