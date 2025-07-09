import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.unstable_mockModule("speakeasy", () => ({
  totp: {
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest
      .fn()
      .mockImplementation((backupCode, savedCode) => backupCode === savedCode),
  },
}));

const bcrypt = await import("bcrypt");
const { totp } = await import("speakeasy");
const { verifyAttempts, verifySmsCode, verifyTotpCode, verifyBackupCode } =
  await import("../../src/utilities/tfaHelper.js");

import * as configs from "../../src/config/index.js";

const { LOCK_DURATION, MAX_ATTEMPTS, SMS_DURATION } = configs.constants.tfa;

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
      sms: { status: false, attempts: 0, locked: false },
      totp: { status: false, attempts: 0, locked: false },
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

const TFACode = 123456;
const wrongTFACode = 123789;

describe("verifySmsCode", () => {
  it("should throw error if no sms code was set", async () => {
    expect(verifyAttempts(user, "sms")).resolves.toBeTruthy();
    await expect(verifySmsCode(user, TFACode)).rejects.toThrow(
      "No active SMS code found"
    );
  });

  it("should throw error if code expired", async () => {
    user.TFA.sms.code = TFACode;
    user.TFA.sms.expiredAt = new Date() - 1000;
    await expect(verifySmsCode(user, TFACode)).rejects.toThrow(
      "2FA token expired"
    );
  });

  it("should throw error if code not matched saved one", async () => {
    user.TFA.sms.code = wrongTFACode;
    user.TFA.sms.expiredAt = new Date() + SMS_DURATION;
    await expect(verifySmsCode(user, TFACode)).rejects.toThrow(
      "Invalid 2FA token"
    );
  });

  it("should return true in case of all conditions verified", async () => {
    user.TFA.sms.code = TFACode;
    user.TFA.sms.expiredAt = new Date() + SMS_DURATION;
    await expect(verifySmsCode(user, TFACode)).resolves.toBeTruthy();
  });
});

describe("verifyTotpCode", () => {
  it("should throw error if code not valid", async () => {
    expect(verifyAttempts(user, "totp")).resolves.toBeTruthy();
    totp.verify.mockReturnValueOnce(false);
    await expect(verifyTotpCode(user, TFACode)).rejects.toThrow(
      "Invalid 2FA token"
    );
  });

  it("should return true in case of all conditions verified", async () => {
    totp.verify.mockReturnValueOnce(true);
    await expect(verifyTotpCode(user, TFACode)).resolves.toBeTruthy();
  });
});

const usedCodes = [{ code: 1, used: true }];
const unusedCodes = [{ code: 1, used: false }];
const validCode = 1;
const invalidCode = -1;

describe("verifyBackupCode", () => {
  it("should throw error if all saved codes is used", async () => {
    user.TFA.backupCodes = usedCodes;
    await expect(verifyBackupCode(user, validCode)).rejects.toThrow(
      "All backup codes have been used"
    );
  });

  it("should throw error if no matched code found", async () => {
    user.TFA.backupCodes = unusedCodes;
    await expect(verifyBackupCode(user, invalidCode)).rejects.toThrow(
      "Backup code is Invalid"
    );
  });

  it("should return true and update the code status to be used", async () => {
    user.TFA.backupCodes = unusedCodes;
    await expect(verifyBackupCode(user, validCode)).resolves.toBeTruthy();
    expect(user.TFA.backupCodes[0].used).toBeTruthy();
  });
});
