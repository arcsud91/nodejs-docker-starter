const { Router } = require( 'express' );

module.exports = class RouteDefinitionBase {

    constructor( basePath ) {

        this._basePath = basePath;
        this._router = Router(); // eslint-disable-line new-cap

        this.init();

    }

    init() {

        throw new Error( 'The "init" function of the definition base has to be overriden.' );

    }

    attachRoutes( app ) {

        app.use( this._basePath, this._router );

    }

};
