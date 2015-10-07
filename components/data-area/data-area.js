/**
 * Created by Feonit on 18.09.15.
 */

(function(){
    function HTMLElementComponentDataArea(){
        this.name = '';
        this.wsUri = '';
        this.realm = '';
        this.displayName = '';
        this.sipPassword = '';
        this.userName = '';
        this.number = '';
    }

    HTMLElementComponentDataArea.prototype = {
        /**
         * API
         * @public
         * @throws {RangeError}
         * */
        getSIP_URI_my: function (){
            if(!this.name){
                throw RangeError('"name" is empty');
            }
            if(!this.realm){
                throw RangeError('"realm" is empty');
            }
            return 'sip:' + this.name + '@' + this.realm;
        },
        /**
         * API
         * @public
         * @throws {RangeError}
         * */
        getSIP_URI_conference: function (){
            if(!this.number){
                throw RangeError('"number" is empty');
            }
            if(!this.realm){
                throw RangeError('"realm" is empty');
            }
            return 'sip:' + this.number + '@' + this.realm;
        }
    };

    HTMLElementComponent.register('data-area', HTMLElementComponentDataArea, {
        events: {
            'change #name' : function(event){
                this.name = event.currentTarget.value;
            },
            'change #wsUri' : function(event){
                this.wsUri = event.currentTarget.value;
            },
            'change #realm' : function(event){
                this.realm = event.currentTarget.value;
            },
            'change #displayName' : function(event){
                this.displayName = event.currentTarget.value;
            },
            'change #sipPassword' : function(event){
                this.sipPassword = event.currentTarget.value;
            },
            'change #userName' : function(event){
                this.userName = event.currentTarget.value;
            },
            'change #number' : function(event){
                this.number = event.currentTarget.value;
            }
        }
    });
})();
