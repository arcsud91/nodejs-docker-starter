const Queue = require( '../queue' );
const config = require( '../../config' );

const workerConfig = config.get( '/workers' );

const enqueue = data => {

    const channel = Queue.getChannel();
    return channel.sendToQueue( workerConfig.name, Buffer.from( JSON.stringify( data ) ) );

};

module.exports = {

    EmailQueueService: {

        queuePasswordTriggerMail( data ) {

            return enqueue( {
                ...data,
                type: 'send-password-forgot',
            } );

        },

        queuePasswordChangedEmail( email, fullName ) {

            return enqueue( {
                email,
                name: fullName,
                type: 'send-password-changed',
            } );

        },

        queueNewUserEmail( ...[ name, email, confirmToken ] ) {

            return enqueue( {
                name,
                email,
                confirmToken,
                type: 'new-user',
            } );

        },

        async queueNewEvaluatorEmail( ...[ name, email ] ) {

            return enqueue( {
                name,
                email,
                type: 'new-evaluator',
            } );

        },
        async queueNewFeedbackVideoEmail( item, link, feedbackId ) {

            return enqueue( {
                evaluatorName: item.name,
                email: item.email,
                link,
                evaluatorId: item.userId,
                feedbackId,
                type: 'evaluator-video-acceptance',
            } );

        },

        async queueReferralInviteEmail( id, name, email, referralCode ) {

            return enqueue( {
                referralId: id,
                name,
                email,
                referralCode,
                type: 'referral-invite',
            } );

        },
        async queueEvaluatorFlagEmail( name, email, reason ) {

            return enqueue( {

                name,
                email,
                reason,
                type: 'Evaluator-flagged-email',
            } );

        },

    },

};
