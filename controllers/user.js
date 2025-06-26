import { getUserByIdOrFail } from "../utilities/dbHelper.js";

// for testing JWT
export const getUser = (req, res, next) => {
  const user = req.user;

  res.jsend.success({ user });
};

export const setPhoneNumber = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const user = await getUserByIdOrFail(req.user._id);
  if (!user) return;

  // cant reset number with 2fa enabled, you can disable it first or update the number using the 2fa code
  if (user.TFA.number && user.TFA.status === true)
    return res.jsend.fail({
      phoneNumber: "Phone number already set and 2fa is activated",
    });

  user.TFA.number = phoneNumber;
  await user.save();

  res.jsend.success({ phoneNumber });
};
