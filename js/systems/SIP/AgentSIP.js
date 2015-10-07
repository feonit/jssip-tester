var AgentSIP = (function() {

    var SessionSIP = window.SessionSIP;

    function _isString(val) { return typeof val === 'string' }

    /**
     * @constructor AgentSIP
     * */
    function AgentSIP() {

        this._ua = null;
        this.statusConnection = '';
        this.statusRegistration = '';

        /** @abstract */
        this.onConnecting = function(){},
        /** @abstract */
        this.onConnected = function(){},
        /** @abstract */
        this.onDisconnected = function(){},
        /** @abstract */
        this.onRegistered = function(){},
        /** @abstract */
        this.onUnregistered = function(){},
        /** @abstract */
        this.onRegistrationFailed = function(){},
        /** @abstract */
        this.onNewRTCSession = function(){},
        /** @abstract */
        this.onNewRTCSessionIncoming = function(){}
    }

    AgentSIP.prototype = {
        constructor: AgentSIP,
        /**
         * @this {AgentSIP}
         * @param {String} uri
         * @param {String} password
         * @param {String} ws_servers
         * @param {Object} options
         * */
        jssipStart: function(uri, password, ws_servers, options){
            typeof options === 'object' || (options = {});
            if (arguments.length < 3){
                throw 'Not enough arguments';
            }

            if (!_isString(uri) || !_isString(password) || !_isString(ws_servers)){
                throw TypeError('Not valid arguments');
            }

            // default configuration
            var configuration = {
                authorization_user: "",
                connection_recovery_max_interval: 30,
                connection_recovery_min_interval: 2,
                display_name: options.displayName,
                hack_ip_in_contact: false,
                hack_via_tcp: false,
                hack_via_ws: false,
                log: { level: 'debug' },
                no_answer_timeout: 60,
                password: password,
                register: true,
                register_expires: 600,
                registrar_server: "",
                session_timers: true,
                uri: uri,
                use_preloaded_route: false,
                ws_servers: ws_servers
            };

            // set options
            for ( var key in options) {
                if ( options.hasOwnProperty(key) ){
                    if (configuration.hasOwnProperty(key))
                        configuration[key] = options[key];
                    else
                        throw 'Another argument in options';
                }
            }

            this._ua = new JsSIP.UA(configuration);

            this._ua.start();

            var that = this;
            this._ua.on('connecting', function(e){
                that.statusConnection = 'connecting';
                that.onConnecting();
            });
            this._ua.on('connected', function(e){
                that.statusConnection = 'connected';
                that.onConnected();
            });
            this._ua.on('disconnected', function(e){
                that.statusConnection = 'disconnected';
                that.onDisconnected();
            });
            this._ua.on('registered', function(e){
                that.statusRegistration = 'registered';
                that.onRegistered();
            });
            this._ua.on('unregistered', function(e){
                that.statusRegistration = 'unregistered';
                that.onUnregistered();
            });
            this._ua.on('registrationFailed', function(e){
                that.statusRegistration = 'registrationFailed';
                that.onRegistrationFailed();
            });
            this._ua.on('newRTCSession', function(e) {
                that.constructor.prototype.onNewRTCSession.call(that, e);
                var displayName = e.session.remote_identity.display_name || e.session.remote_identity.user;
                that.onNewRTCSession( new SessionSIP(displayName, null, e.session) );
            });
        },
        /**
         * @param {String} target — Number of opponent
         * @return {SessionSIP}
         * */
        jssipCall : function(target) {
            this._ua.call(target, {
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

            var sessionSIP = new SessionSIP('display_name', target, agentSIP.session);

            return sessionSIP;
        },
        /**
         * @public
         * @param {JsSIP.RTCSession} session
         * */
        jssipAnswerCall: function(session) {
            session.answer({
                pcConfig: peerconnection_config,
                mediaConstraints: {audio: true, video: true},
                rtcOfferConstraints: {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: 1
                }
            });
        },

        /**
         * @public
         * @param {JsSIP.RTCSession} session
         * */
        jssipTerminateCall: function(session) {
            session.terminate();
        },

        /**
         * JsSIP.UA newRTCSession event listener
         * @public
         * @this {AgentSIP}
         * @param {Object} e — event
         * */
        onNewRTCSession : function(e) {
            if ( ! this instanceof AgentSIP) throw TypeError('Illegal invocation');

            /** @type {JsSIP.RTCSession} */
            var session = e.session;

            /** @type {JsSIP.NameAddrHeader} */
            var addr = session.remote_identity;

            /** @type {JsSIP.URI} */
            var uri = addr.uri;

            /** @type {String} */
            var display_name = session.remote_identity.display_name || uri.user;

            /** Returns a String representing the AoR of the URI
             * @type {String}
             * */
            var aor = uri.toAor();

            /** @type {SessionSIP}*/

            if (agentBarExample.sessionSIP && !agentBarExample.sessionSIP.session.isEnded()){
                agentBarExample.sessionSIP.session.terminate();
            }

            //var sessionSIP = new SessionSIP(display_name, aor, session);

            // check custom X-Can-Renegotiate header field
            if (session.direction === 'incoming') {
                session.data.remoteCanRenegotiateRTC = session.request.getHeader('X-Can-Renegotiate') !== 'false';

                this.onNewRTCSessionIncoming();
            }

            //agentBarExample.setState({
            //    sessionSIP: sessionSIP
            //});
        },
    };

    return AgentSIP;
}());