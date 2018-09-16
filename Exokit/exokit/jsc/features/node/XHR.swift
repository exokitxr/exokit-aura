//
//  XHR.swift
//  Exokit
//
//  Created by hyperandroid on 12/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

extension Data {
    func copyBytes<T>(as _: T.Type) -> [T] {
        return withUnsafeBytes { (bytes: UnsafePointer<T>) in
            Array(UnsafeBufferPointer(start: bytes, count: count / MemoryLayout<T>.stride))
        }
    }
}

enum ReadyState {
    case UNSENT
    case OPENED
    case HEADERS_RECEIVED
    case LOADING
    case DONE
}

@objc protocol JSXHR : JSEventTarget, JSExport {
    
    var method: String? { get set }
    var timeout: Int {get set}
    var readyState: Int {get}
    var responseType: String {get set}
    var url: String? {get}
    var response: Any? {get}
    
    func open(_ method: String, _ url: String) -> Void
    func send() -> Void
    func responseText() -> String?
}

@objc protocol JSXHREvent : JSEvent, JSExport {
    var target: XHR? { get }
    var currentTarget: XHR? { get }
    
    static func create() -> Any;
}

class EventXHR : Event, JSXHREvent {

    var target: XHR? = nil
    var currentTarget: XHR? = nil
    
    init() {
        super.init(type: "readystatechange")
    }
    
    class func create() -> Any {
        return EventXHR()
    }
    
    func setTarget(_ t: XHR) -> Void {
        target = t
        currentTarget = t
    }
}

class XHR : EventTarget, JSXHR {
    
    var method: String? = nil
    var timeout: Int = 0
    var readyState: Int = 0
    var responseType: String = ""

    var contents: Data? = nil
    var contentLength: Int64 = 0
    var url: String? = nil
    
    fileprivate var readyStateType: ReadyState = .UNSENT
    
    //
    var bodyContents: String? = nil
    var overrideMimeType: String? = nil
    var headers: [String:String]? = nil
    
    override init() {
        super.init()
    }

    override class func create() -> Any {
        return XHR()
    }
    
    func setReadyState(_ r: ReadyState ) {
        switch r {
        case .UNSENT: readyState = 0
        case .OPENED: readyState = 1
        case .HEADERS_RECEIVED: readyState = 2
        case .LOADING: readyState = 3
        case .DONE: readyState = 4
        }
        
        readyStateType = r
        
        let ev = EventXHR()
        ev.setTarget(self)
        dispatchEventImpl(ev)
    }
    
    func open(_ method: String, _ url: String) -> Void {
        
        self.method = method;
        self.url = url;
        
        if !url.hasPrefix("http") && !url.hasPrefix("asset") {
            
            var sep = ""
            if !url.hasPrefix("/") {
                sep="/"
            }
            
            self.url = /* HC::JavaEnv::JSEnv()->location_->base() + */ sep + url;
        }
        
        setReadyState(.OPENED)
    }
    
    func send() -> Void {
        
        if let curl = URL(string: self.url!) {
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
                    self.setReadyState(.DONE)
                    print(error!)
                    return
                }
                
                guard let responseData = data else {
                    self.setReadyState(.DONE)
                    print("Error: did not receive data")
                    return
                }
                
                self.contents = responseData
                self.contentLength = response?.expectedContentLength ?? 0
                self.setReadyState(.DONE)
            }
            
            task.resume()
            
        } else {
            // notify error
            setReadyState(.DONE)
        }
    }
    
    func responseText() -> String? {
        guard readyStateType == .DONE else {
            return ""
        }
        
        guard contents != nil else {
            return ""
        }
        
        return String(data: contents!, encoding: String.Encoding.utf8)
    }
    
    var response: Any? {
        get {
            return getResponse()
        }
    }
    
    fileprivate func getResponse() -> Any? {
        
        guard readyStateType == .DONE else {
            return nil
        }
        
        guard contents != nil else {
            return nil
        }
        
        if responseType == "text" {
            
            return responseText() as Any
        } else if responseType == "json" {
            
            if let text = responseText() {
                if let ctx = JSContext.current() {
                    let arrayBufferRef = JSValueMakeFromJSONString(ctx.jsGlobalContextRef, JSCUtils.StringToJSString(text))
                    return JSValue(jsValueRef: arrayBufferRef, in: ctx)
                }
            }
        } else if responseType == "arraybuffer" {
            
            if let ctx = JSContext.current() {

                // allocate a pointer to hold contents
                let ptr: UnsafeMutableBufferPointer<UInt8> = UnsafeMutableBufferPointer<UInt8>.allocate(capacity: contents!.count)
                
                // copy Data into ptr
                contents?.withUnsafeBytes { (contentsPtr: UnsafePointer<UInt8>) -> Void in
                    let _ = ptr.initialize(from: UnsafeBufferPointer(start: contentsPtr, count: contents!.count))
                }

                // another way of copying Data contents using Extension.
                // let _ = ptr.initialize(from: contents!.copyBytes(as: UInt8.self))
                
                var exception : JSValueRef?
                let deallocator: JSTypedArrayBytesDeallocator = { ptr, deallocatorContext in
                    // print( String(bytesNoCopy: ptr!, length: 21, encoding: String.Encoding.utf8, freeWhenDone: false) ?? "abcd" )
                    ptr?.deallocate()
                }
                
                let arrayBufferRef = JSObjectMakeArrayBufferWithBytesNoCopy(
                    ctx.jsGlobalContextRef,
                    ptr.baseAddress,
                    contents!.count,
                    deallocator,
                    nil,
                    &exception)
                
                if exception != nil {
                    ctx.exception = JSValue(jsValueRef: exception, in: ctx)
                    return nil
                }
                
                return JSValue(jsValueRef: arrayBufferRef, in: ctx)

                // convert into typed Array
//                let typeArrayRef = JSObjectMakeTypedArrayWithArrayBuffer(
//                    ctx.jsGlobalContextRef,
//                    kJSTypedArrayTypeInt8Array,
//                    arrayBufferRef,
//                    &exception)
//
//                if exception != nil {
//                    ctx.exception = JSValue(jsValueRef: exception, in: ctx)
//                    return nil
//                }
//
//                return JSValue(jsValueRef: typeArrayRef, in: ctx)
            }
        }
        
        return ""
    }
}
