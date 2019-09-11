const path = require( 'path' );

let host = `${ process.env.API_HOST || 'staging.api.sample-app.com' }`;

const swaggerDefinition = {
    info: {
        title: 'API Definition',
        version: require( '../../package.json' ).version,
        description: 'The complete API definition for the backend application.',
    },
    host,
    basePath: '/',
};

module.exports = {
    swaggerDefinition,
    apis: [ path.join( __dirname, '../api/**/*.js' ) ],
};
