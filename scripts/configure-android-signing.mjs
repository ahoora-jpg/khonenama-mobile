import { readFile, writeFile } from 'node:fs/promises';

const buildGradlePath = new URL('../android/app/build.gradle', import.meta.url);
let source = await readFile(buildGradlePath, 'utf8');

const debugConfig = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
`;

const releaseConfig = `${debugConfig}        release {
            def productionStoreFile = System.getenv('KHONENAMA_STORE_FILE')
            if (!productionStoreFile) {
                throw new GradleException('KHONENAMA_STORE_FILE is required for a release build')
            }
            storeFile file(productionStoreFile)
            storePassword System.getenv('KHONENAMA_STORE_PASSWORD')
            keyAlias System.getenv('KHONENAMA_KEY_ALIAS')
            keyPassword System.getenv('KHONENAMA_KEY_PASSWORD')
        }
`;

if (!source.includes(debugConfig)) {
  throw new Error('Could not locate the generated Android debug signing configuration.');
}

const debugReleaseLine = '            signingConfig signingConfigs.debug';
const occurrences = source.split(debugReleaseLine).length - 1;
if (occurrences !== 2) {
  throw new Error(`Expected two debug signing references, found ${occurrences}.`);
}

source = source.replace(debugConfig, releaseConfig);
const releaseBlockStart = source.indexOf('        release {', source.indexOf('    buildTypes {'));
const releaseSigningIndex = source.indexOf(debugReleaseLine, releaseBlockStart);
if (releaseSigningIndex === -1) {
  throw new Error('Could not locate the release signing configuration.');
}

source =
  source.slice(0, releaseSigningIndex) +
  '            signingConfig signingConfigs.release' +
  source.slice(releaseSigningIndex + debugReleaseLine.length);

await writeFile(buildGradlePath, source);
console.log('Configured Android release signing with the production keystore.');
