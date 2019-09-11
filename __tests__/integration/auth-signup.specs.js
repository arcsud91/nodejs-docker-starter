const TestBase = require( '../test-base' );
const { User } = require( '../../src/models' );

class SignupSpecs extends TestBase {

    constructor() {

        super( 'auth' );

    }

    async run() {

        this.test( 'creates a new user', async t => {

            try {

                let response = await this.request.post( '/auth/signup' ).send( {

                    name: 'Test Two',
                    password: 'password',
                    email: 'user1@sample-app.com',

                } );

                let { body } = response;

                t.ok( response.ok, 'no errors were handled' );
                t.equal( response.status, 201, 'the status code is correct' );
                t.ok( body, 'the body exists' );
                t.equal( typeof body, 'object', 'the body is an object' );
                t.ok( body.data, 'the body contains the "meta" property' );

                const user = await new User( { email: 'user1@sample-app.com' } ).fetch();

                await user.save( { isActivated: true } );

                response = await this.request.post( '/auth' ).send( {

                    email: 'user1@sample-app.com',
                    password: 'password',

                } );

                body = response.body;

                t.ok( response.ok, 'no errors were handled' );
                t.equal( response.status, 200, 'the status code is correct' );
                t.ok( body, 'the body exists' );
                t.equal( typeof body, 'object', 'the body is an object' );
                t.ok( body.email, 'the body contains the "email" property' );
                t.ok( body.role, 'the body contains the "role" property' );
                t.ok( body.sessionId, 'the body contains the "sessionId" property' );
                t.ok( body.sessionId, 'the body contains the "sessionId" property' );
                t.ok( body.jwt, 'the body contains the "jwt" property' );

                await this.utils.cleanAll();

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of invalid or insufficient payload values', async t => {

            try {

                let response = await this.request.post( '/auth/signup' )
                    .send( {
                        email: 'user1@sample-app.com',
                        password: 'somepassword',
                    } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, response.body );

                response = await this.request.post( '/auth/signup' )
                    .send( {
                        name: 'user1@sample-app.com',
                        password: 'somepassword',
                    } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, response.body );

                response = await this.request.post( '/auth/signup' )
                    .send( {
                        name: 'John Doe',
                        email: 'user1@sample-ap',
                        password: 'somepassword',
                    } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, response.body );

                response = await this.request.post( '/auth/signup' )
                    .send( {
                        name: 'John Doe',
                        email: 'user1@sample-app.com',
                    } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 422, 'the status code is correct' );
                this.utils.runBodyChecks( t, response.body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

        this.test( 'gives an error in case of duplicate emails', async t => {

            try {

                const response = await this.request.post( '/auth/signup' )
                    .send( {
                        name: 'John Doe',
                        email: 'user@sample-app.com',
                        password: 'somepassword',
                    } );

                t.notOk( response.ok, 'errors were handled' );
                t.equal( response.status, 409, 'the status code is correct' );
                this.utils.runBodyChecks( t, response.body );

                t.end();

            } catch ( error ) {

                throw error;

            }

        } );

    }

}

new SignupSpecs().run();
