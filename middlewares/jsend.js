class Jsend {
  /**
   * @param {Object} res - Express response object.
   * @throws {Error} If res is not a valid Express response object.
   */
  constructor(res) {
    if (
      !res ||
      typeof res.status !== "function" ||
      typeof res.json !== "function"
    ) {
      throw new Error("Invalid Express response object provided.");
    }
    this.res = res;
  }

  /**
   * Sends a successful response.
   * @param {Object|null} [data] - Optional data payload.
   * @param {number} [status=200] - HTTP status code.
   * @param {string} [statusLabel="success"] - Custom status label (defaults to "success").
   * @returns {Object} Express response object.
   * @throws {Error} If data is not JSON-serializable.
   */
  success(data = null, status = 200, statusLabel = "success") {
    if (data && typeof data !== "object") {
      throw new Error("Data must be an object or null.");
    }
    return this.res.status(status).json({
      status: statusLabel,
      data,
    });
  }

  /**
   * Sends a fail response (typically for client-side errors).
   * @param {Object|null} [data] - Details of the failure.
   * @param {number} [status=400] - HTTP status code.
   * @param {string} [statusLabel="fail"] - Custom status label (defaults to "fail").
   * @returns {Object} Express response object.
   * @throws {Error} If data is not JSON-serializable.
   */
  fail(data = null, status = 400, statusLabel = "fail") {
    if (data && typeof data !== "object") {
      throw new Error("Data must be an object or null.");
    }
    return this.res.status(status).json({
      status: statusLabel,
      data,
    });
  }

  /**
   * Sends an error response (for unexpected or server-side errors).
   * @param {string} [message="Internal Server Error"] - A meaningful error message.
   * @param {number} [status=500] - HTTP status code.
   * @param {Object} [options] - Optional fields (code, details, extra).
   * @param {string} [statusLabel="error"] - Custom status label (defaults to "error").
   * @returns {Object} Express response object.
   * @throws {Error} If message is not a non-empty string or options.extra is not an object.
   */
  error(
    message = "Internal Server Error",
    status = 500,
    options = {},
    statusLabel = "error"
  ) {
    if (typeof message !== "string" || !message.trim()) {
      throw new Error(
        "Error response must include a non-empty message string."
      );
    }
    if (options.extra && typeof options.extra !== "object") {
      throw new Error("Extra must be an object.");
    }

    const response = {
      status: statusLabel,
      message,
      ...(options.code && { code: options.code }),
      ...(options.details && { details: options.details }),
      ...(options.extra && { extra: { ...options.extra } }),
    };

    return this.res.status(status).json(response);
  }
}

/**
 * Express middleware to inject the Jsend helper into res.
 * @returns {Function} Express middleware function.
 */
function jsendMiddleware() {
  return (req, res, next) => {
    res.jsend = new Jsend(res);
    next();
  };
}

export default jsendMiddleware;
