const path = require( 'path' );
const glob = require( 'glob' );

const logger = require( '../logging' ).nominal;

exports.bootstrap = function bootstrap( app ) {

    logger.info( 'Attaching routes to the application' );
    logger.trace( 'Collecting routes' );

    const basePath = path.join( __dirname, '../api' );
    const routes = glob.sync( path.join( basePath, '**/index.js' ), {
        ignore: path.join( basePath, 'node_modules/**/*.*' ),
    } );

    logger.trace( `Collected ${ routes.length } routes` );

    routes.forEach( routePath => {

        const route = require( routePath );

        logger.trace( `Attaching routes for /"${ route._basePath }"` );
        route.attachRoutes( app );

    } );

    logger.trace( 'Done.' );

};
