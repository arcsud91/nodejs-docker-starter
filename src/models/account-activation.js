const bookshelf = require( './bookshelf' );

const AccountActivation = bookshelf.Model.extend( {

    tableName: 'account_activation',

} );

module.exports = AccountActivation;
