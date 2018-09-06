//
//  Require.swift
//  Exokit
//
//  Created by hyperandroid on 01/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

// resolve a module based on protocol.
// e.g. solve differences between http:// isDirectory, or file:// isDirectory
protocol URIResolver {
    
    func getBasePath() -> String;
    func resolve(path: String, file: String) -> String?;
    func sanitize(path: String, file: String) -> String?;
    func existsFileAt(path: String) -> Bool;
    func resolveModuleFileAt(path: String) -> String?;
}

// class FileResolver
// NSSearchPathForDirectoriesInDomains(FileManager.SearchPathDirectory.documentDirectory, FileManager.SearchPathDomainMask.userDomainMask, true)[0] as NSString

// class URLResolver

class BundleResolver : URIResolver {
    
    func resolve(path: String, file: String) -> String? {
        if let path = sanitize(path: path, file: file) {
            if let resolvedModuleFile = resolveModuleFileAt(path: path) {
                return resolvedModuleFile
            }
        }
        
        return nil
    }
    
    func getBasePath() -> String {
        if let path = Bundle.main.path(forResource: "www", ofType: "") {
            return path;
        } else {
            let documentDirectoryURL =  try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            return documentDirectoryURL.path + "/";
        }
    }
    
    // sanitize paths like ./././abcd/ef/gh/../../../a -> a
    func sanitize(path: String, file: String) -> String? {

        // local modules.
        if file[0..<3]=="../" || file[0..<2]=="./" {

            let str = "\(path)/\(file)"
            let entries = str.split(separator: "/")
            
            var sanitized = [String]()
            for entry in entries {
                if entry==".." {
                    guard sanitized.count == 0 else {
                        print("sanitize path \(str) underflow")
                        return nil
                    }
                    _ = sanitized.popLast()
                } else if entry != "." {
                    sanitized.append(String(entry))
                }
            }
            
            return sanitized.joined(separator: "/")
        }
        
        return "\(path)/node_modules/\(file)"
    }
    
    internal func existsFileAt(path: String) -> Bool {
        var isDirectory: ObjCBool = false
        let existsFile = FileManager.default.fileExists(atPath: path, isDirectory: &isDirectory)
        return existsFile && !isDirectory.boolValue
    }
    
    // get a module contents.
    // the module checks for:
    //  + path
    //  + path + ".js"
    //  + path + "/index.js"
    internal func resolveModuleFileAt(path: String) -> String? {
        
        if existsFileAt(path: path) {
            return path
        } else if existsFileAt(path: "\(path).js") {
            return "\(path).js"
        } else if existsFileAt(path: "\(path)/index.js") {
            return "\(path)/index.js"
        }
        
        return nil
    }
}

// + require modules related functions.
// + keep a map of resolved paths and module export-ed objects.
// + JSValueProtect them to avoid garbage collection.
// + offer a single entry point for executable js-code.
class Require {
    
    // stack of required modules as they are resolved.
    // last element in the stack is current module.
    var requireStack = [String]()
    
    // right now, require resolves from bundle only.
    var pathResolver : URIResolver = BundleResolver()
    
    // already solved and compiled modules
    var modules = [String:JSValue]()
    
    init() {
        // BUGBUG later on must be refactored to accomodate the protocol used to load the main js file.
        requireStack.append(pathResolver.getBasePath())
    }
    
    deinit {
        // un protect all module objects.
        if let context = JSContext.current() {
            for v in modules.values {
                JSValueUnprotect(context.jsGlobalContextRef, v.jsValueRef)
            }
        }
    }
    
    func currentRequireContext() -> String? {
        guard requireStack.count>0 else {
            return nil
        }
        return requireStack[requireStack.count - 1]
    }
    
    // require a module.
    // resolve local or remote, based on main.js
    func require(uri: String) -> JSValue! {
        print("require \(uri)")
        
        let currentContext = currentRequireContext()
        guard currentContext != nil else {
            print("no current require context.")
            return nil
        }
        
        let resolvedModuleFile = pathResolver.resolve(path: currentContext!, file: uri)
        guard resolvedModuleFile != nil else {
            print("can't resolve module file for \(uri)")
            return nil
        }
        
        // check for an existing resolver/compiled module for uri
        if let module = modules[resolvedModuleFile!] {
            return module
        }
        
        // set require context for next require
        var paths = resolvedModuleFile?.split(separator: "/")
        _ = paths!.popLast()
        requireStack.append(paths!.joined(separator: "/"))
        
        var ret : JSValue! = JSValue(nullIn: JSContext.current())
        
        // load module file.
        if let context = JSContext.current() {
            if let fileContents = try? String(contentsOfFile: resolvedModuleFile!, encoding: String.Encoding.utf8) {

                context.evaluateScript("var module= { exports: {} };")
                
                // solve cyclic refs
                let cyclicRef = context.objectForKeyedSubscript("module").objectForKeyedSubscript("exports")
                modules.updateValue(cyclicRef!, forKey: resolvedModuleFile!)
                
                let moduleContents = "(function(module, exports) {\(fileContents);\nreturn exports || module.exports;\n}).call(this, module, module.exports);\n"
                let retValue = context.evaluateScript(moduleContents)
                JSValueProtect(context.jsGlobalContextRef, retValue?.jsValueRef)
                modules.updateValue(retValue!, forKey: resolvedModuleFile!)

                ret = retValue
            }
        } else {
            print("module \(uri) does not exist.")
        }
        
        _ = requireStack.popLast()
        
        return ret
    }
}
