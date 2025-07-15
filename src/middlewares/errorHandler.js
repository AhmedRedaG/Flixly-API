import AppError from "../utilities/appError.js";

const notFoundError = (req, res) => {
  res.jsend.fail({ message: "Source location not found" }, 404);
};

const apiError = (err, req, res, next) => {
  if (err instanceof AppError) {
    const { message, statusCode } = err;
    res.jsend.fail({ message }, statusCode);
  } else {
    console.log(err);
    res.jsend.error("Internal server error");
  }
};

const errorHandler = [notFoundError, apiError];

export default errorHandler;
