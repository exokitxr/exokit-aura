//
//  XHR.swift
//  Exokit
//
//  Created by hyperandroid on 12/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

enum ReadyState {
    case UNSENT
    case OPENED
    case HEADERS_RECEIVED
    case LOADING
    case DONE
}

class XHR : EventTarget {
    
    var method: String = ""
    var url: String = ""
    var responseType: String = ""
    var overrideMimeType: String = ""
    
    var contentLength: Int = 0
    var timeout: Int = 0
    var readyState : ReadyState = .UNSENT
    
    override init() {
        super.init()
    }
    
    override func getClass() -> JSClassRef! {
        return XHRWrapper.ClassRef
    }
    
    override func cleanUp(context: JSContextRef) {
        super.cleanUp(context: context)
    }
    
    func open(method: String, url: String) {
        
    }
}

struct XHRWrapper {
    
    static let ClassName: String = "XMLHttpRequest"
    static var ClassRef: JSClassRef? = nil

    static func Initialize(_ context: JSContext) {
        XHRWrapper.InitializeClass()
        XHRWrapper.RegisterClass(context)
    }
    
    // Register in global object. Just expose the class ref to the world.
    fileprivate static func RegisterClass(_ context: JSContext) {
        let obj: JSObjectRef = JSObjectMake(context.jsGlobalContextRef, XHRWrapper.ClassRef, nil);
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
        cd.callAsConstructor = XHRWrapper.constructorCallback
        cd.finalize = XHRWrapper.finalizerCallback
        cd.staticFunctions = UnsafePointer(XHRWrapper.staticMethods)
        
        // inherit
        cd.parentClass = EventTargetWrapper.ClassRef
        
        XHRWrapper.ClassRef = JSClassCreate( &cd )
    }
    
    static let constructorCallback : JSObjectCallAsConstructorCallback = { context, constructor, argc, argv, exception in
        
        // things looking good. Create an object with the class template.
        // make the js-native attachment.
        let xhr = XHR()
        return xhr.associateWithWrapper(context: context!)
    }
    
    // Finalizer: Free the Wrappable instance.
    static let finalizerCallback : JSObjectFinalizeCallback = { object in
        if let xhr: XHR = Wrappable.from(ref: object) {
            xhr.cleanUp(context: JSCEngine.jsContext.jsGlobalContextRef)
        }
    }
    
    static let staticMethods = [
        
        JSStaticFunction(
            name: ("open" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("send" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("getAllResponseHeaders" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("getResponseHeader" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("setRequestHeader" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("overrideMimeType" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),
        
        JSStaticFunction(
            name: ("abort" as NSString).utf8String,
            callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                return JSValueMakeUndefined(context)
            },
            attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)),

        ]
}
