const fs = require("fs");

const data = JSON.parse(fs.readFileSync("copies.json", "utf-8"));

const isUIString = (item) => {
  const text = item.default_text?.toLowerCase() || "";
  const id = item._id?.toLowerCase() || "";

  // ❌ Remove empty or short junk
  if (!text || text.length < 2) return false;

  // ❌ Remove technical keywords
  const blacklist = [
    "json",
    "response",
    "error",
    "token",
    "oauth",
    "client",
    "config",
    "module",
    "utf",
    "js",
    "jsx",
    "typescript",
    "console",
    "log",
  ];

  if (blacklist.some(word => id.includes(word) || text.includes(word))) {
    return false;
  }

  // ❌ Remove keys starting with numbers
  if (/^[0-9]/.test(id)) return false;

  // ❌ Remove long weird keys
  if (id.length > 40) return false;

  // ❌ Remove file-related entries
  if (item.file && item.file.includes("secret.js")) return false;

  // ❌ Remove all lowercase technical phrases
  if (text === text.toLowerCase() && text.length > 20) return false;

  // remove sentences that are too "technical"
  if (text.includes(":") || text.includes("{") || text.includes("}")) return false;

  // ✅ Keep UI-like text (has capital letter or normal phrase)
  return true;
};

const unique = {};

data.forEach(item => {
  if (!isUIString(item)) return;

  const key = item._id.toLowerCase();

  if (!unique[key]) {
    unique[key] = {
      ...item,
      _id: key,
      default_text: item.default_text.trim(),
      translations: {
        en: item.default_text.trim()
      }
    };
  }
});

const result = Object.values(unique);

fs.writeFileSync("ui_copies.json", JSON.stringify(result, null, 2));

console.log(`✅ UI copies cleaned: ${result.length}`);