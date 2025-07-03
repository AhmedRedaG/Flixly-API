export const constants = {
  tfa: {
    TFA_DURATION: 1000 * 60 * 5,
    SMS_DURATION: 1000 * 60 * 15,
    LOCK_DURATION: 1000 * 60 * 15,
  },

  jwt: {
    ACCESS_TOKEN_AGE: "2h",
    REFRESH_TOKEN_AGE: "7d",
    RESET_TOKEN_AGE: "1h",
    TEMP_TOKEN_AGE: "10m",
  },
};
