const express = require( 'express' );

const app = express();

const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' );
const validator = require( 'express-validator' );
const cors = require( 'cors' );
const swaggerUi = require( 'swagger-ui-express' );
const Jaunty = require( 'jaunty-ssl' );
const fileUpload = require( 'express-fileupload' );

const { nominal: logger, middleware: expressLogger } = require( './logging' );
const bootstrapMiddlewares = require( './middlewares' );
const runtime = require( './runtime' );
const config = require( './config' );

logger.info( 'Registering middlewares' );

app.use( expressLogger );
logger.trace( 'Loaded middleware "express-pino-logger"' );

app.use( bodyParser.json() );
logger.trace( 'Loaded middleware "body-parser"' );

app.use( helmet() );
logger.trace( 'Loaded middleware "helmet"' );

app.use( validator() );
logger.trace( 'Loaded middleware "express-validator"' );

app.use( cors() );
logger.trace( 'Loaded middleware "cors"' );

app.use( fileUpload( {
    limits: {
        fileSize: config.get( '/application/uploads/fileSizeLimit' ),
    },
} ) );
logger.trace( 'Loaded middleware "express-fileupload' );

app.use( Jaunty.createInstance( {
    signingSecret: config.get( '/security/jwtSigningSecret' ),
    validate: require( './lib' ).ValidateAuthentication,

} ).unless( { path: [ /\/auth(\/*.)?/, /\/docs(\/*.)?/, /^\/evaluators\/([^\\/]+?)\/([^/]+?)\/acceptVideos(?:\/)?$/i, /\/subscriptions\/webhook/ ] } ) );
logger.trace( 'Loaded "Jaunty"' );

bootstrapMiddlewares( app );
logger.trace( 'Loaded internal middlewares' );

if ( process.env.NODE_ENV !== 'testing' ) {

    logger.debug( 'Deployment environment has no variable NODE_ENV = "production" | "development"' );
    logger.trace( 'Attaching routes' );

    runtime.bootstrap( app );

    app.use( require( './middlewares/error-handler' ) );
    logger.info( 'Loaded error handler' );

}

if ( process.env.NODE_ENV !== 'production' ) {

    logger.info( 'Loading documentation module...' );
    app.use( '/docs', swaggerUi.serve, swaggerUi.setup( require( './.swagger/specs' ) ) );

}

module.exports = app;
