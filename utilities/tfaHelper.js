export const generateBackupCodes = () => {
  // 8 backup codes, 8 digits each
  return Array.from({ length: 8 }, () => ({
    code: Math.floor(10000000 + Math.random() * 90000000).toString(),
    used: false,
  }));
};
