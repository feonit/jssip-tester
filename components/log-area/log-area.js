/**
 * Created by Feonit on 18.09.15.
 */

(function(){
    function HTMLElementComponentLogArea(){
        this.textLog = '...';
    }

    HTMLElementComponentLogArea.prototype = {
        /**
         * @param {String} eventName
         * @param {String} groupName
         * @param {String} error
         * */
        log : function _fn(eventName, groupName, error){
            _fn.count || (_fn.count = 0);
            if (typeof eventName !== 'string') throw Error();
            if (groupName && (typeof groupName !== 'string')) throw Error();

            var arg = arguments;

            if (arg.length == 1){
                this.textLog += '\n' + 'event: ' + eventName;
            }
            if (arg.length == 2){
                this.textLog += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']';

            }
            if (arg.length == 3){
                this.textLog += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']' + '\n\t\t (оригинальную ошибку смотри в консоли)';
                console.error(error);
            }
        },
        /**
         * @param {String} text
         * */
        error : function(text){
            throw Error(text);
        }
    };

    HTMLElementComponent.register('log-area', HTMLElementComponentLogArea);
})();
