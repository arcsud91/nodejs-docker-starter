/* eslint-disable valid-jsdoc */

/**
  *@swagger
  *tags:
  *    -
  *        name: Upload
  *        description: Provides methods to upload files to S3.
*/

const {
    Errors,
    Services: { FileService },
} = require( '../../lib' );

const config = require( '../../config' );

module.exports = {

    /**
      * @swagger
      * /upload:
      *   post:
      *     description: Uploads a file
      *     tags: [ Upload ]
      *     produces: application/json
      *     consumes:
      *         - multipart/form-data
      *     parameters:
      *         -
      *             in: formData
      *             name: file
      *             type: file
      *             description: The file to upload.
      *     responses:
      *         201:
      *             description: the file was successfully uploaded
      *             type: object
      *             required:
      *                 - data
      *             properties:
      *                 data:
      *                     type: object
      *                     properties:
      *                         url:
      *                             type: string
      *                             example: https://static.sample-app.com/uploads/f60222c9-92cc-4378-96e6-fd71a92889a5-image.jpg
      *         401:
      *             description: the user specified incorrect or invalid credentials
      *         403:
      *             description: the user does not have permission to access the resource
      *         422:
      *             description: the uploaded file was either empty or wasn't of type image/jpeg or image/png or application/octet-stream
      */
    async uploadFile( request, response, next ) {

        try {

            const url = await FileService.upload( request.files.file );
            return response.status( 201 ).json( {

                data: { url },

            } );

        } catch ( error ) {

            console.log( error );
            return next( new Errors.ServerSideError( error ) );

        }

    },

    validations: {

        uploadFile() {

            return [
                ( request, _, next ) => {

                    console.log( request.files );
                    if ( !request.files || !request.files.file ) {

                        return next( new Errors.ValidationFailedError( [

                            {
                                message: 'No file was uploaded.',
                            },

                        ] ) );

                    }

                    const mimeType = request.files.file.mimetype;
                    const { acceptedMimeTypes } = config.get( '/application/uploads' );
                    if ( acceptedMimeTypes.indexOf( mimeType ) === -1 ) {

                        return next( new Errors.ValidationFailedError( [

                            {
                                message: `The file has the mime-type ${ mimeType }. Only "image/jpeg" and "image/png" are allowed.`,
                            },

                        ] ) );

                    }

                    next();

                },
            ];

        },

    },

};
