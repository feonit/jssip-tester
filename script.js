
var APP = {};
var GUI = {};

APP.session = null;

GUI.console = {

    el: document.querySelector('textarea'),

    log: function fn(eventName, groupName, error){
        fn.count || (fn.count = 0);
        if (typeof eventName !== 'string') throw Error();
        if (groupName && (typeof groupName !== 'string')) throw Error();

        var arg = arguments;

        if (arg.length == 1){
            this.el.innerHTML += '\n' + 'event: ' + eventName;
        }
        if (arg.length == 2){
            this.el.innerHTML += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']';

        }
        if (arg.length == 3){
            this.el.innerHTML += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']' + '\n\t\t (оригинальную ошибку смотри в консоли)';
             console.error(error);
        }
    },

    error: function(text){
        alert(text);

        throw Error(text);
    }
};

GUI.console.log('init scripts');

function getSIP_URI_my(){
    var sip_uri;

    if(!GUI.fieldSIP_URI_name.value){
        GUI.console.error('not define "SIP URI name" ')
    }

    if(!GUI.fieldSIP_URI_realm.value){
        GUI.console.error('not define "SIP URI realm" ')
    }

    sip_uri = 'sip:' + GUI.fieldSIP_URI_name.value + '@' + GUI.fieldSIP_URI_realm.value;

    return sip_uri;
}

function getSIP_URI_conference(){
    var sip_uri;

    if(!GUI.fieldNumber.value){
        GUI.console.error('not define "SIP URI number" ')
    }

    if(!GUI.fieldSIP_URI_realm.value){
        GUI.console.error('not define "SIP URI realm" ')
    }

    sip_uri = 'sip:' + GUI.fieldNumber.value + '@' + GUI.fieldSIP_URI_realm.value;

    return sip_uri;
}

var eventHandlers = {

    'onClickBtnStartSip': function(){

        if(!GUI.fieldWS_URI.value){
            GUI.console.error('not define "WS URI" ')
        }

        if(!GUI.fieldSIP_password.value){
            GUI.console.error('not define "PASSWORD" ')
        }

        var configuration = {
            authorization_user: "",
            connection_recovery_max_interval: 30,
            connection_recovery_min_interval: 2,
            display_name: GUI.field_display_name.value,
            hack_ip_in_contact: false,
            hack_via_tcp: false,
            hack_via_ws: false,
            log: { level: 'debug' },
            no_answer_timeout: 60,
            password: GUI.fieldSIP_password.value,
            register: true,
            register_expires: 600,
            registrar_server: "",
            session_timers: true,
            uri: getSIP_URI_my(),
            use_preloaded_route: false,
            ws_servers: GUI.fieldWS_URI.value
        };

        console.log('configurations for connect: ');
        console.log(configuration);


        var coolPhone = new JsSIP.UA(configuration);

        coolPhone.start();

        APP.coolPhone = coolPhone;

        APP.coolPhone.on('connected', function(e){

            GUI.console.log('connected', 'WebSocket connection events')

        });

        APP.coolPhone.on('disconnected', function(e){

            GUI.console.log('disconnected', 'WebSocket connection events')

        });

        APP.coolPhone.on('newRTCSession', function(e){

            GUI.console.log('newRTCSession', 'New incoming or outgoing call event')

        });

        APP.coolPhone.on('newMessage', function(e){

            GUI.console.log('newMessage', 'New incoming or outgoing IM message event')

        });

        APP.coolPhone.on('registered', function(e){

            GUI.console.log('registered', 'SIP registration events')

        });

        APP.coolPhone.on('unregistered', function(e){

            GUI.console.log('unregistered', 'SIP registration events')

        });

        APP.coolPhone.on('registrationFailed', function(e){

            GUI.console.log('registrationFailed', 'SIP registration events')
        });

        GUI.console.log('click', 'Starting the User Agent')

    },

    'onClickBtnCallSip': function(){
        var sip_uri = getSIP_URI_conference();

        var peerconnection_config;

        var options = {
            pcConfig: { "iceServers": [ {"urls": ["stun:stun.l.google.com:19302"]} ], "gatheringTimeout": 2000 },
            'eventHandlers': eventHandlers.sip,
            'extraHeaders': [
                'X-Can-Renegotiate: true'
            ],
            rtcOfferConstraints: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            },
            'mediaConstraints': {'audio': true, 'video': true}
        };

        console.log('configurations for call: ' + options);
        console.log(options);

        APP.session = APP.coolPhone.call(sip_uri, options);

        GUI.console.log('click', 'Starting the User Agent')
    },

    'onClickBtnbtnSendMessageSip': function(){
        var text = 'Hello Bob!';

        // Register callbacks to desired message events
        var eventHandlers = {
            'succeeded': function(e){

                GUI.console.log('succeeded', 'Instant messaging')

            },
            'failed':    function(e){

                GUI.console.log('failed', 'Instant messaging', e)

            }
        };

        var options = {
            'eventHandlers': eventHandlers
        };

        var sip_uri = GUI.fieldAddresForMessage.value;

        if(!sip_uri){
            GUI.console.error('not define "Message text" ')
        }

        APP.coolPhone.sendMessage(sip_uri, text, options);

        GUI.console.log('message \'Hello Bob!\' was send', 'Instant messaging')
    },

    sip: {
        'progress':   function(e){

            GUI.console.log('progress', 'Making outbound calls')

        },
        'failed':     function(e){

            GUI.console.log('failed', 'Making outbound calls', e)

        },
        'confirmed':  function(e){
            // Attach local stream to selfView
            GUI.selfView.src = window.URL.createObjectURL(APP.session.connection.getLocalStreams()[0]);

            GUI.console.log('confirmed', 'Making outbound calls')

        },
        'addstream':  function(e) {
            var stream = e.stream;

            // Attach remote stream to remoteView
            GUI.remoteView.src = window.URL.createObjectURL(stream);

            GUI.console.log('addstream', 'Making outbound calls')

        },
        'ended':      function(e){

            GUI.console.log('ended', 'Making outbound calls')

        }
    }
};


var dg = document.getElementById.bind(document);

// buttons
GUI.btnStart = dg('btnStart');
GUI.btnCall = dg('btnCall');
GUI.btnSendMessage = dg('btnSendMessage');

// inputs
GUI.fieldName = dg('fieldName');
GUI.fieldWS_URI = dg('fieldWS_URI');
GUI.fieldSIP_URI_name = dg('fieldSIP_URI_name');
GUI.fieldSIP_URI_realm = dg('fieldSIP_URI_realm');
GUI.fieldSIP_password = dg('fieldSIP_password');
GUI.fieldAddresForMessage = dg('fieldAddresForMessage');
GUI.fieldNumber = dg('fieldNumber');
GUI.field_display_name = dg('field_display_name');

// videos
GUI.selfView =   dg('my-video');
GUI.remoteView =  dg('peer-video');


// add handlers
if(GUI.btnStart){
    GUI.btnStart.addEventListener('click', eventHandlers.onClickBtnStartSip, false );
}
if(GUI.btnCall){
    GUI.btnCall.addEventListener('click', eventHandlers.onClickBtnCallSip, false );
}
if(GUI.btnSendMessage){
    GUI.btnSendMessage.addEventListener('click', eventHandlers.onClickBtnbtnSendMessageSip, false );
}

if(localStorage){
    document.addEventListener('change', function(event){
        var target = event.target;
        var id = target.id;
        if (id){
            localStorage.setItem(id, target.value);
        }
    });
}

for(var key in localStorage) {
    var node = document.getElementById(key);
    node.value = localStorage[key];
}


