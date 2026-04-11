const fs = require("fs");
const axios = require("axios");

// 📂 Input / Output files
const INPUT_FILE = "smart_copies.json";
const OUTPUT_FILE = "translated_copies.json";

// 🌍 LibreTranslate local endpoint
const API_URL = "http://127.0.0.1:5000/translate";

// 📥 Load data
const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

// 🧠 Cache (avoid duplicate API calls)
const cache = {};

// 🔁 Translate function
const translate = async (text, target) => {
  const cacheKey = `${text}_${target}`;

  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await axios.post(API_URL, {
      q: text,
      source: "en",
      target: target,
      format: "text"
    });

    const translated = res.data.translatedText;

    cache[cacheKey] = translated;

    return translated;
  } catch (err) {
    console.log(`❌ Error translating "${text}" → ${target}`);
    return text; // fallback
  }
};

// 🚀 Main runner
const run = async () => {
  console.log(`🌍 Starting translation of ${data.length} items...\n`);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    const text = item.default_text;

    // ✅ Skip if already translated
    if (
      item.translations &&
      item.translations.es &&
      item.translations.fr
    ) {
      console.log(`⏭️ Skipping (already translated): ${text}`);
      continue;
    }

    console.log(`🔤 Translating (${i + 1}/${data.length}): ${text}`);

    const es = await translate(text, "es");
    const fr = await translate(text, "fr");

    item.translations = {
      en: text,
      es,
      fr
    };

    item.updated_at = new Date().toISOString();

    // ⚡ Small delay (prevents overload)
    await new Promise(res => setTimeout(res, 100));
  }

  // 💾 Save result
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log("\n✅ Translation completed!");
};

run();