const Sessions = require( '../sessions' );
// Const config = require( '../../config' );

module.exports = {

    getSession( email ) {

        return Sessions.get( email );

    },

    setSession( email, sessionId ) {

        return Sessions.set( email, sessionId, 'EX', 86400 * 30 );

    },

    deleteSession( email ) {

        return Sessions.del( email ).then( rows => {

            console.log( rows );

        } );

    },

};
