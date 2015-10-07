
var APP = {};

var peerconnection_config = {
    "iceServers": [
        {
            "urls": ["stun:stun.l.google.com:19302"]
        }
    ],
    "gatheringTimeout": 2000
};

var localStream, remoteStream;

// dep SoundSystem
var audioPlayer = new AudioPlayer();
var agentSIP = new AgentSIP();
var storageManager = new StorageManager('dataAreaExample');

document.addEventListener("DOMContentLoaded", ready);

var dataAreaInitialState = {
    name : '1000',
    wsUri : 'wss://sip.nefrosovet.ru:443',
    realm : 'sip.nefrosovet.ru',
    displayName : 'test name',
    sipPassword : '',
    userName : '',
    number : ''
};

function ready(){
    //var isCorrectVersion;
    //
    //if ( JsSIP && (isCorrectVersion = JsSIP.version === '0.7.4') )
    //    logAreaExample.log(JsSIP.name + ' ' + JsSIP.version);
    //else
    //    logAreaExample.error('Need JsSIP 0.7.4');

    // установить состояния для полей данных
    JsSIP.debug.enable('JsSIP:*');

    setTimeout(function(){
        var data = storageManager.getProperties();

        if (data){
            dataAreaExample.setState(data);
        }

        dataAreaExample.on('update', function(changes){
            console.log();

            var save = {};

            save[changes.name] = changes.newValue;
            storageManager.setProperties(save);
        })

    }, 300)
}





