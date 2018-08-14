var linz = require('../linz');

module.exports = function (req, res, next) {

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
        org: org._id,
        password: 'password',
        username: 'test',
    });

    const records = [
        user.save(),
        org.save(),
    ];

    Promise.all(records)
        .then(() => next())
        .catch(next);

};
