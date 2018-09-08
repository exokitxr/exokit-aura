//
//  JSCUtils.swift
//  Exokit
//
//  Created by hyperandroid on 08/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation

struct JSCUtils {
    
    static func StringToJSString(_ str: String?) -> JSStringRef {
        guard str != nil else {
            return JSStringCreateWithUTF8CString( ("undefined" as NSString).utf8String )
        }
        
        return JSStringCreateWithUTF8CString( (str! as NSString).utf8String )
    }
    
    // return strRef contents only if it is a valid object.
    static func JSStringToString(_ context: JSContextRef, _ strref: JSStringRef) -> String {
        if (false==JSValueIsNull(context, strref) && false==JSValueIsUndefined(context, strref)) {
            return JSCUtils.UnsafeJSStringToString(context, strref)
        }
        
        return ""
    }
    
    // If you know a better way to extract the unicode contents of a JSString object,
    // please let me know.
    //
    // The unsafe comes from the fact that it does not check for the input strRef object.
    // This function assumes the caller did the cleanup of strRef.
    static func UnsafeJSStringToString(_ context: JSContextRef, _ strRef: JSStringRef) -> String {
        
        let pathString = JSValueToStringCopy(context, strRef, nil)
        let maxBufferSize = JSStringGetMaximumUTF8CStringSize(pathString)
        let buffer = UnsafeMutablePointer<Int8>.allocate(capacity: maxBufferSize)
        JSStringGetUTF8CString(pathString, buffer, maxBufferSize)
        
        return String(cString: buffer)
    }
    
    // Create a JSError object.
    // Will normally be set as `pointee` of excpetion objects passed as UnsafePointer<JSValueRef>.
    static func Exception(_ context: JSContextRef, _ message:String ) -> JSObjectRef {

        let message = JSStringCreateWithUTF8CString(message);
        let args: [JSValueRef?] = [ JSValueMakeString(context, message), nil ];

        return JSObjectMakeError(context, 1, UnsafePointer(args), nil);
    }
    
}
