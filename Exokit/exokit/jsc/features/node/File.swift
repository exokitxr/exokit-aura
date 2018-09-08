//
//  File.swift
//  Exokit
//
//  Created by hyperandroid on 08/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore



// A native object wrapped by a JS object
class File {
    fileprivate var handle: Int = -1
    var path_: String = ""
    var path : String {get {return path_}}
    var isDirectory_: Bool = false
    var isDirectory : Bool {get {return isDirectory_}}
    var exists_: Bool = false
    var exists : Bool {get {return exists_}}
    var size: Double = 0
    
    init(path: String) {
        self.path_ = "\(Bundle.main.bundlePath)/\(path)"
        setFileInfo()
    }
    
    func isOpen() -> Bool {
        return handle != -1
    }
    
    // filename is searched for in the bundle directory.
    private func setFileInfo() {
        var isDir: ObjCBool = false
        exists_ = FileManager.default.fileExists(atPath: path_, isDirectory: &isDir)
        isDirectory_ = isDir.boolValue
        
        if exists_ && !isDirectory {
            if let attributes = try? FileManager.default.attributesOfItem(atPath: path) {
                size = attributes[ FileAttributeKey.size ] as! Double
            }
        }
    }
    
    func loadAsText() -> String? {
        if exists_ && !isDirectory {
            return try? String(contentsOfFile: path_)
        }
        
        return nil
    }
}

// A javascript wrapper for a native File object.
struct FileWrapper {
    
    static let ClassName: String = "File"
    static var class_: JSClassRef? = nil
    static let Properties = ["filename", "isDirectory", "size", "exists"]
    
    static func Initialize(_ context: JSContext) {
        FileWrapper.InitializeClass()
        FileWrapper.RegisterClass(context)
    }
    
    fileprivate static func retainedPointerFor(value: AnyObject) -> UnsafeMutableRawPointer {
        return UnsafeMutableRawPointer(Unmanaged.passRetained(value).toOpaque())
    }
    
    // Register in global object. Just expose the class ref to the world.
    fileprivate static func RegisterClass(_ context: JSContext) {
        let obj: JSObjectRef = JSObjectMake(context.jsGlobalContextRef, FileWrapper.class_, nil);
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
        
        let constructorCallback : JSObjectCallAsConstructorCallback = { context, constructor, argc, argv, exception in
            
            // check parameters. If not suitable, throw an exception.
            if (argc != 1 || false==JSValueIsString(context, argv?[0])) {
                if let exception = exception {
                    exception.pointee = JSCUtils.Exception(context!, "File constructor just needs one string Argument.")
                }
                // return null on constructor exception. We don't want half-ass baked objects.
                return JSValueMakeNull(context)
            }
            
            // things looking good. Create an object with the class template.
            // make the js-native attachment.
            let fileinfo = File(path: JSCUtils.UnsafeJSStringToString(context!, argv![0]! ) )
            return JSObjectMake( context, FileWrapper.class_, FileWrapper.retainedPointerFor(value: fileinfo) )
        }
        
        let finalizerCallback : JSObjectFinalizeCallback = { object in
            let priv = JSObjectGetPrivate(object)
            // convert raw pointer to type (File.self) and release (decrement retain count)
            let _ = priv?.releasePointer()
        }
        
        let convertToTypeCallback : JSObjectConvertToTypeCallback = { context, object, type, exception in
            if ( type==kJSTypeString ) {
                if let file = FileWrapper.GetWrappable(ref: object) {
                    return JSCUtils.StringToJSString("File: \(file.path)")
                }
            }
            
            return JSValueMakeNull(context)
        }
        
        let getPropertyNamesCallback : JSObjectGetPropertyNamesCallback = { context, object, propertyNames in
            for property in FileWrapper.Properties {
                let propertyName = JSStringCreateWithUTF8CString( property );
                JSPropertyNameAccumulatorAddName( propertyNames, propertyName )
                JSStringRelease(propertyName)
            }
        }
        
        cd.className = (ClassName as NSString).utf8String
        cd.attributes = JSClassAttributes(kJSClassAttributeNone);
        cd.callAsConstructor = constructorCallback
        cd.finalize = finalizerCallback
        cd.convertToType = convertToTypeCallback
        cd.getPropertyNames = getPropertyNamesCallback
        
        cd.staticValues = UnsafePointer([
            
            JSStaticValue(
                name: ("size" as NSString).utf8String,
                getProperty: { context, object, propertyName, exception in
                    let wrappable = FileWrapper.GetWrappable(ref: object)
                    guard wrappable != nil else {
                        return JSValueMakeUndefined(context);
                    }
                    return JSValueMakeNumber(context, wrappable!.size)
                },
                setProperty: nil,
                attributes: JSPropertyAttributes(kJSPropertyAttributeDontDelete)),
            
            JSStaticValue(
                name: ("filename" as NSString).utf8String,
                getProperty: { context, object, propertyName, exception in
                    let wrappable = FileWrapper.GetWrappable(ref: object)
                    guard wrappable != nil else {
                        return JSValueMakeUndefined(context);
                    }
                    return JSValueMakeString(context, JSCUtils.StringToJSString( wrappable!.path ))
                },
                setProperty: nil,
                attributes: JSPropertyAttributes(kJSPropertyAttributeDontDelete)),
            
            JSStaticValue(
                name: ("exists" as NSString).utf8String,
                getProperty: { context, object, propertyName, exception in
                    let wrappable = FileWrapper.GetWrappable(ref: object)
                    guard wrappable != nil else {
                        return JSValueMakeUndefined(context);
                    }
                    return JSValueMakeBoolean(context, wrappable!.exists)
                },
                setProperty: nil,
                attributes: JSPropertyAttributes(kJSPropertyAttributeDontDelete)),
            
            JSStaticValue(
                name: ("idDirectory" as NSString).utf8String,
                getProperty: { context, object, propertyName, exception in
                    let wrappable = FileWrapper.GetWrappable(ref: object)
                    guard wrappable != nil else {
                        return JSValueMakeUndefined(context);
                    }
                    return JSValueMakeBoolean(context, wrappable!.isDirectory)
                },
                setProperty: nil,
                attributes: JSPropertyAttributes(kJSPropertyAttributeDontDelete))
            ])
        
        cd.staticFunctions = UnsafePointer([
            JSStaticFunction(
                name: ("loadAsText" as NSString).utf8String,
                callAsFunction: { context, functionObject, thisObject, argc, argv, exception in
                    if let text = FileWrapper.GetWrappable(ref: thisObject)?.loadAsText() {
                        let jsref = JSCUtils.StringToJSString(text)
                        let ret = JSValueMakeString(context, jsref)
                        JSStringRelease(jsref)
                        return ret
                    }
                    
                    return JSValueMakeUndefined(context)
                },
                attributes: JSPropertyAttributes(kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontDelete)
            )
        ])
        
        FileWrapper.class_ = JSClassCreate( &cd )
    }
    
    // Get the native wrappable object associated with this JS object if any.
    static func GetWrappable(ref: JSValueRef?) -> File? {
        if let ref = ref {
            let priv = JSObjectGetPrivate(ref)
            return priv?.wrappable(type: File.self)
        }
        
        return nil
    }
}
