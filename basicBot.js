/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {

    var kill = function () {
        clearInterval(jadBot.room.autodisableInterval);
        clearInterval(jadBot.room.afkInterval);
        jadBot.status = false;
    };

    var storeToStorage = function () {
        localStorage.setItem("jadBotsettings", JSON.stringify(jadBot.settings));
        localStorage.setItem("jadBotRoom", JSON.stringify(jadBot.room));
        var jadBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: jadBot.version
        };
        localStorage.setItem("jadBotStorageInfo", JSON.stringify(jadBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Yemasthui/jadBot/master/lang/langIndex.json", function (json) {
            var link = jadBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[jadBot.settings.language.toLowerCase()];
                if (jadBot.settings.chatLink !== jadBot.chatLink) {
                    link = jadBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = jadBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        jadBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(jadBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        jadBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("jadBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                jadBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("jadBotStorageInfo");
        if (info === null) API.chatLog(jadBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("jadBotsettings"));
            var room = JSON.parse(localStorage.getItem("jadBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(jadBot.chat.retrievingdata);
                for (var prop in settings) {
                    jadBot.settings[prop] = settings[prop];
                }
                jadBot.room.users = room.users;
                jadBot.room.afkList = room.afkList;
                jadBot.room.historyList = room.historyList;
                jadBot.room.mutedUsers = room.mutedUsers;
                jadBot.room.autoskip = room.autoskip;
                jadBot.room.roomstats = room.roomstats;
                jadBot.room.messages = room.messages;
                jadBot.room.queue = room.queue;
                jadBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(jadBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-info");
        info = roominfo.textContent;
        var ref_bot = "@jadBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        jadBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    var linkFixer = function (msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    var botCreator = "Jadkinsa1";
    var botCreatorIDs = [];

    var jadBot = {
        version: "2.1.3",
        status: false,
        name: "JadBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Yemasthui/jadBot/master/jadBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/Yemasthui/jadBot/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        settings: {
            botName: "JadBot",
            language: "english",
            chatLink: "https://rawgit.com/Yemasthui/jadBot/master/lang/en.json",
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            lockskipPosition: 3,
            lockskipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Yemasthui/jadBot-customization/master/blacklists/ExampleNSFWlist.json",
                OP: "https://rawgit.com/Yemasthui/jadBot-customization/master/blacklists/ExampleOPlist.json"
            }
        },
        room: {
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (jadBot.status && jadBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    jadBot.room.roulette.rouletteStatus = true;
                    jadBot.room.roulette.countdown = setTimeout(function () {
                        jadBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(jadBot.chat.isopen);
                },
                endRoulette: function () {
                    jadBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * jadBot.room.roulette.participants.length);
                    var winner = jadBot.room.roulette.participants[ind];
                    jadBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = jadBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(jadBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        jadBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            }
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = jadBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < jadBot.room.users.length; i++) {
                    if (jadBot.room.users[i].id === id) {
                        return jadBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < jadBot.room.users.length; i++) {
                    var match = jadBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return jadBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = jadBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                if (botCreatorIDs.indexOf(u.id) > -1) return 10;
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = jadBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < jadBot.room.queue.id.length; i++) {
                            if (jadBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            jadBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(jadBot.chat.alreadyadding, {position: jadBot.room.queue.position[alreadyQueued]}));
                        }
                        jadBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            jadBot.room.queue.id.unshift(id);
                            jadBot.room.queue.position.unshift(pos);
                        }
                        else {
                            jadBot.room.queue.id.push(id);
                            jadBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(jadBot.chat.adding, {name: name, position: jadBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = jadBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return jadBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(jadBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return jadBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (jadBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = jadBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(jadBot.chat.toolongago, {name: jadBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = jadBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = jadBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) newPosition = 1;
                var msg = subChat(jadBot.chat.valid, {name: jadBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                jadBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!jadBot.roomUtilities.booth.locked);
                    jadBot.roomUtilities.booth.locked = false;
                    if (jadBot.settings.lockGuard) {
                        jadBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(jadBot.roomUtilities.booth.locked);
                        }, jadBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(jadBot.roomUtilities.booth.locked);
                    clearTimeout(jadBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!jadBot.status || !jadBot.settings.afkRemoval) return void (0);
                var rank = jadBot.roomUtilities.rankToNumber(jadBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, jadBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = jadBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = jadBot.userUtilities.getUser(user);
                            if (rank !== null && jadBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = jadBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = jadBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > jadBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(jadBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(jadBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            jadBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(jadBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: jadBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (jadBot.settings.cycleGuard) {
                        jadBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, jadBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(jadBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (jadBot.settings.motdEnabled) interval = jadBot.settings.motdInterval;
                else interval = jadBot.settings.messageInterval;
                if ((jadBot.room.roomstats.songCount % interval) === 0 && jadBot.status) {
                    var msg;
                    if (jadBot.settings.motdEnabled) {
                        msg = jadBot.settings.motd;
                    }
                    else {
                        if (jadBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = jadBot.room.roomstats.songCount % jadBot.settings.intervalMessages.length;
                        msg = jadBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in jadBot.settings.blacklists) {
                    jadBot.room.blacklists[bl] = [];
                    if (typeof jadBot.settings.blacklists[bl] === 'function') {
                        jadBot.room.blacklists[bl] = jadBot.settings.blacklists();
                    }
                    else if (typeof jadBot.settings.blacklists[bl] === 'string') {
                        if (jadBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(jadBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    jadBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(jadBot.room.newBlacklisted);
                }
                else {
                    console.log(jadBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < jadBot.room.newBlacklisted.length; i++) {
                    var track = jadBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = chat.message.trim();
            for (var i = 0; i < jadBot.room.users.length; i++) {
                if (jadBot.room.users[i].id === chat.uid) {
                    jadBot.userUtilities.setLastActivity(jadBot.room.users[i]);
                    if (jadBot.room.users[i].username !== chat.un) {
                        jadBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (jadBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!jadBot.chatUtilities.commandCheck(chat))
                jadBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < jadBot.room.users.length; i++) {
                if (jadBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                jadBot.room.users[index].inRoom = true;
                var u = jadBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                jadBot.room.users.push(new jadBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < jadBot.room.users.length; j++) {
                if (jadBot.userUtilities.getUser(jadBot.room.users[j]).id === user.id) {
                    jadBot.userUtilities.setLastActivity(jadBot.room.users[j]);
                    jadBot.room.users[j].jointime = Date.now();
                }

            }
            if (jadBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(jadBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(jadBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            for (var i = 0; i < jadBot.room.users.length; i++) {
                if (jadBot.room.users[i].id === user.id) {
                    jadBot.userUtilities.updateDC(jadBot.room.users[i]);
                    jadBot.room.users[i].inRoom = false;
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < jadBot.room.users.length; i++) {
                if (jadBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        jadBot.room.users[i].votes.woot++;
                    }
                    else {
                        jadBot.room.users[i].votes.meh++;
                    }
                }
            }
        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < jadBot.room.users.length; i++) {
                if (jadBot.room.users[i].id === obj.user.id) {
                    jadBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            var user = jadBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < jadBot.room.users.length; i++){
                if(jadBot.room.users[i].id === user.id){
                    jadBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (jadBot.settings.songstats) {
                if (typeof jadBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(jadBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            jadBot.room.roomstats.totalWoots += lastplay.score.positive;
            jadBot.room.roomstats.totalMehs += lastplay.score.negative;
            jadBot.room.roomstats.totalCurates += lastplay.score.grabs;
            jadBot.room.roomstats.songCount++;
            jadBot.roomUtilities.intervalMessage();
            jadBot.room.currentDJID = obj.dj.id;

            var mid = obj.media.format + ':' + obj.media.cid;
            for (var bl in jadBot.room.blacklists) {
                if (jadBot.room.blacklists[bl].indexOf(mid) > -1) {
                    API.sendChat(subChat(jadBot.chat.isblacklisted, {blacklist: bl}));
                    return API.moderateForceSkip();
                }
            }

            var alreadyPlayed = false;
            for (var i = 0; i < jadBot.room.historyList.length; i++) {
                if (jadBot.room.historyList[i][0] === obj.media.cid) {
                    var firstPlayed = jadBot.room.historyList[i][1];
                    var plays = jadBot.room.historyList[i].length - 1;
                    var lastPlayed = jadBot.room.historyList[i][plays];
                    API.sendChat(subChat(jadBot.chat.songknown, {plays: plays, timetotal: jadBot.roomUtilities.msToStr(Date.now() - firstPlayed), lasttime: jadBot.roomUtilities.msToStr(Date.now() - lastPlayed)}));
                    jadBot.room.historyList[i].push(+new Date());
                    alreadyPlayed = true;
                }
            }
            if (!alreadyPlayed) {
                jadBot.room.historyList.push([obj.media.cid, +new Date()]);
            }
            var newMedia = obj.media;
            if (jadBot.settings.timeGuard && newMedia.duration > jadBot.settings.maximumSongLength * 60 && !jadBot.room.roomevent) {
                var name = obj.dj.username;
                API.sendChat(subChat(jadBot.chat.timelimit, {name: name, maxlength: jadBot.settings.maximumSongLength}));
                API.moderateForceSkip();
            }
            if (user.ownSong) {
                API.sendChat(subChat(jadBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(jadBot.room.autoskipTimer);
            if (jadBot.room.autoskip) {
                var remaining = obj.media.duration * 1000;
                jadBot.room.autoskipTimer = setTimeout(function () {
                    console.log("Skipping track.");
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
                }, remaining + 3000);
            }
            storeToStorage();

        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (jadBot.room.queue.id.length > 0 && jadBot.room.queueable) {
                    jadBot.room.queueable = false;
                    setTimeout(function () {
                        jadBot.room.queueable = true;
                    }, 500);
                    jadBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = jadBot.room.queue.id.splice(0, 1)[0];
                            pos = jadBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    jadBot.room.queueing--;
                                    if (jadBot.room.queue.id.length === 0) setTimeout(function () {
                                        jadBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + jadBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = jadBot.userUtilities.lookupUser(users[i].id);
                jadBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!jadBot.settings.filterChat) return false;
            if (jadBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(jadBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(jadBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < jadBot.chatUtilities.spam.length; j++) {
                if (msg === jadBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(jadBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = jadBot.userUtilities.getPermission(chat.uid);
                var user = jadBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < jadBot.room.mutedUsers.length; i++) {
                    if (jadBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (jadBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (jadBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(jadBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(jadBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = jadBot.chat.roulettejoin;
                var rlLeaveChat = jadBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === jadBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 2 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === '!') {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = jadBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== "!join" && chat.message !== "!leave") {
                    if (userPerm === 0 && !jadBot.room.usercommand) return void (0);
                    if (!jadBot.room.allcommand) return void (0);
                }
                if (chat.message === '!eta' && jadBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = jadBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in jadBot.commands) {
                    var cmdCall = jadBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (jadBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            jadBot.commands[comm].functionality(chat, jadBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    jadBot.room.usercommand = false;
                    setTimeout(function () {
                        jadBot.room.usercommand = true;
                    }, jadBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    API.moderateDeleteChat(chat.cid);
                    jadBot.room.allcommand = false;
                    setTimeout(function () {
                        jadBot.room.allcommand = true;
                    }, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = jadBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < jadBot.room.users.length; j++) {
                        if (jadBot.userUtilities.getUser(jadBot.room.users[j]).id === chat.uid) {
                            jadBot.userUtilities.setLastActivity(jadBot.room.users[j]);
                        }

                    }
                }
                jadBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                eventUserfan: $.proxy(this.eventUserfan, this),
                eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventFanjoin: $.proxy(this.eventFanjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this)

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.USER_FAN, this.proxy.eventUserfan);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.USER_FAN, this.proxy.eventUserfan);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (jadBot.userUtilities.getPermission(u) < 2) return API.chatLog(jadBot.chat.greyuser);
            if (jadBot.userUtilities.getPermission(u) === 2) API.chatLog(jadBot.chat.bouncer);
            jadBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "https://plug.dj/_/chat/" + cid,
                    type: "DELETE"
                })
            };
            retrieveSettings();
            retrieveFromStorage();
            window.bot = jadBot;
            jadBot.roomUtilities.updateBlacklists();
            setInterval(jadBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            jadBot.getNewBlacklistedSongs = jadBot.roomUtilities.exportNewBlacklistedSongs;
            jadBot.logNewBlacklistedSongs = jadBot.roomUtilities.logNewBlacklistedSongs;
            if (jadBot.room.roomstats.launchTime === null) {
                jadBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < jadBot.room.users.length; j++) {
                jadBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < jadBot.room.users.length; j++) {
                    if (jadBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    jadBot.room.users[ind].inRoom = true;
                }
                else {
                    jadBot.room.users.push(new jadBot.User(userlist[i].id, userlist[i].username));
                    ind = jadBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(jadBot.room.users[ind].id) + 1;
                jadBot.userUtilities.updatePosition(jadBot.room.users[ind], wlIndex);
            }
            jadBot.room.afkInterval = setInterval(function () {
                jadBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            jadBot.room.autodisableInterval = setInterval(function () {
                jadBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            jadBot.loggedInID = API.getUser().id;
            jadBot.status = true;
            API.sendChat('/cap 1');
            API.setVolume(0);
            var emojibutton = $(".icon-emoji-on");
            if (emojibutton.length > 0) {
                emojibutton[0].click();
            }
            loadChat(API.sendChat(subChat(jadBot.chat.online, {botname: jadBot.settings.botName, version: jadBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = jadBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (jadBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !jadBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;
                        if (msg.length === cmd.length) time = 60;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < jadBot.room.users.length; i++) {
                            userTime = jadBot.userUtilities.getLastActivity(jadBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(jadBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (jadBot.room.roomevent) {
                                    jadBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            jadBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(jadBot.chat.maximumafktimeset, {name: chat.un, time: jadBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(jadBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.afkRemoval) {
                            jadBot.settings.afkRemoval = !jadBot.settings.afkRemoval;
                            clearInterval(jadBot.room.afkInterval);
                            API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.afkremoval}));
                        }
                        else {
                            jadBot.settings.afkRemoval = !jadBot.settings.afkRemoval;
                            jadBot.room.afkInterval = setInterval(function () {
                                jadBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        jadBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(jadBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = jadBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = jadBot.roomUtilities.msToStr(inactivity);
                        API.sendChat(subChat(jadBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.room.autoskip) {
                            jadBot.room.autoskip = !jadBot.room.autoskip;
                            clearTimeout(jadBot.room.autoskipTimer);
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.autoskip}));
                        }
                        else {
                            jadBot.room.autoskip = !jadBot.room.autoskip;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(jadBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(jadBot.chat.brandambassador);
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof jadBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(jadBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            jadBot.room.newBlacklisted.push(track);
                            jadBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(jadBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            API.moderateForceSkip();
                            if (typeof jadBot.room.newBlacklistedSongFunction === 'function') {
                                jadBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (jadBot.settings.bouncerPlus) {
                            jadBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!jadBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = jadBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    jadBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(jadBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(jadBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(jadBot.chat.commandslink, {botname: jadBot.settings.botName, link: jadBot.cmdLink}));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                cookies: ['has given you a chocolate chip cookie!',
                    'has given you a soft homemade oatmeal cookie!',
                    'has given you a plain, dry, old cookie. It was the last one in the bag. Gross.',
                    'gives you a sugar cookie. What, no frosting and sprinkles? 0/10 would not touch.',
                    'gives you a chocolate chip cookie. Oh wait, those are raisins. Bleck!',
                    'gives you an enormous cookie. Poking it gives you more cookies. Weird.',
                    'gives you a fortune cookie. It reads "Why aren\'t you working on any projects?"',
                    'gives you a fortune cookie. It reads "Give that special someone a compliment"',
                    'gives you a fortune cookie. It reads "Take a risk!"',
                    'gives you a fortune cookie. It reads "Go outside."',
                    'gives you a fortune cookie. It reads "Don\'t forget to eat your veggies!"',
                    'gives you a fortune cookie. It reads "Do you even lift?"',
                    'gives you a fortune cookie. It reads "m808 pls"',
                    'gives you a fortune cookie. It reads "If you move your hips, you\'ll get all the ladies."',
                    'gives you a fortune cookie. It reads "I love you."',
                    'gives you a Golden Cookie. You can\'t eat it because it is made of gold. Dammit.',
                    'gives you an Oreo cookie with a glass of milk!',
                    'gives you a rainbow cookie made with love :heart:',
                    'gives you an old cookie that was left out in the rain, it\'s moldy.',
                    'bakes you fresh cookies, it smells amazing.'
                ],
                getCookie: function () {
                    var c = Math.floor(Math.random() * this.cookies.length);
                    return this.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(jadBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = jadBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(jadBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(jadBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(jadBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        jadBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.cycleGuard) {
                            jadBot.settings.cycleGuard = !jadBot.settings.cycleGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.cycleguard}));
                        }
                        else {
                            jadBot.settings.cycleGuard = !jadBot.settings.cycleGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            jadBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(jadBot.chat.cycleguardtime, {name: chat.un, time: jadBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = jadBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(jadBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = jadBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        for (var i = 0; i < chats.length; i++) {
                            var n = chats[i].textContent;
                            if (name.trim() === n.trim()) {
                                var cid = $(chats[i]).parent()[0].getAttribute('data-cid');
                                API.moderateDeleteChat(cid);
                            }
                        }
                        API.sendChat(subChat(jadBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(jadBot.chat.emojilist, {link: link}));
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = jadBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        if (pos < 0) return API.sendChat(subChat(jadBot.chat.notinwaitlist, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = jadBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(jadBot.chat.eta, {name: name, time: estimateString}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.fbLink === "string")
                            API.sendChat(subChat(jadBot.chat.facebook, {link: jadBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.filterChat) {
                            jadBot.settings.filterChat = !jadBot.settings.filterChat;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.chatfilter}));
                        }
                        else {
                            jadBot.settings.filterChat = !jadBot.settings.filterChat;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.chatfilter}));
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "http://i.imgur.com/SBAso1N.jpg";
                        API.sendChat(subChat(jadBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.room.roulette.rouletteStatus && jadBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            jadBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(jadBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = jadBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = jadBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(jadBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = jadBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = jadBot.userUtilities.getPermission(chat.uid);
                        var permTokick = jadBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(jadBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(jadBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        API.sendChat(jadBot.chat.kill);
                        jadBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = jadBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            jadBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(jadBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = jadBot.userUtilities.lookupUser(chat.uid);
                        var perm = jadBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://www.youtube.com/watch?v=" + media.cid;
                                API.sendChat(subChat(jadBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(jadBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        jadBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = jadBot.settings.lockdownEnabled;
                        jadBot.settings.lockdownEnabled = !temp;
                        if (jadBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.lockGuard) {
                            jadBot.settings.lockGuard = !jadBot.settings.lockGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.lockdown}));
                        }
                        else {
                            jadBot.settings.lockGuard = !jadBot.settings.lockGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            jadBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(jadBot.chat.usedlockskip, {name: chat.un}));
                                jadBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    jadBot.room.skippable = false;
                                    setTimeout(function () {
                                        jadBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        jadBot.userUtilities.moveUser(id, jadBot.settings.lockskipPosition, false);
                                        jadBot.room.queueable = true;
                                        setTimeout(function () {
                                            jadBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < jadBot.settings.lockskipReasons.length; i++) {
                                var r = jadBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += jadBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(jadBot.chat.usedlockskip, {name: chat.un}));
                                jadBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    jadBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        jadBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        jadBot.userUtilities.moveUser(id, jadBot.settings.lockskipPosition, false);
                                        jadBot.room.queueable = true;
                                        setTimeout(function () {
                                            jadBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            lockskipposCommand: {
                command: 'lockskippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            jadBot.settings.lockskipPosition = pos;
                            return API.sendChat(subChat(jadBot.chat.lockskippos, {name: chat.un, position: jadBot.settings.lockskipPosition}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            jadBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(jadBot.chat.lockguardtime, {name: chat.un, time: jadBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            jadBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(jadBot.chat.maxlengthtime, {name: chat.un, time: jadBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + jadBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!jadBot.settings.motdEnabled) jadBot.settings.motdEnabled = !jadBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            jadBot.settings.motd = argument;
                            API.sendChat(subChat(jadBot.chat.motdset, {msg: jadBot.settings.motd}));
                        }
                        else {
                            jadBot.settings.motdInterval = argument;
                            API.sendChat(subChat(jadBot.chat.motdintervalset, {interval: jadBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === jadBot.loggedInID) return API.sendChat(subChat(jadBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(jadBot.chat.move, {name: chat.un}));
                            jadBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(jadBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == "" || time == null || typeof time == "undefined") {
                                return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = jadBot.userUtilities.getPermission(chat.uid);
                        var permUser = jadBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             jadBot.room.mutedUsers.push(user.id);
                             if (time === null) API.sendChat(subChat(jadBot.chat.mutednotime, {name: chat.un, username: name}));
                             else {
                             API.sendChat(subChat(jadBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                             setTimeout(function (id) {
                             var muted = jadBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === id) {
                             indexMuted = i;
                             wasMuted = true;
                             }
                             }
                             if (indexMuted > -1) {
                             jadBot.room.mutedUsers.splice(indexMuted);
                             var u = jadBot.userUtilities.lookupUser(id);
                             var name = u.username;
                             API.sendChat(subChat(jadBot.chat.unmuted, {name: chat.un, username: name}));
                             }
                             }, time * 60 * 1000, user.id);
                             }
                             */
                            if (time > 45) {
                                API.sendChat(subChat(jadBot.chat.mutedmaxtime, {name: chat.un, time: "45"}));
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(jadBot.chat.mutedtime, {name: chat.un, username: name, time: time}));

                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(jadBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(jadBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(jadBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                                setTimeout(function (id) {
                                    API.moderateUnmuteUser(id);
                                }, time * 60 * 1000, user.id);
                            }
                        }
                        else API.sendChat(subChat(jadBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.opLink === "string")
                            return API.sendChat(subChat(jadBot.chat.oplist, {link: jadBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(jadBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        jadBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(jadBot.chat.reload);
                        storeToStorage();
                        jadBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(jadBot.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = jadBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(jadBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.etaRestriction) {
                            jadBot.settings.etaRestriction = !jadBot.settings.etaRestriction;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.etarestriction}));
                        }
                        else {
                            jadBot.settings.etaRestriction = !jadBot.settings.etaRestriction;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!jadBot.room.roulette.rouletteStatus) {
                            jadBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(jadBot.chat.roomrules, {link: jadBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = jadBot.room.roomstats.totalWoots;
                        var mehs = jadBot.room.roomstats.totalMehs;
                        var grabs = jadBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(jadBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: 'skip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(jadBot.chat.skip, {name: chat.un}));
                        API.moderateForceSkip();
                        jadBot.room.skippable = false;
                        setTimeout(function () {
                            jadBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.songstats) {
                            jadBot.settings.songstats = !jadBot.settings.songstats;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.songstats}));
                        }
                        else {
                            jadBot.settings.songstats = !jadBot.settings.songstats;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me This bot was made by ' + botCreator + '.');
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '/me [@' + from + '] ';

                        msg += jadBot.chat.afkremoval + ': ';
                        if (jadBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += jadBot.chat.afksremoved + ": " + jadBot.room.afkList.length + '. ';
                        msg += jadBot.chat.afklimit + ': ' + jadBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (jadBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jadBot.chat.lockguard + ': ';
                        if (jadBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jadBot.chat.cycleguard + ': ';
                        if (jadBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jadBot.chat.timeguard + ': ';
                        if (jadBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += jadBot.chat.chatfilter + ': ';
                        if (jadBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        var launchT = jadBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = jadBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(jadBot.chat.activefor, {time: since});

                        return API.sendChat(msg);
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.substring(cmd.length + 2, lastSpace);
                        var name2 = msg.substring(lastSpace + 2);
                        var user1 = jadBot.userUtilities.lookupUserName(name1);
                        var user2 = jadBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(jadBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === jadBot.loggedInID || user2.id === jadBot.loggedInID) return API.sendChat(subChat(jadBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 || p2 < 0) return API.sendChat(subChat(jadBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(jadBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 < p2) {
                            jadBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                jadBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            jadBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                jadBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.themeLink === "string")
                            API.sendChat(subChat(jadBot.chat.genres, {link: jadBot.settings.themeLink}));
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.timeGuard) {
                            jadBot.settings.timeGuard = !jadBot.settings.timeGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.timeguard}));
                        }
                        else {
                            jadBot.settings.timeGuard = !jadBot.settings.timeGuard;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.timeguard}));
                        }

                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.motdEnabled) {
                            jadBot.settings.motdEnabled = !jadBot.settings.motdEnabled;
                            API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.motd}));
                        }
                        else {
                            jadBot.settings.motdEnabled = !jadBot.settings.motdEnabled;
                            API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.motd}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $(".icon-population").click();
                        $(".icon-ban").click();
                        setTimeout(function (chat) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return API.sendChat();
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = API.getBannedUsers();
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) {
                                $(".icon-chat").click();
                                return API.sendChat(subChat(jadBot.chat.notbanned, {name: chat.un}));
                            }
                            API.moderateUnbanUser(bannedUser.id);
                            console.log("Unbanned " + name);
                            setTimeout(function () {
                                $(".icon-chat").click();
                            }, 1000);
                        }, 1000, chat);
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        jadBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var permFrom = jadBot.userUtilities.getPermission(chat.uid);
                        /**
                         if (msg.indexOf('@') === -1 && msg.indexOf('all') !== -1) {
                            if (permFrom > 2) {
                                jadBot.room.mutedUsers = [];
                                return API.sendChat(subChat(jadBot.chat.unmutedeveryone, {name: chat.un}));
                            }
                            else return API.sendChat(subChat(jadBot.chat.unmuteeveryonerank, {name: chat.un}));
                        }
                         **/
                        var from = chat.un;
                        var name = msg.substr(cmd.length + 2);

                        var user = jadBot.userUtilities.lookupUserName(name);

                        if (typeof user === 'boolean') return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));

                        var permUser = jadBot.userUtilities.getPermission(user.id);
                        if (permFrom > permUser) {
                            /*
                             var muted = jadBot.room.mutedUsers;
                             var wasMuted = false;
                             var indexMuted = -1;
                             for (var i = 0; i < muted.length; i++) {
                             if (muted[i] === user.id) {
                             indexMuted = i;
                             wasMuted = true;
                             }

                             }
                             if (!wasMuted) return API.sendChat(subChat(jadBot.chat.notmuted, {name: chat.un}));
                             jadBot.room.mutedUsers.splice(indexMuted);
                             API.sendChat(subChat(jadBot.chat.unmuted, {name: chat.un, username: name}));
                             */
                            try {
                                API.moderateUnmuteUser(user.id);
                                API.sendChat(subChat(jadBot.chat.unmuted, {name: chat.un, username: name}));
                            }
                            catch (e) {
                                API.sendChat(subChat(jadBot.chat.notmuted, {name: chat.un}));
                            }
                        }
                        else API.sendChat(subChat(jadBot.chat.unmuterank, {name: chat.un}));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            jadBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(jadBot.chat.commandscd, {name: chat.un, time: jadBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(jadBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.usercommands}));
                            jadBot.settings.usercommandsEnabled = !jadBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.usercommands}));
                            jadBot.settings.usercommandsEnabled = !jadBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(jadBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = jadBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(jadBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(jadBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (jadBot.settings.welcome) {
                            jadBot.settings.welcome = !jadBot.settings.welcome;
                            return API.sendChat(subChat(jadBot.chat.toggleoff, {name: chat.un, 'function': jadBot.chat.welcomemsg}));
                        }
                        else {
                            jadBot.settings.welcome = !jadBot.settings.welcome;
                            return API.sendChat(subChat(jadBot.chat.toggleon, {name: chat.un, 'function': jadBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.website === "string")
                            API.sendChat(subChat(jadBot.chat.website, {link: jadBot.settings.website}));
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!jadBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof jadBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(jadBot.chat.youtube, {name: chat.un, link: jadBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(jadBot.startup);
}).call(this);
