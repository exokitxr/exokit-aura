# Exokit JSCore bindings

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

## Event

Base class of all events. Just defines the event `type`.

## EventTarget

A general purpose event emitter.

### methods

+ addEventListener(event:String, callback: (ev: Event) => void);
+ removeEventListener(event:String, callback: (ev: Event) => void);
+ dispatchEvent(ev: Event);

## XmlHttpRequest extends EventTarget

### attributes:

+ `status: number`. Http status code. ReadOnly
+ `method: string`. Http method. ReadOnly
+ `timeout: number`. Integer value in seconds.
+ `readyState: number`. Integer value. ReadOnly.
+ `contentLength: number`.
+ `url: string`. URL requested.
+ `response: string|json|arraybuffer`
+ `responseType: string`. "json", "text", "arraybuffer"

### methods

+ `open(method: string, url: string)`
+ `send()`
+ `responseText() => string`
+ `setRequestHeader(key: string, value: string)`
+ `getResponseHeader(header: string) => string`
+ `getAllResponseHeaders() => string`