var SessionSIP = (function() {

    function SessionSIP (display_name, uri, call) {
        this.uri = uri;
        this.displayName = display_name;
        this.call = call || null;

        if (this.call) {
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

            this.call.on('progress', function(e){
                that.onProgress();
            });

            this.call.on('failed', function(e){
                alert('failed');
                that.onFailed();
            });

            this.call.on('confirmed', function(e){
                selfView.src = window.URL.createObjectURL(that.call.connection.getLocalStreams()[0]);
                that.onConfirmed();
            });

            this.call.on('addstream', function(e){
                var remoteStream = e.stream;
                remoteView.src = window.URL.createObjectURL(remoteStream);
                that.onAddstream();
            });

            this.call.on('ended', function(e){
                that.onEnded();
            });

            this.call.on('connecting', function(e){
                if (that.call.connection.getLocalStreams().length > 0) {
                    window.localStream = that.call.connection.getLocalStreams()[0];
                }
            });

            this.call.on('accepted', function(e){
                //Attach the streams to the views if it exists.
                if (that.call.connection.getLocalStreams().length > 0) {
                    localStream = that.call.connection.getLocalStreams()[0];

                    selfView.src = window.URL.createObjectURL(localStream);

                    selfView.volume = 0;

                    // TMP
                    window.localStream = localStream;
                }

                if (e.originator === 'remote') {
                    that.call.data.remoteCanRenegotiateRTC = e.response.getHeader('X-Can-Renegotiate') !== 'false';
                }
                that.onAccepted();
            });
        }
    };

    return SessionSIP;

}());