var SessionSIP = (function() {

    function SessionSIP (display_name, uri, session) {
        this.uri = uri;
        this.displayName = display_name;
        this.session = session || null;

        if (this.session) {
            this.bindEvendCallHandlers();
        }

        /** @abstract */
        this.onProgress = function(){},
        /** @abstract */
        this.onAccepted = function(){},
        /** @abstract */
        this.onEnded = function(){},
        /** @abstract */
        this.onFailed = function(){},
        /** @abstract */
        this.onConfirmed = function(){},
        /** @abstract */
        this.onAddstream = function(){}
    }

    SessionSIP.prototype = {
        bindEvendCallHandlers: function(){
            var that = this;

            this.session.on('progress', function(e){
                that.onProgress();
            });

            this.session.on('failed', function(e){
                alert('failed');
                that.onFailed();
            });

            this.session.on('confirmed', function(e){
                selfView.src = window.URL.createObjectURL(that.session.connection.getLocalStreams()[0]);
                that.onConfirmed();
            });

            this.session.on('addstream', function(e){
                var remoteStream = e.stream;
                remoteView.src = window.URL.createObjectURL(remoteStream);
                that.onAddstream();
            });

            this.session.on('ended', function(e){
                that.onEnded();
            });

            this.session.on('connecting', function(e){
                if (that.session.connection.getLocalStreams().length > 0) {
                    window.localStream = that.session.connection.getLocalStreams()[0];
                }
            });

            this.session.on('accepted', function(e){
                //Attach the streams to the views if it exists.
                if (that.session.connection.getLocalStreams().length > 0) {
                    localStream = that.session.connection.getLocalStreams()[0];

                    selfView.src = window.URL.createObjectURL(localStream);

                    selfView.volume = 0;

                    // TMP
                    window.localStream = localStream;
                }

                if (e.originator === 'remote') {
                    that.session.data.remoteCanRenegotiateRTC = e.response.getHeader('X-Can-Renegotiate') !== 'false';
                }
                that.onAccepted();
            });
        }
    };

    return SessionSIP;

}());