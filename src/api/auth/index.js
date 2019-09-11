const RouteDefinitionBase = require( '../route-definition-base' );
const controller = require( './controller' );

class AuthRoute extends RouteDefinitionBase {

    constructor() {

        super( '/auth' );

    }

    init() {

        this._router.post( '/', controller.validations.login(), controller.login );
        this._router.delete( '/', controller.logout );

        this._router.post( '/signup', controller.validations.signup(), controller.signup );
        this._router.post( '/multiplex/google', controller.validations.handleGoogleIdentity(), controller.handleGoogleIdentity );

        this._router.post( '/forgot',
            controller.validations.triggerForgotPasswordRequest(), controller.triggerForgotPasswordRequest );
        this._router.get( '/forgot/:resetToken',
            controller.validations.validateResetRequest(), controller.validateResetRequest );
        this._router.post( '/forgot/:resetToken',
            controller.validations.changePassword(), controller.changePassword );

        this._router.get( '/confirm/:confirmToken', controller.validations.confirmUser(),
            controller.confirmUser );

    }

}

module.exports = new AuthRoute();
