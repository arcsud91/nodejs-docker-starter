const test = require( 'tape' );

const RouteDefinitionBase = require( '../../src/api/route-definition-base' );

test( '#RouteDefinitionBase (Abstract) > throws an error when the init function is not implemented', t => {

    class TestRoute extends RouteDefinitionBase {}

    t.throws( () => new TestRoute(), Error, 'the error is thrown' );
    t.end();

} );
