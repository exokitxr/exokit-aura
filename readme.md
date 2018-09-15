# Exokit JSCore bindings

## Wrapping native objects

Wrapping native objects means exposing an object to javascript that is fully backed by a native object.
It is a two step process, where a Wrappable (native object), and a Wrapper (JavaScript object) are defined.
During this definition, each object type keeps a reference to each other, and the necessary steps are performed to bind the Wrappble to the Wrapper's lifecycle.

### Native (Wrappable) objects

To ease in the development, Every native object must extend from an already existing `Wrappable` class.
Two methods must be overriden:

#### cleanUp(context: JSContextRef)

This method will be called when the Javascript Wrapper is about to be garbage collected.
It is the moment to free all held resources, specially other `JSValueProtect` references.

This method must always call `super.cleanUp(context:)`, which will release the native object.

#### getClass() -> JSClassRef

Must return a valid `JSClassRef` object instance. Normally, it will be  the class object defined by the Wrapper object.

Exposing a native wrappable object in Javascript is as simple as calling: 
`<wrappable_instance>.wrap(context: JSContextRef!)`
which will, if needed, create a JavaScript side wrapper object, make all the necessary bindings and protect the
Wrappable for the lifetime of the Wrapper object.

Conversely, obtaining the Wrappable counterpart for any Wrapper object is performed by calling:

`let obj: Type = Wrappable.from(ref: JSValueRef)`

`Wrappable.from` is a static generic function which casts `ref`  private info (a `void*`) to the `Type` defined for `obj`.
Must thus have a `Type` defined for the generic deduction to work.

### JavaScript Wrapper objects

Wrapper objects are JavaScript objects that delegate their functionality to a native (Wrappble) object.
Its sole responsibility is to create and maintain a  `JSClassRef` object, that's why all its methods are `static`.

#### finalizer

The finalizer `JSClassRef` callback is invoked when the javascript object is ready to be garbage collected.
It is the moment to free any allocated resources.

The finalizer is special, and has the same responsibility for all Wrapper objects: to call `wrappable.cleanUp(context)`. Where to obtain the context from is something the implementation does not care about. E.g.

```
// EventTarget finalizer code:
if let et: EventTarget = Wrappable.from(ref: object) {
    et.cleanUp(context: JSCEngine.jsContext.jsGlobalContextRef)
}
```

#### static functions

Static functions are one of the parts of the JavaScript Wrapper object that delegate into the native Wrappable object. The `@convention(c)` block invoked when calling a JavaScript object function delegates to the Wrappable object in the following way:

```
JSStaticFunction(
    // define an addEventListener function in the JavaScript prototype
    name: ("addEventListener" as NSString).utf8String,
    
    // invoke this code when calling in javascript: obj.addEventListener(...)
    callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
    
        // obtain the native wrappable for `this`
        let wrappable: EventTarget? = Wrappable.from(ref: thisObject)
        
        // call native code
        wrappable?.addEventListener( ...
        
        // return undefined to js
        return JSValueMakeUndefined(context)

    ...
```

## require

The require function is available in the global context object, one of the few for-granted functions.
Require follows basic nodejs require rules with some variations.

+ It will make all require operations relative to the application's main bundle folder
+ It has a hardcoded search path: exokit and www folders+
+ It can solve cyclic modules references

## File

File is a swift native FileWrapper object.

### Constructor

`new File( 'relative path', storage )`

Storage has 2 hardcoded values:

+ `0` -> file relative to app's main bundle folder
+ `1` -> file relative to app's documents folder. In this storage, you can freely create/delete files and folders.
+ `2` -> file is remote. No properties except path have value. Only loadAsText method works. 

### attributes

+ `size: number`. File size in bytes
+ `exists: boolean`
+ `path: string`. Full storage-resolved path.
+ `isDirectory: boolean`. If exists and it is a directory.

### methods

+ `loadAsText(): string`. Read file contents as a string. Returns undefined if error. 
+ `createWithText(string): boolean`. Create the file at path with the string contents. Returns true is success.
+ `listFiles(): File[]`. Get all file objects contained in a given directory. Empty array if error (e.g. no directory), or no files in the directory.
+ `delete(): boolean`. Delete the file or directory. True if success.
+ `makeDirectory(): boolean`. Create the directory at path. True if success.
