const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron/main')
const { shell, dialog, globalShortcut } = require('electron');
const process = require('node:process');
if (require('electron-squirrel-startup')) process.exit();
const path = require('node:path')

const { Client } = require("minecraft-launcher-core");
const launcher = new Client();
const { Auth, assets, lst } = require("msmc");
const msmc = require('msmc');
const authManager = new Auth("select_account");

const fs = require('node:fs');
const https = require('https');
const axios = require('axios');
const os = require("os");

const { parse } = require('url')
const http = require('https')
const { basename } = require('path')

var exec = require('child_process').execSync;

const decompress = require('decompress');
const unzipper = require('unzipper');

const request = require("request");
const fetch = require('node-fetch');

const JDK_VER = "jdk-17.0.9+9";
const JDK_FILE = "jdk17.zip";
const JDK_DL = "https://cdn.toriclient.com/java/jdk17.zip";

var datafolder = path.resolve(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share"), "torilauncher/");
var dotminecraft = path.resolve(datafolder, ".minecraft");
var configfile = path.resolve(datafolder, "config.json");

if(!fs.existsSync(datafolder + "/english.json")) {
  fetch("https://raw.githubusercontent.com/Hanro50/MSMC/main/lexipacks/english.json", {method: "GET"})
    .then(res => res.json())
    .then((json) => {
      fs.writeFileSync(datafolder + "/english.json", JSON.stringify(json));
    })
    .then(() => {
      assets.loadLexiPack(datafolder + "/english.json");
    });
}

console.log("All launcher output is piped to launcher.log. No information will be displayed in the console.")
var access = fs.createWriteStream('launcher.log');
process.stdout.write = process.stderr.write = access.write.bind(access);

process.on('uncaughtException', function(err) {
  console.error((err && err.stack) ? err.stack : err);
});

var win = null;
var uploadedalready = false;
var gamerunning = false;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 1023,
    minHeight: 563,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        //devTools: false
    },
    icon: path.join(__dirname, 'resource/favicon.ico')
  })
  console.log("[INFO] Loading main window...");

  win.loadFile('index.html')
  win.setMenuBarVisibility(false);

  win.on('close', function (e) {
    if(gamerunning) {
      let response = dialog.showMessageBoxSync(this, {
        type: 'warning',
        buttons: ['Yes', 'No'],
        title: 'Confirm close',
        message: 'Your game is still running, are you sure you want to quit?\nClosing the launcher will close your game.'
      });
  
      if(response == 1) e.preventDefault();
    }
  });
}

ipcMain.handle("link:open", (event, url) => {
  shell.openPath(url);
})

ipcMain.handle("socialmedia:twitter", () => {
  console.log("[INFO] Opening Twitter...");
  shell.openPath("https://twitter.com/ToriClient");
});

ipcMain.handle("socialmedia:discord", () => {
  console.log("[INFO] Opening Discord...");
  shell.openPath("https://discord.gg/4GvHfbZ84c");
});

ipcMain.handle("socialmedia:store", () => {
  console.log("[INFO] Opening store...");
  shell.openPath("https://toriclient.tebex.io/");
});

ipcMain.handle("settings:thirdparty", () => {
  console.log("[INFO] Opening third party credits...");
  shell.openPath("https://toriclient.com/thirdparty.txt");
});

ipcMain.handle("launcher:changelog", async () => {
  if(fs.existsSync("changelog.txt")) {
    return "no more :(";
  }
  const changelog_dl = fs.createWriteStream("changelog.txt");
  await https.get("https://cdn.toriclient.com/launcher/changelog.txt", function(response) {
    response.pipe(changelog_dl);
    changelog_dl.on("finish", async () => {
      changelog_dl.close();
    });
  }); 
});

ipcMain.handle("settings:logout", () => {
  try {
    if(fs.existsSync(datafolder + "/auth.key")){fs.unlinkSync(datafolder + "/auth.key");} else {return "not_logged_in"}
    return "done";
  } catch(err) {
    console.log(err);
    return err.message;
  }
});

ipcMain.handle("settings:openfolder", (event, mods) => {
  if(fs.existsSync(dotminecraft)) {
    if(!mods) {
      shell.openPath(path.normalize(dotminecraft), err => {if(err) {return err;}});
    } else {
      shell.openPath(path.normalize(dotminecraft + "/mods"), err => {if(err) {return err;}});
    }
  } else {
    return ".minecraft folder not found! Please launch the game first.";
  }
})

ipcMain.handle("modmanager:showinfolder", (event, filename) => {
  if(!fs.existsSync(dotminecraft + "/mods/" + filename)) {
    if(!fs.existsSync(dotminecraft + "/mods/" + filename + ".disabled")) {
      let response = dialog.showMessageBoxSync(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ToriLauncher - Error!',
        message: `Something went wrong while trying to show file in folder. Are you sure it exists?\nFile: ${filename}\n\nIf you believe this is a bug, please report it to our development team!`
      });
      return;
    }
    shell.showItemInFolder(path.normalize(dotminecraft + "/mods/" + filename + ".disabled"));
    return;
  }
  shell.showItemInFolder(path.normalize(dotminecraft + "/mods/" + filename));
});

ipcMain.handle("modmanager:deletemod", (event, filename) => {
  if(essentialmods.includes(modlist[filename]["name"])) {
    let response = dialog.showMessageBoxSync(win, {
      type: 'warning',
      buttons: ['OK'],
      title: 'ToriLauncher - Action denied.',
      message: `You cannot delete ${filename}. If you believe this is an error,\nplease contact the development team.`
    });
    return;
  }
  let response = dialog.showMessageBoxSync(win, {
    type: 'warning',
    buttons: ['Yes', 'No'],
    title: 'Permanently delete mod?',
    message: `Are you sure you want to delete ${filename}?\nThis cannot be undone!`
  });

  if(response == 1) {
    // no
    console.log("[INFO] Mod deletion cancelled for mod " + filename)
  } else {
    // yes
    try {
      fs.rmSync(dotminecraft + "/mods/" + filename);
      console.log("[INFO] Successfully deleted mod " + filename);
    } catch(err) {
      try {
        fs.rmSync(dotminecraft + "/mods/" + filename + ".disabled");
        console.log("[INFO] Successfully deleted mod " + filename);
      } catch(e) {
        let response = dialog.showMessageBoxSync(win, {
          type: 'error',
          buttons: ['OK'],
          title: 'ToriLauncher - Error!',
          message: `Something went wrong while trying to delete that file. Are you sure it exists?\nFile: ${filename}\n\nIf you believe this is a bug, please report it to our development team!`
        });
        console.log(e);
      }
    }
    // refresh list
    win.webContents.send('sendMessage', {"message": "modmanager.addedmod"});
  }
});

var essentialmodjar = null;

ipcMain.handle("game:resolvessentials", async () => {
  let response = dialog.showMessageBoxSync(win, {
    type: 'error',
    buttons: ['Disable Essentials', 'Disable World Host', 'Ignore (Launch anyway)'],
    title: 'ToriLauncher - Mod conflict!',
    message: `It looks like you have Essentials installed, which is not compatible with one of our core mods, World Host. If you do not know what this means and you would like to use Essentials, disable World Host. If you choose to launch anyway, you will not get any support for any issues. What would you like to do?`
  });
  if(response === 0) {win.webContents.send('sendMessage', {"message": "conflict.essentials.resolved", "mod": "essential", "jar": essentialmodjar});}
  if(response === 1) {win.webContents.send('sendMessage', {"message": "conflict.essentials.resolved", "mod": "worldhost"});}
  if(response === 2) {win.webContents.send('sendMessage', {"message": "conflict.essentials.resolved", "mod": "ignore"});}
});

ipcMain.handle("modmanager:togglemod", (event, filename) => {
  if(filename.endsWith(".jar")) {
    fs.renameSync(dotminecraft + "/mods/" + filename, dotminecraft + "/mods/" + filename + ".disabled");
  } else if(filename.endsWith(".jar.disabled")) {
    fs.renameSync(dotminecraft + "/mods/" + filename, dotminecraft + "/mods/" + filename.slice(0, -9));
  } else {
    dialog.showMessageBoxSync(win, {
      type: 'error',
      buttons: ['OK'],
      title: 'ToriLauncher - Error!',
      message: `Failed to toggle the mod ${filename}.`
    });
    console.log("[ERROR] Failed to toggle the status of mod " + filename);
  }
});

ipcMain.handle("modmanager:addmod", async () => {
  dialog.showOpenDialog(null, {
    title: "Select a Fabric mod (.jar)",
    properties: ['openFile', 'multiSelections'],
    filters: [{name: "Fabric mod", extensions: ["jar"]}]
  }).then((files) => {
    if (files && !files["canceled"]) {
      console.log(files);
      for(file in files["filePaths"]) {
        fs.copyFileSync(files["filePaths"][file], dotminecraft + "/mods/" + basename(files["filePaths"][file]));
        console.log("[SUCCESS] Added mod " + basename(files["filePaths"][file]));
      }
      win.webContents.send('sendMessage', {"message": "modmanager.addedmod"});
    }
  })
});

ipcMain.handle("game:checkwhitelist", async () => {
  while(typeof username === 'undefined') {await sleep(100);}
  const whitelist = await fetch("https://api.toriclient.com/launcher/whitelist").then(res => res.json());
  const trimmeduuid = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`).then(data => data.json()).then(player => player.id);
  const sections = [trimmeduuid.slice(0, 8), trimmeduuid.slice(8, 12), trimmeduuid.slice(12, 16), trimmeduuid.slice(16, 20), trimmeduuid.slice(20, 32)];
  const formattedUUID = `${sections[0]}-${sections[1]}-${sections[2]}-${sections[3]}-${sections[4]}`;
  if(whitelist.includes(formattedUUID)) {
    win.webContents.send('sendMessage', {"message": "whitelist.success"});
    console.log("[INFO] Player " + username + " is whitelisted!")
  } else {
    win.webContents.send('sendMessage', {"message": "whitelist.fail"});
    console.log("[WARN] Player " + username + " is not whitelisted!")
  }
});

var modlist = {};
var essentialmods = null;
ipcMain.handle("modmanager:fetchmods", async () => {

  // I HAVE NO FUCKING CLUE WHAT I WAS ON WHEN I WAS MAKING THIS
  // BUT IT WORKS
  // SO IM NOT GONNA TOUCH IT
  // :D

  console.log("[INFO] Scanning mod folder... this may take a moment...");
  // get list of essential mods => mods you should not be able to disable
  await fetch("https://api.toriclient.com/launcher/essential", {method: "GET"})
    .then(res => res.json())
    .then((json) => {
      essentialmods = json;
    });
  if(fs.existsSync(dotminecraft + "/mods/tmp/")) {fs.rmSync(dotminecraft + "/mods/tmp/", { recursive: true, force: true });}
  var count = 0;
  var totalcount = -1;
  modlist = {};
  // make sure it aint empty first

  if(!fs.existsSync(dotminecraft + "/mods/") || fs.readdirSync(dotminecraft + "/mods/").length === 0) {
    console.log("[WARN] Mod folder empty! You may need to launch the game first.");
    win.webContents.send('sendMessage', {"message": "modlist", "response": "empty"});
    return;
  }

  fs.mkdirSync(dotminecraft + "/mods/tmp/");
  fs.readdir(dotminecraft + "/mods/", (err, files) => {
    files.forEach(file => {if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {totalcount++;}});
    if (err) {
      console.error('[ERROR] Error reading from mods folder: ', err);
      return;
    }
    files.forEach(file => {
      const filePath = path.join(dotminecraft + "/mods/", file);
      if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {
        fs.createReadStream(dotminecraft + "/mods/" + file)
          .pipe(unzipper.Parse())
          .on('entry', function (entry) {
            if (entry.path === "fabric.mod.json") {
              entry.pipe(fs.createWriteStream(dotminecraft + "/mods/tmp/" + file + ".json"));
            } else {entry.autodrain();}
          })
          .on('close', () => {
            try {
              goofy = JSON.parse(fs.readFileSync(dotminecraft + "/mods/tmp/" + file + ".json", 'utf8'));
              var essential = null;
              if(essentialmods.includes(goofy['name'])) {essential = true;} else {essential = false;}
              if(goofy['id'] === "essential-container") {essentialmodjar = file; goofy['name'] = goofy['custom']['modmenu'] ['parent']['name']; goofy['description'] = goofy['custom']['modmenu'] ['parent']['description'];}
              if(file.endsWith(".jar")) {modlist[file] = {"name": goofy['name'], "desc": goofy['description'], "enabled": true, "id": goofy['id'], "essential": essential}} else {modlist[file] = {"name": goofy['name'], "desc": goofy['description'], "enabled": false, "essential": essential}}
              if(goofy['id'] === "essential-container") {win.webContents.send('sendMessage', {"message": "essentialsjar", "response": essentialmodjar});}
              delete goofy;
            } catch(e) {
              console.log("[WARN] Failed to read metadata from " + file + ". Skipping."); 
              var essential = null;
              if(essentialmods.includes(file)) {essential = true;} else {essential = false;}
              if(file.endsWith(".jar")) {modlist[file] = {"name": file, "desc": "", "enabled": true, "essential": essential}} else {modlist[file] = {"name": file, "desc": "", "enabled": false, "essential": essential}}
            }
            count++;
            if(count > totalcount) {count = totalcount}
            console.log("[INFO] Scanning mod " + file + "... (" + count + "/" + totalcount + ")");
          });
      }
    });
  });
  // wait for everything to finish. cheeky but works lmao
  while(totalcount === -1) {await sleep(10);}
  while(count != totalcount) {await sleep(100);}
  console.log("[INFO] Metadata scan finished. Scanned " + count + "/" + totalcount + " mods.");
  console.log("[INFO] Starting icon scan... this may take a moment.");
  var count = 0;
  var totalcount = fs.readdirSync(dotminecraft + "/mods/tmp/").length;
  // fs.readdir(dotminecraft + "/mods/tmp/", (err, files) => {if(err) {console.log("[ERROR] Failed to load icons: " + error); return;} totalcount = files.length});
  fs.readdir(dotminecraft + "/mods/", (err, files) => {
    //files.forEach(file => {if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {totalcount++;}});
    if (err) {
      console.error('[ERROR] Error reading from mods folder: ', err);
      return;
    }
    files.forEach(file => {
      if (file.endsWith('.jar') || file.endsWith('.jar.disabled')) {
        const thesilly = dotminecraft + "/mods/tmp/" + file + ".json";
        if(fs.existsSync(thesilly)) {
          var thesillycontents = null;
          try {
            thesillycontents = JSON.parse(fs.readFileSync(dotminecraft + "/mods/tmp/" + file + ".json", 'utf8').replace(/\r?\n/g, ''));
          } catch(err) {
            console.log("[ERROR] Something went wrong while reading a mods data! It may not show up in the mod manager. Here's the JSON:");
            console.log(fs.readFileSync(dotminecraft + "/mods/tmp/" + file + ".json", 'utf8'));
            console.log(err);
          }
          const imgpath = thesillycontents["icon"];
          fs.createReadStream(dotminecraft + "/mods/" + file)
            .pipe(unzipper.Parse())
            .on('entry', function (entry) {
              if (entry.path === imgpath) {
                entry.pipe(fs.createWriteStream(dotminecraft + "/mods/tmp/" + file + "-icon.png"));
              } else {entry.autodrain();}
            })
            .on('close', () => {
              if(fs.existsSync(dotminecraft + "/mods/tmp/" + file + "-icon.png")) {modlist[file]["icon"] = fs.readFileSync(dotminecraft + "/mods/tmp/" + file + "-icon.png", "base64");}
              count++;
              if(count > totalcount) {count = totalcount}
            });
        }
      }
    });
  });
  while(totalcount === -1) {await sleep(10);}
  while(count != totalcount) {await sleep(100);}
  console.log("[INFO] All done scanning!")
  win.webContents.send('sendMessage', {"message": "modlist", "response": modlist});
  fs.rmSync(dotminecraft + "/mods/tmp/", { recursive: true, force: true });
  return true;
});


ipcMain.handle("settings:pastebin", async () => {
  if(typeof username === 'undefined') username = "[NOT LOGGED IN]";
  const options = {
    method: "POST",
    url: "https://api.toriclient.com/launcher/log/upload",
    port: 443,
    headers: {},
    formData : {
        "file": fs.createReadStream("launcher.log"),
        "username": username
    }
  };

  request(options, function (err, res, body) {
      if(err) {console.log(err); win.webContents.send('sendMessage', {"message": "internal.log-response", "response": "general_fail"});}
      console.log("[INFO] Printing raw response from API:")
      console.log(body)
      if(body.includes("413 Request Entity Too Large")) {
        win.webContents.send('sendMessage', {"message": "internal.log-response", "response": {"status": "FAIL", "error": "413 Request Entity Too Large"}});
        return;
      }
      parsedBody = JSON.parse(body);
      if(parsedBody['status'] != "OK") {
        console.log("[ERROR] Got a not good response from API: " + body);
        win.webContents.send('sendMessage', {"message": "internal.log-response", "response": parsedBody});
      } else {
        console.log("[INFO] Uploaded log successfully.")
        win.webContents.send('sendMessage', {"message": "internal.log-response", "response": parsedBody});
      }
  });
});

var loggedin = false;
ipcMain.handle('game:login', () => {
  loggedin = false;
  authManager.launch("raw").then(async xboxManager => {
    //const token = await xboxManager.getMinecraft();
    fs.writeFile(datafolder + "/auth.key", Buffer.from(JSON.stringify(xboxManager.save())).toString('base64'), err => {if (err) {console.error(err);}});
    console.log("[INFO] Logged in successfully!")
    loggedin = true;
  }).catch(err => {
    try {
      console.error("[ERROR] Failed to get account: " + lst(err['ts']));
      win.webContents.send('sendMessage', {"message": "internal.login-fail", "response": lst(err['ts'])});
      console.log(err);
      if(fs.existsSync(datafolder + "/auth.key")) {fs.rmSync(datafolder + "/auth.key");}
    } catch (error) {
      console.log(error);
    }
  });
  win.webContents.send('sendMessage', {"message": "token.refresh"});
});

ipcMain.handle('game:checkstatus', () => {return loggedin});

var token = null;
ipcMain.handle('game:getaccount', async () => {
  try {
    if (!(fs.existsSync(datafolder + "/auth.key"))) {win.webContents.send('sendMessage', {"message": "internal.login-success", "response": "[NOT LOGGED IN]"}); return "no_account";} else {
      let data = fs.readFileSync(datafolder + "/auth.key", "utf8");
      token = Buffer.from(data, 'base64').toString('utf8');
      if(typeof JSON.parse(token)['name'] === "string") {
        console.log("[WARN] Detected old auth token, forcing relogin.");
        fs.rmSync(datafolder + "/auth.key");
        win.webContents.send('sendMessage', {"message": "internal.login-success", "response": "[NOT LOGGED IN]"});
        return "no_account";
      }
      let auth = await new Auth().refresh(JSON.parse(token))
      let mcobj = await auth.getMinecraft()
      let mclc = (await mcobj).mclc();
      token = mclc;
      console.log("[INFO] Logged in as " + mclc['name']);
      username = mclc['name'];
      win.webContents.send('sendMessage', {"message": "internal.login-success", "response": username});
    }
  } catch (err) {
    console.log(err);
    win.webContents.send('sendMessage', {"message": "internal.login-fail", "response": lst(err['ts'])});
    console.log("[ERROR] Something went wrong while logging in.")
    return "err";
  }
});

ipcMain.handle('launcher:update', async () => {return uploadedalready;});

ipcMain.handle('launcher:run', async () => {
  win.webContents.send('sendMessage', {"message": "Checking for updates..."});
  await new Promise(r => setTimeout(r, 500));
  await axios({
    method: 'GET',
    url: "https://api.toriclient.com/launcher/version"
  }).then(async function (response) {
    var version = response['data'];
    var pjson = require('./package.json');
    var lversion = pjson.version;
    console.log("[INFO] Current version: " + lversion + " | Latest version: " + version)
    if(version != lversion) {
      console.log("[INFO] Update required! Downloading update...");
      win.webContents.send('sendMessage', {"message": "Downloading update..."});
      const tempdir = os.tmpdir();
      if(os.platform() === 'win32') {
        const updater = fs.createWriteStream(tempdir + "\\update.exe");
        await https.get("https://cdn.toriclient.com/launcher/ToriLauncher_latest.exe", function(response) {
          response.pipe(updater);
          updater.on("finish", async () => {
            updater.close();
            console.log("[INFO] Update downloaded. Executing update exe then quitting!");
            win.webContents.send('sendMessage', {"message": "Verifying update..."});
            await new Promise(r => setTimeout(r, 1500));
            win.webContents.send('sendMessage', {"message": "Updating launcher..."});
            await exec(tempdir + '\\update.exe', function(err, data) {
              if(err) {console.log(err);}
            });
            fs.unlinkSync(tempdir + '\\update.exe');
            process.exit();
          });
        });
      }
    } else {
      console.log("[INFO] No update found, preparing launcher.");
      win.webContents.send('sendMessage', {"message": "Preparing the launcher..."});
      win.webContents.send('sendMessage', {"message": "ram.capacity", "totalram": totalmem, "allocated": JSON.parse(fs.readFileSync(configfile))['ramAllocatedGB']});
      fetch("https://api.toriclient.com/launcher/servers", {method: "GET"})
        .then(res => res.json())
        .then((json) => {
            win.webContents.send('featuredServers', json);
            console.log("[INFO] Fetched featured servers from the API.");
        }).catch(() => {
          console.log("[ERROR] Failed to fetch featured servers from API.");
        });

        fetch("https://api.toriclient.com/launcher/news", {method: "GET"})
        .then(res => res.json())
        .then((json) => {
            win.webContents.send('news', json);
            console.log("[INFO] Fetched news from the API.");
        }).catch(() => {
          console.log("[ERROR] Failed to fetch news from API.");
        });

        fetch("https://api.toriclient.com/launcher/partners", {method: "GET"})
        .then(res => res.json())
        .then((json) => {
            win.webContents.send('partners', json);
            console.log("[INFO] Fetched partner list from the API.");
        }).catch(() => {
          console.log("[ERROR] Failed to fetch partners from API.");
        });
      if(uploadedalready) return "already";
    }
  }).catch(function (error) {
    console.log("[ERROR] Failed to update!")
    console.log(error);
    win.webContents.send('sendMessage', {"message": "err.update_failed"});
    if(uploadedalready) return "already";
  });
});

ipcMain.handle('launcher:updateram', async (event, ram) => {
  const file = require(configfile);
  file.ramAllocatedGB = ram;
  fs.writeFile(configfile, JSON.stringify(file, null, 4), function (err) {if(err) {console.log("[ERROR] Failed to write config file: " + err); return;}});
});

ipcMain.handle('game:launch', async (event, wam) => {
  console.log("[INFO] User has allocated " + wam.toString() + "GB RAM to the game instance.");
  if (!fs.existsSync(dotminecraft)){fs.mkdirSync(dotminecraft);}
  if (!fs.existsSync(dotminecraft + "/versions/")){fs.mkdirSync(dotminecraft + "/versions/");}
  if (!fs.existsSync(dotminecraft + "/versions/fabric/")){
    fs.mkdirSync(dotminecraft + "/versions/fabric/");
    const fabricjson = fs.createWriteStream(dotminecraft + "/versions/fabric/fabric.json");
    https.get("https://cdn.toriclient.com/versions/fabric.json", function(response) {
      response.pipe(fabricjson);
      fabricjson.on("finish", () => {
        fabricjson.close();
        console.log("> Downloaded fabric.json");
      });
    });
  } else {
    /* var fabricjson = fs.readFileSync(dotminecraft + "/versions/fabric/fabric.json");
    if(fabricjson.includes("fabric-loader-0.15.2-1.20.1")) {
      fs.rmSync(dotminecraft + "/versions/fabric/fabric.json");
      const fabricjson = fs.createWriteStream(dotminecraft + "/versions/fabric/fabric.json");
      https.get("https://cdn.toriclient.com/versions/fabric.json", function(response) {
        response.pipe(fabricjson);
        fabricjson.on("finish", () => {
          fabricjson.close();
          console.log("> Downloaded fabric.json");
        });
      });
    } */

    fs.rmSync(dotminecraft + "/versions/fabric/fabric.json");
    const fabricjson = fs.createWriteStream(dotminecraft + "/versions/fabric/fabric.json");
    https.get("https://cdn.toriclient.com/versions/fabric.json", function(response) {
      response.pipe(fabricjson);
      fabricjson.on("finish", () => {
        fabricjson.close();
        console.log("> Downloaded fabric.json");
      });
    });
  }
  // rewrite to redownload fabric ver
  if(!fs.existsSync(dotminecraft + "/mods/")) {fs.mkdirSync(dotminecraft + "/mods/")}
  if(fs.existsSync(dotminecraft + "/mods/index.json")) {fs.rmSync(dotminecraft + "/mods/index.json")}
  const modindex = fs.createWriteStream(dotminecraft + "/mods/index.json");
  await https.get("https://cdn.toriclient.com/mods/index.json", function(response) {
    response.pipe(modindex);
    modindex.on("finish", () => {
      modindex.close();
      console.log("> Downloaded mod index");
      continueLaunch(wam.toString());
    });
  });
});

var sleepSetTimeout_ctrl;

function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

async function continueLaunch(wam) {
  var links = JSON.parse(fs.readFileSync(dotminecraft + "/mods/index.json"));
  var keys = Object.keys(links);
  const totallength = keys.length;

  if(fs.existsSync(datafolder + "/lastindex.json")) {
    var lastindex = JSON.parse(fs.readFileSync(datafolder + "/lastindex.json"));
  } else {
    fs.writeFileSync(datafolder + "/lastindex.json", "{}");
  }

  if(!fs.readFileSync(dotminecraft + "/mods/index.json").equals(fs.readFileSync(datafolder + "/lastindex.json"))) {
    //if (fs.existsSync(dotminecraft + "/mods/")){await fs.rmSync(dotminecraft + "/mods", { recursive: true }); await fs.mkdirSync(dotminecraft + "/mods/");} else {fs.mkdirSync(dotminecraft + "/mods/");}
    for (const key in lastindex) {
      const filePath = `${dotminecraft}/mods/${lastindex[key].substring(lastindex[key].lastIndexOf('/') + 1)}`;
      try {fs.rmSync(filePath);} catch(err) {try{if(err.code === "ENOENT") {fs.rmSync(filePath + ".disabled")}} catch (err) {if(err.code === "ENOENT") console.log("[WARN] Failed to delete file " + filePath + " because it doesn't exist.")}}
    }
    var i = 0;
    for (const key in links) {
      const url = links[key];
      try {
          const response = await axios({
              method: 'GET',
              url: url,
              responseType: 'stream'
          });
          const fileName = url.substring(url.lastIndexOf('/') + 1)
          const filePath = `${dotminecraft}/mods/${fileName}`;
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
          });
          i++;
          win.webContents.send('sendProgress', {"type": 'mods', "task": i, "total": totallength})
          console.log(`[DL-INFO] Mod downloaded: ${url.substring(url.lastIndexOf('/') + 1)}`);
      } catch (error) {
          console.log(`[ERROR] Failed to download ${url}: ${error.message}`);
      }
    }
  } else {
    let missinglinks = [];
    for (const key in links) {
      const filePath = `${dotminecraft}/mods/${links[key].substring(links[key].lastIndexOf('/') + 1)}`;
      if(!fs.existsSync(filePath) && !fs.existsSync(filePath + ".disabled")) {missinglinks.push(links[key]);}
    }
    if(missinglinks.length === 0) {
      console.log("[INFO] All or most required mods already in mods folder.")
    } else {
      console.log("[INFO] Missing " + missinglinks.length + " mods, redownloading missing mods...")
      var i = 0;
      for(const key in missinglinks) {
        const url = missinglinks[key];
        try {
          const response = await axios({
              method: 'GET',
              url: url,
              responseType: 'stream'
          });
          const fileName = url.substring(url.lastIndexOf('/') + 1)
          const filePath = `${dotminecraft}/mods/${fileName}`;
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
          });
          i++;
          win.webContents.send('sendProgress', {"type": 'mods', "task": i, "total": Object.keys(missinglinks).length})
          console.log(`[DL-INFO] Mod downloaded: ${url.substring(url.lastIndexOf('/') + 1)}`);
        } catch (error) {console.log(`[ERROR] Failed to download ${url}: ${error.message}`);}
      }
    }
  }

  if(fs.existsSync(datafolder + "/lastindex.json")) {fs.rmSync(datafolder + "/lastindex.json", { recursive: true });}
  fs.renameSync(dotminecraft + "/mods/index.json", datafolder + "/lastindex.json");

  if(!fs.existsSync(datafolder + `/${JDK_VER}`)) {
    await download(JDK_DL, datafolder + `/${JDK_FILE}`, "java");
    win.webContents.send('sendProgress', {"type": "java-extract", "task": 1, "total": 1})
    decompress(datafolder + `/${JDK_FILE}`, datafolder + "/")
    .catch((error) => {
      win.webContents.send('sendProgress', {"type": 'error', "task": error, "total": 1})
    });
    while(!fs.existsSync(datafolder + `/${JDK_VER}/bin/java.exe`)) {
      await sleep(100);
      // wait for java to be extracted async function shenanigans. cheeky but works ig
    }
    fs.rmSync(datafolder + `/${JDK_FILE}`);
    console.log("[INFO] Extracted and cleaned up JDK Runtime. Launching now!");
  }

  win.webContents.send('sendProgress', {"type": 'waitforgame', "task": 0, "total": 1})
  await sleep(1000);

  // possibly refresh token in the future? --> believe this has been done already but i forgor 

  let opts = {
    javaPath: datafolder + `/${JDK_VER}/bin/java.exe`,
    overrides: {
      detached: false
    },
    clientPackage: null,
    authorization: token,
    root: dotminecraft,
    version: {
      number: "1.20.1",
      type: "release",
      custom: "fabric"
    },
    memory: {
        max: `${wam}G`,
        min: "2G"
    }
  };
  console.log("[INFO] Starting game!");
  try {
    launcher.launch(opts);
    return true;
  } catch {
    return false;
  }
}

const totalmem = Math.ceil(os.totalmem() / (1024 ** 3));
app.whenReady().then(() => {
  console.log("    _____           _   __                        _               ");
  console.log("   /__   \\___  _ __(_) / /  __ _ _   _ _ __   ___| |__   ___ _ __ ");
  console.log("     / /\\/ _ \\| '__| |/ /  / _` | | | | '_ \\ / __| '_ \\ / _ \\ '__|");
  console.log("    / / | (_) | |  | / /__| (_| | |_| | | | | (__| | | |  __/ |   ");
  console.log("    \\/   \\___/|_|  |_\\____/\\__,_|\\__,_|_| |_|\\___|_| |_|\\___|_|   ");
  console.log("");
  console.log("                    can i get tori client early?");
  console.log(" ToriLauncher by WifiRouter • Designed by Zero • Created by PiyoFeather");
  console.log("");
  createWindow();
  globalShortcut.unregister('ControlOrControl+R');
  globalShortcut.unregister('F5');
  console.log("[INFO] Window created. Good luck and have fun!");
  console.log("[INFO] Computer has " + totalmem + " GB RAM.");

  app.on('activate', () => {
    console.log("[INFO] Opening new window...")
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  launcher.on('debug', (e) => {
    if(!e.includes("[MCLC]: Launching with arguments")) {
      console.log(e);
    } else {
      win.webContents.send('sendProgress', {"type": 'launching', "task": 0, "total": 0})
    }
  });
  launcher.on('data', (e) => {console.log(e); gamerunning = true;});
  launcher.on('close', (e) => {win.webContents.send('sendProgress', {"type": 'stopped', "task": 0, "total": e}); gamerunning = false; console.log("[INFO] Game exited with code " + e);
    if(e != 0) {
      let response = dialog.showMessageBoxSync(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ToriLauncher - Game error!',
        message: 'It looks like your game has crashed or quit unexpectedly.\n\nIf you did not cause this, make sure your mods are compatible with ours\nand you are not missing any dependencies.\n\nIf this issue still occurs, please contact our staff team for more assistance.'
      });
    }
  });
  launcher.on('progress', (e) => win.webContents.send('sendProgress', e));
  https.get("https://api.toriclient.com/status", (res) => {
    if (res.statusCode === 200) {
      console.log(`[INFO] Server is reachable!`);
    } else {
      console.log("[ERROR] Server returned a non-ok response. Exiting now.");
      dialog.showMessageBoxSync(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ToriLauncher - Error!',
        message: "Failed to connect to the Tori Client servers. Check your internet connection, and if you believe this is an error, contact the development team for assistance or information on this matter.\n\nPressing OK will close the launcher."
      });
      app.quit();
    }
  }).on("error", function(e) {
    console.log("[ERROR] Server is not reachable! Exiting now.");
    dialog.showMessageBoxSync(win, {
      type: 'error',
      buttons: ['OK'],
      title: 'ToriLauncher - Error!',
      message: "Failed to connect to the Tori Client servers. Check your internet connection, and if you believe this is an error, contact the development team for assistance or information on this matter.\n\nPressing OK will close the launcher."
    });
    app.quit();
  });


  // setup config file
  if(!fs.existsSync(configfile)) {
    fs.writeFileSync(configfile, JSON.stringify({"ramAllocatedGB": 6}, null, 4), (err) => {
      if (err) {
        console.error('[ERROR] Error writing to config file: ', err);
      } else {
        console.log('[INFO] Config file doesn\'t exist, created successfully.');
      }
    });
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  console.log("[INFO] Shutting down... Goodbye!");
});

const TIMEOUT = 10000
async function download(url, path, title) {
  const uri = parse(url)
  if (!path) {
    path = basename(uri.path)
  }
  const file = fs.createWriteStream(path)

  return new Promise(function(resolve, reject) {
    const request = http.get(uri.href).on('response', function(res) {
      const len = parseInt(res.headers['content-length'], 10)
      let downloaded = 0
      res.on('data', function(chunk) {
          file.write(chunk)
          downloaded += chunk.length
          win.webContents.send('sendProgress', {"type": title, "task": downloaded, "total": len})
        })
        .on('end', function() {
          file.end()
          console.log(`[INFO] Saved ${JDK_FILE} (${len} bytes).`)
          resolve()
        })
        .on('error', function (err) {
          reject(err)
          win.webContents.send('sendProgress', {"type": 'error', "task": err, "total": 1})
        })
    })
    request.setTimeout(TIMEOUT, function() {
      request.abort()
      reject(new Error(`[ERROR] Request timeout after ${TIMEOUT / 1000.0}s`));
      win.webContents.send('sendProgress', {"type": 'error', "task": `Request timeout after ${TIMEOUT / 1000.0}s`, "total": 1})
    })
  })
}