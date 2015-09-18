/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(){
        this.some = 'some';
    }

    Component.register({

        // даем имя компоненту
        elementTagName: 'video-area',

        // контекст его определения
        ownerDocument: document.currentScript.ownerDocument,

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
        events: {}
    });

})();
