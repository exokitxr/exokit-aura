//
//  EventTarget.swift
//  Exokit
//
//  Created by hyperandroid on 11/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

typealias ContextCallbackPair = (JSGlobalContextRef,JSObjectRef)

class EventTarget : Wrappable {
    
    // map of string -> javascript function
    fileprivate var eventListeners: [String:[ContextCallbackPair]] = [:]
    fileprivate var onEventListeners: [String:ContextCallbackPair] = [:]
    
    override init() {
        super.init()
    }
    
    func addEventListener(context: JSGlobalContextRef, forEvent: String, callback: JSValueRef ) -> Void {
        var callbacks = eventListeners[forEvent]
        
        if callbacks == nil {
            callbacks = []
        }
        
        JSValueProtect( context, callback )
        callbacks!.append((context,callback))
        eventListeners.updateValue(callbacks!, forKey: forEvent)
    }

    func removeEventListener(context: JSGlobalContextRef, forEvent: String, callback: JSValueRef ) -> Void {
        guard let callbacks = eventListeners[forEvent] else {
            return
        }
        
        var nc: [(JSGlobalContextRef,JSObjectRef)] = []
        for persistentContextCallbackPair in callbacks {
            if !JSValueIsEqual(context, callback, persistentContextCallbackPair.1, nil) {
                nc.append(persistentContextCallbackPair)
            } else {
                // unprotect deleted object.
                JSValueUnprotect(persistentContextCallbackPair.0, persistentContextCallbackPair.1)
            }
        }
        
        eventListeners[forEvent] = nc
    }

    func emit(context: JSGlobalContextRef, event: String, eventObject: JSValueRef) {
        guard let callbacks = eventListeners[event] else {
            return
        }

        let args: [JSValueRef?] = [ eventObject ]
        var exception: JSValueRef?

        for contextCallbackPair in callbacks {
            // invoke callback with eventObject
            JSObjectCallAsFunction(context, contextCallbackPair.1, contextCallbackPair.1, 1, UnsafePointer(args), &exception)
            // bugbug handle exception
        }
        
        if let contextCallbackPair = onEventListeners[event] {
            JSObjectCallAsFunction(context, contextCallbackPair.1, contextCallbackPair.1, 1, UnsafePointer(args), &exception)
            // bugbug handle exception
        }
    }
    
    func getOn(event: String) -> ContextCallbackPair? {
        return onEventListeners[event]
    }
    
    func setOn(ctx: JSGlobalContextRef, event: String, callback: JSValueRef?) -> Void {
        if let callback = onEventListeners[event] {
            JSValueUnprotect(ctx, callback.1)
        }
        
        if let callback = callback {
            JSValueProtect(ctx, callback)
            onEventListeners[event] = (ctx,callback)
        } else {
            onEventListeners.removeValue(forKey: event)
        }
    }

    override func getClass() -> JSClassRef! {
        return EventTargetWrapper.ClassRef
    }
    
    override func cleanUp() {
        
        // unprotect callbacks
        for (_,eventListenerContextCallbackPairs) in eventListeners {
            for eventListenerContextCallbackPair in eventListenerContextCallbackPairs {
                JSValueUnprotect( eventListenerContextCallbackPair.0, eventListenerContextCallbackPair.1 )
            }
        }
        
        for (_,onEventListenerContextCallbackPair) in onEventListeners {
            JSValueUnprotect( onEventListenerContextCallbackPair.0, onEventListenerContextCallbackPair.1 )
        }
        
        super.cleanUp()
    }
}

struct EventTargetWrapper {
 
    static let ClassName: String = "EventTarget"
    static var ClassRef: JSClassRef? = nil

    static func Initialize(_ context: JSContext) {
        EventTargetWrapper.InitializeClass()
        EventTargetWrapper.RegisterClass(context)
    }
    
    // Register in global object. Just expose the class ref to the world.
    fileprivate static func RegisterClass(_ context: JSContext) {
        let obj: JSObjectRef = JSObjectMake(context.jsGlobalContextRef, EventTargetWrapper.ClassRef, nil);
        JSObjectSetProperty(
            context.jsGlobalContextRef,
            context.globalObject.jsValueRef,
            JSStringCreateWithUTF8CString(ClassName),
            obj,
            JSPropertyAttributes(kJSPropertyAttributeNone),
            nil);
    }
    
    // Create and store the class ref.
    fileprivate static func InitializeClass() {
        
        var cd = kJSClassDefinitionEmpty
        
        cd.className = (ClassName as NSString).utf8String
        cd.attributes = JSClassAttributes(kJSClassAttributeNone);
        cd.callAsConstructor = EventTargetWrapper.constructorCallback
        cd.finalize = EventTargetWrapper.finalizerCallback
        cd.staticFunctions = UnsafePointer(EventTargetWrapper.staticMethods)
        
        EventTargetWrapper.ClassRef = JSClassCreate( &cd )
    }
    
    static let constructorCallback : JSObjectCallAsConstructorCallback = { context, constructor, argc, argv, exception in
        
        // check parameters. If not suitable, throw an exception.
        if argc != 0 {
            if let exception = exception {
                exception.pointee = JSCUtils.Exception(context!, "EventTarget constructor needs no parameters.")
            }
            // return null on constructor exception. We don't want half-ass baked objects.
            return JSValueMakeNull(context)
        }
        
        // things looking good. Create an object with the class template.
        // make the js-native attachment.
        let et = EventTarget()
        return et.associateWithWrapper(context: context!)
    }
    
    // Finalizer: Free the Wrappable instance.
    static let finalizerCallback : JSObjectFinalizeCallback = { object in
        if let et: EventTarget = Wrappable.from(ref: object) {
            et.cleanUp()
        }
    }

    static let staticMethods = [
        
        JSStaticFunction(
            name: ("addEventListener" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                
                if argc<2 {
                    if let exception = exception {
                        exception.pointee = JSCUtils.Exception(context!, "addEventListeners needs 2 parameters.")
                    }
                } else {
                    let event = JSCUtils.JSStringToString(context!, argv![0]!)
                    if !JSValueIsObject(context, argv![1]!) {
                        if let exception = exception {
                            exception.pointee = JSCUtils.Exception(context!, "addEventListener needs an object as 2nd parameter.")
                        }
                    } else {
                        let wrappable: EventTarget? = Wrappable.from(ref: thisObject)
                        wrappable?.addEventListener(context: JSContextGetGlobalContext(context!), forEvent: event, callback: argv![1]!)
                    }
                }
                
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),

        JSStaticFunction(
            name: ("removeEventListener" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                
                if argc<2 {
                    if let exception = exception {
                        exception.pointee = JSCUtils.Exception(context!, "removeEventListeners needs 2 parameters.")
                    }
                } else {
                    let event = JSCUtils.JSStringToString(context!, argv![0]!)
                    if !JSValueIsObject(context, argv![1]!) {
                        if let exception = exception {
                            exception.pointee = JSCUtils.Exception(context!, "removeEventListener needs an object as 2nd parameter.")
                        }
                    } else {
                        let wrappable: EventTarget? = Wrappable.from(ref: thisObject)
                        wrappable?.removeEventListener(context: JSContextGetGlobalContext(context!), forEvent: event, callback: argv![1]!)
                    }
                }
                
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),


        JSStaticFunction(
            name: ("emit" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                
                if argc<2 {
                    if let exception = exception {
                        exception.pointee = JSCUtils.Exception(context!, "emit needs 2 parameters.")
                    }
                } else {
                    let event = JSCUtils.JSStringToString(context!, argv![0]!)
                    let wrappable: EventTarget? = Wrappable.from(ref: thisObject)
                    wrappable?.emit(context: JSContextGetGlobalContext(context!), event: event, eventObject: argv![1]!)
                }
                
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete))
    ]
}
