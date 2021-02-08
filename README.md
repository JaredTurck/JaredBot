# JaredBot
 JaredBot is a multipurpose discord bot with a huge range of  features, from music, moderation, levels, to image commands.


## Features

#### Content Filtering
Content filtering is a feature that allows the bot to automatically remove and warn users who post, adult content, phishing links, spam, promotions, tags, and use offensive language.

#### AuoMod
Automod is a powerful tool that allows the bot to automatically mute, kick or ban users who break specifically defined rules. Automod is designed to run alongside content filtering, acting as a way to punish users who get to many warnings. As well as counting content filtering warnings, it will also keep track of warnings moderators and admins give.

#### Music
The bot has a built in music player, play or stream high quality music (96 kbps) directly into your discord server. The music player supports all of the standard commands, play, skip, np, pause, resume, remove, move, loop, shuffle, replay, join, songinfo, forward, seek, rewind and volume.
JaredBot also supports a feature called freeplay, where once the end of the queue is reached, the bot will automatically choose another song for you, that is similar to the song you where listening to.

#### AutoPost
With AutoPost you can configure JaredBot to automatically post photos after a specified period of time, for example "automeme on 60" will post a new meme every hour in the specified channel. AutoPost can also be configured to post other types of photos such as animals like: birds, cats, dogs, and snakes.

#### Levels
See which users have sent the most messages on your server, the levelling feature will keep track of the number of messages each user sends, you can view the leaderboard at any time with the level command.


## Installation
The bot is designed to be run on a Windows, it has specific software dependencies that I suspect won’t be compatible with Linux or Mac. Although I haven’t tested it on another OS, so feel free to test it yourself.

#### Software Dependencies
* Make sure you have the latest version of node.js installed, you can download node from the [node.js website](https://nodejs.org/).
* Most of the video commands like `-mp4` wont work unless you have ffmpeg install and have added it to your Path environment variables, you can download ffmpeg [here]( https://ffmpeg.org/).
* The `-execute` command requires Python 3 to be installed, download python [here]( https://www.python.org/)
* The `-ig` command requires instaloader, please see the docs [here]( https://instaloader.github.io/)
* The `-speedtest` command requires [Ooklas Speedtest CLI]( https://www.speedtest.net/apps/cli)
* The `-whois` command requires a copy of the Whois executable, which you can download from Microsoft website [here]( https://docs.microsoft.com/en-us/sysinternals/downloads/whois)
* The `-render` command requires melt.exe, which you can get by downloading Shotcut video editor [here]( https://shotcut.org/)
* Make sure to add all of these software dependencies above to your Path environment variable, so that the bot can find the executables.

#### Node Package Manager Dependencies
* [Discord.js]( https://www.npmjs.com/package/discord.js)
* [City-TimeZones]( https://www.npmjs.com/package/city-timezones)
* [ytdl-Core](https://www.npmjs.com/package/ytdl-core)
* [scrape-youtube](https://www.npmjs.com/package/scrape-youtube)
* [jimp](https://www.npmjs.com/package/jimp)
* [node-fetch](https://www.npmjs.com/package/node-fetch)
* [extract-zip](https://www.npmjs.com/package/extract-zip)

#### API Dependencies
* You will need a [Safe Browsing API key](https://developers.google.com/safe-browsing) from Google, this is used in the malicious link checking feature.

## Social links
* [JaredBot Invite Link](https://discord.com/oauth2/authorize?client_id=767561850404864071&scope=bot&permissions=1610088439)
* [JaredBot website](https://jaredbot.uk/)
* [Commands List](https://jaredbot.uk/command)
* [Support Server](https://discord.com/invite/QDeUXq4)
* [My Steam Account](https://steamcommunity.com/id/jaredcat)
* [JaredBot YouTube](https://www.youtube.com/channel/UCZMhn0olhq5G2ttBqNOv1IQ)
