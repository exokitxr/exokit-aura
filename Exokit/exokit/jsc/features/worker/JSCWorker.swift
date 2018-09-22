import Foundation
import JavaScriptCore

class JSCWorker {
    var context:JSContext;
    var EXOKIT:JSValue;
    var _backing:WorkerBacking;
    
    fileprivate static var index = 0
    fileprivate var requireUtil : Require? = nil
    
    init(_ path:String, backing: WorkerBacking) {
        _backing = backing;
        
        context = JSContext(virtualMachine: JSCEngine.vm)
        context.name = "Worker\(JSCWorker.index)"
        JSCWorker.index = JSCWorker.index + 1
        context.exceptionHandler = { context, exception in
            if let value = exception {
                let stacktrace = value.objectForKeyedSubscript("stack").toString()
                let moreInfo = "stacktrace: \n\(stacktrace ?? "")."
                print("!!!!! Worker JS Exception \(value)\n\(moreInfo)")
            }
        }
        
        let log: @convention(block) (String) -> Void = { string in
            print(string);
        }
        context.setObject(unsafeBitCast(log, to: AnyObject.self), forKeyedSubscript: "print" as NSString)
        context.globalObject.setValue(backing.index, forProperty: "THREAD_INDEX");
        
        context.setObject(File.self, forKeyedSubscript: "File" as NSString)
        context.setObject(Event.self, forKeyedSubscript: "Event" as NSString)
        context.setObject(EventTarget.self, forKeyedSubscript: "EventTarget" as NSString)
        context.setObject(XHR.self, forKeyedSubscript: "XMLHttpRequest" as NSString)
        
        context.evaluateScript(Utils.loadInternalJS(name: "engine"), withSourceURL: URL(string: "engine")!);
        EXOKIT = context.objectForKeyedSubscript("EXOKIT");
        requireUtil = Require()
        let requireCallback: @convention(block) (String) -> AnyObject = { input in
            if let requiredModule = self.requireUtil {
                if let ret = requiredModule.require(uri: input) {
                    return ret
                }
            }
            
            return JSValue(undefinedIn: self.context)
        }
        context.setObject(unsafeBitCast(requireCallback, to: AnyObject.self), forKeyedSubscript: "require" as NSString)
        
        print("Initialized JSCWorker in thread");
        requireUtil?.setResolve(resource: "exokitjs/core", ofType: "")
        let exokitjsCorePath = requireUtil?.currentRequireContext() ?? ""
        if let jstxt = try? String(contentsOfFile: "\(exokitjsCorePath)/worker-thread.js") {
            context.evaluateScript(jstxt, withSourceURL: URL(string: "\(exokitjsCorePath)/worker-thread.js")!)
        }

        initCommunication();
        
        EXOKIT.setObject(Bundle.main.infoDictionary!["EXOKIT_URL"] as! String, forKeyedSubscript: "rootPath" as NSString)
        let initFn = EXOKIT.objectForKeyedSubscript("init");
        let _ = initFn?.call(withArguments: [path]);
    }
    
    fileprivate func initCommunication() {
        let evaluate: @convention(block) (String, String) -> Void = { code, path in
            self.context.evaluateScript(code, withSourceURL: URL(string: path));
        }
        EXOKIT.setObject(unsafeBitCast(evaluate, to: AnyObject.self), forKeyedSubscript: "evaluate" as NSString)
        
        let postMessage: @convention(block) (JSValue) -> Void = { msg in
            self._backing.receiveMessage(JSManagedValue(value: msg));
        }
        EXOKIT.setObject(unsafeBitCast(postMessage, to: AnyObject.self), forKeyedSubscript: "postMessage" as NSString)
        
        let transferData: @convention(block) (String, [Double]) -> Void = { key, array in
            let aura = JSCEngine.jsContext?.objectForKeyedSubscript("EXOKIT");
            let cb = aura?.objectForKeyedSubscript("receiveTransfer");
            let _ = cb?.call(withArguments: [key, array])
        }
        EXOKIT.setObject(unsafeBitCast(transferData, to: AnyObject.self), forKeyedSubscript: "transferData" as NSString)
    }
    
    func postMessage(_ data:JSValue) {
        let cb = EXOKIT.objectForKeyedSubscript("onMessage");
        let _ = cb?.call(withArguments: [data])
    }
    
    func tick() {
        let cb = EXOKIT.objectForKeyedSubscript("tick");
        let _ = cb?.call(withArguments: nil)
    }
    
    func terminate() {
        
    }
}
