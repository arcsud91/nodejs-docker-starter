module.exports = decodedToken => {

    return { isValid: true, payload: decodedToken.payload };

};
