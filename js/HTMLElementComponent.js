/**
 * Created by Feonit on 17.09.15.
 */

window.HTMLElementComponent = (function () {

    /**
     * Create clone of object
     * @param {Object} source
     * @private
     * */
    function _clone(source) {
        var clone = {}, key, typeOf;

        for (key in source) {
            if (!source.hasOwnProperty(key)) continue;// todo очень большой ненужный перебор

            typeOf = typeof source[key];

            // todo sub-objects
            if (typeOf !== 'object') {
                clone[key] = source[key];
            }
        }
        return clone;
    }
    /**
     * Mix property of mixin to obj
     * @private
     * */
    function _mixProto(obj, mixin) {
        if (!mixin) return obj;
        for (var key in mixin) {
            if (!mixin.hasOwnProperty(key) || key === 'constructor') continue;
            obj[key] = mixin[key]
        }
        return obj;
    }

    /**
     * @constructor HTMLElementComponent
     * */
    function HTMLElementComponent(){
        // no have property
    }

    /**
     * Register a new HTMLElementComponent
     * @public
     * */
    HTMLElementComponent.register = function(elementTagName, Constructor, options){
        if ( !elementTagName )
            throw 'need elementTagName';
        var Proto = this._extend(Constructor, options);
        document.registerElement(elementTagName, {
            prototype: Proto
        });
        HTMLElementComponent[Constructor.name] = Constructor;
    };
    /**
     * Prototyping new component based on ElementComponent
     * @private
     * */
    HTMLElementComponent._extend = function(Constructor, options){
        var ownerDocument = document.currentScript.ownerDocument; // контекст его определения
        var Proto = Object.create(HTMLElementComponent.prototype);
        Proto.constructor = Constructor;

        var templateFn = options.template
            ? options.template
            : function () {
            return ownerDocument.getElementsByTagName('template')[0].innerHTML
        };

        Proto.options = options;
        Proto.templateFn = templateFn;
        Proto.Constructor = Constructor;
        Proto = _mixProto(Proto, Constructor.prototype);

        return Proto;
    };
    /**
     * HTMLElementComponent.prototype based on HTMLElement.prototype
     * */
    HTMLElementComponent.prototype = Object.create(HTMLElement.prototype);

    HTMLElementComponent.prototype.constructor = HTMLElementComponent;
    /**
     * @abstract
     * */
    HTMLElementComponent.prototype.options = '__abstract__';
    /**
     * @abstract
     * */
    HTMLElementComponent.prototype.templateFn = '__abstract__';
    /**
     * Новый элемент появился
     * @abstract
     * @this {HTMLElementComponent}
     * */
    HTMLElementComponent.prototype.createdCallback = function () {

        // add special properties
        if ( this.Constructor ){
            this.Constructor.apply(this, arguments);
        }

        this._setBehaviorProperties(_clone(this), function () {
            this._render();
        });

        this._preventChanges = false;

        // отрисовать
        this._render();

        // открыть глобально
        if (this.id) {
            if (!window.components) window.components = {};
            window.components[this.id] = this;
        }
    };
    /**
     * Новый элемент прикреплен
     * @abstract
     * */
    HTMLElementComponent.prototype.attachedCallback = function () {
        if (this.options.events) {
            this._bindEvents(this.options.events)
        }
    };
    /**
     * Элемент откреплен
     * @abstract
     * */
    HTMLElementComponent.prototype.detachedCallback = function () {
        console.log('detachedCallback')
    };
    /**
     * Атрибут поменялся
     * @abstract
     * */
    HTMLElementComponent.prototype.attributeChangedCallback = function () {
        console.log('attributeChangedCallback')
    };
    /**
     * @public
     * @this {HTMLElementComponent}
     * */
    HTMLElementComponent.prototype.setState = function (props) {
        var key;

        if ( !this instanceof HTMLElementComponent) return;

        // todo clone objects
        this._preventChanges = true;
        for (key in props) {
            this[key] = props[key];
        }
        this._preventChanges = false;
        this._render();
    };
    /**
     * Overwrite all properties in the constructor setters and getters
     * @param {Object} props — собственные свойства эеземпляра
     * @param {Object} afterChangeCallback — callback render
     * */
    HTMLElementComponent.prototype._setBehaviorProperties = function (props, afterChangeCallback) {
        var key,
            typeOf,
            value;

        props = props || {};

        // todo after check props is opject
        // убрать функции
        for (key in props) {
            typeOf = typeof this[key];
            value = this[key];

            // not functions and not hash obj (except null)
            if (typeOf === 'function' || ( typeOf === 'object' && value !== value)) continue;
            //if (!properties.hasOwnProperty(key)) continue;

            typeOf = typeof props[key];

            // доделать подобъекты
            if (typeOf !== 'object') {
                this._defineBehaviorProperty(key, props, afterChangeCallback);
            } else {
                // try if this is a object or function
                //setProperties(this.)
                throw 'value mast be a simple type'
            }
        }
    };
    /**
     * Define property as ES5 style
     * @private
     * @param {String} key — Name of property
     * @param {Object} props
     * @param {function} afterChangeCallback
     * @this {HTMLElementComponent}
     * */
    HTMLElementComponent.prototype._defineBehaviorProperty = function (key, props, afterChangeCallback) {
        Object.defineProperty(this, key, {
            get: function () {
                return props[key];
            },
            set: function (value) {
                props[key] = value;
                if (afterChangeCallback) {
                    afterChangeCallback.call(this);
                }
            }
        });
    };
    /**
     * Handler for render HTML of HTMLElementComponent
     * @private
     * @this {HTMLElementComponent}
     * */
    HTMLElementComponent.prototype._render = function () {
        if (this._preventChanges) return;

        var shadow = this.shadowRoot || this.createShadowRoot();
        var temp = document.createElement('div');

        temp.innerHTML = this.templateFn();

        // remove nodes in shadow
        while (shadow.firstChild) {
            shadow.firstChild.remove();
        }

        // insert nodes
        while (temp.firstChild) {
            shadow.appendChild(temp.firstChild);
        }
    };

    /**
     * Bind event handlers (like the Backbone.View)
     * @private
     * @param {Object} events
     * @this {HTMLElementComponent}
     * */
    HTMLElementComponent.prototype._bindEvents = function (events) {
        for (var key in events) {
            var split = key.split(' ');

            if (split.length !== 2) {
                throw 'must be 2'
            }
            var eventName = split[0];
            var eventSelector = split[1];
            var handlerValue = events[key];
            var handler = (typeof handlerValue === 'function') ? handlerValue : this[handlerValue];
            var nodeList = this.shadowRoot.querySelectorAll(eventSelector);

            if (nodeList && handler) {
                var slice = Array.prototype.slice;
                var forEach = Array.prototype.forEach;
                forEach.call(slice.call(nodeList), function (element) {
                    element.addEventListener(eventName, handler.bind(this), false);
                });
            }
        }
    };

    return HTMLElementComponent;
}());