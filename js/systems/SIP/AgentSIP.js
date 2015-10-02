var AgentSIP = (function() {

    var SessionSIP = window.SessionSIP;

    function _isString(val) { return typeof val === 'string' }

    function AgentSIP() {
        // Active session collection

        /**
         * @param {Array} array of RTCSession
         * */
        this.sessions = [];
        this.session = null;
        this.ua = null;
    }

    AgentSIP.prototype = {
        constructor: AgentSIP,

        /**
         * JsSIP.UA newRTCSession event listener
         * @public
         * @this {AgentSIP}
         * @param {Object} e — event
         * */
        new_call : function(e) {
            if ( ! this instanceof AgentSIP) throw TypeError('Illegal invocation');

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

            var session = this._createSession(aor);

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
                session = this._createSession(display_name, uri.toAor());
                session.call = call;
            }

            this.setCallEventHandlers(e);
        },

        /**
         * Возвращает сохраненную сессию по идентификатору
         * @private
         * @param {String} uri AoR
         * @return {null || session}
         * */
        _getSession : function(uri) {
            var idx,
                session = null;

            for(idx in this.sessions) {
                if (this.sessions[idx].uri === uri) {
                    session = this.sessions[idx];
                    break;
                }
            }

            return session;
        },

        /**
         * @private
         * @param {String} display_name
         * @param {String} uri AoR
         * */
        _createSession: function(display_name, uri){
            // Add a session object to the session collection
            var session;

            session = this._getSession(uri);

            if (!session) {
                session = new SessionSIP(display_name, uri);
                this.sessions.push(session);
            }
            return session;
        },

        removeSession: function(uri, force) {
            // remove a session object from the session collection
            console.log('Tryit: removeSession');
            var idx, session;

            for(idx in this.sessions) {
                session = this.sessions[idx];
                if (session.uri === uri) {

                    // living chat session
                    if (!force && session.chat.length) {
                        session.call = null;
                    } else {
                        //session.compositionIndicator.close();
                        this.sessions.splice(idx,1);
                    }
                }
            }
        },

        /**
         * @public
         * @param {JsSIP.RTCSession} call
         * */
        jssipAnswerCall: function(call) {
            //if ( ! this instanceof JsSIP.RTCSession) throw TypeError('Illegal invocation');

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

        /**
         * @public
         * @param {JsSIP.RTCSession} call
         * */
        jssipTerminateCall: function(call) {
            //if ( ! this instanceof JsSIP.RTCSession) throw TypeError('Illegal invocation');
            if (call){
                call.terminate();
            }
        },

        /**
         * @param {String} target — Number of opponent
         * */
        jssipCall : function(target) {
            console.log('Tryit: buttonDialClick');

            this.ua.call(target, {
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

        /**
         * @this {AgentSIP}
         * */
        setCallEventHandlers : function(e){
            var request = e.request,
                call = e.session;

            // check custom X-Can-Renegotiate header field
            if (call.direction === 'incoming') {
                call.data.remoteCanRenegotiateRTC = call.request.getHeader('X-Can-Renegotiate') !== 'false';

                this.onNewRTCSessionIncoming();

                // i rendered always 1 session

                sessionComponent.setState({
                    data: this.sessions[0]
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
        },

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

            this.ua = new JsSIP.UA(configuration);

            this.ua.start();

            var that = this;
            this.ua.on('connecting', function(e){
                that.onConnecting();
            });
            this.ua.on('connected', function(e){
                that.onConnected();
            });
            this.ua.on('disconnected', function(e){
                that.onDisconnected();
            });
            this.ua.on('registered', function(e){
                that.onRegistered();
            });
            this.ua.on('unregistered', function(e){
                that.onUnregistered();
            });
            this.ua.on('registrationFailed', function(e){
                that.onRegistrationFailed();
            });
            this.ua.on('newRTCSession', function(e) {
                // Set a global '_Session' variable with the session for testing.
                _Session = e.session;
                that.new_call(e);
                that.onNewRTCSession();
            });
        },
        /** @abstract */
        onConnecting: function(){},
        /** @abstract */
        onConnected: function(){},
        /** @abstract */
        onDisconnected: function(){},
        /** @abstract */
        onRegistered: function(){},
        /** @abstract */
        onUnregistered: function(){},
        /** @abstract */
        onRegistrationFailed: function(){},
        /** @abstract */
        onNewRTCSession: function(){},
        /** @abstract */
        onNewRTCSessionIncoming: function(){}
    };

    return AgentSIP;
}());