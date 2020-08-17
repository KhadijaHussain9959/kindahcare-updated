
var selfEasyrtcid = "";


function disable(domId) {
    document.getElementById(domId).disabled = "disabled";
}


function enable(domId) {
    document.getElementById(domId).disabled = "";
}

function connect() {
	if($('#txtname').val()==''){
	 easyrtc.showError("MEDIA-ERROR", "Please enter your name");
	 return false;
	}
	easyrtc.setUsername($('#txtname').val());
    easyrtc.setVideoDims(1280,720);
    easyrtc.enableDebug(false);
    easyrtc.setRoomOccupantListener(convertListToButtons);
   // easyrtc.easyApp("easyrtc.videoChatHd", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
    easyrtc.initMediaSource(
        function(){        // success callback
            var selfVideo = document.getElementById("selfVideo");
            easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
            easyrtc.connect("easyrtc.chat", loginSuccess, loginFailure);
        },
        function(errorCode, errmesg){
            easyrtc.showError("MEDIA-ERROR", errmesg);
        }  // failure callback
        );
}


function terminatePage() {
    easyrtc.disconnect();
}


function hangup() {
    easyrtc.hangupAll();
    disable('hangupButton');
}


function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}


function convertListToButtons (roomName, data, isPrimary) {
    clearConnectList();
    var otherClientDiv = document.getElementById('otherClients');
    for(var easyrtcid in data) {
        var button = document.createElement('button');
        button.onclick = function(easyrtcid) {
            return function() {
                performCall(easyrtcid);
            };
        }(easyrtcid);

        var label = document.createTextNode(easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        button.className = "callbutton";
        otherClientDiv.appendChild(button);
    }
	
	 if( !otherClientDiv.hasChildNodes() ) {
        otherClientDiv.innerHTML = "Nobody else is online to chat";
    }
}

function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    var acceptedCB = function(accepted, easyrtcid) {
        if( !accepted ) {
            easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
            enable('otherClients');
        }
    };
    var successCB = function() {
        enable('hangupButton');
    };
    var failureCB = function() {
        enable('otherClients');
    };
    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}

function loginSuccess(easyrtcid) {
    disable("connectButton");
    // enable("disconnectButton");
    enable('otherClients');
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " +  easyrtc.idToName(easyrtcid);// easyrtcid;
}



function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
function disconnect() {
    document.getElementById("iam").innerHTML = "logged out";
    easyrtc.disconnect();
    console.log("disconnecting from server");
    enable("connectButton");
    // disable("disconnectButton");
    clearConnectList();
    easyrtc.setVideoObjectSrc(document.getElementById('selfVideo'), "");
}


easyrtc.setStreamAcceptor( function(easyrtcid, stream) {
    var video = document.getElementById('callerVideo');
    easyrtc.setVideoObjectSrc(video,stream);
    console.log("saw video from " + easyrtcid);
    enable("hangupButton");
});


easyrtc.setOnStreamClosed( function (easyrtcid) {
    easyrtc.setVideoObjectSrc(document.getElementById('callerVideo'), "");
    disable("hangupButton");
});




easyrtc.setAcceptChecker(function(easyrtcid, callback) {
    document.getElementById('acceptCallBox').style.display = "block";
    if( easyrtc.getConnectionCount() > 0 ) {
        document.getElementById('acceptCallLabel').innerHTML = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
    }
    else {
        document.getElementById('acceptCallLabel').innerHTML = "Accept incoming call from " + easyrtc.idToName(easyrtcid) +  " ?";
    }
	console.log(document.getElementById('acceptCallLabel').innerHTML);
    var acceptTheCall = function(wasAccepted) {
        document.getElementById('acceptCallBox').style.display = "none";
        if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
            easyrtc.hangupAll();
        }
        callback(wasAccepted);
    };
    document.getElementById("callAcceptButton").onclick = function() {
        acceptTheCall(true);
    };
    document.getElementById("callRejectButton").onclick =function() {
        acceptTheCall(false);
    };
} );



// Sets calls so they are automatically accepted (this is default behaviour)
//easyrtc.setAcceptChecker(function(caller, callback) {
  //  cb(true);
//} );
