const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('game', {
  launch: (wam) => ipcRenderer.invoke('game:launch', wam),
  login: () => ipcRenderer.invoke('game:login'),
  getAccount: () => ipcRenderer.invoke('game:getaccount'),
  checkLoginStatus: () => ipcRenderer.invoke('game:checkstatus'),
  checkWhitelistStatus: () => ipcRenderer.invoke('game:checkwhitelist'),
  resolveEssentialsConflict: () => ipcRenderer.invoke('game:resolvessentials')
})

contextBridge.exposeInMainWorld('launcher', {
  run: () => ipcRenderer.invoke('launcher:run'),
  update: () => ipcRenderer.invoke('launcher:update'),
  getChangelog: () => ipcRenderer.invoke('launcher:changelog'),
  updateRam: (ram) => ipcRenderer.invoke('launcher:updateram', ram)
})

contextBridge.exposeInMainWorld('socialmedia', {
  twitter: () => ipcRenderer.invoke('socialmedia:twitter'),
  discord: () => ipcRenderer.invoke('socialmedia:discord'),
  store: () => ipcRenderer.invoke('socialmedia:store')
})

contextBridge.exposeInMainWorld('settings', {
  openFolder: (mods) => ipcRenderer.invoke('settings:openfolder', mods),
  pasteBin: () => ipcRenderer.invoke('settings:pastebin'),
  logout: () => ipcRenderer.invoke('settings:logout'),
  thirdParty: () => ipcRenderer.invoke('settings:thirdparty')
});

contextBridge.exposeInMainWorld('link', {
  open: (supercoollink) => ipcRenderer.invoke('link:open', supercoollink)
});

contextBridge.exposeInMainWorld('modmanager', {
  fetchMods: () => ipcRenderer.invoke('modmanager:fetchmods'),
  toggleMod: (filename) => ipcRenderer.invoke('modmanager:togglemod', filename),
  showInFolder: (filename) => ipcRenderer.invoke('modmanager:showinfolder', filename),
  deleteMod: (filename) => ipcRenderer.invoke('modmanager:deletemod', filename),
  addMod: () => ipcRenderer.invoke('modmanager:addmod'),
});

contextBridge.exposeInMainWorld('electronAPI', {
  sendProgress: (callback) => ipcRenderer.on('sendProgress', (_event, value) => callback(value)),
  sendMessage: (callback) => ipcRenderer.on('sendMessage', (_event, value) => callback(value)),
  featuredServers: (callback) => ipcRenderer.on('featuredServers', (_event, value) => callback(value)),
  news: (callback) => ipcRenderer.on('news', (_event, value) => callback(value)),
  partners: (callback) => ipcRenderer.on('partners', (_event, value) => callback(value)),
  modslist: (callback) => ipcRenderer.on('modslist', (_event, value) => callback(value))
})