const AWS = require( 'aws-sdk' );

const config = require( '../../config' );
const CryptoService = require( './crypto' );

module.exports = {

    upload( file ) {

        const s3 = new AWS.S3( config.get( '/aws/access' ) );

        return new Promise( ( resolve, reject ) => {

            let extension = file.name.split( '.' );
            extension = extension[ extension.length - 1 ];

            const fileName = file.name.replace( /\W+(?!$)/g, '-' ).replace( /\W$/, '' ).toLowerCase() + '.' +
                extension;
            const key =
                `${ CryptoService.generateUUID() }-${ fileName }`;
            s3.putObject( {
                Key: key,
                Body: file.data,
                Bucket: 'sample-app-static-resources/uploads',
                Tagging: config.get( '/aws/policy' ),
                ACL: 'public-read',
            }, err => {

                if ( err ) {

                    console.log( 'error:', err );
                    reject( err );

                } else {

                    resolve( `https://static.sample-app.com/uploads/${ key }` );

                }

            } );

        } );

    },

};
