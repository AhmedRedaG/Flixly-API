// for testing JWT
export const getUser = (req, res, next) => {
  const user = req.user;

  res.status(200).json({ message: "Getting user data", user });
};
