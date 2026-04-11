const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync("copies.json", "utf-8"));

/**
 * 🔤 Generate clean ID from text
 */
const generateId = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")   // remove symbols
    .replace(/\s+/g, "_")          // spaces → underscore
    .substring(0, 50);             // limit length
};

/**
 * 📍 Extract screen name from file path
 */
const getScreenFromFile = (filePath) => {
  if (!filePath) return "unknown";

  const parts = filePath.split("/");

  // Try to get meaningful screen name
  const fileName = parts[parts.length - 1];

  return fileName
    .replace(".js", "")
    .replace(".jsx", "")
    .replace(".tsx", "")
    .replace(".ts", "");
};

/**
 * 🧹 Filter only UI strings
 */
const isUIString = (item) => {
  const text = item.default_text?.toLowerCase() || "";
  const id = item._id?.toLowerCase() || "";

  if (!text || text.length < 2) return false;

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

  if (/^[0-9]/.test(text)) return false;
  if (text.length > 80) return false;

  if (text.includes("{") || text.includes("}") || text.includes(":")) return false;

  return true;
};

/**
 * 🧠 MAIN PROCESS
 */
const mapByText = {}; // merge by text

data.forEach(item => {
  if (!isUIString(item)) return;

  const cleanText = item.default_text.trim();
  const normalizedText = cleanText.toLowerCase();

  const screen = getScreenFromFile(item.file);

  // If already exists → MERGE
  if (mapByText[normalizedText]) {
    const existing = mapByText[normalizedText];

    // Add screen if not already included
    if (!existing.screens.includes(screen)) {
      existing.screens.push(screen);
    }

    // Add file reference
    existing.files.push({
      file: item.file,
      line: item.line
    });

  } else {
    // Create new entry
    const newId = generateId(cleanText);

    mapByText[normalizedText] = {
      _id: newId,
      default_text: cleanText,

      translations: {
        en: cleanText
      },

      screens: [screen],   // 👈 where used (UI grouping)
      files: [
        {
          file: item.file,
          line: item.line
        }
      ],

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
});

/**
 * 📦 Final result
 */
const result = Object.values(mapByText);

fs.writeFileSync("smart_copies.json", JSON.stringify(result, null, 2));

console.log(`🔥 Smart copies generated: ${result.length}`);