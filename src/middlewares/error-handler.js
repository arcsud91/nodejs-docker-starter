const Jaunty = require( 'jaunty-ssl' );

const { Errors, Services: { CryptoService } } = require( '../lib' );

module.exports = function errorHandler( error, request, response, next ) {

    if ( typeof error !== 'undefined' && error !== null ) {

        if ( error instanceof Errors.BadRequest ) {

            request.log.warn( 'Bad request.' );

            return response.status( 400 ).json( {
                errors: [
                    {
                        message: error.message,
                    },
                ],
            } );

        }

        if ( error instanceof Jaunty.Errors.AuthorizationError ) {

            request.log.warn( 'Unauthenticated' );

            return response.status( 401 ).json( {
                errors: [
                    {
                        message: 'You are not authenticated.',
                    },
                ],
            } );

        }

        if ( error instanceof Errors.UnauthorizedError || error instanceof Jaunty.Errors.UnauthorizedError ) {

            request.log.info( 'Unauthorized' );

            return response.status( error.statusCode || 403 ).json( {
                errors: error.errors ?
                    [ ...error.errors ] : [
                        {
                            message: 'You are not allowed to access this route.',
                        },
                    ],
            } );

        }

        if ( error instanceof Errors.NotFoundError ) {

            request.log.info( 'Not found', {
                errorPayload: error,
            } );

            return response.status( error.statusCode ).json( {
                errors: [ ...error.errors ],
            } );

        }

        if ( error instanceof Errors.ConflictError ) {

            request.log.warn( 'Conflicting entries', error );

            return response.status( 409 ).json( {
                errors: [ { message: error.message } ],
            } );

        }

        if ( error instanceof Errors.ValidationFailedError ) {

            request.log.warn( 'Ingress payload validation failed', {
                errorPayload: error,
            } );

            return response.status( error.statusCode ).json( {
                errors: [ ...error.errors ],
            } );

        }

        if ( error instanceof Errors.ServerSideError ) {

            const errorId = CryptoService.generateUUID();
            const exactError = error.error;

            request.log.error( `Internal server error. [${ errorId }]`, {

                errorId,
                error: exactError.toString(),
                stackTrace: exactError.stack,

            } );

            return response.status( 500 ).json( {
                message: error.message,
                errorId,
            } );

        }

        request.log.error( error );

        return response.status( 500 ).json( {
            errors: [
                {
                    message: 'Internal server error.',
                },
            ],
        } );

    }

    next();

};
