import i18n from "../i18n";
import userService from "../services/connection/userService";

/**
 * tSafe - safe translation helper
 * @param {string} key - translation key (matches _id in DB)
 * @param {string} fallback - default text if missing
 * @returns {string} translated text
 */

const requestedKeys = new Set();

export const tSafe = (key, fallback) => {
  const value = i18n.t(key);
  if (value === key && !requestedKeys.has(key)) {
    requestedKeys.add(key); // ✅ prevent duplicate calls

    userService.createCopy({
      _id: key,
      default_text: fallback || key,
    });
  }

  return value === key ? fallback || key : value;
};



