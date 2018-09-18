//
//  XHR.swift
//  Exokit
//
//  Created by hyperandroid on 12/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore
import GLKit

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
    var responseURL: String? {get}
    var response: Any? {get}
    
    func open(_ method: String, _ url: String) -> Void
    func send() -> Void
    func responseText() -> String?
    func setRequestHeader(_ key: String, _ value:String) -> Void
    func getResponseHeader(_ header: String) -> String?
    func getAllResponseHeaders() -> String?
}

class XHR : EventTarget, JSXHR {
    
    var method: String? = nil
    var timeout: Int = 0
    var readyState: Int = 0
    var responseType: String = ""
    var status: Int = 0

    var contents: Data? = nil
    var contentLength: Int64 = 0
    var responseURL: String? = nil
    
    fileprivate var readyStateType: ReadyState = .UNSENT
    var headers: [String:String]? = nil
    var responseHeaders: [String:String]? = nil
    
    //
    var bodyContents: String? = nil
    var overrideMimeType: String? = nil
    
    override init() {
        super.init()
    }
    
    deinit {
        print()
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
        
        let ev = Event(type: "readystatechange")
        ev.setTarget(self)
        dispatchEventImpl(ev)
    }
    
    func open(_ method: String, _ url: String) -> Void {
        
        self.method = method;
        self.responseURL = url;
        
        if !url.hasPrefix("http") && !url.hasPrefix("asset") {
            
            var sep = ""
            if !url.hasPrefix("/") {
                sep="/"
            }
            
            self.responseURL = /* HC::JavaEnv::JSEnv()->location_->base() + */ sep + url;
        }
        
        setReadyState(.OPENED)
    }
    
    func setRequestHeader(_ key: String, _ value:String) -> Void {
        if readyStateType == .OPENED {
            headers?.updateValue(value, forKey: key)
        }
    }
    
    func send() -> Void {
        
        if let curl = URL(string: self.responseURL!) {
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
            config.httpAdditionalHeaders =  headers
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
                let httpresponse = response as! HTTPURLResponse
                self.contentLength = httpresponse.expectedContentLength
                self.status = httpresponse.statusCode
                self.responseURL = httpresponse.url?.path
                
                for (k,v) in httpresponse.allHeaderFields {
                    self.responseHeaders?.updateValue(v as! String, forKey: k as! String)
                }
                
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
    
    fileprivate func getAsArrayBuffer() -> Any? {
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
        }
        
        return nil
    }
    
    fileprivate func getAsJSON() -> Any? {
        if let text = responseText(), let ctx = JSContext.current() {
            let arrayBufferRef = JSValueMakeFromJSONString(ctx.jsGlobalContextRef, JSCUtils.StringToJSString(text))
            return JSValue(jsValueRef: arrayBufferRef, in: ctx)
        }

        return nil
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
            return getAsJSON()
        } else if responseType == "arraybuffer" {
            return getAsArrayBuffer()
        }

        return nil
    }
    
    func getResponseHeader(_ header: String) -> String? {
        guard readyStateType == .DONE else {
            return nil
        }
        return responseHeaders?[header] ?? nil
    }
    
    func getAllResponseHeaders() -> String? {
        guard readyStateType == .DONE else {
            return nil
        }

        guard responseHeaders != nil else {
            return nil
        }
        
        var ret = ""
        for (k,v) in responseHeaders! {
            ret.append("\(k): \(v)\r\n")
        }
        
        return ret
    }
}
