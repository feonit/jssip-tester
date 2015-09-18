/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(props, instance){
        this.some = 'some';
        this.el = instance;


        var isCorrectVersion;

        if ( JsSIP && (isCorrectVersion = JsSIP.version === '0.7.4') )
            this.log(JsSIP.name + ' ' + JsSIP.version);
        else
            this.log.error('Need JsSIP 0.7.4');
    }

    Сonstructor.prototype.log = function fn(eventName, groupName, error){
        fn.count || (fn.count = 0);
        if (typeof eventName !== 'string') throw Error();
        if (groupName && (typeof groupName !== 'string')) throw Error();

        var arg = arguments;

        if (arg.length == 1){
            this.el.innerHTML += '\n' + 'event: ' + eventName;
        }
        if (arg.length == 2){
            this.el.innerHTML += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']';

        }
        if (arg.length == 3){
            this.el.innerHTML += '\n' + 'event: ' +  eventName  + '\t[' + groupName + ']' + '\n\t\t (оригинальную ошибку смотри в консоли)';
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

        // контекст его определения
        ownerDocument: document.currentScript.ownerDocument,

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
        events: {}
    });

})();
