/**
 * Created by Feonit on 18.09.15.
 */

(function(){
    function HTMLElementComponentDataArea(){
        this.name = '1000';
        this.wsUri = 'wss://sip.nefrosovet.ru:443';
        this.realm = 'sip.nefrosovet.ru';
        this.displayName = 'test name';
        this.sipPassword = '';
        this.userName = '';
        this.number = '';
    }

    HTMLElementComponentDataArea.prototype = {
        /**
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
        },
        template: function(){
            with (this){

                var string = `
                    <style>
                        .b-data-area{
                            padding: 10px;
                            border: 1px dashed gray;
                            margin: 20px;
                            width: 30%;
                            min-width: 250px;
                            max-width: 500px;
                        }
                        .form-group{
                            position: relative;
                            padding: 5px;
                        }
                        .form-control{
                            position: absolute;
                            right: 0;
                        }
                    </style>
                    <div class="b-data-area">

                        <div class="form-group">
                            <label for="fieldName">Name</label>
                            <input type="text" class="form-control" id="name" value="${name}">
                        </div>

                        <div class="form-group">
                            <label for="fieldWS_URI">WS URI</label>
                            <input type="text" class="form-control" id="wsUri" value="${wsUri}">
                        </div>

                        <div class="form-group">
                            <label for="fieldSIP_URI_realm">Realm</label>
                            <input type="text" class="form-control" id="realm" placeholder="" value="${realm}">
                        </div>

                        <div class="form-group">
                            <label for="field_display_name">Display name</label>
                            <input type="text" class="form-control" id="displayName" placeholder="" value="${displayName}">
                        </div>

                        <div class="form-group">
                            <label for="fieldSIP_password">SIP password</label>
                            <input type="text" class="form-control" id="sipPassword" value="${sipPassword}">
                        </div>

                        <div class="form-group">
                            <label for="fieldSIP_URI_name">Username</label>
                            <input type="text" class="form-control" id="userName" placeholder="" value="${userName}">
                        </div>

                        <div class="form-group">
                            <label for="fieldNumber">Number</label>
                            <input type="text" class="form-control" id="number" value="${number}">
                        </div>

                    </div>
                `;
            }
            return string;
        }
    });
})();
