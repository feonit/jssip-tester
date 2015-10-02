var SessionSIP = (function() {

    function SessionSIP (display_name, uri) {
        this.uri = uri;
        this.displayName = display_name;
        this.call = null;
    }

    SessionSIP.prototype = {
        /** @abstract */
        onProgress: function(){},
        /** @abstract */
        onAccepted: function(){},
        /** @abstract */
        onEnded: function(){}
    };

    return SessionSIP;

}());