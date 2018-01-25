var proxy = require('http-proxy-middleware');

var apiProxy = proxy('/services/*', {
    target: "https://manager.redblu.com.mx:8080/",
    changeOrigin: true,   // for vhosted sites
    secure: false
});

module.exports = {
    server: {
        // Start from key `10` in order to NOT overwrite the default 2 middleware provided
        // by `lite-server` or any future ones that might be added.
        // Reference: https://github.com/johnpapa/lite-server/blob/master/lib/config-defaults.js#L16
        middleware: {
            10: apiProxy
        },
        baseDir: "dist",
        logLevel: "none"
    }
};