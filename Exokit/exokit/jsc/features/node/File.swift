//
//  File.swift
//  Exokit
//
//  Created by hyperandroid on 08/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

import Foundation
import JavaScriptCore

enum FileStorage {
    case Bundle
    case Documents
    case Remote
}

@objc protocol AbstractFile {

    var size: Double {get}
    var isDirectory: Bool {get}
    var exists: Bool {get}
    var path: String {get}

    func loadAsText() -> String?
    func createWithText(_ str: String) -> Bool
    func listFiles() -> [AbstractFile]
    func delete() -> Bool
    func mkdir() -> Bool
}

class RemoteFile : AbstractFile {

    var size: Double = 0
    var isDirectory: Bool = false
    var exists: Bool = false
    var path: String = ""

    init(path: String, storage: FileStorage = .Bundle) {
        self.path = path
    }

    func loadAsText() -> String? {

        do {
            return try String(contentsOf: URL.init(string: path)!, encoding: String.Encoding.utf8)
        }
        catch let error {
            print("\(error)")
        }

        return nil
    }

    func createWithText(_ str: String) -> Bool {
        return false
    }

    func listFiles() -> [AbstractFile] {
        return []
    }

    func delete() -> Bool {
        return false
    }

    func mkdir() -> Bool {
        return false
    }

}

class LocalFile : AbstractFile {

    var path: String = ""
    var isDirectory: Bool = false
    var exists: Bool = false
    var size: Double = 0
    var storage : FileStorage = .Bundle

    init(path: String, storage: FileStorage = .Bundle) {
        self.storage = storage
        self.path = LocalFile.FilePath(path: path, storage: storage)
        setFileInfo()
    }

    init(wrapped: String, storage: FileStorage = .Bundle) {
        self.path = wrapped
        self.storage = storage
        setFileInfo()
    }

    static func FilePath(path: String, storage: FileStorage) -> String {
        switch storage {
        case .Bundle:
            return "\(Bundle.main.bundlePath)/\(path)"
        case .Documents:
            let dir = NSSearchPathForDirectoriesInDomains(FileManager.SearchPathDirectory.documentDirectory, FileManager.SearchPathDomainMask.userDomainMask, true)[0]
            return "\(dir)/\(path)"
        default:
            return path
        }
    }

    // filename is searched for in the bundle directory.
    private func setFileInfo() {
        var isDir: ObjCBool = false
        exists = FileManager.default.fileExists(atPath: path, isDirectory: &isDir)
        isDirectory = isDir.boolValue

        if exists && !isDirectory {
            if let attributes = try? FileManager.default.attributesOfItem(atPath: path) {
                size = attributes[ FileAttributeKey.size ] as! Double
            }
        } else {
            size = 0
        }
    }

    func loadAsText() -> String? {
        if exists && !isDirectory {
            return try? String(contentsOfFile: path)
        }

        return nil
    }

    func listFiles() -> [AbstractFile] {
        if !isDirectory {
            return []
        }

        if let filepaths = try? FileManager.default.contentsOfDirectory(atPath: path) {
            var ret: [LocalFile] = []
            for filepath in filepaths {
                ret.append(LocalFile(wrapped: "\(path)/\(filepath)", storage: storage))
            }

            return ret
        }

        return []
    }

    func createWithText(_ str: String) -> Bool {
        do {
            try str.write(toFile: path, atomically: false, encoding: String.Encoding.utf8)
            setFileInfo()
            return true
        } catch {
            print("unexpected File.createWithText: \(error)")
            return false
        }
    }

    func delete() -> Bool {
        do {
            try FileManager.default.removeItem(atPath: path)
            setFileInfo()
            return true
        } catch {
            print("unexpected File.delete: \(error)")
            return false
        }
    }

    func mkdir() -> Bool {

        do {
            try FileManager.default.createDirectory(atPath: path, withIntermediateDirectories: false, attributes: nil)
            setFileInfo()
            return true
        } catch {
            print("unexpected File.mkdir: \(error)")
            return false
        }
    }
}

@objc protocol JSFile : JSExport {
    var size: Double {get}
    var isDirectory: Bool {get}
    var exists: Bool {get}
    var path: String {get}
    
    func loadAsText() -> String?
    func createWithText(_ str: String) -> Bool
    func listFiles() -> [File]
    func delete() -> Bool
    func mkdir() -> Bool

    static func create(_ path: String, _ istorage: Int) -> Any;
}

// A native File object wrapped in a JS object
// The wrapper object if FileWrapper.
class File : NSObject, JSFile {
    
    var size: Double { get { return self.fileDelegate!.size } }
    
    var isDirectory: Bool { get { return self.fileDelegate!.isDirectory } }
    
    var exists: Bool { get { return self.fileDelegate!.exists } }
    
    var path: String { get { return self.fileDelegate!.path } }
    
    var fileDelegate: AbstractFile?

    override init() {
        super.init()
    }
    
    init(path: String, storage: FileStorage = .Bundle) {
        super.init()
        switch(storage) {
        case .Remote:
            fileDelegate = RemoteFile(path:path, storage: storage)
        default:
            fileDelegate = LocalFile(path: path, storage: storage)
        }
    }

    init(wrap: AbstractFile) {
        super.init()
        fileDelegate = wrap
    }
    
    static func create(_ path: String, _ istorage: Int) -> Any {
        
        var storage = FileStorage.Bundle
        
        switch istorage {
        case 0:
            storage = FileStorage.Bundle
        case 1:
            storage = FileStorage.Documents
        case 2:
            storage = FileStorage.Remote
        default:
            storage = FileStorage.Bundle
        }
        
        return File(path: path, storage: storage)
    }

    func loadAsText() -> String? {
        return fileDelegate?.loadAsText()
    }

    func listFiles() -> [File] {

        var ret: [File] = []

        let afiles = fileDelegate?.listFiles() ?? []
        for file in afiles {
            ret.append(File(wrap: file))
        }

        return ret
    }

    func createWithText(_ str: String) -> Bool {
        return fileDelegate?.createWithText(str) ?? false
    }

    func delete() -> Bool {
        return fileDelegate?.delete() ?? false
    }

    func mkdir() -> Bool {
        return fileDelegate?.mkdir() ?? false
    }
}

