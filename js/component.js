/**
 * Created by Feonit on 17.09.15.
 */

window.Component = (function(){

    var Component = {};

    Component.register = function(attributes){
        if(!attributes.constructor) throw 'need constructor';
        if(!attributes.ownerDocument) throw 'need ownerDocument';
        if(!attributes.elementTagName) throw 'need elementTagName';

        var template = attributes.ownerDocument.getElementsByTagName('template')[0];
        var Proto = Object.create(HTMLElement.prototype);

        Proto.createdCallback = function() {
            /** @type {HTMLElement}*/
            var element = this;
            var id = this.id;

            window[id] = new SurrogateComponent(null, element);
        };

        document.registerElement(attributes.elementTagName, {
            prototype: Proto
        });

        function SurrogateComponent(params, element){
            this.element = element;
            this.params = params;
            this._afterChange = function(){
                var shadow = element.createShadowRoot();
                var clone = template.content.cloneNode(true);

                //shadow.applyAuthorStyles = true;
                shadow.appendChild(clone);

                if (attributes.events){
                    _bindEvents(this, attributes.events, element)
                }
            };

            // установить свойства конструктора
            attributes.constructor.apply(this, arguments);

            // переписать все свойства конструктора на сеттеры и гетеры
            _setProperties({
                instance: this,
                props: _clone(this),
                afterChange: this._afterChange.bind(this)
            });

            // отрисовать
            this._afterChange(arguments);
        }

        SurrogateComponent.prototype = attributes.constructor.prototype;// todo mix proto

        return SurrogateComponent;
    };

    /**
     * @param {Object} options
     * @param {Object} options.instance
     * @param {Object} options.props
     * */
    function _setProperties(options){
        var instance = options.instance,
            properties = options.props || {},
            key,
            typeOf;

        if (!instance){
            throw 'not found a target'
        }

        // todo after check props is opject

        for (key in properties){
            if (!properties.hasOwnProperty(key)) continue;

            (function(key){
                typeOf = typeof properties[key];

                // доделать подобъекты
                if (typeOf !== 'object'){
                    _defineBehaviorProperty(key, options);
                } else {
                    // try if this is a object or function
                    //setProperties(this.)
                    throw 'value mast be a simple type'
                }
            }(key));
        }
    }
    /**
     * @param {Object} source
     * */
    function _clone(source){
        var clone = {}, key, typeOf;

        for (key in source){
            if (!source.hasOwnProperty(key)) continue;

            typeOf = typeof source[key];

            // todo sub-objects
            if (typeOf !== 'object'){
                clone[key] = source[key];
            }
        }
        return clone;
    }
    /**
     * @param {String} key — Name of property
     * @param {Object} options
     * @param {Object} options.instance
     * @param {Object} options.props
     * @param {function} options.afterChange
     * */
    function _defineBehaviorProperty(key, options){
        var instance = options.instance;
        var props = options.props;
        var afterChange = options.afterChange;

        Object.defineProperty(instance, key, {
            get: function() {
                return props[key];
            },
            set: function(value) {
                props[key] = value;
                if (afterChange){
                    afterChange.call(this);
                }
            }
        });
    }
    /**
     * @param {Object} instance
     * @param {Object} events
     * @param {Object} wrapper
     * */
    function _bindEvents(instance, events, wrapper){
        for (var key in events){
            var split = key.split(' ');

            if(split.length !== 2){
                throw 'must be 2'
            }
            var eventName = split[0];
            var eventSelector = split[1];
            var handler = instance[events[key]];

            var elem = wrapper.shadowRoot.querySelector(eventSelector);
            elem.addEventListener(eventName, handler.bind(instance), false);
        }
    }

    return Component;

}());