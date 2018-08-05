import Foundation
import JavaScriptCore
import AVFoundation

@objc protocol VideoBackingMethod : JSExport {
    func setSrc(_ src:String) -> Void
    func play() -> Void
    func pause() -> Void
    func destroy() -> Void
    func setLoop(_ bool:Bool) -> Void
    func setTime(_ time:Double) -> Void
    func setVolume(_ volume:Double) -> Void
    static func create() -> VideoElementBacking
}

class VideoElementBacking : NSObject, VideoBackingMethod {
    fileprivate var _videoTextureCache:CVOpenGLESTextureCache?
    fileprivate var _texture: CVOpenGLESTexture?
    
    var player:AVPlayer?
    var videoOutput:AVPlayerItemVideoOutput?
    var playerItem:AVPlayerItem?
    var loop = false;
    var SRC = "";
    
    func setSrc(_ src:String) {
        SRC = src;
        let split = src.components(separatedBy: ".");
        if let _ = Bundle.main.path(forResource: split[0], ofType: split[1], inDirectory: "www") {
            let videoURL = Bundle.main.url(forResource: split[0], withExtension: split[1], subdirectory: "www")
            let asset = AVURLAsset(url: videoURL!)
            
            let pixelBufferAttributes = [ kCVPixelBufferPixelFormatTypeKey as String : NSNumber(value: kCVPixelFormatType_32BGRA)]
            
            self.videoOutput = AVPlayerItemVideoOutput(pixelBufferAttributes: pixelBufferAttributes)
            self.playerItem = AVPlayerItem(asset: asset)
            self.playerItem?.add(self.videoOutput!)
            
            self.player = AVPlayer(playerItem: self.playerItem!)
            
            CVOpenGLESTextureCacheCreate(kCFAllocatorDefault, nil, GLSurface.glContext!, nil, &_videoTextureCache)
            
            NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: self.player?.currentItem, queue: nil, using: { (_) in
                if (self.loop) {
                    DispatchQueue.main.async {
                        self.player?.seek(to: kCMTimeZero)
                        self.player?.play()
                    }
                }
            });
            
            let interval = CMTime(seconds: 0.1,
                                  preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            let mainQueue = DispatchQueue.main
            player?.addPeriodicTimeObserver(forInterval: interval, queue: mainQueue) {
                [weak self] time in
                let duration = Float(CMTimeGetSeconds((self?.player?.currentItem?.duration)!))
                let currentTime = Float(CMTimeGetSeconds((self?.player?.currentTime())!))
                
                DispatchQueue.main.async {
                    let obj = JSValue.init(object: self!, in: JSCEngine.jsContext!)
                    let cb = obj?.objectForKeyedSubscript("_tick");
                    let _ = cb?.call(withArguments: [currentTime, duration])
                }
            }
            
        } else {
            print("!!!!! VIDEO " + src + " NOT FOUND");
            return;
        }
        
        VideoElementBackingList.push(self, src);
    }
    
    func play() {
        player?.play();
    }
    
    func pause() {
        player?.pause()
    }
    
    func setLoop(_ bool:Bool) {
        loop = bool;
    }
    
    func setTime(_ time: Double) {
        self.player?.seek(to: CMTime(seconds: time, preferredTimescale: CMTimeScale(1)))
    }
    
    func setVolume(_ volume: Double) {
        self.player?.volume = Float(volume);
    }
    
    func destroy() {
        VideoElementBackingList.remove(SRC);
    }
    
    func texImage2D(_ target: Int, _ level: Int, _ intfr: Int, _ format: Int, _ type: Int) {
        guard self.playerItem?.status == .readyToPlay else {
            return
        }
        
        let currentTime = self.playerItem?.currentTime()
        guard let pixelBuffer = self.videoOutput?.copyPixelBuffer(forItemTime: currentTime!, itemTimeForDisplay: nil) else {
            return
        }
        
        guard let videoTextureCache = _videoTextureCache else {
            print("No video texture cache")
            return
        }
        
        let err = CVOpenGLESTextureCacheCreateTextureFromImage(kCFAllocatorDefault,
                                                               videoTextureCache,
                                                               pixelBuffer,
                                                               nil,
                                                               GLenum(GL_TEXTURE_2D),
                                                               GL_RGBA,
                                                               GLsizei(CVPixelBufferGetWidthOfPlane(pixelBuffer, 0)),
                                                               GLsizei(CVPixelBufferGetHeightOfPlane(pixelBuffer, 0)),
                                                               GLenum(GL_BGRA),
                                                               GLenum(GL_UNSIGNED_BYTE),
                                                               0,
                                                               &_texture)
        
        glBindTexture(CVOpenGLESTextureGetTarget(_texture!), CVOpenGLESTextureGetName(_texture!))
        
        if err != 0 {
            NSLog("Error at CVOpenGLESTextureCacheCreateTextureFromImage \(err)");
        }
        
        if _texture != nil {
            _texture = nil
        }
        
        CVOpenGLESTextureCacheFlush(_videoTextureCache!, 0)
    }
    
    class func create() -> VideoElementBacking {
        return VideoElementBacking()
    }
}

class VideoElementBackingList {
    static var map = [String:VideoElementBacking]()
    
    class func push(_ v:VideoElementBacking, _ src:String) {
        VideoElementBackingList.map[src] = v;
    }
    
    class func get(_ src:String) -> VideoElementBacking {
        return VideoElementBackingList.map[src]!;
    }
    
    class func remove(_ src:String) {
        map.removeValue(forKey: src);
    }
}
