'use strict';

const linz = require('linz');

module.exports = (req, res, next) => {

    // Create a default organisation for Linz
    const mtOrg = linz.api.model.get('mtOrg');
    const org = new mtOrg();

    org.set({ name: 'Test organisation' });

	// Create a default user for Linz
    const mtUser = linz.api.model.get('mtUser');
    const user = new mtUser();

    user.set({
        bAdmin: true,
        email: 'test@test.com',
        name: 'Test user',
        objectField: {
            objectField1: 'Object Field 1',
            objectField2: 'Object Field 2',
            objectField3: 'Object Field 3',
        },
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
