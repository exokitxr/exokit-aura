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
    
    var method: String? = nil
    var url: String? = nil
    var bodyContents: String? = nil
    var responseType: String? = nil
    var overrideMimeType: String? = nil
    
    var headers: [String:String]? = nil
    
    var contents: Data? = nil
    
    var contentLength: Int = 0
    var timeout: Int = 0
    var readyState : ReadyState = .UNSENT
    
    override init() {
        super.init()
    }
    
    override func getClass() -> JSClassRef! {
        return XHRWrapper.ClassRef
    }
    
    func open(method: String, url: String) {
        
        self.method = method;
        self.url = url;
        
        if !url.hasPrefix("http") && !url.hasPrefix("asset") {
            
            var sep = ""
            if !url.hasPrefix("/") {
                sep="/"
            }
            
            self.url = /* HC::JavaEnv::JSEnv()->location_->base() + */ sep + url;
        }
        
        readyState = .OPENED;
        
        if let curl = URL(string: url) {
            var request = URLRequest.init(url: curl)
            request.httpMethod = method
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            
            if method == "POST" && bodyContents != nil {
                request.httpBody = Data(base64Encoded: bodyContents!)
            }
            
            if timeout > 0 {
                request.timeoutInterval = TimeInterval(timeout)
            }
            
            let config = URLSessionConfiguration.default
            let session = URLSession(configuration: config)
            
            let task = session.dataTask(with: request) {  (data, response, error) in
                
                guard error == nil else {
                    // notify error
                    print(error!)
                    return
                }
                
                guard let responseData = data else {
                    // notify error
                    print("Error: did not receive data")
                    return
                }
                
                self.contents = responseData
            }
            
            task.resume()
            
        } else {
            // notify error
        }
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
        
        cd.parentClass = EventTargetWrapper.ClassRef    // inherit
        
        XHRWrapper.ClassRef = JSClassCreate( &cd )
    }
    
    static let constructorCallback : JSObjectCallAsConstructorCallback = { context, constructor, argc, argv, exception in
        
        let xhr = XHR()
        return xhr.associateWithWrapper(context: context!)
    }
    
    // Finalizer: Free the Wrappable instance.
    static let finalizerCallback : JSObjectFinalizeCallback = { object in
        
        if let xhr: XHR = Wrappable.from(ref: object) {
            xhr.cleanUp()
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
