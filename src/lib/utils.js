/* eslint-disable camelcase */

const { UsersProfile } = require( '../models' );
const config = require( '../config' );

module.exports = {

    async referralCodeGenerator( id ) {

        try {

            const { alphanumeric } = config.get( '/referral' );
            let referralCode = '';
            for ( let i = 0; i < 7; i++ ) {

                referralCode += alphanumeric.charAt( Math.floor( Math.random() * alphanumeric.length ) );

            }

            const referralStatus = await UsersProfile.where( { referral_code: referralCode } ).count();

            if ( referralStatus ) {

                module.exports.referralCodeGenerator( id );

            }

            return referralCode;

        } catch ( error ) {

            throw error;

        }

    },

    async renerateRandomString() {

        return Math.random().toString( 36 ).replace( '0.', '' );

    },

};
