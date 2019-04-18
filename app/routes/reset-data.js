'use strict';

const linz = require('linz');

module.exports = (req, res, next) => {

    // Create a default organisation for Linz
    const mtOrg = linz.api.model.get('mtOrg');
    const org = new mtOrg();

    org.set({
        createdBy: 'reset-script',
        name: 'Test organisation',
        modifiedBy: 'reset-script',
    });

	// Create a default user for Linz
    const mtUser = linz.api.model.get('mtUser');
    const user = new mtUser();

    user.set({
        bAdmin: true,
        createdBy: 'reset-script',
        email: 'test@test.com',
        modifiedBy: 'reset-script',
        name: 'Test user',
        org: org._id,
        password: 'password',
        username: 'test',
    });

    const records = [
        user.save(),
        org.save(),
    ];

    Promise.all([
        mtOrg.collection.drop(),
        mtUser.collection.drop(),
    ])
        .then(() => Promise.all(records))
        .then(() => res.redirect('/'))
        .catch(next);

};
