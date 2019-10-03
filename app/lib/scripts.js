'use strict';

const linz = require('linz');

/**
 * Set the scripts that certain pages load.
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 * @returns {Promise} Resolves with the updated scripts.
 */
module.exports = (req, res) => {
    let { scripts = [] } = res.locals;

    if (req.originalUrl.match(/\/model\/mtUser\/.*\/action\/edit-custom$/)) {
        scripts = scripts.concat([
            {
                src:
                    '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
                integrity:
                    'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
                crossorigin: 'anonymous',
            },
            { src: `${linz.get('admin path')}/public/js/jquery.binddata.js` },
            { src: `${linz.get('admin path')}/public/js/documentarray.js?v2` },
            {
                integrity:
                    'sha256-/wPGlKXtfdj9ryVH2IQ78d1Zx2/4PXT/leOL4Jt1qGU=',
                src:
                    '//cdnjs.cloudflare.com/ajax/libs/deep-diff/0.2.0/deep-diff.min.js',
                crossorigin: 'anonymous',
            },
            {
                integrity:
                    'sha256-ytdI1WZJO3kDPOAKDA5t95ehNAppkvcx0oPRRAsONGo=',
                src:
                    '//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js',
                crossorigin: 'anonymous',
            },
            { src: `${linz.get('admin path')}/public/js/model/edit.js` },
            { dataAttributes: { test: 'test' } },
        ]);
    }

    return Promise.resolve(scripts);
};
