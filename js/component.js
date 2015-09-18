/**
 * Created by Feonit on 17.09.15.
 */

Component = {};

Component.extend = function(attributes){
    if(!attributes.rootElement) throw 'need rootElement';
    if(!attributes.constructor) throw 'need constructor';
    if(!attributes.tmpl) throw 'need tmpl';

    function afterChange(){
        console.log('render');

        var root = attributes.rootElement.createShadowRoot();
        var clone = attributes.tmpl.content.cloneNode(true);

        root.appendChild(clone);

        if (attributes.events){
            Component._bindEvents(this, attributes.events, attributes.rootElement)
        }
    }

    function SurrogateComponent(){
        attributes.constructor.apply(this, arguments);
        // переписать все свойства на сеттеры и гетеры
        Component._setProperties({
            instance: this,
            props: Component._clone(this),
            afterChange: afterChange
        });

        afterChange.call(this, arguments);
    }

    SurrogateComponent.prototype = attributes.constructor.prototype;// todo mix proto

    return SurrogateComponent;
};

Component._setProperties = function (options){
    var instance = options.instance;
    var properties = options.props || {};

    if (!instance){
        throw 'not found a target'
    }

    // after check props is opject
    for (var key in properties){
        if (!properties.hasOwnProperty(key)) continue;

        (function(key){
            var typeOf = typeof properties[key];

            // доделать подобъекты
            if (typeOf !== 'object'){
                Component._defineProperty(key, options);
            } else {
                // try if this is a object or function
                //setProperties(this.)
                throw 'value mast be a simple type'
            }
        }(key));
    }
};

Component._clone = function(source){
    var clone = {};

    for (var key in source){
        if (!source.hasOwnProperty(key)) continue;

        var typeOf = typeof source[key];

        // доделать подобъекты
        if (typeOf !== 'object'){
            clone[key] = source[key];
        }
    }
    return clone;
};

Component._defineProperty = function (key, options){
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
};

Component._bindEvents = function (instance, events, wrapper){
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
};