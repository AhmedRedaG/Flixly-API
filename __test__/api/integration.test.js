import request from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

import { server, mongooseConnection } from "../../src/server.js";
import User from "../../src/models/user.js";

let user;

beforeEach(async () => {
  await User.deleteMany({});
  user = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
  };
});

afterAll(async () => {
  mongooseConnection.disconnect();
  server.close();
});

describe("Integration Tests for All Endpoints", () => {
  // Auth - Local
  describe("POST /api/v1/auth/local/register", () => {
    it("should return 422 and fail if input is not valid", async () => {
      user = {};
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe("fail");
    });
    it("should fail if name is not valid", async () => {
      user.name = "";
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe("fail");
      expect(res.body.data).toEqual({ name: "Name must be valid." });
    });
    it("should fail if email is not valid", async () => {
      user.email = "@";
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.body.data).toEqual({ email: "Email must be valid" });
    });
    it("should fail if password is not valid", async () => {
      user.password = "12345678";
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.body.data).toEqual({
        confirmPassword: "Passwords must be the same.",
        password:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    });
    it("should fail if confirmPassword is not valid", async () => {
      user.confirmPassword = "invalid";
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.body.data).toEqual({
        confirmPassword: "Passwords must be the same.",
      });
    });

    it("should return 409 and fail if email is exist", async () => {
      await User.create(user);
      const userInDb = await User.findOne({ email: user.email });
      expect(userInDb).not.toBeNull();

      const repeatedUser = { ...user };
      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(repeatedUser);
      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch("Email already in use");
    });

    it("should return 201 and success if user is valid", async () => {
      const userInDb = await User.findOne({ email: user.email });
      expect(userInDb).toBeNull();

      const res = await request(server)
        .post("/api/v1/auth/local/register")
        .send(user);
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.userSafeData.email).toMatch(user.email);
      expect(res.body.data.message).toMatch("Email sent successfully");
    });
  });
});
