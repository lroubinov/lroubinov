const { withDangerousMod, withAppBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Pin Gradle to 8.x to avoid Gradle 9 breaking changes.
function withGradle8(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const wrapperProps = path.join(
        config.modRequest.platformProjectRoot,
        'gradle/wrapper/gradle-wrapper.properties'
      );
      if (fs.existsSync(wrapperProps)) {
        let content = fs.readFileSync(wrapperProps, 'utf8');
        content = content.replace(
          /distributionUrl=.*/,
          'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-all.zip'
        );
        fs.writeFileSync(wrapperProps, content);
      }
      return config;
    },
  ]);
}

// RN 0.81 bundles hermesc inside react-native/sdks/hermesc, not as a separate
// hermes-compiler npm package. Fix the generated build.gradle hermesCommand.
function withHermesCommandFix(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /hermesCommand\s*=\s*new File\([^\n]*hermes-compiler[^\n]*\n/,
      'hermesCommand = new File(["node", "--print", "require.resolve(\'react-native/package.json\')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"\n'
    );
    return config;
  });
}

module.exports = (config) => {
  config = withGradle8(config);
  config = withHermesCommandFix(config);
  return config;
};
