/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    // dep
    var dataAreaExample = window.dataAreaExample;
    var logAreaExample = window.logAreaExample;

    function HTMLElementComponentAgentBar(){
        this.callStatus = 'incoming';
        this.call = null;
        this.uri = 'not uri is here';
        this.displayName = 'not display name is here';
    }

    HTMLElementComponentAgentBar.prototype = {

        onClickBtnStartSip: function(){

            if(!dataAreaExample.wsUri){
                logAreaExample.error('not define "WS URI" ')
            }

            if(!dataAreaExample.sipPassword){
                logAreaExample.error('not define "PASSWORD" ')
            }

            try {
                var uri = dataAreaExample.getSIP_URI_my();
            } catch (e){
                logAreaExample.log(e.message);
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
                uri: uri,
                use_preloaded_route: false,
                ws_servers: dataAreaExample.wsUri
            };

            var ua = new JsSIP.UA(configuration);

            ua.start();

            APP.ua = ua;

            ua.on('connecting', function(e){
                logAreaExample.log('connecting', 'WebSocket connection events')
            });
            ua.on('connected', function(e){
                logAreaExample.log('connected', 'WebSocket connection events')
            });
            ua.on('disconnected', function(e){
                logAreaExample.log('disconnected', 'WebSocket connection events')
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
            ua.on('newRTCSession', function(e) {
                window.logAreaExample.log('newRTCSession', 'New incoming or outgoing call event');
                // Set a global '_Session' variable with the session for testing.
                _Session = e.session;
                GUI.new_call(e);
            });
        },

        onClickBtnCallSip: function(){
            try{
                var sip_uri = dataAreaExample.getSIP_URI_conference();
            } catch (e) {
                logAreaExample.log(e.message)
            }

            var options = {
                pcConfig: peerconnection_config,
                'eventHandlers': {
                    'progress':   function(e){
                        logAreaExample.log('progress', 'Making outbound calls')
                    },
                    'failed':     function(e){
                        logAreaExample.log('failed', 'Making outbound calls', e)
                    },
                    'confirmed':  function(e){
                        // Attach local stream to selfView
                        selfView.src = window.URL.createObjectURL(APP.session.connection.getLocalStreams()[0]);
                        logAreaExample.log('confirmed', 'Making outbound calls')
                    },
                    'addstream':  function(e) {
                        var stream = e.stream;
                        remoteView.src = window.URL.createObjectURL(stream);
                        logAreaExample.log('addstream', 'Making outbound calls')
                    },
                    'ended':      function(e){
                        logAreaExample.log('ended', 'Making outbound calls')
                    }
                },
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
        },
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnDial: function(event){
            if (!this.call) return;

            if (this.callStatus === 'incoming'){
                GUI.buttonAnswerClick(this.call)
            } else {
                GUI.buttonDialClick(this.uri)
            }
        },
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnHangup: function(event){
            if (!this.call) return;

            GUI.buttonHangupClick(this.call)
        },

        /**
         * Регистрация на события сессии
         * */
        registerCallSession: function(){

            var call = this.call;
            var self = this;

            // Set call event handlers
            call.on('progress', function(e) {
                self.callStatus = 'in-progress';
            });

            call.on('accepted', function() {
                self.callStatus = 'answered';
            });

            call.on('ended', function(e) {
                self.callStatus = 'terminated';
            });
        }
    };

    HTMLElementComponent.register('agent-bar', HTMLElementComponentAgentBar, {
        events: {
            'click #btnStart': 'onClickBtnStartSip',
            'click #btnCall': 'onClickBtnCallSip',
            'click .js-btnPhoneUp': 'onClickBtnDial',
            'click .js-btnPhoneDown': 'onClickBtnHangup'
        }
    });

})();
