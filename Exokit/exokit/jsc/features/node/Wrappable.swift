//
//  Wrappable.swift
//  Exokit
//
//  Created by hyperandroid on 09/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

// A wrappable is any native object wrappable as a javascript object.
// It keeps track of the associated native --> javascript object.
// It has convenience methods to obtain the Native object from a JSValueRef.
// It makes the wrapped object ref count secure by keeping a retained reference to it
//   and freeing it up when the js object gets GC'ed.
//
// All wrappable objects should extend from this one.
class Wrappable {
    private var wrapper : JSValueRef? = nil
    
    // Call this method to create an association between a fresh Wrappable object, and a javascript object.
    // e.g. at any given time, you'd like to return a new File object to javascript. Just call
    // `file.wrap(context)` for this to happen.
    func wrap(in context: JSContextRef) -> JSValueRef {
        if ( !containsWrapper() ) {
            // create a new instance of the stored class ref
            let _ = associateWithWrapper(context: context)
        }
        
        return wrapper!
    }
    
    func containsWrapper() -> Bool {
        return wrapper != nil
    }
    
    // Internal usage. Increment a wrappable retain count.
    func retainedPointerFor(value: AnyObject) -> UnsafeMutableRawPointer {
        return UnsafeMutableRawPointer(Unmanaged.passRetained(value).toOpaque())
    }
    
    // Get a Wrappable object from the javascript ref.
    // This must be called like: `let file: File = Wrappble.from( jsvalueref )`
    // It needs the type for the generic to work !!
    static func from<T: AnyObject>(ref: JSValueRef?) -> T? {
        if let ref = ref {
            let priv = JSObjectGetPrivate(ref)
            return priv?.wrappable(type: T.self)
        }
        
        return nil
    }
    
    // override me please.
    func associateWithWrapper(context: JSContextRef) -> JSValueRef {
        wrapper = JSObjectMake(context, getClass(), retainedPointerFor(value: self))
        return wrapper!
    }

    // override me please.
    func cleanUp(context: JSContextRef) {
        let priv = JSObjectGetPrivate(wrapper)
        let _ = priv?.releasePointer()
    }

    func getClass() -> JSClassRef! {
        assertionFailure("Must override")
        return nil
    }
}
