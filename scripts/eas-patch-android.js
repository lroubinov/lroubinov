#!/usr/bin/env node
// Runs after expo prebuild on EAS to fix two known issues with the generated
// android/app/build.gradle when using Expo SDK 55 + React Native 0.81:
//   1. hermesCommand uses require.resolve('hermes-compiler') which doesn't
//      exist in RN 0.81 — removing it lets the RN Gradle plugin find hermesc
//      automatically via its own fallback (sdks/hermesc/%OS-BIN%/hermesc).
//   2. reactNativeDir and codegenDir use node-command resolution that can
//      return null when executed from the android/ subdirectory — replace with
//      static projectRoot-relative paths that never fail.
// Also pins the Gradle wrapper to 8.13 because Gradle 9 removed the Groovy
// ProcessGroovyMethods.execute() API used elsewhere in the build scripts.

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const buildGradle = path.join(projectRoot, 'android', 'app', 'build.gradle');
const wrapperProps = path.join(projectRoot, 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');

if (fs.existsSync(buildGradle)) {
  let content = fs.readFileSync(buildGradle, 'utf8');

  // 1. Delete hermesCommand line entirely
  content = content.split('\n').filter(line => !line.includes('hermesCommand')).join('\n');

  // 2. Replace fragile node-resolution for reactNativeDir
  content = content.replace(
    /reactNativeDir\s*=\s*new File\(.*\)\.getParentFile\(\)\.getAbsoluteFile\(\)/,
    'reactNativeDir = new File(projectRoot + "/node_modules/react-native")'
  );

  // 3. Replace fragile node-resolution for codegenDir
  content = content.replace(
    /codegenDir\s*=\s*new File\(.*\)\.getParentFile\(\)\.getAbsoluteFile\(\)/,
    'codegenDir = new File(projectRoot + "/node_modules/@react-native/codegen")'
  );

  fs.writeFileSync(buildGradle, content);
  console.log('✓ Patched android/app/build.gradle');
} else {
  console.error('✗ android/app/build.gradle not found — prebuild may have failed');
  process.exit(1);
}

if (fs.existsSync(wrapperProps)) {
  let content = fs.readFileSync(wrapperProps, 'utf8');
  content = content.replace(
    /distributionUrl=.*/,
    'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-all.zip'
  );
  fs.writeFileSync(wrapperProps, content);
  console.log('✓ Pinned Gradle wrapper to 8.13');
}
