#!/usr/bin/env node

/**
 * Gradle 9 Verification Script
 *
 * Run this script to verify your local environment is Gradle 9 ready
 * Usage: node verify-gradle9.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Gradle 9 Compatibility Checker\n");

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

// Check 1: Node.js version
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

  if (majorVersion >= 18) {
    checks.passed.push(`✅ Node.js ${nodeVersion} (>= 18 required)`);
  } else {
    checks.failed.push(`❌ Node.js ${nodeVersion} (>= 18 required)`);
  }
} catch (error) {
  checks.failed.push("❌ Could not detect Node.js version");
}

// Check 2: Java version
try {
  const javaVersion = execSync("java -version 2>&1", { encoding: "utf-8" });
  const match = javaVersion.match(/version "?(\d+)/);

  if (match && parseInt(match[1]) >= 17) {
    checks.passed.push(
      `✅ Java ${match[1]} detected (>= 17 required for Gradle 9)`,
    );
  } else {
    checks.failed.push(
      `❌ Java version not compatible. Gradle 9 requires Java 17+`,
    );
  }
} catch (error) {
  checks.failed.push("❌ Java not found. Install Java 17+ for Gradle 9");
}

// Check 3: EAS CLI
try {
  const easVersion = execSync("eas --version 2>&1", {
    encoding: "utf-8",
  }).trim();
  checks.passed.push(`✅ EAS CLI ${easVersion} installed`);
} catch (error) {
  checks.warnings.push(
    "⚠️  EAS CLI not found. Install with: npm install -g eas-cli",
  );
}

// Check 4: eas.json configuration
try {
  const easJsonPath = path.join(__dirname, "eas.json");

  if (fs.existsSync(easJsonPath)) {
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));

    // Check for latest image
    const hasLatestImage = Object.values(easJson.build || {}).some(
      (profile) => profile.android?.image === "latest",
    );

    if (hasLatestImage) {
      checks.passed.push("✅ eas.json configured with latest build image");
    } else {
      checks.warnings.push(
        '⚠️  eas.json missing "image": "latest" - add this for Gradle 9',
      );
    }

    // Check for GRADLE_OPTS
    const hasGradleOpts = Object.values(easJson.build || {}).some(
      (profile) => profile.env?.GRADLE_OPTS,
    );

    if (hasGradleOpts) {
      checks.passed.push("✅ GRADLE_OPTS configured for optimal memory");
    } else {
      checks.warnings.push("⚠️  GRADLE_OPTS not set - builds may be slower");
    }
  } else {
    checks.failed.push("❌ eas.json not found");
  }
} catch (error) {
  checks.failed.push(`❌ Error reading eas.json: ${error.message}`);
}

// Check 5: package.json
try {
  const packageJsonPath = path.join(__dirname, "..", "..", "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Check Expo SDK version
    const expoVersion = packageJson.dependencies?.expo;
    if (expoVersion) {
      checks.passed.push(`✅ Expo SDK detected: ${expoVersion}`);
    }
  }
} catch (error) {
  checks.warnings.push("⚠️  Could not verify package.json");
}

// Check 6: Android folder (if prebuilt)
const androidPath = path.join(__dirname, "android");
if (fs.existsSync(androidPath)) {
  checks.warnings.push(
    "⚠️  Android folder exists (managed workflow uses prebuild)",
  );

  // Check gradle-wrapper.properties
  const gradleWrapperPath = path.join(
    androidPath,
    "gradle",
    "wrapper",
    "gradle-wrapper.properties",
  );
  if (fs.existsSync(gradleWrapperPath)) {
    const wrapperContent = fs.readFileSync(gradleWrapperPath, "utf-8");
    if (wrapperContent.includes("gradle-9")) {
      checks.passed.push("✅ Gradle wrapper configured for version 9.x");
    } else {
      checks.warnings.push(
        "⚠️  Gradle wrapper not set to version 9.x - run: cd android && ./gradlew wrapper --gradle-version 9.0",
      );
    }
  }

  // Check gradle.properties
  const gradlePropsPath = path.join(androidPath, "gradle.properties");
  if (fs.existsSync(gradlePropsPath)) {
    const propsContent = fs.readFileSync(gradlePropsPath, "utf-8");
    if (propsContent.includes("org.gradle.jvmargs")) {
      checks.passed.push("✅ gradle.properties configured with JVM args");
    } else {
      checks.warnings.push(
        "⚠️  gradle.properties missing JVM args - see GRADLE9_SETUP.md",
      );
    }
  } else {
    checks.warnings.push(
      "⚠️  gradle.properties not found - see GRADLE9_SETUP.md for template",
    );
  }
}

// Print results
console.log("═══════════════════════════════════════════════════════\n");

if (checks.passed.length > 0) {
  console.log("✅ PASSED CHECKS:\n");
  checks.passed.forEach((check) => console.log(`  ${check}`));
  console.log("");
}

if (checks.warnings.length > 0) {
  console.log("⚠️  WARNINGS:\n");
  checks.warnings.forEach((warning) => console.log(`  ${warning}`));
  console.log("");
}

if (checks.failed.length > 0) {
  console.log("❌ FAILED CHECKS:\n");
  checks.failed.forEach((fail) => console.log(`  ${fail}`));
  console.log("");
}

console.log("═══════════════════════════════════════════════════════\n");

// Summary and recommendations
if (checks.failed.length === 0) {
  console.log("🎉 Your environment is Gradle 9 ready!\n");
  console.log("Recommended next steps:");
  console.log("  1. Run: eas build --platform android --profile production");
  console.log('  2. Check build logs for "Gradle 9.0" confirmation');
  console.log("  3. See GRADLE9_SETUP.md for detailed documentation\n");
} else {
  console.log("⚠️  Some checks failed. Please fix the issues above.\n");
  console.log("For EAS Build (recommended), you only need:");
  console.log('  ✅ eas.json with "image": "latest"');
  console.log("  ✅ GRADLE_OPTS environment variable");
  console.log("\nFor local builds, you also need:");
  console.log("  ✅ Java 17+");
  console.log("  ✅ gradle.properties file");
  console.log("  ✅ Updated gradle wrapper\n");
}

console.log("📚 Full setup guide: ./GRADLE9_SETUP.md\n");

process.exit(checks.failed.length > 0 ? 1 : 0);
