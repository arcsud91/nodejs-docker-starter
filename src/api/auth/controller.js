/* eslint-disable valid-jsdoc */

/**
  *@swagger
  *tags:
  *    -
  *        name: Authentication
  *        description: Provides methods to authenticate and authorize a user.
  *    -
  *        name: PasswordReset
  *        description: Provides methods to change the password for a user..
*/

/**
  * @swagger
  * definitions:
  *     AuthenticationPayload:
  *         type: object
  *         required:
  *             - email
  *             - password
  *         properties:
  *             email:
  *                 type: string
  *                 format: email
  *                 example: someone@abc.io
  *             password:
  *                 type: string
  *                 example: myCool_password!
  *     CommonGoogleAuthPayload:
  *         type: object
  *         required:
  *             - idToken
  *         properties:
  *             idToken:
  *                 type: string
  *                 description: the identity token received after a login
  *     AuthenticationResponse:
  *         type: object
  *         required:
  *             - email
  *             - role
  *             - sessionId
  *             - jwt
  *         properties:
  *             email:
  *                 type: string
  *                 format: email
  *                 example: user@foobar.com
  *             role:
  *                 type: string
  *                 enum: [super, admin, evaluator, user]
  *                 example: super
  *             sessionId:
  *                 type: string
  *                 format: uuid
  *                 example: c7bc409c-095d-43e0-b304-1e60262893bb
  *             jwt:
  *                 type: string
  *     PasswordResetInitiatePayload:
  *         type: object
  *         required:
  *             - email
  *         properties:
  *             email:
  *                 type: string
  *                 format: email
  *                 example: someone@recro.io
  *     PasswordResetPayload:
  *         type: object
  *         required:
  *             - password
  *         properties:
  *             password:
  *                 type: string
  *                 example: my_new_password!
  *     SignupPayload:
  *         type: object
  *         required:
  *             - name
  *             - email
  *             - password
  *         properties:
  *             name:
  *                 type: string
  *                 example: John Doe
  *             email:
  *                 type: string
  *                 format: email
  *                 example: someone@foo.bar
  *             password:
  *                 type: string
  */

const jwt = require( 'jsonwebtoken' );
const { body, param, validationResult } = require( 'express-validator/check' );

const {
    Errors,
    Services: {
        CryptoService,
        UserService,
        PasswordResetService,
    },
} = require( '../../lib' );

const config = require( '../../config' );

module.exports = {

    /**
      * @swagger
      * /auth:
      *   post:
      *     description: Logs the user in with the specified credentials.
      *     tags: [ Authentication ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: body
      *             name: AuthenticationPayload
      *             description: 'The payload to send for obtaining the access token.'
      *             schema:
      *                 $ref: '#/definitions/AuthenticationPayload'
      *     responses:
      *         200:
      *             description: the authentication was successful
      *             schema:
      *                 type: object
      *                 $ref: '#/definitions/AuthenticationResponse'
      *         400:
      *             description: the user has not activated their account
      *         401:
      *             description: the user specified incorrect or invalid credentials
      *         404:
      *             description: the specified user was not found
      *         409:
      *             description: the user has a pre-existing session
      *         422:
      *             description: the request is invalid and has missing payload properties
      */
    async login( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { email, password } = request.body;

        try {

            const user = await UserService.getUserFromEmailID( email );
            if ( !user ) {

                return next( new Errors.NotFoundError( [ {
                    message: `User with the email address "${ email }" was not found.`,
                } ] ) );

            }

            if ( !user.get( 'isActivated' ) ) {

                return next( new Errors.BadRequest( 'The account has not been activated.' ) );

            }

            const doPasswordsMatch = await CryptoService.compare( password, user.get( 'password' ) );

            if ( !doPasswordsMatch ) {

                return next( new Errors.UnauthorizedError() );

            }

            const tokenDetails = await UserService.generateSessionAndToken( email );
            if ( tokenDetails instanceof Errors.ConflictError ) {

                return next( tokenDetails );

            }

            response.status( 200 ).json( tokenDetails.data );

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/forgot:
      *   post:
      *     description: Triggers a password reset.
      *     tags: [ PasswordReset ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: body
      *             description: 'The payload to send for initiating a password reset session.'
      *             schema:
      *                 $ref: '#/definitions/PasswordResetInitiatePayload'
      *     responses:
      *         201:
      *             description: the password reset session was initiated successfully
      *         422:
      *             description: the request is invalid and has missing payload properties
      */
    async triggerForgotPasswordRequest( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { email } = request.body;

        try {

            const user = await UserService.getUserFromEmailID( email );

            await PasswordResetService.addNewSession( email );

            return response.status( 201 ).json( {
                meta: {
                    message: 'Success! An email has been sent to your ID.',
                    userId: user ? user.get( 'id' ) : 'NA',
                },
            } );

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/forgot/{resetToken}:
      *   get:
      *     description: Validates a password reset request token.
      *     tags: [ PasswordReset ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: path
      *             description: 'The password reset request token to be validated.'
      *             required: true
      *             name: resetToken
      *             schema:
      *                 type: string
      *                 format: uuid
      *     responses:
      *         204:
      *             description: the request token is valid
      *         400:
      *             description: the specified request token is invalid/expired or was not found
      *         422:
      *             description: the request is invalid and has missing parameter values
      */
    async validateResetRequest( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { resetToken } = request.params;

        try {

            const resetSession = await PasswordResetService.validateToken( resetToken );
            if ( !resetSession ) {

                return next( new Errors.BadRequest(
                    'The provided password reset token has either been used or is invalid.'
                ) );

            }

            return response.status( 204 ).send();

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/forgot/{resetToken}:
      *   post:
      *     description: Changes the password for the user attached to the request token.
      *     tags: [ PasswordReset ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: body
      *             description: 'The payload to send for changing the password.'
      *             schema:
      *                 $ref: '#/definitions/PasswordResetPayload'
      *         -
      *             in: path
      *             description: 'The password reset request token.'
      *             required: true
      *             name: resetToken
      *             schema:
      *                 type: string
      *                 format: uuid
      *     responses:
      *         204:
      *             description: the password was changed succesffully
      *         422:
      *             description: the request is invalid and has missing parameter values and/or payload data
      */
    async changePassword( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { password } = request.body;
        const { resetToken } = request.params;

        try {

            await PasswordResetService.changePassword( resetToken, password );
            return response.status( 204 ).send();

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/signup:
      *   post:
      *     description: Creates a new user on the system.
      *     tags: [ Authentication ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: body
      *             name: SignupPayload
      *             description: 'The payload to send for creating a new user.'
      *             schema:
      *                 $ref: '#/definitions/SignupPayload'
      *     responses:
      *         201:
      *             description: the user has successfully signed up
      *         409:
      *             description: the email already exists in the system
      *         422:
      *             description: the request is invalid and has missing payload properties
      */
    async signup( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { name, email, password } = request.body;

        try {

            const newUser = await UserService.newUser( {
                name,
                email,
                password,
            } );

            if ( newUser instanceof Errors.ConflictError ) {

                return next( newUser );

            }

            return response.status( 201 ).send( {
                data: newUser,
            } );

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/{userId}:
      *   delete:
      *     description: Logs the user out from the system.
      *     tags: [ Authentication ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: path
      *             description: 'The unique identifier for the user whose session is to be destroyed.'
      *             required: true
      *             name: userId
      *             schema:
      *                 type: string
      *                 format: uuid
      *     responses:
      *         204:
      *             description: the user was successfully logged out
      *         422:
      *             description: the request is invalid and has missing parameter values
      */
    async logout( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        let decodedToken;
        if ( request.headers && request.headers.authorization ) {

            const [ scheme, jwtToken ] = request.headers.authorization.split( ' ' );
            if ( !scheme || !jwtToken || scheme.toLowerCase() !== 'bearer' ) {

                return next( new Errors.BadSchemeError( 'Invalid header format received.' ) );

            }

            const token = jwtToken;
            decodedToken = jwt.decode( token, { complete: true } );

        }

        const { userId } = decodedToken.payload;

        try {

            await UserService.logout( userId );

            return response.status( 204 ).send();

        } catch ( error ) {

            console.log( error );
            return next( new Errors.ServerSideError( error ) );

        }

    },

    /**
      * @swagger
      * /auth/multiplex/google:
      *   post:
      *     description: Create a new user based on Google Credentials or logs the user in for a JWT.
      *     tags: [ Authentication ]
      *     produces: application/json
      *     parameters:
      *         -
      *             in: body
      *             name: CommonGoogleAuthPayload
      *             description: 'The payload to send for creating a new user.'
      *             schema:
      *                 $ref: '#/definitions/CommonGoogleAuthPayload'
      *     responses:
      *         200:
      *             description: the user was successfully logged in
      *             schema:
      *                 $ref: '#/definitions/AuthenticationResponse'
      *         201:
      *             description: the user was successfully created
      *         400:
      *             description: invalid user token was provided
      *         409:
      *             description: the user has a pre-existing session
      *         422:
      *             description: the request is invalid and has missing parameter values
      */
    async handleGoogleIdentity( request, response, next ) {

        const errors = validationResult( request );
        if ( !errors.isEmpty() ) {

            return next( new Errors.ValidationFailedError( errors.array() ) );

        }

        const { idToken } = request.body;

        try {

            const data = await UserService.handleGoogleIdentity( idToken );

            if ( data instanceof Errors.ConflictError ) {

                return next( data );

            }

            return response.status( data.isLogin ? 200 : 201 ).send( { data: data.data } );

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    async confirmUser( request, response, next ) {

        const { confirmToken } = request.params;

        try {

            const data = await UserService.confirmUser( confirmToken );

            if ( data instanceof Errors.BadRequest ||
                data instanceof Errors.NotFoundError ) {

                return next( data );

            }

            return response.redirect( config.get( '/application/confirmUrl' ) );

        } catch ( error ) {

            return next( new Errors.ServerSideError( error ) );

        }

    },

    validations: {

        login() {

            return [
                body( 'email' ).not().isEmpty().withMessage( 'Email is a required property.' ),
                body( 'password' ).not().isEmpty().withMessage( 'Password is a required property.' ),
            ];

        },

        triggerForgotPasswordRequest() {

            return [
                body( 'email' ).not().isEmpty().withMessage( 'Email is a required property.' ),
            ];

        },

        validateResetRequest() {

            return [
                param( 'resetToken' ).not().isEmpty().withMessage( 'The reset token is a required parameter.' )
                    .isUUID().withMessage( 'The reset token should be a valid UUID.' ),
            ];

        },

        changePassword() {

            return [
                param( 'resetToken' ).not().isEmpty().withMessage( 'The reset token is a required parameter.' )
                    .isUUID().withMessage( 'The reset token should be a valid UUID.' ),
                body( 'password' ).not().isEmpty().withMessage( 'Password is a required property.' ),
            ];

        },

        signup() {

            return [
                body( 'name' ).not().isEmpty().withMessage( 'Name is a required property.' ),
                body( 'password' ).not().isEmpty().withMessage( 'Password is a required property.' ),
                body( 'email' ).not().isEmpty().withMessage( 'Email is a required property.' )
                    .isEmail().withMessage( 'The email property should be a valid email.' ),
            ];

        },

        confirmUser() {

            return [
                param( 'confirmToken' ).not().isEmpty().withMessage( 'The confirmation token is required.' )
                    .isUUID().withMessage( 'The confirmation token should be a valid UUID.' ),
            ];

        },

        logout() {

            return [
                param( 'userId' ).not().isEmpty().withMessage( 'The UserID is a required parameter.' )
                    .isUUID().withMessage( 'The UserID should be a valid UUID.' ),
            ];

        },

        handleGoogleIdentity() {

            return [

                body( 'idToken' ).not().isEmpty().withMessage( 'The identity token is required.' )
                    .isString().withMessage( 'The "idToken" property should be a string.' ),

            ];

        },

    },

};
