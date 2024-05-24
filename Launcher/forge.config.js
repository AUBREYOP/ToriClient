module.exports = {
  packagerConfig: {
    name: "Tori Launcher",
    icon: "resource/app-icon.ico",
    asar: true,
    "executableName": "torilauncher"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "ToriLauncher",
        loadingGif: 'build/install.gif',
        setupIcon: 'resource/favicon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          bin: "ToriLauncher",
          maintainer: "WifiRouter",
          homepage: "https://toriclient.com/",
          icon: 'resource/icon.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
