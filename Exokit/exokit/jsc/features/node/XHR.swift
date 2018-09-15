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

@objc protocol JSXHR : JSEventTarget {
    
    func open(_ method: String, _ url: String) -> Void
}

class XHR : EventTarget, JSXHR {
    
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
    
    override class func create() -> Any {
        return XHR()
    }
    
    func open(_ method: String, _ url: String) {
        
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
