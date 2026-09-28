import fs from "node:fs";

const config = JSON.parse(fs.readFileSync(new URL("../app.json", import.meta.url), "utf8")).expo;
const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const listing = JSON.parse(fs.readFileSync(new URL("../store/listing/fa-IR.json", import.meta.url), "utf8"));
const releaseNotes = fs.readFileSync(new URL("../store/release-notes/fa-IR/default.txt", import.meta.url), "utf8").trim();
const sourceFiles = fs.readdirSync(new URL("../src", import.meta.url), { recursive: true })
  .filter((name) => /\.(ts|tsx)$/.test(String(name)))
  .map((name) => fs.readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8"))
  .join("\n");

const errors = [];
if (config.version !== pkg.version) errors.push("app.json and package.json versions must match");
if (config.android?.package !== "ir.khonenama.app") errors.push("Android package must remain ir.khonenama.app");
if (!Number.isInteger(config.android?.versionCode) || config.android.versionCode < 2) errors.push("Android versionCode must be an integer >= 2");
if (config.ios?.bundleIdentifier !== "ir.khonenama.app") errors.push("iOS bundleIdentifier must remain ir.khonenama.app");
if (!config.icon || !fs.existsSync(new URL(`../${config.icon}`, import.meta.url))) errors.push("App icon is missing");
if (!config.android?.adaptiveIcon?.foregroundImage) errors.push("Android adaptive foreground icon is missing");
if ([...listing.title].length > 30) errors.push("Google Play title must be <= 30 characters");
if ([...listing.shortDescription].length > 80) errors.push("Google Play short description must be <= 80 characters");
if ([...listing.fullDescription].length > 4000) errors.push("Google Play full description must be <= 4000 characters");
if ([...releaseNotes].length > 500) errors.push("Google Play release notes must be <= 500 characters");
if (!listing.fullDescription.includes("https://khonenama.ir/privacy")) errors.push("Privacy URL is missing from the store listing");
if (!listing.fullDescription.includes("https://khonenama.ir/account-deletion")) errors.push("Account deletion URL is missing from the store listing");
if (!config.plugins?.some((plugin) => Array.isArray(plugin) ? plugin[0] === "expo-notifications" : plugin === "expo-notifications")) errors.push("expo-notifications config plugin is missing");
if (!config.android?.blockedPermissions?.includes("android.permission.ACCESS_FINE_LOCATION")) errors.push("Unused precise location permission must stay blocked");
if (/mockRequests|mockChats/.test(sourceFiles)) errors.push("Mock owner data must not ship in production source");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Release config valid: ${config.android.package} ${config.version} (${config.android.versionCode})`);
