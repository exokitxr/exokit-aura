//
//  Event.swift
//  Exokit
//
//  Created by hyperandroid on 14/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

@objc protocol JSEvent : JSExport {
    var type: String {get}
    var target: Any? {get}
    var currentTarget: Any? {get}
    
    static func create(_ type: String) -> Any
}

class Event : NSObject, JSEvent {
    
    var type: String
    var target: Any? = nil
    var currentTarget: Any? = nil
    
    class func create(_ type: String) -> Any {
        return Event(type: type)
    }
    
    init(type: String) {
        self.type = type
    }
    
    func setTarget(_ t: Any) -> Void {
        target = t
        currentTarget = t
    }

}
