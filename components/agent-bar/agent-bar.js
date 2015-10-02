/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    // dep
    var dataAreaExample = window.dataAreaExample;
    var logAreaExample = window.logAreaExample;
    var agentSIP = window.agentSIP;
    var audioPlayer = window.audioPlayer;

    function HTMLElementComponentAgentBar(){
        this.callStatus = 'incoming';
        this.call = null;
        this.uri = 'not uri is here';
        this.displayName = 'not display name is here';
    }

    HTMLElementComponentAgentBar.prototype = {
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnStartSip: function(event){
            if(!dataAreaExample.wsUri){
                logAreaExample.error('not define "WS URI" ')
            }

            if(!dataAreaExample.sipPassword){
                logAreaExample.error('not define "PASSWORD" ')
            }

            agentSIP.jssipStart(
                dataAreaExample.getSIP_URI_my(),
                dataAreaExample.sipPassword,
                dataAreaExample.wsUri, {
                    display_name: dataAreaExample.displayName
                });


            agentSIP.onConnecting = (function(e){
                logAreaExample.log('connecting', 'WebSocket connection events')
            });
            agentSIP.onConnected = (function(e){
                logAreaExample.log('connected', 'WebSocket connection events')
            });
            agentSIP.onDisconnected = (function(e){
                logAreaExample.log('disconnected', 'WebSocket connection events')
            });
            agentSIP.onRegistered = (function(e){
                logAreaExample.log('registered', 'SIP registration events')
            });
            agentSIP.onUnregistered = (function(e){
                logAreaExample.log('unregistered', 'SIP registration events')
            });
            agentSIP.onRegistrationFailed = (function(e){
                logAreaExample.log('registrationFailed', 'SIP registration events')
            });
            agentSIP.onNewRTCSession = (function(e) {
                logAreaExample.log('newRTCSession', 'New incoming or outgoing call event');
            });
            agentSIP.onNewRTCSessionIncoming = (function(e) {
                logAreaExample.log('onNewRTCSessionIncoming', 'New incoming or outgoing call event');
                audioPlayer.playSound("sounds/incoming-call2.ogg");
            });
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnCallSip: function(event){
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
                        selfView.src = window.URL.createObjectURL(agentSIP.session.connection.getLocalStreams()[0]);
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

            agentSIP.session = agentSIP.ua.call(sip_uri, options);

            logAreaExample.log('click', 'Starting the User Agent')
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnDial: function(event){
            if (!this.call) return;

            if (this.callStatus === 'incoming'){
                agentSIP.jssipAnswerCall(this.call)
            } else {
                agentSIP.jssipCall(this.uri)
            }
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnHangup: function(event){
            if (!this.call) return;

            agentSIP.jssipTerminateCall(this.call)
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
