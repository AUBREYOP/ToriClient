// yes its shit
// it works
// good enough

var loginfailure = false;
var gamerunning = false;
var username = 0;

const wallpaperid = Math.floor(Math.random() * 3); console.log(wallpaperid);
const backgroundid = Math.floor(Math.random() * 2);
$(".launch").css("background-image", `linear-gradient(to right, #a5d2ae, rgba(0, 0, 0, 0) 95%), url(resource/wallpaper${wallpaperid + 1}.png)`);
$("#body").css("background-image", `linear-gradient(rgba(43, 48, 64, 0.5),rgba(43, 48, 64, 0.5)) , url(resource/background${backgroundid + 1}.png)`);
$("#whitelist-wallpaper").css("background-image", `linear-gradient(to right, rgba(13, 17, 23,0) 0%,rgba(13, 17, 23,0) 2%,#0d1117 100%), url(resource/background${backgroundid + 1}.png)`);

$("#launching").css("display", "none");

document.getElementById("ram-slider").oninput = function() {$("#mem-size").text(this.value + " GB"); window.launcher.updateRam(this.value);}

function showOverlay() {$(".overlay").css("opacity", 1);}
function hideOverlay() {if(!gamerunning) $(".overlay").css("opacity", 0);}

function addMod() {window.modmanager.addMod();}

async function closeSponsor() {
    $(".sponsor-container .sponsor").css("transform", "scale(0.8)");
    $(".sponsor-container .sponsor").css("opacity", 0);
    $(".darken").css("opacity", 0);
    await sleep(500);
    $(".sponsor-container").css("display", "none");
    $(".darken").css("display", "none");
}

async function openSponsor(id) {
    if(id === 1) {
        // wepwawet
        $(".sponsor-container").css("display", "flex");
        $(".wepwawet").css("display", "flex");
        $(".ffatl").css("display", "none");
        await sleep(1);
        $(".sponsor-container .sponsor").css("transform", "scale(1)");
        $(".sponsor-container .sponsor").css("opacity", 1);
    } else if (id === 2) {
        // ffatl
        $(".sponsor-container").css("display", "flex");
        $(".wepwawet").css("display", "none");
        $(".ffatl").css("display", "flex");
        await sleep(1);
        $(".sponsor-container .sponsor").css("transform", "scale(1)");
        $(".sponsor-container .sponsor").css("opacity", 1);
    } else {
        console.log("[ERROR] Invalid sponsor ID, nothing to open!");
    }
    $("#sponsor-icon").css("transform", "rotate(0deg)");
    $("#sponsor-icon-arrow").css("transform", "rotate(0deg)");
    $("#sponsor-icon").css("opacity", 1);
    $("#sponsor-icon-arrow").css("opacity", 0);
    sponsorsopen = false;
    $(".sponsors-icons").css("opacity", 0);
    $(".sponsors-icons").css("margin-left", "45px");
    $("#button-sponsors").css("z-index", 1);
    await sleep(501);
    $(".sponsors-icons").css("display", "none");
}

var sponsorsopen = false;
async function openSponsorsPopups() {
    $("#button-sponsors").css("z-index", 21);
    if(!sponsorsopen) {
        $("#sponsor-icon").css("transform", "rotate(180deg)");
        $("#sponsor-icon-arrow").css("transform", "rotate(180deg)");
        $("#sponsor-icon").css("opacity", 0);
        $("#sponsor-icon-arrow").css("opacity", 1);
        sponsorsopen = true;
        $(".darken").css("display", "block");
        $(".sponsors-icons").css("display", "block");
        await sleep(5);
        $(".darken").css("opacity", 1);
        $(".sponsors-icons").css("opacity", 1);
        $(".sponsors-icons").css("margin-left", "60px");
    } else {
        $("#sponsor-icon").css("transform", "rotate(0deg)");
        $("#sponsor-icon-arrow").css("transform", "rotate(0deg)");
        $("#sponsor-icon").css("opacity", 1);
        $("#sponsor-icon-arrow").css("opacity", 0);
        sponsorsopen = false;
        $(".darken").css("opacity", 0);
        $(".sponsors-icons").css("opacity", 0);
        $(".sponsors-icons").css("margin-left", "45px");
        await sleep(501);
        $(".sponsors-icons").css("display", "none");
        $(".darken").css("display", "none");
    }
}

// openModManager <-- keyword to find this function in this horrific mess => if it works don't touch it :3
document.getElementById("mods-manager").onclick = async function() {
    await sleep(5);
    if(gamerunning) {
        document.getElementById("mod-list").innerHTML = `<div class="loader-container" id="loader-container-gamerunning"><p>Game is running! We can't edit your mods while the game is running :(</p></div>`;
        console.log("[INFO] Opening mod manager...");
        $("#mod-manager-container").css("display", "flex");
        await sleep(10);
        $("#mod-manager-container").css("opacity", 1);
        $("#mod-manager").css("transform", "scale(1)");
        return;
    }
    $("#loader-container-gamerunning").css('display', 'none');
    window.modmanager.fetchMods();
    document.getElementById("mod-list").innerHTML = '';
    $("#mod-list").append(`<div class="loader-container" id="loader-container"><span class="loader-small"></span></div><div class="loader-container" id="loader-container-nomods" style="display: none;"><p style="color: #8e658d">Nothing here! Perhaps you need to launch the game first?</p></div>`);
    //$("#loader-container-nomods").css("display", "none");
    console.log("[INFO] Opening mod manager...");
    $("#mod-manager-container").css("display", "flex");
    await sleep(10);
    $("#mod-manager-container").css("opacity", 1);
    $("#mod-manager").css("transform", "scale(1)");
}

async function closeModManager() {
    $("#mod-manager-container").css("opacity", 0);
    $("#mod-manager").css("transform", "scale(0.8)");
    await sleep(500);
    $("#mod-manager-container").css("display", "none");
}

async function thirdParty() {await window.settings.thirdParty();}

var gotmodlist = false;
var essentialsconflictresolved = true;
var essentialdsmodjar = null;
async function launchGame() {
    if($("#username").text() === "Not logged in!") {
        $("#popup").css("width", "325px");
        $("#popup").removeClass("green").addClass("red");
        $("#popup-icon").removeClass("fa-circle-check").addClass("fa-triangle-exclamation");
        $(".popup-container").css("display", "flex");
        await sleep(5);
        $("#popup").css("margin-top", "24px");
        $("#popup").css("opacity", 1);
        $("#popup-description").text("You're not logged in yet!");
        await sleep(3000);
        $("#popup").css("margin-top", "-10px");
        $("#popup").css("opacity", 0);
        await sleep(300);
        $(".popup-container").css("display", "none");
        $("#popup").removeClass("red").addClass("green");
        $("#popup-icon").removeClass("fa-triangle-exclamation").addClass("fa-circle-check");
        $("#popup").css("width", "300px");
        return;
    }
    $("#options").css("display", "none");
    $("#launching").css("display", "flex");
    modlist = {};
    await window.modmanager.fetchMods();
    while(!gotmodlist) {await sleep(100);}
    if(modlist !== "empty") {
        if(JSON.stringify(modlist).includes("World Host")) {
            if(JSON.stringify(modlist).includes("essential-container") && modlist[essentialdsmodjar]) {
                if(modlist[essentialdsmodjar]["enabled"]) {
                    const essentialmodinfo = modlist[essentialdsmodjar]["enabled"];
                    const worldhostmodinfo = modlist[getKeysContaining(modlist, "world-host")]["enabled"];
                    if(essentialmodinfo && worldhostmodinfo) {
                        essentialsconflictresolved = false;
                        await window.game.resolveEssentialsConflict();
                    }
                }
            } else if (!modlist[getKeysContaining(modlist, "world-host")]["enabled"])
                if(!JSON.stringify(modlist).includes("essential-container") || !modlist[essentialdsmodjar]["enabled"])
                    window.modmanager.toggleMod(getKeysContaining(modlist, "world-host")[0]);
        }
    }
    while(!essentialsconflictresolved) {await sleep(100);}
    gamerunning = true;
    document.getElementById("mod-list").innerHTML = `<div class="loader-container" id="loader-container-gamerunning"><p>Game is running! We can't edit your mods while the game is running :(</p></div>`;
    await window.game.launch(document.getElementById('ram-slider').value);
}

function getKeysContaining(obj, searchString) {
    const regex = new RegExp(searchString);
    return Object.keys(obj).filter(key => regex.test(key));
  }

var logincomplete = false;
async function signIn() {
    if(!loginfailure) await window.game.login(); else {window.alert("Something went wrong with the launcher. Please contact the development team."); return;}
    $("#loader").css("display", "block");
    $("#warning").css("display", "none");
    $("#username").css("display", "none");
    $("#head").css("display", "none");
    while(!await window.game.checkLoginStatus()) {await sleep(100);}
    await getAccount();
    while(username === 0) {await sleep(100);}
}

async function accountError() {
    $("#loader").css("display", "none");
    $("#warning").css("display", "block");
    $("#username").css("display", "block");
    $("#whitelist-wallpaper").css('margin-left', '-2%');
    $("#whitelist-wallpaper").css('opacity', 0);
    $("#whitelist-container").css('margin-right', '-2%');
    $("#whitelist-container").css('opacity', 0);
    $("#loader-screen").css('transform', 'scale(1)');
    $("#loader-screen").css('opacity', 1);
    $("#loader-screen").css('display', 'flex')
    $("#head").css("display", "none");
    $("#username").text("Internal Error");
    $("#soverlay-spinner").hide();
    $("#launch-progress").text("Something went wrong while logging in :(");
    $("#log-out-button-error").css('display', 'flex');
    loginfailure = true;
}

var sleepSetTimeout_ctrl;
async function sleep(ms) {
    clearInterval(sleepSetTimeout_ctrl);
    return new Promise(resolve => sleepSetTimeout_ctrl = setTimeout(resolve, ms));
}

var accounterror = false;
async function getAccount() {
    try {
        await window.game.getAccount();
        while(username === 0) {await sleep(100);}
        if(username === "err") {accountError(); accounterror = true; return;}
        if(username === "no_account") {
            $("#loader").css("display", "none");
            $("#warning").css("display", "block");
            $("#username").css("display", "block");
            return;
        }
        $("#loader").css("display", "none");
        $("#username").text(username);
        $("#head").attr("src", "https://mc-heads.net/head/" + username);
        $("#username").css("display", "block");
        $("#head").css("display", "block");
    } catch {
        accountError();
    }
}

function guidGenerator() {
    var S4 = function() {return (((1+Math.random())*0x10000)|0).toString(16).substring(1);};
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

async function toggleMod(filename, id, slider_id) {
    $(`#${id}`).prop("disabled", true);
    $(`#${slider_id}`).addClass("disabled");
    window.modmanager.toggleMod(filename);
    if(filename.endsWith(".jar")) {
        const key = filename +  ".disabled";
        $(`#${id}`).attr("onchange", `toggleMod('${key}', '${id}', '${slider_id}')`);
    } else if (filename.endsWith(".jar.disabled")) {
        const key = filename.slice(0, -9);
        $(`#${id}`).attr("onchange", `toggleMod('${key}', '${id}', '${slider_id}')`);
    } else {
        window.alert("Failed to toggle mod. Contact developers.");
    }
    await new Promise(r => setTimeout(r, 1500));
    console.log("[INFO] Toggled mod " + filename);
    $(`#${id}`).prop("disabled", false);
    $(`#${slider_id}`).removeClass("disabled");
}

async function deleteMod(filename) {window.modmanager.deleteMod(filename);}
async function showInFolder(filename) {window.modmanager.showInFolder(filename);}

var modlist = {};
async function applyModList(list) {
    gotmodlist = true;
    if(list === "empty") {
        console.log(list);
        $("#loader-container").hide();
        $("#loader-container-nomods").css("display", "flex");
        return;
    }
    modlist = list;
    console.log("[INFO] Got mod list!");
    $("#loader-container").hide();
    console.log(list);
    Object.entries(list).forEach((entry) => {
        const [key, value] = entry;
        const name = value["name"];
        const desc = value["desc"];
        const enabled = value["enabled"];
        const icon = value["icon"];
        const id = guidGenerator();
        const id2 = guidGenerator();
        var essential = null; var essentialclass = null; if(value["essential"] === true) {essential = "disabled"; essentialclass = "disabled";}
        if(enabled) {
            if(icon) {
                $("#mod-list").append(`<div class="mod"><img src="${"data:image/jpg;base64," + icon}" height="48" width="48" class="icon"><div class="text"><p class="name">${name}</p><p class="desc">${desc}</p></div><div class="options"><i class="fa-solid fa-trash-can" onclick="deleteMod('${key}')"></i><i class="fa-solid fa-folder" onclick="showInFolder('${key}')"></i><label class="switch"><input type="checkbox" id="${id}" checked onChange="toggleMod('${key}', '${id}', '${id2}')" ${essential}><span id="${id2}" class="slider2 round ${essentialclass}"></span></label></div></div>`)
            } else {
                $("#mod-list").append(`<div class="mod"><img src="resource/default-mod-icon.png" height="48" width="48" class="icon"><div class="text"><p class="name">${name}</p><p class="desc">${desc}</p></div><div class="options"><i class="fa-solid fa-trash-can" onclick="deleteMod('${key}')"></i><i class="fa-solid fa-folder" onclick="showInFolder('${key}')"></i><label class="switch"><input type="checkbox" id="${id}" checked onChange="toggleMod('${key}', '${id}', '${id2}')" ${essential}><span id="${id2}" class="slider2 round ${essentialclass}"></span></label></div></div>`)
            }
        } else {
            if(icon) {
                $("#mod-list").append(`<div class="mod"><img src="${"data:image/jpg;base64," + icon}" height="48" width="48" class="icon"><div class="text"><p class="name">${name}</p><p class="desc">${desc}</p></div><div class="options"><i class="fa-solid fa-trash-can" onclick="deleteMod('${key}')"></i><i class="fa-solid fa-folder" onclick="showInFolder('${key}')"></i><label class="switch"><input type="checkbox" id="${id}" onChange="toggleMod('${key}', '${id}', '${id2}')" ${essential}><span id="${id2}" class="slider2 round ${essentialclass}"></span></label></div></div>`)
            } else {
                $("#mod-list").append(`<div class="mod"><img src="resource/default-mod-icon.png" height="48" width="48" class="icon"><div class="text"><p class="name">${name}</p><p class="desc">${desc}</p></div><div class="options"><i class="fa-solid fa-trash-can" onclick="deleteMod('${key}')"></i><i class="fa-solid fa-folder" onclick="showInFolder('${key}')"></i><label class="switch"><input type="checkbox" id="${id}" onChange="toggleMod('${key}', '${id}', '${id2}')" ${essential}><span id="${id2}" class="slider2 round ${essentialclass}"></span></label></div></div>`)
            }
        }
    });
}

var altlogin = false;
async function altLogin() {
    altlogin = true;
    $("#sign-in-with-microsoft").text('');
    $("#sign-in-with-microsoft").append('<span class="alt-login-spinner" id="alt-login-spinner" style="display: inline-block !important;"></span>');
    $("#alt-login-image").css('display', 'none');
    $("#sign-in-with-microsoft").removeClass('enabled');
    await signIn();
    while(!await window.game.checkLoginStatus()) {await sleep(100);}
    //await window.game.getAccount();  
    await window.game.checkWhitelistStatus();
}

var logResponse = null;
try {
    window.electronAPI.sendMessage(async (json) => {
        if(json['message'] === "ram.capacity") {
            console.log("[INFO] Setting max RAM to " + json['totalram'] + " GB");
            document.getElementById("ram-slider").setAttribute("max", json['totalram']);
            $("#page-settings > div:nth-child(3) > div.info > div > p.max").text(json['totalram'] + " GB");
            document.getElementById("ram-slider").setAttribute("value", json['allocated']);
            $("#mem-size").text(json['allocated'] + " GB")
            return;
        }
        if(json['message'] === "token.refresh") {
            logincomplete = true;
            return;
        }
        if(json['message'] === "conflict.essentials.resolved") {
            // ** key ** >>> json['mod'] => essential, worldhost, ignore
            if(json['mod'] === "essential") {window.modmanager.toggleMod(getKeysContaining(modlist, "Essential")[0]);}
            else if (json['mod'] === "worldhost") {window.modmanager.toggleMod(getKeysContaining(modlist, "world-host")[0]);}
            essentialsconflictresolved = true;
            return;
        }
        if(json['message'] === "whitelist.success") {
            whitelisted = true;
            while($("#username").text() === "Not logged in!") {await sleep(100);}
            $("#whitelist-wallpaper").css('margin-left', '-2%');
            $("#whitelist-wallpaper").css('opacity', 0);
            $("#whitelist-container").css('margin-right', '-2%');
            $("#whitelist-container").css('opacity', 0);
            hideSOverlay(false);
            return;
        }
        if(json['message'] === "whitelist.fail") {
            whitelisted = false;
            $("#sign-in-with-microsoft").remove();
            $("#not-whitelisted").css('display', 'flex');
            $("#button-list").css('display', 'flex');
            return;
        }
        if(json['message'] === "essentialsjar") {
            essentialdsmodjar = json['response'];
            return;
        }
        if(json['message'] === "modlist") {
            applyModList(json['response']);
            return;
        }
        if(json['message'] === "modmanager.addedmod") {
            window.modmanager.fetchMods();
            document.getElementById("mod-list").innerHTML = '';
            $("#mod-list").append(`<div class="loader-container" id="loader-container"><span class="loader-small"></span></div>`);
            return;
        }
        if(json['message'] === "internal.login-fail") {
            window.alert("Something went wrong while logging in to your Minecraft account:\n\n" + json['response']);
            $("#loader").css("display", "none");
            $("#warning").css("display", "block");
            $("#username").css("display", "block");
            $("#head").css("display", "none");
            $("#username").text("Couldn't log in.");
            return;
        }
        if(json['message'] === "internal.login-success") {
            username = json['response'];
            return;
        }
        if(json['message'] === "internal.log-response") {
            logResponse = json['response'];
            return;
        }
        $("#launch-progress").text(json['message'])
        if(json['message'] === "err.update_failed") {
            $("#launch-progress").text("Woah... Something didn't quite go to plan.");
            setTimeout(function() {hideSOverlay(true);}, 2000);
        }
        if(json['message'] === "Preparing the launcher...") {
            setTimeout(function() {hideSOverlay(false);}, 250);
        };
    })
} catch {
    $("#changelog-box").hide();
    //$("#startup-overlay").hide();
}

window.electronAPI.news((json) => {
    Object.entries(json).forEach((entry) => {
        const [key, value] = entry;
        const head = value["title"];
        const content = value["content"];
        var image = value["icon"];
        if(image === "[default]") {image = "resource/news-image-placeholder.png"}
        $("#news-div").append(`<div class="article"><span class="heading">${head}</span><p class="text">${content}</p><img src="${image}" class="image"></div>`);
    });
});

window.electronAPI.modslist((json) => {
});

window.electronAPI.featuredServers((json) => {
    Object.entries(json).forEach((entry) => {
        const [key, value] = entry;
        const ip = value["ip"];
        const icon = value["icon"];
        $("#featured-servers-div").append(`<div class='server' onclick="copyIp('${ip}')"><img src="${icon}" class="icon"><span class="ip">${ip}</span></div>`);
    });
});

var partners = null;
window.electronAPI.partners((json) => {
    partners = json;
    Object.entries(json).forEach((entry) => {
        const [key, value] = entry;
        const type = value["type"];
        const icon = value["icon"];
        if(type === "Creator") {
            $("#partners-div").append(`<div class="partner" onclick="showPartnerOverlay('creator', '${key}');"><img class="head" alt="head" src="${icon}"><p class="username">${key}</p><p class="type">${type}</p></div>`);
        } else {
            $("#partners-div").append(`<div class="partner" onclick="showPartnerOverlay('server', '${key}');"><img class="head" alt="head" src="${icon}"><p class="username">${key}</p><p class="type">${type}</p></div>`);
        }
    });
});

async function retryWhitelist() {
    $('#not-whitelisted-retry').text(''); 
    $('#not-whitelisted-retry').append(`<span class='alt-login-spinner' id='alt-login-spinner' style='display: block !important;'></button>`);
    await sleep(200);
    scanned = false;
    hideSOverlay(false);
    $('#not-whitelisted-retry').text('Retry'); 
}

var scanned = false;
var whitelisted = null;
async function hideSOverlay(showerror) {
    if(accounterror === true) {return;}
    while(username === 0) {await sleep(50);}
    if(username === "[NOT LOGGED IN]") {
        $("#loader-screen").css('transform', 'scale(0.8)');
        $("#loader-screen").css('opacity', 0);
        $("#whitelist-wallpaper").css('margin-left', 0);
        $("#whitelist-wallpaper").css('opacity', 1);
        $("#whitelist-container").css('margin-right', 0);
        $("#whitelist-container").css('opacity', 1);
        await sleep(500);
        $("#loader-screen").css('display', 'none');
        return;
    }
    if(scanned === false) {
        scanned = true;
        await window.game.checkWhitelistStatus();
        while(whitelisted === null) {await sleep(100);}
        if(whitelisted === false) {
            $("#loader-screen").css('transform', 'scale(0.8)');
            $("#loader-screen").css('opacity', 0);
            $("#whitelist-wallpaper").css('margin-left', 0);
            $("#whitelist-wallpaper").css('opacity', 1);
            $("#whitelist-container").css('margin-right', 0);
            $("#whitelist-container").css('opacity', 1);
            $("#button-list").css('display', 'flex');
            await sleep(500);
            $("#loader-screen").css('display', 'none');
            return;
        }
    }
    $("#loader-screen").css('transform', 'scale(0.8)');
    $("#loader-screen").css('opacity', 0);
    $("#startup-overlay").css('opacity', 0);
    await sleep(501);
    $("#startup-overlay").css("display", "none");
    if(showerror) {updateError();}
}

async function updateError() {
    $("#popup").css("width", "325px");
    $("#popup").removeClass("green").addClass("red");
    $("#popup-icon").removeClass("fa-circle-check").addClass("fa-triangle-exclamation");
    $(".popup-container").css("display", "flex");
    await sleep(1);
    $("#popup").css("margin-top", "24px");
    $("#popup").css("opacity", 1);
    $("#popup-description").text("Failed to check for updates!");
    await sleep(3000);
    $("#popup").css("margin-top", "-10px");
    $("#popup").css("opacity", 0);
    await sleep(300);
    $(".popup-container").css("display", "none");
    $("#popup").removeClass("red").addClass("green");
    $("#popup-icon").removeClass("fa-triangle-exclamation").addClass("fa-circle-check");
    $("#popup").css("width", "300px");
}

function bytesToMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2); // 1 MB = 1024 * 1024 bytes
}

window.electronAPI.sendProgress((json) => {
    $("#launching").css("display", "none");
    $("#launching-progress").css("display", "block");
    if(json['type'] === "error") {
        $("#progresstext").text("X_X");
        $("#txtprogress").text(`Something didn't go to plan...`);
        window.alert("Something went wrong during the launch!\n\n" + json['task']);
    }
    if(json['type'] === "java") {
        $("#progresstext").text("Downloading Java...");
        $("#progressbar").attr("value", json['task']);
        $("#progressbar").attr("max", json['total']);
        $("#txtprogress").text(`${bytesToMB(json['task'])} MB / ${bytesToMB(json['total'])} MB`)
    }
    if(json['type'] === "java-extract") {
        $("#progresstext").text("Downloading Java...");
        $("#progressbar").attr("value", json['task']);
        $("#progressbar").attr("max", json['total']);
        $("#txtprogress").text(`Extracting Java, this may take a moment...`)
    }
    if(json['type'] === "mods") {
        $("#progresstext").text("Downloading mods...");
        $("#progressbar").attr("value", json['task']);
        $("#progressbar").attr("max", json['total']);
        $("#txtprogress").text(`${json['task']}/${json['total']}`)
    }
    if(json['type'] === "waitforgame") {
        $("#progresstext").text("Waiting for game...");
        $("#progressbar").attr("value", json['task']);
        $("#progressbar").attr("max", json['total']);
        $("#txtprogress").text(`This may take a minute...`)
    }
    if(json['type'] === "assets") {
        $("#progresstext").text("Downloading assets...");
        $("#progressbar").attr("value", json['task']);
        $("#progressbar").attr("max", json['total']);
        $("#txtprogress").text(`${json['task']}/${json['total']}`)
    }
    if(json['type'] === "launching") {
        $("#launching").css("display", "flex");
        $("#launching-progress").css("display", "none");
    }
    if(json['type'] === "stopped") {
        $("#launching").css("display", "flex");
        $("#launching-progress").css("display", "none");
        $("#options").css("display", "block");
        $("#launching").css("display", "none");
        gamerunning = false;
        hideOverlay();
    }
})

async function popupSuccess(text, width) {
    $("#popup").css("width", width);
    $("#popup-icon").removeClass("fa-triangle-exclamation").addClass("fa-circle-check");
    $("#popup").removeClass("red").addClass("green");
    $(".popup-container").css("display", "flex");
    await sleep(1);
    $("#popup").css("margin-top", "24px");
    $("#popup").css("opacity", 1);
    $("#popup-description").text(text);
    await sleep(3000);
    $("#popup").css("margin-top", "-10px");
    $("#popup").css("opacity", 0);
    await sleep(300);
    $(".popup-container").css("display", "none");
}

async function copyIp(ip) {
    navigator.clipboard.writeText(ip);
    popupSuccess("IP copied to clipboard", "300px");
}

async function copyLink(link) {
    window.link.open(link);
}

async function hidePopup() {
    $("#popup").css("margin-top", "-10px");
    $("#popup").css("opacity", 0);
    await sleep(300);
    $(".popup-container").css("display", "none");
}

async function run() {
    await window.launcher.run();
    grabChangelog();
    //getAccount();
    var response = await window.launcher.update();
    if(response) {
        $("#pastebinButton").prop("disabled", true); 
        $("#pastebinButton").addClass("disabled"); 
        $("#pastebinButton").text("ID: " + url);
    }
}

async function openStore() {
    await window.socialmedia.store();
    popupSuccess("Opened in browser!", "250px");
}

async function openTwitter() {
    await window.socialmedia.twitter();
    popupSuccess("Opened in browser!", "250px");
}

async function openDiscord() {
    await window.socialmedia.discord();
    popupSuccess("Opened in browser!", "250px");
}

var currentpage = "home"
async function switchPage(page) {
    if(currentpage === page) {return;}
    if(page === "home") {
        $("#button-home").addClass("selected");
        $(`#button-${currentpage}`).removeClass("selected");
        $("#page-home").css("display", "block");
        $("#page-customization").css("display", "none");
        $("#page-store").css("display", "none");
        $("#page-settings").css("display", "none");
        currentpage = "home";
    }
    if(page === "customization") {
        $("#button-customization").addClass("selected");
        $(`#button-${currentpage}`).removeClass("selected");
        $("#page-store").css("display", "none");
        $("#page-home").css("display", "none");
        $("#page-customization").css("display", "flex");
        $("#page-settings").css("display", "none");
        currentpage = "customization";
    }
    if(page === "settings") {
        $("#button-settings").addClass("selected");
        $(`#button-${currentpage}`).removeClass("selected");
        $("#page-store").css("display", "none");
        $("#page-home").css("display", "none");
        $("#page-customization").css("display", "none");
        $("#page-settings").css("display", "block");
        currentpage = "settings";
    }
}

async function grabChangelog() {
    var changelog = await window.launcher.getChangelog();
    if(changelog === "no more :(") {
        $('#changelog-box').css('display', 'none');
        return;
    }
    fetch("https://cdn.toriclient.com/launcher/changelog.txt").then(function(response) {
        response.text().then(function(text) {
            storedText = text;
            done();
        });
    });

    function done() {
        $("#changelog").text(storedText);
    }
    //$("#changelog").text(changelog);
}

async function openFolder(mods) {var response = await window.settings.openFolder(mods); if(response) {window.alert(response);} else {popupSuccess("Folder opened!", "200px");}}
async function pastebin() {
    $("#pastebinButton").prop("disabled", true); 
    $("#pastebinButton").addClass("disabled"); 
    await window.settings.pasteBin();
    while(logResponse === null) {await sleep(100);}
    if(logResponse === "general_fail") {
        window.alert("Failed to upload your log. Please try again later.");
        return;
    } else if (logResponse['status'] != "OK") {
        window.alert("Failed to upload the log. Consider relaunching or contacting the development team.\n\nError: " + logResponse['error']);
        return;
    }
    const id = logResponse['id']
    $("#pastebinButton").text("ID: " + id);
    window.alert("Your log ID is:\n\n" + id + "\n\nPlease open a support ticket in the Discord and provide this ID so we can assist you. Thank you!");
}
async function logOut() {
    var response = await window.settings.logout();
    accounterror = false;
    if(response === "done") {
        $("#logoutButton").prop("disabled", true);
        $("#logoutButton").addClass("disabled");
        $("#logoutButton").text("Logged out.");
        await popupSuccess("Launcher restarting in 3 seconds!", "350px");
        window.location.reload();
    } else {
        if(response === "not_logged_in") {
            $("#popup").css("width", "325px");
            $("#popup").removeClass("green").addClass("red");
            $("#popup-icon").removeClass("fa-circle-check").addClass("fa-triangle-exclamation");
            $(".popup-container").css("display", "flex");
            await sleep(5);
            $("#popup").css("margin-top", "24px");
            $("#popup").css("opacity", 1);
            $("#popup-description").text("Can't log out, not logged in!");
            await sleep(3000);
            $("#popup").css("margin-top", "-10px");
            $("#popup").css("opacity", 0);
            await sleep(300);
            $(".popup-container").css("display", "none");
            $("#popup").removeClass("red").addClass("green");
            $("#popup-icon").removeClass("fa-triangle-exclamation").addClass("fa-circle-check");
            $("#popup").css("width", "300px");
            return
        }
        window.alert("Something went wrong. Please contact the development team.\nError: " + response);
    }
}

async function showPartnerOverlay(type, username) {
    if(type === "creator") {
        $("#partner-creator-yt").remove();
        $("#partner-creator-discord").remove();
        $("#partner-creator-x").remove();
        $("#partner-overlay-creator").show();
        $("#partner-creator-head").attr('src', partners[username]['icon']);
        $("#partner-creator-username").text(username);
        $("#partner-creator-type").text(partners[username]['type']);
        if(partners[username]['socials']['youtube']) {
            $("#partner-creator-sm").append(`<i class="fa-brands fa-youtube" style="color: #ff2100;" id="partner-creator-yt" onclick="copyLink('${partners[username]['socials']['youtube']}')"></i>`)
        }
        if(partners[username]['socials']['discord']) {
            $("#partner-creator-sm").append(`<i class="fa-brands fa-discord" style="color: #5662f6;" id="partner-creator-discord" onclick="copyLink('${partners[username]['socials']['discord']}')"></i>`)
        }
        if(partners[username]['socials']['x']) {
            $("#partner-creator-sm").append(`<i class="fa-brands fa-x-twitter" id="partner-creator-x" onclick="copyLink('${partners[username]['socials']['x']}')"></i>`)
        }
    }
    if(type === "server") {
        $("#partner-server-yt").remove();
        $("#partner-server-discord").remove();
        $("#partner-server-x").remove();
        $("div[id=server-members]").remove();
        $(".people").remove();
        $("#partner-overlay-server").show();
        $("#partner-server-head").attr('src', partners[username]['icon']);
        $("#partner-server-username").text(username);
        $("#partner-server-type").text(partners[username]['type']);
        if(partners[username]['socials']['youtube']) {
            $("#partner-server-sm").append(`<i class="fa-brands fa-youtube" style="color: #ff2100;" id="partner-server-yt" onclick="copyLink('${partners[username]['socials']['youtube']}')"></i>`)
        }
        if(partners[username]['socials']['discord']) {
            $("#partner-server-sm").append(`<i class="fa-brands fa-discord" style="color: #5662f6;" id="partner-server-discord" onclick="copyLink('${partners[username]['socials']['discord']}')"></i>`)
        }
        if(partners[username]['socials']['x']) {
            $("#partner-server-sm").append(`<i class="fa-brands fa-x-twitter" id="partner-server-x" onclick="copyLink('${partners[username]['socials']['x']}')"></i>`)
        }
        if(partners[username]['people']) {
            $("#partner-server-details").append(`<p class="people">People</p>`);
            Object.entries(partners[username]['people']).forEach((entry) => {
                const [key, value] = entry;
                $("#partner-server-details").append(`<div class="member" id="server-members"><img class="head" alt="head" src="${value['icon']}"><p class="username">${key}</p><p class="role">${value['role']}</p></div>`);
            });
        }
    }
}

async function removePartnerOverlay(type) {
    if(type === "creator") {
        $("#partner-overlay").remove();
        $("#partner-overlay-creator").hide();
    }
    if(type === "server") {
        $("#partner-overlay").remove();
        $("#partner-overlay-server").hide();
    }
}

// these should go last!! (2 func.)
run();
getAccount();