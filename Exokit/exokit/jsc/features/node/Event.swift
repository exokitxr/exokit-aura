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
    
    static func create(_ type: String) -> Any
}

class Event : NSObject, JSEvent {
    
    var type: String
    
    class func create(_ type: String) -> Any {
        return Event(type: type)
    }
    
    init(type: String) {
        self.type = type
    }
}
