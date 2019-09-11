const { PasswordResetSession, User } = require( '../../models' );
const CryptoService = require( './crypto' );
const UserService = require( './user' );
const QueueService = require( './queue' );

module.exports = {

    async validateToken( resetToken ) {

        try {

            const tokenSession = await new PasswordResetSession( { passwordResetToken: resetToken } ).fetch();

            // Add expires_at check
            return tokenSession && !tokenSession.isConsumed;

        } catch ( error ) {

            throw error;

        }

    },

    async addNewSession( email ) {

        try {

            const user = await UserService.getUserFromEmailID( email );
            if ( !user ) {

                return QueueService.EmailQueueService.queuePasswordTriggerMail( {
                    email,
                    userExists: false,
                } );

            }

            const resetToken = CryptoService.generateUUID();
            const resetSession = new PasswordResetSession( {
                userId: user.get( 'id' ),
                passwordResetToken: resetToken,
            } );

            await resetSession.save();

            return QueueService.EmailQueueService.queuePasswordTriggerMail( {
                email,
                resetToken,
                name: user.get( 'name' ),
            } );

        } catch ( error ) {

            throw error;

        }

    },

    async changePassword( resetToken, password ) {

        try {

            const resetSession = await new PasswordResetSession( {
                passwordResetToken: resetToken,
            } ).fetch();

            await resetSession.save( { isConsumed: true } );

            return new User( { id: resetSession.get( 'userId' ) } )
                .save( {
                    password: await CryptoService.hash( password ),
                }, { patch: true } );

        } catch ( error ) {

            throw error;

        }

    },

};
