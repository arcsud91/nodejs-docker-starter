const tapeTest = require( 'tape' );
const supertest = require( 'supertest' );

const app = require( '../src/app' );
const utils = require( './utils' );

const internals = {

    getRouteDefinition( name ) {

        try {

            const routeDefinition = require( `../src/api/${ name }` );
            return routeDefinition;

        } catch ( error ) {

            throw error;

        }

    },

    bootstrapAppHarness( routeName, attachLogin, additionalRoutes ) {

        this.getRouteDefinition( routeName ).attachRoutes( app );

        if ( attachLogin ) {

            this.getRouteDefinition( 'auth' ).attachRoutes( app );

        }

        for ( const route of additionalRoutes ) {

            this.getRouteDefinition( route ).attachRoutes( app );

        }

        app.use( require( '../src/middlewares/error-handler' ) );
        return supertest( app );

    },

};

class TestBase {

    constructor( routeName, attachLogin = false, additionalRoutes = [] ) {

        this.request = internals.bootstrapAppHarness( routeName, attachLogin, additionalRoutes );
        this.test = function test( description, testFn ) {

            tapeTest( `#${ routeName.substring( 0, 1 ).toUpperCase() + routeName.substring( 1 ) } > ${ description }`,
                testFn );

        };

        this.utils = utils;

    }

    async fetchLogin( role ) {

        const roleMap = {
            user: 'user@sample-app.com',
            admin: 'admin@sample-app.com',
        };

        const email = roleMap[ role.trim().toLowerCase() ];
        if ( !email ) {

            throw new Error( `Role map for role "${ role }" was not found.` );

        }

        try {

            const { body } = await this.request.post( '/auth' ).send( {

                email,
                password: 'password',

            } );

            return body.jwt;

        } catch ( error ) {

            throw error;

        }

    }

    async run() {

        throw new Error( 'This method must be overridden.' );

    }

}

module.exports = TestBase;
