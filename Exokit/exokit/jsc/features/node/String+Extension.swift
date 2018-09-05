//
//  String+Extension.swift
//  Exokit
//
//  Created by hyperandroid on 05/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation

extension String {
    
    subscript (r: Range<Int>) -> String {
        get {
            if r.upperBound > self.count {
                return ""
            }
            let start = self.index(self.startIndex, offsetBy: r.lowerBound)
            let end = self.index(self.startIndex, offsetBy: r.upperBound)
            return String(self[start..<end])
        }
    }

    // Use hello[1]
    subscript (i: Int) -> Character {
        return self[self.index(self.startIndex, offsetBy: i)]
    }

    func NSRangeFromRange(_ range: Range<String.Index>) -> NSRange {
        /*let utf16view = self.utf16
         let from = String.UTF16View.Index(range.lowerBound, within: utf16view)
         let to = String.UTF16View.Index(range.upperBound, within: utf16view)
         return NSRange(location: utf16view.startIndex.distance(to: from), length: from!.distance(to: to))*/
        return NSRange(range, in: self)
    }
}
