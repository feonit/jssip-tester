/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    // dep
    // var dataAreaExample = document.getElementById('dataAreaExample');
    // var logAreaExample =document.getElementById('logAreaExample');
    var agentSIP = window.agentSIP;
    var audioPlayer = window.audioPlayer;

    function HTMLElementComponentAgentBar(){
        this.sessionSIP = null;
        this.uri = 'not uri is here';
        this.displayName = 'not display name is here';
        this.statusSession = '...';
        this.isStartedAgent = false;
    }

    HTMLElementComponentAgentBar.prototype = {
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnStartSip: function(event){
            logAreaExample.log('click', 'Starting the User Agent');

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
                }
            );

            var that = this;

            agentSIP.onConnecting = (function(){
                logAreaExample.log('connecting', 'WebSocket connection events')
            });
            agentSIP.onConnected = (function(){
                logAreaExample.log('connected', 'WebSocket connection events')
            });
            agentSIP.onDisconnected = (function(){
                logAreaExample.log('disconnected', 'WebSocket connection events')
            });
            agentSIP.onRegistered = (function(){
                logAreaExample.log('registered', 'SIP registration events')
            });
            agentSIP.onUnregistered = (function(){
                logAreaExample.log('unregistered', 'SIP registration events')
            });
            agentSIP.onRegistrationFailed = (function(){
                logAreaExample.log('registrationFailed', 'SIP registration events')
            });
            agentSIP.onNewRTCSession = (function(sessionSIP) {
                that.sessionSIP = sessionSIP;
                that.statusSession = that.sessionSIP.session.direction;
                that.displayName = that.sessionSIP.displayName;
                logAreaExample.log('newRTCSession', 'New incoming or outgoing session event');
            });
            agentSIP.onNewRTCSessionIncoming = (function() {
                logAreaExample.log('onNewRTCSessionIncoming', 'New incoming or outgoing session event');
                audioPlayer.playSound("sounds/incoming-call2.ogg");
            });
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnCallSip: function(event){
            logAreaExample.log('click', 'Starting the Session');

            try{
                var sip_uri = dataAreaExample.getSIP_URI_conference();
            } catch (e) {
                logAreaExample.log(e.message)
            }

            var sessionSIP = agentSIP.jssipCall(sip_uri);

            this.sessionSIP = sessionSIP;

            var that = this;

            sessionSIP.onProgress = function (){
                that.statusSession = 'in-progress';
                logAreaExample.log('progress', 'Making outbound sessions')
            };

            sessionSIP.onFailed = function(){
                that.statusSession = 'failed';
                logAreaExample.log('failed', 'Making outbound sessions')
            };

            sessionSIP.onConfirmed = function(){
                logAreaExample.log('confirmed', 'Making outbound sessions')
            };

            sessionSIP.onAddstream = function(){
                logAreaExample.log('addstream', 'Making outbound sessions')
            };

            sessionSIP.onEnded = function(){
                that.statusSession = 'terminated';
                logAreaExample.log('ended', 'Making outbound sessions')
            };

            sessionSIP.onAccepted = function(){
                that.statusSession = 'answered';
            };
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnDial: function(event){
            if (!this.sessionSIP) return;

            if (this.statusSession === 'incoming'){
                agentSIP.jssipAnswerCall(this.sessionSIP.session)
            } else {
                agentSIP.jssipCall(this.uri)
            }_
        },
        /**
         * @this {HTMLElementComponentAgentBar}
         * @param {MouseEvent} event
         * */
        onClickBtnHangup: function(event){
            if (!this.sessionSIP) return;

            selfView.src = '';
            remoteView.src = '';
            agentSIP.jssipTerminateCall(this.sessionSIP.session)
        }
    };

    HTMLElementComponent.register('agent-bar', HTMLElementComponentAgentBar, {
        events: {
            'click #btnStart': 'onClickBtnStartSip',
            'click #btnCall': 'onClickBtnCallSip',
            'click #js-btnPhoneUp': 'onClickBtnDial',
            'click #js-btnPhoneDown': 'onClickBtnHangup'
        }
    });
})();
