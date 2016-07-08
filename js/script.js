!function(){
    var AudioPlayer = window.AudioPlayer;
    var AgentSIP = window.AgentSIP;
    var StorageManager = window.StorageManager;
    var JsSIP = window.JsSIP;

    var _export = window;

    var audioPlayer = new AudioPlayer();
    var agentSIP = new AgentSIP();
    var storageManager = new StorageManager('dataAreaExample');

    document.addEventListener("DOMContentLoaded", ready);

    function ready(){
        var dataAreaExample = window.dataAreaExample;

        JsSIP.debug.enable('JsSIP:*');

        setTimeout(function(){
            var data = storageManager.getProperties();

            if (data){
                dataAreaExample.setState(data);
            }

            dataAreaExample.on('update', function(changes){
                console.log();

                var save = {};

                save[changes.name] = changes.newValue;
                storageManager.setProperties(save);
            })

        }, 300)
    }

    _export.audioPlayer = audioPlayer;
    _export.agentSIP = agentSIP;
    _export.audioPlayer = audioPlayer;
}();