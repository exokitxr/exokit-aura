//
//  Exokit.swift
//  Exokit
//
//  Created by Michael Anthony on 8/4/18.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation

class Exokit {
    
    static var engine: JSCEngine!
    static var gl: GLSurface!
    static var inst: Exokit!
    
    /*
     modules contains a dictionary with resolved and loaded modules.
     will host JSValueProtected export module objects.
     */
    var modules = [String:JSValue]()
    
    init() {
        Exokit.engine = JSCEngine()
        Exokit.gl = GLSurface()
        Exokit.gl.setContext(context: Exokit.engine.context)
        Exokit.inst = self
    }
}
