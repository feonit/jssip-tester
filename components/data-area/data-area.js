/**
 * Created by Feonit on 18.09.15.
 */

(function(){

    function Сonstructor(){
        this.some = 'some';
    }

    Component.register({

        // даем имя компоненту
        elementTagName: 'data-area',

        // контекст его определения
        ownerDocument: document.currentScript.ownerDocument,

        // определяет внутреннее состояние
        constructor: Сonstructor,

        // обработчики внутренного состояния
        events: {}
    });



    //// todo
    //// inputs
    //GUI.fieldName = dg('fieldName');
    //GUI.fieldWS_URI = dg('fieldWS_URI');
    //GUI.fieldSIP_URI_name = dg('fieldSIP_URI_name');
    //GUI.fieldSIP_URI_realm = dg('fieldSIP_URI_realm');
    //GUI.fieldSIP_password = dg('fieldSIP_password');
    //GUI.fieldNumber = dg('fieldNumber');
    //GUI.field_display_name = dg('field_display_name');


    //function getSIP_URI_my(){
    //    var sip_uri;
    //
    //    if(!GUI.fieldSIP_URI_name.value){
    //        GUI.console.error('not define "SIP URI name" ')
    //    }
    //
    //    if(!GUI.fieldSIP_URI_realm.value){
    //        GUI.console.error('not define "SIP URI realm" ')
    //    }
    //
    //    sip_uri = 'sip:' + GUI.fieldSIP_URI_name.value + '@' + GUI.fieldSIP_URI_realm.value;
    //
    //    return sip_uri;
    //}
    //
    //function getSIP_URI_conference(){
    //    var sip_uri;
    //
    //    if(!GUI.fieldNumber.value){
    //        GUI.console.error('not define "SIP URI number" ')
    //    }
    //
    //    if(!GUI.fieldSIP_URI_realm.value){
    //        GUI.console.error('not define "SIP URI realm" ')
    //    }
    //
    //    sip_uri = 'sip:' + GUI.fieldNumber.value + '@' + GUI.fieldSIP_URI_realm.value;
    //
    //    return sip_uri;
    //}


    //if (localStorage){
    //    var store = {
    //        namespace: 'my_test',
    //
    //        setData: function(obj){
    //            localStorage.setItem(this.namespace, JSON.stringify(obj));
    //        },
    //        getData: function(){
    //            try{
    //                return JSON.parse(localStorage.getItem(this.namespace));
    //            } catch (e){
    //                localStorage.clear();
    //                throw 'json was invalid'
    //            }
    //        }
    //    };
    //
    //    if(!store.getData()){
    //        store.setData({});
    //    }
    //
    //    document.addEventListener('change', function(event){
    //        var target = event.target;
    //        var id = target.id;
    //        if (id){
    //            var data = store.getData();
    //            data[id] = target.value;
    //            store.setData(data);
    //        }
    //    });
    //
    //    var data = store.getData();
    //    var key;
    //
    //    if(data){
    //        for(key in data) {
    //            var node = document.getElementById(key);
    //            node.value = data[key];
    //        }
    //    }
    //}
})();
