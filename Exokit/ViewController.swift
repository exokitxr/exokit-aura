//
//  ViewController.swift
//  Exokit
//
//  Created by Michael Anthony on 8/4/18.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    fileprivate func initExokit() {
        let _ = Exokit()
        self.addChildViewController(Exokit.gl)
        Exokit.gl.view.frame = self.view.bounds;
        self.view.addSubview(Exokit.gl.view)
        Exokit.gl.view.isUserInteractionEnabled = false
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.isMultipleTouchEnabled = true
        self.view.isUserInteractionEnabled = true
        
        initExokit()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        var str = "";
        for touch in touches {
            let loc = touch.location(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            let loc = touch.previousLocation(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            str += touch.force.description+","
        }
        
        Exokit.engine.touchStart(str);
    }
    
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent?) {
        var str = "";
        for touch in touches {
            let loc = touch.location(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            let loc = touch.previousLocation(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            str += touch.force.description+","
        }
        
        Exokit.engine.touchMove(str);
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        var str = "";
        for touch in touches {
            let loc = touch.location(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            let loc = touch.previousLocation(in: self.view)
            str += loc.x.description+","+loc.y.description+","
        }
        
        str += "|"
        
        for touch in touches {
            str += touch.force.description+","
        }
        
        Exokit.engine.touchEnd(str);
    }

}

