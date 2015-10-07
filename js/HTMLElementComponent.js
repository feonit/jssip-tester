/**
 * Created by Feonit on 17.09.15.
 */

window.HTMLElementComponent = (function () {

    var _slice = Array.prototype.slice,
        _forEach = Array.prototype.forEach,
        _clone = function (source) {
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
        },
        _mixProto = function (obj, mixin) {
        if (!mixin) return obj;
        for (var key in mixin) {
            if (!mixin.hasOwnProperty(key) || key === 'constructor') continue;
            obj[key] = mixin[key]
        }
        return obj;
    };

    /**
     * @constructor HTMLElementComponent
     * */
    function HTMLElementComponent(){
        // no have base property
    }

    /**
     * Register a new HTMLElementComponent
     * @param {String} elementTagName — Name of component
     * @param {Function} Constructor — Constructor of component
     * @param {Object} options
     * @public
     * */
    HTMLElementComponent.register = function(elementTagName, Constructor, options){
        if ( !elementTagName ) throw 'need elementTagName';

        var Proto = this._extend(Constructor, options);
        document.registerElement(elementTagName, {
            prototype: Proto
        });
        HTMLElementComponent.components[Constructor.name] = Constructor;
    };
    /**
     * Here are all created components
     * @type {Object}
     * @public
     * */
    HTMLElementComponent.components = {};
    /**
     * Prototyping new component based on ElementComponent
     * @param {Function} Constructor — some constructor for new HTMLElementComponent
     * @param {Object} options
     * @private
     * */
    HTMLElementComponent._extend = function(Constructor, options){
        options || (options = {});

        var ownerDocument = document.currentScript.ownerDocument; // контекст его определения
        var Proto = Object.create(HTMLElementComponent.prototype);
        Proto.constructor = Constructor;

        var templateFn;

        var elem = ownerDocument.getElementsByTagName('template')[0] || ownerDocument.querySelector('#template');
        var template = '`' + elem.innerHTML + '`';

        templateFn = function () {
            with (this) {
                var _innerHTML = eval(template) ;
            }
            return _innerHTML;
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

    Object.defineProperties(HTMLElementComponent.prototype, {
        'API': {
            get: function(){
                return {
                    'instance': Object.keys(this),
                    'instance.prototype': Object.keys(this.constructor.prototype)
                };
            }
        }
    });

    _mixProto (HTMLElementComponent.prototype, /** @lends HTMLElementComponent.prototype */{

        constructor: HTMLElementComponent,

        /**
         * @abstract
         * */
        options: '__abstract__',

        /**
         * @abstract
         * */
        templateFn: '__abstract__',

        /**
         * Новый элемент появился
         * @abstract
         * @this {HTMLElementComponent}
         * */
        createdCallback: function () {
            Object.defineProperties(this,{
                /**
                 * Collection of binding
                 * */
                _binding: {
                    value: [],
                    enumerable: false
                },
                /**
                 * One render instead more
                 * */
                _preventChanges: {
                    value: false,
                    enumerable: false
                },
                /**
                 * Collection of binding
                 * */
                _handlers: {
                    value: {},
                    enumerable: false
                }
            });

            // add special properties
            if ( this.Constructor ){
                this.Constructor.apply(this, arguments);
            }

            this._setBehaviorProperties(_clone(this), function () {
                this._reRender();
            });

            this._preventChanges = false;

            // отрисовать
            this._render();

            // открыть глобально
            if (this.id) {
                if (!window.components) window.components = {};
                window.components[this.id] = this;
            }
        },

        /**
         * Новый элемент прикреплен
         * @abstract
         * */
        attachedCallback: function () {

        },

        /**
         * Элемент откреплен
         * @abstract
         * */
        detachedCallback: function () {
            this._unbindEvents();
        },

        /**
         * Атрибут поменялся
         * @abstract
         * */
        attributeChangedCallback: function () {
            console.log('attributeChangedCallback')
        },

        /**
         * @public
         * @this {HTMLElementComponent}
         * */
        setState: function (props) {
            var key;

            if ( !this instanceof HTMLElementComponent) return;

            // todo clone objects
            this._preventChanges = true;
            for (key in props) {
                this[key] = props[key];
            }
            this._preventChanges = false;
            this._reRender();
        },

        /**
         * @public
         * @this {HTMLElementComponent}
         * */
        on: function (eventName, callback){
            this._handlers[eventName] || (this._handlers[eventName]=[]);
            this._handlers[eventName].push(callback);
        },

        /**
         * @public
         * @this {HTMLElementComponent}
         * */
        triggerChange: function(event){
            var that = this;
            if (event.type === 'update'){
                this._handlers['update'] = this._handlers['update'] || [];
                this._handlers['update'].forEach(function(handler){
                    handler.call(that, event);
                });
            }
        },

        /**
         * Overwrite all properties in the constructor setters and getters
         * @param {Object} props — собственные свойства эеземпляра
         * @param {Object} afterChangeCallback — callback render
         * */
        _setBehaviorProperties: function (props, afterChangeCallback) {
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
        },

        /**
         * Define property as ES5 style
         * @private
         * @param {String} key — Name of property
         * @param {Object} props
         * @param {function} afterChangeCallback
         * @this {HTMLElementComponent}
         * */
        _defineBehaviorProperty: function (key, props, afterChangeCallback) {
            var that = this;
            Object.defineProperty(this, key, {
                get: function () {
                    return props[key];
                },
                set: function (value) {
                    if (afterChangeCallback) {

                        var change = {
                            name: key,
                            object: that,
                            oldValue: that[key],
                            newValue: value,
                            type: 'update'
                        };
                        that.triggerChange(change);

                        props[key] = value;

                        afterChangeCallback.call(this);
                    }
                },
                enumerable: true,
                configurable: true
            });
        },

        /**
         * Handler for render HTML of HTMLElementComponent
         * @private
         * @this {HTMLElementComponent}
         * */
        _render: function () {
            var shadow = this.shadowRoot || this.createShadowRoot(); // how remove shadowRoot?
            var temp = document.createElement('div');

            temp.innerHTML = this.templateFn();

            // insert nodes
            while (temp.firstChild) {
                shadow.appendChild(temp.firstChild);
            }

            if (this.options.events) {
                this._bindEvents(this.options.events);
            }
        },

        /**
         * Method for rerender HTML of HTMLElementComponent
         * @private
         * @this {HTMLElementComponent}
         * */
        _reRender: function(){
            if (this._preventChanges) return;

            var shadow = this.shadowRoot;

            this._unbindEvents();

            // remove nodes in shadow
            while (shadow.firstChild) {
                shadow.firstChild.remove();
            }

            this._render();
        },

        /**
         * Bind event handlers (like the Backbone.View)
         * @private
         * @param {Object} events — { "eventName elementSelector": "eventHandler" }
         * @this {HTMLElementComponent}
         * */
        _bindEvents: function (events) {
            for (var key in events) {
                var split = key.split(' ');

                if (split.length !== 2) {
                    throw 'must be 2'
                }
                var eventName = split[0];
                var eventSelector = split[1];
                var eventHandler = events[key];
                var handler = (typeof eventHandler === 'function') ? eventHandler : this[eventHandler];
                var nodeList = this.shadowRoot.querySelectorAll(eventSelector);

                if (nodeList && handler) {
                    var that = this;

                    _forEach.call(_slice.call(nodeList), function (element) {

                        var fn = handler.bind(that);

                        var stored = {
                            element: element,
                            eventName: eventName,
                            handler: fn
                        };

                        element.addEventListener(eventName, fn, false);

                        that._binding.push(stored);


                    });
                }
            }
        },

        /**
         * Unbind event handlers
         * @private
         * @this {HTMLElementComponent}
         * */
        _unbindEvents: function (){
            if (this._binding.length > 0) {
                _forEach.call(this._binding, function(stored){
                    stored.element.removeEventListener(stored.eventName, stored.handler, false);
                });
                this._binding = [];
            }
        }
    });

    return HTMLElementComponent;
}());