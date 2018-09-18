import UIKit
import Foundation
import JavaScriptCore

class JSCEngine {
    var context: JSContext!
    var browser:JSValue!;
    
    static var jsContext:JSContext!
    static var active = false;
    static var inst:JSCEngine!;
    
    fileprivate var _initTime = DispatchTime.now().uptimeNanoseconds;
    
    fileprivate var requireUtil : Require? = nil
    
    init() {
        context = JSContext()
        context.exceptionHandler = { context, exception in
            if let value = exception {
                let stacktrace = value.objectForKeyedSubscript("stack").toString()
                let moreInfo = "stacktrace: \n\(stacktrace ?? "")."
                print("!!!!! JS Exception \(value)\n\(moreInfo)")
            }
        }
        
        JSCEngine.jsContext = context;
        JSCEngine.inst = self
        
        preInit();
        initEngine();
        
        // execute exokitjs/core
        bootstrapExokit()
        // execute www folder contents.
//        runUserland()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            self.cleanup();
            JSCEngine.active = true
        }
    }
    
    fileprivate func bootstrapExokit() {
        requireUtil?.setResolve(resource: "exokitjs/core", ofType: "")
        let exokitjsCorePath = requireUtil?.currentRequireContext() ?? ""
        let url = URL(string: exokitjsCorePath)
        if let jstxt = try? String(contentsOfFile: "\(exokitjsCorePath)/index.js") {
            context.evaluateScript(jstxt, withSourceURL: url!)
        }
    }
    
    fileprivate func runUserland() {
        requireUtil?.setResolve(resource: "www", ofType: "")
        let ctx = requireUtil?.currentRequireContext()
        let url = URL(string: ("\(ctx ?? "unknown")/index.js" ))
        context.evaluateScript(Utils.loadJS(name: "index.js"), withSourceURL: url!)
    }

    fileprivate func preInit() {
        let log: @convention(block) (String) -> Void = { string in
            print(string);
        }
        context.setObject( unsafeBitCast(log, to: AnyObject.self), forKeyedSubscript: "print" as NSString)
        
        
//        context.globalObject.setObject(FetchRequest.self, forKeyedSubscript: "FetchRequest" as NSString)
        context.globalObject.setObject(ARInterface.self, forKeyedSubscript: "ARInterface" as NSString)
//        context.globalObject.setObject(VideoElementBacking.self, forKeyedSubscript: "VideoElementBacking" as NSString)
        context.globalObject.setObject(WorkerBacking.self, forKeyedSubscript: "WorkerBacking" as NSString)
        context.globalObject.setValue(UIScreen.main.nativeScale, forProperty: "devicePixelRatio");

        let requireCallback: @convention(block) (String) -> AnyObject = { input in
            if let requiredModule = self.requireUtil {
                if let ret = requiredModule.require(uri: input) {
                    return ret
                }
            }
            
            return JSValue(undefinedIn: self.context)
        }
        context.setObject(unsafeBitCast(requireCallback, to: AnyObject.self), forKeyedSubscript: "require" as NSString)
        requireUtil = Require()
        
        // Initialize Wrapper classes
        context.setObject(File.self, forKeyedSubscript: "File" as NSString)
        context.setObject(Event.self, forKeyedSubscript: "Event" as NSString)
        context.setObject(EventTarget.self, forKeyedSubscript: "EventTarget" as NSString)
        context.setObject(XHR.self, forKeyedSubscript: "XMLHttpRequest" as NSString)
        
        // initialize utils.
        let getDimensionsFromArrayBuffer : @convention(block) (JSValue) -> [String: Any] = { arraybuffer in
            
            var w = 0, h = 0
            if let context = arraybuffer.context {
            
                if arraybuffer.isNull || arraybuffer.isUndefined {
                    context.exception =
                        JSValue(
                            jsValueRef: JSCUtils.Exception(
                                context.jsGlobalContextRef,
                                "Arraybuffer must not be null."),
                            in: arraybuffer.context)
                    return [ "width": 0, "height": 0 ]
                }
                
                let ptr = JSObjectGetArrayBufferBytesPtr(context.jsGlobalContextRef, arraybuffer.jsValueRef, nil)
                let size = JSObjectGetArrayBufferByteLength(context.jsGlobalContextRef, arraybuffer.jsValueRef, nil)
                
                if ptr != nil {
                    (w,h) = JSCUtils.TextureDimensions(ptr!, size)
                }
            }
            
            return [
                "width": w,
                "height": h
            ]
            
        }
        context.setObject( unsafeBitCast(getDimensionsFromArrayBuffer, to: AnyObject.self), forKeyedSubscript: "getDimensionsFromArrayBuffer" as NSString)
    }
    
    fileprivate func initEngine() {
        let url = URL(string: "\(Bundle.main.bundlePath)/engine.js" )
        context.evaluateScript( Utils.loadInternalJS(name: "engine"), withSourceURL: url!);
        
        let performanceNow: @convention(block) () -> Double = {
            let nanoTime = DispatchTime.now().uptimeNanoseconds - self._initTime;
            return (Double(nanoTime) / 1_000_000_000) * 1000
        }
        let performance = context.objectForKeyedSubscript("performance");
        performance?.setObject(unsafeBitCast(performanceNow, to: AnyObject.self), forKeyedSubscript: "now" as NSString)
        
        let gc: @convention(block) () -> Void = {
            print("GC EXECUTED!");
            JSGarbageCollect(self.context.jsGlobalContextRef);
        }
        context.globalObject.setObject(unsafeBitCast(gc, to: AnyObject.self), forKeyedSubscript: "garbageCollect" as NSString)
        
        let exokitImport: @convention(block) (String) -> Void = { path in
            let url = Utils.loadJS(name: path)
            self.context.evaluateScript(url, withSourceURL: URL(string: path)!);
        }
        let exokit = context.objectForKeyedSubscript("EXOKIT");
        exokit?.setObject(unsafeBitCast(exokitImport, to: AnyObject.self), forKeyedSubscript: "import" as NSString)
        exokit?.setObject(Bundle.main.infoDictionary!["EXOKIT_URL"] as! String, forKeyedSubscript: "rootPath" as NSString)
        
        let exokitEvaluate: @convention(block) (String, String) -> Void = { code, file in
            self.context.evaluateScript(code, withSourceURL: URL(string: file));
        }
        exokit?.setObject(unsafeBitCast(exokitEvaluate, to: AnyObject.self), forKeyedSubscript: "evaluate" as NSString)
        exokit?.setValue(ProcessInfo.processInfo.processorCount, forProperty: "processorCount");

        let screen = context.objectForKeyedSubscript("screen");
        screen?.setObject(UIScreen.main.bounds.width, forKeyedSubscript: "width" as NSString)
        screen?.setObject(UIScreen.main.bounds.height, forKeyedSubscript: "height" as NSString)
        
        browser = context.objectForKeyedSubscript("browser");
    }
    
    fileprivate func cleanup() {
        let exokit = context.objectForKeyedSubscript("EXOKIT");
        let cb = exokit?.objectForKeyedSubscript("onload");
        let _ = cb?.call(withArguments: [])
    }
    
    func createNamespace(_ name: String) -> JSValue {
        let obj = JSValueMakeFromJSONString(context.jsGlobalContextRef, JSCUtils.StringToJSString("{}"));
        browser.setObject(obj, forKeyedSubscript: name as NSString);
        return browser.objectForKeyedSubscript(name)
    }
    
    func touchStart(_ values:String) {
        let aura = self.context.objectForKeyedSubscript("EXOKIT");
        let cb = aura?.objectForKeyedSubscript("touchStart");
        let _ = cb?.call(withArguments: [values])
    }

    func touchMove(_ values:String) {
        let aura = self.context.objectForKeyedSubscript("EXOKIT");
        let cb = aura?.objectForKeyedSubscript("touchMove");
        let _ = cb?.call(withArguments: [values])
    }

    func touchEnd(_ values:String) {
        let aura = self.context.objectForKeyedSubscript("EXOKIT");
        let cb = aura?.objectForKeyedSubscript("touchEnd");
        let _ = cb?.call(withArguments: [values])
    }
}

