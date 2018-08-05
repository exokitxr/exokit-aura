import Foundation
import JavaScriptCore

@objc protocol FetchRequestMethod : JSExport {
    func open(method: String, url: String) -> Void
    func send(body: String) -> Void
    func setThreadIndex(_ index: Int) -> Void
    func setRequestHeader(key: String, value: String) -> Void
    static func create() -> FetchRequest
}

class FetchRequest : NSObject, FetchRequestMethod {
    
    fileprivate var _method:String = "";
    fileprivate var _url:String = "";
    fileprivate var _body:String = "";
    fileprivate var _threadIndex = -1;
    
    func open(method: String, url: String) {
        _method = method;
        _url = url;
    }
    
    func send(body: String) {
        _body = body;
        if (_url.contains("http")) {
            loadRemote();
        } else {
            loadLocal();
        }
    }
    
    func setRequestHeader(key: String, value: String) {
        
    }
    
    func setThreadIndex(_ index: Int) {
        _threadIndex = index;
    }
    
    fileprivate func loadRemote() {
        if (_method == "GET") {
            let url = URL(string: _url)
            let task = URLSession.shared.dataTask(with: url!) { data, response, error in
                guard error == nil else {
                    self.err();
                    return
                }
                guard let data = data else {
                    self.err();
                    return
                }
                
                self.resolve(data: String(data: data, encoding: .utf8)!)
            }
            
            task.resume()
        } else {
            var request = URLRequest(url: URL(string: _url)!)
            request.httpMethod = "POST"
            request.addValue("text/plain; charset=UTF-8", forHTTPHeaderField: "Content-Type");
            request.httpBody = _body.data(using: .utf8)
            let task = URLSession.shared.dataTask(with: request) { data, response, error in
                guard let data = data, error == nil else {
                    return
                }
                
                if let httpStatus = response as? HTTPURLResponse, httpStatus.statusCode != 200 {
                    
                }
                
                self.resolve(data: String(data: data, encoding: .utf8)!)
            }
            task.resume()
        }
    }
    
    fileprivate func loadLocal() {
        let split = _url.components(separatedBy: ".");
        var res = split[0]
        var type = split[1]
        
        if (split.count == 3) {
            res = split[0] + "." + split[1];
            type = split[2];
        }
        
        if let sourcePath = Bundle.main.path(forResource: res, ofType: type, inDirectory: "www") {
            do {
                let contents = try String(contentsOfFile: sourcePath)
                resolve(data: contents);
            }
            catch {
                err();
            }
        } else {
            err();
        }
    }
    
    fileprivate func getContext() -> JSContext {
        let context = JSCEngine.jsContext!;
        
//        if (_threadIndex > -1) {
//            let backing = WorkerBackingList.find(_threadIndex);
//            context = (backing.jsc?.context)!;
//        }
        
        return context;
    }
    
    fileprivate func resolve(data: String) {
        let obj = JSValue.init(object: self, in: getContext())
        let cb = obj?.objectForKeyedSubscript("onload");
        let _ = cb?.call(withArguments: [data])
    }
    
    fileprivate func err() {
        let obj = JSValue.init(object: self, in: getContext())
        let cb = obj?.objectForKeyedSubscript("onerror");
        let _ = cb?.call(withArguments: [])
    }
    
    class func create() -> FetchRequest {
        return FetchRequest()
    }
}
