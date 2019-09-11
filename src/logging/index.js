const config = require( '../config' );

module.exports = {
    nominal: require( 'pino' )( config.get( '/logging' ) ),
    middleware: require( 'express-pino-logger' )( config.get( '/logging' ) ),
};
