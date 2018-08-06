var linz = require('../linz');

module.exports = function (req, res, next) {

	// create a default user for Linz
    const mtUser = linz.api.model.get('mtUser');
    const user = new mtUser();

    user.set({
        name: 'Test user',
        email: 'test@test.com',
        username: 'test',
        password: 'password',
        bAdmin: true,
    });

    const records = [
        user.save(),
    ];

    Promise.all(records)
        .then(() => next())
        .catch(next);

};
