const test = require( 'tape' );

const knex = require( '../../src/models/knex' );
const { Queue, Sessions } = require( '../../src/lib' );

test( '## TEARDOWN ##', async t => {

    t.comment( 'Shutting down the connection with MariaDB...' );
    await knex.destroy();

    t.comment( 'Shutting down the connection with RabbitMQ...' );
    await Queue.disconnect();

    t.comment( 'Shutting down the connection with the sessions queue...' );
    await Sessions.disconnect();

    t.end();

} );
