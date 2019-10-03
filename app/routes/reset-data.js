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
        objectField: {
            objectField1: 'Object Field 1',
            objectField2: 'Object Field 2',
            objectField3: 'Object Field 3',
        },
        org: org._id,
        password: 'password',
        username: 'test',
    });

    const Test = linz.api.model.get('test');
    const test = new Test();

    test.set({
        title: 'Test',
        boolean: true,
        checkboxes: ['value1', 'value2'],
        checkboxesWithAddition: ['test1', 'test2'],
        ckeditor: '<p>test</p> ',
        date: new Date(),
        digit: 123,
        documents: [
            {
                time: new Date(),
                name: 'Test',
                _id: '5d0c6f9830ef170022e83408',
            },
        ],
        email: 'test@test.com',
        hidden: 'hidden',
        multipleSelect: ['value1', 'value2'],
        number: 123,
        password: 'password',
        radios: 'value1',
        select: 'value1',
        tel: '123',
        text: 'test',
        textArea: 'test',
        url: 'https://www.google.com',
    });

    const testXss = new Test();

    testXss.set({
        title: `" /><script>alert('xss')</script><br class="`,
        boolean: `" /><script>alert('xss')</script><br class="`,
        checkboxes: [`" /><script>alert('xss')</script><br class="`],
        checkboxesWithAddition: [
            `" /><script>alert('xss')</script><br class="`,
        ],
        ckeditor: `" /><script>alert('xss')</script><br class="`,
        date: new Date(),
        digit: `" /><script>alert('xss')</script><br class="`,
        documents: [
            {
                time: new Date(),
                name: `" /><script>alert('xss')</script><br class="`,
                _id: '5d0c6f9830ef170022e83408',
            },
        ],
        email: `" /><script>alert('xss')</script><br class="`,
        hidden: `" /><script>alert('xss')</script><br class="`,
        multipleSelect: [`" /><script>alert('xss')</script><br class="`],
        number: 123,
        password: `" /><script>alert('xss')</script><br class="`,
        radios: `" /><script>alert('xss')</script><br class="`,
        select: `" /><script>alert('xss')</script><br class="`,
        tel: `" /><script>alert('xss')</script><br class="`,
        text: `" /><script>alert('xss')</script><br class="`,
        textArea: `" /><script>alert('xss')</script><br class="`,
        url: `" /><script>alert('xss')</script><br class="`,
    });

    const records = [user.save(), org.save(), test.save(), testXss.save()];

    Promise.all([
        mtOrg.collection.drop(),
        mtUser.collection.drop(),
        test.collection.drop(),
    ])
        .then(() => Promise.all(records))
        .then(() => res.redirect('/'))
        .catch(next);
};
