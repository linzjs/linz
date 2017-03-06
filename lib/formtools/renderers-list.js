const linz = require('linz');

/**
 * Grid list renderer.
 * @param  {Object} res  Express response object.
 * @param  {Object} data Data passed to the template.
 * @return {Void}        Render the template.
 */
function grid (res, data) {

    return res.render(linz.api.views.viewPath('grid.jade'), data);

}

/**
 * List list renderer.
 * @param  {Object} res  Express response object.
 * @param  {Object} data Data passed to the template.
 * @return {Void}        Render the template.
 */
function list (res, data) {

    return res.render(linz.api.views.viewPath('list.jade'), data);

}

module.exports = {

    default: grid,
    grid,
    list

}
