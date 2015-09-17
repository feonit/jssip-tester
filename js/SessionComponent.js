/**
 * Created by Feonit on 17.09.15.
 */

window.SessionComponent = (function(){

    // dep
    var GUI = window.GUI;
    var UTILS = window.UTILS;

    var ComponentViewModel = UTILS.defineSubclass(function base(){},
        function ComponentViewModel(props){
            /** @enum {String} */
            var _TYPES = {
                TYPE_A: 1,
                TYPE_B: 2
            };

            /** @arg {_TYPES}*/
            this.callStatus = 'incoming';
            this.call = props.data.call;
            this.uri = props.data.uri;
            this.displayName = props.data.displayName;

            this.isHidden = false;
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

    var SessionComponent = VIEW.extend({
        template: 'component-controls-bar',
        events: {
            'click .js-btnPhoneUp': 'onClickBtnDial',
            'click .js-btnPhoneDown': 'onClickBtnHangup'
        },
        constructor: ComponentViewModel
    });

    return SessionComponent;
})();