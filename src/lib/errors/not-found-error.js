class NotFoundError extends Error {

    constructor( errors ) {

        super( 'The requested resource was not found.' );

        this.errors = errors;
        this.statusCode = 404;
        this.name = 'NotFoundError';

    }

}

module.exports = NotFoundError;
