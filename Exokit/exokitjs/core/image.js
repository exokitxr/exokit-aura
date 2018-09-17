class Image {
    set src(url) {
        this._src = url;
        if (!url.includes('http')) url = EXOKIT.rootPath + url;

        const _this = this;
        let xhr = XMLHttpRequest.create();
        xhr.addEventListener('readystatechange', e => {
            if (e.target.readyState === 4) {
                let data = xhr.response;
                _this.width = data.width;
                _this.height = data.height;
                _this.onload && _this.onload();
            }
        });

        xhr.open('GET', url);
        xhr.responseType = 'texture';
        xhr.send();
    }

    get src() {
        return this._src;
    }
}

window.Image = Image;

// let img = new Image();
// img.src = 'http://192.168.1.5/blank/html/assets/images/_scenelayout/uv.jpg';
