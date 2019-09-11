const knex = require( '../src/models/knex' );
const { Sessions } = require( '../src/lib' );
// TODO const config = require( '../src/config' );

module.exports = {

    async cleanDatabase( t = { comment() {} } ) {

        t.comment( 'Clearing the database...' );
        await knex.migrate.rollback();

        t.comment( 'Applying fresh migrations...' );
        await knex.migrate.latest();

        t.comment( 'Seeding the database...' );
        await knex.seed.run();

    },

    async cleanWorkers( t = { comment() {} } ) {

        t.comment( 'Purging the worker queue...' );

        // TODO await Queue.getChannel().purgeQueue( config.get( '/workers' ).name );

    },

    async cleanSessions( t = { comment() {} } ) {

        t.comment( 'Clearing the sessions queue...' );
        const keys = await Sessions.keys( '*' ); // Aggregate all the keys which match '*'; basically everything.
        const pipeline = Sessions.pipeline(); // A pipeline queues tasks to be executed on a value and then runs them.
        keys.forEach( key => pipeline.del( key ) ); // Add the "del" command for each key.

        await pipeline.exec(); // Execute the pipeline.

    },

    async cleanAll( t = { comment() {} } ) {

        await this.cleanDatabase( t );
        await this.cleanSessions( t );
        await this.cleanWorkers( t );

    },

    runBodyChecks( t, body ) {

        t.ok( body, 'the body exists' );
        t.equal( typeof body, 'object', 'the body is an object' );
        t.ok( body.errors, 'the body contains the "errors" property' );
        t.ok( Array.isArray( body.errors ), 'the error property holds an array' );
        t.ok( body.errors.length, 'there are more than 0 errors' );

    },

};
