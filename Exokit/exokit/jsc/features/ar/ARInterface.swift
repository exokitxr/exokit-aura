//
//  AR.swift
//  Exokit
//
//  Created by Michael Anthony on 8/5/18.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore
import ARKit

@objc protocol ARInterfaceMethod : JSExport {
    func search(params:NSDictionary) -> Array<Any>
    static func create() -> ARInterface
}

class ARInterface : NSObject, ARInterfaceMethod {
    
    fileprivate func matrixToDouble(origin: matrix_float4x4, destination: inout [Double]) {
        destination[0] = Double(origin.columns.0.x);
        destination[1] = Double(origin.columns.0.y);
        destination[2] = Double(origin.columns.0.z);
        destination[3] = Double(origin.columns.0.w);
        destination[4] = Double(origin.columns.1.x);
        destination[5] = Double(origin.columns.1.y);
        destination[6] = Double(origin.columns.1.z);
        destination[7] = Double(origin.columns.1.w);
        destination[8] = Double(origin.columns.2.x);
        destination[9] = Double(origin.columns.2.y);
        destination[10] = Double(origin.columns.2.z);
        destination[11] = Double(origin.columns.2.w);
        destination[12] = Double(origin.columns.3.x);
        destination[13] = Double(origin.columns.3.y);
        destination[14] = Double(origin.columns.3.z);
        destination[15] = Double(origin.columns.3.w);
    }
    
    func search(params: NSDictionary) -> Array<Any> {
        var output: [[Double]] = [];
        
        if (ARTracking.frame != nil) {
            let point = CGPoint(x: params["x"] as! Double, y: params["y"] as! Double);
            let result = ARTracking.frame?.hitTest(point, types: ARHitTestResult.ResultType.featurePoint);
            for r in result! {
                var matrix:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                matrixToDouble(origin: r.worldTransform, destination: &matrix);
                output.append(matrix);
            }
        }
        
        return output;
    }
    
    class func create() -> ARInterface {
        let _ = AR()
        return ARInterface()
    }
}
