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
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        initExokit()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

