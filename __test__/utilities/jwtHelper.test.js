import { jest, describe, it, expect } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => {
  return {
    __esModule: true,
    default: {
      sign: jest.fn((payload) => "hashed:" + payload._id),
      verify: jest.fn((token) => {
        if (token.length < 7) throw new Error("invalid length");
        else return token.slice(7);
      }),
    },
  };
});

const { createAccessToken, verifyAccessToken } = await import(
  "../../src/utilities/jwtHelper.js"
);
const jwt = await import("jsonwebtoken");

const payload = { _id: "dgd2893h8d2398" };
let token = "hashed:" + payload._id;

describe("createAccessToken", () => {
  it("should return a json web token from the payload", () => {
    token = createAccessToken(payload);
    expect(token).toBe("hashed:" + payload._id);
  });
});

describe("verifyAccessToken", () => {
  it("should return a payload (_id) after verify the token", () => {
    const verifiedPayload = verifyAccessToken(token);
    expect(verifiedPayload).toBe(payload._id);
  });

  it("should throw invalid access token with error message", () => {
    const wrongToken = "wrong";
    const verifiedPayload = () => verifyAccessToken(wrongToken);
    expect(verifiedPayload).toThrow("Authentication failed");
  });
});
