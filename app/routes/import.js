var linz = require('../linz');

module.exports = function (req, res, next) {

	// create a default user for Linz
    const mtUser = linz.api.model.get('mtUser');
    const mtOrg = linz.api.model.get('mtOrg');

    const org = new mtOrg();

    org.set({ name: 'Test org' });

    const user = new mtUser();

    user.set({
        name: 'Test user',
        email: 'test@test.com',
        username: 'test',
        password: 'password',
        bAdmin: true,
        org: org._id,
    });

    const records = [
        user.save(),
        org.save(),
    ];

    Promise.all(records)
        .then(() => res.status(200).json({ data: `Saved ${records.length} records` }))
        .catch(err => res.status(500).json({ error: err.message }));

};
