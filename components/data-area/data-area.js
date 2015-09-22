/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(attributes){
        this.name = '1000';
        this.wsUri = 'wss://sip.nefrosovet.ru:443';
        this.realm = 'sip.nefrosovet.ru';
        this.displayName = 'test name';
        this.sipPassword = '';
        this.userName = '';
        this.number = '';
    }

    Сonstructor.prototype = {
        getSIP_URI_my: function (){
            var sip_uri;

            if(!this.name){
                GUI.console.error('not define "SIP URI name" ')
            }

            if(!this.realm){
                GUI.console.error('not define "SIP URI realm" ')
            }

            sip_uri = 'sip:' + this.name + '@' + this.realm;

            return sip_uri;
        },

        getSIP_URI_conference: function (){
            var sip_uri;

            if(!this.number){
                GUI.console.error('not define "SIP URI number" ')
            }

            if(!this.realm){
                GUI.console.error('not define "SIP URI realm" ')
            }

            sip_uri = 'sip:' + this.number + '@' + this.realm;

            return sip_uri;
        }
    };

    Component.register({

        // даем имя компоненту
        elementTagName: 'data-area',

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
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
                    <div class="data-b">

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
