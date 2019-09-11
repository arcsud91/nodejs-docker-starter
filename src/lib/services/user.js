const { OAuth2Client } = require( 'google-auth-library' );
const moment = require( 'moment-timezone' );
const { User, AccountActivation } = require( '../../models' );

const Errors = require( '../errors' );
const config = require( '../../config' );
const { EmailQueueService } = require( './queue' );
const SessionService = require( './session' );
const CryptoService = require( './crypto' );

module.exports = {

    async getUserFromEmailID( email ) {

        return new User( { email } ).fetch();

    },

    async logout( userId ) {

        try {

            const user = await User.where( 'id', userId ).fetch();

            return SessionService.deleteSession( user.get( 'email' ) );

        } catch ( error ) {

            throw error;

        }

    },

    async newUser( { name, email, password, isFederatedAuth = false } ) {

        try {

            const id = CryptoService.generateUUID();
            const confirmationToken = CryptoService.generateUUID();
            const newUserObject = await new User().save( {
                id,
                name,
                email,
                password: ( isFederatedAuth ? null : await CryptoService.hash( password ) ),
                isFederatedAuth,
                isActivated: isFederatedAuth,
            } );

            await EmailQueueService.queueNewUserEmail( name, email, confirmationToken );

            return newUserObject;

        } catch ( error ) {

            if ( error.errno === 1062 ) {

                return new Errors.ConflictError( `An account with the email ${ email } already exists.` );

            }

            throw error;

        }

    },

    async generateSessionAndToken( email ) {

        try {

            /* Const existingSession = await SessionService.getSession( email );

            if ( existingSession ) {

                if ( existingSession < Date.now() ) {

                    return new Errors.ConflictError( 'A session already exists for the same user.' );

                }

            } */

            const user = await this.getUserFromEmailID( email );

            const sessionId = CryptoService.generateUUID();
            await SessionService.setSession( email, sessionId );

            return {

                data: {
                    email: user.get( 'email' ),
                    role: user.get( 'role' ),
                    sessionId,
                    jwt: CryptoService.generateJWT( {
                        sessionId,
                        email: user.get( 'email' ),
                        userId: user.get( 'id' ),
                        permissions: user.get( 'role' ),
                    } ),
                },

                isLogin: true,

            };

        } catch ( error ) {

            throw error;

        }

    },

    async confirmUser( confirmToken ) {

        try {

            const confirmModel = await AccountActivation.forge( { id: confirmToken } ).fetch();
            if ( !confirmModel ) {

                return new Errors.NotFoundError( 'The confirmation token has been consumed or does not exist.' );

            }

            if ( confirmModel.get( 'isConsumed' ) ) {

                return new Errors.BadRequest( 'The confirmation token has been consumed or does not exist.' );

            }

            const expiresAt = moment( confirmModel.get( 'expiresAt' ) );
            if ( expiresAt.isBefore( moment() ) ) {

                return new Errors.BadRequest( 'The confirmation token has been consumed or does not exist.' );

            }

            await AccountActivation.forge().where( { id: confirmToken } )
                .save( { isConsumed: true }, { patch: true } );
            return User.forge()
                .where( { id: confirmModel.get( 'userId' ) } )
                .save( { isActivated: true }, { patch: true } );

        } catch ( error ) {

            throw error;

        }

    },

    async handleGoogleIdentity( idToken ) {

        try {

            const { clientID } = config.get( '/security/authentication/google' );
            const client = new OAuth2Client( clientID );

            const ticket = await client.verifyIdToken( {
                idToken,
                audience: clientID,
            } );

            const { name, email } = ticket.getPayload();

            await this.newUser( { name, email, isFederatedAuth: true } );

            return this.generateSessionAndToken( email );

            // Return { data: user };

        } catch ( error ) {

            throw error;

        }

    },
};
