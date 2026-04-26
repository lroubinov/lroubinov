const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Gradle 9 removed Groovy's String.execute() API which React Native build
// scripts rely on. Pin to Gradle 8.13 to avoid the getAbsolutePath() crash.
module.exports = (config) => {
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
};
