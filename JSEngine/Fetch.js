window.fetch = function(url, options) {
    if (!FetchRequest.list) FetchRequest.list = [];
    options = options || {};
    delete options.credentials;
    delete options.headers;
    const promise = Promise.create();
    const request = FetchRequest.create();

    let method = options.method || 'GET';
    if (method.toLowerCase() == 'get') {
        delete options.method;
        let query = '';
        for (let key in options) {
            if (!query.length) query = '?';
            query += `${key}=${options[key]}&`;
        }
        query = query.slice(0, -1);
        url += query;
    }

    request.openWithMethodUrl(method, url);

    for (let i in options.headers) {
        request.setRequestHeaderWithKeyValue(i, options.headers[i]);
    }

    request.onload = (data) => {
        FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
        promise.resolve(response(data));
    };

    request.onerror = () => {
        FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
        promise.reject();
    };

    FetchRequest.list.push(request);

    options.body = options.body || {}
    request.sendWithBody(options.body);

    function response(data) {
        let keys = [],
        all = [],
        headers = {},
        header;

        return {
            ok: true,        // 200-399
            status: 200,
            statusText: data,
            url: '',
            clone: response,

            text: () => Promise.resolve(data),
            json: () => Promise.resolve(data).then(JSON.parse),
            xml: () => Promise.resolve(data),
            blob: () => Promise.resolve(new Blob([data])),

            headers: {
            keys: () => keys,
            entries: () => all,
            get: n => headers[n.toLowerCase()],
            has: n => n.toLowerCase() in headers
            }
        };
    }
    return promise;
};

window.createImageBitmap = function(img) {
    return Promise.resolve(img);
}
