/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(props){
        this.textLog = '...';
    }

    Сonstructor.prototype.log = function fn(eventName, groupName, error){
        fn.count || (fn.count = 0);
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
    };

    Сonstructor.prototype.error = function(text){
        alert(text);
        throw Error(text);
    };

    Component.register({

        // даем имя компоненту
        elementTagName: 'log-area',

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
        events: {},

        template: function(){
            with(this){
                return `
                    <label for="textarea">Log:</label>
                    <br>
                    <textarea id="textarea" class="form-control" rows="15" disabled>${textLog}</textarea>
                `
            }
        }
    });

})();
