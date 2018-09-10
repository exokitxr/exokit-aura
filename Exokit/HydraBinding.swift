//
//  HydraBinding.swift
//  Exokit
//
//  Created by Michael Anthony on 9/9/18.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

class HydraBinding {
    init() {
        let hydra = Exokit.engine.createNamespace("hydra");
        hydra.setObject("123", forKeyedSubscript: "test" as NSString)
    }
}
