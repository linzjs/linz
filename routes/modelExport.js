var linz = require('../');

module.exports = {

    get: function (req, res) {
        res.render(linz.views + '/modelExport.jade', { model: req.linz.model, modelExport: req.linz.export });
    }

}
