const setError = (code, message) => ({code, message});

const errors = {
    404: setError(404, "route not found in server API"),
};

export default errors;