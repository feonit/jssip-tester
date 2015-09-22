(function(){
    /*
     * Copy the enumerable properties of p to o, and return o.
     * If o and p have a property by the same name, o's property is overwritten.
     * This function does not handle getters and setters or copy attributes.
     */
    function extend(o, p) {
        for(var prop in p) {                         // For all props in p.
            o[prop] = p[prop];                   // Add the property to o.
        }
        return o;
    }

    function defineSubclass(superclass,  // Constructor of the superclass
                            constructor, // The constructor for the new subclass
                            methods,     // Instance methods: copied to prototype
                            statics)     // Class properties: copied to constructor
    {
        // Set up the prototype object of the subclass
        constructor.prototype = Object.create(superclass.prototype);
        constructor.prototype.constructor = constructor;
        // Copy the methods and statics as we would for a regular class
        if (methods) extend(constructor.prototype, methods);
        if (statics) extend(constructor, statics);
        // Return the class
        return constructor;
    }

    window._ = {
        // A simple function for creating simple subclasses
        defineSubclass : defineSubclass
    };

}());