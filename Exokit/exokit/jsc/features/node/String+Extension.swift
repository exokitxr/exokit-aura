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
            if r.upperBound > self.count { return "" }
            let start = self.index(self.startIndex, offsetBy: r.lowerBound)
            let end = self.index(self.startIndex, offsetBy: r.upperBound)
            return String(self[start..<end])
        }
    }

    subscript (i: Int) -> Character {
        return self[self.index(self.startIndex, offsetBy: i)]
    }

    func NSRangeFromRange(_ range: Range<String.Index>) -> NSRange {
        return NSRange(range, in: self)
    }
}
