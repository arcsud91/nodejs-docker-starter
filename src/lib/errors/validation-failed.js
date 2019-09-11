class ValidationFailedError extends Error {

    constructor( errors ) {

        super( 'Pre-Execution validation failed.' );

        this.errors = errors;
        this.statusCode = 422;
        this.name = 'ValidationFailedError';

    }

}

module.exports = ValidationFailedError;
