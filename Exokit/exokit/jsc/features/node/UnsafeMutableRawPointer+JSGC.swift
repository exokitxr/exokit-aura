//
//  UnsafeMutableRawPointer+JSGC.swift
//  Exokit
//
//  Created by hyperandroid on 08/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation

extension UnsafeMutableRawPointer {
    
    /// Returns the object associated with a pointer previously returned by `retainedPointerFor()`. Does
    /// not affect retain count.
    func wrappable<T: AnyObject>(type: T.Type) -> T? {
        return Unmanaged<T>.fromOpaque(self).takeUnretainedValue()
    }
    
    /// Decreases the retain count of an object associated with a pointer previously returned by `retainedPointerFor()`.
    func releasePointer() {
        let _ = Unmanaged<AnyObject>.fromOpaque(self).takeRetainedValue()
    }
}
