import Foundation
import JavaScriptCore

@objc protocol NodeFSBackingProtocol : JSExport {
    static func getProcessorCount() -> Int
}

class NodeFSBacking : NSObject, NodeFSBackingProtocol {
    
    class func getProcessorCount() -> Int {
        let count = ProcessInfo.processInfo.processorCount;
        return count;
    }
}
