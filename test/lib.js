
const linz = require('linz');

const collections = () => new Promise((resolve, reject) => {

    linz.mongoose.connections[0].db.collections((err, existingCollections) => {

        if (err) {
            return reject(err);
        }

        // Return an array of collection names only.
        return resolve(existingCollections.map(({ s: { name } }) => name));

    });

});

module.exports = { collections };
