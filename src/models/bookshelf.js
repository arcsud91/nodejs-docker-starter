const bookshelf = require( 'bookshelf' )( require( './knex' ) );

bookshelf.plugin( 'pagination' );
bookshelf.plugin( 'bookshelf-camelcase' );
bookshelf.plugin( 'visibility' );
bookshelf.plugin( 'registry' );

module.exports = bookshelf;
