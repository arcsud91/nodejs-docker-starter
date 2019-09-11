class ServerSideError extends Error {

    constructor( error ) {

        super( 'There was a server-side error. We are, and we promise, working on it!' );

        this.error = error;
        this.statusCode = 500;
        this.name = 'ServerSideError';

    }

}

module.exports = ServerSideError;
