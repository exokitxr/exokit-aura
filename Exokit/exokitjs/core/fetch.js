const PromiseCreate = function() {
    let temp_resolve, temp_reject;
    const promise = new Promise((resolve, reject) => {
        temp_resolve = resolve;
        temp_reject = reject;
    });
    promise.resolve = temp_resolve;
    promise.reject = temp_reject;
    return promise;
};

window.fetch = function(url, options = {}) {
    const promise = PromiseCreate();
    const request = XMLHttpRequest.create();

    for (let i in options.headers) {
        request.setRequestHeader(i, options.headers[i]);
    }

    request.addEventListener('readystatechange', e => {
        console.log(e.target.readyState);
        // if (e.target.readyState === 4) {
        //     promise.resolve(response());
        // } else {
        //     promise.reject();
        // }
    });

    function response() {
        let keys = [],
            all = [],
            headers = {},
            header;

        (request.getAllResponseHeaders() || '').replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
            keys.push(key = key.toLowerCase());
            all.push([key, value]);
            header = headers[key];
            headers[key] = header ? `${header},${value}` : value;
        });

        return {
            ok: (request.status/200|0) == 1,		// 200-399
            status: request.status,
            statusText: request.statusText,
            url: request.url,
            clone: response,

            text: () => Promise.resolve(request.responseText()),
            json: () => Promise.resolve(request.responseText()).then(JSON.parse),
            xml: () => Promise.resolve(request.responseXML()),
            blob: () => Promise.resolve(new Blob([request.response])),

            headers: {
                keys: () => keys,
                entries: () => all,
                get: n => headers[n.toLowerCase()],
                has: n => n.toLowerCase() in headers
            }
        };
    }

    request.open((options.method || 'get').toUpperCase(), url);
    request.responseType = 'text';
    request.send(options.body);

    return promise;
};
