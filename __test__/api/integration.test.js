import request from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import jwt from "jsonwebtoken";

import { server, mongooseConnection } from "../../src/server.js";
import User from "../../src/models/user.js";
import { createVerifyToken } from "../../src/utilities/jwtHelper.js";
import { env } from "../../src/config/env.js";

const { verifyTokenSecret } = env.jwt;
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

describe("Integration Tests for Auth Local Endpoints", () => {
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

  describe("PATCH /api/v1/auth/local/verify/:verifyToken", () => {
    it("should fail with 403 if token is invalid", async () => {
      const res = await request(server).patch(
        "/api/v1/auth/local/verify/invalidtoken"
      );
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/invalid|authentication/i);
    });

    it("should fail with 403 if token is expired", async () => {
      const expiredToken = jwt.sign(
        { _id: "123456789012" },
        verifyTokenSecret,
        { expiresIn: -1 }
      );
      const res = await request(server).patch(
        `/api/v1/auth/local/verify/${expiredToken}`
      );
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/expired/i);
    });

    it("should fail with 404 if user does not exist", async () => {
      const token = createVerifyToken({ _id: "123456789012345678901234" });
      const res = await request(server).patch(
        `/api/v1/auth/local/verify/${token}`
      );
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/not found/i);
    });

    it("should fail with 403 if user is already verified", async () => {
      const dbUser = await User.create(user);
      await User.updateOne({ email: user.email }, { verified: true });
      const token = createVerifyToken({ _id: dbUser._id });
      const res = await request(server).patch(
        `/api/v1/auth/local/verify/${token}`
      );
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/already verified/i);
    });

    it("should verify user and return tokens if token is valid and user is not verified", async () => {
      const dbUser = await User.create(user);
      const token = createVerifyToken({ _id: dbUser._id });
      const res = await request(server).patch(
        `/api/v1/auth/local/verify/${token}`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("userSafeData");
      expect(res.body.data.userSafeData.email).toBe(user.email);
      expect(res.body.data.message).toMatch(/verified successfully/i);

      const verifiedUser = await User.findById(dbUser._id);
      expect(verifiedUser.verified).toBe(true);
    });
  });

  describe("POST /api/v1/auth/local/login", () => {
    it("should fail with 422 if input is missing", async () => {
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({});
      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe("fail");
    });

    it("should fail with 422 if email is invalid", async () => {
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({ email: "invalid", password: "Password123!" });
      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe("fail");
      expect(res.body.data).toHaveProperty("email");
    });

    it("should fail with 422 if password is missing", async () => {
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({ email: "test@example.com" });
      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe("fail");
      expect(res.body.data).toHaveProperty("password");
    });

    it("should fail with 401 if user does not exist", async () => {
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({ email: "nouser@example.com", password: "Password123!" });
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/Invalid email/i);
    });

    it("should fail with 401 if user registered with Google", async () => {
      await User.create({
        name: "Google User",
        email: "googleuser@example.com",
        googleId: "googleid123",
        verified: true,
      });
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({ email: "googleuser@example.com", password: "Irrelevant123!" });
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/registered with Google/i);
    });

    it("should fail with 401 if password is incorrect", async () => {
      await request(server).post("/api/v1/auth/local/register").send(user);
      await User.updateOne({ email: user.email }, { verified: true });
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send({ email: user.email, password: "WrongPassword123!" });
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/Invalid password/i);
    });

    it("should fail with 401 if user is not verified", async () => {
      await request(server).post("/api/v1/auth/local/register").send(user);
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send(user);
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe("fail");
      expect(res.body.data.message).toMatch(/not been verified/i);
    }, 10000);

    it("should require TFA if enabled", async () => {
      await request(server).post("/api/v1/auth/local/register").send(user);
      await User.updateOne(
        { email: user.email },
        { verified: true, "TFA.status": true, "TFA.method": "sms" }
      );
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send(user);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("method", "sms");
      expect(res.body.data).toHaveProperty("tempToken");
      expect(res.body.data.message).toMatch(
        /Two-factor authentication required/i
      );
    });

    it("should succeed and return tokens if credentials are valid", async () => {
      await request(server).post("/api/v1/auth/local/register").send(user);
      await User.updateOne({ email: user.email }, { verified: true });
      const res = await request(server)
        .post("/api/v1/auth/local/login")
        .send(user);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data.userSafeData.email).toBe(user.email);
    });
  });
});
