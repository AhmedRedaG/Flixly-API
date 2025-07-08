import AppError from "../../src/utilities/appError.js";

describe("AppError", () => {
  it("should return error object with test message and 400 status code", () => {
    const errorTest = new AppError("test message", 400);

    expect(errorTest).toMatchObject({
      message: "test message",
      statusCode: 400,
    });
  });
});
