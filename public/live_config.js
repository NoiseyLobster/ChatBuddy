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
    });

    $('#startPoll').click(function () {
        if (!token) {
            return 'Not authorized';
        }

        //Starting chat polling window
    });

    $('#endPoll').click(function () {
        if (!token) {
            return 'Not authorized';
        }

        //Ending a chat polling window
    });
});

function logError(_, error, status) {
    //EBS request returned {status} ({error})
}

function logSuccess(value, status) {
    //EBS request returned {status} ({value})
}