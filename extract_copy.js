// const fs = require("fs");
// const glob = require("glob");
// const parser = require("@babel/parser");
// const traverse = require("@babel/traverse").default;

// const files = glob.sync("**/*.{js,jsx,ts,tsx}", {
//   ignore: [
//     "node_modules/**",
//     ".expo/**",
//     "android/**",
//     "ios/**",
//     "dist/**",
//     "build/**",
//   ],
// });

// const copies = [];

// files.forEach((file) => {
//   try {
//     console.log("🔍 Scanning:", file);

//     const code = fs.readFileSync(file, "utf-8");

//     const ast = parser.parse(code, {
//       sourceType: "module",
//       plugins: ["jsx", "typescript"],
//       errorRecovery: true,
//     });

//     traverse(ast, {
//       JSXText(path) {
//         const text = path.node.value.replace(/\s+/g, " ").trim();

//         if (text && text.length > 2) {
//           copies.push({
//             text,
//             file,
//             line: path.node.loc?.start.line,
//           });
//         }
//       },

//       StringLiteral(path) {
//         const text = path.node.value;

//         if (
//           text.length > 2 &&
//           /[a-zA-Z]/.test(text) &&
//           !text.startsWith("http") &&
//           !text.includes("/") &&
//           !text.includes("_id")
//         ) {
//           copies.push({
//             text,
//             file,
//             line: path.node.loc?.start.line,
//           });
//         }
//       },
//     });
//   } catch (err) {
//     console.log(`❌ Error in file: ${file}`);
//   }
// });

// fs.writeFileSync("copies.json", JSON.stringify(copies, null, 2));

// console.log(`✅ Found ${copies.length} copies`);




// #!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// 🔑 Generate clean key from text
function generateKey(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

// 📂 Get all files (Expo-friendly)
const files = glob.sync("**/*.{js,jsx,ts,tsx}", {
  ignore: [
    "node_modules/**",
    ".expo/**",
    "android/**",
    "ios/**",
    "dist/**",
    "build/**",
  ],
});

const copies = [];

files.forEach((file) => {
  try {
    console.log("🔍 Scanning:", file);

    const code = fs.readFileSync(file, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });

    traverse(ast, {
      // ✅ JSX TEXT (e.g. <Text>View schedule</Text>)
      JSXText(path) {
        const text = path.node.value.replace(/\s+/g, " ").trim();

        if (
          text &&
          text.length > 2 &&
          /[a-zA-Z]/.test(text) &&
          !text.match(/^(ok|yes|no)$/i)
        ) {
          copies.push({
            text,
            file,
            line: path.node.loc?.start.line,
          });
        }
      },

      // ✅ STRING LITERALS (e.g. "Submit", "Cancel")
      StringLiteral(path) {
        const text = path.node.value.trim();

        const isValid =
          text.length > 2 &&
          /[a-zA-Z]/.test(text) &&
          !text.match(/^(utf8|true|false|null)$/i) &&
          !text.startsWith("http") &&
          !text.includes("/") &&
          !text.includes("_id") &&
          !text.includes("console") &&
          !text.includes("process.env") &&
          !text.includes("=") &&
          !text.includes("{") &&
          !text.includes("}");

        if (isValid) {
          copies.push({
            text,
            file,
            line: path.node.loc?.start.line,
          });
        }
      },
    });
  } catch (err) {
    console.log(`❌ Error in file: ${file}`);
  }
});


// ✅ STEP 2: REMOVE DUPLICATES
const uniqueCopies = Array.from(
  new Map(copies.map((item) => [item.text, item])).values()
);


// ✅ STEP 3: GENERATE KEYS + FINAL STRUCTURE
const finalCopies = uniqueCopies.map((item) => ({
  _id: generateKey(item.text),
  default_text: item.text,
  translations: {
    en: item.text,
  },
  file: item.file,
  line: item.line,
  created_at: new Date(),
  updated_at: new Date(),
}));


// 💾 SAVE FILE
fs.writeFileSync("copies.json", JSON.stringify(finalCopies, null, 2));

console.log(`\n✅ Done! Found ${finalCopies.length} unique copies`);