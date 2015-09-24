
var APP = {};

var peerconnection_config = { "iceServers": [ {"urls": ["stun:stun.l.google.com:19302"]} ], "gatheringTimeout": 2000 };

var localStream, remoteStream;

var GUI = GUI || {};

GUI = {

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

        var session = GUI.getSession(aor);

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
            call.data.remoteCanRenegotiateRTC = call.request.getHeader('X-Can-Renegotiate') !== 'false';

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

                selfView.src = window.URL.createObjectURL(localStream);

                selfView.volume = 0;

                // TMP
                window.localStream = localStream;
            }

            if (e.originator === 'remote') {
                call.data.remoteCanRenegotiateRTC = e.response.getHeader('X-Can-Renegotiate') !== 'false';
            }
        });

        call.on('addstream', function(e) {
            remoteStream = e.stream;

            // Attach remote stream to remoteView
            remoteView.src = window.URL.createObjectURL(remoteStream);
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
    }
};

APP.session = null;

// debug

JsSIP.debug.enable('JsSIP:*');


var isCorrectVersion;

if ( JsSIP && (isCorrectVersion = JsSIP.version === '0.7.4') )
    logAreaExample.log(JsSIP.name + ' ' + JsSIP.version);
else
    logAreaExample.error('Need JsSIP 0.7.4');

// установить состояния для полей данных

if (localStorage){

    var componentDocument = document.getElementById('dataAreaExample').shadowRoot;

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

    componentDocument.addEventListener('change', function(event){
        var target = event.target;
        var id = target.id;
        if (id){
            var data = store.getData();
            data[id] = target.value;
            store.setData(data);
        }
    });

    if(!store.getData()){
        store.setData({});
    }

    var data = store.getData();
    var key;
    var node;

    if(data){
        dataAreaExample.setState(data);
    }
}


