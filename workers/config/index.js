const Confidence = require( 'confidence' );

const store = new Confidence.Store();
store.load( require( './config.json' ) );

module.exports = store;
