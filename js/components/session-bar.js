/**
 * Created by Feonit on 18.09.15.
 */

var ComponentViewModel = window.UTILS.defineSubclass(function base(){},
    function ComponentViewModel(props){
        /** @enum {String} */
        var _TYPES = {
            TYPE_A: 1,
            TYPE_B: 2
        };

        /** @arg {_TYPES}*/
        this.callStatus = 'incoming';
        this.call = null;
        this.uri = 'not uri is here';
        this.displayName = 'not display name is here';

        if (props){
            this.setState(props)
        }

        this.isHidden = false;

        // todo установку параметров с одним рендером вместо нескольких
        this.setState = function(props){
            this.call = props.data.call;
            this.uri = props.data.uri;
            this.displayName = props.data.displayName;
        }
    },
    {
        constructor: ComponentViewModel,
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnDial: function(event){
            if (!this.call) return;

            if (this.callStatus === 'incoming'){
                window.GUI.buttonAnswerClick(this.call)
            } else {
                window.GUI.buttonDialClick(this.uri)
            }
        },
        /**
         * @this {SessionComponent}
         * @param {MouseEvent} event
         * */
        onClickBtnHangup: function(event){
            if (!this.call) return;

            window.GUI.buttonHangupClick(this.call)
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




// todo добавить прототип window.SessionComponent
// (1) получить шаблон
var localDocument = document.currentScript.ownerDocument;
var tmpl = localDocument.getElementById('session-bar-template');

// (2) создать элемент
var SessionBarProto = Object.create(HTMLElement.prototype);


SessionBarProto.createdCallback = function() {
    /** @type {HTMLElement}*/
    var savedElement = this;

    var SessionComponent = Component.extend({
        tmpl: tmpl,
        rootElement: savedElement,
        events: {
            'click .js-btnPhoneUp': 'onClickBtnDial',
            'click .js-btnPhoneDown': 'onClickBtnHangup'
        },
        constructor: ComponentViewModel
    });

    window.sessionComponent = new SessionComponent();
};

// (3) зарегистрировать в DOM
document.registerElement('session-bar', {
    prototype: SessionBarProto
});