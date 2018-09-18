class Image {
    set src(url) {
        this._src = url;
        if (!url.includes('http')) url = EXOKIT.rootPath + url;

        const _this = this;
        let xhr = XMLHttpRequest.create();
        xhr.addEventListener('readystatechange', e => {
            if (e.target.readyState === 4) {
                let r = e.target.response;
                let v = getDimensionsFromArrayBuffer(r);
                _this.width = v.width;
                _this.height = v.height;
                _this.onload && _this.onload();
                _this._arraybuffer = r;
            }
        });

        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.send();
    }

    get src() {
        return this._src;
    }
}

window.Image = Image;
