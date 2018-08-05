//
//  AR.swift
//  Exokit
//
//  Created by Michael Anthony on 8/5/18.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import ARKit

class AR: NSObject, ARSessionDelegate {
    var session: ARSession!
    var tracking: ARTracking!
    
    override init() {
        super.init()
        session = ARSession()
        session.delegate = self
        
        let configuration = ARWorldTrackingConfiguration()
        session.run(configuration)
        
        tracking = ARTracking(session)
    }
    
    func session(_ session: ARSession, didFailWithError error: Error) {
        // Present an error message to the user
        
    }
    
    func sessionWasInterrupted(_ session: ARSession) {
        // Inform the user that the session has been interrupted, for example, by presenting an overlay
        
    }
    
    func sessionInterruptionEnded(_ session: ARSession) {
        // Reset tracking and/or remove existing anchors if consistent tracking is required
        
    }
    
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
        tracking.update(frame)
    }
    
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        tracking.addAnchors(anchors)
    }
    
    func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        tracking.removeAnchors(anchors)
    }
}
