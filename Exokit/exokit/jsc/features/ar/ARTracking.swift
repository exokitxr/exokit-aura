import Foundation
import ARKit
import JavaScriptCore
import OpenGLES

class ARTracking : NSObject, ARSessionDelegate {
    fileprivate var _session:ARSession;
    fileprivate var _context = JSCEngine.jsContext
    fileprivate var _exokit:JSValue
    fileprivate var _rotation:[Double] = [0, 0, 0];
    fileprivate var _projectionMatrix:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    fileprivate var _transform:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    fileprivate var _anchorMatrix:[Double] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    fileprivate var _cameraBuffer:CVPixelBuffer?
    fileprivate var _videoTextureCache:CVOpenGLESTextureCache?
    
    private var _lumaTexture: CVOpenGLESTexture?
    private var _chromaTexture: CVOpenGLESTexture?
    
    static var needsClear = false;
    static var frame:ARFrame?
    
    static var STATE = "limited";
    
    init(_ session: ARSession) {
        _session = session;
        _exokit = (_context?.objectForKeyedSubscript("EXOKIT_AR"))!;
        super.init();
        initGL();
    }
    
    func float3ToDouble(origin: vector_float3, destination: inout [Double]) {
        destination[0] = Double(origin[0])
        destination[1] = Double(origin[1])
        destination[2] = Double(origin[2])
    }
    
    func matrixToDouble(origin: matrix_float4x4, destination: inout [Double]) {
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
    
    func update(_ frame: ARFrame) {
        if (!JSCEngine.active) {
            return;
        }
        
        ARTracking.frame = frame;
        
        var deviceOrientation = "";
        var projectionMatrix:matrix_float4x4;
        switch UIApplication.shared.statusBarOrientation {
        case .landscapeRight:
            deviceOrientation = "landscapeLeft";
            projectionMatrix = frame.camera.projectionMatrix(for: .landscapeLeft, viewportSize: UIScreen.main.bounds.size, zNear: 0.01, zFar: 200);
            break;
        case .landscapeLeft:
            deviceOrientation = "landscapeRight";
            projectionMatrix = frame.camera.projectionMatrix(for: .landscapeRight, viewportSize: UIScreen.main.bounds.size, zNear: 0.01, zFar: 200);
            break;
        case .portraitUpsideDown:
            deviceOrientation = "portraitUpsideDown";
            projectionMatrix = frame.camera.projectionMatrix(for: .portraitUpsideDown, viewportSize: UIScreen.main.bounds.size, zNear: 0.01, zFar: 200);
            break;
        default:
            deviceOrientation = "portrait";
            projectionMatrix = frame.camera.projectionMatrix(for: .portrait, viewportSize: UIScreen.main.bounds.size, zNear: 0.01, zFar: 200);
            break;
        }
        
        float3ToDouble(origin: frame.camera.eulerAngles, destination: &_rotation)
        matrixToDouble(origin: projectionMatrix, destination: &_projectionMatrix)
        matrixToDouble(origin: frame.camera.transform, destination: &_transform)
        
        let setRotation = _exokit.objectForKeyedSubscript("setRotation")!;
        setRotation.call(withArguments: [_rotation])
        
        let setProjectionMatrix = _exokit.objectForKeyedSubscript("setProjectionMatrix")!;
        setProjectionMatrix.call(withArguments: [_projectionMatrix])
        
        let setTransform = _exokit.objectForKeyedSubscript("setTransform")!;
        setTransform.call(withArguments: [_transform])
        
        let setLightIntensity = _exokit.objectForKeyedSubscript("setLightIntensity")!;
        setLightIntensity.call(withArguments: [frame.lightEstimate?.ambientIntensity ?? 1000])
        
        _cameraBuffer = frame.capturedImage;
        
        let orientation = _exokit.objectForKeyedSubscript("setTrackingOrientation")!
        orientation.call(withArguments: [deviceOrientation])
        
        let trackingState = _exokit.objectForKeyedSubscript("setTrackingState")!;
        var trackingStateString = "";
        switch (frame.camera.trackingState) {
        case .limited(.excessiveMotion): trackingStateString = "limited/motion"; break;
        case .limited: trackingStateString = "limited"; break;
        default: trackingStateString = "normal";
        }
        trackingState.call(withArguments: [trackingStateString])
        
        ARTracking.STATE = trackingStateString;
        
        for anchor in frame.anchors {
            matrixToDouble(origin: anchor.transform, destination: &_anchorMatrix)
            let updateAnchor = _exokit.objectForKeyedSubscript("updateAnchor");
            let _ = updateAnchor?.call(withArguments: [anchor.identifier.uuidString, _anchorMatrix])
        }
    }
    
    func addAnchors(_ anchors:[ARAnchor]) {
        for anchor in anchors {
            matrixToDouble(origin: anchor.transform, destination: &_anchorMatrix)
            let fn = _exokit.objectForKeyedSubscript("addAnchor");
            let _ = fn?.call(withArguments: [anchor.identifier.uuidString, _anchorMatrix])
        }
    }
    
    func removeAnchors(_ anchors:[ARAnchor]) {
        for anchor in anchors {
            matrixToDouble(origin: anchor.transform, destination: &_anchorMatrix)
            let fn = _exokit.objectForKeyedSubscript("removeAnchor");
            let _ = fn?.call(withArguments: [anchor.identifier.uuidString, _anchorMatrix])
        }
    }
    
    fileprivate func initGL() {
        CVOpenGLESTextureCacheCreate(kCFAllocatorDefault, nil, GLSurface.glContext!, nil, &_videoTextureCache)
    }
    
    func cleanUpTextures() {
        if _lumaTexture != nil {
            _lumaTexture = nil
        }
        
        if _chromaTexture != nil {
            _chromaTexture = nil
        }
        
        // Periodic texture cache flush every frame
        CVOpenGLESTextureCacheFlush(_videoTextureCache!, 0)
    }
    
    func uploadCameraTexture(_ name: String) {
        if (_cameraBuffer == nil) {
            return;
        }
        
        guard let videoTextureCache = _videoTextureCache else {
            print("No video texture cache")
            return
        }
        
        ARTracking.needsClear = true;
        
        if (name == "EXOKIT_LUMINANCE") {
            let err = CVOpenGLESTextureCacheCreateTextureFromImage(kCFAllocatorDefault,
                                                                   videoTextureCache,
                                                                   _cameraBuffer!,
                                                                   nil,
                                                                   GLenum(GL_TEXTURE_2D),
                                                                   GL_LUMINANCE,
                                                                   GLsizei(CVPixelBufferGetWidthOfPlane(_cameraBuffer!, 0)),
                                                                   GLsizei(CVPixelBufferGetHeightOfPlane(_cameraBuffer!, 0)),
                                                                   GLenum(GL_LUMINANCE),
                                                                   GLenum(GL_UNSIGNED_BYTE),
                                                                   0,
                                                                   &_lumaTexture)
            
            glBindTexture(CVOpenGLESTextureGetTarget(_lumaTexture!), CVOpenGLESTextureGetName(_lumaTexture!))
            
            if err != 0 {
                NSLog("Error at CVOpenGLESTextureCacheCreateTextureFromImage \(err)");
            }
            
        } else {
            let err = CVOpenGLESTextureCacheCreateTextureFromImage(kCFAllocatorDefault,
                                                                   videoTextureCache,
                                                                   _cameraBuffer!,
                                                                   nil,
                                                                   GLenum(GL_TEXTURE_2D),
                                                                   GL_LUMINANCE_ALPHA,
                                                                   GLsizei(CVPixelBufferGetWidthOfPlane(_cameraBuffer!, 1)),
                                                                   GLsizei(CVPixelBufferGetHeightOfPlane(_cameraBuffer!, 1)),
                                                                   GLenum(GL_LUMINANCE_ALPHA),
                                                                   GLenum(GL_UNSIGNED_BYTE),
                                                                   1,
                                                                   &_chromaTexture)
            if err != 0 {
                NSLog("Error at CVOpenGLESTextureCacheCreateTextureFromImage222 \(err)")
            }
            
            glBindTexture(CVOpenGLESTextureGetTarget(_chromaTexture!), CVOpenGLESTextureGetName(_chromaTexture!))
        }
    }
    
}
