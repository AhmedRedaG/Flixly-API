// for testing JWT
export const getUser = (req, res, next) => {
  const user = req.user;

  res.jsend.success({ user });
};
