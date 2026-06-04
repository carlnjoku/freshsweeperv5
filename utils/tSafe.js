// import i18n from "../i18n";
// import userService from "../services/connection/userService";

// /**
//  * tSafe - safe translation helper
//  * @param {string} key - translation key (matches _id in DB)
//  * @param {string} fallback - default text if missing
//  * @returns {string} translated text
//  */

// const requestedKeys = new Set();

// export const tSafe = (key, fallback) => {
//   const value = i18n.t(key);
//   if (value === key && !requestedKeys.has(key)) {
//     requestedKeys.add(key); // ✅ prevent duplicate calls

//     userService.createCopy({
//       _id: key,
//       default_text: fallback || key,
//     });
//   }

//   return value === key ? fallback || key : value;
// };



import i18n from "../i18n";
import userService from "../services/connection/userService";

const requestedKeys = new Set();

/**
 * tSafe - safe translation helper with interpolation
 * @param {string} key - translation key (matches _id in DB)
 * @param {string} fallback - default text (may contain placeholders like {name})
 * @param {object} params - optional key-value pairs for interpolation
 * @returns {string} translated text with placeholders replaced
 */
export const tSafe = (key, fallback, params = {}) => {
  const value = i18n.t(key);
  const isMissing = value === key;
  
  if (isMissing && !requestedKeys.has(key)) {
    requestedKeys.add(key);
    // Store the raw fallback (with placeholders) for future translation
    userService.createCopy({
      _id: key,
      default_text: fallback || key,
    });
  }
  
  // Get the raw text (translated or fallback)
  const rawText = isMissing ? (fallback || key) : value;
  
  // Replace all {placeholder} with params.placeholder
  let result = rawText;
  Object.keys(params).forEach((paramKey) => {
    const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
    result = result.replace(regex, params[paramKey]);
  });
  
  return result;
};

