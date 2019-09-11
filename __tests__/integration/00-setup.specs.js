const test = require( 'tape' );

const networkBootstrap = require( '../../src/bootstrap' );
const utils = require( '../utils' );

test( '## SETUP ##', async t => {

    await networkBootstrap();
    await utils.cleanAll( t );
    t.end();

} );
