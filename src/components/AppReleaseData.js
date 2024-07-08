import packageJson from '../../package.json';

export var AppReleaseData = {
    appName: packageJson.name,
    appVersion: packageJson.version,
    appBuildDate: packageJson.genesys_custom_software.builddate
}