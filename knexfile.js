const config = require( './src/config' );

module.exports = {

    development: {

        ...config.get( '/database' ),
        migrations: {
            tableName: 'knex_migrations',
        },
        pool: {

            afterCreate( connection, callback ) {

                connection.query( 'SET GLOBAL time_zone = \'Asia/Kolkata\';', err => {

                    callback( err, connection );

                } );

            },

        },

    },

};
