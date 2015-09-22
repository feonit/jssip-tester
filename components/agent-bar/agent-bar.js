/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(){
        this.some = 'some';
    }

    Сonstructor.prototype = {
        onClickBtnStartSip: function(){

            if(!dataAreaExample.wsUri){
                window.logAreaExample.error('not define "WS URI" ')
            }

            if(!dataAreaExample.sipPassword){
                window.logAreaExample.error('not define "PASSWORD" ')
            }

            var configuration = {
                authorization_user: "",
                connection_recovery_max_interval: 30,
                connection_recovery_min_interval: 2,
                display_name: dataAreaExample.displayName,
                hack_ip_in_contact: false,
                hack_via_tcp: false,
                hack_via_ws: false,
                log: { level: 'debug' },
                no_answer_timeout: 60,
                password: dataAreaExample.sipPassword,
                register: true,
                register_expires: 600,
                registrar_server: "",
                session_timers: true,
                uri: dataAreaExample.getSIP_URI_my(),
                use_preloaded_route: false,
                ws_servers: dataAreaExample.wsUri
            };

            var ua = new JsSIP.UA(configuration);

            ua.start();

            APP.ua = ua;

            ua.on('connected', function(e){

                logAreaExample.log('connected', 'WebSocket connection events')

            });

            ua.on('disconnected', function(e){

                logAreaExample.log('disconnected', 'WebSocket connection events')

            });

            // Call/Message reception callbacks
            ua.on('newRTCSession', function(e) {
                window.logAreaExample.log('newRTCSession', 'New incoming or outgoing call event')
                // Set a global '_Session' variable with the session for testing.
                _Session = e.session;
                GUI.new_call(e);
            });

            ua.on('newMessage', function(e){

                logAreaExample.log('newMessage', 'New incoming or outgoing IM message event')

            });

            ua.on('registered', function(e){

                logAreaExample.log('registered', 'SIP registration events')

            });

            ua.on('unregistered', function(e){

                logAreaExample.log('unregistered', 'SIP registration events')

            });

            ua.on('registrationFailed', function(e){

                logAreaExample.log('registrationFailed', 'SIP registration events')
            });

            logAreaExample.log('click', 'Starting the User Agent')

        },

        onClickBtnCallSip: function(){
            var sip_uri = dataAreaExample.getSIP_URI_conference();

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

            APP.session = APP.ua.call(sip_uri, options);

            logAreaExample.log('click', 'Starting the User Agent')
        }
    };

    Component.register({

        // даем имя компоненту
        elementTagName: 'agent-bar',

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
        events: {
            'click #btnStart': 'onClickBtnStartSip',
            'click #btnCall': 'onClickBtnCallSip'
        }
    });

})();
