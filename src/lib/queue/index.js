const amqpLib = require( 'amqplib' );

const { nominal: logger } = require( '../../logging' );
const config = require( '../../config' );

let connection = null;
let channel = null;
let isConnected = false;

exports.getChannel = () => channel;
exports.isConnected = () => isConnected;

exports.disconnect = async () => {

    if ( !connection ) {

        throw new Error( 'A connection to RabbitMQ has not been established.' );

    }

    if ( !channel ) {

        throw new Error( 'The channel has not been initialized.' );

    }

    try {

        logger.trace( 'Closing the RabbitMQ channel...' );
        await channel.close();
        logger.info( 'Channel successfully closed.' );

        logger.trace( 'Closing the connection to RabbitMQ...' );
        await connection.close();
        logger.info( 'The connection to RabbitMQ was successfully closed.' );

    } catch ( error ) {

        throw error;

    }

};

exports.connect = async () => {

    if ( connection ) {

        throw new Error( '[RabbitMQ] - A connection already exists with the RabbitMQ server.' );

    }

    try {

        connection = await amqpLib.connect( config.get( '/rabbitmq' ) );
        isConnected = true;

    } catch ( error ) {

        logger.fatal( '[RabbitMQ] - There was an error in establishing a connection: ' +
            error.toString() );

    }

};

exports.createChannel = async () => {

    if ( !connection ) {

        logger.fatal( '[RabbitMQ] - Cannot create channel without a connection.' );

    }

    try {

        channel = await connection.createChannel();

    } catch ( error ) {

        throw error;

    }

};

exports.createQueue = name => {

    if ( !connection ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a connection.' );

    }

    if ( !channel ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a channel.' );

    }

    return channel.assertQueue( name );

};

exports.createExchange = exchangeName => {

    if ( !connection ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a connection.' );

    }

    if ( !channel ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a channel.' );

    }

    /*
     * The first parameter is the name of the exchange and the second
     * one is the type; in our case, we are creating a topic exchange.
     */
    return channel.assertExchange( exchangeName, 'topic', {
        durable: false,
    } );

};

exports.createRoutedQueue = exchangeName => {

    if ( !connection ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a connection.' );

    }

    if ( !channel ) {

        logger.fatal( '[RabbitMQ] - Cannot create a queue without a channel.' );

    }

    return async function createQueueAndBinding( queueInfo ) {

        try {

            await exports.createQueue( queueInfo.queue );
            await channel.bindQueue( queueInfo.queue, exchangeName, queueInfo.topic );

        } catch ( error ) {

            throw error;

        }

    };

};
