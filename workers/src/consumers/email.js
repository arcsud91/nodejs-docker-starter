/* eslint import/no-unresolved: 0 */

if ( !process.env.SENDGRID_API_KEY ) {

    throw new Error( 'Environment variable "SENDGRID_API_KEY" was not set.' );

}

const sgMail = require( '@sendgrid/mail' );

const { EMAIL_PARAMETERS: CONSTANTS } = require( '../constants' );

const urlBase = process.env.PASSBACK_URL || 'http://localhost:3000';
sgMail.setApiKey( process.env.SENDGRID_API_KEY );

module.exports.createConsumer = channel => {

    return async function consume( msg ) {

        const data = JSON.parse( msg.content.toString() );

        const mailOpts = {
            to: data.email,
            from: 'Sample App <no-reply@Sample-App.com>',
            replyTo: 'Sample App Support <support@Sample-App.com>',
            dynamic_template_data: { // eslint-disable-line camelcase
                name: data.name || data.email,
                email: data.email,
            },
        };

        const emailConstants = CONSTANTS[ data.type ];
        mailOpts.subject = emailConstants.subject;
        switch ( data.type ) {

            case 'send-password-forgot':
                mailOpts.templateId = typeof data.userExists === 'boolean' ?
                    emailConstants.alternateTemplate :
                    emailConstants.template;
                mailOpts.dynamic_template_data.resetUrl = `${ urlBase }/auth/forgot/${ data.resetToken }`;
                break;

            case 'new-user':
                mailOpts.dynamic_template_data
                    .confirmUrl = `${ urlBase }/auth/confirm/${ data.confirmToken }`;
                mailOpts.templateId = emailConstants.template;
                break;

            default:
                mailOpts.templateId = emailConstants.template;

        }

        try {

            await sgMail.send( mailOpts );
            channel.ack( msg );

            console.log( 'Email sent [%s]: %s', data.type, data.email );
            return Promise.resolve();

        } catch ( error ) {

            console.log( mailOpts );
            console.log( '[ERROR]: %O', error );
            throw new Error( '[ERROR] SendEmail: %O -- %O', data, error );

        }

    };

};
