module.exports = function buildError(http_code, internal_code, error) {
    console.log("[ERROR] HTTPCODE: " + http_code + " | INTERNALCODE: " + internal_code + " | ERROR: " + error)
    return {"code":http_code, "errorcode":internal_code, "error":error};
}