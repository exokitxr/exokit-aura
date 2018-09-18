//
//  JSCUtils.swift
//  Exokit
//
//  Created by hyperandroid on 08/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore
import GLKit

class ImageInfo {
    var width: Int
    var height: Int
    var contents: UnsafeMutableRawPointer
    
    init(width: Int, height: Int) {
        self.width = width
        self.height = height
        
        contents = UnsafeMutableRawPointer.allocate(byteCount: width*height*4, alignment: 1)
    }
    
    deinit {
        self.contents.deallocate()
    }
    
    func bytesLength() -> Int {
        return width*height*4
    }
}

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
        
    static func TextureFromArrayBuffer(_ ptr: UnsafeMutableRawPointer, _ size: Int, _ flipped: Bool, _ premultipliedAlpha: Bool ) -> (Int, Int, UnsafeMutableRawPointer) {
        
        let data = Data(bytesNoCopy: ptr, count: size, deallocator: .none)
        if let uiimage = UIImage.init(data: data) {
            
            let imageRef = uiimage.cgImage!
            
            let width = imageRef.width
            let height = imageRef.height
            let spriteData = [GLubyte](repeating: 0, count: width*height*4)
            let textureData = UnsafeMutableRawPointer(mutating: spriteData)
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            let bytesPerPixel = 4
            let bytesPerRow = bytesPerPixel * imageRef.width
            
            var alpha: CGImageAlphaInfo = .last
            if premultipliedAlpha {
                alpha = .premultipliedLast
            }
            let bitmapInfo = CGBitmapInfo(rawValue: alpha.rawValue)
            
            if let context = CGContext(
                data: textureData,
                width: imageRef.width,
                height: imageRef.height,
                bitsPerComponent: 8,
                bytesPerRow: bytesPerRow,
                space: colorSpace,
                bitmapInfo: bitmapInfo.rawValue) {
            
                // draw the image inverted ?? hope so.
                if flipped {
                    context.translateBy(x: 0, y: CGFloat(height))
                    context.scaleBy(x: 1, y: -1)
                }
                
                context.draw(imageRef, in: CGRect(x: CGFloat(0), y: CGFloat(0), width: CGFloat(width), height: CGFloat(height)))
                
                return (width, height, textureData)
                
            }
        }
        
        let emptyData = [GLubyte](repeating: 0, count:4)
        return (0,0, UnsafeMutableRawPointer(mutating: emptyData))
    }
    
    static func TextureDimensions(_ ptr: UnsafeMutableRawPointer, _ size: Int) -> (Int, Int) {
        
        let data = Data(bytesNoCopy: ptr, count: size, deallocator: .none)
        if let uiimage = UIImage.init(data: data) {
    
            let imageRef = uiimage.cgImage!
            let width = imageRef.width
            let height = imageRef.height
            return (width, height)
            
        }
        
        return (0,0)
    }
    
    // Get a file content's as a decoded image.
    // @param ptr: the pointer to a file contents.
    // @param size: the pointer size.
    // @returns ImageInfo, with decoded image's width, height and decoded contents.
    static func ContentsAsImage(_ ptr: UnsafeMutableRawPointer, _ size: Int, _ flipped: Bool, _ premultipliedAlpha: Bool ) -> ImageInfo? {
        
        let data = Data(bytesNoCopy: ptr, count: size, deallocator: .none)
        if let uiimage = UIImage.init(data: data) {
            
            let imageRef = uiimage.cgImage!
            
            let imageInfo = ImageInfo(width: imageRef.width, height: imageRef.height )
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            let bytesPerPixel = 4
            let bytesPerRow = bytesPerPixel * imageRef.width
            
            var alpha: CGImageAlphaInfo = .last
            if premultipliedAlpha {
                alpha = .premultipliedLast
            }
            let bitmapInfo = CGBitmapInfo(rawValue: alpha.rawValue)
            
            if let context = CGContext(
                data: imageInfo.contents,
                width: imageRef.width,
                height: imageRef.height,
                bitsPerComponent: 8,
                bytesPerRow: bytesPerRow,
                space: colorSpace,
                bitmapInfo: bitmapInfo.rawValue) {
                
                // draw the image inverted ?? hope so.
                if flipped {
                    context.translateBy(x: 0, y: CGFloat(imageRef.height))
                    context.scaleBy(x: 1, y: -1)
                }
                
                context.draw(imageRef, in: CGRect(x: CGFloat(0), y: CGFloat(0), width: CGFloat(imageRef.width), height: CGFloat(imageRef.height)))
                
                return imageInfo
            }
        }
        
        return nil
    }
    
}
