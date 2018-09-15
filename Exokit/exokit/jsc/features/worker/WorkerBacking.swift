import Foundation
import JavaScriptCore

@objc protocol WorkerBackingMethod : JSExport {
    func load(_ path:String) -> Void
    func postMessage(_ string:String) -> Void
    static func create() -> WorkerBacking
}

class WorkerBacking : NSObject, WorkerBackingMethod {
    var index = WorkerBackingList.getIndex();
    var jsc:JSCWorker?;
    var _thread = DispatchQueue(label: "exokit.WorkerBacking");
    var _queue:[String] = [];
    
    override init() {
        super.init();
        WorkerBackingList.push(self);
    }
    
    func load(_ path:String) {
        _thread.async {
            self.jsc = JSCWorker(path, backing: self)
        }
    }
    
    func postMessage(_ string:String) {
        _queue.append(string);
    }
    
    func tick() {
        _thread.async {
            self.jsc?.tick();
            
            if (self.jsc != nil && self._queue.count > 0) {
                let string = self._queue[0];
                self._queue.remove(at: 0);
                self.jsc?.postMessage(string);
            }
        }
    }
    
    func terminate() {
        WorkerBackingList.remove(self);
        self.jsc?.terminate();
    }
    
    func receiveMessage(_ string:String) {
        DispatchQueue.main.async {
            let obj = JSValue.init(object: self, in: JSCEngine.jsContext!)
            let cb = obj?.objectForKeyedSubscript("receiveMessage");
            let _ = cb?.call(withArguments: [string])
        }
    }
    
    class func create() -> WorkerBacking {
        return WorkerBacking()
    }
}

class WorkerBackingList {
    static var COUNT = 0;
    static var map:[WorkerBacking] = [];
    
    class func push(_ w:WorkerBacking) {
        map.append(w);
    }
    
    class func remove(_ w:WorkerBacking) {
        map.remove(at: map.index(of: w)!);
    }
    
    class func find(_ c:Int) -> WorkerBacking {
        for w in map {
            if (w.index == c) {
                return w;
            }
        }
        
        return WorkerBacking.create();
    }
    
    class func getIndex() -> Int {
        COUNT = COUNT + 1;
        return COUNT;
    }
    
    class func tick() {
        for w in map {
            w.tick();
        }
    }
}
