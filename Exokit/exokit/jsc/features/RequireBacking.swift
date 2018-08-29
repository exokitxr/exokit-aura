import Foundation
import JavaScriptCore

@objc protocol RequireBackingMethod : JSExport {
    static func find(_ key:String) -> String
}

class RequireBacking : NSObject, RequireBackingMethod {
    
    class func find(_ key:String) -> String {
        return "";
    }
}
