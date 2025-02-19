// utils/error.js
export const createError = (statusCode, message, errors = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (errors) {
        error.errors = errors;
    }
    return error;
};