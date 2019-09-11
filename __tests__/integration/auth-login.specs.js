const TestBase = require( '../test-base' );

class AuthLoginSpecs extends TestBase {

    constructor() {

        super( 'auth' );

    }

    async run() {

        this.test( 'logs the user in when the password is correct', async t => {

            try {

                const { body, ...response } = await this.request.post( '/auth' ).send( {

                    email: 'user@sample-app.com',
                    password: 'password',

                } );

                t.ok( response.ok, 'no errors were handled' );
                t.equal( response.status, 200, 'the status code is correct' );
                t.ok( body, 'the body exists' );
                t.equal( typeof body, 'object', 'the body is an object' );
                t.ok( body.email, 'the body contains the "email" property' );
                t.ok( body.role, 'the body contains the "role" property' );
                t.ok( body.sessionId, 'the body contains the "sessionId" property' );
                t.ok( body.jwt, 'the body contains the "jwt" property' );

                await this.utils.cleanSessions();

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'logs the user out', async t => {

            try {

                const { body } = await this.request.post( '/auth' ).send( {

                    email: 'user@sample-app.com',
                    password: 'password',

                } );
                console.log( 'jwt', body );
                const { jwt } = body;
                /* Const { jwt } = JSON.parse(
                    Buffer.from( body.jwt.split( '.' )[ 1 ], 'base64' ).toString() ); */

                let response = await this.request.delete( '/auth/' ).send().set( 'authorization', 'bearer ' + jwt );

                t.ok( response.ok, 'no errors were handled' );
                t.equal( response.status, 204, 'the status code is correct' );

                response = await this.request.post( '/auth' ).send( {

                    email: 'user@sample-app.com',
                    password: 'password',

                } );

                t.ok( response.ok, 'no errors were handled' );
                t.equal( response.status, 200, 'the status code is correct' );

                await this.utils.cleanSessions();

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of incorrect password', async t => {

            try {

                const { body, ...response } = await this.request.post( '/auth' ).send( {

                    email: 'user@sample-app.com',
                    password: 'passwords',

                } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 401, 'the status code is correct' );
                this.utils.runBodyChecks( t, body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of invalid email', async t => {

            try {

                const { body, ...response } = await this.request.post( '/auth' ).send( {

                    email: 'use2r@sample-app.com',
                    password: 'password',

                } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 404, 'the status code is correct' );
                this.utils.runBodyChecks( t, body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of invalid or insufficient payload values [password]', async t => {

            try {

                const { body, ...response } = await this.request.post( '/auth' ).send( {

                    email: 'user@sample-app.com',

                } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of invalid or insufficient payload values [email]', async t => {

            try {

                const { body, ...response } = await this.request.post( '/auth' ).send( {

                    password: 'test',

                } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

    }

}

new AuthLoginSpecs().run();
