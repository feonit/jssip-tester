/**
 * Created by Feonit on 17.09.15.
 */

window.Component = (function(){

    var Component = {};

    Component.register = function(attributes){
        if(!attributes.constructor) throw 'need constructor';
        if(!attributes.elementTagName) throw 'need elementTagName';

        // контекст его определения
        var ownerDocument = document.currentScript.ownerDocument;

        var templateFn = attributes.template
            ? attributes.template
            : function () { return ownerDocument.getElementsByTagName('template')[0].innerHTML };

        var Proto = Object.create(HTMLElement.prototype);

        _mixProto(Proto, attributes.constructor.prototype);
        /**
         * @abstract
         * @this {Object}
         * */
        Proto.createdCallback = function() {
            // установить свойства
            attributes.constructor.apply(this, arguments);

            // переписать все свойства конструктора на сеттеры и гетеры
            _setProperties({
                instance: this,

                // собственные свойства эеземпляра
                props: _clone(this),

                // callback render
                afterChange: function(){
                    _afterChange.call(this, templateFn);
                }
            });

            this._preventChanges = false;

            // отрисовать
            _afterChange.call(this, templateFn);

            // открыть глобально
            if (this.id){
                if(!window.components) window.components = {};
                window.components[this.id] = this;
            }
        };
        /**
         * @abstract
         * */
        Proto.attachedCallback = function(){
            if (attributes.events){
                _bindEvents(this, attributes.events)
            }
        };
        /**
         * @abstract
         * */
        Proto.detachedCallback = function(){
            console.log('detachedCallback')
        };
        /**
         * @abstract
         * */
        Proto.attributeChangedCallback = function(){
            console.log('attributeChangedCallback')
        };

        // всем добавляю, заменить на микс // todo mix proto
        Proto.setState = function(props){
            // todo clone objects
            this._preventChanges = true;
            for (var key in props){
                this[key] = props[key];
            }
            this._preventChanges = false;
            _afterChange.call(this, templateFn);

        };

        // в этот Proto нужно примиксовать прототип конструктора

        document.registerElement(attributes.elementTagName, {
            prototype: Proto
        });
    };

    /**
     * Handler for render HTML of component
     * @this {HTMLElement}
     * @param {Function} templateFn
     * */
    function _afterChange(templateFn){
        if (this._preventChanges) return;

        var shadow = this.shadowRoot;

        if (!shadow){
            shadow = this.createShadowRoot();
        }

        var temp = document.createElement('div');
        temp.innerHTML = templateFn.apply(this, arguments);

        // remove nodes in shadow
        while (shadow.firstChild){
            shadow.firstChild.remove();
        }

        // insert nodes
        while (temp.firstChild){
            shadow.appendChild(temp.firstChild);
        }
    }
    /**
     * @param {Object} options
     * @param {Object} options.instance
     * @param {Object} options.props
     * */
    function _setProperties(options){
        var instance = options.instance,
            properties = options.props || {},
            key,
            typeOf,
            value;

        if (!instance){
            throw 'not found a target'
        }

        // todo after check props is opject
        // убрать функции
        for (key in properties){
            typeOf = typeof options.instance[key];
            value = options.instance[key];

            // not functions and not hash obj (except null)
            if (typeOf === 'function' || ( typeOf === 'object' && value !== value)) continue;
            //if (!properties.hasOwnProperty(key)) continue;

            //(function(key){
            typeOf = typeof properties[key];

            // доделать подобъекты
            if (typeOf !== 'object'){
                _defineBehaviorProperty(key, options);
            } else {
                // try if this is a object or function
                //setProperties(this.)
                throw 'value mast be a simple type'
            }
            //}(key));
        }
    }
    /**
     * Create clone of object
     * @param {Object} source
     * */
    function _clone(source){
        var clone = {}, key, typeOf;

        for (key in source){
            if (!source.hasOwnProperty(key)) continue;// todo очень большой ненужный перебор

            typeOf = typeof source[key];

            // todo sub-objects
            if (typeOf !== 'object'){
                clone[key] = source[key];
            }
        }
        return clone;
    }
    /**
     * Define property as ES5 style
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
     * Bind event handlers
     * @param {Object} nodeElement
     * @param {Object} events
     * */
    function _bindEvents(nodeElement, events){
        for (var key in events){
            var split = key.split(' ');

            if(split.length !== 2){
                throw 'must be 2'
            }
            var eventName = split[0];
            var eventSelector = split[1];
            var handlerValue = events[key];
            var handler = (typeof handlerValue === 'function') ? handlerValue : nodeElement[handlerValue];
            var nodeList = nodeElement.shadowRoot.querySelectorAll(eventSelector);

            if (nodeList && handler){
                var slice = Array.prototype.slice;
                var forEach = Array.prototype.forEach;
                forEach.call(slice.call(nodeList), function(element){
                    element.addEventListener(eventName, handler.bind(nodeElement), false);
                });
            }
        }
    }

    /**
     * Mix property of mixin to obj
     * */
    function _mixProto(obj, mixin){
        for (var key in mixin){
            if (!mixin.hasOwnProperty(key) || key ==='constructor') continue;
            obj[key] = mixin[key]
        }
        return obj;
    }

    return Component;
}());