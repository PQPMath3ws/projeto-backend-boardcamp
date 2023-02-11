const setError = (code, message) => ({code, message});

const errors = {
    400: setError(400, ""),
    404: setError(404, "route not found in server API"),
    405: setError(405, "method not allowed in this route"),
    409: setError(409, ""),
    500.1: setError(500, "error at connecting in database"),
    500.2: setError(500, "error at searching infos in database"),
};

export default errors;