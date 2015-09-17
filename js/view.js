/**
 * Created by Feonit on 17.09.15.
 */

VIEW = {};

VIEW.extend = function(attributes){
    var wrapper = document.createElement('div');
    var isRendered = false;
    var children;
    var templateScriptNodeElement = document.getElementById(attributes.template);

    if(!attributes.template) throw 'need template';
    if(!attributes.constructor) throw 'need constructor';
    if (!templateScriptNodeElement) throw 'not found template';

    function afterChange(){
        console.log('render');

        var parentNode = templateScriptNodeElement.parentNode;

        // remove template node
        if (isRendered){
            // todo отвязку хендлеров
            [].forEach.call(children, function(elem){
                parentNode.removeChild(elem);
            });

        } else {

            // wrap with comments
            parentNode.insertBefore(document.createComment(attributes.constructor.name), templateScriptNodeElement);
            parentNode.insertBefore(document.createComment('/'+attributes.constructor.name), templateScriptNodeElement.nextElementSibling);

            isRendered = true;
        }

        wrapper.innerHTML = templateScriptNodeElement.textContent;

        // to array
        children = [].slice.call(wrapper.children);

        if (attributes.events){
            VIEW._bindEvents(this, attributes.events, wrapper)
        }

        // insert component тут врапер опустел
        [].forEach.call(children, function(elem){
            parentNode.insertBefore(elem, templateScriptNodeElement);
        });
    }

    function surrogateComponent(){
        attributes.constructor.apply(this, arguments);
        // переписать все свойства на сеттеры и гетеры
        VIEW._setProperties({
            instance: this,
            props: VIEW._clone(this),
            afterChange: afterChange
        });

        afterChange.call(this, arguments);
    }

    // todo mix proto
    surrogateComponent.prototype = attributes.constructor.prototype;

    return surrogateComponent;
};

VIEW._setProperties = function (options){
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
                VIEW._defineProperty(key, options);
            } else {
                // try if this is a object or function
                //setProperties(this.)
                throw 'value mast be a simple type'
            }
        }(key));
    }
};

VIEW._clone = function(source){
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

VIEW._defineProperty = function (key, options){
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

VIEW._bindEvents = function (instance, events, wrapper){
    for (var key in events){
        var split = key.split(' ');

        if(split.length !== 2){
            throw 'must be 2'
        }
        var eventName = split[0];
        var eventSelector = split[1];
        var handler = instance[events[key]];

        var elem = wrapper.querySelector(eventSelector);
        elem.addEventListener(eventName, handler.bind(instance), false);
    }
};