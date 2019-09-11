const { createACL } = require( 'jaunty-ssl' );

const RouteDefinitionBase = require( '../route-definition-base' );
const Controller = require( './controller' );

const aclProvider = createACL();

class UploadRoutes extends RouteDefinitionBase {

    constructor() {

        super( '/upload' );

    }

    init() {

        this._router.post( '/',
            aclProvider.hasPermissions( [ 'super' ], [ 'admin' ] ), Controller.validations.uploadFile(),
            Controller.uploadFile );

    }

}

module.exports = new UploadRoutes();
