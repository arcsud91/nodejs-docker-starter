const app = require( './src/app' );
const networkBootstrap = require( './src/bootstrap' );
const { nominal: logger } = require( './src/logging' );
const config = require( './src/config' );

logger.trace( `Starting application at port ${ config.get( '/network/port' ) }` );
let server = null;

async function createServer() {

    await networkBootstrap();

    server = app.listen( config.get( '/network/port' ), async _error => {

        if ( _error ) {

            logger.fatal( 'Could not start application: %O', _error );

        }

        logger.trace( 'Application started.' );
        logger.debug( `Current environment is: ${ process.env.NODE_ENV || 'development' }` );
        logger.info( `Process identifier: ${ process.pid }` );

    } );

}

async function interruptHandler( interrupt ) {

    logger.warn( `Received signal: ${ interrupt }; shutting down...` );

    // This is where you would close your database pool, etc.

    try {

        logger.info( 'Gracefully shutting down the server.' );

        await server.close();

        logger.info( 'Server shutdown successful.' );
        logger.info( `Time of shutdown: ${ new Date().toUTCString() }` );

        process.exit( 0 ); // eslint-disable-line unicorn/no-process-exit

    } catch ( error ) {

        logger.fatal( `Error while shutting the server down: ${ error.toString() }` );
        process.exit( 1 ); // eslint-disable-line unicorn/no-process-exit

    }

}

process.on( 'SIGINT', interruptHandler );
process.on( 'SIGTERM', interruptHandler );

createServer();
