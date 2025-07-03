import AppError from "../utilities/appError.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    res.jsend.fail({ message: err.message }, err.statusCode || 400);
  } else {
    console.error(err);
    res.jsend.error("internal server error");
  }
};

export default errorHandler;
