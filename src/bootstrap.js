const { nominal: logger } = require( './logging' );
const MessageQueue = require( './lib/queue' );
const config = require( './config' );

module.exports = function bootstrapConnections() {

    let isRabbitMQConnected = false;

    const rabbitInterval = setInterval( async function connectToRabbit() {

        if ( isRabbitMQConnected ) {

            logger.info( 'Skipping connection to RabbitMQ: already connected.' );
            logger.trace( 'Clearing interval' );
            clearInterval( rabbitInterval );
            logger.trace( 'RabbitMQ connection interval cleared.' );

        } else {

            try {

                await MessageQueue.connect();
                isRabbitMQConnected = MessageQueue.isConnected();
                if ( isRabbitMQConnected ) {

                    logger.info( '[RabbitMQ] - Connected.' );

                    await MessageQueue.createChannel();
                    logger.info( '[RabbitMQ] - Created channel.' );

                    await MessageQueue.createQueue( config.get( '/workers' ).name );
                    logger.info( '[RabbitMQ] - Created worker queue.' );

                    logger.info( '[RabbitMQ] - Created data ingestion queues.' );

                }

            } catch ( error ) {

                logger.error( `[RabbitMQ] - There was an error: ${ error }` );
                logger.debug( 'Will try after 5 seconds' );

            }

        }

    }, 5000 );

};
