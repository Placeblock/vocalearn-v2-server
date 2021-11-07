module.exports = function buildError(http_code, internal_code, message) {
    console.log("[ERROR] HTTPCODE: " + http_code + " | INTERNALCODE: " + internal_code + " | MESSAGE: " + message)
    return {"httpcode":http_code, "errorcode":internal_code, "message":message};
}