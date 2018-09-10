import Foundation
import GLKit
import OpenGLES
import CoreGraphics
import JavaScriptCore

class GLSurface: GLKViewController {
    var context: EAGLContext?
    fileprivate var _gl: JSValue!
    fileprivate var _onDrawFrame:JSValue?
    fileprivate var _context:JSContext?
    static var glContext: EAGLContext?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.context = EAGLContext(api: .openGLES3)
        self.preferredFramesPerSecond = 60;
        if self.context == nil {
            print("Failed to create GL context")
        }
        
        self.view.isMultipleTouchEnabled = true
        
        GLSurface.glContext = self.context;
        
        EAGLContext.setCurrent(self.context)
        
        let view = self.view as! GLKView
        view.context = self.context!
        view.drawableDepthFormat = .format24
        view.frame = UIScreen.main.bounds
    }
    
    override func glkView(_ view: GLKView, drawIn rect: CGRect) {
        let size:Dictionary = ["width": Int(rect.width), "height": Int(rect.height)];
        let _ = _onDrawFrame?.call(withArguments: [size]);
        
//        WorkerBackingList.tick();
    }
    
    func setContext(context: JSContext) {
        _context = context;
        _gl = context.objectForKeyedSubscript("_gl");
        
        let exokit = context.objectForKeyedSubscript("EXOKIT");
        _onDrawFrame = exokit?.objectForKeyedSubscript("onDrawFrame");
        
        let _ = GLPropertyBindings(gl: _gl);
        
        bindBufferData();
        bindFunctions();
    }
    
    fileprivate func bindBufferData() {
        let ctx = _context?.jsGlobalContextRef;
        
        let bufferDataName = JSCUtils.StringToJSString("C_bufferData");
        let bufferData = JSObjectMakeFunctionWithCallback(ctx, bufferDataName, { ctx, functionObject, thisObject, argc, argv, exception in
            let target = JSValueToNumber(ctx, argv![0], nil);
            let usage = JSValueToNumber(ctx, argv![2], nil);
            let length = JSObjectGetTypedArrayByteLength(ctx, argv![1], nil);
            let ptr = JSObjectGetTypedArrayBytesPtr(ctx, argv![1], nil);
            
            glBufferData(GLenum(target), length, ptr, GLenum(usage));
            return JSValueMakeUndefined(ctx)
        });
        
        let bufferSubDataName = JSCUtils.StringToJSString("C_bufferSubData");
        let bufferSubData = JSObjectMakeFunctionWithCallback(ctx, bufferSubDataName, { ctx, functionObject, thisObject, argc, argv, exception in
            let target = JSValueToNumber(ctx, argv![0], nil);
            let offset = JSValueToNumber(ctx, argv![1], nil);
            let size = JSValueToNumber(ctx, argv![2], nil);
            let ptr = JSObjectGetTypedArrayBytesPtr(ctx, argv![3], nil);
            
            glBufferSubData(GLenum(target), GLintptr(offset), GLsizeiptr(size), ptr)
            return JSValueMakeUndefined(ctx)
        });
        
        JSObjectSetProperty(ctx, JSContextGetGlobalObject(ctx), bufferDataName, bufferData, JSPropertyAttributes(kJSPropertyAttributeNone), nil);
        JSObjectSetProperty(ctx, JSContextGetGlobalObject(ctx), bufferSubDataName, bufferSubData, JSPropertyAttributes(kJSPropertyAttributeNone), nil);
        JSStringRelease(bufferSubDataName);
        JSStringRelease(bufferDataName);
    }
    
    func BUFFER_OFFSET(_ i: Int) -> UnsafeRawPointer? {
        return UnsafeRawPointer(bitPattern: i)
    }
    
    fileprivate func bindFunctions() {
        _getImageDimensions()
        _texImage2DShort()
        _texImage2DLong()
        _bindBuffer()
        _bindFramebuffer()
        _bindRenderbuffer()
        _bindTexture()
        _uniform1i()
        _pixelStorei()
        viewport()
        activeTexture()
        attachShader()
        bindAttribLocation()
        blendColor()
        blendEquation()
        blendEquationSeparate()
        blendFunc()
        blendFuncSeparate()
        clearColor()
        clear()
        clearDepth()
        clearStencil()
        colorMask()
        compileShader()
        vertexAttrib1f()
        vertexAttrib1fv()
        vertexAttrib2f()
        vertexAttrib2fv()
        vertexAttrib3f()
        vertexAttrib3fv()
        vertexAttrib4f()
        vertexAttrib4fv()
        vertexAttribPointer()
        uniform1f()
        uniform1fv()
        uniform1iv()
        uniform2f()
        uniform2i()
        uniform2fv()
        uniform2iv()
        uniform3f()
        uniform3i()
        uniform3fv()
        uniform3iv()
        uniform4f()
        uniform4i()
        uniform4fv()
        uniform4iv()
        uniformMatrix2fv()
        uniformMatrix3fv()
        uniformMatrix4fv()
        stencilMaskSeparate()
        stencilMask()
        stencilOp()
        stencilOpSeparate()
        lineWidth()
        linkProgram()
        polygonOffset()
        readPixels()
        renderBufferStorage()
        sampleCoverage()
        scissor()
        shaderSource()
        isBuffer()
        isEnabled()
        isFramebuffer()
        isProgram()
        isRenderbuffer()
        isShader()
        isTexture()
        getVertexAttribOffset()
        getUniformLocation()
        getUniform()
        getTexParameter()
        getShaderSource()
        getShaderInfoLog()
        getShaderParameter()
        getRenderbufferParameter()
        getProgramInfoLog()
        getProgramParameter()
        getFramebufferAttachmentParameter()
        getError()
        createBuffer()
        createFrameBuffer()
        createRenderbuffer()
        createShader()
        createTexture()
        cullFace()
        deleteBuffer()
        deleteFramebuffer()
        deleteRenderbuffer()
        deleteProgram()
        deleteShader()
        deleteTexture()
        depthFunc()
        depthMask()
        depthRange()
        detachShader()
        disable()
        disableVertexAttribArray()
        drawArrays()
        drawArraysInstanced()
        drawElements()
        drawElementsInstanced()
        vertexAttribDivisor()
        enable()
        enableVertexAttribArray()
        finish()
        flush()
        framebufferRenderbuffer()
        framebufferTexture2D()
        frontFace()
        generateMipmap()
        useProgram()
        validateProgram()
        getSupportedExtensions()
        checkFramebufferStatus()
        getActiveAttrib()
        getActiveUniform()
        texSubImage2D()
        copyTexImage2D()
        texParameterf()
        texParameteri()
        getAttribLocation()
        getBufferParameter()
        _getParameter()
        createProgram()
        getUniformBlockIndex()
        uniformBlockBinding()
        bindBufferBase()
        createVertexArray()
        _bindVertexArray()
        deleteVertexArray()
        drawBuffers()
        _getString();
    }
    
    fileprivate func _getImageDimensions() {
        let fn: @convention(block) (String) -> NSArray = { path in
            if (path.contains("AURA_")) {
                return [1024, 444];
            } else {
                return Utils.getImageDimensions(path: path);
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_getImageDimensions" as NSString)
    }
    
    fileprivate func _texImage2DShort() {
        let fn: @convention(block) (Int, Int, Int, Int, Int, NSDictionary) -> Void = { target, level, intfr, format, type, img in
            let src =  img["_src"]! as! String
            if (src.contains("AURA_")) {
//                Aura.ar?.uploadCameraTexture(src)
            } else if (src.contains("mp4")) {
                VideoElementBackingList.get(src).texImage2D(target, level, intfr, format, type);
            } else {
                let (imageData, image) = Utils.getImageData(path: src);
                let data = CFDataGetBytePtr(imageData)!
                let width = UInt((image?.width)!)
                let height = UInt((image?.height)!)
                
                glTexImage2D(GLenum(target), GLint(level), GLint(intfr), GLsizei(width), GLsizei(height), 0, GLenum(format), GLenum(type), data)
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_texImage2DShort" as NSString)
    }
    
    fileprivate func getBytesPerPixel(type: Int, format: Int) -> Int {
        var bytesPerComponent = 0;
        switch (Int32(type)) {
        case GL_UNSIGNED_BYTE:
            bytesPerComponent = 1;
            break;
        case GL_FLOAT:
            bytesPerComponent = 4;
            break;
        case GL_HALF_FLOAT_OES:
            bytesPerComponent = 2;
            break;
        case GL_UNSIGNED_SHORT_5_6_5:
            return 2;
        case GL_UNSIGNED_SHORT_4_4_4_4:
            return 2;
        case GL_UNSIGNED_SHORT_5_5_5_1:
            return 2;
        default:
            bytesPerComponent = 0;
            break;
        }
        
        switch(Int32(format)) {
        case GL_LUMINANCE:
            return 1 * bytesPerComponent;
        case GL_ALPHA:
            return 1 * bytesPerComponent;
        case GL_LUMINANCE_ALPHA:
            return 1 * bytesPerComponent;
        case GL_RGB:
            return 3 * bytesPerComponent;
        case GL_RGBA:
            return 4 * bytesPerComponent;
        default:
            return 0;
        }
    }
    
    fileprivate func _texImage2DLong() {
        let fn: @convention(block) (Int, Int, Int, Int, Int, Int, Int, Int, NSDictionary) -> Void = { target, level, intfr, width, height, border, format, type, img in
            
            if (img["intArray"] != nil) {
                let array = img["intArray"]! as! [Double];
                glTexImage2D(GLenum(target), GLint(level), GLint(intfr), GLsizei(width), GLsizei(height), GLint(border), GLenum(format), GLenum(type), array.glIntArray)
            } else if (img["floatArray"] != nil) {
                let array = img["floatArray"]! as! [Double];
                glTexImage2D(GLenum(target), GLint(level), GLint(intfr), GLsizei(width), GLsizei(height), GLint(border), GLenum(format), GLenum(type), array.glFloatArray)
            } else {
                
                let src = img["_src"]! as! String
                if (src == "-1") {
                    let nulled = calloc(width * height, self.getBytesPerPixel(type: type, format: format));
                    glTexImage2D(GLenum(target), GLint(level), GLint(intfr), GLsizei(width), GLsizei(height), GLint(border), GLenum(format), GLenum(type), nulled)
                    free(nulled)
                } else {
                    let (imageData, _) = Utils.getImageData(path: src);
                    let data = CFDataGetBytePtr(imageData)!
                    
                    glTexImage2D(GLenum(target), GLint(level), GLint(intfr), GLsizei(width), GLsizei(height), GLint(border), GLenum(format), GLenum(type), data)
                }
                
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_texImage2DLong" as NSString)
    }
    
    fileprivate func _bindBuffer() {
        let fn: @convention(block) (Int, NSDictionary) -> Void = { target, buffer in
            let id = buffer["_id"] as! Int
            glBindBuffer(GLenum(target), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_bindBuffer" as NSString)
    }
    
    fileprivate func _bindFramebuffer() {
        let fn: @convention(block) (Int, NSDictionary) -> Void = { target, buffer in
            let id = buffer["_id"] as! Int
            glBindFramebuffer(GLenum(target), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_bindFramebuffer" as NSString)
    }
    
    fileprivate func _bindRenderbuffer() {
        let fn: @convention(block) (Int, NSDictionary) -> Void = { target, buffer in
            let id = buffer["_id"] as! Int
            glBindRenderbuffer(GLenum(target), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_bindRenderbuffer" as NSString)
    }
    
    fileprivate func _bindTexture() {
        let fn: @convention(block) (Int, NSDictionary) -> Void = { target, buffer in
            let id = buffer["_id"] as! Int
            glBindTexture(GLenum(target), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_bindTexture" as NSString)
    }
    
    fileprivate func _uniform1i() {
        let fn: @convention(block) (Int, Int) -> Void = { location, x in
            glUniform1i(GLint(location), GLint(x))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_uniform1i" as NSString)
    }
    
    fileprivate func _pixelStorei() {
        let fn: @convention(block) (Int, Int) -> Void = { pname, param in
            glPixelStorei(GLenum(pname), GLint(param))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_pixelStorei" as NSString)
    }
    
    fileprivate func viewport() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { x, y, width, height in
            glViewport(GLint(x), GLint(y), GLsizei(width), GLsizei(height))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "viewport" as NSString)
    }
    
    fileprivate func activeTexture() {
        let fn: @convention(block) (Int) -> Void = { texture in
            glActiveTexture(GLenum(texture))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "activeTexture" as NSString)
    }
    
    fileprivate func attachShader() {
        let fn: @convention(block) (NSDictionary, Int) -> Void = { program, shader in
            let pid = program["_id"]! as! Int;
            glAttachShader(GLuint(pid), GLuint(shader));
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "attachShader" as NSString)
    }
    
    fileprivate func bindAttribLocation() {
        let fn: @convention(block) (NSDictionary, Int, String) -> Void = { program, index, name in
            let pid = program["_id"]! as! Int;
            glBindAttribLocation(GLuint(pid), GLuint(index), name)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "bindAttribLocation" as NSString)
    }
    
    fileprivate func blendColor() {
        let fn: @convention(block) (Double, Double, Double, Double) -> Void = { r, g, b, a in
            glBlendColor(GLfloat(r), GLfloat(g), GLfloat(b), GLfloat(a))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "blendColor" as NSString)
    }
    
    fileprivate func blendEquation() {
        let fn: @convention(block) (Int) -> Void = { mode in
            glBlendEquation(GLenum(mode))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "blendEquation" as NSString)
    }
    
    fileprivate func blendEquationSeparate() {
        let fn: @convention(block) (Int, Int) -> Void = { mode, alpha in
            glBlendEquationSeparate(GLenum(mode), GLenum(alpha))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "blendEquationSeparate" as NSString)
    }
    
    fileprivate func blendFunc() {
        let fn: @convention(block) (Int, Int) -> Void = { sf, df in
            glBlendFunc(GLenum(sf), GLenum(df))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "blendFunc" as NSString)
    }
    
    fileprivate func blendFuncSeparate() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { srcRGB, dstRGB, srcAlpha, dstAlpha in
            glBlendFuncSeparate(GLenum(srcRGB), GLenum(dstRGB), GLenum(srcAlpha), GLenum(dstAlpha))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "blendFuncSeparate" as NSString)
    }
    
    fileprivate func clearColor() {
        let fn: @convention(block) (Double, Double, Double, Double) -> Void = { r, g, b, a in
            glClearColor(GLfloat(r), GLfloat(g), GLfloat(b), GLfloat(a));
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "clearColor" as NSString)
    }
    
    fileprivate func clear() {
        let fn: @convention(block) (Int) -> Void = { mask in
            glClear(GLbitfield(mask));
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "clear" as NSString)
    }
    
    fileprivate func clearDepth() {
        let fn: @convention(block) (Double) -> Void = { depth in
            glClearDepthf(GLclampf(depth))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "clearDepth" as NSString)
    }
    
    fileprivate func clearStencil() {
        let fn: @convention(block) (Int) -> Void = { s in
            glClearStencil(GLint(s))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "clearStencil" as NSString)
    }
    
    fileprivate func colorMask() {
        let fn: @convention(block) (Bool, Bool, Bool, Bool) -> Void = { r, g, b, a in
            let red = r ? GL_TRUE : GL_FALSE;
            let green = g ? GL_TRUE : GL_FALSE;
            let blue = b ? GL_TRUE : GL_FALSE;
            let alpha = a ? GL_TRUE : GL_FALSE  ;
            glColorMask(GLboolean(red), GLboolean(green), GLboolean(blue), GLboolean(alpha))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "colorMask" as NSString)
    }
    
    fileprivate func compileShader() {
        let fn: @convention(block) (Int) -> Void = { shader in
            glCompileShader(GLuint(shader))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "compileShader" as NSString)
    }
    
    fileprivate func vertexAttrib1f() {
        let fn: @convention(block) (Int, Double) -> Void = { index, x in
            glVertexAttrib1f(GLuint(index), GLfloat(x))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib1f" as NSString)
    }
    
    fileprivate func vertexAttrib1fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glVertexAttrib1fv(GLuint(index), x.glFloatArray)
        }
        
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib1fv" as NSString)
    }
    
    fileprivate func vertexAttrib2f() {
        let fn: @convention(block) (Int, Double, Double) -> Void = { index, x, y in
            glVertexAttrib2f(GLuint(index), GLfloat(x), GLfloat(y))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib2f" as NSString)
    }
    
    fileprivate func vertexAttrib2fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glVertexAttrib2fv(GLuint(index), x.glFloatArray)
        }
        
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib2fv" as NSString)
    }
    
    fileprivate func vertexAttrib3f() {
        let fn: @convention(block) (Int, Double, Double, Double) -> Void = { index, x, y, z in
            glVertexAttrib3f(GLuint(index), GLfloat(x), GLfloat(y), GLfloat(z))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib3f" as NSString)
    }
    
    fileprivate func vertexAttrib3fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glVertexAttrib3fv(GLuint(index), x.glFloatArray)
        }
        
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib3fv" as NSString)
    }
    
    fileprivate func vertexAttrib4f() {
        let fn: @convention(block) (Int, Double, Double, Double, Double) -> Void = { index, x, y, z, w in
            glVertexAttrib4f(GLuint(index), GLfloat(x), GLfloat(y), GLfloat(z), GLfloat(w))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib4f" as NSString)
    }
    
    fileprivate func vertexAttrib4fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glVertexAttrib4fv(GLuint(index), x.glFloatArray)
        }
        
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttrib4fv" as NSString)
    }
    
    fileprivate func vertexAttribPointer() {
        let fn: @convention(block) (Int, Int, Int, Bool, Int, Int) -> Void = { index, size, type, normalized, stride, offset in
            let normal = normalized ? GL_TRUE : GL_FALSE;
            glVertexAttribPointer(GLuint(index), GLint(size), GLenum(type), GLboolean(normal), GLsizei(stride), self.BUFFER_OFFSET(offset))
        }
        
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttribPointer" as NSString)
    }
    
    fileprivate func uniform1f() {
        let fn: @convention(block) (Int, Double) -> Void = { index, x in
            glUniform1f(GLint(index), GLfloat(x))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform1f" as NSString)
    }
    
    fileprivate func uniform1fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform1fv(GLint(index), GLsizei(1), x.glFloatArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform1fv" as NSString)
    }
    
    fileprivate func uniform1iv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform1iv(GLint(index), GLsizei(1), x.glIntArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform1iv" as NSString)
    }
    
    fileprivate func uniform2f() {
        let fn: @convention(block) (Int, Double, Double) -> Void = { index, x, y in
            glUniform2f(GLint(index), GLfloat(x), GLfloat(y))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform2f" as NSString)
    }
    
    fileprivate func uniform2i() {
        let fn: @convention(block) (Int, Int, Int) -> Void = { index, x, y in
            glUniform2i(GLint(index), GLint(x), GLint(y))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform2i" as NSString)
    }
    
    fileprivate func uniform2fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform2fv(GLint(index), GLsizei(1), x.glFloatArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform2fv" as NSString)
    }
    
    fileprivate func uniform2iv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform2iv(GLint(index), GLsizei(1), x.glIntArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform2iv" as NSString)
    }
    
    fileprivate func uniform3f() {
        let fn: @convention(block) (Int, Double, Double, Double) -> Void = { index, x, y, z in
            glUniform3f(GLint(index), GLfloat(x), GLfloat(y), GLfloat(z))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform3f" as NSString)
    }
    
    fileprivate func uniform3i() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { index, x, y, z in
            glUniform3i(GLint(index), GLint(x), GLint(y), GLint(z))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform3i" as NSString)
    }
    
    fileprivate func uniform3fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform3fv(GLint(index), GLsizei(1), x.glFloatArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform3fv" as NSString)
    }
    
    fileprivate func uniform3iv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform3iv(GLint(index), GLsizei(1), x.glIntArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform3iv" as NSString)
    }
    
    fileprivate func uniform4f() {
        let fn: @convention(block) (Int, Double, Double, Double, Double) -> Void = { index, x, y, z, w in
            glUniform4f(GLint(index), GLfloat(x), GLfloat(y), GLfloat(z), GLfloat(w))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform4f" as NSString)
    }
    
    fileprivate func uniform4i() {
        let fn: @convention(block) (Int, Int, Int, Int, Int) -> Void = { index, x, y, z, w in
            glUniform4i(GLint(index), GLint(x), GLint(y), GLint(z), GLint(w))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform4i" as NSString)
    }
    
    fileprivate func uniform4fv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform4fv(GLint(index), 1, x.glFloatArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform4fv" as NSString)
    }
    
    fileprivate func uniform4iv() {
        let fn: @convention(block) (Int, [Double]) -> Void = { index, x in
            glUniform4iv(GLint(index), 1, x.glIntArray)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniform4iv" as NSString)
    }
    
    fileprivate func uniformMatrix2fv() {
        let fn: @convention(block) (Int, Bool, [Double]) -> Void = { location, transpose, array in
            let trans = transpose ? GL_TRUE : GL_FALSE;
            glUniformMatrix2fv(GLint(location), 1, GLboolean(trans), array.toFloat)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniformMatrix2fv" as NSString)
    }
    
    fileprivate func uniformMatrix3fv() {
        let fn: @convention(block) (Int, Bool, [Double]) -> Void = { location, transpose, array in
            let trans = transpose ? GL_TRUE : GL_FALSE;
            glUniformMatrix3fv(GLint(location), 1, GLboolean(trans), array.toFloat)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniformMatrix3fv" as NSString)
    }
    
    fileprivate func uniformMatrix4fv() {
        let fn: @convention(block) (Int, Bool, [Double]) -> Void = { location, transpose, array in
            let trans = transpose ? GL_TRUE : GL_FALSE;
            glUniformMatrix4fv(GLint(location), 1, GLboolean(trans), array.toFloat)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniformMatrix4fv" as NSString)
    }
    
    fileprivate func stencilMaskSeparate() {
        let fn: @convention(block) (Int, Int) -> Void = { face, mask in
            glStencilMaskSeparate(GLenum(face), GLuint(mask))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "stencilMaskSeparate" as NSString)
    }
    
    fileprivate func stencilMask() {
        let fn: @convention(block) (Int) -> Void = { mask in
            glStencilMask(GLuint(mask))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "stencilMask" as NSString)
    }
    
    fileprivate func stencilOp() {
        let fn: @convention(block) (Int, Int, Int) -> Void = { fail, zfail, zpass in
            glStencilOp(GLenum(fail), GLenum(zfail), GLenum(zpass))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "stencilOp" as NSString)
    }
    
    fileprivate func stencilOpSeparate() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { face, fail, zfail, zpass in
            glStencilOpSeparate(GLenum(face), GLenum(fail), GLenum(zfail), GLenum(zpass))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "stencilOpSeparate" as NSString)
    }
    
    fileprivate func lineWidth() {
        let fn: @convention(block) (Double) -> Void = { width in
            glLineWidth(GLfloat(width))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "lineWidth" as NSString)
    }
    
    fileprivate func linkProgram() {
        let fn: @convention(block) (NSDictionary) -> Void = { program in
            let pid = program["_id"]! as! Int
            glLinkProgram(GLuint(pid))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "linkProgram" as NSString)
    }
    
    fileprivate func polygonOffset() {
        let fn: @convention(block) (Double, Double) -> Void = { factor, units in
            glPolygonOffset(GLfloat(factor), GLfloat(units))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "polygonOffset" as NSString)
    }
    
    fileprivate func readPixels() {
        let fn: @convention(block) (Int, Int, Int, Int, Int, Int, [Double]) -> Void = { x, y, width, height, format, type, array in
            print("GL::readPixels not supported");
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "readPixels" as NSString)
    }
    
    fileprivate func renderBufferStorage() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { target, format, width, height in
            glRenderbufferStorage(GLenum(target), GLenum(format), GLsizei(width), GLsizei(height))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "renderbufferStorage" as NSString)
    }
    
    fileprivate func sampleCoverage() {
        let fn: @convention(block) (Double, Bool) -> Void = { value, invert in
            let inv = invert ? GL_TRUE : GL_FALSE;
            glSampleCoverage(GLclampf(value), GLboolean(inv))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "sampleCoverage" as NSString)
    }
    
    fileprivate func scissor() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { x, y, width, height in
            glScissor(GLint(x), GLint(y), GLsizei(width), GLsizei(height))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "scissor" as NSString)
    }
    
    fileprivate func shaderSource() {
        let fn: @convention(block) (Int, String) -> Void = { shader, source in
            let cSource = source.cString(using: String.Encoding.ascii)
            var glcSource = UnsafePointer<GLchar>?(cSource!)
            var length = GLint(source.count)
            glShaderSource(GLuint(shader), GLsizei(1), &glcSource, &length)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "shaderSource" as NSString)
    }
    
    fileprivate func isBuffer() {
        let fn: @convention(block) (NSDictionary) -> Bool = { buffer in
            let id = buffer["_id"] as! Int
            let glBool = glIsBuffer(GLuint(id))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isBuffer" as NSString)
    }
    
    fileprivate func isEnabled() {
        let fn: @convention(block) (Int) -> Bool = { cap in
            let glBool = glIsEnabled(GLenum(cap))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isEnabled" as NSString)
    }
    
    fileprivate func isFramebuffer() {
        let fn: @convention(block) (NSDictionary) -> Bool = { fb in
            let id = fb["_id"] as! Int
            let glBool = glIsFramebuffer(GLuint(id))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isFramebuffer" as NSString)
    }
    
    fileprivate func isProgram() {
        let fn: @convention(block) (NSDictionary) -> Bool = { program in
            let pid = program["_id"]! as! Int
            let glBool = glIsProgram(GLuint(pid))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isProgram" as NSString)
    }
    
    fileprivate func isRenderbuffer() {
        let fn: @convention(block) (NSDictionary) -> Bool = { rb in
            let id = rb["_id"] as! Int
            let glBool = glIsRenderbuffer(GLuint(id))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isRenderbuffer" as NSString)
    }
    
    fileprivate func isShader() {
        let fn: @convention(block) (Int) -> Bool = { shader in
            let glBool = glIsShader(GLuint(shader))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isShader" as NSString)
    }
    
    fileprivate func isTexture() {
        let fn: @convention(block) (Int) -> Bool = { texture in
            let glBool = glIsTexture(GLuint(texture))
            if (glBool == GL_TRUE) {
                return true;
            } else {
                return false;
            }
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "isTexture" as NSString)
    }
    
    fileprivate func getVertexAttribOffset() {
        let fn: @convention(block) (Int, Int) -> Void = { index, pname in
            print("GL:::getVertexAttribOffset is not supported");
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getVertexAttribOffset" as NSString)
    }
    
    fileprivate func getUniformLocation() {
        let fn: @convention(block) (NSDictionary, String) -> Int = { program, name in
            let pid = program["_id"]! as! Int
            let tmp = glGetUniformLocation(GLuint(pid), name.cString(using: String.Encoding.utf8)!)
            return Int(tmp);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getUniformLocation" as NSString)
    }
    
    fileprivate func getUniform() {
        let fn: @convention(block) (NSDictionary, Int) -> Void = { program, location in
            print("GL:::getUniform is not supported");
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getUniform" as NSString)
    }
    
    fileprivate func getTexParameter() {
        let fn: @convention(block) (Int, Int) -> Int = { target, pname in
            var params = GLint()
            glGetTexParameteriv(GLenum(target), GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getTexParameter" as NSString)
    }
    
    fileprivate func getShaderSource() {
        let fn: @convention(block) (Int) -> String = { shader in
            var glchar = [GLchar](repeating: 0, count: 512)
            glGetShaderSource(GLuint(shader), 512, nil, &glchar)
            return String(cString: glchar);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getShaderSource" as NSString)
    }
    
    fileprivate func getShaderInfoLog() {
        let fn: @convention(block) (Int) -> String = { shader in
            var glchar = [GLchar](repeating: 0, count: 512)
            glGetShaderInfoLog(GLuint(shader), 512, nil, &glchar)
            return String(cString: glchar);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getShaderInfoLog" as NSString)
    }
    
    fileprivate func getShaderParameter() {
        let fn: @convention(block) (Int, Int) -> Int = { shader, pname in
            var params = GLint()
            glGetShaderiv(GLuint(shader), GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getShaderParameter" as NSString)
    }
    
    fileprivate func getRenderbufferParameter() {
        let fn: @convention(block) (Int, Int) -> Int = { target, pname in
            var params = GLint()
            glGetRenderbufferParameteriv(GLenum(target), GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getRenderbufferParameter" as NSString)
    }
    
    fileprivate func getProgramInfoLog() {
        let fn: @convention(block) (NSDictionary) -> String = { program in
            let pid = program["_id"]! as! Int
            var glchar = [GLchar](repeating: 0, count: 512)
            glGetProgramInfoLog(GLuint(pid), 512, nil, &glchar)
            return String(cString: glchar);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getProgramInfoLog" as NSString)
    }
    
    fileprivate func getProgramParameter() {
        let fn: @convention(block) (NSDictionary, Int) -> Int = { program, pname in
            let pid = program["_id"]! as! Int
            var en = GLint(-1)
            glGetProgramiv(GLuint(pid), GLenum(pname), &en)
            return Int(en);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getProgramParameter" as NSString)
    }
    
    fileprivate func getFramebufferAttachmentParameter() {
        let fn: @convention(block) (Int, Int, Int) -> Int = { target, attachment, pname in
            var params = GLint()
            glGetFramebufferAttachmentParameteriv(GLenum(target), GLenum(attachment), GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getFramebufferAttachmentParameter" as NSString)
    }
    
    fileprivate func getError() {
        let fn: @convention(block) () -> Int = {
            return Int(glGetError())
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getError" as NSString)
    }
    
    fileprivate func createBuffer() {
        let fn: @convention(block) () -> NSDictionary = {
            var params = GLuint()
            glGenBuffers(GLsizei(1), &params)
            let value = Int(params)
            let obj:NSDictionary = ["_id": value]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createBuffer" as NSString)
    }
    
    fileprivate func createFrameBuffer() {
        let fn: @convention(block) () -> NSDictionary = {
            var params = GLuint()
            glGenFramebuffers(GLsizei(1), &params)
            let value = Int(params)
            let obj:NSDictionary = ["_id": value]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createFramebuffer" as NSString)
    }
    
    fileprivate func createRenderbuffer() {
        let fn: @convention(block) () -> NSDictionary = {
            var params = GLuint()
            glGenRenderbuffers(GLsizei(1), &params)
            let value = Int(params)
            let obj:NSDictionary = ["_id": value]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createRenderbuffer" as NSString)
    }
    
    fileprivate func createShader() {
        let fn: @convention(block) (Int) -> Int = { type in
            let shader = Int(glCreateShader(GLenum(type)))
            return shader;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createShader" as NSString)
    }
    
    fileprivate func createTexture() {
        let fn: @convention(block) () -> NSDictionary = {
            var params = GLuint()
            glGenTextures(GLsizei(1), &params)
            let value = Int(params)
            let obj:NSDictionary = ["_id": value]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createTexture" as NSString)
    }
    
    fileprivate func cullFace() {
        let fn: @convention(block) (Int) -> Void = { mode in
            glCullFace(GLenum(mode))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "cullFace" as NSString)
    }
    
    fileprivate func deleteBuffer() {
        let fn: @convention(block) (NSDictionary) -> Void = { buffer in
            let id = buffer["_id"] as! Int
            var params = GLuint(id)
            glDeleteBuffers(GLsizei(1), &params)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteBuffer" as NSString)
    }
    
    fileprivate func deleteFramebuffer() {
        let fn: @convention(block) (NSDictionary) -> Void = { buffer in
            let id = buffer["_id"] as! Int
            var params = GLuint(id)
            glDeleteFramebuffers(GLsizei(1), &params)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteFramebuffer" as NSString)
    }
    
    fileprivate func deleteRenderbuffer() {
        let fn: @convention(block) (NSDictionary) -> Void = { buffer in
            let id = buffer["_id"] as! Int
            var params = GLuint(id)
            glDeleteRenderbuffers(GLsizei(1), &params)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteRenderbuffer" as NSString)
    }
    
    fileprivate func deleteProgram() {
        let fn: @convention(block) (NSDictionary) -> Void = { program in
            let pid = program["_id"]! as! Int
            glDeleteProgram(GLuint(pid))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteProgram" as NSString)
    }
    
    fileprivate func deleteShader() {
        let fn: @convention(block) (Int) -> Void = { shader in
            glDeleteShader(GLuint(shader))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteShader" as NSString)
    }
    
    fileprivate func deleteTexture() {
        let fn: @convention(block) (NSDictionary) -> Void = { buffer in
            let pid = buffer["_id"]! as! Int
            var params = GLuint(pid)
            glDeleteTextures(GLsizei(1), &params)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteTexture" as NSString)
    }
    
    fileprivate func depthFunc() {
        let fn: @convention(block) (Int) -> Void = { fnc in
            glDepthFunc(GLenum(fnc))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "depthFunc" as NSString)
    }
    
    fileprivate func depthMask() {
        let fn: @convention(block) (Bool) -> Void = { mask in
            let glbool = mask ? GL_TRUE : GL_FALSE
            glDepthMask(GLboolean(glbool))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "depthMask" as NSString)
    }
    
    fileprivate func depthRange() {
        let fn: @convention(block) (Double, Double) -> Void = { near, far in
            glDepthRangef(GLclampf(near), GLclampf(far))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "depthRange" as NSString)
    }
    
    fileprivate func detachShader() {
        let fn: @convention(block) (NSDictionary, Int) -> Void = { program, shader in
            let pid = program["_id"]! as! Int
            glDetachShader(GLuint(pid), GLuint(shader))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "detachShader" as NSString)
    }
    
    fileprivate func disable() {
        let fn: @convention(block) (Int) -> Void = { cap in
            glDisable(GLenum(cap))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "disable" as NSString)
    }
    
    fileprivate func disableVertexAttribArray() {
        let fn: @convention(block) (Int) -> Void = { index in
            glDisableVertexAttribArray(GLuint(index))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "disableVertexAttribArray" as NSString)
    }
    
    fileprivate func drawArrays() {
        let fn: @convention(block) (Int, Int, Int) -> Void = { mode, first, count in
            glDrawArrays(GLenum(mode), GLint(first), GLsizei(count))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "drawArrays" as NSString)
    }
    
    fileprivate func drawArraysInstanced() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { i, i1, i2, i3 in
            glDrawArraysInstanced(GLenum(i), GLint(i1), GLsizei(i2), GLsizei(i3))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "drawArraysInstanced" as NSString)
    }
    
    fileprivate func drawElements() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { mode, count, type, offset in
            glDrawElements(GLenum(mode), GLsizei(count), GLenum(type), nil)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "drawElements" as NSString)
    }
    
    fileprivate func drawElementsInstanced() {
        let fn: @convention(block) (Int, Int, Int, Int) -> Void = { i, i1, i2, i3 in
            glDrawElementsInstanced(GLenum(i), GLsizei(i1), GLenum(i2), nil, GLsizei(i3))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "drawElementsInstanced" as NSString)
    }
    
    fileprivate func vertexAttribDivisor() {
        let fn: @convention(block) (Int, Int) -> Void = { i, i1 in
            glVertexAttribDivisor(GLuint(i), GLuint(i1))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "vertexAttribDivisor" as NSString)
    }
    
    fileprivate func enable() {
        let fn: @convention(block) (Int) -> Void = { cap in
            glEnable(GLenum(cap))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "enable" as NSString)
    }
    
    fileprivate func enableVertexAttribArray() {
        let fn: @convention(block) (Int) -> Void = { cap in
            glEnableVertexAttribArray(GLuint(cap))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "enableVertexAttribArray" as NSString)
    }
    
    fileprivate func finish() {
        let fn: @convention(block) () -> Void = {
            glFinish()
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "finish" as NSString)
    }
    
    fileprivate func flush() {
        let fn: @convention(block) () -> Void = {
            glFlush()
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "flush" as NSString)
    }
    
    fileprivate func framebufferRenderbuffer() {
        let fn: @convention(block) (Int, Int, Int, NSDictionary) -> Void = { target, attach, rbtrgt, rb in
            let id = rb["_id"] as! Int
            glFramebufferRenderbuffer(GLenum(target), GLenum(attach), GLenum(rbtrgt), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "framebufferRenderbuffer" as NSString)
    }
    
    fileprivate func framebufferTexture2D() {
        let fn: @convention(block) (Int, Int, Int, NSDictionary, Int) -> Void = { target, attach, textrgt, tex, level in
            let id = tex["_id"] as! Int
            glFramebufferTexture2D(GLenum(target), GLenum(attach), GLenum(textrgt), GLenum(id), GLint(level))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "framebufferTexture2D" as NSString)
    }
    
    fileprivate func frontFace() {
        let fn: @convention(block) (Int) -> Void = { mode in
            glFrontFace(GLenum(mode))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "frontFace" as NSString)
    }
    
    fileprivate func generateMipmap() {
        let fn: @convention(block) (Int) -> Void = { target in
            glGenerateMipmap(GLenum(target))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "generateMipmap" as NSString)
    }
    
    fileprivate func useProgram() {
        let fn: @convention(block) (NSDictionary) -> Void = { program in
            let pid = program["_id"]! as! Int
            glUseProgram(GLuint(pid))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "useProgram" as NSString)
    }
    
    fileprivate func validateProgram() {
        let fn: @convention(block) (NSDictionary) -> Void = { program in
            let pid = program["_id"]! as! Int
            glValidateProgram(GLuint(pid))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "validateProgram" as NSString)
    }
    
    fileprivate func getSupportedExtensions() {
        let fn: @convention(block) () -> String = {
            let ext = glGetString(GLenum(GL_EXTENSIONS));
            return String(cString: ext!)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getSupportedExtensions" as NSString)
    }
    
    fileprivate func checkFramebufferStatus() {
        let fn: @convention(block) (Int) -> Int = { target in
            return Int(glCheckFramebufferStatus(GLenum(target)))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "checkFramebufferStatus" as NSString)
    }
    
    fileprivate func getActiveAttrib() {
        let fn: @convention(block) (NSDictionary, Int) -> NSDictionary = { program, index in
            let pid = program["_id"]! as! Int
            
            var length = GLsizei()
            var size = GLint()
            var type = GLenum()
            var name = [GLchar](repeating: 0, count: 1024)
            
            glGetActiveAttrib(GLuint(pid), GLuint(index), 1024, &length, &size, &type, &name)
            
            let obj:NSDictionary = [
                "size": Int(size),
                "type": Int(type),
                "name": String(cString: name)
            ]
            
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getActiveAttrib" as NSString)
    }
    
    fileprivate func getActiveUniform() {
        let fn: @convention(block) (NSDictionary, Int) -> NSDictionary = { program, index in
            let pid = program["_id"]! as! Int
            
            var length = GLsizei()
            var size = GLint()
            var type = GLenum()
            var name = [GLchar](repeating: 0, count: 1024)
            
            glGetActiveUniform(GLuint(pid), GLuint(index), 1024, &length, &size, &type, &name)
            
            let obj:NSDictionary = [
                "size": Int(size),
                "type": Int(type),
                "name": String(cString: name)
            ]
            
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getActiveUniform" as NSString)
    }
    
    fileprivate func texSubImage2D() {
        let fn: @convention(block) (Int, Int, Int, Int, Int, Int, Int, Int, NSDictionary) -> Void = { target, level, xoffset, yoffset, width, height, format, type, img in
            let (imageData, _) = Utils.getImageData(path: img["_src"]! as! String);
            let data = CFDataGetBytePtr(imageData)!
            
            glTexSubImage2D(GLenum(target), GLint(level), GLint(xoffset), GLint(yoffset), GLsizei(width), GLsizei(height), GLenum(format), GLenum(type), data)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "texSubImage2D" as NSString)
    }
    
    fileprivate func copyTexImage2D() {
        let fn: @convention(block) (Int, Int, Int, Int, Int, Int, Int, Int) -> Void = { target, level, intf, x, y, width, height, border in
            glCopyTexImage2D(GLenum(target), GLint(level), GLenum(intf), GLint(x), GLint(y), GLsizei(width), GLsizei(height), GLint(border))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "copyTexImage2D" as NSString)
    }
    
    fileprivate func texParameterf() {
        let fn: @convention(block) (Int, Int, Double) -> Void = { target, pname, param in
            glTexParameterf(GLenum(target), GLenum(pname), GLfloat(param))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "texParameterf" as NSString)
    }
    
    fileprivate func texParameteri() {
        let fn: @convention(block) (Int, Int, Int) -> Void = { target, pname, param in
            glTexParameteri(GLenum(target), GLenum(pname), GLint(param))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "texParameteri" as NSString)
    }
    
    fileprivate func getAttribLocation() {
        let fn: @convention(block) (NSDictionary, String) -> Int = { program, name in
            let pid = program["_id"]! as! Int
            return Int(glGetAttribLocation(GLuint(pid), name.cString(using: String.Encoding.utf8)!))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getAttribLocation" as NSString)
    }
    
    fileprivate func getBufferParameter() {
        let fn: @convention(block) (Int, Int) -> Int = { target, pname in
            var params = GLint()
            glGetBufferParameteriv(GLenum(target), GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getBufferParameter" as NSString)
    }
    
    fileprivate func _getParameter() {
        let fn: @convention(block) (Int) -> Int = { pname in
            var params = GLint()
            glGetIntegerv(GLenum(pname), &params)
            let value = Int(params)
            return value;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_getParameter" as NSString)
    }
    
    fileprivate func createProgram() {
        let fn: @convention(block) () -> NSDictionary = {
            let id = Int(glCreateProgram());
            let obj:NSDictionary = ["_id": id]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createProgram" as NSString)
    }
    
    fileprivate func getUniformBlockIndex() {
        let fn: @convention(block) (NSDictionary, String) -> Int = { program, name in
            let pid = program["_id"]! as! Int
            let tmp = glGetUniformBlockIndex(GLuint(pid), name.cString(using: String.Encoding.utf8)!)
            return Int(tmp);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "getUniformBlockIndex" as NSString)
    }
    
    fileprivate func uniformBlockBinding() {
        let fn: @convention(block) (NSDictionary, Int, Int) -> Void = { program, loc0, loc1 in
            let pid = program["_id"]! as! Int
            glUniformBlockBinding(GLuint(pid), GLuint(loc0), GLuint(loc1))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "uniformBlockBinding" as NSString)
    }
    
    fileprivate func bindBufferBase() {
        let fn: @convention(block) (Int, Int, NSDictionary) -> Void = { target, index, obj in
            let id = obj["_id"] as! Int
            glBindBufferBase(GLenum(target), GLuint(index), GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "bindBufferBase" as NSString)
    }
    
    fileprivate func createVertexArray() {
        let fn: @convention(block) () -> NSDictionary = {
            var params = GLuint()
            glGenVertexArrays(GLsizei(1), &params)
            let value = Int(params)
            let obj:NSDictionary = ["_id": value]
            return obj;
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "createVertexArray" as NSString)
    }
    
    fileprivate func _bindVertexArray() {
        let fn: @convention(block) (NSDictionary) -> Void = { obj in
            let id = obj["_id"]! as! Int
            glBindVertexArray(GLuint(id))
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_bindVertexArray" as NSString)
    }
    
    fileprivate func deleteVertexArray() {
        let fn: @convention(block) (NSDictionary) -> Void = { obj in
            let id = obj["_id"] as! Int
            var params = GLuint(id)
            glDeleteVertexArrays(GLsizei(1), &params)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "deleteVertexArray" as NSString)
    }
    
    fileprivate func drawBuffers() {
        let fn: @convention(block) (NSArray) -> Void = { array in
            let count = array.count;
            var enums:[GLenum] = [];
            for value in array {
                enums.append(GLenum(value as! Int))
            }
            
            glDrawBuffers(GLsizei(count), enums);
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "drawBuffers" as NSString)
    }
    
    fileprivate func _getString() {
        let fn: @convention(block) (Int) -> String = { param in
            var extensions = glGetString(GLenum(param))
                as UnsafePointer<UInt8>
            var array : [Int8] = []
            
            while (extensions[0] != UInt8(ascii:"\0")){
                array.append(Int8(extensions[0]))
                extensions = extensions.advanced(by: 1)
            }
            
            array.append(Int8(0))
            return String.init(cString: array)
        }
        _gl.setObject(unsafeBitCast(fn, to: AnyObject.self), forKeyedSubscript: "_getString" as NSString)
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
        
//        if (self.auraPause == false) {
//            JSCEngine.inst.touchStart(str);
//        }
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
        
//        if (self.auraPause == false) {
//            JSCEngine.inst.touchMove(str);
//        }
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
        
//        if (self.auraPause == false) {
//            JSCEngine.inst.touchEnd(str);
//        }
    }
    
}


