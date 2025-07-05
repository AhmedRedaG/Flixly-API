import AppError from "../utilities/appError.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const { message, statusCode } = err;
    res.jsend.fail({ message }, statusCode);
  } else {
    console.log(err);
    res.jsend.error("Internal server error");
  }
};

export default errorHandler;
