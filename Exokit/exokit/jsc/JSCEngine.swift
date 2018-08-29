import UIKit
import Foundation
import JavaScriptCore

class JSCEngine {
    var context: JSContext!
    static var jsContext:JSContext!
    static var active = false;
    static var inst:JSCEngine!;
    
    fileprivate var _initTime = DispatchTime.now().uptimeNanoseconds;
    
    init() {
        context = JSContext()
        context.exceptionHandler = { context, exception in
            if let exc = exception {
                let alert = UIAlertController(title: "JS Error", message: exc.toString(), preferredStyle: UIAlertControllerStyle.alert)
                alert.addAction(UIAlertAction(title: "OK", style: UIAlertActionStyle.default, handler: nil))
//                Modules.viewController.present(alert, animated: true, completion: nil)
                
                print("!!!!! JS Exception", exc.toString())
            }
        }
        
        JSCEngine.jsContext = context;
        JSCEngine.inst = self
        
        preInit();
        initEngine();
        context.evaluateScript(Utils.loadJS(name: "index.js"))
        cleanup();
        
        JSCEngine.active = true
    }

    fileprivate func preInit() {
        let log: @convention(block) (String) -> Void = { string in
            print(string);
        }
        context.setObject(unsafeBitCast(log, to: AnyObject.self), forKeyedSubscript: "print" as NSString)

        context.globalObject.setObject(NodeOSBacking.self, forKeyedSubscript: "NodeOSBacking" as NSString)
        context.globalObject.setObject(NodeFSBacking.self, forKeyedSubscript: "NodeFSBacking" as NSString)
        context.globalObject.setObject(RequireBacking.self, forKeyedSubscript: "RequireBacking" as NSString)
//        context.globalObject.setObject(FetchRequest.self, forKeyedSubscript: "FetchRequest" as NSString)
//        context.globalObject.setObject(ARInterface.self, forKeyedSubscript: "ARInterface" as NSString)
//        context.globalObject.setObject(VideoElementBacking.self, forKeyedSubscript: "VideoElementBacking" as NSString)
//        context.globalObject.setObject(WorkerBacking.self, forKeyedSubscript: "WorkerBacking" as NSString)
//        context.globalObject.setValue(UIScreen.main.nativeScale, forProperty: "devicePixelRatio");
    }
    
    fileprivate func initEngine() {
        context.evaluateScript(Utils.loadInternalJS(name: "engine"));
        
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
            self.context.evaluateScript(Utils.loadJS(name: path));
        }
        let exokit = context.objectForKeyedSubscript("EXOKIT");
        exokit?.setObject(unsafeBitCast(exokitImport, to: AnyObject.self), forKeyedSubscript: "import" as NSString)

        let screen = context.objectForKeyedSubscript("screen");
        screen?.setObject(UIScreen.main.bounds.width, forKeyedSubscript: "width" as NSString)
        screen?.setObject(UIScreen.main.bounds.height, forKeyedSubscript: "height" as NSString)
    }
    
    fileprivate func cleanup() {
        let exokit = context.objectForKeyedSubscript("EXOKIT");
        let cb = exokit?.objectForKeyedSubscript("onload");
        let _ = cb?.call(withArguments: [])
    }
    
//    func touchStart(_ values:String) {
//        let aura = self.context.objectForKeyedSubscript("AURA");
//        let cb = aura?.objectForKeyedSubscript("touchStart");
//        let _ = cb?.call(withArguments: [values])
//    }
//
//    func touchMove(_ values:String) {
//        let aura = self.context.objectForKeyedSubscript("AURA");
//        let cb = aura?.objectForKeyedSubscript("touchMove");
//        let _ = cb?.call(withArguments: [values])
//    }
//
//    func touchEnd(_ values:String) {
//        let aura = self.context.objectForKeyedSubscript("AURA");
//        let cb = aura?.objectForKeyedSubscript("touchEnd");
//        let _ = cb?.call(withArguments: [values])
//    }
}

