const bookshelf = require( './bookshelf' );

const Users = bookshelf.Model.extend( {

    tableName: 'users',
    hidden: [ 'password', 'is_activated' ],
    fullName() {

        return `${ this.get( 'firstName' ) } ${ this.get( 'lastName' ) }`;

    },

} );

module.exports = bookshelf.model( 'Users', Users );
