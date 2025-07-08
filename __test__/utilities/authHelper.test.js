import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/utilities/jwtHelper.js", () => ({
  createAccessToken: jest.fn(),
  createRefreshToken: jest.fn(),
}));

jest.unstable_mockModule("../../src/utilities/dataHelper.js", () => ({
  getSafeData: jest.fn().mockImplementation((user) => {
    const { _id, email, refreshTokens } = user;
    return { _id, email, refreshTokens };
  }),
}));

const { generateTokensForUser } = await import(
  "../../src/utilities/authHelper.js"
);
const { createAccessToken, createRefreshToken } = await import(
  "../../src/utilities/jwtHelper.js"
);

describe("generateTokensForUser", () => {
  it("should return tokens and user data if user exists", async () => {
    createAccessToken.mockReturnValue("mockAccessToken");
    createRefreshToken.mockReturnValue("mockRefreshToken");

    const user = {
      _id: "bs83s8932jd93032k342fs",
      email: "ahmed@gmail.com",
      refreshTokens: [],
    };
    const result = await generateTokensForUser(user);

    expect(result).toEqual({
      userSafeData: user,
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
    });
  });
});
