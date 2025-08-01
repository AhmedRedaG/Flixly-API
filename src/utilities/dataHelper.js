export const getSafeData = (user) => {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    bio: user.bio,
    role: user.role,
    verified: user.verified,
  };
};

// placeholder
export const getUserByIdOrFail = () => {};
