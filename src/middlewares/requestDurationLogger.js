const requestDurationLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;

    console.log(`${req.ip} ${req.method} ${req.originalUrl} => ${duration}ms`);
  });

  next();
};

export default requestDurationLogger;
