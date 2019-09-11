const crypto = require( 'crypto' );
const bcrypt = require( 'bcrypt' );
const jwt = require( 'jsonwebtoken' );

const config = require( '../../config' );

const simplify = ( fn, ...args ) => fn( ...args );

module.exports = {

    generateSalt( rounds = 11 ) {

        return simplify( bcrypt.genSalt, rounds );

    },

    hash( data, salt = 11 ) {

        return simplify( bcrypt.hash, data, salt );

    },

    compare( ...args ) {

        return bcrypt.compare( ...args );

    },

    generateJWT( data, options = {} ) {

        return jwt.sign( data, config.get( '/security/jwtSigningSecret' ), options );

    },

    generateUUID() {

        return require( 'uuid/v4' )();

    },

    generateHMACHex( signature ) {

        const hmac = crypto.createHmac( 'sha256', config.get( '/razorpay' ).password );

        const data = hmac.update( signature );

        return data.digest( 'hex' );

    },

};
