class ConflictError extends Error {

    constructor( message ) {

        super( message );

        this.statusCode = 409;
        this.name = 'ConflictError';
        this.message = message;

    }

}

module.exports = ConflictError;
