const xr = require('./index');
const {FBO, Matrix4} = require('exokitgl');

class XR {
    requestDevice(name) {
        return Promise.resolve(new XRDevice());
    }
}

class XRDevice {
    supportsSession() {
        return Promise.resolve(null);
    }

    requestSession({requestAR}) {
        if (!requestAR) throw 'XR :: Can only use type requestAR';
        let session = new XRSession({device: this});
    }
}

class XRSession {
    constructor() {
        this.frame = new XRPresentationFrame(this);
        this.frameOfReference = new XRFrameOfReference();
        this.raf = null;

        const _this = this;
        EXOKIT_AR.onAnimationFrame = _ => {
            _this.raf && _this.raf(performance.now(), _this.frame);
        };
    }

    getInputSources() {
        return [];
    }

    requestAnimationFrame(fn) {
        this.raf = fn;
    }

    requestFrameOfReference(type, options = {}) {
        return Promise.resolve(this.frameOfReference);
    }
}

class XRFrameOfReference {

}

class XRPresentationFrame {
    constructor(session) {
        this.pose = new XRDevicePose();
        this.session = session;
        this.views = [new XRView()];
    }

    getDevicePose(system) {
        return this.pose;
    }

    getInputPose() {
        return null;
    }
}

class XRView {
    constructor() {
        this.eye = 'left';
        this.projectionMatrix = new Matrix4().toArray();

        const _this = this;
        EXOKIT_AR.setProjectionMatrix = value => {
            _this.projectionMatrix = value;
        };
    }
}

class XRDevicePose {
    constructor() {
        let matrix = new Matrix4();
        this.viewMatrix = matrix.toArray();

        const _this = this;
        EXOKIT_AR.onUpdatePose = camera => {
            matrix.getInverse(camera.matrixWorld);
            matrix.toArray(_this.viewMatrix);
        };
    }

    getViewMatrix(view) {
        return this.viewMatrix;
    }
}

class XRWebGLLayer {
    constructor(session, context, options = {}) {
        this.session = session;
        this.context = context;
        this.scale = options.framebufferScaleFactor || 1;

        this.fbo = new FBO(window.innerWidth * window.devicePixelRatio * this.scale, window.innerheight * window.devicePixelRatio * this.scale);
        this.fbo.create(_gl);
        this.framebuffer = this.fbo._gl;
        this.viewport = {x: 0, y: 0, width: this.fbo.width, height: this.fbo.height};

        EXOKIT_AR.FBO = this.fbo;

        xr.init();

        const _this = this;
        window.addEventListener('resize', _ => {
            _this.fbo.setSize(window.innerWidth * window.devicePixelRatio * _this.scale, window.innerheight * window.devicePixelRatio * _this.scale);
            _this.viewport.width = _this.fbo.width;
            _this.viewport.height = _this.fbo.height;
        });
    }

    getViewport() {
        return this.viewport;
    }

    requestViewportScaling(scale) {
        this.scale = scale;
        this.fbo.setSize(window.innerWidth * window.devicePixelRatio * this.scale, window.innerheight * window.devicePixelRatio * this.scale);
        this.viewport.width = this.fbo.width;
        this.viewport.height = this.fbo.height;
    }
}

navigator.xr = new XR();
window.XRDevice = XRDevice;
window.XRSession = XRSession;
window.XRFrameOfReference = XRFrameOfReference;
window.XRPresentationFrame = XRPresentationFrame;
window.XRView = XRView;
window.XRDevicePose = XRDevicePose;
window.XRWebGLLayer = XRWebGLLayer;
