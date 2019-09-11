class UnauthorizedError extends Error {

    constructor() {

        super( 'Authentication failed with the credentials provided.' );

        this.errors = [ {
            message: 'Incorrect credentials were provided for logging into the system.',
        } ];
        this.statusCode = 401;
        this.name = 'UnauthorizedError';

    }

}

module.exports = UnauthorizedError;
