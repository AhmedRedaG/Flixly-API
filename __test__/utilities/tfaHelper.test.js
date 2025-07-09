import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const { verifyAttempts, verifySmsCode, verifyTotpCode, verifyBackupCode } =
  await import("../../src/utilities/tfaHelper.js");

import * as configs from "../../src/config/index.js";

const { LOCK_DURATION, MAX_ATTEMPTS, BACKUP_CODE_COUNT } =
  configs.constants.tfa;

let user;
beforeEach(() => {
  user = {
    _id: "686cb1ed4015c322fc3701ae",
    name: "Ahmed Test",
    email: "ahmed@gmail.com",
    role: "user",
    verified: false,
    refreshTokens: [],
    TFA: {
      status: false,
      method: null,
      sms: { status: false, attempts: { $numberInt: "0" }, locked: false },
      totp: { status: false, attempts: { $numberInt: "0" }, locked: false },
      backupCodes: [],
    },
    save: jest.fn().mockResolvedValue(true),
  };
});

describe("verifyAttempts", () => {
  it("should return true if attempts < max attempts", async () => {
    const result = await verifyAttempts(user, "sms");
    expect(result).toBeTruthy();
  });

  it("should throw an error, lock the user and set locked duration if attempts >= max attempts", async () => {
    user.TFA.sms.attempts = MAX_ATTEMPTS + 1;

    await expect(verifyAttempts(user, "sms")).rejects.toThrow(
      "Too many failed attempts"
    );

    expect(user.TFA.sms.locked).toBeTruthy();
    expect(user.TFA.sms.lockedUntil.toString()).toMatch(
      new Date(Date.now() + LOCK_DURATION).toString()
    );
    expect(user.save).toHaveBeenCalled();
  });

  it("should throw an error if method locked and not met locked duration yet", async () => {
    user.TFA.sms.locked = true;
    user.TFA.sms.lockedUntil = new Date() + 1000;

    await expect(verifyAttempts(user, "sms")).rejects.toThrow(
      "Account temporarily locked due to too many failed attempts"
    );
  });

  it("should return true, unlock method and reset attempts if met locked duration", async () => {
    user.TFA.sms.locked = true;
    user.TFA.sms.lockedUntil = new Date() - 1000;

    const result = await verifyAttempts(user, "sms");
    expect(result).toBeTruthy();
    expect(user.TFA.sms.locked).toBeFalsy();
    expect(user.TFA.sms.attempts).toBe(0);
    expect(user.save).toHaveBeenCalled();
  });
});
