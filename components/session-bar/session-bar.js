/**
 * Created by Feonit on 18.09.15.
 */

var SessionBar = window.UTILS.defineSubclass(function base(){},
    function SessionBar(props){

        this.callStatus = 'incoming';
        this.call = null;
        this.uri = 'not uri is here';
        this.displayName = 'not display name is here';


        // todo установку параметров с одним рендером вместо нескольких
        this.setState = function(props){
            this.call = props.data.call;
            this.uri = props.data.uri;
            this.displayName = props.data.displayName;
        };

        if (props){
            this.setState(props)
        }

        this.isHidden = false;
    },
    {
        constructor: SessionBar,
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnDial: function(event){
            if (!this.call) return;

            if (this.callStatus === 'incoming'){
                GUI.buttonAnswerClick(this.call)
            } else {
                GUI.buttonDialClick(this.uri)
            }
        },
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnHangup: function(event){
            if (!this.call) return;

            GUI.buttonHangupClick(this.call)
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
    }
);


Component.register({

    // даем имя компоненту
    elementTagName: 'session-bar',

    // определяет внутреннее состояние
    constructor: SessionBar,

    // обработчики внутренного состояния
    events: {
        'click .js-btnPhoneUp': 'onClickBtnDial',
        'click .js-btnPhoneDown': 'onClickBtnHangup'
    }
});
