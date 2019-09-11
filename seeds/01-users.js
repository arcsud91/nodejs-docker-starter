/* eslint-disable camelcase */

const TABLE_NAME = 'users';
const rows = [

    {
        id: 'c7bc409c-095d-43e0-b304-1e60262893bb',
        name: 'User One',
        email: 'user@sample-app.com',
        password: '$2b$11$ZI9cJ7BjUhDehszd/UbQfeUBSYwTT8cmM0RWZiXc3zgTQdtnKFdP6',
        role: 'user',
        is_activated: true,
    },
    {
        id: 'e3597769-ec96-43a9-8023-ca307c89728d',
        name: 'Admin One',
        email: 'admin@sample-app.com',
        password: '$2b$11$ZI9cJ7BjUhDehszd/UbQfeUBSYwTT8cmM0RWZiXc3zgTQdtnKFdP6',
        role: 'admin',
        is_activated: true,
    },

];

exports.seed = async knex => {

    try {

        await knex( TABLE_NAME ).del();
        return knex( TABLE_NAME ).insert( rows );

    } catch ( error ) {

        throw error;

    }

};
