//
//  Utils.swift
//  Aura
//
//  Created by Michael Anthony on 6/9/17.
//  Copyright © 2017 Active Theory. All rights reserved.
//

import Foundation
import UIKit
import CoreGraphics
import OpenGLES

class Utils {
    class func getJSPath(_ path: String) -> String! {
        let split = path.components(separatedBy: ".js");
        if let path = Bundle.main.path(forResource: split[0], ofType: "js", inDirectory: "www") {
            return path;
        } else {
            let documentDirectoryURL =  try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            return documentDirectoryURL.path + "/" + path;
        }
    }
    
    class func getPath(_ path: String) -> String! {
        let split = path.components(separatedBy: ".");
        if let path = Bundle.main.path(forResource: split[0], ofType: split[1], inDirectory: "www") {
            return path;
        } else {
            let documentDirectoryURL =  try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            return documentDirectoryURL.path + "/" + path;
        }
    }
    
    class func loadInternalJS(name: String) -> String {
        if let jsSourcePath = Bundle.main.path(forResource: name, ofType: "js") {
            do {
                // Load its contents to a String variable.
                let jsSourceContents = try String(contentsOfFile: jsSourcePath)
                return jsSourceContents
            }
            catch {
                print(error.localizedDescription)
            }
        }
        
        print("ERROR LOADING JS" + name);
        
        return "ERROR";
    }
    
    class func loadJS(name: String) -> String {
        if let jsSourcePath = getJSPath(name) {
            do {
                // Load its contents to a String variable.
                let jsSourceContents = try String(contentsOfFile: jsSourcePath)
                return jsSourceContents
            }
            catch {
                print(error.localizedDescription)
            }
        }
        
        print("ERROR LOADING JS" + name);
        
        return "ERROR";
    }
    
    class func getImageDimensions(path: String) -> NSArray {
        if let imgPath = getPath(path) {
            let image = UIImage(contentsOfFile: imgPath);
            let size = image!.size
            return [Int(size.width), Int(size.height)]
        } else {
            print("IMAGE NOT FOUND ::: "+path);
            return [0, 0];
        }
    }
    
    class func getImageData(path: String) -> (CFData?, CGImage?) {
        let imgPath = getPath(path)
        let image = UIImage(contentsOfFile: imgPath!)?.flipY()
        
        let imageData = image?.dataProvider?.data
        return (imageData, image)
    }
}

extension Collection where Iterator.Element == Double {
    var glFloatArray: [GLfloat] {
        return compactMap{ GLfloat($0) }
    }
    
    var glIntArray: [GLint] {
        return compactMap{ GLint($0) }
    }
    
    var toFloat: [Float] {
        return compactMap{ Float($0) }
    }
}

extension UIImage {
    public func flipY() -> CGImage? {
        let colorSpace:CGColorSpace = CGColorSpaceCreateDeviceRGB()
        let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue)
        let context = CGContext(data: nil, width: Int(UInt32(size.width)), height: Int(UInt32(size.height)), bitsPerComponent: 8, bytesPerRow: 0, space: colorSpace, bitmapInfo: bitmapInfo.rawValue)
        
        let rect = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        context!.translateBy(x: 0, y: size.height)
        context!.scaleBy(x: 1, y: -1)
        context!.draw(cgImage!, in: rect)
        
        return context!.makeImage()
    }
}

extension String {
    func floatValue() -> Float? {
        if let floatval = Float(self) {
            return floatval
        }
        return nil
    }
}
