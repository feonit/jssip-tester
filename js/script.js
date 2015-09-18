
var APP = {};

var peerconnection_config = { "iceServers": [ {"urls": ["stun:stun.l.google.com:19302"]} ], "gatheringTimeout": 2000 };

var localStream, remoteStream;


var GUI = {

    // Active session collection
    Sessions: [],


    new_call : function(e) {
    // JsSIP.UA newRTCSession event listener
        /** @type {JsSIP.RTCSession} */
        var call = e.session;

        /** @type {JsSIP.NameAddrHeader} */
        var addr = call.remote_identity;

        /** @type {JsSIP.URI} */
        var uri = addr.uri;

        /** @type {String} */
        var display_name = call.remote_identity.display_name || uri.user;

        /** Returns a String representing the AoR of the URI
         * @type {String}
         * */
        var aor = uri.toAor();

        var session = session = GUI.getSession(aor);

        // We already have a session with this peer
        if (session) {
            if (session.call && !session.call.isEnded()) {
                call.terminate();
                return;
            } else {
                session.call = call;
            }

            // new session
        } else {
            session = GUI.createSession(display_name, uri.toAor());
            session.call = call;
        }

        GUI.setCallEventHandlers(e);
    },

    //sounds/incoming-call2.ogg
    playSound : function _fn(sound_file) {
        if(!_fn.soundPlayer){
            _fn.soundPlayer = document.createElement("audio");
            _fn.soundPlayer.volume = 1;
        }

        _fn.soundPlayer.setAttribute("src", sound_file);
        _fn.soundPlayer.play();
    },

    /**
     * @param {String} display_name
     * @param {String} uri AoR
     * */
    createSession: function(display_name, uri) {
        // Add a session object to the session collection
        var session,
            compositionIndicator;

        session = GUI.getSession(uri);

        if (session === null) {
            // iscomposing stuff.
            //compositionIndicator = GUI.f(uri);
            //compositionIndicator.idle();


            session = {
                uri: uri,
                displayName: display_name,
                call: null,
                //compositionIndicator: compositionIndicator,
                //isComposing: false,
                //chat: []
            };

            GUI.Sessions.push(session);
        }

        return session;
    },

    /**
     * Возвращает сохраненную сессию по идентификатору
     * @param {String} uri AoR
     * @return {null || session}
     * */
    getSession : function(uri) {
        var idx,
            session = null;

        for(idx in GUI.Sessions) {
            if (GUI.Sessions[idx].uri === uri) {
                session = GUI.Sessions[idx];
                break;
            }
        }

        return session;
    },

    removeSession: function(uri, force) {
        // remove a session object from the session collection
        console.log('Tryit: removeSession');
        var idx, session;

        for(idx in GUI.Sessions) {
            session = GUI.Sessions[idx];
            if (session.uri === uri) {

                // living chat session
                if (!force && session.chat.length) {
                    session.call = null;
                } else {
                    //session.compositionIndicator.close();
                    GUI.Sessions.splice(idx,1);
                }
            }
        }

        //GUI.renderSessions();
    },

    /**
     * handler
     * @param {JsSIP.RTCSession} call
     * */
    buttonAnswerClick: function(call) {
        if (!call) return;

        call.answer({
            pcConfig: peerconnection_config,
            // TMP:
            mediaConstraints: {audio: true, video: true},
            //extraHeaders: [
            //    'X-Can-Renegotiate: ' + String(localCanRenegotiateRTC())
            //],
            rtcOfferConstraints: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }
        });
    },

    buttonHangupClick: function(call) {
        if (call){
            call.terminate();
        }
    },

    buttonDialClick: function(target) {
        console.log('Tryit: buttonDialClick');

        GUI.jssipCall(target);
    },

    /**
     * @param {String} target — Number of opponent
     * */
    jssipCall : function(target) {
        APP.ua.call(target, {
            pcConfig: peerconnection_config,
            mediaConstraints: { audio: true, video: true },
            extraHeaders: [
                'X-Can-Renegotiate: true'
            ],
            rtcOfferConstraints: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }
        });
    },

    setCallEventHandlers : function(e){
        var request = e.request,
            call = e.session;

        // check custom X-Can-Renegotiate header field
        if (call.direction === 'incoming') {
            if (call.request.getHeader('X-Can-Renegotiate') === 'false') {
                call.data.remoteCanRenegotiateRTC = false;
            } else {
                call.data.remoteCanRenegotiateRTC = true;
            }

            GUI.playSound("sounds/incoming-call2.ogg");

            // i rendered always 1 session

            sessionComponent.setState({
                data: GUI.Sessions[0]
            });
        }
        // Failed
        call.on('failed',function(e) {
            alert('failed')
        });

        call.on('connecting', function() {
            if (call.connection.getLocalStreams().length > 0) {
                window.localStream = call.connection.getLocalStreams()[0];
            }
        });

        // Progress
        call.on('progress',function(e){});

        // Started
        call.on('accepted',function(e){
            //Attach the streams to the views if it exists.
            if (call.connection.getLocalStreams().length > 0) {
                localStream = call.connection.getLocalStreams()[0];

                GUI.selfView.src = window.URL.createObjectURL(localStream);

                //selfView = JsSIP.rtcninja.attachMediaStream(selfView, localStream);

                GUI.selfView.volume = 0;

                // TMP
                window.localStream = localStream;
            }

            if (e.originator === 'remote') {
                if (e.response.getHeader('X-Can-Renegotiate') === 'false') {
                    call.data.remoteCanRenegotiateRTC = false;
                }
                else {
                    call.data.remoteCanRenegotiateRTC = true;
                }
            }
        });

        call.on('addstream', function(e) {
            remoteStream = e.stream;

            // Attach remote stream to remoteView
            GUI.remoteView.src = window.URL.createObjectURL(remoteStream);

            //remoteView = JsSIP.rtcninja.attachMediaStream(GUI.remoteView, remoteStream);
        });

        // NewDTMF
        call.on('newDTMF',function(e) {});

        call.on('hold',function(e) {});

        call.on('unhold',function(e) {});

        // Ended
        call.on('ended', function(e) {});

        // received UPDATE
        call.on('update', function(e) {});

        // received reINVITE
        call.on('reinvite', function(e) {});

        // received REFER
        call.on('refer', function(e) {});

        // received INVITE replacing this session
        call.on('replaces', function(e) {});
    },

    console : {

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
    }
};

APP.session = null;

var isCorrectVersion;

if ( JsSIP && (isCorrectVersion = JsSIP.version === '0.7.4') )
    GUI.console.log(JsSIP.name + ' ' + JsSIP.version);
else
    GUI.console.error('Need JsSIP 0.7.4');

// debug

JsSIP.debug.enable('JsSIP:*');


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

    onClickBtnStartSip: function(){

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


        var ua = new JsSIP.UA(configuration);

        ua.start();

        APP.ua = ua;

        ua.on('connected', function(e){

            GUI.console.log('connected', 'WebSocket connection events')

        });

        ua.on('disconnected', function(e){

            GUI.console.log('disconnected', 'WebSocket connection events')

        });

        // Call/Message reception callbacks
        ua.on('newRTCSession', function(e) {
            GUI.console.log('newRTCSession', 'New incoming or outgoing call event')
            // Set a global '_Session' variable with the session for testing.
            _Session = e.session;
            GUI.new_call(e);
        });

        ua.on('newMessage', function(e){

            GUI.console.log('newMessage', 'New incoming or outgoing IM message event')

        });

        ua.on('registered', function(e){

            GUI.console.log('registered', 'SIP registration events')

        });

        ua.on('unregistered', function(e){

            GUI.console.log('unregistered', 'SIP registration events')

        });

        ua.on('registrationFailed', function(e){

            GUI.console.log('registrationFailed', 'SIP registration events')
        });

        GUI.console.log('click', 'Starting the User Agent')

    },

    onClickBtnCallSip: function(){
        var sip_uri = getSIP_URI_conference();

        var options = {
            pcConfig: peerconnection_config,
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

        APP.session = APP.ua.call(sip_uri, options);

        GUI.console.log('click', 'Starting the User Agent')
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
GUI.btnPhoneUp = dg('btnPhoneUp');
GUI.btnPhoneDown = dg('btnPhoneDown');

// inputs
GUI.fieldName = dg('fieldName');
GUI.fieldWS_URI = dg('fieldWS_URI');
GUI.fieldSIP_URI_name = dg('fieldSIP_URI_name');
GUI.fieldSIP_URI_realm = dg('fieldSIP_URI_realm');
GUI.fieldSIP_password = dg('fieldSIP_password');
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


if(localStorage){

    var store = {
        namespace: 'my_test',

        setData: function(obj){
            localStorage.setItem(this.namespace, JSON.stringify(obj));
        },
        getData: function(){
            try{
                return JSON.parse(localStorage.getItem(this.namespace));
            } catch (e){
                localStorage.clear();
                throw 'json was invalid'
            }
        }
    };

    if(!store.getData()){
        store.setData({});
    }

    document.addEventListener('change', function(event){
        var target = event.target;
        var id = target.id;
        if (id){
            var data = store.getData();
            data[id] = target.value;
            store.setData(data);
        }
    });

    var data = store.getData();
    var key;

    if(data){
        for(key in data) {
            var node = document.getElementById(key);
            node.value = data[key];
        }
    }
}




