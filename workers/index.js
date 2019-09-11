const path = require( 'path' );
const amqpLib = require( 'amqplib' );
const config = require( './config' );

let connection = null;
let channel = null;

const connect = async () => {

    let isRabbitMQConnected = false;

    if ( connection ) {

        throw new Error( '[RabbitMQ] - A connection already exists with the RabbitMQ server.' );

    }

    const rabbitInterval = setInterval( async function connectToRabbit() {

        if ( isRabbitMQConnected ) {

            console.log( 'Skipping connection to RabbitMQ: already connected.' );
            console.log( 'Clearing interval' );
            clearInterval( rabbitInterval );
            console.log( 'RabbitMQ connection interval cleared.' );

        } else {

            try {

                connection = await amqpLib.connect( config.get( '/rabbitmq' ) );
                channel = await connection.createChannel();

                bootstrap();

                isRabbitMQConnected = true;

            } catch ( error ) {

                console.log( `[RabbitMQ] - There was an error: ${ error }` );
                console.log( 'Will try after 30 seconds' );

            }

        }

    }, 30000 );

};

function bootstrap() {

    try {

        channel.consume( config.get( '/workers' ).name,
            require( path.resolve( path.join( __dirname, './src/consumers/email.js' ) ) )
                .createConsumer( channel ) );

    } catch ( error ) {

        throw error;

    }

}

connect();

process.on( 'SIGINT', async function exit() {

    try {

        await channel.close();
        console.log( 'Closed the channel.' );

        await connection.close();
        console.log( 'Closed the connection.' );

        process.exit( 0 );

    } catch ( error ) {

        console.error( `[Worker] - Error while shutting down: ${ error.toString() }` );
        process.exit( 1 );

    }

} );
