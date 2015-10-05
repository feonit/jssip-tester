var AudioPlayer = (function(document){
    /**
     * @constructor SoundSystem
     * */
    function AudioPlayer (){
        Object.defineProperties(this, {
            AudioPlayer: {
                value: document.createElement("audio")
            }
        });
    }
    AudioPlayer.prototype = {
        constructor: AudioPlayer,
        /**
         * @public
         * @param {String} soundFileSrc — url for sound file
         * @param {Object} options — Options for HTMLAudioElement
         * */
        playSound : function (soundFileSrc, options) {
            if (typeof soundFileSrc !== 'string') throw TypeError('src parameter is not valid');

            options || (options = {
                volume: 1
            });

            this.AudioPlayer.setAttribute("src", soundFileSrc);
            this.AudioPlayer.volume = options.volume;
            this.AudioPlayer.play();
        }
    };
    return AudioPlayer;
}(document));