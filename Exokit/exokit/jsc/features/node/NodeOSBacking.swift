import Foundation
import JavaScriptCore

@objc protocol NodeOSBackingProtocol : JSExport {
    static func getProcessorCount() -> Int
}

class NodeOSBacking : NSObject, NodeOSBackingProtocol {
    
    class func getProcessorCount() -> Int {
        let count = ProcessInfo.processInfo.processorCount;
        return count;
    }
}
