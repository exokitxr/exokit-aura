//
//  EventTarget.swift
//  Exokit
//
//  Created by hyperandroid on 11/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

@objc protocol JSEventTarget : JSExport {
    func addEventListener(_ forEvent: String , _ callback: JSValue) -> Void
    func removeEventListener(_ forEvent: String, _ callback: JSValue) -> Void
    func dispatchEvent(_ e: JSValue) -> Void

    static func create() -> Any;
}

class EventTarget : NSObject, JSEventTarget {
    
    // map of string -> javascript function
    fileprivate var eventListeners: [String:[JSManagedValue]] = [:]
    fileprivate var onEventListeners: [String:JSManagedValue] = [:]
    
    class func create() -> Any {
        return EventTarget()
    }
    
    func addEventListener(_ forEvent: String, _ callback: JSValue ) -> Void {
        var callbacks = eventListeners[forEvent]
        
        if callbacks == nil {
            callbacks = []
        }
        
        callbacks!.append(JSManagedValue(value: callback))
        eventListeners.updateValue(callbacks!, forKey: forEvent)
    }

    func removeEventListener(_ forEvent: String, _ callback: JSValue ) -> Void {
        guard let callbacks = eventListeners[forEvent] else {
            return
        }
        
        var nc: [JSManagedValue] = []
        for rcallback in callbacks {
            if !callback.isEqual(to: callback) {
                nc.append(rcallback)
            }
        }
        
        eventListeners[forEvent] = nc
    }

    func dispatchEvent(_ vevent: JSValue) {
        
        if !vevent.isInstance(of: Event.self) {
            JSContext.current().exception = JSValue(newErrorFromMessage: "argument 1 must be of type Event", in: JSContext.current())
            return
        }
        
        let event: JSEvent = vevent.toObjectOf(Event.self) as! JSEvent
        guard let callbacks = eventListeners[event.type] else {
            return
        }

        let args = [event]
        
        for callback in callbacks {
            callback.value.call(withArguments: args)
        }
        
        if let callback = onEventListeners[event.type] {
            callback.value.call(withArguments: args)
        }
    }
}
