let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

twitch.onContext(function (context) {
    //do something
});

twitch.onAuthorized(function (auth) {
    console.log("authorized");
    
    // save our credentials
    token = auth.token;
    tuid = auth.userId;

    // enable the button
    $('input').removeAttr('disabled');
});

$(function () {
    $('#connectToChat').click(function () {
        if (!token) {
            return 'Not authorized';
        }

        //Starting a connection with twitch chat
        $.ajax({
            type: 'POST',
            url: location.protocol + '//localhost:3000/ConnectToChat',
            headers: { 'Authorization': 'Bearer ' + token },
            success: logSuccess, 
            error: logError
        });
    });

    $('#startPoll').click(function () {
        if (!token) {
            return 'Not authorized';
        }

        //Starting chat polling window
        $.ajax({
            type: 'POST',
            url: location.protocol + '//localhost:3000/StartPoll',
            headers: { 'Authorization': 'Bearer ' + token },
            success: logSuccess, 
            error: logError
        });
    });

    $('#endPoll').click(function () {
        if (!token) {
            return 'Not authorized';
        }

        //Ending a chat polling window
        $.ajax({
            type: 'POST',
            url: location.protocol + '//localhost:3000/EndPoll',
            headers: { 'Authorization': 'Bearer ' + token },
            success: logSuccess, 
            error: logError
        });
    });
});

function logError(_, error, status) {
    //EBS request returned {status} ({error})
}

function logSuccess(value, status) {
    //EBS request returned {status} ({value})
}