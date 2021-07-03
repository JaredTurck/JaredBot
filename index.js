/*
Copyright (C) 2021  Jared Turck.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
THE COPYRIGHT HOLDER(S) BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
JaredBot is a multipurpose discord bot with a huge range of 
features, from music, moderation, levels, to image commands.

Content filtering is a feature that allows the bot to automatically 
remove and warn users who post, adult content, phishing links, spam, 
promotions, tags, and use offensive language.

Automod is a powerful tool that allows the bot to automatically mute, 
kick or ban users who break specifically defined rules. Automod is 
designed to run alongside content filtering, acting as a way to punish 
users who get to many warnings. As well as counting content filtering 
warnings, it will also keep track of warnings moderators and admins give.

Music The bot has a built in music player, play or stream high quality music 
(96 kbps) directly into your discord server. The music player supports all of 
the standard commands, play, skip, np, pause, resume, remove, move, loop, 
shuffle, replay, join, songinfo, forward, seek, rewind and volume. JaredBot 
also supports a feature called freeplay, where once the end of the queue is 
reached, the bot will automatically choose another song for you, that is similar 
to the song you where listening to.

AutoPost With AutoPost you can configure JaredBot to automatically post photos 
after a specified period of time, for example "automeme on 60" will post a new 
meme every hour in the specified channel. AutoPost can also be configured to post 
other types of photos such as animals like: birds, cats, dogs, and snakes.

Levels See which users have sent the most messages on your server, the levelling 
feature will keep track of the number of messages each user sends, you can view 
the leaderboard at any time with the level command.
*/

/*
things to fix:
capitals are broken on flip command
pychallenge sometimes fails to fetch
speedtest
*/

// --- Requires ---
const Discord = require("discord.js");
const cityTimezones = require('city-timezones');
const request = require('request');
const fs_append = require('fs');
const fs_write = require('fs');
const fs_read = require('fs');
const cryp = require('crypto');
const ytdl = require('ytdl-core');
const youtube = require('scrape-youtube').default;
const jimp = require('jimp');
const {exec} = require('child_process');
const net = require('net');
const node_fetch = require('node-fetch');
const zip_extract = require('extract-zip');
const os = require('os');

// --- Init Vars ---
// IDs Pez, Skittle, Jared, Elyxia
const authorised_IDs = ["497067274428219423", "268394063550611456", "364787379518701569", "714207191573463102"]; 
const user_ID = "364787379518701569"; // Jared ID
const hentai_channel_ID = "756291926277357600"; // hentai channel ID
const channel_IDs = ["751827086137622658", "762103168061538315", "667882044134653983"]; // announcement channel IDs
const bot_ID = "767561850404864071";
const adds_channel_ID = "751825387243307059";
const suggestions_channel_ID = "775846419306381403";
const music_sharring_channel = "747884314204700752";
const game_invite_channel = "751782587382628372";
const selfroles_channel_ID = "780212725388673036";
const img_only_channel_id = "784604713244688454";
const jared_network_guild_id = "738484352568262747";
var user_who_broke_rules_dict = {};
var authrosied_server_IDs = [];

// some of these values should be configured on a per server basis
var logging = true;				// turn logging on or off
var sniping = true;				// records recently deleted messages
var reply_chance = 16;			// message reply chance
var tag_tag_output = "Admin"; 	// Display tag when mod commands are run
var perm_invite_link = "https://discord.com/invite/QDeUXq4"; // permanent invite link
var clear_message_time = "1:00"; // time to clear the deleted messages log at
var content_filtering = true;	// turn content filtering on/off
var remove_duplicate_adds = true; // removes duplicate adds in the adds channel
var meme_source_from_python = false; // toggle between sourcing meme images from py script or web server
var hentai_user_python = false; // toggle between using python to source images or using the webserver
var rules_include_footer = true; // shows the footer text in the -rules command
var enable_auto_henati = true; // turn auto hentai on or off
var audio_test_video_url = "https://youtu.be/9daq_eG09ik"; // test video for -audiotest command
const xp_per_msg = 20; // amount of XP awarded per message
const xp_per_level = 100; // amount of messages to send before reaching next level
const bot_invite_link = "https://discord.com/oauth2/authorize?client_id=767561850404864071&permissions=201849927&scope=bot";
const user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0";
const large_numb = 2**64;	// generates large number

// Tokens
const token_file_name = log_var("Token File", "TOKEN_DO_NOT_SHARE.txt");
const safe_browsing_filename = log_var("Safe Browsing API", "API/SAFE_BROWSING_API_KEY.txt");
const youtube_data_filename = log_var("YouTube Data API", "API/YOUTUBE_DATA_API_KEY.txt");

// file names
const output_file_henati = log_var("Hentai output file", "InputOutput/output.txt");
const inputs_file_henati = log_var("Hentai input file", "InputOutput/commands.txt");
const output_file_execute = log_var("Execute output file", "InputOutput/execute_output.txt");
const inputs_file_execute = log_var("Execute input file", "execute_input.txt");
const output_file_chatbot = log_var("ChatBot output file", "InputOutput/chat_bot_output.txt");
const inputs_file_chatbot = log_var("ChatBot input file", "InputOutput/chat_bot_input.txt");
const output_file_animals = log_var("Animals output file", "InputOutput/animal_output.txt");
const inputs_file_animals = log_var("Animals input file", "InputOutput/animal_input.txt");
const output_file_steaminfo = log_var("Steam Info output file", "InputOutput/steam_data_output.txt");
const inputs_file_steaminfo = log_var("Steam Info input file", "InputOutput/steam_info_input.txt");
const output_file_random_animal_png = log_var("Random Animal output image", "./current_image.png");
const inputs_file_meme = log_var("Meme input file", "InputOutput/meme_input.txt");
const outputs_file_meme = log_var("Meme output image", "./meme.png");
const input_file_translate = log_var("Translate input", "InputOutput/translate_input.txt");
const output_file_translate = log_var("Translate output", "InputOutput/translate_output.txt");

const dataset_imbored = log_var("Im Bored dataset", "datasets/imbored.txt");
const dataset_firstname = log_var("First Name dataset", "datasets/firstname.txt");
const dataset_surname = log_var("Surname dataset", "datasets/surname.txt");
const default_dance_dir = log_var("Default Dance Directory", "datasets/deafult_dance/");
const dataset_methods_of_death = log_var("Methods of Death dataset", "datasets/methods_of_death.txt");
const dataset_coins_dir = log_var("Coins dataset", "datasets/coins/");
const dataset_dice_dir = log_var("Dice dataset", "datasets/dice/");
const dataset_elements = log_var("Elements dataset", "datasets/elements.txt");
const dataset_fonts = log_var("Fonts dataset", "datasets/fonts.txt");
const dataset_pokemon = log_var("Pokemon dataset", "datasets/pokemon.txt");
const dataset_medicine = log_var("Medicine dataset", "datasets/medicines.txt");
const words_dataset = log_var("Just One Words", + "datasets/words.txt");
const py_challenges_dataset = log_var("Python Challenges dataset", "datasets/py_challenges.txt");
const auto_py_challenge_filename = log_var("Python Challenge filename", "auto_py_channel_ID.txt");
const justone_members_fname = log_var("Just One Members file name", "justone_members.txt");
const justone_global_members_fname = log_var("Just One Global Members file name", "justone_global_members.txt");
const justone_channel_id_fname = log_var("Just One Channel ID file name", "justone_channel_ID.txt");
const justone_clues_fname = log_var("Just One Clues file name", "just_one_clues.txt");
const justone_words_fname = log_var("Just One Words file name", "just_one_words.txt");
const dataset_dict_words = log_var("Local Dict dataset", "datasets/dict_words_short.txt");
const dataset_country_codes = log_var("Local Country Codes dataset", "datasets/country_codes.txt");
const dataset_morse = log_var("Morse Code dataset", "datasets/morse.txt");
const dataset_animals = log_var("Animals dataset", "datasets/animals.txt");
const dataset_cities = log_var("Cities dataset!", "datasets/cities.csv");
const dataset_countries = log_var("Country dataset!", "datasets/countries.csv");

// Webserver dataset locations
const webserver_root_address = log_var("Webserver root", "https://jaredbot.uk/");
const webserver_memes_dataset = log_var("Webserver memes dataset", webserver_root_address + "img/dataset_memes");
const webserver_catmemes_dataset = log_var("Webserver catmemes dataset", webserver_root_address + "img/dataset_catmemes");
const webserver_cats_dataset = log_var("Webserver cats dataset", webserver_root_address + "img/dataset_cats");
const webserver_dogs_dataset = log_var("Webserver dogs dataset", webserver_root_address + "img/datasets_dogs");
const webserver_heli_dataset = log_var("Webserver helicopters dataset", webserver_root_address + "img/datasets_helicopters/");
const webserver_elms_dataset = log_var("Webserver element photos directory", webserver_root_address + "img/src/elm_photos");
const webserver_pokemon_dataset = log_var("Webserver pokemon dataset", webserver_root_address + "img/src/pokemon");
const webserver_dogmeme_dataset = log_var("Webserver dogmemes dataset", webserver_root_address + "img/datasets_dogmeme");
const webserver_car_dataset = log_var("Webserver cars dataset", webserver_root_address + "img/dataset_cars");
const webserver_owo_dataset = log_var("Webserver owo dataset", webserver_root_address + "img/src/emotion");
const webserver_snake_dataset = log_var("Webserver snakes dataset", webserver_root_address + "img/dataset_snake");
const webserver_igmemes_dataset = log_var("Webserver igmemes dataset", webserver_root_address + "img/datasets_igmemes/2020");
const webserver_src_hug = log_var("Webserver hug dataset", webserver_root_address + "img/src/hug");
const webserver_src_kiss = log_var("Webserver kiss dataset", webserver_root_address + "img/src/kiss");
const webserver_birds_dataset = log_var("Webserver birds dataset", webserver_root_address + "img/dataset_birds");
const webserver_racoon_dataset = log_var("Webserver racoon dataset", webserver_root_address + "img/datasets_racoon");
const webserver_medicines_dataset = log_var("Webserver medicines dataset", webserver_root_address + "img/src/medicine_imgs");
const webserver_photography_dataset = log_var("Photography dataset", webserver_root_address + "img/dataset_photography");
const webserver_bird_dataset = log_var("Bird dataset", webserver_root_address + "img/dataset_birds");
const webserver_cars_dataset = log_var("Cars dataset", webserver_root_address + "img/dataset_cars");
const webserver_leaderboard_dir = log_var("Leaderboard dir", webserver_root_address + "leaderboard");
const webserver_anime_dataset = log_var("Anime dataset", webserver_root_address + "img/src/anime");
const webserver_meow_dataset = log_var("Cat videos", webserver_root_address + "videos/datasets/meow");
const webserver_video_dataset = log_var("Videos dataset", webserver_root_address + "videos/vid");
const webserver_url_short = log_var("URL Shortner folder location", webserver_root_address + "a");
const webserver_floppa_dataset = log_var("Floppa dataset", webserver_root_address + "img/src/small_datasets/floppa");
const webserver_deleted_files_dir = log_var("Deleted files dir", webserver_root_address + "videos/deleted_attach");
const webserver_cat_age_dataset = log_var("Cat Age dataset", webserver_root_address + "img/src/small_datasets/cat_age");
const webserver_mars_dataset = log_var("Mars dataset", webserver_root_address + "img/dataset_mars");
const webserver_cities_dataset = log_var("Cities dataset", webserver_root_address + "img/dataset_maps/cities");
const webserver_country_dataset = log_var("Country dataset", webserver_root_address + "img/dataset_maps/country");

const flip_coin_tails = log_var("Flip Coin Tails", "tails.gif");
const flip_coin_heads = log_var("Flip Coin Heads", "heads.gif");
const flip_coin_file_extension = log_var("Flip Coin File Extension", ".gif");
const deleted_messages_filename = log_var("Deleted messages log", "deleted_messages.log");
const stats_log_file = log_var("Songs played", "logs/stats.txt");
const logging_path = log_var("Logging Path", "logs");
const periodic_table = log_var("Periodic Table", webserver_root_address + "img/src/periodic_table.png");
const mod_error_text = log_var("Mod Error Text", "If you feel this is a mistake please contact your server admin and ask them to grant you the ");
const authorised_servers = log_var("Authorised Servers file", "authorised_server_IDs.txt");
const filenames_higherlower = log_var("Higher Lower scoreboard", "higherlower_scoreboard.txt");
const automod_filename = log_var("Automod filename", "automod.txt");
const warnings_filename = log_var("Warnings filename", "warnings.txt");
const igmemes_channel_file = log_var("Igmemes channel filename", "igmemes_channel_ID.txt");
const photography_channel_file = log_var("photography channel filename", "photo_channel_ID.txt");
const bird_channel_file = log_var("Bird channel filename", "bird_channel_ID.txt");
const car_channel_filename = log_var("Car channel filename", "car_channel_ID.txt");
const cat_channel_filename = log_var("Cat channel filename", "cat_channel_ID.txt");
const dog_channel_filename = log_var("Dogs channel filename", "dog_channel_ID.txt");
const snake_channel_filename = log_var("Snakes channel filename", "snake_channel_ID.txt");
const anime_channel_filename = log_var("Anime channel filename", "anime_channel_ID.txt");
const video_channel_filename = log_var("Video channel filename", "video_channel_ID.txt");
const banned_emoji_filename = log_var("Banned Emojis channel filename", "banned_emojis.txt");
const selfrole_filename = log_var("Selfrole Filename", "logs/Jared_Network_738484352568262747/selfrole.txt");
const filter_filename = log_var("Filter filename", "filter.txt");
const letteremoji_filename = log_var("Letter Emoji channel filename", "letteremoji.txt")
const emoji_id_url = log_var("Emoji ID URL", webserver_root_address + "img/src/banemoji.gif");
const cat_profile_pic = log_var("Cat profile pic file", webserver_root_address + "img/cat1.png");
const lion_profile_pic = log_var("Lion profile pic", webserver_root_address + "img/lion.png");
const py_logo = log_var("Python Logo", webserver_root_address + "img/src/py_logo.png");
const message_count_channel_file = log_var("Message Count log file", "msg_count.txt");
const banned_urls_channel_file = log_var("Banned URLs file name", "banned_urls.txt");
const welcome_channel_name = log_var("Welcome channel file name", "welcome_channel_ID.txt");
const autotranslate_filename = log_var("Autotranslate file name", "autotranslate_channel_ID.txt");
const leaderboard_raw = log_var("Raw leaderboard channel file name", "raw_ranks.txt");
const shotcut_melt_location = log_var("ShotCut melt.exe local file path", "C:/Program Files/Shotcut/melt.exe");
const online_hash_log = log_var("Online file and text Hash log", webserver_root_address + "docs/src/crypto.txt");
const custom_wellcome_filename = log_var("Welcome message filename", "welcome_message.txt");
const solver_filename = log_var("Maths solver filename", "InputOutput/do_math/question.txt");
const solver_output = log_var("Maths Solver output", "InputOutput/do_math/output.png");
const leave_channel_name = log_var("Leave channel filename", "leave_channel_ID.txt");
const muted_log_file = log_var("Muted members dict", "muted_members.txt");
const python_execute_filename = log_var("Python Execute filename", "execute.py");
const javascript_execute_filename = log_var("JavaScript Execute filename", "execute.js");
const cpp_execute_filename = log_var("C++ Execute filename", "execute.cpp");
const mars_channel_filename = log_var("Mars channel filename", "mars_channel_ID.txt");
const gpp_location = log_var("Location of g++.exe", "C:/Users/Jared/WinWG/bin/g++.exe");

// Delays (milliseconds)
const read_output_file_delay_henati = log_var("Delay Hentai", 1000);				// Henati
const read_output_file_delay_clever_bot = log_var("Delay CleverBot", 1000);			// Initial clever bot delay
const read_output_file_delay_clever_bot_2 = log_var("Delay 2 CleverBot", 1000);		// Check again for output delay
const read_output_file_delay_random_meme = log_var("Delay Random Name", 1000);		// Delay for -catmeme and -meme
const read_output_file_delay_steam_info = log_var("Delay Steam Info", 3000);		// Get steam info delay
const higher_lower_end_game_delay = log_var("Delay Higher Lower", 120*1000);		// Higher or lower end game delay
const read_input_file_pokemon_dataset = log_var("Delay Pokemon", 1000);				// Pokemon read dataset timeout
const anti_spam_delay = log_var("Delay anti-spam", 1000);							// Delay between chat replys (prevents bot from spamming)
const hash_delay = log_var("Delay Hash", 100);										// Delay between hashing file and reading checksum
const auto_henati_delay = log_var("Delay Auto Hentai", 10*60*1000);					// Auto henati delay
const max_purdge_amount = log_var("Delay Purdge amount", 50);						// Maximum number of messages you can purdge at a time
const purge_timeout = log_var("Delay Purge timeout", 1000);							// Cooldown for purge command
const autohentai_clear_delay = log_var("Delay Clear Auto Hentai", 500);				// Clear Autohentai timeout
const autopost_init_timeout = log_var("Init timeout for Autopost", 5000);			// For long to wait before setting the autopost timeouts
const just_one_check_clues_timeout = log_var("Just One Clues timeout", 30000);		// How long to check if the clues file has changed
const just_one_channel_id_timeout = log_var("Just One Channel ID timeout", 60000);	// How long before checking channel ID has changed
const write_msg_cache_timeout = log_var("Message Cache write timeout", 60000);		// timeout between writing server msg cache to file
const leader_autoupdate_timeout = log_var("Auto Update LeaderBoard", 30000);		// time before leaderboard is automatically updated
const leaderboard_cooldown_timeout = log_var("Leaderboard Cooldown", 30000);		// cool down on leaderboard timeout
const max_render_time = log_var("Max Render time", 5*60*1000);						// maximum amount of CPU time for render
const yt_autodelete_timeout = log_var("Auto Delete", 60*60*1000);					// amount of file a yt file stays on the server for
const autotranslate_reset_timeout = log_var("Auto Translate reset", 2000);			// cooldown time between translating text
const global_logging_var_interval = log_var("log msg timeout", 10*1000);			// timeout between logging messages
const download_speed_interval = log_var("Download speed", 12*60*60*1000);			// check download speed interval
const snipe_cooldown_timeout = log_var("Snipe cooldown", 2*60*1000);				// snipe cooldown
const get_inv_cooldown = log_var("Get inv cooldown", 8*1000);						// get CSGO Inventory cooldown
const execute_code_cooldown = log_var("Execute Cooldown", 5000);					// Execute Cooldown
const random_animal_cooldown = log_var("Cooldow Random Animal", 5000)				// Cooldown for random animal command to prevent spam

// Local Database locations
const server_folder_location = log_var("Web Server Root", "C:/WebServer/");
const jaredbot_folder_location = log_var ("Absolute JaredBot folder path", "C:/OneDrive/Backup/Jared's Desktop 2/Desktop/Discord bot");
const local_memes_dataset = log_var("Local memes dataset", server_folder_location + "img/dataset_memes");
const local_catmemes_dataset = log_var("Local catmemes dataset", server_folder_location + "img/dataset_catmemes");
const local_cats_dataset = log_var("Local cats dataset", server_folder_location + "img/dataset_cats");
const local_dogs_dataset = log_var("Local dogs dataset", server_folder_location + "img/datasets_dogs");
const local_heli_dataset = log_var("Local Helicopters dataset", server_folder_location + "img/datasets_helicopters");
const local_elms_dataset = log_var("Local Elements dataset", server_folder_location + "img/src/elm_photos");
const local_pokemon_dataset = log_var("Local Pokemon dataset", server_folder_location + "img/src/pokemon");
const local_dogmeme_dataset = log_var("Local dogmemes dataset", server_folder_location + "img/datasets_dogmeme");
const local_car_dataset = log_var("Local cars dataset", server_folder_location + "img/dataset_cars");
const local_owo_dataset = log_var("Local owo dataset", server_folder_location + "img/src/emotion");
const local_snake_dataset = log_var("Local snakes dataset", server_folder_location + "img/dataset_snake");
const local_igmemes_dataset = log_var("Local igmemes dataset", server_folder_location + "img/datasets_igmemes/2020");
const local_src_hug = log_var("Local hug dataset", server_folder_location + "img/src/hug");
const local_src_kiss = log_var("Local kiss dataset", server_folder_location + "img/src/kiss");
const local_birds_dataset = log_var("Local birds dataset", server_folder_location + "img/dataset_birds");
const local_racoon_dataset = log_var("Local racoon dataset", server_folder_location + "img/datasets_racoon");
const local_medicines_dataset = log_var("Local medicines dataset", server_folder_location + "img/src/medicine_imgs");
const local_photography_dataset = log_var("Photography dataset", server_folder_location + "img/dataset_photography");
const local_anime_dataset = log_var("Anime dataset", server_folder_location + "img/src/anime");
const local_msg_template = log_var("Message LeaderBoard Template", server_folder_location + "leaderboard_template.html");
const local_leaderboard_dir = log_var("LeaderBoard Directory", server_folder_location + "leaderboard");
const local_hash_log = log_var("Local file and text Hash log", server_folder_location + "docs/src/crypto.txt");
const local_video_dataset = log_var("Local video folder", server_folder_location + "videos/vid");
const local_meow_dataset = log_var("Local cat videos", server_folder_location + "videos/datasets/meow");
const local_font_sans = log_var("Open Sans", server_folder_location + "docs/fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt");
const local_font_sans_black = log_var("Open Sans", server_folder_location + "docs/fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt");
const local_font_impact = log_var("Impact Font", server_folder_location + "docs/fonts/impact/Impact.fnt");
const local_blank_white = log_var("White Image", server_folder_location + "img/src/web/welcome/white.png");
const local_url_short = log_var("URL Short location", server_folder_location + "a");
const local_floppa_dataset = log_var("Floppa dataset", server_folder_location + "img/src/small_datasets/floppa");
const local_deleted_files_dir = log_var("Deleted files dir", server_folder_location + "videos/deleted_attach");
const local_mars_dataset = log_var("Mars dataset", server_folder_location + "img/dataset_mars");

// Dont change these variables
var start_game = false; 			// Dont change value
var random_num = 0;					// Dont change value
var user_counter = 0;				// Dont change value
var member = undefined;				// Dont change value
var up_time = new Date();			// Dont change value
var FileSent = false;				// Dont change value
var user_who_broke_rules_array = [];// Dont change value
var dataset_counts = {};			// Dont change value
var prefix = {};					// prefix dictonary
var n = [[".",".","."],[".",".","."],[".",".","."]];
const ASCII = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+1234567890-=[]{}\|,.<>/?`~ ";
const peper = "JaredBot1234_";

// Hashs
var md5_sum_of_meme_original = "";
var md5_sum_of_meme_updated = "";
var md5_sum_of_current_img_original = "";
var md5_sum_of_current_img_updated = "";
var File_hash = "";

// imbed colours
const embed_colour_info = log_var("Chat Colour Info", "#d5a865");	// blue
const embed_colour_error = log_var("Chat Colour Error", "#FF0000");	// red
const embed_color_chat = log_var("Chat Colour Chat", "#d5a865");	// orange
const embed_colour_img = log_var("Chat Colour Image", "#696969");	// grey
const embed_colour_green = log_var("Chat Colour Green", "#13FF00")	// green

// --- functions ---

function console_log(txt, error=false, mod=false, warning=false) {
	current_time = new Date().toTimeString().split(" ")[0];
	if (error == true && mod == false) {
		console.log("\x1b[31m["+current_time+"][-]\x1b[0m", txt);
	} else if (mod == true && error == false) {
		console.log("\x1b[36m["+current_time+"][*]\x1b[0m", txt);
	} else if (mod == false && error == false && warning == true) {
		console.log("\x1b[33m["+current_time+"][*]\x1b[0m", txt);
	} else {
		console.log("\x1b[32m["+current_time+"][+]\x1b[0m", txt);
	}
}

// log variable to console
function log_var(varname, value) {
	// Key
	// Strings Green
	// Integers Red
	// Info White
	// errors Red
	
	if (isNaN(parseInt(value)) == false) {
		// Integers are Red
		console.log("\x1b[36m"+varname+"\x1b[0m", "set as", "\x1b[31m"+value+"\x1b[0m");
	} else {
		// Strings are Green
		console.log("\x1b[36m"+varname+"\x1b[0m", "set as", "\x1b[32m"+value+"\x1b[0m");
	} 
	return value;
}

// generates a hash of specified file (hash file)
function get_md5(msg, file_name, callback) {
	try {
		// hashs
		sum_md4 = cryp.createHash("md4");
		sum_md5 = cryp.createHash("md5");
		sum_sha1 = cryp.createHash("sha1");
		sum_sha224 = cryp.createHash("sha224");
		sum_sha256 = cryp.createHash("sha256");
		sum_sha384 = cryp.createHash("sha384");
		sum_sha512 = cryp.createHash("sha512");
	
		// read file
		file = fs_read.ReadStream(file_name);
		file.on('data', function(data) {
			sum_md4.update(data);
			sum_md5.update(data);
			sum_sha1.update(data);
			sum_sha224.update(data);
			sum_sha256.update(data);
			sum_sha384.update(data);
			sum_sha512.update(data);
		})

		// update hash
		file.on('end', function() {
			File_hash = sum_md5.digest('hex');
			return callback ({
				"md4" : sum_md4.digest('hex'),
				"md5" : File_hash,
				"sha1" : sum_sha1.digest('hex'),
				"sha224" : sum_sha224.digest('hex'),
				"sha256" : sum_sha256.digest('hex'),
				"sha384" : sum_sha384.digest('hex'),
				"sha512" : sum_sha512.digest('hex')
			})
		})
		file.on('error', function(err) {
			console_log("Failed to read file in function get_md5! " + err, error=true);
			if (msg != null) {
				embed_error(msg, "Failed to read file, please try again! " + err);
			}
		})
		
	} catch (err) {
		console_log("Error thrown in get_md5 " + err, error=true);
	}
}

// generates hash of a string
function get_hash(txt, func="md5", callback) {
	try {
		return callback(cryp.createHash(func).update(txt).digest("hex"));
	} catch (err) {
		console_log("Failed to generate hash! " + err, error=true);
		return callback(false);
	}
}

// checks if a file has changed by comparing hashs
function check_if_file_changed(outputs_file, msg, continued, delay, IsFile) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to check if file has changed, guild is undefined or null!", error=true);
			return false;
		}
	
		// read output
		// get file check sum
		if (continued == true) {
			get_md5(msg, outputs_file)
			setTimeout(function() {
				md5_sum_of_meme_original = File_hash;
				console_log("updated = " + md5_sum_of_meme_updated+" ["+md5_sum_of_meme_original == md5_sum_of_meme_updated+"]!");
			}, hash_delay);
		}
	
		// wait until the file check sum has changed, then send message
		FileSent = false;
		setTimeout(function() {
			get_md5(msg, outputs_file);
			setTimeout(function() {
				md5_sum_of_meme_updated = File_hash;
				if (md5_sum_of_meme_original != md5_sum_of_meme_updated) {
					console_log(" = " + md5_sum_of_meme_updated)
				}
			
				// check if hash changed
				if (md5_sum_of_meme_original == md5_sum_of_meme_updated) {
					setTimeout(function(){
						check_if_file_changed(outputs_file, msg, false, delay, IsFile);
					}, delay, msg)
				} if (md5_sum_of_meme_original != md5_sum_of_meme_updated) {
					// if hash has changed then send message
					if (FileSent == false) {
						if (IsFile == true) {
							msg_channel_send(msg, "", { files: [outputs_file] }).then (msg => {
								console_log("uploaded meme to discord!");
								FileSent = true;
							}).catch(err => {
								console_log("Error thrown in check MD5 msg_channel_send function!", error=true);
							})
						} else if (IsFile == false) {
							// open output file
							fs_read.readFile(output_file_henati, "utf8", function(err, data) {
								if (err) {
									return console_log("Failed to read file", error=true);
								}
								// send message
								msg_channel_send(msg, data);
							});
						}
					}
				}
			}, hash_delay);
		}, delay, msg);
	
		// file sent change back to false
		FileSent = false;
	} catch (err) {
		console_log("Error thrown in check_if_file_changed function! " + err, error=true);
	}
}

// creates a file if it does not exist
function make_server_folder_file(msg, the_current_file) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to make server folder file, guild is undefined or null!", error=true);
			return false;
		}
	
		// make directory if it does not exist
		var server_name_2 = get_server_name(msg); // server folder
		var server_file_2 = logging_path +"/"+ server_name_2 +"/" + the_current_file;
		
		// check if server folder exists
		if (!fs_read.existsSync(logging_path +"/"+ server_name_2)) {
			fs_read.mkdirSync(logging_path +"/"+ server_name_2);
		}
		
		// check if the file exists	
		return_value = true;
		try {
			if (!fs_read.existsSync(server_file_2)) {
				// create file
				fs_write.writeFile(server_file_2, "", function(err) {
					if (err) {
						return console_log("Failed to write to file " + the_current_file, error=true);
					}
					console_log("File created!");
					return_value = false;
				})
			}
		} catch (err) {
			console_log("Failed to create file!", error=true);
		}
		return return_value;
	} catch (err) {
		console_log("Error thrown in make_server_folder_file function! " + err, error=true);
	}
}

// creates a file if it doesn't exist in custom path
function make_server_root_file(msg, the_current_file) {
	try {
		// check for undefined guild
		if (msg != "global") {
			if (msg == undefined || msg.guild == undefined || msg.guild == null) {
				console_log("Failed to make server root file, guild is undefined!", error=true);
				return false;
			}
		}
	
		// check if the file exists	
		return_value = true;
		try {
			if (!fs_read.existsSync(the_current_file)) {
				// create file
				fs_write.writeFile(the_current_file, "", function(err) {
					if (err) {
						return console_log("Failed to write to file " + the_current_file, error=true);
					}
					console_log("File created!");
					return_value = false;
				})
			}
		} catch (err) {
			console_log("Failed to create file!", error=true);
		}
		return return_value;
	} catch (err) {
		console_log("Error thrown in make_server_root_file function! " + err, error=true);
	}
}

// creates file if it does not exist in logs/servername, then appends data
function create_file_then_append_data(msg, auto_filename, data, cb, endl="\n", overwrite=false) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to create file then append data, guild is undefined or null!", error=true);
			return;
		}
	
		// get directory
		auto_dir = get_server_name(msg);
		auto_path = logging_path + "/" + auto_dir + "/" + auto_filename;
	
		// make file
		async function make_file() {
			make_server_folder_file(msg, auto_filename);
			return;
		}
		
		// append data to file
		async function write_automod_rule(){
			await make_file();
			if (overwrite == true) {
				fs_write.writeFile(auto_path, data, function(err) {
					if (err) {
						console_log("Failed to append data to file " + auto_filename, error=true);
					}
				})
			} else {
				fs_append.appendFile(auto_path, data + endl, function(err) {
					if (err) {
						console_log("Failed to append data to file " + auto_filename, error=true);
					}
				})
			}
		}
		write_automod_rule();
		is_error = false;
	} catch (err) {
		console_log("Error thrown in create_file_then_append_data function! " + err, error=true);
		is_error = true;
	} finally {
		if (typeof(cb) == "function") {
			return cb(is_error);
		}
	}
}

// creates file if it does not exist in server root, then appends data
function create_file_then_append_data_custom_path(msg, fname, data, endl="\n", overwrite=false) {
	try {
		// check for undefined guild
		if (msg != "global") {
			if (msg == undefined || msg.guild == undefined || msg.guild == null) {
				console_log("Failed to create file then append data with custom path, guild is undefined or null!", error=true);
				return false;
			}
		}
	
		// make file
		async function make_file() {
			make_server_root_file(msg, fname);
				return;
			}
		
		// append data to file
		async function write_automod_rule(){
			await make_file();
			if (overwrite == true) {
				fs_append.writeFile(fname, data + endl, function(err) {
					if (err) {
						console_log("Failed to write data to file " + fname, error=true);
					}
				})
			} else {
				fs_append.appendFile(fname, data + endl, function(err) {
					if (err) {
						console_log("Failed to append data to file " + fname, error=true);
					}
				})
			}
		} write_automod_rule();
	} catch (err) {
		console_log("Error thrown in create_file_then_append_data_custom_path function! " + err, error=true);
	}
}

// clears a file, deletes all of its data
function clear_file(msg, channel_filename) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to clear file, guild is undefined or null!", error=true);
			return false;
		}
	
		async function make_file() {
			// make file
			await make_server_folder_file(msg, channel_filename);
		
			// get directory
			file_dir = get_server_name(msg);
			file_path = logging_path + "/" + file_dir + "/" + channel_filename;
		
			// clear file
			fs_append.writeFile(file_path, "", function(err) {
				if (err) {
					console_log("Failed to clear file " + channel_filename, error=true);
				}
			})
		} make_file().then(function() {
			console_log(channel_filename + " cleared for server " + msg.guild.id);
		}).catch(err => {
			console_log("Error thrown in clear_file make_file function! " + err, error=true);
		});
	} catch (err) {
		console_log("Error thrown in clear_file function! " + err, error=true);
	}
}

// remove text from a file
function remove_text_from_file(msg, replace_str, channel_filename, sep=";") {
	try {
		// get server name
		server_name = get_server_name(msg); // server folder
		server_file = logging_path +"/"+ server_name +"/" + channel_filename;
		
		// read file
		fs_read.readFile(server_file, "utf8", function(err, data) {
			if (err) {
				return console_log("Failed to read muted users database file!", error=true);
			}
			
			// write to file
			new_data = remove_duplicate_str(data.split(replace_str).join(sep), sep);
			create_file_then_append_data(msg, channel_filename, new_data, endl=sep, overwrite=true);
		})
	} catch (err) {
		console_log("Error thrown in remove_text_from_file function! " + err, error=true);
	}
}

// returns true if a string contains only digits, sends error mmessage to user if it does not
function isInt(msg, n, range_start, range_end, varDescription, ErrorMessageEnd="") {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to check if num is int, guild is undefined or null!", error=true);
			return false;
		}
	
		if (isNaN(parseInt(n)) == false) {
			if (n > range_start) {
				if (n < range_end) {
					if (n.indexOf(".") == -1) {
						if (n.indexOf("-") == -1) {
							return true;
						} else {
							embed_error(msg, "your " + varDescription + " number cannot be a negative! " + ErrorMessageEnd);
							return false;
						}
					} else {
						embed_error(msg, "your " + varDescription + " number cannot be a decimal! " + ErrorMessageEnd);
						return false;
					}
				} else {
					embed_error(msg, "your " + varDescription + " is out of range, number to big! " + ErrorMessageEnd);
					return false;
				}
			} else {
				embed_error(msg, "your " + varDescription + " is out of range, number to small! " + ErrorMessageEnd);
				return false;
			}
		} else {
			embed_error(msg, "your " + varDescription + " is not a valid number! " + ErrorMessageEnd);
			return false;
		}
	} catch (err) {
		console_log("Error thrown in isInt function! " + err, error=true);
	}
}

// checks if a string contains only digits (no error is sent to user)
function isInt_without_error(n, range_start, range_end) {
	try {
		if (isNaN(parseInt(n)) == false) {
			if (n > range_start) {
				if (n < range_end) {
					if (n.indexOf(".") == -1) {
						if (n.indexOf("-") == -1) {
							return true;
						} else {
							return false;
						}
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	} catch (err) {
		console_log("Error thrown in isInt_without_error function! " + err, error=true);
	}
}

// reads the contents of channel file, then updates it in global var
function read_file(channel_file, intervals, allow_non_int=false, sep="", remove_dupes=false, single_item=false) {
	try {
		// check each authorised server ID
		for (i=0;i<authrosied_server_IDs.length;i++) {
			// get server name
			current_server_name2 = bot.guilds.cache.get(authrosied_server_IDs[i])
			current_server_id = authrosied_server_IDs[i];
		
			function do_itteration(current_server_id) {
				if (current_server_name2 != undefined && current_server_name2.name != undefined) {
					current_server_name2 = current_server_name2.name.replace(" ","_")+"_"+ current_server_name2.id;
					// get directory
					f_path = logging_path + "/" + current_server_name2 + "/" + channel_file;
					if (fs_read.existsSync(f_path) == true) {
						// file exists for current server
						// read output file
						fs_read.readFile(f_path, "utf8", function(err, data) {
							if (err) {
								return console_log("Failed to read file " + channel_file, error=true);
							}
							// raw data
							raw_data = [];
							raw = data.split("\n").join("").split(";");
							for (i=0;i<raw.length;i++) {
								if (raw[i] != "") {
									if (isInt_without_error(raw[i], 0, 10**20) == true) {
										raw_data.push(raw[i]);
									}
								
									// allow non-ints
									else if (allow_non_int == true) {
										// remove duplicates
										if (remove_dupes == true) {
											if (check_for_dupes(raw_data, raw[i].split(sep)) == -1) {
												raw_data.push(raw[i].split(sep));
											
											}
										} else {
											raw_data.push(raw[i].split(sep));
										}
									}
								}
							}
							
							// update global var
							try {
								if (single_item == true) {
									intervals[current_server_id] = raw_data[0][0];
								} else {
									intervals[current_server_id] = raw_data;
								}
							} catch (err) {
								console_log("Failed to set interval for " + current_server_id + "! " + err, error=true);
							}
						});
					}
				}
			} do_itteration(current_server_id);
		}
	} catch (err) {
		console_log("Error thrown in read_file function! " + err, error=true);
	}
}

// checks an array contaning subarrays for duplicates
function check_for_dupes(array, sub_array) {
	try {
		list = [];
		for (i=0;i<array.length;i++) {
			list.push(String(array[i]));
		}
	
		return list.indexOf(String(sub_array));
	} catch (err) {
		console_log("Error thrown in check_for_dupes function! " + err, error=true);
	}
}

// counts the number of files in a directory, and adds to global dataset_count var
function count_dir(dir, dataset_name) {
	try {
		fs_read.readdir(dir, (err, files) => {
			if (err) {
				console_log("Failed to count number of files in '" + dir + "'!", error=true);
			} else {
				// add value to global var;
				dataset_counts[dataset_name] = files.length;
				console_log("Counted "+files.length+" files in "+dataset_name);
			}
		})
	} catch (err) {
		console_log("Error thrown in count_dir function! " + err, error=true);
	}
}

// generate user_agent
var arch = [32, 64];
var webkit_ver = ['534.30', '420+', '537.36', '604.1.38', '537.73',
                      '537.36','605.1.15','536.30', '528.5+', '604.1.34',
                      '602.1.50', '601.3.9', '531.2+']

var browser = {
	"Chrome" : ['60.0.3112.107', '47.0.2526.80', '52.0.2743.116',
				'51.0.2704.79', '62.0.3202.84', '42.0.2311.135',
				'59.0.3071.125', '60.0.3112.116', '31.0.1650.0',
				'58.0.3029.83', '34.0.1847.118', '47.0.2526.111',
				'52.0.2743.98', '55.0.2883.91', '38.0.2125.102',
				'46.0.2486.0', '61.0.3163.98', '47.0.2526.83',
				'51.0.2704.64', '41.99900.2250.0242', '90.0.4430.212'],
	"Safari" : ['601.3.9', '533.2+', '537.3', '605.1', '537.36', '604.1', '602.1',
				'419.3', '605.1.15','528.5', '534.30'],
	"Edge" : ['12.10536', '14.14393', '13.10586', '12.246', '13.1058', '15.15254']
};

var Linux_device_IDs = ["SM-G960F Build/R16NW", "SM-G892A Build/NRD90M; wv",
				"SM-G930VC Build/NRD90M; wv", "SM-G935S Build/MMB29K; wv",
				"SM-G920V Build/MMB29K", "SM-G928X Build/LMY47X",
				"Nexus 6P Build/MMB29P", "G8231 Build/41.2.A.0.219; wv",
				"E6653 Build/32.2.A.0.253", "HTC One X10 Build/MRA58K; wv",
				"HTC One M9 Build/MRA58K"];

var browser_os = {
	"Windows NT" : [7.0, 8.0, 8.1, 10.0],
	"Linux; Android" : ["8.0.0", "7.0", "6.0.1", "5.1.1", "6.0.1", "7.1.1", "6.0"],
	"iPhone; CPU iPhone" : ["10_0_1", "11_0", "12_0", "10_0_1"],
	"Mac OS X" : ["10_11_2", "10.10"]
};

var iphone_harware_ver = ['15A5341f', '15A5370a', '16A366', '15E148', '14A403', '15A372', '1A543'];
var iphone_browser_ver = ["12.0", "11.0"];
var android_ver = ['4.2.1', '5.1', '7.0', '6.0.1', '5.1.1', '6.0', '4.4.3', '4.2.2', '8.0.0', '5.0.2', '7.1.1'];
var windows_phone_ver = ["10.0"];
var windows_phone_hardware_ver = ["RM-1152", "RM-1127_16056", "Lumia 950"];

var tablet_builds = ["Pixel C Build/NRD90M; wv", "SGP771 Build/32.2.A.0.253; wv",
				"SHIELD Tablet K1 Build/MRA58K; wv", "SM-T827R4 Build/NRD90M",
				"SAMSUNG SM-T550 Build/LRX22G", "KFTHWI Build/KTU84M",
				"LG-V410/V41020c Build/LRX22G"];

function random_choice(array) {
	return array[parseInt(Math.random() * 1000) % array.length];
}

function get_user_agent() {
	// Browser
	current_webkit = random_choice(webkit_ver);
	current_chrome_ver = random_choice(browser["Chrome"]);
	current_safari_ver = random_choice(browser["Safari"]);

	// Windows
	windows_os_ver = random_choice(browser_os["Windows NT"]);
	windows_arch = random_choice(arch);

    // Linux
	linux_phone_os_ver = random_choice(browser_os["Linux; Android"]);
	linux_phone_device_ID = random_choice(Linux_device_IDs);

    // Iphone
	iphone_os_ver = random_choice(browser_os["iPhone; CPU iPhone"]);
	iphone_hard_ver = random_choice(iphone_harware_ver);
	iphone_browser_ver = random_choice(iphone_browser_ver);

    // Windows Phone
	win_phone_android_ver = random_choice(android_ver);
	win_phone_ver = random_choice(windows_phone_ver);
	win_phone_hard_ver = random_choice(windows_phone_hardware_ver);
	win_phone__edge_ver = random_choice(browser["Edge"]);

    // Tablet
	tablet_os_ver = random_choice(browser_os["Linux; Android"]);
	tablet_build = random_choice(tablet_builds);
	
	user_agent_formats = {
		// windows useragent
		"windows_user_agent" : `Mozilla/5.0 (Windows NT ${windows_os_ver}; Win${windows_arch}; ` +
			`x${windows_arch}) AppleWebKit/${current_webkit} (KHTML, like Gecko) Chrome/` +
			`${current_chrome_ver} Safari/${current_safari_ver}`,
		
		// linux phone useragent
		"linux_phone_useragent" : `Mozilla/5.0 (Linux; Android ${linux_phone_os_ver}; ${linux_phone_device_ID}) ` +
			`AppleWebKit/${current_webkit} (KHTML, like Gecko) Chrome/${current_chrome_ver} Mobile Safari/` +
			`${current_safari_ver}`,
		
		// iphone useragent
		"iphone_useragent" : `Mozilla/5.0 (iPhone; CPU iPhone OS ${iphone_os_ver} like Mac OS X) ` +
			`AppleWebKit/${current_webkit} (KHTML, like Gecko) Version/${iphone_browser_ver} ` +
			`Mobile/${iphone_hard_ver} Safari/${current_safari_ver}`,
		
		// windows phone
		"windows_phone_useragent" : `Mozilla/5.0 (Windows Phone ${win_phone_ver}; Android ${win_phone_android_ver}; `+
			`Microsoft; ${win_phone_hard_ver}) AppleWebKit/${current_webkit} (KHTML, like Gecko) Chrome/` +
			`${current_chrome_ver} Mobile Safari/${current_safari_ver} Edge/${win_phone__edge_ver}`,
		
		// tablet
		"tablet_useragent" : `Mozilla/5.0 (Linux; Android ${tablet_os_ver}; ${tablet_build}) ` +
			`AppleWebKit/${current_webkit} (KHTML, like Gecko) Chrome/${current_chrome_ver} Safari/` +
			`${current_safari_ver}`,
	}
	
	// pick a user agent
	user_agent_keys = Object.keys(user_agent_formats);
	final_user_agent = user_agent_formats[random_choice(user_agent_keys)];
	return final_user_agent;
	
}

// gets HTML from a URL
async function get_html(url, callback) {
	// get html
	await request(url, {
		headers: {
			"User-Agent": get_user_agent(),
			"Connection" : "keep-alive",
			"Pragma" : "no-cache",
			"Cache-Control" : "no-cache",
			"DNT" : "1",
			//"Accept" : "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
			"Accept-Encoding" : "gzip, deflate",
			"Accept-Language" : "en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7",
		},
		body: "",
		method: "GET"
	}, (err, res, html) => {
		if (res.statusCode == 200) {
			// process HTML
			return callback(html);
		} else {
			return callback("");
		}
	})
}

// downloads a file
async function download(url, dest, callback) {
	res = await node_fetch(url);
	buffer = await res.buffer();
	fs_write.writeFile(dest, buffer, () => {
		console_log("finished downloading file", error=false, mod=true);
		return callback(true);
	})
}

// get file metadata
async function get_metadata(url, callback) {
	request({
		url: url,
		method: "HEAD"
	}, function(err, response, body) {
		return callback(response.headers);
	})
}

// removes HTML tags from text
function remove_html_tags(elm) {
	txt = elm;
	for (i=0;i<elm.split('<').length;i++) {
		if (txt.indexOf('<') > -1 && txt.indexOf('>') > -1) {
			txt = txt.slice(0, txt.indexOf('<')) + txt.slice(txt.indexOf('<') + txt.split('<')[1].split('>')[0].length + 2);
		}
	}
	return txt;
}

// formats HTML
function format_html(elm) {
	text_replace = [['<![CDATA[', ''], ['<a class="bb_link" href="', ''], ['https://steamcommunity.com/linkfilter/?url=', ''], 
	['" target="_blank" rel="noreferrer" >', ''], ['</br>', ''], ['<br>', '\n\u200B'], ['</a>', ''], [']]>', ''], ['&nbsp;', ''], 
	['&lt;', '<'], ['&gt;', '>'], ['&amp;', '&'], ['&quot;', '"'], ['&apos;', "'"], ['&cent;', '¢'], ['&pound;', '£'], 
	['&yen;', '¥'], ['&euro;', '€'], ['&copy;', '©'], ['&reg;', '®'], ['&#39;', '\'']];
	
	current_text = elm;
	for (i=0;i<text_replace.length;i++) {
		current_text = current_text.split(text_replace[i][0]).join(text_replace[i][1]);
	}
	return current_text;
}

// split data check for error
function e(html, elms) {
	try {
		current_elm = html;
		for (n=0;n<elms.length;n++) {
			current_elm = current_elm.split(elms[n][0])[elms[n][1]];
		}
		if (current_elm == undefined) {
			return "\u200B";
		} else {
			return current_elm;
		}			
	} catch {
		return "?";
	}
}

// remove repeating character
function remove_dup_chars(txt, sep, sep2) {
	new_txt = txt;
	txt_length = txt.split(sep2).length;
	for (i=0;i<txt_length;i++) {
		new_txt = new_txt.split(sep).join(sep2);
	}
	return new_txt;
}

// seconds to days, days, hours, mins
function sec_to_days_mins_hours(seconds) {
	seconds = seconds*1000;
	days = parseInt(seconds / 86400000);
	hours = parseInt((seconds % 86400000) / 3600000);
	mins = parseInt((seconds % 3600000) / 60000);
	secs = parseInt((seconds % 60000) / 1000);
	return [days, hours, mins, secs];
}

// get server name
function get_server_name(msg, type="guild") {
	banned_chrs = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\t', '\n', '\x0b', '\x0c', '\r', '\x0e', 
	'\x0f', '\x10', '\x11', '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1a', '\x1b', '\x1c', '\x1d', '\x1e', 
	'\x1f', '"', '*', '<', '>', '?', '|', '\\', '/'];
	
	// put Jared Network at top of logs
	if (type == "guild" && msg.guild.id == jared_network_guild_id) {
		return "!" + msg.guild.name.replace(" ","_")+"_"+msg.guild.id;
	}
	
	for (i=0;i<banned_chrs.length;i++) {
		if (type == "channel") {
			if (msg.channel.name.indexOf(banned_chrs[i]) > -1) {
				return msg.channel.id;
			}
		} else {
			if (msg.guild.name.indexOf(banned_chrs[i]) > -1) {
				return msg.guild.id;
			}
		}
	}
	
	if (type == "channel") {
		return msg.channel.name.replace(" ","_")+"_"+msg.channel.id;
	} else {
		return msg.guild.name.replace(" ","_")+"_"+msg.guild.id;
	}
}

// Dataset sizes
function get_dataset_sizes() {
	try {
		count_dir(local_memes_dataset, "memes");
		count_dir(local_catmemes_dataset, "catmemes");
		count_dir(local_cats_dataset, "cats");
		count_dir(local_dogs_dataset, "dogs");
		count_dir(local_heli_dataset, "helicopters");
		count_dir(local_dogmeme_dataset, "dogmemes");
		count_dir(local_car_dataset, "cars");
		count_dir(local_snake_dataset, "snakes");
		count_dir(local_igmemes_dataset, "igmemes");
		count_dir(local_src_hug, "hug");
		count_dir(local_birds_dataset, "birds");
		count_dir(local_racoon_dataset, "racoon");
		count_dir(local_src_kiss, "kiss");
		count_dir(local_photography_dataset, "photography");
		count_dir(local_anime_dataset, "anime");
		count_dir(local_video_dataset, "video");
		count_dir(local_meow_dataset, "meow");
		count_dir(local_floppa_dataset, "floppa");
		count_dir(local_mars_dataset, "mars");
	} catch (err) {
		console_log("Error thrown in get_dataset_sizes function! " + err, error=true);
	}
}

// embed functions
async function embed_chat_reply(msg, txt, footer=["JaredBot", webserver_root_address+"img/lion.png"]) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed chat reply, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				embed_chat = new Discord.MessageEmbed();
				embed_chat.setColor(embed_color_chat);
				embed_chat.setDescription(txt.slice(0, 2048));
				embed_chat.setFooter(footer[0], footer[1]);
				embed_chat.setTimestamp();
				return await msg_channel_send(msg, embed_chat);
			} catch {
				embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Chat Reply, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_chat_reply function! " + err, error=true);
	}
}

async function embed_info_reply(msg, txt, footer=["JaredBot", webserver_root_address+"img/lion.png"]) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed info reply, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				embed_chat = new Discord.MessageEmbed();
				embed_chat.setColor(embed_colour_info);
				embed_chat.setDescription(txt.slice(0, 2048));
				embed_chat.setFooter(footer[0], footer[1]);
				embed_chat.setTimestamp();
				return await msg_channel_send(msg, embed_chat);
			} catch {
				embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Info Reply, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_info_reply function! " + err, error=true);
	}
}

async function embed_chat_reply_header(msg, txt, header_text, pfp=true) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed chat reply header, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				embed_chat = new Discord.MessageEmbed();
				embed_chat.setColor(embed_color_chat);
				embed_chat.setDescription(txt.slice(0, 2048));
				if (pfp == true) {
					author = [header_text, webserver_root_address+"img/lion.png", ""]
				} else {
					author = [header_text, "", ""];
				}
				embed_chat.setAuthor(author[0], author[1], author[2]);
				embed_chat.setTimestamp();
				return await msg_channel_send(msg, embed_chat);
			} catch {
				return await embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Chat Reply Header, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_chat_reply_header function! " + err, error=true);
	}
}

async function embed_error(msg, err_txt, error_header="Error!") {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed error, guild is undefined or null!", error=true);
			return false;
		}
	
		try {
			if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
				embed_err = new Discord.MessageEmbed();
				embed_err.setColor(embed_colour_error);
				embed_err.addField(error_header, err_txt);
				if (msg != undefined && msg != null) {
					return await msg_channel_send(msg, embed_err);
				} else {
					console_log("Fatal Could not send error to user! msg is undefined!");
				}
			} else {
				console_log("Embed Error, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
			}
		} catch {
			console_log("Failed to send error message to guild!", error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_error function! " + err, error=true);
	}
}

async function embed_image(msg, img_url, footer_text, guild="msg", header="") {
	try {
		// check for undefined guild
		if (msg == undefined) {
			return false;
		} if (msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed image, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			embed_img = new Discord.MessageEmbed();
			embed_img.setColor(embed_colour_img);
			embed_img.setImage(img_url);
			embed_img.setTimestamp();
			embed_img.setFooter(footer_text, "");
			if (header != "") {
				embed_img.setTitle(header);
			}
			try {
				if (guild == "channel") {
					msg.send(embed_img);
				} else {
					return await msg_channel_send(msg, embed_img);
				}
			} catch {
				if (msg == undefined) {
					console_log("Failed to send image to server!", error=true);
				} else if (msg.guild == undefined) {
					console_log("Failed to send image to server!", error=true);
				} else {
					console_log("Failed to send image to server " + msg.guild.id + "!", error=true);
				}
			}
		} else {
			console_log("Embed Image, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_image function! " + err, error=true);
	}
}

async function embed_image_header(msg, img_url, header, footer_text) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed image with header, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			embed_img = new Discord.MessageEmbed();
			embed_img.setColor(embed_colour_img);
			embed_img.setImage(img_url);
			embed_img.setTimestamp();
			embed_img.setFooter(footer_text + "\n\u200B", "");
			embed_img.setTitle(header);
			return await msg_channel_send(msg, embed_img);
		} else {
			console_log("Embed Image Header, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_image_header function! " + err, error=true);
	}
}

async function embed_image_attachment(msg, file_path, foot_txt, callback) {
	// check for undefined guild
	if (msg == undefined || msg.guild == undefined || msg.guild == null) {
		console_log("Failed to embed image with header, guild is undefined or null!", error=true);
		return callback(false);
	}
	
	if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
		file_name = file_path.split("/")[file_path.split("/").length-1];
		extension = file_name.split(".")[file_name.split(".").length-1];
		
		if (["jpg", "jpeg", "png", "gif"].indexOf(extension) > -1) {
			msg.channel.send({
				embed: {
					color: embed_colour_img,
					footer: foot_txt+" • Today at "+("00" + new Date().getHours()).slice(-2)+":"+("00" + new Date().getMinutes()).slice(-2),
					image: {
						url: "attachment://" + file_name,
					}
				},
				files: [{
					attachment: file_path,
					name: file_name,
				}]
			}).catch(err => {
				console_log("Failed to send image to server! " + err, error=true);
				return callback(false);
			})
		} else {
			msg.channel.send("\n\u200B", {files: [file_path]}).catch(err => {
				console_log("Failed to send message to user " + msg.guild.name + "!" + err, error=true);
				return callback(false);
			})
		}
	}
	return callback(true);
}

async function embed_modderation(msg, txt, header_txt, color="red") {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed modderation, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				// find @ tag
				txt_array = txt.replace("<@!","").replace("<@","").split(">");
				current_user_ID = txt_array[0].split(" ").join("");
	
				embed_mod = new Discord.MessageEmbed();
				if (color == "green") {
					embed_mod.setColor(embed_colour_green);
				} else {
					embed_mod.setColor(embed_colour_error);
				}
				embed_mod.setTitle(header_txt);
				embed_mod.addField(txt_array[1]+"\n\u200B", "<@"+current_user_ID+">");
				embed_mod.setTimestamp();
				return await msg_channel_send(msg, embed_mod);
			} catch {
				embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Modderation, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_modderation function! " + err, error=true);
	}
}

async function embed_input_output_reply(msg, input_data, output_data, title, description="", url="", lan="") {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed input reply, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				embed_IO = new Discord.MessageEmbed();
				embed_IO.setTitle(title);
				embed_IO.setURL(url); // set this to URL of the message
				embed_IO.setColor(embed_colour_info);
				if (description != "") {
					embed_IO.setDescription(description.slice(0, 2048));
				}
				embed_IO.addFields(
					{name: "Input", value: "```\n"+lan+input_data+"```"},
					{name: "Output", value: "```\n"+lan+" "+output_data+" ```"}
				)
				embed_IO.setTimestamp();
				embed_IO.setFooter("JaredBot", webserver_root_address+"img/lion.png");
				return await msg_channel_send(msg, embed_IO);
			} catch {
				embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Input Output Reply, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_input_output_reply function! " + err, error=true);
	}
}

async function embed_help_reply(msg, field) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to embed help reply, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			try {
				embed_help_commands = new Discord.MessageEmbed();
				embed_help_commands.setColor(embed_color_chat);
				embed_help_commands.setTitle("Command Help");
				embed_help_commands.addFields(field);
				embed_help_commands.setTimestamp();
				return await msg_channel_send(msg, embed_help_commands);
			} catch {
				embed_error(msg, "Something went wrong!");
			}
		} else {
			console_log("Embed Chat Reply, JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in embed_help_reply function! " + err, error=true);
	}
}

async function msg_channel_send(msg, msg_embed, file=false) {
	try {
		// check for undefined guild
		if (msg == undefined || msg.guild == undefined || msg.guild == null) {
			console_log("Failed to msg channel send, guild is undefined or null!", error=true);
			return false;
		}
	
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			if (file == false) {
				await msg.channel.send(msg_embed).then(object => {
					return object;
				}).catch(err => {
					console_log("Error thrown in msg_channel_send function! " + err, error=true);
					return false;
				})
			} else {
				await msg.channel.send(msg_embed, file).then(object => {
					return object;
				}).catch(err => {
					console_log("Error thrown in msg_channel_send function! " + err, error=true);
					return false;
				})
			}
		} else {
			console_log("Error JaredBot does not have permission to send messages on " + msg.guild.name, error=true);
		}
	} catch (err) {
		console_log("Error thrown in msg_channel_send function! " + err, error=true);
	}
}

// get authorised server IDs
fs_read.readFile(authorised_servers, "utf8", function(err, data) {
	if (err) {
		console_log("Failed to read authorised server IDs", error=true);
		process.exit(1); // shut the bot down if it cant read IDs file
			
	} else {
		// append each ID to authorised IDs array
		raw_data = data.split("\n").join("").split(";");
		for (i=0;i<raw_data.length;i++) {
			if (isNaN(parseInt(raw_data[i])) == false) {
				authrosied_server_IDs.push(raw_data[i]);
			}
		} 
		console_log("Successfully read authorised server IDs!");
	}
})

// --- Main ---
//login
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

fs_read.readFile(token_file_name, "utf-8", function(err, data) {
	if (err) {
		return console_log("Failed to read token! " + err, error=true);
	}
	
	const token = data;
	bot.login(token);
})

bot.on("ready", () => {
	console_log("This bot is online!");
	bot.user.setActivity("-help | JaredBot");
});

bot.on("ready", () => {
	get_dataset_sizes();
})

// log if JaredBot recieved a DM
bot.on("message", msg => {
	if (msg.guild == null) {
		console_log("JaredBot sent or recieved a DM!");
	}
})

// commands
bot.on("message", msg=> {
	if (msg.guild != null && msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if(msg.content.toLowerCase() === prefix[msg.guild.id]+"testbot" || msg.content.toLowerCase() === prefix[msg.guild.id]+"test") {
			testbot_embed = new Discord.MessageEmbed();
			testbot_embed.setColor(embed_colour_info);
			testbot_embed.setDescription("Jared Bot is online!");
			testbot_embed.setTimestamp();
			msg_channel_send(msg, testbot_embed);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"help" || 
		msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"commands" || 
		msg.guild != null && msg.content.toLowerCase() == "-help") {
		help_embed = new Discord.MessageEmbed();
		help_embed.setColor(embed_color_chat);
		help_embed.setThumbnail(lion_profile_pic);
		help_embed.setAuthor("JaredBot | Command list", lion_profile_pic);
		help_embed.addFields(
			{name: "Tools", value: "`"+prefix[msg.guild.id]+"help tools`\n\u200B", inline: true},
			{name: "Info", value: "`"+prefix[msg.guild.id]+"help info`\n\u200B", inline: true},
			{name: "Chat", value: "`"+prefix[msg.guild.id]+"help chat`\n\u200B", inline: true},
			{name: "Image", value: "`"+prefix[msg.guild.id]+"help img`\n\u200B", inline: true},
			{name: "Games", value: "`"+prefix[msg.guild.id]+"help games`\n\u200B", inline: true},
			{name: "Maths", value: "`"+prefix[msg.guild.id]+"help maths`\n\u200B", inline: true},
			{name: "Admin/Mod", value: "`"+prefix[msg.guild.id]+"help mod`\n\u200B", inline: true},
			{name: "Music", value: "`"+prefix[msg.guild.id]+"help music`\n\u200B", inline: true},
			{name: "Levels", value: "`"+prefix[msg.guild.id]+"help levels`\n\u200B", inline: true}
		)
		msg_channel_send(msg, help_embed);
	}
})

// new line "\n\u200B"

bot.on("message", msg => {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() === prefix[msg.guild.id]+"help " ||
			msg.content == prefix[msg.guild.id]+"tools" || msg.content == prefix[msg.guild.id]+"info" || 
			msg.content == prefix[msg.guild.id]+"chat" || msg.content == prefix[msg.guild.id]+"chat commands" || msg.content == prefix[msg.guild.id]+"img" || msg.content == prefix[msg.guild.id]+"image" ||
			msg.content == prefix[msg.guild.id]+"image commands" || msg.content == prefix[msg.guild.id]+"games" || msg.content == prefix[msg.guild.id]+"game"|| msg.content == prefix[msg.guild.id]+"math" || 
			msg.content == prefix[msg.guild.id]+"maths"|| msg.content == prefix[msg.guild.id]+"admin" || msg.content == prefix[msg.guild.id]+"mod" || msg.content == prefix[msg.guild.id]+"admin/mod" || 
			msg.content == prefix[msg.guild.id]+"admin/mod commands" || msg.content == prefix[msg.guild.id]+"music") {
				module_name = msg.content.slice(6, msg.content.length).toLowerCase();
				help_module_embed = new Discord.MessageEmbed();
				help_module_embed.setColor(embed_color_chat);
				help_module_embed.setAuthor("JaredBot | Command list", lion_profile_pic);
				help_module_embed.setThumbnail(lion_profile_pic);
				help_module_embed.setTimestamp();
			} else {
				module_name = "";
			}
			// Tools
			if (module_name == "tools" || msg.content == prefix[msg.guild.id]+"tools") {
				help_module_embed.setTitle("Help Tools");
				help_module_embed.addFields (
					{name: "Timer", value: "`"+prefix[msg.guild.id]+"help timer`\n\u200B", inline: true},
					{name: "Stopwatch", value: "`"+prefix[msg.guild.id]+"help stopwatch`\n\u200B", inline: true},
					{name: "Reminder", value: "`"+prefix[msg.guild.id]+"help remind me`\n\u200B", inline: true},
					{name: "Py Execute", value: "`"+prefix[msg.guild.id]+"help execute`\n\u200B", inline: true},
					{name: "Translator", value: "`"+prefix[msg.guild.id]+"help translate`\n\u200B", inline: true},
					{name: "Roman", value: "`"+prefix[msg.guild.id]+"help roman`\n\u200B", inline: true},
					{name: "Suggest", value: "`"+prefix[msg.guild.id]+"help suggest`\n\u200B", inline: true},
					{name: "Time", value: "`"+prefix[msg.guild.id]+"help time`\n\u200B", inline: true},
					{name: "Weather", value: "`"+prefix[msg.guild.id]+"help weather`\n\u200B", inline: true},
					{name: "Embed", value: "`"+prefix[msg.guild.id]+"help embed`\n\u200B", inline: true},
					{name: "Avatar", value: "`"+prefix[msg.guild.id]+"help avatar`\n\u200B", inline: true},
					{name: "Fancy", value: "`"+prefix[msg.guild.id]+"help fancy`\n\u200B", inline: true},
					{name: "Py Challenge", value: "`"+prefix[msg.guild.id]+"help pychallenge`", inline: true},
					{name: "Invite", value: "`"+prefix[msg.guild.id]+"help invite`\n\u200B", inline: true},
					{name: "Networking", value: "`"+prefix[msg.guild.id]+"help network`\n\u200B", inline: true},
					{name: "Video Converter", value: "`"+prefix[msg.guild.id]+"help mp4`\n\u200B", inline: true},
					{name: "YouTube Download", value: "`"+prefix[msg.guild.id]+"help download`\n\u200B", inline: true},
					{name: "IG Download", value: "`"+prefix[msg.guild.id]+"help ig`", inline: true},
					{name: "Caption", value: "`"+prefix[msg.guild.id]+"help cap`", inline: true},
					{name: "Link Shortner", value: "`"+prefix[msg.guild.id]+"help short`", inline: true},
					{name: "Upscale", value: "`"+prefix[msg.guild.id]+"help upscale`", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			// Info
			} else if (module_name == "info" || msg.content == prefix[msg.guild.id]+"info") {
				help_module_embed.setTitle("Help Info");
				help_module_embed.addFields (
					{name: "Invite Link", value: "`"+prefix[msg.guild.id]+"help invitelink`\n\u200B", inline: true},
					{name: "Author", value: "`"+prefix[msg.guild.id]+"help author`\n\u200B", inline: true},
					{name: "Member Count", value: "`"+prefix[msg.guild.id]+"help membercount`\n\u200B", inline: true},
					{name: "Server Count", value: "`"+prefix[msg.guild.id]+"help servercount`\n\u200B", inline: true},
					{name: "Server Info", value: "`"+prefix[msg.guild.id]+"help serverinfo`\n\u200B", inline: true},
					{name: "User Info", value: "`"+prefix[msg.guild.id]+"help userinfo`\n\u200B", inline: true},
					{name: "Role Info", value: "`"+prefix[msg.guild.id]+"help roleinfo`\n\u200B", inline: true},
					{name: "Bot Info", value: "`"+prefix[msg.guild.id]+"help botinfo`\n\u200B", inline: true},
					{name: "Test bot", value: "`"+prefix[msg.guild.id]+"help testbot`\n\u200B", inline: true},
					{name: "Uptime", value: "`"+prefix[msg.guild.id]+"help uptime`\n\u200B", inline: true},
					{name: "Steam", value: "`"+prefix[msg.guild.id]+"help steam`\n\u200B", inline: true},
					{name: "Prefix", value: "`"+prefix[msg.guild.id]+"help prefix`\n\u200B", inline: true},
					{name: "Rules", value: "`"+prefix[msg.guild.id]+"help rules`\n\u200B", inline: true},
					{name: "Rule", value: "`"+prefix[msg.guild.id]+"help rule`\n\u200B", inline: true},
					{name: "Tos", value: "`"+prefix[msg.guild.id]+"help tos`\n\u200B", inline: true},
					{name: "Table", value: "`"+prefix[msg.guild.id]+"help table`\n\u200B", inline: true},
					{name: "Pokemon", value: "`"+prefix[msg.guild.id]+"help pokemon`\n\u200B", inline: true},
					{name: "Perm", value: "`"+prefix[msg.guild.id]+"help perm`\n\u200B", inline: true},
					{name: "Medicine", value: "`"+prefix[msg.guild.id]+"help medicine`\n\u200B", inline: true},
					{name: "Covid", value: "`"+prefix[msg.guild.id]+"help covid`\n\u200B", inline: true},
					{name: "msgcount", value: "`"+prefix[msg.guild.id]+"help msgcount`\n\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			// Chat
			} else if (module_name == "chat" || module_name == "chat commands" || msg.content == prefix[msg.guild.id]+"chat" || msg.content == prefix[msg.guild.id]+"chat commands") {
				help_module_embed.setTitle("Help Chat Commands");
				help_module_embed.addFields (
					{name: "Default Dance", value: "`"+prefix[msg.guild.id]+"help default dance`\n\u200B", inline: true},
					{name: "Say", value: "`"+prefix[msg.guild.id]+"help say`\n\u200B", inline: true},
					{name: "Do You", value: "`"+prefix[msg.guild.id]+"help do you`\n\u200B", inline: true},
					{name: "How Gay", value: "`"+prefix[msg.guild.id]+"help howgay`\n\u200B", inline: true},
					{name: "Im Bored", value: "`"+prefix[msg.guild.id]+"help imbored`\n\u200B", inline: true},
					{name: "Random Name", value: "`"+prefix[msg.guild.id]+"help random name`\n\u200B", inline: true},
					{name: "Bot", value: "`"+prefix[msg.guild.id]+"help bot`\n\u200B", inline: true},
					{name: "Kill", value: "`"+prefix[msg.guild.id]+"help kill`\n\u200B", inline: true},
					{name: "Stop", value: "`"+prefix[msg.guild.id]+"help stop`\n\u200B", inline: true},
					{name: "Auto Response", value: "`"+prefix[msg.guild.id]+"help autoresponse`\n\u200B", inline: true},
					{name: "Reply Chance", value: "`"+prefix[msg.guild.id]+"help replychance`\n\u200B", inline: true},
					{name: "Choose", value: "`"+prefix[msg.guild.id]+"help choose`\n\u200B", inline: true},
					{name: "8ball", value: "`"+prefix[msg.guild.id]+"help 8ball`\n\u200B", inline: true},
					{name: "Font", value: "`"+prefix[msg.guild.id]+"help font`\n\u200B", inline: true},
					{name: "Letter Emoji", value: "`"+prefix[msg.guild.id]+"help letteremoji`\n\u200B", inline: true},
					{name: "Dictonary", value: "`"+prefix[msg.guild.id]+"help dict`\n\u200B", inline: true},
					{name: "OwOify", value: "`"+prefix[msg.guild.id]+"help owoify`\n\u200B", inline: true},
					{name: "Lan Convert", value: "`"+prefix[msg.guild.id]+"help lan`\n\u200B", inline: true}
				)
				msg_channel_send(msg, help_module_embed);
			// Image commands
			} else if (module_name == "img" || module_name == "image" || module_name == "image commands" || 
						msg.content == prefix[msg.guild.id]+"img" || msg.content == prefix[msg.guild.id]+"image" || msg.content == prefix[msg.guild.id]+"image commands") {
				help_module_embed.setTitle("Help Image Commands");
				help_module_embed.setDescription("To see help for automatic image posting type `"+prefix[msg.guild.id]+"help autopost`!\n\u200B");
				help_module_embed.addFields (
					{name: "Animals", value: "`"+prefix[msg.guild.id]+"help animal`", inline: true},
					{name: "Meme", value: "`"+prefix[msg.guild.id]+"help meme`", inline: true},
					{name: "Photo", value: "`"+prefix[msg.guild.id]+"help photos`", inline: true},
					{name: "Reaction", value: "`"+prefix[msg.guild.id]+"help reaction`", inline: true},
					{name: "Video", value: "`"+prefix[msg.guild.id]+"help video`", inline: true},
					{name: "Maps", value: "`"+prefix[msg.guild.id]+"help maps`", inline: true},
					{name: "Google", value: "`"+prefix[msg.guild.id]+"help google`", inline: true}
				)
				msg_channel_send(msg, help_module_embed);
			} else if (module_name == "animal" || msg.content == prefix[msg.guild.id]+"animal") {
				// animal
				help_module_embed.setTitle("Help Animal Image Commands");
				help_module_embed.setDescription("To see help for automatic image posting type `"+prefix[msg.guild.id]+"help autopost`!\n\u200B");
				help_module_embed.addFields (
					{name: prefix[msg.guild.id]+"random animal", value: "`"+prefix[msg.guild.id]+"help random animal`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"cat "+prefix[msg.guild.id]+"meow", value: "`"+prefix[msg.guild.id]+"help cat`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"dog "+prefix[msg.guild.id]+"woof", value: "`"+prefix[msg.guild.id]+"help dog`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"snake", value: "`"+prefix[msg.guild.id]+"help snake`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"bird", value: "`"+prefix[msg.guild.id]+"help bird`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"racoon", value: "`"+prefix[msg.guild.id]+"help racoon`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"aww", value: "`"+prefix[msg.guild.id]+"help aww`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"floppa", value: "`"+prefix[msg.guild.id]+"help floppa`\n\u200B", inline: true},
					{name: "\n\u200B", value: "\n\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			} else if (module_name == "meme") {
				// meme
				help_module_embed.setTitle("Help Meme Image Commands");
				help_module_embed.setDescription("To see help for automatic image posting type `"+prefix[msg.guild.id]+"help autopost`!\n\u200B");
				help_module_embed.addFields (
					{name: prefix[msg.guild.id]+"meme", value: "`"+prefix[msg.guild.id]+"help meme`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"catmeme", value: "`"+prefix[msg.guild.id]+"help catmeme`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"dogmeme", value: "`"+prefix[msg.guild.id]+"help dogmeme`\n\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			} else if (module_name == "photos" || msg.content == prefix[msg.guild.id]+"photos") {
				// photo
				help_module_embed.setTitle("Help Photo Image Commands");
				help_module_embed.setDescription("To see help for automatic image posting type `"+prefix[msg.guild.id]+"help autopost`!\n\u200B");
				help_module_embed.addFields (
					{name: prefix[msg.guild.id]+"heli "+prefix[msg.guild.id]+"chpper", value: "`"+prefix[msg.guild.id]+"help heli`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"car", value: "`"+prefix[msg.guild.id]+"help car`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"photo", value: "`"+prefix[msg.guild.id]+"help photo`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"flipcoin", value: "`"+prefix[msg.guild.id]+"help flipcoin`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"roll", value: "`"+prefix[msg.guild.id]+"help roll`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"element {elm num}", value: "`"+prefix[msg.guild.id]+"help element`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"mars", value: "`"+prefix[msg.guild.id]+"help mars`\n\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			} else if (module_name == "reaction" || msg.content == prefix[msg.guild.id]+"reaction") {
				// reaction
				help_module_embed.setTitle("Help Reaction Image Commands");
				help_module_embed.setDescription("To see help for automatic image posting type `"+prefix[msg.guild.id]+"help autopost`!\n\u200B");
				help_module_embed.addFields (
					{name: prefix[msg.guild.id]+"owo", value: "`"+prefix[msg.guild.id]+"help owo`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"hug @user", value: "`"+prefix[msg.guild.id]+"help hug`\n\u200B", inline: true},
					{name: prefix[msg.guild.id]+"kiss @user", value: "`"+prefix[msg.guild.id]+"help kiss`\n\u200B", inline: true},
				
				)
				msg_channel_send(msg, help_module_embed);
			} else if (module_name == "video") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"video", value: "posts a random video"});
			} else if (module_name == "maps") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"maps", value: "`"+prefix[msg.guild.id]+"map {city}` shows a map of specified city."});
			} else if (module_name == "google") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"google", value: "`"+prefix[msg.guild.id]+"google {query}` finds a photo of something."});
			// Games	
			} else if (module_name == "game" || module_name == "games" || msg.content == prefix[msg.guild.id]+"games" || msg.content == prefix[msg.guild.id]+"game") {
				help_module_embed.setTitle("Help Games");
				help_module_embed.addFields (
					{name: "Rock Paper Scissors", value: "`"+prefix[msg.guild.id]+"help rock`\n\u200B"},
					{name: "Higher Lower", value: "`"+prefix[msg.guild.id]+"help higherlower`\n\u200B"},
					{name: "Tick Tac Toe", value: "`"+prefix[msg.guild.id]+"help ttt`\n\u200B"},
					{name: "Just One", value: "`"+prefix[msg.guild.id]+"help justone`\n\u200B"},
					{name: "\u200B", value: "\u200B", inline: true},
					{name: "\u200B", value: "\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			// Math
			} else if (module_name == "math" || module_name == "maths" || msg.content == prefix[msg.guild.id]+"math" || msg.content == prefix[msg.guild.id]+"maths") {
				help_module_embed.setTitle("Help Maths");
				help_module_embed.addFields (
					{name: "Hex Bin Oct", value: "`"+prefix[msg.guild.id]+"help hex`\n`"+prefix[msg.guild.id]+"help bin`\n`"+prefix[msg.guild.id]+"help oct`\n\u200B", inline: true},
					{name: "Bin2Int Oct2Int Hex2Int", value: "`"+prefix[msg.guild.id]+"help bin2int`\n`"+prefix[msg.guild.id]+"help oct2int`\n`"+prefix[msg.guild.id]+"help hex2int`\n\u200B", inline: true},
					{name: "bin2text, "+prefix[msg.guild.id]+"oct2text, "+prefix[msg.guild.id]+"hex2text", value: "`"+prefix[msg.guild.id]+"help bin2text`\n`"+prefix[msg.guild.id]+"help oct2text`\n`"+prefix[msg.guild.id]+"help hex2text`\n\u200B", inline: true},
					{name: "Base", value: "`"+prefix[msg.guild.id]+"help base`\n\u200B", inline: true},
					{name: "Is Leap/Is Prime", value: "`"+prefix[msg.guild.id]+"help isleap`\n`"+prefix[msg.guild.id]+"isprime`\n\u200B", inline: true},
					{name: "BMI", value: "`"+prefix[msg.guild.id]+"help bmi`\n\u200B", inline: true},
					{name: "Celcius/Farenheit", value: "`"+prefix[msg.guild.id]+"help c`\n`"+prefix[msg.guild.id]+"help f`\n\u200B", inline: true},
					{name: "Say Number", value: "`"+prefix[msg.guild.id]+"help saynum`\n\u200B", inline: true},
					{name: "Hash", value: "`"+prefix[msg.guild.id]+"help hash`\n\u200B", inline: true},
					{name: "Shift", value: "`"+prefix[msg.guild.id]+"help shift`\n\u200B", inline: true},
					{name: "Calculator", value: "`"+prefix[msg.guild.id]+"help calc`\n\u200B", inline: true},
					{name: "calendar", value: "`"+prefix[msg.guild.id]+"help calendar`\n\u200B", inline: true},
					{name: "Fibonacci", value: "`"+prefix[msg.guild.id]+"help fib`\n\u200B", inline: true},
					{name: "Converter", value: "`"+prefix[msg.guild.id]+"help convert`\n\u200B", inline: true},
					{name: "\n\u200B", value: "\n\u200B", inline: true},
				)
				msg_channel_send(msg, help_module_embed);
			// Admin/mod
			} else if (module_name == "admin" || module_name == "mod" || module_name == "admin/mod" || module_name == "admin/mod commands" || 
						msg.content == prefix[msg.guild.id]+"admin" || msg.content == prefix[msg.guild.id]+"mod" || msg.content == prefix[msg.guild.id]+"admin/mod" ||
						msg.content == prefix[msg.guild.id]+"admin/mod commands") {
				help_module_embed.setTitle("Help Admin/Mod commands");
				help_module_embed.addFields (
					{name: "Announce", value: "`"+prefix[msg.guild.id]+"help announce`\n\u200B", inline: true},
					{name: "Mute", value: "`"+prefix[msg.guild.id]+"help mute`\n\u200B", inline: true},
					{name: "Unmute", value: "`"+prefix[msg.guild.id]+"help unmute`\n\u200B", inline: true},
					{name: "Tempmute", value: "`"+prefix[msg.guild.id]+"help tempmute`\n\u200B", inline: true},
					{name: "Invisible", value: "`"+prefix[msg.guild.id]+"help invisible`\n\u200B", inline: true},
					{name: "Visible", value: "`"+prefix[msg.guild.id]+"help visible`\n\u200B", inline: true},
					{name: "Kick", value: "`"+prefix[msg.guild.id]+"help kick`\n\u200B", inline: true},
					{name: "Ban", value: "`"+prefix[msg.guild.id]+"help ban`\n\u200B", inline: true},
					{name: "Unban", value: "`"+prefix[msg.guild.id]+"help unban`\n\u200B", inline: true},
					{name: "Tempban", value: "`"+prefix[msg.guild.id]+"hlelp tempban`\n\u200B", inline: true},
					{name: "Logging", value: "`"+prefix[msg.guild.id]+"help logging`\n\u200B", inline: true},
					{name: "Prefix", value: "`"+prefix[msg.guild.id]+"help prefix`\n\u200B", inline: true},
					{name: "Snipe", value: "`"+prefix[msg.guild.id]+"help snipe`\n\u200B", inline: true},
					{name: "Snipping", value: "`"+prefix[msg.guild.id]+"help snipping`\n\u200B", inline: true},
					{name: "Filter", value: "`"+prefix[msg.guild.id]+"help filter`\n\u200B", inline: true},
					{name: "Exit", value: "`"+prefix[msg.guild.id]+"help exit`\n\u200B", inline: true},
					{name: "Clear Log", value: "`"+prefix[msg.guild.id]+"help clearlog`\n\u200B", inline: true},
					{name: "Purge", value: "`"+prefix[msg.guild.id]+"help purge`\n\u200B", inline: true},
					{name: "Auto Mod", value: "`"+prefix[msg.guild.id]+"help automod`", inline: true},
					{name: "Auto Post", value: "`"+prefix[msg.guild.id]+"autopost`\n\u200B", inline: true},
					{name: "Filter", value: "`"+prefix[msg.guild.id]+"help filter`\n\u200B", inline: true},
					{name: "Slow Mode", value: "`"+prefix[msg.guild.id]+"help slowmode`\n\u200B", inline: true},
					{name: "Ban URL", value: "`"+prefix[msg.guild.id]+"help banurl`\n\u200B", inline: true},
					{name: "Give Role", value: "`"+prefix[msg.guild.id]+"help giverole`\n\u200B", inline: true}
				)
				msg_channel_send(msg, help_module_embed);
			// Music
			} else if (module_name == "music" || msg.content == prefix[msg.guild.id]+"music") {
				help_music(msg);
			// Levels
			} else if (module_name == "levels" || module_name == "level" || module_name == "leaderboard" || module_name == "scoreboard" || 
				module_name == "score" || module_name == "messages" || module_name == "messagecount") {
				help_module_embed.setTitle("Help Admin/Mod commands");
				help_module_embed.addFields (
					{name: "Levels", value: "`"+prefix[msg.guild.id]+"levels` shows the leaderboard for your server.\n\u200B"},
					{name: "Rank", value: "`"+prefix[msg.guild.id]+"rank @user` shows a users rank card.\n\u200B"},
					{name: "Add Score", value: "`"+prefix[msg.guild.id]+"help addscore`.\n\u200B"},
					{name: "Restore Backup", value: "`"+prefix[msg.guild.id]+"help restorebackup`.\n\u200B"}
				)
				msg_channel_send(msg, help_module_embed);
			// Individual commands help
			
			// Tools
			} else if (module_name == "remind me" || msg.content == prefix[msg.guild.id]+"remind me") {
				embed_help_reply(msg, {name: "remind me {reminder} {No. min/sec}", value: "sets a reminder, the bot will ping you in the specified number of seconds. For example `"+prefix[msg.guild.id]+"remind me to check steam in 10 mins`, will ping you in 10 mins telling you to check steam.\n\u200B"});
			} else if (module_name == "timer" || msg.content == prefix[msg.guild.id]+"timer") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"timer", value: "sets a timer, the bot will ping you after the specified number of seconds, for example `"+prefix[msg.guild.id]+"timer 00:10:30`, will ping you after 10 mins and 30 seconds.\n\u200B"});
			} else if (module_name == "stopwatch" || msg.content == prefix[msg.guild.id]+"stopwatch") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"stopwatch", value: " `"+prefix[msg.guild.id]+"stopwatch start` starts a stopwatch, to stop the stopwatch you can then type `"+prefix[msg.guild.id]+"stopwatch stop`, the bot will then tell you how much time has passed between you starting and stopping the stopwatch.\n\u200B"});
			} else if (module_name == "execute" || msg.content == prefix[msg.guild.id]+"execute") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"execute {code}", value: "executes some Python code, for example `"+prefix[msg.guild.id]+"execute print(list(filter(None, [i if i%2==0 else '' for i in range(100)])))` will print all even number up to 100.\n\u200B"});
			} else if (module_name == "translate" || msg.content == prefix[msg.guild.id]+"translate") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"translate {text}", value: "Translate text in other languages back into English, for example `"+prefix[msg.guild.id]+"translate cómo estás` will display `how are you`.\n\u200B"});
			} else if (module_name == "roman" || msg.content == prefix[msg.guild.id]+"roman") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"roman {num}", value: "Converts an integer into roman numerals, for example `"+prefix[msg.guild.id]+"roman 2020` will display `MMXX`.\n\u200B"});
			} else if (module_name == "suggest" || msg.content == prefix[msg.guild.id]+"suggest" || module_name == "suggestion" || 
				msg.content == prefix[msg.guild.id]+"suggestion" || module_name == "bug" || msg.content == prefix[msg.guild.id]+"bug") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"suggest "+prefix[msg.guild.id]+"bug", value: "use this command to make a suggestion on how to improve the server, or to report a bug, syntax for the command is `"+prefix[msg.guild.id]+"bug {text}` or `"+prefix[msg.guild.id]+"suggest {text}`, your suggestion will automtically appear on the Jared Network suggestions channel.\n\u200B"});
			} else if (module_name == "time" || module_name == "timezone" || msg.content == prefix[msg.guild.id]+"time" || msg.content == prefix[msg.guild.id]+"timezone") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"time {city}", value: "get the time in a current city.\n\u200B"});
			} else if (module_name == "weather") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"weather {city}", value: "get the weather for a given city.\n\u200B"});
			} else if (module_name == "embed") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"embed", value: "Embed generator, allows you to create custom embeds, type `"+prefix[msg.guild.id]+"embed` for more information.\n\u200B"});
			} else if (module_name == "pychallenge") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"pychallenge", value: "Gives you a random python challenge, useful if your stuck and dont know what to code.\n\u200B"});
			} else if (module_name == "short" || module_name == "shortner" || msg.content == prefix[msg.guild.id]+"short" ||
				msg.content == prefix[msg.guild.id]+"shortner" || module_name == "shorturl" || msg.content == prefix[msg.guild.id]+"shorturl") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"short", value: "takes a long URL and makes it shorter, for example: ```"+prefix[msg.guild.id]+"short https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/cat_relaxing_on_patio_other/1800x1200_cat_relaxing_on_patio_other.jpg``` produces ```https://jaredbot.uk/a/lqqGV``` it took a long URL that is 162 characters, and created a short URL that is only 27."})
			} else if (module_name == "upscale") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"upscale", value: "upscales an image, increases resolution, add the comment `-upscale {amount}` when uploading a photo, for example `-upscale 4` will multiple the images resolution by 4.\n\u200B"});
			
			// Info
			} else if (module_name == "invitelink") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"invitelink "+prefix[msg.guild.id]+"invite", value: "`"+prefix[msg.guild.id]+"invitelink` shows an invite link to the Jared Network discord server, `"+prefix[msg.guild.id]+"invite` creates an invite for your server.\n\u200B"});
			} else if (module_name == "author") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"author", value: "Shows who the bot was created by Jared Turck, and displays links to steam account so you can contact me.\n\u200B"});
			} else if (module_name == "membercount") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"membercount", value: "Shows the total number of members on the server.\n\u200B"});
			} else if (module_name == "servercount") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"servercount", value: "Shows the total number of servers Jared bot is authorised on.\n\u200B"});
			} else if (module_name == "serverinfo") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"serverinfo", value: "Shows statistic about the server.\n\u200B"});
			} else if (module_name == "botinfo") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"botinfo", value: "Shows statistics about the server, and JaredBot.\n\u200B"});
			} else if (module_name == "testbot") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"testbot", value: "Checks if the bot is online, if you dont get a response then the bot is offline.\n\u200B"});
			} else if (module_name == "uptime") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"uptime", value: "Shows the amount of time the bot has been online for, since the last restart.\n\u200B"});
			} else if (module_name == "steam" || msg.content == prefix[msg.guild.id]+"steaminfo" || module_name == "steamsale" || 
				module_name == "achiv" || msg.content == prefix[msg.guild.id]+"achiv" || module_name == "sl" || 
				msg.content == prefix[msg.guild.id]+"sl" || msg.content == prefix[msg.guild.id]+"steam" || module_name == prefix[msg.guild.id]+"inv" ||
				msg.content == prefix[msg.guild.id]+"inventory" || module_name == "steamdown") {	
				help_steam(msg);
			} else if (module_name == "prefix") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"prefix", value: "shows the current prefix used by the bot, the default prefix used by the bot is `"+prefix[msg.guild.id]+"`.\n\u200B"});
			} else if (module_name == "rule" || msg.content == prefix[msg.guild.id]+"rule") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"rule [1-8]", value: "display a specific rule, for example `"+prefix[msg.guild.id]+"rule 8` will display the 8th rule on the server.\n\u200B"});
			} else if (module_name == "tos") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"tos", value: "Shows the Discord Community Guidelines."});
			} else if (module_name == "element") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"element {elm num}", value: "displays statistics about a specific element on the periodic table, for example `"+prefix[msg.guild.id]+"element 79` will displays stats on gold.\n\u200B"});
			} else if (module_name == "table" || module_name == "periodictable") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"table", value: "displays a photo of the periodic table, you can use this command for example to get the number of an element, and then use the `"+prefix[msg.guild.id]+"element` command to get more info on that element.\n\u200B"});
			} else if (module_name == "pokemon") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"pokemon", value: "displays information on pokemon, you can specify a pokemon by index, for example "+prefix[msg.guild.id]+"pokemon 39 will show info for Jigglypuff , or by name e.g. `"+prefix[msg.guild.id]+"pokemon Pikachu` for info on Pikachu!\n\u200B"});
			} else if (module_name == "perm") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"perm @user", value: "displays users permissions for the server they are currently on.\n\u200B"});
			} else if (module_name == "userinfo") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"userinfo @user", value: "displays information about a specific discord user.\n\u200B"});
			} else if (module_name == "medicine") {	
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"medicine {name}", value: "displays information about a medicine, type `"+prefix[msg.guild.id]+"medicine` for more information..\n\u200B"});
			} else if (module_name == "msgcount") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"msgcount DD-MM-YYYY", value: "shows how many messages where sent in a particular channel on the specified day.\n\u200B"});
			
			// Chat
			} else if (module_name == "default dance") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"default dance", value: "does the default dance.\n\u200B"});
			} else if (module_name == "say" || msg.content == prefix[msg.guild.id]+"say") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"say {text}", value: "The bot will repeat whatever you say, for example `"+prefix[msg.guild.id]+"say Hello` will make the bot will say `Hello` back.\n\u200B"});
			} else if (module_name == "do you" || module_name == "is" || module_name == "will" || 
				msg.content == prefix[msg.guild.id]+"do you" || msg.content == prefix[msg.guild.id]+"is" || msg.content == prefix[msg.guild.id]+"will") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"do you/is/will {question}", value: "The bot will answer a yes or no question, for example `"+prefix[msg.guild.id]+"do you think there will be a WW3?`, `"+prefix[msg.guild.id]+"is the earth flat?`, `"+prefix[msg.guild.id]+"will i ever get a gf?` the bot will then answer yes or no.\n\u200B"});
			} else if (module_name == "howgay") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"howgay @user", value: "Gives a percentage of how gay you are `"+prefix[msg.guild.id]+"howgay` or how gay another user is for example `"+prefix[msg.guild.id]+"hoygay @Jared` will show hoy gay Jared is.\n\u200B"});
			} else if (module_name == "imbored") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"imbored", value: "Gives you something random to do, use this command to get sugestions of stuff to do when you bored and dont know what to do.\n\u200B"});
			} else if (module_name == "random name") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"random name", value: "Gives you a random first and last name, can be useful if you need a fake name for online form.\n\u200B"});
			} else if (module_name == "bot" || msg.content == prefix[msg.guild.id]+"bot") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"bot {message}", value: "Lets you talk to an Artificial Intelligence (AI) powered chat bot.\n\u200B"});
			} else if (module_name == "kill" || msg.content == prefix[msg.guild.id]+"kill") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"kill @user", value: "Kill the specified user, syntax for the command is kill then the users @ tag.\n\u200B"});
			} else if (module_name == "stop") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"stop", value: "This disables the bots auto response, auto response is a feature where the bot will sometimes randomly repeat messages, for example you type hello and the bot responds hi. Use this command if the auto response feature is annoying or the bot is spamming."});
			} else if (module_name == "autoresponse") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"autoresponse", value: "enabled autoresponse, the bot will begin randomly repeating messages again.\n\u200B"});
			} else if (module_name == "replychance") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"replychance {num}", value: "sets how often the bots auto response will reply to messages, the higher the value the less the bot will respond to messages, for example `"+prefix[msg.guild.id]+"replychance 2` the bot will respond 50% of the time, `"+prefix[msg.guild.id]+"replychance 4` the bot will respond 25% of the time.\n\u200B"});
			} else if (module_name == "choose" || module_name == "choice" || msg.content == prefix[msg.guild.id]+"choose" || msg.content == prefix[msg.guild.id]+"choice") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"choose or "+prefix[msg.guild.id]+"choice", value: "the bot will randomly choose an option from a list, each item in your list can be seperated with commas or a number and dot, for example `"+prefix[msg.guild.id]+"choose cat, dog, mouse, fish` or `"+prefix[msg.guild.id]+"choice 1. cat 2. dog 3. mouse 4. fish` the bot will random pick of of those 4 animals.\n\u200B"});
			} else if (module_name == "8ball" || msg.content == prefix[msg.guild.id]+"8ball") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"8ball {question}", value: "lets you ask the 8ball a question, and see what the response is.\n\u200B"});
			} else if (module_name == "font" || msg.content == prefix[msg.guild.id]+"font") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"font {font num} {text}", value: "converts text into a fancy unicode font, for example `"+prefix[msg.guild.id]+"font 1 Jared` will be converted to `𝓳𝓪𝓻𝓮𝓭`, the font number is the font you would like to use on the text. (im still working on this feature it's currently broken).\n\u200B"});
			} else if (module_name == "letteremoji" || msg.content == prefix[msg.guild.id]+"letteremoji") {
				help_letteremoji(msg);
			} else if (module_name == "dict" || msg.content == prefix[msg.guild.id]+"dict" || module_name == "urban" || 
				msg.content == prefix[msg.guild.id]+"urban") {
				help_dict(msg);
			} else if (module_name == "owoify" || msg.content == prefix[msg.guild.id]+"owoify") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"owoify", value: "owoifys text!"});
		
			// Image
			} else if (module_name == "random animal") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"random animal", value: "Shows a photo of a random animal.\n\u200B"});
			} else if (module_name == "meme") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"meme", value: "Shows a random meme.\n\u200B"});
			} else if (module_name == "catmeme") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"catmeme", value: "Shows a random cat meme."});
			} else if (module_name == "flipcoin") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"flipcoin", value: "Flips a coin, the coin could land on heads or tails.\n\u200B"});
			} else if (module_name == "roll") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"roll", value: "rolls a dice, the dice could land on any face from 1-6.\n\u200B"});
			} else if (module_name == "cat" || module_name == "meow") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"cat "+prefix[msg.guild.id]+"meow", value: "shows a random cat photo.\n\u200B"});
			} else if (module_name == "dog" || module_name == "woof") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"dog "+prefix[msg.guild.id]+"woof", value: "shows a random dog photo.\n\u200B"});
			} else if (module_name == "heli" || module_name == "chpper") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"heli "+prefix[msg.guild.id]+"chpper", value: "shows a photo of a helicopter.\n\u200B"});
			} else if (module_name == "dogmeme") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"dogmeme", value: "posts a random dog meme.\n\u200B"});
			} else if (module_name == "car") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"car", value: "posts a random photo of a car.\n\u200B"});
			} else if (module_name == "snake") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"snake", value: "posts a random photo of a snake.\n\u200B"});
			} else if (module_name == "bird") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"bird", value: "posts a random photo of a bird.\n\u200B"});
			} else if (module_name == "racoon") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"racoon", value: "posts a random photo of a racoon.\n\u200B"});
			} else if (module_name == "aww") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"aww", value: "posts a cute video.\n\u200B"});
			} else if (module_name == "floppa") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"floppa", value: "posts a photo or meme of floppa.\n\u200B"});
			} else if (module_name == "owo" || msg.content == prefix[msg.guild.id]+"owo") {
				help_owo(msg);
			} else if (module_name == "hug") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"hug @user", value: "lets you hug another user.\n\u200B"});
			} else if (module_name == "photo") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"photo", value: "posts a random photography photo.\n\u200B"});
			} else if (module_name == "mars") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"mars", value: "posts a photo of Mars.\n\u200B"});
		
			// Games
			} else if (module_name == "rock" || module_name == "paper" || module_name == "scissors" || module_name == "rps") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"rock, "+prefix[msg.guild.id]+"paper, "+prefix[msg.guild.id]+"scissors", value: "Play a game of rock paper scissors with the bot, you can type `"+prefix[msg.guild.id]+"rock` for rock, `"+prefix[msg.guild.id]+"paper` for paper, or `"+prefix[msg.guild.id]+"scissors` for scissors.\n\u200B"});
			} else if (module_name == "higherlower") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"higherlower", value: "Play a game where you have to try and guess a secret number between 1 and 100 in as few tries as possible, after every guess the bot will tell you if your guess was higher or lower then there secret number.\n\u200B"});
			} else if (module_name == "ttt") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"ttt", value: "Play a game of TicTacToe against the bot, take it in turns to place a mark on a 3x3 grid, first person to get 3 in a row wins (im still currently working on this game).\n\u200B"});
			
			// Maths
			} else if (module_name == "hex" || module_name == "bin" || module_name == "oct" || 
				msg.content == prefix[msg.guild.id]+"hex" || msg.content == prefix[msg.guild.id]+"bin" || msg.content == prefix[msg.guild.id]+"oct") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"hex, "+prefix[msg.guild.id]+"bin, "+prefix[msg.guild.id]+"oct", value: "these commands convert a decimal integer to the base 2, 8 and 16 number system, i.e. `"+prefix[msg.guild.id]+"hex` converts decimal to hexadecimal `"+prefix[msg.guild.id]+"hex 4003` becomes `fa3`, `"+prefix[msg.guild.id]+"oct` converts decimal to octal decimal `"+prefix[msg.guild.id]+"oct 59` becomes `73`, `"+prefix[msg.guild.id]+"bin` converts decimal to binary so `"+prefix[msg.guild.id]+"bin 456` becomes `111001000`.\n\u200B"});
			} else if (module_name == "base") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"base{base}", value: "This command converts a decimal integer to any specified number system, for example `"+prefix[msg.guild.id]+"base24 258` becomes `ai`, or `"+prefix[msg.guild.id]+"base14 69` becomes `4d`.\n\u200B"});
			} else if (module_name == "bin2int" || module_name == "oct2int" || module_name == "hex2int" || 
				msg.content == prefix[msg.guild.id]+"bin2int" || msg.content == prefix[msg.guild.id]+"oct2int" || msg.content == prefix[msg.guild.id]+"hex2int") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"bin2int, "+prefix[msg.guild.id]+"oct2int, "+prefix[msg.guild.id]+"hex2int", value: "Converts a base 2, 8, or 16 integers to base 10 denary, for example `"+prefix[msg.guild.id]+"bin2int 1010101101` becomes `685`, `"+prefix[msg.guild.id]+"oct2int 25360` becomes `10992`, and `"+prefix[msg.guild.id]+"hex2int ff2ac2` becomes `16722626`.\n\u200B"});
			} else if (module_name == "bin2text" || module_name == "oct2text" || module_name == "hex2text" || 
				msg.content == prefix[msg.guild.id]+"bin2text" || msg.content == prefix[msg.guild.id]+"oct2text" || msg.content == prefix[msg.guild.id]+"hex2text") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"bin2text, "+prefix[msg.guild.id]+"oct2text, "+prefix[msg.guild.id]+"hex2text", value: "Converts base 2, 8, or 16 list of integers (seperated by spaces) to base 10 denary, then converts the integers to unicode characters. For example `"+prefix[msg.guild.id]+"bin2text 1101000 1100101 1101100 1101100 1101111` becomes `hello`, `"+prefix[msg.guild.id]+"oct2text 150 145 171` becomes `hey`, and `"+prefix[msg.guild.id]+"hex2text 4a 61 72 65 64 20 69 73 20 61 77 65 73 6f 6d 65` becomes `Jared is awesome`.\n\u200B"});
			} else if (module_name == "isleap" || msg.content == prefix[msg.guild.id]+"isleap") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"isleap {year}", value: "Checks if the specified year is a leap year, for example `"+prefix[msg.guild.id]+"isleap 2020` returns `true`, or `"+prefix[msg.guild.id]+"isleap 1966` returns `false`.\n\u200B"});
			} else if (module_name == "isprime" || msg.content == prefix[msg.guild.id]+"isprime") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"isprime {num}", value: "Checks if the specified number is prime, for exmaple `"+prefix[msg.guild.id]+"isprime 31` returns true, and `"+prefix[msg.guild.id]+"isprime 32` returns false."});
			} else if (module_name == "bmi" || msg.content == prefix[msg.guild.id]+"bmi") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"bmi {height cm} {weight kg}", value: "calculates the bmi of the specified height and weight values, for example `"+prefix[msg.guild.id]+"bmi 180 50` displays underweight.\n\u200B"});
			} else if (module_name == "c" || module_name == "f" || msg.content == prefix[msg.guild.id]+"c" || msg.content == prefix[msg.guild.id]+"f") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"c and "+prefix[msg.guild.id]+"f", value: "converts between Celsius (-c) and Fahrenheit (-f), for example `"+prefix[msg.guild.id]+"c 24` becomes `75.2` Fahrenheit, or `"+prefix[msg.guild.id]+"f 110` becomes `43.3` Celsius.\n\u200B"});
			} else if (module_name == "saynum" || module_name == "int2text" || msg.content == prefix[msg.guild.id]+"saynum" || msg.content == prefix[msg.guild.id]+"int2text") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"saynum {num}", value: "converts a base 10 denary integer to written english, for example `"+prefix[msg.guild.id]+"saynum 1` becomes `one`, and `"+prefix[msg.guild.id]+"saynum -47623.9` becomes `minus fourty seven thousand, six hundred and twenty three point nine`.\n\u200B"});
			} else if (module_name == "shift" || module_name == "caesar" || module_name == "shift cipher" || 
				msg.content == prefix[msg.guild.id]+"shift" || msg.content == prefix[msg.guild.id]+"caesar" || msg.content == prefix[msg.guild.id]+"cipher") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"shift{num} {text}", value: "Uses the Caesar Shift Cipher, to shift the characters in a string the specified number of times, for example `"+prefix[msg.guild.id]+"shift2 aaa` becomes `ccc` (still working on this command).\n\u200B"});
			} else if (module_name == "calc" || module_name == "add" || module_name == "subtract" || module_name == "times" || module_name == "divide" ||
				msg.content == prefix[msg.guild.id]+"calc" || msg.content == prefix[msg.guild.id]+"add" || msg.content == prefix[msg.guild.id]+"subtract" || 
				msg.content == prefix[msg.guild.id]+"times" || msg.content == prefix[msg.guild.id]+"divide") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"calc {equation}", value: "allows you to preform a mathimatical calculation, for example `"+prefix[msg.guild.id]+"calc 2**10 + 4/7` returns `146.8`, type `"+prefix[msg.guild.id]+"calc` for more information on the command.\n\u200B"});
			} else if (msg.content == prefix[msg.guild.id]+"calendar" || module_name == "calendar") {
				help_calendar(msg);
			} else if (msg.content == prefix[msg.guild.id]+"fib" || module_name == "fib") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"fib {places}", value: "Displays the Fibonacci squence to the specified number of places.\n\u200B"});
			} else if (msg.content == prefix[msg.guild.id]+"convert" || module_name == "convert" || 
				msg.content == prefix[msg.guild.id]+"convert" || module_name == "convert") {
				help_converter(msg);
			
			// Admin/Mod
			} else if (module_name == "announce" || msg.content == prefix[msg.guild.id]+"announce") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"announce {text}", value: "Sends an announcement!\n\u200B"});
			} else if (module_name == "mute") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"mute @user", value: "Mutes a user preventing them from speaking and messaging in channels, beaware that muted users can still read the chat, they just cannot respond or talk back. the syntax for the command is `"+prefix[msg.guild.id]+"mute @user`, you can also specify a reason after the @ tag for the mute if you want too, for example `"+prefix[msg.guild.id]+"mute @jared for spamming!`.\n\u200B"});
			} else if (module_name == "unmute") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"unmute @user", value: "unmutes the user allowing them to talk again in both text and voice channels on the server, beaware that users that have been unmuted will be able to edit previos messages and fully interact within the channels channels again, the syntax for the command is `"+prefix[msg.guild.id]+"unmute @user`.\n\u200B"});
			} else if (module_name == "tempmute") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"tempmute @user {length mins}", value: "allows you to temporerly mute a user for a specified amount of time, the bot will then unmute that user after the specified length of time is complete, the syntax for the command is `"+prefix[msg.guild.id]+"tempmute @user {length in mins}`, for example `"+prefix[msg.guild.id]+"tempmute @jared 5` will mute jared for 5 mins. Make sure that your length is an integer, if you want to mute a user for an hour you would type 60, and 24 hours 1 day would be 1440 mins e.g. `"+prefix[msg.guild.id]+"tempmute @user 1440`.\n\u200B"});
			} else if (module_name == "invisible") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"invisible @user", value: "makes the user invisible, invisible users cannot see any channels on the server, the syntax for the command is `"+prefix[msg.guild.id]+"invsible @user` for example `"+prefix[msg.guild.id]+"invisible @jared` will make jared invisible.\n\u200B"});
			} else if (module_name == "visible") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"visible @user", value: "makes the user visable so that they can see all the channels on the server after being made invisible, the syntax for the command is `"+prefix[msg.guild.id]+"vsible @user` for example `"+prefix[msg.guild.id]+"visible @jared` will make jared visible.\n\u200B"});
			} else if (module_name == "kick") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"kick @user", value: "kicks a user from the server, beaware that once a user has been kicked from the server they can still join back if they have an invite link. Once a user is kicked all of there roles are lost, so if they do join back they wont have any of the previous roles they had. The syntax for the command is `"+prefix[msg.guild.id]+"kick @user`, for example `"+prefix[msg.guild.id]+"kick @jared` will kick Jared from the server, you can also sepcify a reason for the kick e.g. `"+prefix[msg.guild.id]+"kick @jared for spamming`.\n\u200B"});
			} else if (module_name == "ban") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"ban @user", value: "Bans a user from the server, once a user is banned they cannot join the server again even if they have an invite link, bans are also IP based which in most cases prevents from from joining the server again on an alt account. The syntax for the command is `"+prefix[msg.guild.id]+"ban @user`, for example `"+prefix[msg.guild.id]+"ban @jared` ban Jared from the server, you can also specify a reason for the ban e.g. `"+prefix[msg.guild.id]+"ban @jared for organsing a raid`.\n\u200B"});
			} else if (module_name == "unban") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"unban {User ID}", value: "Allows you to unban a user from the server, you can't @ someone who isn't in the server, so you will need to specify the users ID when unbanning them. You can get the banned users ID by right clicking on a previous message they have sent and clicking copy ID, for example to unban Jared from a server the command would be `"+prefix[msg.guild.id]+"unban 738484352568262747`.\n\u200B"});
			} else if (module_name == "tempban") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"tempban @user {length mins}", value: "Temporerly bans a user from the server for a specified length of time, then unbans them. Syntax is `"+prefix[msg.guild.id]+"tempban @user {length in mins}` for example `"+prefix[msg.guild.id]+"tempban @jared 60` would ban jared for 1 hour, for 24 hours 1 day you would type 1440 mins.\n\u200B"});
			} else if (module_name == "logging" || msg.content == prefix[msg.guild.id]+"logging") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"logging [on/off]", value: "Toggle between turning logging on or off, logging is where messages are recorded in the server and saved to a log file, turning logging on will result in all messages being saved to a log file, this is very useful for looking at conversation history.\n\u200B"});
			} else if (module_name == "prefix") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"prefix {prefix}", value: "Allows you to change the prefix of the bot, the syntax for this command is `"+prefix[msg.guild.id]+"prefix {new prefix}` for example to change JaredBot's prefix to `.` you would type `"+prefix[msg.guild.id]+"prefix .`.\n\u200B"});
			} else if (module_name == "snipe") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"snipe", value: "This command shows all messages that have been recently deleted, please beaware the command could show some inappropriate or offensive content, as it also shows messages that where deleted by JaredBot's contenting filtering, as tell as message which where manually deleted by a user. also be beaware the log file is clear every 24 hours, so you wont be able to see deleted messages from a few days ago.\n\u200B"});
			} else if (module_name == "snipping" || msg.content == prefix[msg.guild.id]+"snipping") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"snipping [on/off]", value: "turn snipping on or off, snipping is a feature that logs recently deleted messages, turnning snipping on `"+prefix[msg.guild.id]+"snipping on` will result in all messages that where recently deleted being logged. You can then view the contents on this log file with the `"+prefix[msg.guild.id]+"snipe` command.\n\u200B"});
			} else if (module_name == "filter") {
				filter_help(msg);
			} else if (module_name == "exit") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"exit", value: "shuts the entire bot down, taking JaredBot offline. Only Jared can use this command, it's designed to be used during development incase something goes wrong Jared can shut the bot down for whatever reason.\n\u200B"});
			} else if (module_name == "clearlog") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"clearlog", value: "clears the deleted messages log file, any messages that are stored in the log file will be removed.\n\u200B"});
			} else if (module_name == "purge" || module_name == "clear") {
				help_clear(msg);
			} else if (module_name == "automod") {
				automod_help(msg);
			} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"autophoto" || msg.content == prefix[msg.guild.id]+"autopost" ||
					msg.content == prefix[msg.guild.id]+"autobird" || msg.content == prefix[msg.guild.id]+"autocar" || msg.content == prefix[msg.guild.id]+"autocat" ||
					msg.content == prefix[msg.guild.id]+"autodog" || msg.content == prefix[msg.guild.id]+"autosnake" || msg.content == prefix[msg.guild.id]+"automeme" || 
					msg.content == prefix[msg.guild.id]+"autopost" || msg.content == prefix[msg.guild.id]+"autoporngif" || 
					msg.content == prefix[msg.guild.id]+"autoanime" || msg.content == prefix[msg.guild.id]+"autovideo") {
				autopost_help(msg);
			} else if (module_name == "slowmode" || msg.content == prefix[msg.guild.id]+"slowmode") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"slowmode", value: "Enables slow mode on the channel you type it in, the syntax for the command is `"+prefix[msg.guild.id]+"slowmode {MM:SS}` for example `"+prefix[msg.guild.id]+"slowmode 5:45` would set slowmode to 5 mins and 45 seconds.\n\u200B"});
			} else if (module_name == "banurl" || msg.content == prefix[msg.guild.id]+"banurl") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"banurl", value: "Lets you ban a URL, preventing users from posting it. For example `"+prefix[msg.guild.id]+"banurl http://reddit.com/r/boobs` would ban the boobs subreddit."});
			} else if (module_name == "giverole") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"giverole", value: "`"+prefix[msg.guild.id]+"-giverole @user @role` Gives one or more roles to a user, for exmaple `"+prefix[msg.guild.id]+"giverole @jared @member @green` would give user Jared the roles member and Green."});
			
			// hash
			} else if (module_name == "hash") {
				hash_help(msg);
			} else if (module_name == "md4" || msg.content == prefix[msg.guild.id]+"md4") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"md4", value: "Generates an MD4 hash, for example `"+prefix[msg.guild.id]+"md4 Hello` produces `a58fc871f5f68e4146474ac1e2f07419`.\n\u200B"});
			} else if (module_name == "md5" || msg.content == prefix[msg.guild.id]+"md5") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"md5", value: "Generates an MD5 hash, for example `"+prefix[msg.guild.id]+"md5 Hello` produces `8b1a9953c4611296a827abf8c47804d7`.\n\u200B"});
			} else if (module_name == "sha1" || msg.content == prefix[msg.guild.id]+"sha1") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"sha1", value: "Generates an SHA1 hash, for example `"+prefix[msg.guild.id]+"sha1 Hello` produces `2cb42271c614a1f32dee3a8cc7d7e4d62dc04be7`.\n\u200B"});
			} else if (module_name == "sha224" || msg.content == prefix[msg.guild.id]+"sha224") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"sha224", value: "Generates an SHA224 hash, for example `"+prefix[msg.guild.id]+"sha224 Hello` produces `3315a79f00f1179473f3b86aed44f7db56009d14b971d6361e705de2`.\n\u200B"});
			} else if (module_name == "sha256" || msg.content == prefix[msg.guild.id]+"sha256") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"sha256", value: "Generates an SHA256 hash, for example `"+prefix[msg.guild.id]+"sha256 Hello` produces `62fa62853835a432efe7c8e82723b5e66be7319780033746dcdce168f0ec8554`.\n\u200B"});
			} else if (module_name == "sha384" || msg.content == prefix[msg.guild.id]+"sha384") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"sha384", value: "Generates an SHA384 hash, for example `"+prefix[msg.guild.id]+"sha384 Hello` produces `6be6ea8b48cebdbf0cd1629b2203b5ba58f754948f2dadb6f006f4b49f89e8eefe1b6dfcd4cb2bbb458783d9e1f13a48`.\n\u200B"});
			} else if (module_name == "sha512" || msg.content == prefix[msg.guild.id]+"sha512") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"sha512", value: "Generates an SHA512 hash, for example `"+prefix[msg.guild.id]+"sha512 Hello` produces `f6317fb1129b48c616400af50db8b5b458e68eb08555a6289bbb858e91166ce8d51850ee9b4c77da8579f977fd22c2d627bbe471af628309bc1c023a9c4e3718`.\n\u200B"});
			} else if (module_name == "rhash" || msg.content == prefix[msg.guild.id]+"rhash") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"rhash", value: "Decrypt a hash using rainbow tables, for example `-rhash 420d97235124da5bf24c51a35edb1119f653ce09` returns the decrypt text `jared`.\n\u200B"});
			
			// rules
			} else if (module_name == "rules") {
				embed_rules_help = new Discord.MessageEmbed();
				embed_rules_help.setColor(embed_colour_info);
				embed_rules_help.setTitle("Help Rules");
				embed_rules_help.addFields(
					{name: prefix[msg.guild.id]+"rules", value: "shows a list of the rules for the Jared Network discord server.\n\u200B"},
					{name: prefix[msg.guild.id]+"rule [1-8]", value: "display a specific rule, for example `"+prefix[msg.guild.id]+"rule 8` will display the 8th rule on the server.\n\u200B"},
					{name: prefix[msg.guild.id]+"tos", value: "Shows the Discord Community Guidelines.\n\u200B"}
				)
				embed_rules_help.setTimestamp();
				msg_channel_send(msg, embed_rules_help);
			
			// automod
			} else if (module_name == "automod rules") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"automod rules", value: "Shows a list of the active rules applied to your server.\n\u200B"});
			} else if (module_name == "warnlist" || module_name == "automod warnlist") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"automod warnlist", value: "Shows a list of users with the most warnnings on the server.\n\u200B"});
			} else if (module_name == "automod remove" || module_name == "remove") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"automod remove", value: "lets you remove an automod rule, The syntax for the command is `"+prefix[msg.guild.id]+"automod remove {rule number}`, for example `"+prefix[msg.guild.id]+"automod remove 1` will remove the first active rule, i strongly suggest running `"+prefix[msg.guild.id]+"automod rules` first to get a list of all of the rules currently on your sever, then use the automod remove command after.\n\u200B"});
			
			// autopost
			} else if (module_name == "automeme") {
				embed_help_reply(msg, {name: "AutoMeme", value: "Automatically posts a meme after a specified period of time, for example `"+prefix[msg.guild.id]+"automeme on 5` will post a meme every 5 mins, to turn automeme off type `"+prefix[msg.guild.id]+"automeme off`.\n\u200B"});
			} else if (module_name == "autophoto") {
				embed_help_reply(msg, {name: "AutoPhoto", value: "Automatically posts a photography image after a specified period of time, for example `"+prefix[msg.guild.id]+"autophoto on 5` will post photo every 5 mins, to turn autophoto off type `"+prefix[msg.guild.id]+"autophoto off`.\n\u200B"});
			} else if (module_name == "autobird") {
				embed_help_reply(msg, {name: "AutoBird", value: "Automatically posts a bird photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autobird on 5` will post a bird every 5 mins, to turn autobird off type `"+prefix[msg.guild.id]+"autobird off`.\n\u200B"});
			} else if (module_name == "autocar") {
				embed_help_reply(msg, {name: "AutoCar", value: "Automatically posts a car photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autocar on 5` will post a car every 5 mins, to turn autocar off type `"+prefix[msg.guild.id]+"autocar off`.\n\u200B"});
			} else if (module_name == "autocat") {
				embed_help_reply(msg, {name: "AutoCat", value: "Automatically posts a cat photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autocat on 5` will post a cat every 5 mins, to turn autocat off type `"+prefix[msg.guild.id]+"autocat off`.\n\u200B"});
			} else if (module_name == "autodog") {
				embed_help_reply(msg, {name: "AutoDog", value: "Automatically posts a dog photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autodog on 5` will post a dog every 5 mins, to turn autodog off type `"+prefix[msg.guild.id]+"autodog off`.\n\u200B"});
			} else if (module_name == "autosnake") {
				embed_help_reply(msg, {name: "AutoSnake", value: "Automatically posts a snake photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autosnake on 5` will post a snake every 5 mins, to turn autosnake off type `"+prefix[msg.guild.id]+"autosnake off`.\n\u200B"});
			} else if (module_name == "autopost") {
				autopost_help(msg);
			} else if (module_name == "autoanime") {
				embed_help_reply(msg, {name: "AutoAnime", value: "Automatically posts an anime photo after a specified period of time, for example `"+prefix[msg.guild.id]+"autoanime on 5` will post an anime photo every 5 mins, to turn autoanime off type `"+prefix[msg.guild.id]+"autoanime off`.\n\u200B"});
			} else if (module_name == "autovideo") {
				embed_help_reply(msg, {name: "AutoVideo", value: "Automatically posts a video after a specified period of tine, for example `"+prefix[msg.guild.id]+"autovideo on 20` will post a video every 20 mins, to turn autovideo off type `"+prefix[msg.guild.id]+"autovideo off`.\n\u200B"});
			} else if (module_name == "automars") {
				embed_help_reply(msg, {name: "AutoMars", value: "Automatically posts a photo of mars after a specified period of tine, for example `"+prefix[msg.guild.id]+"automars on 20` will post a photo of mars every 20 mins, to turn automars off type `"+prefix[msg.guild.id]+"automars off`.\n\u200B"});
			
			// Music
			} else if (module_name == "play" || msg.content == prefix[msg.guild.id]+"play") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"play {song name/URL}", value:"Adds a song to the queue, you can add a song via the name or YouTube URL for example `"+prefix[msg.guild.id]+"play sicko mode` or `"+prefix[msg.guild.id]+"play https://youtu.be/6ONRf7h3Mdk` Will add the song Sicko mode to the queue.\n\u200B"});
			} else if (module_name == "forceplay" || msg.content == prefix[msg.guild.id]+"forceplay") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"forceplay {song name/URL}", value:"Forces a song to be played, stopping anything currently playing and ingoring the queue. The syntax for forceplay is the same as play, just specify a song via name or URL, e.g. `"+prefix[msg.guild.id]+"forceplay the rich kid plug walk`.\n\u200B"});
			} else if (module_name == "skipplay" ||module_name == "playskip" ) {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"playskip {song name/URL}", value:"Forces a song to be played, stopping anything currently playing and ingoring the queue. The syntax for forceplay is the same as play, just specify a song via name or URL, e.g. `"+prefix[msg.guild.id]+"playskip the rich kid plug walk`.\n\u200B"});
			} else if (module_name == "skip") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"skip", value:"Skips to the next song in the queue.\n\u200B"});
			} else if ( module_name == "skipto") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"skipto {index}", value:"Skips to a song at the specified index e.g. `"+prefix[msg.guild.id]+"skipto 2` skips to the second song in the queue.\n\u200B"});
			} else if (module_name == "disconnect") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"disconnect", value:"Disconnects JaredBot from the voice channel, the queue will also be cleared when the bot disconnects.\n\u200B"});
			} else if (module_name == "np") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"np", value:"Now Playing, shows information about the current song that is playing.\n\u200B"});
			} else if (module_name == "ping") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"ping", value:"`"+prefix[msg.guild.id]+"ping` tests the bots response time to discord servers.\n\u200B"});
			} else if (module_name == "testaudio" || module_name == "audiotest") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"testaudio", value:"The `testaudio` command will play a sound test, to check that the music features are functioning correctly.\n\u200B"});
			} else if (module_name == "queue") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"queue", value:"Shows the queue, the queue is a list of all of the songs that have been requested, and what order they will be played in.\n\u200B"});
			} else if (module_name == "playtop" || module_name == "reverse") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"playtop "+prefix[msg.guild.id]+"reverse", value:"Reverses the queue, the last songs in the queue are played next, after the current song is finished.\n\u200B"});
			} else if (module_name == "remove" || msg.content == prefix[msg.guild.id]+"remove") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"remove {index}", value:"Removes a song from the queue, for example `"+prefix[msg.guild.id]+"remove 4` will remove the 4th song in the queue.\n\u200B"});
			} else if (module_name == "move" || msg.content == prefix[msg.guild.id]+"move") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"move {index 1} {index 2}", value:"Moves a song in the queue to a diffrent position, for example `"+prefix[msg.guild.id]+"move 1 5` would move the 1st song to the 5th position in the queue.\n\u200B"});
			} else if (module_name == "loop") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"loop", value: "`"+prefix[msg.guild.id]+"loop` loops the current song, repeating it endlessly until you toggle the loop off again with `"+prefix[msg.guild.id]+"loop`.\n\u200B"});
			} else if (module_name == "loopq") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"loopq", value: "The `"+prefix[msg.guild.id]+"loopq` command will loop the entire queue, once the end of the queue is reached JaredBot will start playing the same songs in the queue from the beginning again.\n\u200B"});
			} else if (module_name == "clearq") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"clearq", value: "Clears the song queue, removing all songs currently queued.\n\u200B"});
			} else if (module_name == "removedupes") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"removedupes", value: "Removes all duplicate songs from the queue, usefull if someone has added the same song multiple times to the queue.\n\u200B"});
			} else if (module_name == "shuffle") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"shuffle", value: "Randomly changes the order of songs in the queue, the queue is shuffled.\n\u200B"});
			} else if (module_name == "replay") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"replay", value: "Replays the current song from the beginning.\n\u200B"});
			} else if (module_name == "pause") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"pause", value: "`pause` pauses the song.\n\u200B"});
			} else if (module_name == "resume") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"resume", value: "`resume` then resumes the song.\n\u200B"});
			} else if (module_name == "seek" || msg.content == prefix[msg.guild.id]+"seek") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"seek {MM:SS}", value: "forwards to the specified time stamp, e.g. `"+prefix[msg.guild.id]+"seek 1:05` will go to 1 min 5 seconds in the track.\n\u200B"});
			} else if (module_name == "songinfo") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"songinfo", value: "Similar to np, but shows more detailed information about the current song playing.\n\u200B"});
			} else if (module_name == "streaminfo") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"songinfo", value: "Similar to np, but shows more detailed information about the current song playing.\n\u200B"});
			} else if (module_name == "settings") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"songinfo", value: "Similar to np, but shows more detailed information about the current song playing.\n\u200B"});
			} else if (module_name == "forward" || msg.content == prefix[msg.guild.id]+"forward") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"forward {MM:SS}", value: "Fast forward the song the specified number of seconds.\n\u200B"});
			} else if (module_name == "rewind" || msg.content == prefix[msg.guild.id]+"rewind") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"rewind {MM:SS}", value: "Rewind the song the specified number of seconds.\n\u200B"});
			} else if (module_name == "volume" || msg.content == prefix[msg.guild.id]+"volume") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"volume %", value: "Lets you change the volume of the music, e.g. `"+prefix[msg.guild.id]+"volume 50` sets the sound to 50%.\n\u200B"});
			} else if (module_name == "freeplay" || msg.content == prefix[msg.guild.id]+"freeplay") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"freeplay [on/off]", value: "Freeplay is a feature where JaredBot will automatically play a random song after the end of the queue is reached."});
		
			// fancy
			} else if (module_name == "fancy") {
				help_fancy(msg);
			} else if (module_name == "flip" || msg.content == prefix[msg.guild.id]+"flip") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"flip", value: "˙uʍop ǝpᴉsdn ʇxǝʇ ǝɥʇ sdᴉlɟ\n\u200B"});
			} else if (module_name == "tiny" || msg.content == prefix[msg.guild.id]+"tiny") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"tiny", value: "ᵐᵃᵏᵉˢ ᵗʰᵉ ᵗᵉˣᵗ ʳᵉᵃˡˡʸ ˢᵐᵃˡˡ.\n\u200B"});
			} else if (module_name == "clap" || msg.content == prefix[msg.guild.id]+"clap") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"clap", value: "puts👏between👏the👏words👏in👏the👏text.\n\u200B"});
			} else if (module_name == "width" || msg.content == prefix[msg.guild.id]+"width") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"width", value: "`-wide {spacing} {text}` makes the text really `w   i   d   e`, for exmaple `-wide 5 hello` produces `h     e     l     l     o`.\n\u200B"});
			} else if (module_name == "wiggle" || msg.content == prefix[msg.guild.id]+"wiggle" || module_name == "worm" || 
				msg.content == prefix[msg.guild.id]+"worm" || module_name == "twist" || msg.content == prefix[msg.guild.id]+"twist") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"wiggle", value: "does the wiggle.\n\u200B"});
			} else if (module_name == "alter" || msg.content == prefix[msg.guild.id]+"alter") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"alter", value: "alternates the caps.\n\u200B"});
		
			// just one
			} else if (module_name == "just one" || module_name == "justone" || msg.content == prefix[msg.guild.id]+"just one" || msg.content == prefix[msg.guild.id]+"justone") {
				help_justone(msg);
		
			// levels
			} else if (module_name == "addscore") {
				embed_help_reply(msg, {name: "Add Score", value: "`"+prefix[msg.guild.id]+"addscore {User ID},{msg count}` admin command, lets you manually change or add a score on the leaderboard, for example `"+prefix[msg.guild.id]+"addscore 364787379518701569,100` would set my message count to 100.\n\u200B"});
			} else if (module_name == "rank") {
				embed_help_reply(msg, {name: "Rank", value: "`"+prefix[msg.guild.id]+"rank @user` shows your or another users rank, for example `"+prefix[msg.guild.id]+"rank @jared` will shows Jareds rank.\n\u200B"});
			} else if (module_name == "restorebackup") {
				embed_help_reply(msg, {name: "Restore Backup", value: "`"+prefix[msg.guild.id]+"restorebackup` Restores a backup copy of the leaderboard, from the last message that was sent on the server, up to 30 seconds ago.\n\u200B"});
		
			// invite
			} else if (module_name == "invite" || module_name == "invitelink" || module_name == "addbot" || 
				module_name == prefix[msg.guild.id]+"invitebot" || module_name == prefix[msg.guild.id]+"addbot" || module_name == prefix[msg.guild.id]+"botinvite") {
				help_module_embed.setTitle("Help Invite commands");
				help_module_embed.addFields (
					{name: "Invite", value: "`"+prefix[msg.guild.id]+"invite` generates an invite link for your server.\n\u200B"},
					{name: "InviteLink", value: "`"+prefix[msg.guild.id]+"invitelink` sends an invitelink to the Jared Network server.\n\u200B"},
					{name: "InviteBot", value: "`"+prefix[msg.guild.id]+"invitebot` sends an invite link so you can add JaredBot to another server.\n\u200B"}
				)
				msg_channel_send(msg, help_module_embed);
		
			// network
			} else if (msg.guild != null && msg.content == msg.content == prefix[msg.guild.id]+"nslookup" || msg.content == prefix[msg.guild.id]+"tracert" || 
				msg.content == prefix[msg.guild.id]+"pathping" || msg.content == prefix[msg.guild.id]+"whois" || msg.content == prefix[msg.guild.id]+"echo" || msg.content == prefix[msg.guild.id]+"port" ||
				msg.content == prefix[msg.guild.id]+"network" || msg.content == prefix[msg.guild.id]+"help network" || msg.content == prefix[msg.guild.id]+"networking" || 
				msg.content == prefix[msg.guild.id]+"help networking" || msg.content == prefix[msg.guild.id]+"net" || msg.content == prefix[msg.guild.id]+"help net") {
				help_network_cmd(msg);
			} else if (module_name == "port") {
				embed_help_reply(msg, {name: "Port Scan", value: "`"+prefix[msg.guild.id]+"port {port} {host}` checks if a specific port is open on the host, " +
				"for example `"+prefix[msg.guild.id]+"port 80 jaredbot.uk` will check if port 80 is open on JaredBot servers. You can also enter port ranges e.g. " +
				"`"+prefix[msg.guild.id]+"port 20-100 jaredbot.uk` will check all the ports between 20 and 100, be aware that entering a large port range could take " +
				"a long time to complete."});
		
			// welcome
			} else if (module_name == "welcome" || module_name == "welcomer" || msg.content == prefix[msg.guild.id]+"welcomer" ||
				module_name == "clearwelcome" || module_name == "welcomemessage" || module_name == "clearwelcomemessage" ||
				module_name == "leavechannel" || module_name == "leave" || module_name == "leaver" || module_name == "clearleave") {
				help_welcome(msg)
			
			// mov2mp4
			} else if (module_name == "mp4" || module_name == "mov" || module_name == "webm" ||
				module_name == "mp4low" || module_name == "movlow" || module_name == "webmlow" ||
				module_name == "mp3" || module_name == "gif") {
				help_mp4(msg);
			
			// render
			} else if (module_name == "render") {
				help_render(msg);
				
			// download
			} else if (module_name == "download" || msg.content == prefix[msg.guild.id]+"download" || module_name == "downloadlow" || 
				msg.content == prefix[msg.guild.id]+"downloadlow" || module_name == "downloadmp3" || 
				msg.content == prefix[msg.guild.id]+"downloadmp3" || module_name == "youtube" || module_name == "yt" || 
				msg.content == prefix[msg.guild.id]+"yt" || msg.content == prefix[msg.guild.id]+"youtube") {
				help_download(msg);
			
			} else if (module_name == "ig" || msg.content == prefix[msg.guild.id]+"ig") {
				help_ig(msg);
			
			// caption
			} else if (module_name == "cap" || module_name == "caption" || msg.content == prefix[msg.guild.id]+"cap" ||
			msg.content == prefix[msg.guild.id]+"caption") {
				embed_help_reply(msg, {name: prefix[msg.guild.id]+"cap", value: "`"+prefix[msg.guild.id]+"cap {text} {font size}` Adds a caption to an image or video, for example adding the comment `"+prefix[msg.guild.id]+"cap Hello 64` when uploading a file to discord, will create a video with the caption hello in size 64 font."});
			
			} else if (module_name == "morse" || module_name == "ogham" || module_name == "lan" || msg.content == prefix[msg.guild.id]+"morse" ||
				msg.content == prefix[msg.guild.id]+"ogham" || msg.content == prefix[msg.guild.id]+"lan") {
				help_code_language(msg);
		
			// not a valid module error
			} else {
				if (module_name != "") {
					embed_error(msg, "Not a valid module! Please type `"+prefix[msg.guild.id]+"help` for a list of modules!");
				}
			}
		}
	} catch (err) {
		console_log("Failed to display help menu! " + err, error=true);
	}
})

// text commands
function text_sort(msg, txt, fancyASCII, append2end=false) {
	try {
		output = "";
		for (i=0;i<txt.length;i++) {
			if (ASCII.indexOf(txt[i]) != -1) {
				if (append2end == true) {
					output = fancyASCII[ASCII.indexOf(txt[i])] + output;
				} else {
					output = output + fancyASCII[ASCII.indexOf(txt[i])];
				}
			}
		}
		msg_channel_send(msg, output);
	} catch (err) {
		console_log("Error thrown in text_sort function! " + err, error=true);
	}
}

function do_the_wiggle(txt, reverse=false, size=10) {
	try {
		count = 0
		output = [];
		word = txt.slice(0, 30);
		for (i=0;i<size;i++) {
			output.push((" ".repeat(count)) + word + (" ".repeat(i-count)));
			count += 1;
		}
	
		if (reverse == true) {
			return output.reverse(-1).join("\n");
		} else {
			return output.join("\n");
		}
	} catch (err) {
		console_log("Error thrown in do_the_wiggle function! " + err, error=true);
	}
}

function help_fancy(msg) {
	try {
		embed_fancy = new Discord.MessageEmbed();
		embed_fancy.setColor(embed_color_chat);
		embed_fancy.setTitle("Help Fancy Text");
		embed_fancy.addFields(
			{name: prefix[msg.guild.id]+"fancy", value: "𝔠𝔬𝔫𝔴𝔢𝔯𝔱𝔰 𝔅𝔗𝔇𝔍𝔍 𝔠𝔥𝔞𝔯𝔞𝔠𝔱𝔢𝔯𝔰 𝔦𝔫𝔱𝔬 𝔣𝔞𝔫𝔠𝔷 𝔲𝔫𝔦𝔠𝔬𝔡𝔢 𝔣𝔬𝔫𝔱.\n\u200B"},
			{name: prefix[msg.guild.id]+"flip", value: "˙uʍop ǝpᴉsdn ʇxǝʇ ǝɥʇ sdᴉlɟ\n\u200B"},
			{name: prefix[msg.guild.id]+"tiny", value: "ᵐᵃᵏᵉˢ ᵗʰᵉ ᵗᵉˣᵗ ʳᵉᵃˡˡʸ ˢᵐᵃˡˡ.\n\u200B"},
			{name: prefix[msg.guild.id]+"clap", value: "puts👏between👏the👏words👏in👏the👏text.\n\u200B"},
			{name: prefix[msg.guild.id]+"width", value: "makes the text really w   i   d   e\n\u200B"},
			{name: prefix[msg.guild.id]+"wiggle", value: "does the wiggle.\n\u200B"},
			{name: prefix[msg.guild.id]+"alter", value: "AlTeRnAtEs tHe cApS In tHe tExT.\n\u200B"}
		)
		embed_fancy.setTimestamp();
		msg_channel_send(msg, embed_fancy);
	} catch (err) {
		console_log("Error thrown in help_fancy function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"fancy") {
			help_fancy(msg);
			
		} else if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"fancy ") {
			fancyASCII = ["𝔞","𝔟","𝔠","𝔡","𝔢","𝔣","𝔤","𝔥","𝔦","𝔧","𝔨","𝔩","𝔪","𝔫","𝔬","𝔭","𝔮","𝔯","𝔰","𝔱","𝔲","𝔴","𝔵",
			"𝔶","𝔷","𝔄","𝔅","ℭ","𝔇","𝔈","𝔉","𝔊","ℌ","ℑ","𝔍","𝔎","𝔏","𝔐","𝔑","𝔒","𝔓","𝔔","ℜ","𝔖","𝔗","𝔘","𝔙","𝔚","𝔛",
			"𝔜","ℨ","0","1","2","3","4","5","6","7","8","9","!","@","#","$","%","^","&","*","(",")","_","+","1","2","3",
			"4","5","6","7","8","9","0","-","=","[","]","{","}","|",",",".","<",">","/","?","`","~",""," "];
			text_sort(msg, msg.content.slice(7, msg.content.length), fancyASCII);
			
		} else if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"flip ") {
			fancyASCII = ["ɐ","q","ɔ","p","ǝ","ɟ","ƃ","ɥ","ᴉ","ɾ","ʞ","l","ɯ","u","o","d","b","ɹ","s","ʇ","n","ʌ","ʍ","x","ʎ","z","∀",
			"q","Ɔ","p","Ǝ","פ","H","I","ſ","ʞ","˥","W","N","O","Ԁ","Q","ɹ","S","┴","∩","Λ","M","X","⅄","Z","0","Ɩ","ᄅ","Ɛ","ㄣ",
			"ϛ","9","ㄥ","8","6","¡","@","#","$","%","^","⅋","*",")","(","‾","+","Ɩ","ᄅ","Ɛ","ㄣ","ϛ","9","ㄥ","8","6","0","-",
			"=","]","[","}","{","","","'","˙",">","<","/","¿",",","~"," "];
			text_sort(msg, msg.content.slice(6, msg.content.length), fancyASCII, append2end=true);
		
		} else if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"tiny ") {
			fancyASCII = ['ᵃ', 'ᵇ', 'ᶜ', 'ᵈ', 'ᵉ', 'ᶠ', 'ᵍ', 'ʰ', 'ᶦ', 'ʲ', 'ᵏ', 'ˡ', 'ᵐ', 'ⁿ', 'ᵒ', 'ᵖ', 'ᵠ', 'ʳ', 'ˢ', 'ᵗ', 'ᵘ', 'ᵛ', 
			'ʷ', 'ˣ', 'ʸ', 'ᶻ', 'ᴬ', 'ᴮ', 'ᶜ', 'ᴰ', 'ᴱ', 'ᶠ', 'ᴳ', 'ᴴ', 'ᴵ', 'ᴶ', 'ᴷ', 'ᴸ', 'ᴹ', 'ᴺ', 'ᴼ', 'ᴾ', 'ᵠ', 'ᴿ', 'ˢ', 'ᵀ', 'ᵁ',
			'ⱽ', 'ᵂ', 'ˣ', 'ʸ', 'ᶻ', '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', 'ᵎ', '@', '#', '$', '%', '^', '&', '*', '⁽', '⁾', 
			'_', '⁺', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁰', '⁻', '⁼', '[', ']', '{', '}', '\\', '|', ',', '.', '<', '>', '/', 
			'ˀ', '`', ' '];
			text_sort(msg, msg.content.slice(6, msg.content.length), fancyASCII)
			
		} else if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"clap ") {
			msg_channel_send(msg, (" "+msg.content.slice(6, msg.content.length)).split(" ").join("👏"));
			
		} else if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"width ") {
			msg_channel_send(msg, msg.content.slice(7, msg.content.length).split("").join("   "));
			
		} else if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"wide ") {
			parts = msg.content.split(" ");
			if (isInt_without_error(parts[1], 0, large_numb) == true) {
				start = parts[0].length + parts[1].length + 2;
				msg_channel_send(msg, msg.content.slice(start, msg.content.length).split("").join(" ".repeat(parts[1])));
			} else {
				msg_channel_send(msg, msg.content.slice(6, msg.content.length).split("").join("   "));
			}
		} else if (msg.guild != null && msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"wiggle " || msg.content.slice(0, 6) == prefix[msg.guild.id]+"worm " ||
			msg.content.slice(0, 7) == prefix[msg.guild.id]+"twist ") {
			word = msg.content.slice(msg.content.split(" ")[0].length, msg.content.length);
			output = do_the_wiggle(word) +"\n"+ do_the_wiggle(word, reverse=true) +"\n"+
					 do_the_wiggle(word) +"\n"+ do_the_wiggle(word, reverse=true) +"\n"+
					 do_the_wiggle(word) +"\n"+ do_the_wiggle(word, reverse=true);
			msg_channel_send(msg, output);
			
		} else if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"alter ") {
			word = msg.content.slice(7, msg.content.length);
			letters = []
			for (i=0;i<word.length;i++) {
				if (i % 2 == 0) {
					letters.push(word[i].toUpperCase());
				} else {
					letters.push(word[i]);
				}
			}
			msg_channel_send(msg, letters.join(""));
			
		} else if (msg.guild != null && msg.content.slice(0, 3).toLowerCase() == prefix[msg.guild.id]+"t ") {
			message = msg.content.slice(3, msg.content.length);
			txt = [];
			for (i=0;i<message.length;i++) {
				txt.push(message.slice(0, i));
			}
			for (i=message.length;i>0;i--) {
				txt.push(message.slice(0, i));
			}
			msg.channel.send(txt.join('\n')).catch(err => {
				embed_error(msg, "Failed to send message, the text is too long!");
			});
		}
	}
})

// Discord Community Guidlines
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"tos") {
			ToSURL = "http://jaredbot.uk";
			embed_tos = new Discord.MessageEmbed();
			embed_tos.setColor(embed_colour_info);
			embed_tos.setTitle("Discord Community Guidelines");
			embed_tos.setURL(ToSURL);
			embed_tos.setDescription("We created Discord to help people come together around games. Our community guidelines are meant to "+
			"explain what is and isn’t allowed on Discord, and ensure that everyone has a good experience. If you come across a message that "+
			"appears to break these rules, please report it to us. We may take a number of steps, including issuing a warning, removing the "+
			"content, or removing the accounts and/or servers responsible.\n\u200B");
			embed_tos.addFields(
				{name: "Interacting with others", value:
					"[1]("+ToSURL+"). Do not organize, participate, or encourage **harassment** of others.\n"+
					"[2]("+ToSURL+"). Do not organize, promote, or coordinate servers around **hate speech**.\n"+
					"[3]("+ToSURL+"). Do not make threats of violence or **threaten to harm** others.\n"+
					"[4]("+ToSURL+"). Do not **evade user blocks** or server bans.\n"+
					"[5]("+ToSURL+"). Do not send others **viruses or malware**.\n\u200B"
				},
				{name : "Rules for content", value:
					"[6]("+ToSURL+"). You must apply the NSFW label to channels if there is **adult content** in that channel.\n"+
					"[7]("+ToSURL+"). Don't **sexualize minors** in any way.\n"+
					"[8]("+ToSURL+"). Don't share sexually **explicit content** of other people without their **consent**.\n"+
					"[9]("+ToSURL+"). Don't share content that **glorifies** or promotes suicide or **self-harm**.\n"+
					"[10]("+ToSURL+"). Don't share images of sadistic gore or **animal cruelty**.\n"+
					"[11]("+ToSURL+"). Don't use Discord for the organization, promotion, or support of **violent extremism**.\n"+
					"[12]("+ToSURL+"). Don't operate a server that **sells** prohibited or potentially **dangerous goods**.\n"+
					"[13]("+ToSURL+"). Don't promote, distribute, or provide access to content involving the **hacking**, cracking, or distribution "+
					"of **pirated software** or stolen accounts.\n"+
					"[14]("+ToSURL+"). In general, you should not promote, encourage or engage in any **illegal behavior**.\n\u200B"
				},
				{name : "Respect Discord itself", value:
					"[15]("+ToSURL+"). Don't **sell your account** or your server.\n"+
					"[16]("+ToSURL+"). Don't use **self-bots** or user-bots to access Discord.\n"+
					"[17]("+ToSURL+"). Don't share content that violates anyone's **intellectual property** or other rights.\n"+
					"[18]("+ToSURL+"). Don't **spam Discord**, especially our Customer Support and Trust & Safety teams.\n\u200B"
				},
			)
			embed_tos.setTimestamp();
			embed_tos.setFooter("If you see any activity that violates these guidelines, you can report it");
			msg_channel_send(msg, embed_tos);
		}
	}
})

// rules
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"rules") {
			embed_rules = new Discord.MessageEmbed();
			embed_rules.setColor(embed_colour_info);
			embed_rules.setTitle("Rules");
			embed_rules.setURL("https://discord.com/channels/738484352568262747/751827982087094322/751857233972690967");
			embed_rules.addFields(
				{name: "Rule 1", value: "Only post porn in the NSFW channels (please only softcore)\n\u200B"},
				{name: "Rule 2", value: "No phishing website links\n\u200B"},
				{name: "Rule 3", value: "No spamming the same repetitive message, over a short period of time (This rule applies to all channels excluding the botspam and jared-bot channels, feel free to spam as many bot commands as you want in botspam).\n\u200B"},
				{name: "Rule 4", value: "Don’t be a dick or bully others, be kind\n\u200B"},
				{name: "Rule 5", value: "Only post promotions in the advertisement channel\n\u200B"},
				{name: "Rule 6", value: "No raids (includes spamming lots of messages, pinging lots of people with @ tags)\n\u200B"},
				{name: "Rule 7", value: "No asking to be moderator\n\u200B"},
				{name: "Rule 8", value: "No sending offensive, or alarming messages with the intent to get a reaction out of others (This includes racist, prejudice, sexist, homophobic jokes, or promoting/normalizing terrorism and or rape).\n\u200B"},
			)
			if (rules_include_footer == true) {
				embed_rules.setFooter("\n\u200BClick the ✅ to verify and gain access to the rest of the server!");
				embed_rules.setImage(webserver_root_address+"img/src/white_checkmark.gif");
			}
			msg_channel_send(msg, embed_rules);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,6).toLowerCase() == prefix[msg.guild.id]+"rule ") {
			rule_no = msg.content.slice(6, msg.content.length);
			embed_rule = new Discord.MessageEmbed();
			embed_rule.setColor(embed_colour_info);
			switch (rule_no) {
				case "1":
					embed_rule.addField("Rule 1", "Only post porn in the NSFW channels (please only softcore)");
					msg_channel_send(msg, embed_rule);
					break;
				case "2":
					embed_rule.addField("Rule 2", "No phishing website links");
					msg_channel_send(msg, embed_rule);
					break;
				case "3":
					embed_rule.addField("Rule 3", "No spamming the same repetitive message, over a short period of time (This rule applies to all channels excluding the `botspam` and `jared-bot` channels, feel free to spam as many bot commands as you want in botspam).");
					msg_channel_send(msg, embed_rule);
					break;
				case "4":
					embed_rule.addField("Rule 4", "Don’t be a dick or bully others, be kind");
					msg_channel_send(msg, embed_rule);
					break;
				case "5":
					embed_rule.addField("Rule 5", "Only post promotions in the advertisement channel");
					msg_channel_send(msg, embed_rule);
					break;
				case "6":
					embed_rule.addField("Rule 6", "No raids (includes spamming lots of messages, pinging lots of people with @ tags)");
					msg_channel_send(msg, embed_rule);
					break;
				case "7":
					embed_rule.addField("Rule 7", "No asking to be moderator");
					msg_channel_send(msg, embed_rule);
					break;
				case "8":
					embed_rule.addField("Rule 8", "No sending offensive, or alarming messages with the intent to get a reaction out of others");
					msg_channel_send(msg, embed_rule);
					break;
				default:
					embed_rule.setColor(embed_colour_error);
					embed_rule.addField("Error", "Invalid Rule! the Syntax for command is `"+prefix[msg.guild.id]+"rule [1-8]`!");
					msg_channel_send(msg, embed_rule);
					break;
			}
		}
	}
})

// letter emojis
function letter_emoji(msg, emojiname, emoji_letter, emojiID) {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.content == emojiname || msg.content.toLowerCase().slice(0, 1) == emoji_letter) {
				if (msg.content.toLowerCase().split(emoji_letter).length == msg.content.length+1) {
					msg_channel_send(msg, emojiID.repeat(msg.content.length).slice(0, 2000));
				} else if (msg.content.toLowerCase() == emoji_letter) {
					msg_channel_send(msg, emojiID);
				} else if (msg.content.toLowerCase() == emojiname) {
					msg_channel_send(msg, emojiID);
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in letter_emoji function! " + err, error=true);
	}
}

function help_letteremoji(msg) {
	try {
		embed_letter = new Discord.MessageEmbed();
		embed_letter.setColor(embed_color_chat);
		embed_letter.setTitle("Letter Emoji Help");
		embed_letter.setDescription("Letter Emoji is a feature where JaredBot will automtically reply with an emoji when you type a single letter, " +
		"for example if you type the letter `p` JaredBot will send the popcat <a:popcat:786084522210099201> emoji!\n\u200B");
		embed_letter.addFields(
			{name: "Letter Emoji On", value: "`"+prefix[msg.guild.id]+"letteremoji on` turns on letter emoji, JaredBot will reply to single letter messages.\n\u200B"},
			{name: "Letter Emjoi Off", value: "`"+prefix[msg.guild.id]+"letteremoji off` turns off letter emoji, JaredBot will no logner respond to single letter messages.\n\u200B"},
		)
		embed_letter.setTimestamp();
		msg_channel_send(msg, embed_letter);
	} catch (err) {
		console_log("Error thrown in help_letteremoji function! " + err, error=true);
	}
}

var letter_emojis = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (letter_emojis[msg.guild.id] == "true") {
			// allow for custom emojis
			
			// default emojis
			letter_emoji(msg, "sissyvac", "s", "<a:sissyvacuum:779507117185826867>");
			letter_emoji(msg, "popcat", "p", "<a:popcat:786084522210099201>");
			letter_emoji(msg, "frog", "r", "<a:daa_frogedance:779738708844609597>");
			letter_emoji(msg, "polishcow", "h", "<a:polishcow:777247300481056768>");
			letter_emoji(msg, "disco", "b", "<a:disco_cat:777208095914590240>");
			letter_emoji(msg, "fortnite", "o", "<a:Orange_justice:791403867216150548>");
			letter_emoji(msg, "fish", "g", "<a:pogfish:791404557338935296>");
			letter_emoji(msg, "corn", "t", "<a:TcCattoCorn:791405211520335923>");
			letter_emoji(msg, "kangaroo", "j", "<a:NM_peepoRideKangaroo:779738949832671272>");
			letter_emoji(msg, "cattono", "n", "<a:TcCattoNo:791407268180000768>");
			letter_emoji(msg, "cattoplay", "q", "<a:TcCattoPlay:791407697978589185>");
			letter_emoji(msg, "catto", "e", "<a:catsadden:791408181427044352>");
			letter_emoji(msg, "crab", "c", "<a:Crabrave:791408606338613298>");
			letter_emoji(msg, "cap", "i", "<a:Cap:791409381807357952>");
			letter_emoji(msg, "rub", "z", "<a:Pepe_rub:791409723693989890>");
			letter_emoji(msg, "lick", "l", "<a:c_licklicklick:791410104171626526>");
			letter_emoji(msg, "duck", "d", "<a:ducky:791410642249711676>");
			letter_emoji(msg, "horny", "a", "<a:no_horny:780625969462509609>");
			letter_emoji(msg, "hacker", "k", "<a:hack:768252926249664523>");
			letter_emoji(msg, "stonks", "w", "<a:stonks:767916835362177054>");
			letter_emoji(msg, "verynice", "v", "<a:verynice:772532981793423391>");
			letter_emoji(msg, "dog", "u", "<a:im_dog:777203754972741682>");
			letter_emoji(msg, "simp", "y", "<a:im_dog:777203754972741682>");
			letter_emoji(msg, "hacker", "x", "<a:hacker_man:768253254886359052>");
			
			// abcdefghijklmnopqrstuvwxyz
		}
	}
})

bot.on("ready", msg => {
	// update global var with letter emoji rules
	read_file(letteremoji_filename, letter_emojis, allow_non_int=true, sep="\n", remove_dupes=false);
})

// temporterly turn feature off, while the bot is being verified!
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"letteremoji on") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				// write guild ID to file
				create_file_then_append_data(msg, letteremoji_filename, "true", endl="", overwrite=true);
				embed_chat_reply(msg, "turned letter emojis on, type `"+prefix[msg.guild.id]+"letteremoji off` to turn off!");
				letter_emojis[msg.guild.id] = "true";
				
			} else {
				embed_error(msg, "You dont have permission to turn on letter emojis, " + mod_error_text + " manage messages permission!");
			}
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"letteremoji off") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				// turn letter emoji off
				create_file_then_append_data(msg, letteremoji_filename, "", endl="", overwrite=true);
				embed_chat_reply(msg, "turned letter emojis off, type `"+prefix[msg.guild.id]+"letteremoji on` to turn back on!");
				letter_emojis[msg.guild.id] = "false";
				
			} else {
				embed_error(msg, "You dont have permission to turn on letter emojis, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

// report bug / make suggestion
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 11).toLowerCase() == prefix[msg.guild.id]+"reportbug " || 
		msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"bug " ||
		msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"suggest " || 
		msg.content.slice(0, 12).toLowerCase() == prefix[msg.guild.id]+"suggestion ") {
			type_dict = {"reportbug":"Bug", "bug":"Bug", "suggest":"Suggestion", "suggestion":"Suggestion"};
			type = type_dict[msg.content.slice(1, msg.content.split(" ")[0].length)];
			description = msg.content.split(/ (.+)/)[1];
			
			// user
			nametag = msg.member.user.tag.split("#")[0];
			//profile_pic = msg.author.avatarURL();
			profile_pic = msg.author.displayAvatarURL({dynamic: true});
			
			if (description != "") {
				// embed
				embed_suggestion = new Discord.MessageEmbed();
				embed_suggestion.setColor(embed_color_chat);
				embed_suggestion.setTitle(type);
				embed_suggestion.setAuthor(nametag + " | " + msg.guild.name, profile_pic, "");
				embed_suggestion.setDescription(description);
				embed_suggestion.setTimestamp();
				bot.channels.cache.get(suggestions_channel_ID).send(embed_suggestion);
				embed_info_reply(msg, "Your " + type + " has been posted in the Jared Network Suggestions channel, thank you for your feedback!");
				console_log("User " + msg.member.user.tag + " has posted a suggestion from server " + msg.guild.id);
				
			} else {
				embed_error(msg, "Your Description cannot be blank!");
			}
		}
	}
})

// test message
reaction_emojis = [];

function add_reaction_role(msg, emoji, roleID) {
	try {
		msg.react(emoji).then(function(guild) {
			reaction_emojis.push(guild.message.id +","+ guild._emoji.name +","+ roleID);
			console_log([reaction_emojis.length]);
		}).catch(err => {
			console_log("Error thrown in add_reaction_role function! " + err, error=true);
		})
	} catch (err) {
		console_log("Error thrown in add_reaction_role function! " + err, error=true);
	}
}

// self roles
bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"selfroles") {
		async function selfroles(msg) {
			// only Jared can use selfroles command
			if (msg.author.id == "364787379518701569") {
				//relationship status
				embed_selfroles_relationship = new Discord.MessageEmbed();
				embed_selfroles_relationship.setColor(embed_color_chat);
				embed_selfroles_relationship.setTitle("Relationship Status");
				embed_selfroles_relationship.setDescription("Choose Your Relationship Status by reacting to this message");
				embed_selfroles_relationship.addFields(
					{name: "Single", value: "🔴", inline:true},
					{name: "Taken", value: "❌", inline:true},
					{name: "Married", value: "💍", inline:true},
					{name: "Married", value: "💍", inline:true},
				)
			
				// msg, emoji, role ID
				msg_channel_send(msg, embed_selfroles_relationship).then(function(msg){
					add_reaction_role(msg, "🔴", "780289306329350153");
					add_reaction_role(msg, "❌", "780289432199757884");
					add_reaction_role(msg, "💍", "780289637938888725");
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Games
				embed_selfroles_games = new Discord.MessageEmbed();
				embed_selfroles_games.setColor(embed_color_chat);
				embed_selfroles_games.setTitle("Games");
				embed_selfroles_games.setDescription("Choose which games you play by reacting to this message");
				embed_selfroles_games.addFields(
					{name: "Minecraft", value: "⛏️", inline:true},
					{name: "CSGO", value: "🔫", inline:true},
					{name: "tetris", value: "🔽", inline:true},
					{name: "skyrim", value: "🗡️", inline:true},
					{name: "genshin", value: "💎", inline:true},
					{name: "Among Us", value: "🔪", inline:true},
					{name: "L4d2", value: "🧟", inline:true},
					{name: "Hearts of Iron 4", value: "🗺️", inline:true},
					{name: "GTAV", value: "🚔", inline:true},
					{name: "AC", value: "⚔️", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_games).then(function(msg){
					add_reaction_role(msg, "⛏️", "780852424730607688"); //Minecraft
					add_reaction_role(msg, "🔫", "780852483173122088"); //CSGO
					add_reaction_role(msg, "🔽", "780852523547754547"); //Tetris
					add_reaction_role(msg, "🗡️", "780852628498284585"); //Skyrim
					add_reaction_role(msg, "💎", "780852676316889119"); //Genshin
					add_reaction_role(msg, "🔪", "780852724514291713"); //Among Us
					add_reaction_role(msg, "🧟", "780852766297423912"); //L4d2
					add_reaction_role(msg, "🗺️", "780852854566420482"); //Hearts of Iron 4
					add_reaction_role(msg, "🚔", "780852906747363369"); //GTAV
					add_reaction_role(msg, "⚔️", "780852954366083093"); //AC
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Religion
				embed_selfroles_religion = new Discord.MessageEmbed();
				embed_selfroles_religion.setColor(embed_color_chat);
				embed_selfroles_religion.setTitle("Religion");
				embed_selfroles_religion.setDescription("Choose which religion you are by reacting to this message");
				embed_selfroles_religion.addFields(
					{name: "Christian", value: "✝️", inline:true},
					{name: "Muslim", value: "☪️", inline:true},
					{name: "Buddhists", value: "☸️", inline:true},
					{name: "Hinduism", value: "🕉️", inline:true},
					{name: "Jewish", value: "✡️", inline:true},
					{name: "Atheist", value: "⚛️", inline:true},
					{name: "Other", value: "❓", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_religion).then(function(msg){
					add_reaction_role(msg, "✝️", "780853500116336680"); //Christian
					add_reaction_role(msg, "☪️", "780853558459367436"); //Muslim
					add_reaction_role(msg, "☸️", "780853668329160714"); //Buddhists
					add_reaction_role(msg, "🕉️", "780853720338006076"); //Hinduism
					add_reaction_role(msg, "✡️", "780853774766833686"); //Jewish
					add_reaction_role(msg, "⚛️", "780853816367120424"); //Atheist
					add_reaction_role(msg, "❓", "780853863577026600"); //other
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});
			
				//Religion (religion Christian/Catholic/Muslim/Buddhists/Hinduism/Jewish/Atheist/other)

				//Gender
				embed_selfroles_gender = new Discord.MessageEmbed();
				embed_selfroles_gender.setColor(embed_color_chat);
				embed_selfroles_gender.setTitle("Gender");
				embed_selfroles_gender.setDescription("Choose which gender you are by reacting to this message");
				embed_selfroles_gender.addFields(
					{name: "Male", value: "♂️", inline:true},
					{name: "Female", value: "♀️", inline:true},
					{name: "Other", value: "❓", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_gender).then(function(msg){
					add_reaction_role(msg, "♂️", "780854160555245628");
					add_reaction_role(msg, "♀️", "780854202200358932");
					add_reaction_role(msg, "❓", "780854257594269739");
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Country
				embed_selfroles_country = new Discord.MessageEmbed();
				embed_selfroles_country.setColor(embed_color_chat);
				embed_selfroles_country.setTitle("Country");
				embed_selfroles_country.setDescription("Choose where in the world you are from by reacting to this message.");
				embed_selfroles_country.addFields(
					{name: "Africa", value: "🌍", inline:true},
					{name: "Asia", value: "🗾", inline:true},
					{name: "North America", value: "🌎", inline:true},
					{name: "South America", value: "🌐", inline:true},
					{name: "Europe", value: "🗺️", inline:true},
					{name: "Oceania", value: "🌏", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_country).then(function(msg){
					add_reaction_role(msg, "🌍", "780854833283727370"); //Africa
					add_reaction_role(msg, "🗾", "780854866988892221"); //Asia
					add_reaction_role(msg, "🌎", "780854906176536577"); //North America
					add_reaction_role(msg, "🌐", "780854946144059403"); //South America
					add_reaction_role(msg, "🗺️", "780854980818370601"); //Europe
					add_reaction_role(msg, "🌏", "780855036841689138"); //Oceania
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Age
				embed_selfroles_age = new Discord.MessageEmbed();
				embed_selfroles_age.setColor(embed_color_chat);
				embed_selfroles_age.setTitle("Age");
				embed_selfroles_age.setDescription("Choose your age by reacting to this message.");
				embed_selfroles_age.addFields(
					{name: "<13", value: "🕑", inline:true},
					{name: "14-15", value: "🕗", inline:true},
					{name: "16-17", value: "🕒", inline:true},
					{name: "18-19", value: "🕘", inline:true},
					{name: "20-25", value: "🕙", inline:true},
					{name: "26-30", value: "🕓", inline:true},
					{name: "30+", value: "🕔", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_age).then(function(msg){
					add_reaction_role(msg, "🕑", "780855304866758716"); //<13
					add_reaction_role(msg, "🕗", "780855354217070602"); //14-15
					add_reaction_role(msg, "🕒", "780855413267628032"); //16-17
					add_reaction_role(msg, "🕘", "780855452639559712"); //18-19
					add_reaction_role(msg, "🕙", "780855487452938251"); //20-25
					add_reaction_role(msg, "🕓", "780855524471078923"); //26-30
					add_reaction_role(msg, "🕔", "780855559326007348"); //30+
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Personality
				embed_selfroles_personality = new Discord.MessageEmbed();
				embed_selfroles_personality.setColor(embed_color_chat);
				embed_selfroles_personality.setTitle("Personality");
				embed_selfroles_personality.setDescription("Choose your personality traits by reacting to this message.");
				embed_selfroles_personality.addFields(
					{name: "Kind", value: "🎁", inline:true},
					{name: "Unkind", value: "🔪", inline:true},
					{name: "Honest", value: "👨‍👨‍👦", inline:true},
					{name: "Dishonest", value: "😱", inline:true},
					{name: "Intelligent", value: "💡", inline:true},
					{name: "Stupid", value: "💊", inline:true},
					{name: "Trustworthy", value: "👫", inline:true},
					{name: "Unreliable", value: "⏰", inline:true},
					{name: "Patient", value: "💺", inline:true},
					{name: "Impatient", value: "😠", inline:true},
					{name: "Quiet/Shy", value: "🤫", inline:true},
					{name: "Sociable", value: "🍷", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_personality).then(function(msg){
					add_reaction_role(msg, "🎁", "780864196781932554"); //Kind
					add_reaction_role(msg, "🔪", "780864250335854602"); //Unkind
					add_reaction_role(msg, "👨‍👨‍👦", "780864291157966858"); //Honest
					add_reaction_role(msg, "😱", "780864323378610237"); //Dishonest
					add_reaction_role(msg, "💡", "780864367058354196"); //Intelligent
					add_reaction_role(msg, "💊", "780864402647285831"); //Stupid
					add_reaction_role(msg, "👫", "780864434914328576"); //Trustworthy
					add_reaction_role(msg, "⏰", "780864468473085992"); //Unreliable
					add_reaction_role(msg, "💺", "780864508293414973"); //Patient
					add_reaction_role(msg, "😠", "780864539712815114"); //Impatient
					add_reaction_role(msg, "🤫", "780864577096122368"); //Quiet/Shy
					add_reaction_role(msg, "🍷", "780864616132509746"); //Sociable
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});

				//Political Ideology
				embed_selfroles_ideology = new Discord.MessageEmbed();
				embed_selfroles_ideology.setColor(embed_color_chat);
				embed_selfroles_ideology.setTitle("Political Ideology");
				embed_selfroles_ideology.setDescription("Choose your Political Ideology by reacting to this message.");
				embed_selfroles_ideology.addFields(
					{name: "Anarchist", value: "🔥", inline:true},
					{name: "Communist", value: "🤐", inline:true},
					{name: "Socialist", value: "📱", inline:true},
					{name: "Democrat", value: "🐎", inline:true},
					{name: "Liberal", value: "⚖️", inline:true},
					{name: "Republican", value: "🐘", inline:true},
					{name: "Environmentalist", value: "🌍", inline:true},
					{name: "Humanist", value: "🧍", inline:true},
					{name: "Facist", value: "👺", inline:true},
				)
			
				msg_channel_send(msg, embed_selfroles_ideology).then(function(msg){
					add_reaction_role(msg, "🔥", "780864978533351494");
					add_reaction_role(msg, "🤐", "780865023639289856");
					add_reaction_role(msg, "📱", "780865058975907930");
					add_reaction_role(msg, "🐎", "780865096900673538");
					add_reaction_role(msg, "⚖️", "780865133026213919");
					add_reaction_role(msg, "🐘", "780865168053764098");
					add_reaction_role(msg, "🌍", "780865210143211532");
					add_reaction_role(msg, "🧍", "780865246180016148");
					add_reaction_role(msg, "👺", "780865281466957864");
				}).catch(err => {
					console_log("Error thrown in selfroles msg_channel_send! " + err, error=true);
				});
			}
		}
		
		// write selfrole IDs to file
		async function selfrole_writer() {
			try {
				await selfroles(msg);
				setTimeout(function(){
					data = reaction_emojis.join(";\n");
					console_log("Selfroles data written to file!");
			
					// write IDs to file
					fs_write.writeFile(selfrole_filename, data, function(err) {
						if (err) {
							return console_log("Failed to write self roles IDs to file", error=true);
						}
					})
				},60*1000);
			} catch (err) {
				console_log("Error thrown in selfrole_writer function! " + err, error=true);
			}
		} selfrole_writer();
		
		
	}
})

// you will need to manually add the reaction IDs
// cache messages
var self_roles_dict = {};

bot.on("ready", msg => {
	// cache channel
	guild = bot.channels.cache.get(selfroles_channel_ID);
	
	// read selfroles file
	fs_read.readFile(selfrole_filename, "utf8", function(err, data) {
		if (err) {
			return console_log("Failed to read selfroles file!", error=true);
		}
		
		// format data
		raw = data.split("\n").join("").split(";");
		for (i=0;i<raw.length;i++) {
			current_line = raw[i].split(",");
			if (current_line.length == 3) {
				if (self_roles_dict[current_line[0]] == undefined) {
					self_roles_dict[current_line[0]] = {};
				} else {
					self_roles_dict[current_line[0]][current_line[1]] = current_line[2];
				}
			}
		}
		console_log("Selfroles files read!");
	})
})

bot.on("messageReactionAdd", async(reaction, user) => {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console_log("error");
		}
	} else {
		// give user role
		if (self_roles_dict[reaction.message.id] != undefined) {
			if (self_roles_dict[reaction.message.id][reaction._emoji.name] != undefined) {
				current_role = self_roles_dict[reaction.message.id][reaction._emoji.name];
				
				channel_guild = bot.channels.cache.get(selfroles_channel_ID);
				channel_guild.guild.members.fetch(user.id).then(function(members) {
					members.guild.members.fetch(user.id).then(function(member) {
						member.roles.add(current_role);
						console_log("Gave " + member.name + " role " + current_role + "!");
					})
				}).catch(err => {
					console_log("Error thrown in message reaction add, give user role! " + err, error=true);
				})
			}
		}
	}
})

bot.on("messageReactionRemove", async(reaction, user) => {
	//remove role from user
	if (self_roles_dict[reaction.message.id] != undefined) {
		if (self_roles_dict[reaction.message.id][reaction._emoji.name] != undefined) {
			current_role = self_roles_dict[reaction.message.id][reaction._emoji.name];
			
			channel_guild = bot.channels.cache.get(selfroles_channel_ID);
			channel_guild.guild.members.fetch(user.id).then(function(members) {
				members.guild.members.fetch(user.id).then(function(member) {
					member.roles.remove(current_role);
					console_log("Removed "+ current_role + " from " + member.name + "!");
				})
			}).catch(err => {
				console_log("Error thrown in message reaction remove, remove role! " + err, error=true);
			});
		}
	}
	
})

// time
US_states = {
'alabama' : 'montgomery','alaska' : 'juneau','arizona' : 'phoenix','arkansas' : 'little rock','california' : 'sacramento','colorado' : 'denver','connecticut' : 'hartford','delaware' : 'dover','florida' : 'tallahassee','georgia' : 'atlanta','hawaii' : 'honolulu','idaho' : 'boise',
'illinois' : 'springfield','indiana' : 'indianapolis','iowa' : 'des moines','kansas' : 'topeka','kentucky' : 'frankfort','louisiana' : 'baton rouge','maine' : 'augusta','maryland' : 'annapolis','massachusetts' : 'boston','michigan' : 'lansing','minnesota' : 'minneapolis','mississippi' : 'jackson',
'missouri' : 'jefferson city','montana' : 'helena','nebraska' : 'lincoln','nevada' : 'carson city','new hampshire' : 'concord','new jersey' : 'trenton','new mexico' : 'santa fe','new york' : 'new york','north carolina' : 'raleigh','north dakota' : 'bismarck','ohio' : 'columbus','oklahoma' : 'oklahoma city',
'oregon' : 'salem','pennsylvania' : 'harrisburg','rhode island' : 'providence','south carolina' : 'columbia','south dakota' : 'pierre','tennessee' : 'nashville','texas' : 'austin','utah' : 'salt lake city','vermont' : 'montpelier','virginia' : 'richmond','washington' : 'olympia',
'west virginia' : 'charleston','wisconsin' : 'madison','wyoming' : 'cheyenne','afghanistan' : 'kabul', 'albania' : 'tirana', 'algeria' : 'algiers', 'andorra' : 'andorra la vella', 'angola' : 'luanda', 'antigua and barbuda' : 'saint john’s', 'argentina' : 'buenos aires', 'armenia' : 'yerevan', 
'australia' : 'canberra', 'austria' : 'vienna', 'azerbaijan' : 'baku', 'the bahamas' : 'nassau', 'bahrain' : 'manama', 'bangladesh' : 'dhaka', 'barbados' : 'bridgetown', 'belarus' : 'minsk', 'belgium' : 'brussels', 'belize' : 'belmopan', 'benin' : 'porto-novo', 'bhutan' : 'thimphu', 
'bolivia' : 'la paz, sucre', 'bosnia and herzegovina' : 'sarajevo', 'botswana' : 'gaborone', 'brazil' : 'brasilia', 'brunei' : 'bandar seri begawan', 'bulgaria' : 'sofia', 'burkina faso' : 'ouagadougou', 'burundi' : 'bujumbura', 'cambodia' : 'phnom penh', 'cameroon' : 'yaounde', 'canada' : 'ottawa', 
'cape verde' : 'praia', 'central african republic' : 'bangui', 'chad' : 'n’djamena', 'chile' : 'santiago', 'china' : 'beijing', 'colombia' : 'bogota', 'comoros' : 'moroni', 'congo, republic of the' : 'brazzaville', 'congo, democratic republic of the' : 'kinshasa', 'costa rica' : 'san jose', 
'cote d’ivoire' : 'yamoussoukro', 'croatia' : 'zagreb', 'cuba' : 'havana', 'cyprus' : 'nicosia', 'czech republic' : 'prague', 'denmark' : 'copenhagen', 'djibouti' : 'djibouti', 'dominica' : 'roseau', 'dominican republic' : 'santo domingo', 'east timor (timor-leste)' : 'dili', 'ecuador' : 'quito', 
'egypt' : 'cairo', 'el salvador' : 'san salvador', 'equatorial guinea' : 'malabo', 'eritrea' : 'asmara', 'estonia' : 'tallinn', 'ethiopia' : 'addis ababa', 'fiji' : 'suva', 'finland' : 'helsinki', 'france' : 'paris', 'gabon' : 'libreville', 'the gambia' : 'banjul', 'georgia' : 'tbilisi', 'germany' : 'berlin', 
'ghana' : 'accra', 'greece' : 'athens', 'grenada' : 'saint george’s', 'guatemala' : 'guatemala city', 'guinea' : 'conakry', 'guinea-bissau' : 'bissau', 'guyana' : 'georgetown', 'haiti' : 'port-au-prince', 'honduras' : 'tegucigalpa', 'hungary' : 'budapest', 'iceland' : 'reykjavik', 'india' : 'new delhi', 
'indonesia' : 'jakarta', 'iran' : 'tehran', 'iraq' : 'baghdad', 'ireland' : 'dublin', 'israel' : 'jerusalem*', 'italy' : 'rome', 'jamaica' : 'kingston', 'japan' : 'tokyo', 'jordan' : 'amman', 'kazakhstan' : 'astana', 'kenya' : 'nairobi', 'kiribati' : 'tarawa atoll', 'korea, north' : 'pyongyang', 'korea, south' : 'seoul', 
'kosovo' : 'pristina', 'kuwait' : 'kuwait city', 'kyrgyzstan' : 'bishkek', 'laos' : 'vientiane', 'latvia' : 'riga', 'lebanon' : 'beirut', 'lesotho' : 'maseru', 'liberia' : 'monrovia', 'libya' : 'tripoli', 'liechtenstein' : 'vaduz', 'lithuania' : 'vilnius', 'luxembourg' : 'luxembourg', 'macedonia' : 'skopje', 
'madagascar' : 'antananarivo', 'malawi' : 'lilongwe', 'malaysia' : 'kuala lumpur', 'maldives' : 'male', 'mali' : 'bamako', 'malta' : 'valletta', 'marshall islands' : 'majuro', 'mauritania' : 'nouakchott', 'mauritius' : 'port louis', 'mexico' : 'mexico city', 'micronesia, federated states of' : 'palikir', 
'moldova' : 'chisinau', 'monaco' : 'monaco', 'mongolia' : 'ulaanbaatar', 'montenegro' : 'podgorica', 'morocco' : 'rabat', 'mozambique' : 'maputo', 'myanmar (burma)' : 'naypyidaw', 'namibia' : 'windhoek', 'nauru' : 'yaren district', 'nepal' : 'kathmandu', 'netherlands' : 'amsterdam', 'new zealand' : 'wellington', 
'nicaragua' : 'managua', 'niger' : 'niamey', 'nigeria' : 'abuja', 'norway' : 'oslo', 'oman' : 'muscat', 'pakistan' : 'islamabad', 'palau' : 'melekeok', 'panama' : 'panama city', 'papua new guinea' : 'port moresby', 'paraguay' : 'asuncion', 'peru' : 'lima', 'philippines' : 'manila', 'poland' : 'warsaw', 
'portugal' : 'lisbon', 'qatar' : 'doha', 'romania' : 'bucharest', 'russia' : 'moscow', 'rwanda' : 'kigali', 'saint kitts and nevis' : 'basseterre', 'saint lucia' : 'castries', 'saint vincent and the grenadines' : 'kingstown', 'samoa' : 'apia', 'san marino' : 'san marino', 'sao tome and principe' : 'sao tome', 
'saudi arabia' : 'riyadh', 'senegal' : 'dakar', 'serbia' : 'belgrade', 'seychelles' : 'victoria', 'sierra leone' : 'freetown', 'singapore' : 'singapore', 'slovakia' : 'bratislava', 'slovenia' : 'ljubljana', 'solomon islands' : 'honiara', 'somalia' : 'mogadishu', 'south africa' : 'cape town', 
'south sudan' : 'juba', 'spain' : 'madrid', 'sri lanka' : 'colombo, sri jayewardenepura kotte', 'sudan' : 'khartoum', 'suriname' : 'paramaribo', 'swaziland' : 'mbabane', 'sweden' : 'stockholm', 'switzerland' : 'bern', 'syria' : 'damascus', 'taiwan' : 'taipei', 'tajikistan' : 'dushanbe', 'tanzania' : 'dodoma', 
'thailand' : 'bangkok', 'togo' : 'lome', 'tonga' : 'nuku alofa', 'trinidad and tobago' : 'port-of-spain', 'tunisia' : 'tunis', 'turkey' : 'ankara', 'turkmenistan' : 'ashgabat', 'tuvalu' : 'funafuti', 'uganda' : 'kampala', 'ukraine' : 'kyiv', 'united arab emirates' : 'abu dhabi', 'united kingdom' : 'london', 
'united states of america' : 'seattle', 'america' : 'seattle', 'us' : 'seattle', 'uruguay' : 'montevideo', 'uzbekistan' : 'tashkent', 'vanuatu' : 'port-vila', 'venezuela' : 'caracas', 'vietnam' : 'hanoi', 'yemen' : 'sanaa', 'zambia' : 'lusaka', 'zimbabwe' : 'harare', 'uk' : 'london',
};

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"time " || 
		msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"timezone ") {
			is_US_state = false;
			
			// get city
			if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"timezone ") {
				city = msg.content.slice(10, msg.content.length).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			} else {
				city = msg.content.slice(6, msg.content.length).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			}
			
			if (US_states[city.toLowerCase()] != undefined) {
				city = US_states[city.toLowerCase()];
				is_US_state = true;
			}
			
			timezone = cityTimezones.lookupViaCity(city);
			if (timezone.length > 0) {
				if (timezone.length > 1) {
					for (i=0;i<timezone.length;i++) {
						if (timezone[i]["timezone"].indexOf(timezone[i]["city"].split(" ").join("_")) > -1) {
							timezone_name = [timezone[i]["timezone"]];
							city_name = timezone[i]["city"];
							info_dict = timezone[i];
						}
					}
				} else {
					timezone_name = [timezone[0]["timezone"]];
					city_name = timezone[0]["city"];
					info_dict = timezone[0];
				}
			
				time = new Intl.DateTimeFormat([], {
					timeZone: timezone_name,
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric',
				}).format(new Date());
			
				dateF = time.split(", ")[0];
				timeF = time.split(",")[1];
			
				// embed
				embed_time = new Discord.MessageEmbed();
				embed_time.setColor(embed_color_chat);
				
				if (is_US_state == true) {
					if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"timezone ") {
						city = msg.content.slice(10, msg.content.length);
					} else {
						city = msg.content.slice(6, msg.content.length);
					}
					embed_time.setTitle("Time in " + city[0].toUpperCase() + city.slice(1, city.length));
				} else {
					embed_time.setTitle("Time in " + city_name);
				}
				
				embed_time.setDescription("The current time in " + city_name + " is " + timeF + " on the " + dateF);
				embed_time.addFields(
					{name: timeF+"\u200B", value: dateF+"\u200B"},
					{name: "City", value: info_dict["city"]+"\n\u200B", inline:true},
					{name: "Country", value: info_dict["country"]+"\n\u200B", inline:true},
					{name: "\u200B", value: "\u200B", inline:true},
					{name: "latitude", value: info_dict["lat"]+"\u200B", inline:true},
					{name: "longitude", value: info_dict["lng"]+"\u200B", inline:true},
					{name: "ISO", value: info_dict["iso3"] + "("+info_dict["iso2"]+")\u200B", inline:true},
					{name: "Province", value: info_dict["province"]+"\u200B", inline:true},
					{name: "State", value: String(info_dict["state_ansi"]+"\u200B").replace("undefined", "-"), inline:true},
					{name: "Timezone", value: info_dict["timezone"]+"\u200B", inline:true},
				)
				
				console_log("Time in " + info_dict["city"] + " fetched!");
				embed_time.setTimestamp();
				embed_time.setFooter(info_dict["iso3"]);
				msg_channel_send(msg, embed_time);
			} else {
				embed_error(msg, "Unable to find the specified city, please make sure you spelt it correctly, " +
				"the format for the command is `"+prefix[msg.guild.id]+"time {city}`, for example `"+prefix[msg.guild.id]+"time London` will show the current time in London UK!");
			}
		}
	}
})

// weather
days_of_week = {"Mon" : "Monday", "Tue" : "Tuesday", "Wed" : "Wednesday", "Thu" : "Thursday", "Fri" : "Friday", "Sat" : "Saturday", "Sun" : "Sunday"};

function remove_tags(elm) {
	txt = [];
	for (i=1;i<elm.split("<").length+1;i++) {
		current = elm.split("<")[i]
		if (current != undefined) {
			txt.push(current.split(">")[1]);
		}
	}
	return txt.join("").replace(/&thinsp;/g,"").replace(/&deg;/g, "°").replace(/  /g," ").replace(/&ndash;/g, "-");
}

function weather_get_elem(html, index) {
	// catch error
	function e(elms) {
		try {
			current_elm = html;
			for (n=0;n<elms.length;n++) {
				current_elm = current_elm.split(elms[n][0])[elms[n][1]];
			}
			current_elm = current_elm.replace("partially cloudy", "⛅").replace("cloudy", "☁️").replace("clear", "☀️").replace("Night", "🌙");
			current_elm = current_elm.replace("Low", "⬇️").replace("None", "↔️").replace("Snow", "❄️").replace("snow showers", "🌨️").replace(/">/g,"");
			current_elm = current_elm.replace("light rain", "🌧️");
			if (current_elm.indexOf("⛅") > -1 || current_elm.indexOf("☀️") > -1 || current_elm.indexOf("a") > -1) {
				return current_elm;
			} else if (days_of_week[current_elm] != undefined) {
				return days_of_week[current_elm];
			} else {
				return ("  " + current_elm).slice(-2);
			}
		} catch {
			return " -";
		}
	}
	
	// return dict;
	return {
		"cloudy" : e([['<th class="b-forecast__table-header', 1], ['<td class="b-forecast__table-weather-cell', index], ['<img alt="', 1], ['" src', 0, true]]),
		"wind" : e([['<th class="b-forecast__table-header', 2], ['<text class="wind-icon-val"', index], ['data-precise="', 1], ['"', 0]]),
		"map" : "https://" + e([['<div class="b-forecast__table-maps-container"', 1], ['</div>', 0], ['url(https://', 1], [')', 0]]),
		"rain" : e([['<span class="rain b-forecast__table-value', index], ['</span>', 0]]),
		"snow" : e([['<span class="snow b-forecast__table-value', index], ['</span>', 0]]),
		"temp_high" : e([['<span class="temp b-forecast__table-value', index], ['</span>', 0]]),
		"temp_low" : e([['<div class="b-forecast__table-header-value">Low', 1], ['<span class="temp b-forecast__table-value">', index], ['</span>', 0]]),
		"chill" : e([['<div class="b-forecast__table-header-value">Chill', 1], ['<span class="temp b-forecast__table-value">', index], ['</span>', 0]]),
		"humidity" : e([['<span class="b-forecast__table-header-units">%', 1], ['<span class="b-forecast__table-value">', index], ['</span>', 0]]),
		"uv" : e([['<div class="b-forecast__table-header-value b-forecast__table-float">UV', 1], ['<span class="b-forecast__table-value">', index], ['</span>', 0]]),
		"am_pm" : e([['<tr class="b-forecast__table-time js-daytimes">', 1], ['</tr>', 0], ['<span class="b-forecast__table-value">', index], ['</span>', 0]]),
		"day" : e([['<div class="b-forecast__table-days-name', parseInt((index-1) / 3)+1], ['</div>', 0]]),
	}
}

function weather_week_embed(msg, html) {
	// HTML
	title = html.split('<h1 class="main-title__header">')[1].split("</span>")[0].split(">")[1];
	description = remove_tags(html.split('<p class="large-loc">')[1].split("</p>")[0]);
	description_title = remove_tags(html.split('<div class="b-forecast__table-description-title">')[1].split("</div>")[0]);
	weather_description = remove_tags(html.split('<p class="b-forecast__table-description-content">')[1].split("</span>")[0]);
	
	// when does day 2 start
	day1_p1 = weather_get_elem(html, 1);
	day2_start = {"AM" : 4, "PM" : 3, "N" : 2}[day1_p1["am_pm"]];
	
	// embed
	embed_weather = new Discord.MessageEmbed();
	embed_weather.setColor(embed_color_chat);
	embed_weather.setTitle(description_title);
	embed_weather.setDescription(description + "\n\u200B\n" + weather_description);
	
	// week days
	for (x=0;x<6;x++) {
		AM = weather_get_elem(html, day2_start + (x*3) + 0);
		PM = weather_get_elem(html, day2_start + (x*3) + 1);
		Night = weather_get_elem(html, day2_start + (x*3) + 2);
		
		// current day data
		embed_weather.addField(AM["day"], "`       " + AM["am_pm"] + " " + PM["am_pm"] + " " + Night["am_pm"] + "\n" +
			"Cloud: " + AM["cloudy"] + " " + PM["cloudy"] + " " + Night["cloudy"] + "\n" +
			" Wind: " + AM["wind"] + " " + PM["wind"] + " " + Night["wind"] + "\n" +
			" Rain: " + AM["rain"] + " " + PM["rain"] + " " + Night["rain"] + "\n" +
			" Snow: " + AM["snow"] + " " + PM["snow"] + " " + Night["snow"] + "\n" +
			" High: " + AM["temp_high"] + " " + PM["temp_high"] + " " + Night["temp_high"] + "\n" +
			"  Low: " + AM["temp_low"] + " " + PM["temp_low"] + " " + Night["temp_low"] + "\n" +
			" Chil: " + AM["chill"] + " " + PM["chill"] + " " + Night["chill"] + "\n" +
			"Humid: " + AM["uv"] + " " + PM["uv"] + " " + Night["uv"] + "`\n\u200B", 
		true);
	}
	
	// send message
	embed_weather.setTimestamp();
	msg_channel_send(msg, embed_weather);
	
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"weather ") {
			// URL
			command = msg.content.slice(9, msg.content.length);
			if (US_states[command] != undefined) {
				command = US_states[command].replace(/ /g, "-");
			} else {
				command = command.replace(/ /g, "-");
			}
			
			url = "https://www.weather-forecast.com/locations/" +command+ "/forecasts/latest";
			
			// get html
			request(url, {
				headers: {
					"User-Agent": user_agent
				},
				body: "",
				method: "GET"
			}, (err, res, html) => {
				if (res.statusCode == 200) {
					// Process Week
					weather_week_embed(msg, html);
					
				} else if (res.statusCode == 404) {
					embed_error(msg, "Could not find the city! Please make sure you entered the name correctly!");
				} else {
					console_log("Error status code " + res.statusCode + " in weather!", error=true);
				}
			})
		}
	}
})

// yes or no questions
bot.on("message", msg=> {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,5).toLowerCase() === prefix[msg.guild.id]+"say " || msg.content.slice(0, 8) == prefix[msg.guild.id]+"repeat ") {
			embed_say = new Discord.MessageEmbed();
			embed_say.setColor(embed_color_chat);
			if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"say ") {
				embed_say.setDescription(msg.content.slice(4, msg.content.length));
			} else {
				embed_say.setDescription(msg.content.slice(8, msg.content.length));
			}
			embed_say.setAuthor("JaredBot", webserver_root_address+"img/lion.png", "");
			embed_say.setTimestamp();
			msg_channel_send(msg, embed_say);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,8).toLowerCase() === prefix[msg.guild.id]+"do you " || msg.content.slice(0,6) === prefix[msg.guild.id]+"do u ") {
			embed_chat_reply(msg, ["Yes", "No"][parseInt(Math.random() * 100) % 2]);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,4).toLowerCase() == prefix[msg.guild.id]+"is ") {
			embed_chat_reply(msg, ["Yes", "No"][parseInt(Math.random() * 100) % 2]);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,8).toLowerCase() == prefix[msg.guild.id]+"should ") {
			embed_chat_reply(msg, ["Yes", "No"][parseInt(Math.random() * 100) % 2]);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,8).toLowerCase() === prefix[msg.guild.id]+"howgay " || msg.content === prefix[msg.guild.id]+"howgay"
		|| msg.content.slice(0, 4).toLowerCase() === prefix[msg.guild.id]+"gay") {
			if (msg.content === prefix[msg.guild.id]+"howgay") {
				embed_chat_reply_header(msg, "You are " + String(parseInt(Math.random()*100)) + "% gay!", "Gay Detector", pfp=false);
			} else {
				name = msg.content.replace(" is "," ").split(" ")[1];
				embed_chat_reply_header(msg, name + " is " + String(parseInt(Math.random()*100)) + "% gay!", "Gay Detector", pfp=false);
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,6).toLowerCase() === prefix[msg.guild.id]+"will ") {
			embed_chat_reply(msg, ["Yes", "No"][parseInt(Math.random() * 100) % 2]);
		}
	}
})

// 8 ball
answers = ["As I see it, yes.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", 
"Concentrate and ask again.", "Don’t count on it.", "It is certain.", "It is decidedly so.", 
"Most likely.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Outlook good.", 
"Reply hazy, try again.", "Signs point to yes.", "Very doubtful.", "Without a doubt.", "Yes.", 
"Yes – definitely.", "You may rely on it."];

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7) == prefix[msg.guild.id]+"8ball ") {
			question = msg.content.slice(7, msg.content.length);
			embed_chat_reply(msg, answers[parseInt(Math.random() * 100) % answers.length]);
		}
	}
})

// owo
function help_owo(msg) {
	try {
		embed_owo = new Discord.MessageEmbed();
		embed_owo.setColor(embed_color_chat); //\n\u200B
		embed_owo.setTitle("Help OwO");
		embed_owo.setAuthor("JaredBot | Command list", lion_profile_pic);
		embed_owo.setThumbnail(lion_profile_pic);
		embed_owo.addFields(
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo bite`\n`"+prefix[msg.guild.id]+"owo blush`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo boop`\n`"+prefix[msg.guild.id]+"owo bully`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo cry`\n`"+prefix[msg.guild.id]+"owo cuddle`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo dance`\n`"+prefix[msg.guild.id]+"owo greet`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo grin`\n`"+prefix[msg.guild.id]+"owo handholding`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo happy`\n`"+prefix[msg.guild.id]+"owo highfive`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo hold`\n`"+prefix[msg.guild.id]+"owo hug`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo kill`\n`"+prefix[msg.guild.id]+"owo kiss`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo lewd`\n`"+prefix[msg.guild.id]+"owo lick`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo nom`\n`"+prefix[msg.guild.id]+"owo pat`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo poke`\n`"+prefix[msg.guild.id]+"owo pout`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo punch`\n`"+prefix[msg.guild.id]+"owo scoff`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo shrug`\n`"+prefix[msg.guild.id]+"owo thinking`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo smile`\n`"+prefix[msg.guild.id]+"owo smug`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo thumbs`\n`"+prefix[msg.guild.id]+"owo thumbsup`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo slap`\n`"+prefix[msg.guild.id]+"owo sleepy`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo snuggle`\n`"+prefix[msg.guild.id]+"owo stare`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo tickle`\n`"+prefix[msg.guild.id]+"owo triggered`", inline: true},
			{name: "\u200B", value: "`"+prefix[msg.guild.id]+"owo wag`\n`"+prefix[msg.guild.id]+"owo wave`\n\u200B", inline: true},
		)
		embed_owo.setTimestamp();
		msg_channel_send(msg, embed_owo);
	} catch (err) {
		console_log("Error thrown in help_owo function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"owo ") {
			command = msg.content.slice(5, msg.content.length).toLowerCase().split(" ")[0];
			owo_datset = {
				"bite" : 1115, "blush" : 1111, "boop" : 1121, "bully" : 1121, "cry" : 974, "cuddle" : 1087, "dance" : 1115, "greet" : 1101,
				"grin" : 1110, "handholding" : 1003, "happy" : 991, "highfive" : 841, "hold" : 1115, "hug" : 1091, "kill" : 1122, "kiss" : 1051,
				"lewd" : 740, "lick" : 1113, "nom" : 1120, "pat" : 853, "poke" : 1116, "pout" : 1119, "punch" : 1119, "scoff" : 1103, "shrug" : 1017,
				"slap" : 959, "sleepy" : 1010, "smile" : 1114, "smug" : 1061, "snuggle" : 1097, "stare" : 1113, "thinking" : 1122, "thumbs" : 943,
				"thumbsup" : 1113, "tickle" : 9, "triggered" : 1042, "wag" : 1100, "wave" : 1119
			}
			
			if (Object.keys(owo_datset).indexOf(command) > -1) {
				file_name = ("00000" + (parseInt(Math.random() * 1000) % owo_datset[command])).slice(-5) + ".gif";
				embed_image(msg, webserver_owo_dataset + "/" + command + "/" + file_name, command);
				console_log("owo image sent to " + msg.guild.id);
			}
		}
	}
})

// hug
bot.on("message", msg => {
	if (msg.guild != null && msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"hug") {
		let member = msg.mentions.members.first();
		if (member != undefined) {
			user_receiver = member.user.tag.split("#")[0];
			user_sender = msg.member.user.tag.split("#")[0];
			get_photo_name("hug", function(file_name) {
				hug_url = webserver_src_hug + "/" + file_name + ".gif";
				embed_image_header(msg, hug_url, user_sender + " hugged " + user_receiver, "");
				console_log("hug hig sent to server " + msg.guild.id);
			})
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"hug") {
			embed_info_reply(msg, "You can't hug yourself lol :/");
		} else {
			embed_info_reply(msg, "receiving user couldn't be found");
		}
	}
})

// kiss
bot.on("message", msg => {
	if (msg.guild != null && msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"kiss") {
		let member = msg.mentions.members.first();
		if (member != undefined) {
			user_receiver = member.user.tag.split("#")[0];
			user_sender = msg.member.user.tag.split("#")[0];
			get_photo_name("kiss", function(file_name) {
				kiss_url = webserver_src_kiss + "/" + file_name + ".gif";
				embed_image_header(msg, kiss_url, user_sender + " kissed " + user_receiver, "");
				console_log("kiss gif sent to server " + msg.guild.id);
			})
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"kiss") {
			embed_info_reply(msg, "You can't kiss yourself lol :/");
		} else {
			embed_info_reply(msg, "receiving user couldn't be found");
		}
	}
})

// --- Auto Post ---
var meme_intervals = {};
var photo_intervals = {};
var bird_intervals = {};
var car_intervals = {};
var cat_intervals = {};
var dog_intervals = {};
var snake_intervals = {};
var porngif_intervals = {};
var anime_intervals = {};
var video_intervals = {};
var mars_intervals = {};

const autopost_filetypes = {
	"memes" : ".png", 
	"photography" : ".png", 
	"Birds" : ".png",
	"Cars" : ".png", 
	"Cats" : ".png", 
	"Dogs" : ".png", 
	"Snakes" : ".png", 
}

function post_auto_image(channel_file, webserver_dataset, database_count, dataset_description, intervals, nsfw, custom_func=undefined) {
	try {
		if (enable_auto_henati == true) {
			// check each authorised server ID
			for (i=0;i<authrosied_server_IDs.length;i++) {
				// get server name
				current_server_name2 = bot.guilds.cache.get(authrosied_server_IDs[i])
				if (current_server_name2 != undefined && current_server_name2.name != undefined) {
					current_server_name2 = current_server_name2.name.replace(" ","_")+"_"+ current_server_name2.id;
					// get directory
					hen_path = logging_path + "/" + current_server_name2 + "/" + channel_file;
					if (fs_read.existsSync(hen_path) == true) {
						// file exists for current server
						// read output file
						fs_read.readFile(hen_path, "utf8", function(err, data) {
							if (err) {
								return console_log("Failed to read output file in autopost image function!", error=true);
							}
							// raw data
							hentai_raw_data = [];
							hentai_raw = data.split("\n").join("").split(";");
							for (i=0;i<hentai_raw.length;i++) {
								if (hentai_raw[i] != "") {
									if (isInt_without_error(hentai_raw[i].split(",")[0], 0, 10**20) == true) {
										hentai_raw_data.push(hentai_raw[i]);
									}
								}
							}
				
							// get ID
							if (data != "") {
								for (i=0;i<hentai_raw_data.length;i++) {
									hentai_current_ID = hentai_raw_data[i].split(",")[0];
									hentai_current_length = hentai_raw_data[i].split(",")[1];
									if (hentai_current_ID != "") {
										console_log("Set Auto"+dataset_description+" Interval for " + hentai_current_ID + "!");
										intervals[hentai_current_ID] = setInterval(function(hentai_current_ID) {
											// send random image
											if (autopost_filetypes[dataset_description] != undefined) {
												get_photo_name(database_count, function(file_name) {
													hentai_fname = "/" + file_name + autopost_filetypes[dataset_description];
												})
											} else {
												get_photo_name(database_count, function(file_name) {
													hentai_fname = "/" + file_name + ".png";
												})
											}
											current_hentai_channel = bot.channels.cache.get(hentai_current_ID);
											console_log("Auto"+dataset_description+" posted in "+hentai_current_ID+"!");
											if (custom_func != undefined) {
												custom_func(current_hentai_channel, guild="channel");
											} else {
												embed_image(current_hentai_channel, webserver_dataset + "/" + hentai_fname, dataset_description, guild="channel");
											}
										}, 1000*60*parseInt(hentai_current_length), hentai_current_ID);
									}
								}
							}
						})
					}
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in post_auto_image function! " + err, error=true);
	}
} 

function auto_post_timeout(channel_file, webserver_dataset, database_count, dataset_description, intervals, timeout, nsfw, custom_func=undefined) {
	try {
		setTimeout(function() {
			post_auto_image(channel_file, webserver_dataset, database_count, dataset_description, intervals, nsfw, custom_func);
			console_log("autopost " + dataset_description + " timeoutset!");
		}, timeout*1000, channel_file, webserver_dataset, database_count, dataset_description, intervals);
	} catch (err) {
		console_log("Error thrown in auto_post_timeout function! " + err, error=true);
	}
}

bot.on("ready", msg => {
	setTimeout(function(){
		// SFW
		auto_post_timeout(igmemes_channel_file, webserver_igmemes_dataset, dataset_counts["igmemes"], "Meme", meme_intervals, 5, nsfw=false);
		auto_post_timeout(photography_channel_file, webserver_photography_dataset, dataset_counts["photography"], "Photography", photo_intervals, 5, nsfw=false);
		auto_post_timeout(bird_channel_file, webserver_bird_dataset, dataset_counts["birds"], "Birds", bird_intervals, 5, nsfw=false);
		auto_post_timeout(car_channel_filename, webserver_cars_dataset, dataset_counts["cars"], "Cars", car_intervals, 5, nsfw=false);
		auto_post_timeout(cat_channel_filename, webserver_cats_dataset, dataset_counts["cats"], "Cats", cat_intervals, 5, nsfw=false);
		auto_post_timeout(dog_channel_filename, webserver_dogs_dataset, dataset_counts["dogs"], "Dogs", dog_intervals, 5, nsfw=false);
		auto_post_timeout(snake_channel_filename, webserver_snake_dataset, dataset_counts["snakes"], "Snakes", snake_intervals, 5, nsfw=false);
		auto_post_timeout(anime_channel_filename, webserver_anime_dataset, dataset_counts["anime"], "Anime", anime_intervals, 5, nsfw=false);
		auto_post_timeout(video_channel_filename, webserver_video_dataset, dataset_counts["video"], "Video", video_intervals, 5, nsfw=false, custom_func=post_video);
		console_log("Autopost timeouts set!");
	}, autopost_init_timeout);
})

// configure channel to post images automatically
function configure_autopost(msg, commands, description, intervals, channel_file, webserver_dataset, database_count, nsfw=true, custom_func=undefined) {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content.slice(0, commands.length+1) == prefix[msg.guild.id]+commands) {
				if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
					if (msg.channel.nsfw == nsfw) {
						command = msg.content.slice(commands.length+1, commands.length+4);
						if (command == "on ") {
							autohenati_mins = msg.content.slice(commands.length+command.length, msg.content.length);
							ErrorMessageEnd = "The correct syntax for the command is `"+prefix[msg.guild.id]+"auto"+description+" on {length}` for example `"+prefix[msg.guild.id]+"auto"+description+" on 10` will post a new "+description+" photo every 10 mins!";
							if (isInt(msg, autohenati_mins, 1, 1440, "length", ErrorMessageEnd) == true) {
								create_file_then_append_data(msg, channel_file, msg.channel.id + "," + autohenati_mins + ";", endl="");
								embed_info_reply(msg, "Auto"+description+" has been enabled, "+(description+"s").replace("ss","s")+" will be posted every " + autohenati_mins + " mins! You can type `"+prefix[msg.guild.id]+"auto"+description+" off` to clear any Auto"+description+" rules!");
								console_log("Auto"+description+" has been enabled for server " + msg.guild.id, error=false, mod=true);
							
								// timeout
								console_log("Auto"+description+" Interval set for " + msg.channel.id);
								intervals[msg.channel.id] = setInterval(function() {
									// send random hentai image
									get_photo_name(database_count, function(file_name) {
										hentai_fname = file_name + ".png";
										current_hentai_channel = bot.channels.cache.get(msg.channel.id);
										if (custom_func != undefined) {
											custom_func(current_hentai_channel, guild="channel");
										} else {
											embed_image(current_hentai_channel, webserver_dataset + "/" + hentai_fname, description, guild="channel");
										}
										console_log("Autohentai image sent to server " + msg.guild.id);
									})
								}, 1000*60*parseInt(autohenati_mins), msg.channel.id);
							
							}
						} else if (command == "off") {
							// get directory
							current_server_name3 = get_server_name(msg);
							hentai_path3 = logging_path + "/" + current_server_name3 + "/" + channel_file;
						
							// stop interval for all channels on server
							async function stop_hentai_interval() {
								fs_read.readFile(hentai_path3, "utf-8", function(err, data) {
									if (err) {
										return console_log("Failed to read hentai channel file!", error=true);
									}
							
									// raw data
									hentai_raw2 = data.split("\n").join("").split(";");
									for (i=0;i<hentai_raw2.length;i++) {
										if (hentai_raw2[i] != "") {
											clear_current_interval = hentai_raw2[i].split(",")[0];
											if (isInt_without_error(clear_current_interval, 0, 10**20) == true) {
												if (intervals[clear_current_interval] != undefined) {
													clearInterval(intervals[clear_current_interval]);
													console_log("Auto"+description+" Interval " + clear_current_interval + " cleared!");
												}
											}
										}
									}
								})
							}
						
							// clear file
							async function clear_hentai_rules() {
								await stop_hentai_interval();
								setTimeout(function(){
									fs_write.writeFile(hentai_path3, "", function(err) {
										if (err) {
											return console_log("Failed to clear file in autopost function!", error=true);
										}
										embed_info_reply(msg, "All Auto"+description+" rules cleared for your server!");
										console_log("All Auto"+description+" rules cleared for server " + msg.guild.id);
									})
								}, autohentai_clear_delay);
							} clear_hentai_rules();
						
						} else {
							embed_error(msg, "Invalid Input, the syntax for the command is `"+prefix[msg.guild.id]+"auto"+description+" on {length}` for example `"+prefix[msg.guild.id]+"auto"+description+
							" 5` will post a meme every 5 mins. To turn off auto"+description+" you can type `"+prefix[msg.guild.id]+"auto"+description+" off`.")
						}
					} else {
						embed_error(msg, "This command can only be used in NSFW channels!");
					}
				} else {
					embed_error(msg, "You dont have permission to use this command, " + mod_error_text + "Manage Channels permission!");
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in configure_autopost function! " + err, error=true);
	}
}

// autopost commands
function check_autopost(msg, command, description, interval, channel_file, dataset, dataset_count, nsfw=false) {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, command.length+1) == prefix[msg.guild.id]+command) {
			configure_autopost(msg, command, description, interval, channel_file, dataset, dataset_count, nsfw);
		}
	}
}

bot.on("message", msg => {
	// autopost SFW
	check_autopost(msg, "automeme ", "Meme", meme_intervals, igmemes_channel_file, webserver_memes_dataset, dataset_counts["memes"], nsfw=false);
	check_autopost(msg, "autophoto ", "Photography", photo_intervals, photography_channel_file, webserver_photography_dataset, dataset_counts["photography"], nsfw=false);
	check_autopost(msg, "autobird ", "Birds", bird_intervals, bird_channel_file, webserver_bird_dataset, dataset_counts["birds"], nsfw=false);
	check_autopost(msg, "autocar ", "Cars", car_intervals, car_channel_filename, webserver_cars_dataset, dataset_counts["cars"], nsfw=false);
	check_autopost(msg, "autocat ", "Cats", cat_intervals, cat_channel_filename, webserver_cats_dataset, dataset_counts["cats"], nsfw=false);
	check_autopost(msg, "autodog ", "Dogs", dog_intervals, dog_channel_filename, webserver_dogs_dataset, dataset_counts["dogs"], nsfw=false);
	check_autopost(msg, "autosnake ", "Snakes", snake_intervals, snake_channel_filename, webserver_snake_dataset, dataset_counts["snakes"], nsfw=false);
	check_autopost(msg, "autoanime ", "anime", anime_intervals, anime_channel_filename, webserver_anime_dataset, dataset_counts["anime"], nsfw=false);
	check_autopost(msg, "autovideo ", "video", video_intervals, video_channel_filename, webserver_video_dataset, dataset_counts["video"], nsfw=false, custom_func=post_video);
	check_autopost(msg, "automars ", "mars", mars_intervals, mars_channel_filename, webserver_mars_dataset, dataset_counts["mars"], nsfw=false);
})

function autopost_help(msg) {
	try {
		embed_autocommands_help = new Discord.MessageEmbed();
		embed_autocommands_help.setColor(embed_colour_info);
		embed_autocommands_help.setTitle("Auto Image Commands Help");
		embed_autocommands_help.setThumbnail(lion_profile_pic);
		embed_autocommands_help.setDescription("For a list of autopost NSFW commands type `"+prefix[msg.guild.id]+"autonsfw`!");
		embed_autocommands_help.addFields(
			{name: "AutoMeme", value: "`"+prefix[msg.guild.id]+"help automeme`.\n\u200B", inline:true},
			{name: "AutoPhoto", value: "`"+prefix[msg.guild.id]+"help autophoto`.\n\u200B", inline:true},
			{name: "AutoCar", value: "`"+prefix[msg.guild.id]+"help autocar`.\n\u200B", inline:true},
			{name: "AutoBird", value: "`"+prefix[msg.guild.id]+"help autobird`.\n\u200B", inline:true},
			{name: "AutoCat", value: "`"+prefix[msg.guild.id]+"help autocat`.\n\u200B", inline:true},
			{name: "AutoDog", value: "`"+prefix[msg.guild.id]+"help autodog`.\n\u200B", inline:true},
			{name: "AutoSnake", value: "`"+prefix[msg.guild.id]+"help autosnake`.\n\u200B", inline:true},
			{name: "AutoAnime", value: "`"+prefix[msg.guild.id]+"help autoanime`.\n\u200B", inline: true},
			{name: "AutoVideo", value: "`"+prefix[msg.guild.id]+"help autovideo`.\n\u200B", inline: true},
			{name: "AutoMars", value: "`"+prefix[msg.guild.id]+"help automars`.\n\u200B", inline: true}
		)
			
		embed_autocommands_help.setTimestamp();
		msg_channel_send(msg, embed_autocommands_help);
	} catch (err) {
		console_log("Error thrown in autopost_help function! " + err, error=true);
	}
}

// execute
const execute_input_check = {};
const python_input_codeblock = `
# input function added to beginning of file
def input(*args):
    # check if modules imported
    modules = ["time", "hashlib"]
    for mod in modules:
        if mod not in locals():
            import time, hashlib

    # read the files contents
    try:
        # get initial hashs
        file_contents = open("`+inputs_file_execute+`", "rb").read()
        first_hash = hashlib.md5(file_contents).hexdigest()
        current_hash = hashlib.md5(file_contents).hexdigest()
        
        # loop until file contents changes
        while first_hash == current_hash:
            time.sleep(0.1)
            file_contents = open("`+inputs_file_execute+`", "rb").read()
            current_hash = hashlib.md5(file_contents).hexdigest()

        # return the files contents and resume execuation of script
        return file_contents.decode("utf-8")
    
    # the file cant be read for some reason so return an empty string
    except Exception as error:
        open("`+inputs_file_execute+`", "w")
        with open("execute_error.txt", "w") as file_error:
            file_error.write(str(error))
        return ""

# the users code
`;

function check_harmful_code(code) {
	trust_modules = ["datetime", "math", "random", "hashlib", "time", "getpass", "socket", "urllib", "requests"];
	dangerious_keywords = ["exec", "eval", "compile", "open", "builtins", ".os", "globals", "os.", 
		"locals", "breakpoint", "dir", "delattr", "getattr", "repr", "vars"];
	
	// import
	code_lines = code.split('\n');
	for (i=0;i<code_lines.length;i++) {
		if (code_lines[i].indexOf('import') > -1) {
			line = code_lines[i].replace('import', '').replace(/ /g, '').split(',');
			
			// check each import line
			for (x=0;x<line.length;x++) {
				// check if module in trusted modules list
				if (trust_modules.indexOf(line[x]) == -1) {
					return [false, "Attempted to load untrusted module!"];
				}
			}
		}
	}
	
	// check dangerious keywords
	for (i=0;i<dangerious_keywords.length;i++) {
		if (code.indexOf(dangerious_keywords[i]) > -1) {
			return [false, dangerious_keywords[i] + " is not allowed!"];
		}
		
	}
	
	// check for builtins
	words = code.split(".");
	for (i=0;i<words.length;i++) {
		if (words[i].slice(0, 2) == "__" || words[i].slice(words[i].length-2, words[i].length) == "__") {
			return [false, "Builtins are not allowed! You cannot use "+words[i]+"!"];
		}
	}
	
	// time.sleep
	sleep_lines = code.split('time.sleep(');
	for (i=0;i<sleep_lines.length;i++) {
		current_num = sleep_lines[i].split(')')[0].split('.')[0];
		if (isInt_without_error(current_num, 0, large_numb) == true) {
			if (current_num > 1) {
				return [false, "time.sleep delay too long!"];
			}
		} else if (current_num[0] == '-') {
			return [false, "You can't have a negative time.sleep delay!"];
		}
	}
	
	// code is safe return true
	return [true, ""];
}

function check_input(msg, code) {
	// input
	if (code.indexOf("input") > -1) {
		// add code block to beginning of execute.py
		execute_input_check[msg.guild.id] = [true, msg.channel.id];
		new_code = python_input_codeblock +"\n"+ code;
		return new_code;
		
	} else {
		return code;
	}
}

function check_harmful_code_js(code) {
	dangerious_keywords = ["require", "request", "fs", "exec", "child_process", "module", "process", "eval", "import"];
	
	for (i=0;i<dangerious_keywords.length;i++) {
		if (code.indexOf(dangerious_keywords[i]) > -1) {
			return [false, dangerious_keywords[i] + " is not allowed!"];
		}
	}
	return [true, ""];
}

function check_harmful_code_cpp(code) {
	trust_modules = ["<iostream>", "<vector>", "<string>"];
	dangerious_keywords = ["system", "cin", "__"];
	
	// include
	code_lines = code.split('\n');
	for (i=0;i<code_lines.length;i++) {
		if (code_lines[i].indexOf('#include') > -1) {
			line = code_lines[i].replace('#include', '').replace(/ /g, '').split(',');
			
			// check each include line
			for (x=0;x<line.length;x++) {
				// check if module in trusted modules list
				if (trust_modules.indexOf(line[x]) == -1) {
					return [false, "Attempted to load untrusted module!"];
				}
			}
		}
	}
	
	// check dangerious keywords
	for (i=0;i<dangerious_keywords.length;i++) {
		if (code.indexOf(dangerious_keywords[i]) > -1) {
			return [false, dangerious_keywords[i] + " is not allowed!"];
		}
		
	}
	
	// to be added
	return [true, ""];
}

function embed_execute_output(msg, input_code, output, lan) {
	// check for blank output
	if (output.length == 0) {
		output += "\u200B";
	}
	
	//send message
	embed_execute = new Discord.MessageEmbed();
	if (lan == "javascript") {
		embed_execute.setTitle("JavaScript Output");
		embed_execute.setURL("https://en.wikipedia.org/wiki/JavaScript"); // set this to URL of the message
		embed_execute.setDescription("This is the output from JavaScript terminal");
		embed_execute.setColor(embed_color_chat);
		input_code = "```js\n" + input_code + "```";
		output = "```js\n" + output + "```";
	} else if (lan == "g++") {
		embed_execute.setTitle("G++ Compiler Error");
		embed_execute.setURL("https://en.wikipedia.org/wiki/C%2B%2B");
		embed_execute.setDescription("The g++.exe compiler threw an error while trying to compile the C++ code!");
		embed_execute.setColor(embed_colour_error);
		input_code = "```c++\n" + input_code + "```";
		output = "```c++\n" + output.split('-static-libstdc++')[1] + "```";
	} else if (lan == "c++") {
		embed_execute.setTitle("C++ Output");
		embed_execute.setURL("https://en.wikipedia.org/wiki/C%2B%2B");
		embed_execute.setDescription("This is the output from C++ exe file!");
		embed_execute.setColor(embed_color_chat);
		input_code = "```c++\n" + input_code + "```";
		output = "```c++\n" + output + "```";
	} else {
		embed_execute.setTitle("Python Output");
		embed_execute.setURL("https://www.python.org/"); // set this to URL of the message
		embed_execute.setDescription("This is the output from Python terminal");
		embed_execute.setColor(embed_color_chat);
		input_code = "```py\n" + input_code + "```";
		output = "```py\n" + output + "```";
	}
	embed_execute.addFields(
		{name: "Input", value: input_code.slice(0, 1000)},
		{name: "Output", value: output.slice(0, 1000)}
	)
	embed_execute.setTimestamp();
	embed_execute.setFooter("JaredBot", webserver_root_address+"img/lion.png");
	msg_channel_send(msg, embed_execute);
}

var execute_start = {};
var execute_pids = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,9).toLowerCase() == prefix[msg.guild.id]+"execute " ||
			msg.guild != null && msg.content.slice(0,6).toLowerCase() == prefix[msg.guild.id]+"exec " ||
			msg.guild != null && msg.content.slice(0,4).toLowerCase() == prefix[msg.guild.id]+"py " ||
			msg.guild != null && msg.content.slice(0,4).toLowerCase() == prefix[msg.guild.id]+"js " ||
			msg.guild != null && msg.content.slice(0,5).toLowerCase() == prefix[msg.guild.id]+"c++ ") {
			// timeout
			if (execute_start[msg.guild.id] == undefined) {
				execute_start[msg.guild.id] = false;
			} if (execute_input_check[msg.guild.id] == undefined) {
				execute_input_check[msg.guild.id] = [false, msg.channel.id];
			}
			
			if (execute_start[msg.guild.id] == false) {
				execute_start[msg.guild.id] = true;
				cpp_error = false;
				// check if code is python or javascript
				var input_code = msg.content.slice(msg.content.split(" ")[0].length+1, msg.length);
				if (input_code.indexOf("```js") > -1 || input_code.indexOf("```javascript") > -1
					|| msg.content.slice(0,4) == prefix[msg.guild.id]+"js ") {
					// code is javascript
					input_code = input_code.replace(/```js/g, "").replace(/```javascript/g, "").split("```").join("").split("`").join("");
					console_log("Execute input code is JavaScript!");
					execute_filename = javascript_execute_filename;
					execute_command = 'node "';
					flags = "";
					check_code_func = check_harmful_code_js;
					language_name = "javascript";
					is_python = false;
					is_cpp = false;
				
				} else if (input_code.indexOf("```c") > -1 || input_code.indexOf("```c++") > -1
					|| msg.content.slice(0,5) == prefix[msg.guild.id]+"c++ ") {
					// code is C++
					input_code = input_code.replace("```c++","").replace("```cpp","").replace(/```c/g, "").split("```").join("").split("`").join("");
					console_log("Execute input code is C++!");
					execute_filename = cpp_execute_filename;
					execute_command = 'g++ "';
					flags = " -static-libgcc -static-libstdc++";
					check_code_func = check_harmful_code_cpp;
					language_name = "C++";
					is_python = false;
					is_cpp = true;
					
				} else {
					// code is python
					input_code = input_code.replace(/```python/g, "").split("```").join("").split("`").join("");
					console_log("Execute input code is Python!");
					execute_filename = python_execute_filename;
					execute_command = 'python "';
					flags = "";
					check_code_func = check_harmful_code;
					language_name = "python";
					is_python = true;
					is_cpp = false;
				}
				
				// check for harmful code
				result = check_code_func(input_code);
				if (result[0] == false) {
					embed_execute_output(msg, input_code, result[1], language_name);
					setTimeout(function(){
						execute_start[msg.guild.id] = false;
						console_log(msg.author.tag+' Tried to run dangerious python code on '+msg.guild.name, error=false, mod=false, warning=true);
						console_log(result[1], error=false, mod=false, warning=true);
					}, execute_code_cooldown, msg);
				} else {
					// write code to file
					code = check_input(msg, input_code);
					create_file_then_append_data(msg, execute_filename, code, function(cb) {
						if (cb == false) {
							console_log('Wrote '+language_name+' code to file for ' + msg.guild.name + "!");
							
							// script location
							server_name = get_server_name(msg); // server folder
							server_file = logging_path +"/"+ server_name +"/" + execute_filename;
							full_path = jaredbot_folder_location + "/" + server_file;
							
							// check for C++ add flags
							if (is_cpp == true) {
								cpath = full_path.split('/').slice(0, -1).join('/') +'/'+ full_path.split('/').slice(-1)[0];
								flags = ' -o "'+cpath.replace('.cpp','.exe')+'"' + flags;
							}
							
							// check if pid array undefined
							if (execute_pids[msg.guild.id] == undefined) {
								execute_pids[msg.guild.id] = [];
							}
							
							// run code
							console_log('Started running '+language_name+' execute script!');
							execute_pids[msg.guild.id].push(exec(execute_command + full_path + '"' + flags, (err, stdout, stderr) => {
								console_log('Finished running '+language_name+' execute script!');
								if (err != null && err != undefined) {
									if (is_python == true) {
										// python output
										output_error = err.toString().split('Traceback')[1];
										if (output_error != undefined) {
											embed_execute_output(msg, input_code, "Traceback" + output_error, language_name);
										}
									} else if (is_cpp == true) {
										// G++ compiler output
										output_error = err.toString();
										if (output_error != undefined) {
											embed_execute_output(msg, input_code, output_error, lan="g++");
										}
										
									} else {
										// JavaScript output
										output_error = err.toString().split('\n\n')[1];
										if (output_error != undefined) {
											embed_execute_output(msg, input_code, output_error, language_name);
										} else {
											output_error = err.toString().split('\r\n\r\n')[1];
											if (output_error != undefined) {
												embed_execute_output(msg, input_code, output_error, language_name);
											}
										}
									}
								} else {
									if (is_cpp == true) {
										// run code
										execute_pids[msg.guild.id].push(exec('"'+cpath.replace('.cpp','.exe')+'"', (err, stdout, stderr) => {
											if (err != null && err != undefined) {
												cpp_error = err.toString();
												if (cpp_error != undefined) {
													embed_execute_output(msg, input_code, cpp_error, lan="c++");
													console_log("C++ output error! " + cpp_error);
													cpp_error = true;
												}
											} else {
												embed_execute_output(msg, input_code, stdout, lan="c++");
											}
										}))
										
										// shutdown script after 5 seconds
										
									} else {
										embed_execute_output(msg, input_code, stdout, language_name);
									}
								}
								create_file_then_append_data(msg, execute_filename, "", endl="", overwrite=true);
								execute_input_check[msg.guild.id] = [false, msg.channel.id];
							}))
							
							// kill process
							setTimeout(function() {
								for (i=0;i<execute_pids[msg.guild.id].length;i++) {
									exec("taskkill /F /T /PID " + execute_pids[msg.guild.id][i].pid, (err, stdout, stderr) => {
										if (stdout.indexOf("has been terminated.") > -1) {
											if (cpp_error == false) {
												embed_execute_output(msg, input_code, "Script terminated as it ran for too long!", language_name);
											}
											create_file_then_append_data(msg, execute_filename, "", endl="", overwrite=true);
											execute_start[msg.guild.id] = false;
										}
									})
								}
							}, execute_code_cooldown, msg, input_code, cpp_error);
							
							// clear timeout
							setTimeout(function(){
								execute_start[msg.guild.id] = false;
							}, execute_code_cooldown, msg);
						} else {
							console_log("Failed to write python code to file!", error=true);
						}
					}, endl="", overwrite=true);
				}
			}
		}
	}
})

// update input file
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (execute_input_check[msg.guild.id] != undefined) {
			if (execute_input_check[msg.guild.id].length == 2) {
				if (execute_input_check[msg.guild.id][0] == true) {
					if (msg.channel.id == execute_input_check[msg.guild.id][1]) {
						if (msg.author.bot == false) {
							// get file location
							server_name = get_server_name(msg); // server folder
							server_file = logging_path +"/"+ server_name +"/" + inputs_file_execute;
			
							// write message to file
							create_file_then_append_data(msg, server_file, msg.content, endl="");
							console_log("Wrote execute input to input.txt!");
						}
					}
				}
			}
		}
	}
})

// im bored
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() === prefix[msg.guild.id]+"imbored") {
			fs_read.readFile(dataset_imbored, "utf-8", function(err, data) {
				if (err) {
					return console_log("Failed to read imbored dataset!", error=true);
				}
			
				//send message
				current_list = String(data).split("\n");
				current = current_list[parseInt(Math.random() * 1000) % current_list.length];
				embed_chat_reply(msg, current);
			});
		}
	}
})

// random name
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() === prefix[msg.guild.id]+"random name") {
			fs_read.readFile(dataset_firstname, "utf-8", function(err, data) {
				if (err) {
					return console_log("Failed to read random name dataset!", error=true);
				}
			
				//get first name
				first_names_list = String(data).split("\n");
				firstname = first_names_list[parseInt(Math.random() * 1000) % first_names_list.length];
			
				//surname
				fs_read.readFile(dataset_surname, "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read surname dataset!", error=true);
					}
			
					// get surname
					surname_list = String(data).split("\n");
					var surname = surname_list[parseInt(Math.random() * 1000) % surname_list.length];
				
					// send message
					fname = firstname.replace(/\W/g, '')
					sname = surname.replace(/\W/g, '')
					sname = sname[0] + sname.slice(1,sname.length).toLowerCase();
					embed_chat_reply(msg, "Your random name is: `" + fname + " " + sname+"`");
				});
			});
		}
	}
})

// choose random item from list
function split_list_dot(data) {
	try {
		count = 0
		loop = true;
		items = [];

		while (loop == true) {
			count += 1
			if (data.indexOf((count+1) + ".") == -1) {
				items.push(data.slice(data.indexOf(count + "."), data.length));
				loop = false;
			} else {
				items.push(data.slice(data.indexOf(count + "."), data.indexOf((count+1) + ".")));
			}
		}
	
		// choose an option
		if (items.length == 1 && items[0].length == 1) {
			return "Invalid Format! Please seperate each item in your list with a number and dot!";
		} else {
			return items[parseInt(Math.random() * 100) % items.length];
		}
	} catch (err) {
		console_log("Error thrown in split_list_dot function! " + err, error=true);
	}
}

// currency
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"usd ") {
			parts = msg.content.slice(5, msg.content.length).split(' ');
			amount = parts[0];
			from = parts[1].toUpperCase();
			url = "https://www.xe.com/currencyconverter/convert/?Amount="+amount+"&From="+from+"&To=USD";
			
			get_html(url, function(html) {
				txt = html.split('class="tab-box__ContentContainer')[1].split('class="result__')[1];
				console.log([txt]);
				
				
			})
			
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"choose " || msg.content.slice(0, 8) == prefix[msg.guild.id]+"choice ") {
			data = msg.content.split("`").join("");
			if (data.indexOf(".") > -1) {
				answer = split_list_dot(data.slice(8, data.length));
				embed_chat_reply(msg, answer.slice(answer.indexOf(".")+1, answer.length));
			
			} else if (data.indexOf(",") > -1) {
				items = data.slice(8, data.length).split(",");
				embed_chat_reply(msg, items[parseInt(Math.random() * 100) % items.length])
			
			} else {
				embed_error(msg, "Invalid Format! Please seperate each item in your list with a number and dot!");
			}
		}
	}
})

// anouncment
bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase().slice(0,10) === prefix[msg.guild.id]+"announce ") {
		if (msg.channel.type == 'dm') {
			if (msg.author.id === user_ID) {
				console_log("Message from Jared recived!");
				var TheMessage = msg.content.slice(10, msg.content.length);
			
				// send to multiple servers (announcements channel)!
				for (i=0;i<channel_IDs.length;i++) {
					try {
						bot.channels.cache.get(channel_IDs[i]).send(TheMessage);
					} catch {
						embed_error(msg, "Failed to send announcement in " + channel_IDs[i]);
					}
				}
			}
		} else {
			embed_error(msg, "The announce command can only be used by Jared Network admins, it's used to post announcments in the Jared Network server announcment channel!");
		}
	}
})

// default dance
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0, 14) == prefix[msg.guild.id]+"default dance") {
			if (authorised_IDs.indexOf(msg.author.id) > -1) {
				// message reply
				for (i=1;i<11;i++) {
					fs_read.readFile(default_dance_dir+i+".txt", "utf-8", function(err, data) {
						if (err) {
							return console_log("Failed to read default dance file!", error=true);
						}
						
						// send message
						embed_default_dance = new Discord.MessageEmbed();
						embed_default_dance.setColor("FFA92D");
						embed_default_dance.setDescription(data);
						msg_channel_send(msg, embed_default_dance);
					})
				}
			} else {
				embed_error(msg, "Only Jared can run this command!");
			}
		}
	}
})

// wait 1 second then get output again
function get_output(msg, channel_id) {
	try {
		setTimeout(function() {
			try {
				fs_read.readFile(output_file_chatbot, "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read CleverBot output file!", error=true);
					}
					if (data == "") {
						get_output(msg, channel_id);
					} else {
						// send message to user
						console_log("Channel ID: ", channel_id, data);
						embed_cleverbot = new Discord.MessageEmbed();
						embed_cleverbot.setAuthor("AI", webserver_root_address+"img/ai.png");
						embed_cleverbot.setColor("00749D");
						embed_cleverbot.setDescription("```\u200B\u200B\u200B" +data+"\n\u200B                              ```");
						embed_cleverbot.setTimestamp();
						msg_channel_send(msg, embed_cleverbot);
						console_log("message send to user!")
					}
				})
			} catch (err) {
				embed_chat_reply("...");
			}
		}, read_output_file_delay_clever_bot, msg, channel_id);
	} catch (err) {
		console_log("Error thrown in get_output function! " + err, error=true);
	}
}

// clever bot
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) === prefix[msg.guild.id]+"bot ") {
			var input_code = msg.content.slice(5,msg.length);
		
			// write code to file
			fs_write.writeFile(inputs_file_chatbot, input_code, function(err) {
				if (err) {
					return console_log("Failed to write input to CleverBot input file!", error=true);
				}
				console_log("[cleverbot input] " + input_code);
			});
		
			// read code output
			setTimeout(function(){
				fs_read.readFile(output_file_chatbot, "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read CleverBot output file!", error=true);
					}
			
					// send message
					get_output(msg, msg.channel.id);
				
				});
			}, read_output_file_delay_clever_bot_2, msg);
		}
	}
})

// Image commands
// random animal
var random_animal_timeout = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() === prefix[msg.guild.id]+"random animal") {
			// cooldown
			if (random_animal_timeout[msg.guild.id] == undefined) {
				random_animal_timeout[msg.guild.id] = false;
			}
			
			if (random_animal_timeout[msg.guild.id] == false) {
				random_animal_timeout[msg.guild.id] = true;
				// get random animal
				fs_read.readFile(dataset_animals, "utf-8", function(err, data) {
					animals = data.split('\n');
					animal = animals[parseInt(Math.random()*1000) % animals.length];
					google_url = encodeURI("https://www.gettyimages.co.uk/photos/" + animal);
					
					get_html(google_url, function(html) {
						elms = html.split('src=');
						for (i=0;i<elms.length;i++) {
							if (elms[i].indexOf("https://media.gettyimages.com/") > -1) {
								start_index = elms[i].indexOf("https://media.gettyimages.com/");
								current_elm = elms[i].slice(start_index, elms[i].length);
								url = current_elm.split('?')[0].split('"')[0].split("'")[0];
								break;
							}
						}
						// message user
						embed_image_header(msg, url, animal, animal);
						setTimeout(function(){
							random_animal_timeout[msg.guild.id] = false;
						}, random_animal_cooldown, msg);
					})
				})
			}
		}
	}
})



// post photo
var reddit_url = "https://www.reddit.com/r/";
var subreddit_names = {
	"cat" : "cat",
	"dog" : "dog",
	"dogmeme" : "dogmemes",
	"car" : "classiccars",
	"snake" : "snake",
	"bird" : "parrots",
	"racoon" : "racoon",
	"floppa" : "Floppa",
	"catmeme" : "Catmeme",
	"meme" : "meme",
	"mars" : "Mars"
}

function get_reddit_img(command) {
	url = reddit_url + subreddit_names[command];
	get_html(url, function(html) {
		console.log(html);
		
	})
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"useragent") {
			embed_chat_reply(msg, get_user_agent());
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"gethtml ") {
			url = msg.content.slice(9, msg.content.length);
			get_html(url, function(html) {
				embed_chat_reply(msg, html);
			})
		}
	}
})

function get_photo_name(database, callback) {
	if (typeof(database) == "string") {
		file_name = ("00000" + parseInt(Math.random() * 10000) % dataset_counts[database]).slice(-5);
		get_hash(peper + file_name, func="md5", function(hash) {
			return callback(hash);
		})
	} else {
		file_name = ("00000" + parseInt(Math.random() * 10000) % database).slice(-5);
		get_hash(peper + file_name, func="md5", function(hash) {
			return callback(hash);
		})
	}
}

function post_photo(msg, command, command2, description, database, webserver_dataset, nsfw=false, extension=".png") {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+command || msg.content == prefix[msg.guild.id]+command2) {
			if (msg.channel.nsfw == nsfw) {
				// send message
				get_photo_name(database, function(file_name) {
					embed_image(msg, webserver_dataset + "/" + file_name + extension, description);
					console_log(description + " photo sent to server " + msg.guild.id);
				})
			} else {
				embed_error(msg, "The "+command+" command can only be used in NSFW channels");
				console_log("User " + msg.member.user.tag + " tried to run an NSFW command in a non NSFW channel in server " + msg.guild.id, error=true);
			}
		}
	}
}

bot.on("message", msg => {
	// command, command2, description, database, webserver_dataset
	
	// SFW
	post_photo(msg, "cat", "meow", "cats", "cats", webserver_cats_dataset); // post cat photo
	post_photo(msg, "dog", "woof", "dogs", "dogs", webserver_dogs_dataset); // post dog photo
	post_photo(msg, "heli", "chpper", "helicopter", "helicopters", webserver_heli_dataset); // post helicopter photo
	post_photo(msg, "dogmeme", "dogmeme", "dogmeme", "dogmemes", webserver_dogmeme_dataset); // post a dog meme
	post_photo(msg, "car", "car", "Car", "cars", webserver_car_dataset); // post car
	post_photo(msg, "snake", "snake", "snake", "snakes", webserver_snake_dataset); // post snake
	post_photo(msg, "bird", "bird", "bird", "birds", webserver_birds_dataset); // post bird
	post_photo(msg, "racoon", "racoon", "racoon", "racoon", webserver_racoon_dataset); // post racoon
	post_photo(msg, "photo", "photo", "photography", "photography", webserver_photography_dataset); // post photography
	post_photo(msg, "anime", "anime", "anime", "anime", webserver_anime_dataset); // post anime
	post_photo(msg, "floppa", "flop", "floppa", "floppa", webserver_floppa_dataset); // post floppa
	post_photo(msg, "catmeme", "catmemes", "catmemes", "catmemes", webserver_catmemes_dataset); // post cat meme
	post_photo(msg, "meme", "memes", "meme", "memes", webserver_memes_dataset); // post meme
	post_photo(msg, "mars", "mar", "mars", "mars", webserver_mars_dataset); // post mars
})


// post video
function post_video(msg, guild="msg") {
	// send message
	get_photo_name("video", function(file_name) {
		file = local_video_dataset + "/" + file_name +".mp4";
		if (guild == "msg") {
			msg.channel.send("\u200B", { files: [file] }).then(fobject => {
				console_log("video sent to server " + msg.guild.name);
			}).catch(err => {
				console_log("Failed to send video file to server! " + err, error=true);
				embed_error(msg, "Failed to upload video file!");
			})
		} else if (guild == "channel") {
			if (msg != null || msg != undefined) {
				msg.channel.send("\u200B", { files: [file] }).then(fobject => {
					console_log("video sent to server " + msg.guild.name);
				}).catch(err => {
					console_log("Failed to send video file to server! " + err, error=true);
					embed_error(msg, "Failed to upload video file!");
				})
			}
		}
	})
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"vid") {
			post_video(msg, guild="msg");
		}
	}
})

// post cat video
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 11).toLowerCase() == prefix[msg.guild.id]+"epicgaming" || 
		msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"cute" || msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"aww" || 
		msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"gaming") {
			// send message
			get_photo_name("meow", function(file_name) {
				file = local_meow_dataset + "/" + file_name +".mp4";
				msg.channel.send("\u200B", { files: [file] }).then(fobject => {
					console_log("cat video sent to server " + msg.guild.name);
				}).catch(err => {
					console_log("Failed to send cat video file to server! " + err, error=true);
					embed_error(msg, "Failed to upload video file!");
				})
			})
		}
	}
})

// img (image links)
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"penis") {
			embed_image(msg, "https://tenor.com/view/sausage-sausage-meme-knife-csgo-gif-18197274", "penis");
		} else if (msg.content == prefix[msg.guild.id]+"vagina") {
			embed_image(msg, "https://media2.giphy.com/media/l1AsAV04FCMOoFyHm/giphy.gif?cid=ecf05e47zufurxkycli2lp76s3hybdvpxoblp3eo8jnrid7a&rid=giphy.gif", "vagina");
		} else if (msg.content == prefix[msg.guild.id]+"uno reverse") {
			embed_image(msg, "https://jaredbot.uk/img/src/web/random/no_u.gif", "no u");
		}
	}
})

// avatar
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"avatar" ||
			msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"pfp" || 
			msg.content.slice(0, 3).toLowerCase() == prefix[msg.guild.id]+"av") {
			let member = msg.mentions.members.first();
			
			// embed
			avatar_embed = new Discord.MessageEmbed();
			avatar_embed.setTimestamp();
			avatar_embed.setColor(embed_color_chat);
			
			if (member != undefined) {
				avatar_embed.setTitle(member.user.tag.split("#")[0] + "'s Avatar");
				avatar_embed.setImage(member.user.displayAvatarURL({size: 4096, dynamic: true}));
				avatar_embed.setFooter(member.user.tag);
				
			} else {
				avatar_embed.setTitle(msg.member.user.tag.split("#")[0] + "'s Avatar");
				avatar_embed.setImage(msg.author.displayAvatarURL({size: 4096, dynamic: true}));
				avatar_embed.setFooter(msg.member.user.tag);
			}
			
			// send message
			msg_channel_send(msg, avatar_embed);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() === prefix[msg.guild.id]+"invitelink") {
		embed_chat_reply_header(msg, perm_invite_link, "Jared Network Invite Link", pfp=false);
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"invitebot" || 
		msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"addbot" || 
		msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"botinvite") {
		embed_chat_reply_header(msg, bot_invite_link, "Jared Bot Invite Link", pfp=false);
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"invite") {
			if (msg.guild.me.hasPermission("CREATE_INSTANT_INVITE") == true) {
				async function create_invite(msg) {
					try {
						//embed
						invite_embed = new Discord.MessageEmbed();
						invite_embed.setColor(embed_color_chat);
						invite_embed.setTitle("Invite link for " + msg.guild.name);
				
						let invite = await msg.channel.createInvite ({
							maxAge: 600,
							maxUsers: 1
						}).catch(err => {
							console_log("Failed to create Invite! " + err);
						})
						invite_embed.setDescription("https://discord.gg/" + invite);
						invite_embed.setTimestamp();
						msg_channel_send(msg, invite_embed);
					} catch (err) {
						console_log("Error thrown in create_invite function! " + err, error=true);
					}
				}
				create_invite(msg);
			} else {
				embed_error(msg, "Failed to create invite link for " + msg.guild.name + ", JaredBot does not have the right permissions! " +
				"Please go to server settings --> roles, and give JaredBot permission to create invites.");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() === prefix[msg.guild.id]+"author") {
		embed_author_jared = new Discord.MessageEmbed();
		embed_author_jared.setTitle("Jared Info")
		embed_author_jared.setDescription("JaredBot is a multipurpose Discord bot created by Jared Turck, mainly to be used on the Jared Network Discord server.\n\u200B\n\u200B" +
			"It has a range of features from tools such as execute, which " +
			"allows you to run Python code directly on your discord server, " +
			"steaminfo which allows you to see other users steam stats, an AI " +
			"chat bot which you can talk an interact with, auto response chat " +
			"commands, random images and memes, to games like rock paper scissors, " +
			"higher lower and TickTackToe. The bot also has moderation commands " +
			"for managing your server, like announce, warn, mute, unmute, kick, " +
			"ban, unban, to logging which saves a copy of every message allowing " +
			"you to retrieve messages even after they have been deleted.\n\u200B" +
			"\n\u200BFor information on how to use the bot type `"+prefix[msg.guild.id]+"help`! If you have any " +
			"suggestions, improvements, or you just want to talk to me, feel free to contact me using the links below.\n\u200B"
		)
		embed_author_jared.setColor(embed_colour_info);
		embed_author_jared.setThumbnail(cat_profile_pic);
		embed_author_jared.addFields(
			{name : "\n\u200BSocial links", value: "Steam:\thttps://steamcommunity.com/id/jaredcat\n\u200BDiscord:\thttps://discord.gg/QDeUXq4" +
			"\n\u200BGitHub:\thttps://github.com/JaredTurck\n\u200B"},
			{name: "Bot website", value: "Website: https://jaredbot.uk/\n\u200B"}
		)
		embed_author_jared.setTimestamp();
		embed_author_jared.setFooter("Jared Turck", cat_profile_pic);
		msg_channel_send(msg, embed_author_jared);
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"web" || 
		msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"website") {
		embed_chat_reply_header(msg, "https://jaredbot.uk/", "Bot Website", pfp=false);
	}
})

// about server
bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() === prefix[msg.guild.id]+"about") {
		embed_chat_reply(msg, "Jared Network is a discord server created and owned by Jared Turck, I originally created it to test out bot commands, "+
		"as I was planning to one day develop a discord bot. Jared Network was a test server to try out different bot commands, and also a "+
		"place to interact with other discord bots to get ideas. \n\u200B\n"+

		"Since the creation of this server, it has developed a lot and is so much more than just a testing server, it’s now a place where "+
		"friends can chat with each other, ask for help with anything, give improvements for workshop maps, give new ideas on how to improve "+
		"JaredBot, a place to share gameplay, videos, images, or just chat about random stuff.");
	}
})

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() === prefix[msg.guild.id]+"github") {
		embed_chat_reply(msg, "https://github.com/JaredTurck/JaredBot");
	}
})

// member count
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() === prefix[msg.guild.id]+"membercount") {
			embed_chat_reply(msg, "There are " + msg.guild.memberCount + " members on the server!");
		}
	}
})

// server count
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"servercount") {
			embed_chat_reply(msg, "The bot is currently in " + bot.guilds.cache.size + " servers, and has been authorised on "+
			authrosied_server_IDs.length + " servers in total!");
		}
	}
})

// chat replys
DoAutoReply = {};

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0,13) == prefix[msg.guild.id]+"replychance ") {
			value = parseInt(msg.content.toLowerCase().slice(13, msg.content.length));
			if (value != NaN) {
				if (value > 0) {
					reply_chance = value;
					embed_chat_reply(msg, "reply chance set to " + parseInt((1 / reply_chance)*100)+"%!");
				} else if (value == 0) {
					embed_error(msg, "You can't set the reply chance to 0%! please use -stop instead to turn the bot auto response off!");
				} else if (value < 0) {
					embed_error(msg, "Negative percentages not allowed!");
				}
			}
		} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"replychance") {
			embed_chat_reply(msg, "The current replychance is " + (parseInt((1/reply_chance)*100 ))+"%!");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"stop") {
			DoAutoReply[msg.guild.id] = false;
			embed_chat_reply(msg, "Auto response is turned off! Sorry if I was spamming :(");
			console_log("Auto Response turned off for " + msg.guild.id);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"autoresponse") {
			DoAutoReply[msg.guild.id] = true;
			embed_chat_reply(msg, "Auto response turned on!");
			console_log("Auto Response turned on for " + msg.guild.id);
		}
	}
})

function check_autoreply(msg, word, reply_pcnt=0, msg_reply="", tm=0) {
	if (msg.content.toLowerCase() == word) {
		if (new Date().getMilliseconds() % (reply_chance+reply_pcnt) == 0) {
			if (DoAutoReply[msg.guild.id] == true) {
				if (msg.author.bot == false) {
					setTimeout(function() {
						// check if reply is array
						if (typeof(msg_reply) == "object") {
							if (msg_reply.length > 0) {
								reply_word = msg_reply[parseInt(Math.random() * 1000) % msg_reply.length];
								msg_channel_send(msg, reply_word+" \n\u200B");
							}
						}
						
						// check if reply is string
						else if (typeof(msg_reply) == "string") {
							if (msg_reply.length > 0) {
								msg_channel_send(msg, msg_reply+" \n\u200B");
							} else {
								msg_channel_send(msg, word+" \n\u200B");
							}
						}
					}, 1000*tm, msg, word, reply_pcnt, msg_reply)
				}
			}
		}
	}
}

var autoreply_responses = [
	["f", 0, "", 0], ["jared", 0, "", 0], ["lol", 0, "", 0], ["xD", 0, "", 0], [":3", 0, "", 0], ["what", 0, "", 0], ["no u", 0, "", 0],
	["no you", 0, "", 0], [":0", 0, "", 0], [":o", 0, "", 0], [":v", 0, "", 0], ["owo", 0, "", 0], ["yeah", 0, "", 0], ["ye", 0, "", 0],
	["ah ok", 0, "", 0], ["nice", 0, "", 0], ["o", 0, "", 0], ["Ã¶", 0, "", 0], ["thanks", 0, "", 0], ["ty", 0, "", 0], ["oof", 0, "", 0],
	["ok", 2, "", 0], ["bruh", 0, "", 0], ["you", 0, "no you", 0], ["u", 0, "no you", 0], ["?", 0, "", 0], [":d", 0, ":D", 0], ["rip", 0, "", 0],
	["ree", 0, "", 0], ["haha", 0, "", 0], ["lmao", 0, "", 0], ["yes", 0, "", 0], ["no", 0, "", 0], ["yay", 0, "", 0], ["friend", 0, 
	"im your friend!", 0], ["i love you", 0, "i love you too!", 0], ["i love u", 0, "i love you too!", 0], ["ily", 0, "i love you too!", 0], 
	["wow", 0, "", 0], ["brb", 2, "no you wont!", 0], [":/", 2, "", 0], [":)", 2, "", 0], [":(", 2, "", 0], ["kek", 2, "", 0], ["hello", 3, 
	['Hello', 'Hey', 'Hi'], 0], ["hey", 3, ['Hello', 'Hey', 'Hi'], 0],  ["penis", 0, ["Ewww NO!", "gross!", "Ewww", "Ewww Penis", "Penis No", 
	"🤮"], 0], ["penis", 8, ["fuck me harder daddy", ";)", "yes please", "you make me so wet ;)", "yes daddy"], 0], ["fuck me", 8, ["Ok daddy ;)", 
	"Sounds good", "Yes plz"], 0], ["fuck you", 0, "no you", 0], ["fuck off", 0, "NO!", 0], ["fuck", 10, "why you mad bruh?", 0], ["random", 0, 
	"your random", 0], ["night", 0, ['Night!', 'Sleep Well!', 'Good Night!'], 0], ["morning", 0, ['Morning', 'How did you sleep?', 'Good Morning!'], 
	0], ["one second", 0, "It's been one Second!", 1], ["1 sec", 0, "It's been one Second!", 1], ["give me a sec", 0, "It's been one Second!", 1],
	["give me a second", 0, "It's been one Second!", 1], ["second", 0, "It's been one Second!", 1], ["second plz", 0, "It's been one Second!", 1],
	["one min", 0, "It's been one min!", 60]
]

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (DoAutoReply[msg.guild.id] == true && msg.author.bot == false) {
			
			// responses
			for (i=0;i<autoreply_responses.length;i++) {
				check_autoreply(msg, autoreply_responses[i][0], reply_pcnt=autoreply_responses[i][1], 
				msg_reply=autoreply_responses[i][2], tm=autoreply_responses[i][3]);
			}
		
			// turn off
			DoAutoReply[msg.guild.id] = false;
			setTimeout(function() {
				DoAutoReply[msg.guild.id] = true;
			}, anti_spam_delay);
		}
	}
})

// fancy text
var fancy_fonts = {
	"a" : "𝔞𝖆𝓪𝒶𝕒ａᴀαǟᏗąคΛαå₳aąᗩᗩaa", "b" : "𝔟𝖇𝓫𝒷𝕓ｂʙႦɮᏰც๖Bвß฿҉ҍᗷᗷ̲̳", "c" : "𝔠𝖈𝓬𝒸𝕔ｃᴄƈƈፈƈ¢ᄃ¢¢₵bçᑕᑢbb", "d" : "𝔡𝖉𝓭𝒹𝕕ｄᴅԃɖᎴɖ໓D∂ÐĐ҉ժᗪᕲ̲̳", 
	"e" : "𝔢𝖊𝓮𝑒𝕖ｅᴇҽɛᏋɛēΣєêɆcҽEᘿcc", "f" : "𝔣𝖋𝓯𝒻𝕗ｆꜰϝʄᎦʄfFƒ£₣҉ƒᖴᖴ̲̳", "g" : "𝔤𝖌𝓰𝑔𝕘ｇɢɠɢᎶɠງGgg₲dցGᘜdd", "h" : "𝔥𝖍𝓱𝒽𝕙ｈʜԋɦᏂɧhΉнhⱧ҉հᕼᕼ̲̳",
	"i" : "𝔦𝖎𝓲𝒾𝕚ｉɪιɨᎥıiIιïłeìIᓰee", "j" : "𝔧𝖏𝓳𝒿𝕛ｊᴊʝʝᏠʝวJנjJ҉ʝᒍᒚ̲̳", "k" : "𝔨𝖐𝓴𝓀𝕜ｋᴋƙӄᏦƙkKкk₭fҟKᖽff", "l" : "𝔩𝖑𝓵𝓁𝕝ｌʟʅʟᏝƖlᄂℓlⱠ҉Ӏᒪᐸ̲̳",
	"m" : "𝔪𝖒𝓶𝓂𝕞ｍᴍɱʍᎷɱ๓Mмm₥gʍᗰᒪgg", "n" : "𝔫𝖓𝓷𝓃𝕟ｎɴɳռᏁŋຖПηñ₦҉ղᑎᘻ̲̳", "o" : "𝔬𝖔𝓸𝑜𝕠ｏᴏσօᎧơ໐ӨσðØhօOᘉhh", "p" : "𝔭𝖕𝓹𝓅𝕡ｐᴘρքᎮ℘pPρþ₱҉քᑭᓍ̲̳",
	"q" : "𝔮𝖖𝓺𝓆𝕢ｑQϙզᎤզ๑QqqQiզᑫᕵii", "r" : "𝔯𝖗𝓻𝓇𝕣ｒʀɾʀᏒཞrЯяrⱤ҉ɾᖇᕴ̲̳", "s" : "𝔰𝖘𝓼𝓈𝕤ｓꜱʂֆᏕʂŞƧѕ§₴jʂᔕᖇjj", "t" : "𝔱𝖙𝓽𝓉𝕥ｔᴛƚȶᏖɬtƬт†₮҉էTS̲̳",
	"u" : "𝔲𝖚𝓾𝓊𝕦ｕᴜυʊᏬųนЦυµɄkմᑌᖶkk", "v" : "𝔳𝖛𝓿𝓋𝕧ｖᴠʋʋᏉ۷งVνvV҉ѵᐯᑘ̲̳", "w" : "𝔴𝖜𝔀𝓌𝕨ｗᴡɯաᏇῳຟЩωw₩lաᗯᐺll", "x" : "𝔵𝖝𝔁𝓍𝕩ｘxxӼጀҳxXχxӾ҉×᙭ᘺ̲̳",
	"y" : "𝔶𝖞𝔂𝓎𝕪ｙʏყʏᎩყฯYу¥ɎmվY᙭mm", "z" : "𝔷𝖟𝔃𝓏𝕫ｚᴢȥʐፚʑຊZzzⱫ҉Հᘔᖻ̲̳", "0" : "000𝟢𝟘０0000000000n⊘0ᗱnn", "1" : "111𝟣𝟙１1111111111҉𝟙10̲̳",
	"2" : "222𝟤𝟚２2222222222oϩ21oo", "3" : "333𝟥𝟛３3333333333҉Ӡ32̲̳", "4" : "444𝟦𝟜４4444444444p५43pp", "5" : "555𝟧𝟝５5555555555҉Ƽ54̲̳",
	"6" : "666𝟨𝟞６6666666666qϬ65qq", "7" : "777𝟩𝟟７7777777777҉776̲̳", "8" : "888𝟪𝟠８8888888888r𝟠87rr", "9" : "999𝟫𝟡９9999999999҉९98̲̳",
};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"font ") {
			// process text
			txt = msg.content.slice(6, msg.content.length);
			font_output = [];
			for (x=0;x<fancy_fonts["a"].length;x++) {
				for (i=0;i<txt.length;i++) {
					if (fancy_fonts[txt[i]] != undefined) {
						font_output.push(fancy_fonts[txt[i]][x])
					} else {
						font_output.push(txt[i]);
					}
				}
				font_output.push('\n');
			}
			
			// send message
			embed_chat_reply(msg, font_output.join("").slice(0, 2000));
		}
	}
})

// killed by
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0, 6) == prefix[msg.guild.id]+"kill ") {
			let member = msg.mentions.members.first();
			fs_read.readFile(dataset_methods_of_death, "utf-8", function(err, data) {
				if (err) {
					return console_log("Failed to read methods of death database!", error=true);
				}
				death_method = data.split("\n")[parseInt(Math.random() * 1000) % data.split("\n").length]
				embed_chat_reply(msg, "<@" + member + "> " + death_method);
			})
		}
	}
})

// Rock, Paper, Scissors
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if ([prefix[msg.guild.id]+"rock", prefix[msg.guild.id]+"paper", prefix[msg.guild.id]+"scissors"].indexOf(msg.content.toLowerCase()) > -1) {
			bot_answer = ["Rock!", "Paper!", "Scissors!"][parseInt(Math.random() * 10) % 3];
			winning_text = "";
		
			console_log(msg.content.toLowerCase())
			console_log(bot_answer)
		
			// conditions
			if (msg.content.toLowerCase() == prefix[msg.guild.id]+"rock" && bot_answer == "Rock!") {
				winning_text = "Draw!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"rock" && bot_answer == "Paper!") {
				winning_text = "HAHA I win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"rock" && bot_answer == "Scissors!") {
				winning_text = "You Win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"paper" && bot_answer == "Rock!") {
				winning_text = "You Win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"paper" && bot_answer == "Paper!") {
				winning_text = "Draw!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"paper" && bot_answer == "Scissors!") {
				winning_text = "HAHA I Win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"scissors" && bot_answer == "Rock!") {
				winning_text = "HAHA I Win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"scissors" && bot_answer == "Paper!") {
				winning_text = "You Win!";
			} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"scissors" && bot_answer == "Scissors!") {
				winning_text = "Draw!";
			}
		
			// winning text
			msg_channel_send(msg, bot_answer)
			setTimeout(function() {
				msg_channel_send(msg, winning_text);
			}, 1000);
		}
	}
})

// system and bot information
var total_server_msg_counts = {'total_msg_count' : 0, 'total_members' : 0};
var all_user_IDs = [];
var msg_member_coolodwn = false;
function get_total_members() {
	if (msg_member_coolodwn == false) {
		// cooldown
		msg_member_coolodwn = true;
		setTimeout(function() {
			msg_member_coolodwn = false;
		}, 60*1000);
		
		// clear global vars
		files = fs_append.readdirSync(logging_path);
		total_server_msg_counts = {'total_msg_count' : 0, 'total_members' : 0};
		all_user_IDs = [];
		
		// itterate through each guild
		for (i=0;i<files.length;i++) {
			try {
				function process(i, last_itter) {
					if (files[i].indexOf('.txt') == -1 && files[i].indexOf('.log') == -1) {
						current_path = logging_path + "/" + files[i] + "/" + message_count_channel_file;
						current_id = files[i].split('_')[files[i].split('_').length-1];
						
						// check if msg counts file exists
						if (fs_read.existsSync(current_path) == true) {
							// read the file
							fs_read.readFile(current_path, "utf-8", function(err, data) {
								if (!err) {
									current_data = data.split(";");
									// itterate through each line in the file
									for (x=0;x<current_data.length;x++) {
										current_row = current_data[x].split(",");
										if (current_row.length == 2) {
											if (isInt_without_error(current_row[1], 0, 4194304) == true) {
												// add total count across all servers
												total_server_msg_counts['total_msg_count'] += parseInt(current_row[1]);
												
												if (all_user_IDs.indexOf(current_row[0]) == -1) {
													all_user_IDs.push(current_row[0]);
													total_server_msg_counts['total_members'] += 1;
												}
											}
										}
									}
									if (i == last_itter) {
										console_log("Finished calculating msg and member counts!");
									}
								}
							})
						}
					}
				} process(i, files.length);
			} catch (err) {
				console_log("Failed to update total message and user counts! " + err, error=true);
			}
		}
	}
}

function format_data_size(n) {
	o = n
	c = 0
	while (o > 1) {
		o /= 1024;
		c += 1;
	}
	b = {1 : 'bytes', 2 : 'KB', 3: 'MB', 4 : 'GB', 5 : 'TB'};
	return (o*1024).toFixed(1) + b[c];
}

bot.on("ready", msg => {
	setTimeout(function(){
		get_total_members();
	}, 5*1000);
})

var download_speed = 0;
var upload_speed = 0;
var download_speed_cooldown = false;
function get_download_speed() {
	if (upload_speed == false) {
		download_speed_cooldown = true;
		exec("speedtest", (err, stdout, stderr) => {
			if (!err) {
				download_speed = parseFloat(stdout.replace(/[ \n\r]/g, '').split('Download:')[1].split('Mbps'));
				upload_speed = parseFloat(stdout.replace(/[ \n\r]/g, '').split('Upload:')[1].split('Mbps'));
				console_log("Meaused server download speed!");
				
				// clear cooldown
				setTimeout(function() {
					download_speed_cooldown = false;
				}, 5*60*1000);
			}
		})
	}
}

bot.on("ready", msg => {
	get_download_speed();
	console_log("Download speed interval set!");
	setInterval(function(){
		get_download_speed();
	}, download_speed_interval);
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"botinfo") {
			try {
				// CPU, RAM, OS and uptime
				arch = os.arch() // 32 or 64 bit
				cpus = os.cpus(); // cpu info
				cpu_name = cpus[0].model;
				cpu_speed = cpus[0].speed;
				
				freemem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1); // free ram
				totalmem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1); // total ram
				platform = os.platform().replace('win32', 'Windows') // os
				type = os.type() // os type
				
				server_uptime = os.uptime() // uptime
				days = parseInt(server_uptime / 60 / 60 / 24);
				hours = parseInt(24 * ((server_uptime / 60 / 60 / 24) % 1));
				mins = parseInt(((24 * ((server_uptime  / 60 / 60 / 24) % 1)) % 1) * 60);
				secs = parseInt(60 * ((((24 * ((315127  / 60 / 60 / 24) % 1)) % 1) * 60) % 1));
				
				// GPU
				exec("wmic path win32_VideoController get name", (err, stdout, stderr) => {
					if (err) {
						embed_error(msg, "Failed to get botinfo!");
						return false;
					}
					
					gpu = stdout.replace(/[\r\n]/g, '').replace(/  /g, '').split('Adapter')[1].replace('e ', 'e\n');
					
					// Disks
					exec("wmic logicaldisk get size,caption", (err, stdout, stderr) => {
						if (err) {
							embed_error(msg, "Failed to get botinfo!");
							return false;
						}
						
						disks = stdout.replace(/\r/g, '').replace(/  /g, '').split('\n').slice(1, -1);
						output = [];
						for (i=0;i<disks.length;i++) {
							if (disks[i].indexOf(':') > -1) {
								output.push(disks[i].split(':')[0] + ": " + format_data_size(disks[i].split(':')[1]));
							}
						}
						disk = output.join('\n');
						
						// server count
						current_count = bot.guilds.cache.size;
						total_servers = authrosied_server_IDs.length;
						
						// total members
						get_total_members();
						total_members = String(total_server_msg_counts['total_members']).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						total_msgs = String(total_server_msg_counts['total_msg_count']).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						
						// download speed
						get_download_speed();
						
						// embed
						embed_botinfo = new Discord.MessageEmbed();
						embed_botinfo.setColor(embed_color_chat);
						embed_botinfo.setTitle("JaredBot Info");
						embed_botinfo.addFields(
							{name: "CPU", value: cpu_name.replace('X', 'X\n') + "\nSpeed: " + (cpu_speed/1000) + "GHz\nArch: " + arch + "\n\u200B", inline: true},
							{name: "RAM", value: "Total RAM: " + totalmem + "\nFree RAM: " + freemem + "\n\u200B", inline: true},
							{name: "GPU", value: gpu + "\n\u200B", inline: true},
							
							{name: "Disk", value: disk + "\n\u200B", inline: true},
							{name: "OS", value: "Platform: " + platform + "\n" + type + "\n\u200B", inline: true},
							{name: "NIC", value: "Download: " + download_speed + "Mbps\nUpload: " + upload_speed + " Mbps", inline: true},
							
							{name: "Uptime", value: days + " days, " + hours + " hours, \n" + mins + " mins, " + secs + " seconds\n\u200B", inline: true},
							{name: "Total Members", value: total_members + "\n\u200B", inline: true},
							{name: "Total Messages", value: total_msgs + "\n\u200B", inline: true},
							
							{name: "Current Servers", value: current_count + "\n\u200B", inline: true},
							{name: "Total Servers", value: total_servers + "\n\u200B", inline: true},
							{name: "\n\u200B", value: "\n\u200B", inline: true},
							
						)
						embed_botinfo.setTimestamp();
						msg_channel_send(msg, embed_botinfo);
						
					})
				})
			} catch (err) {
				console_log("Failed to get botinfo! " + err, error=true);
				embed_error(msg, "Failed to get botinfo!");
			}
		} 
	}
})

// Just One
//-justone join (lets people join the game)
//bot sends message, please type yes to join the game

//once everyone is ready, admin types -justone start
//- bot reads database of words
//- bot sends same word to each peron

//bot wait for everyone to reply
//- once all users have replied then:
//  - send message in server channel

// get the just one channel ID when the bot starts

justone_guild = {};

function help_justone(msg) {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			embed_justone_help = new Discord.MessageEmbed();
			embed_justone_help.setColor(embed_color_chat);
			embed_justone_help.setTitle("Help Just One");
			embed_justone_help.setThumbnail(lion_profile_pic);
			embed_justone_help.setAuthor("JaredBot | Command list", lion_profile_pic);
			embed_justone_help.addFields(
				{name: "start", value: "`"+prefix[msg.guild.id]+"justone start` will start the just one game, opning a lobby allowing players to join. This is the first command that should be run before using any of the just one commands. anyone can start a game.\n\u200B"},
				{name: "join", value: "`"+prefix[msg.guild.id]+"justone join` use this command to join the just one lobby, all players that wish to participate in the game will need to run this command.\n\u200B"},
				{name: "ready", value: "`"+prefix[msg.guild.id]+"justone ready` once all players have joined the lobby, an admin can run the ready command, this will close the lobby preventing other players from joining, and will begin the game.\n\u200B"},
				{name: "endgame", value: "`"+prefix[msg.guild.id]+"justone endgame` an admin can run this command to end the just one game, the just one memeber list will be clearned as well as any words/clues.\n\u200B"},
				{name: "clues", value: "`"+prefix[msg.guild.id]+"justone clues {clues}` once the bot has sent you the list of words in a dm, use this command to reply with your clues.\n\u200B"}
			)
			embed_justone_help.setTimestamp();
			msg_channel_send(msg, embed_justone_help);
		}
	} catch (err) {
		console_log("Error thrown in help_justone function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"justone start") {
			// start game
			justone_guild[msg.guild.id] = msg.channel.id;
			
			// get directory
			justone_dir = get_server_name(msg);
			justone_path = logging_path + "/" + justone_dir + "/" + justone_channel_id_fname;
			
			// write channel ID to file
			fs_write.writeFile(justone_path, justone_guild[msg.guild.id], function(err) {
				if (err) {
					return console_log("Failed to write justone channel ID to file!", error=true);
				}
			})
		
			// message user
			embed_chat_reply(msg, "Just one game started on "+msg.guild.name+" in channel "+msg.channel.name+", " +
			"type `"+prefix[msg.guild.id]+"justone join` to join the game! Once all of the user have joined the game, ask an admin to type `"+prefix[msg.guild.id]+"justone ready` " +
			"this will beging sending the words to the users");
			
			// to do:
			// - send just one rules
			
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"justone join") {
			
			// get directory
			justone_dir = get_server_name(msg);
			justone_path = logging_path + "/" + justone_dir + "/" + justone_channel_id_fname;
			
			// check if file exists
			if (fs_read.existsSync(justone_path) == false) {
				embed_chat_reply(msg, "Unable to join just one game, there is no game currently setup on the server, " +
				"please type `"+prefix[msg.guild.id]+"justone start` to start a new game!");
				return false;
			}
			
			// read just one channel ID file
			fs_read.readFile(justone_path, "utf-8", function(err, data) {
				if (err) {
					return console_log("Failed to read just one channel file ID!", error=true);
				}
				
				// check if the file has an ID
				if (isInt_without_error(data, 0, 10**18) == true) {
					data = msg.member.id + "," + data; // channel ID
					user = msg.member.id +","+ msg.member.user.tag + ";";
				
					// write user to file
					create_file_then_append_data(msg, justone_members_fname, user, endl="\n");
					
					// write user to global file
					current_user = msg.member.id + "," + msg.guild.id + "," + msg.member.user.tag + ";";
					create_file_then_append_data_custom_path(msg, logging_path+"/"+justone_global_members_fname, current_user, endl="\n")
				
					// send message that user has joined
					embed_chat_reply(msg, msg.member.user.tag + " joined the just one game!");
				}
			})
			
		}
	}
})

// all user are stored in text file		done
// channel ID is stored in file			done
// choose a random word					done
// send the word to all of the users	done
// wait for users clues					done
// stores clues in file					done

// next word command
// \n\u200B

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"justone ready") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				// choose word
				//words_dataset
				fs_read.readFile("datasets/words.txt", "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read justone words database!", error=true);
					}
					
					// get directory
					member_dir = get_server_name(msg);
					member_path = logging_path + "/" + member_dir + "/" + justone_members_fname;
					
					// read members
					fs_read.readFile(member_path, "utf-8", function(err, data2) {
						if (err) {
							return console_log("Failed to read justone members database!", error=true);
						}
						
						raw_members = data2.replace(/[\r\n]/g,"").split(";");
						member_dict = {};
						for (i=0;i<raw_members.length;i++) {
							current_user_ID = raw_members[i].split(",")[0];
							current_user_tag = raw_members[i].split(",")[1];
							if (current_user_ID != "") {
								if (member_dict[current_user_ID] == undefined) {
									member_dict[current_user_ID] = current_user_tag;
								}
							}
						}
						
						// member list
						member_list = Object.keys(member_dict);
						
						// choose word
						raw_words_dataset = data.replace(/[\r]/g,"").split("\n");
						word_list = [];
						for (i=0;i<member_list.length;i++) {
							// make sure the word is not duplicated
							current_word = raw_words_dataset[parseInt(Math.random() * 1000) % raw_words_dataset.length];
							while (word_list.indexOf(current_word) > -1) {
								current_word = raw_words_dataset[parseInt(Math.random() * 1000) % raw_words_dataset.length];
							}
							
							// add word to list
							word_list.push(current_word);
						}
						
						// write words to file
						server_dir = get_server_name(msg);
						words_path = logging_path + "/" + server_dir + "/" + justone_words_fname;
						
						fs_write.writeFile(words_path, word_list.join(","), function(err) {
							if (err) {
								return console_log("Failed to write justone words to file!", error=true);
							}
						})
						
						// message
						embed_chat_reply(msg, "Random words have been chosen!");
						console_log("Random word chosen for Just One game on server " + msg.guild.id);
						
						// send words to users
						async function send_messages() {
							try {
								members = Object.keys(member_dict);
							
								for (i=0;i<members.length;i++) {
									await new Promise(next => {
										// embed
										embed_justone = new Discord.MessageEmbed();
										embed_justone.setColor(embed_color_chat);
										embed_justone.setAuthor("JaredBot", lion_profile_pic);
										embed_justone.setTitle("Just One");
										embed_justone.setDescription("Hi! Welcome to the game: Just One! Below is the list of you words, please reply to " + 
										"this message with a word clue for each word listed. \n\u200B\n\u200B" +
										"How to Reply? Use the `"+prefix[msg.guild.id]+"justone clues` command, you need to give a one word clue for each of the " +
										"words listed. Make sure to separate your clues with a comma `,` if any of your clues contains spaces ` ` e.g. " +
										"multiple words, then your clues will be reject and you will be asked to give your clues again.\n\u200B" +
										"\n\u200BLets say for example your words are `apple`, `coat`, `toothpaste`, then you could reply something like this " +
										"`"+prefix[msg.guild.id]+"justone clues fruit,clothing,tube`.\n\u200B");
										embed_justone.addFields(
											{name: "Words", value: word_list.join("\n\u200B") + "\n\u200B"},
										)
							
										// dm user
										msg.guild.members.fetch(members[i]).then(current_member => {
											console_log("Just One DM sent!");
											current_member.user.send(embed_justone).then(() => {
												next();
											})
										}).catch(err => {
											console_log("Error thrown in justone ready members.fetch! " + err, error=true);
										})
									})
								}
							} catch (err) {
								console_log("Error thrown in send_messages function! " + err, error=true);
							}
						}
						send_messages().then(() => {
							console_log("All Just One words sent to users!");
						}).catch(err => {
							console_log("Error thrown in justone ready send_messages function! " + err, error=true);
						})
					})	
				})
			} else {
				embed_error(msg, "You dont have mod/admin permissions, so can't begin the game!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"justone endgame") {
			// clear files
			clear_file(msg, justone_channel_id_fname); 	// clear channel ID
			clear_file(msg, justone_members_fname);		// clear members list
			clear_file(msg, justone_clues_fname);		// clear clues
			clear_file(msg, justone_words_fname);		// clear words
			
			// message
			embed_chat_reply(msg, "Just one game has ended! Members database cleared, type `"+prefix[msg.guild.id]+"justone start` to start a new game!");
		}
	}
})

bot.on("message", msg => {
	if (msg.channel.type == "dm") {
		if (msg.guild != null && msg.content.slice(0, 15).toLowerCase() == prefix[msg.guild.id]+"justone clues ") {
			clues = msg.content.slice(15, msg.content.length);
			if (clues.length > 0) {
				if (clues.indexOf(" ") == -1) {
					if (/^[ -~]+$/.test(clues) == true) {
						// read global users file
						fs_read.readFile(logging_path+"/" + justone_global_members_fname, "utf-8", function(err, data) {
							if (err) {
								return console_log("Failed to read justone clues global users file!", error=true);
							}
							
							// ---- check the users clue ----
							if (clues.indexOf(" ") == -1) {
								
							} else {
								msg.author.send("Please make sure that your clues contain no spaces, try again!");
								return false;
							}
							
							// check users clues against dict
								
							// read members
							raw_members = data.replace(/[\n\r]/g, "").split(";");
							for (i=0;i<raw_members.length;i++) {
								current_user = raw_members[i].split(",");
								if (current_user.length == 3) {
									current_user_id = current_user[0];
									current_guild_id = current_user[1];
									current_user_tag = current_user[2];
									
									// check if user is in global just one member dataset
									if (msg.channel.recipient.id == current_user_id) {
										// get server name
										current_guild = bot.guilds.cache.get(current_guild_id);
										current_guild_name = current_guild.name.replace(" ", "_");
										
										fname = logging_path +"/"+ current_guild_name + "/" + justone_clues_fname;
										data = current_user_id + "*" + current_user_tag + "*" + clues + ";";
									
										// write user clues to a file in server folder
										create_file_then_append_data_custom_path(msg, fname, data, endl="\n");
										
										// message user
										embed_clues = new Discord.MessageEmbed();
										embed_clues.setColor(embed_color_chat);
										embed_clues.setDescription("Thank you for your clues, once all of the users have sent there clues, " + 
										"they will be posted in the " + current_guild.name + " server!");
										embed_clues.setTimestamp();
										msg_channel_send(msg, embed_clues);
									}
								}
							}
						})	
					}
				}
			}
		}
	}
})

var justone_members_dict = {};
var justone_clues_dict = {};

bot.on("ready", msg => {
	// read members list, update global var
	read_file(justone_members_fname, justone_members_dict, allow_non_int=true, sep=",", remove_dupes=true);
	
	// read clues file, update global var
	read_file(justone_clues_fname, justone_clues_dict, allow_non_int=true, sep="*", remove_dupes=true);
	
})

// checks if lists are the same
function check_if_lists_same(list1, list2) {
	try {
		if (list1 != undefined && list2 != undefined) {
			if (list1.length > 0 && list2.length > 0) {
				for (i=0;i<list1.length;i++) {
					if (list2.indexOf(list1[i]) == -1) {
						return false;
					}
				}
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	} catch (err) {
		console_log("Error thrown in check_if_lists_same function! " + err, error=true);
	}
}

var justone_channel_IDs = {};
bot.on("ready", msg => {
	setInterval(function() {
		
		async function check() {
			try {
				server_IDs = Object.keys(justone_members_dict);
		
				for (i=0;i<server_IDs.length;i++) {
					await new Promise(next => {
						// current itteration
						async function process() {
							// read dicts
							member = justone_members_dict[server_IDs[i]];
							clues = justone_clues_dict[server_IDs[i]];
							guild = bot.guilds.cache.get(server_IDs[i]);
						
							if (member != undefined && clues != undefined) {
						
								// member
								list = [];
								for (i=0;i<member.length;i++) {
									list.push(member[i][0]);
								}
								justone_members_list = list;
						
								// clues
								list = [];
								for (i=0;i<clues.length;i++) {
									list.push(clues[i][0]);
								}
								justone_clues_list = list;
							
								// check if all the members have sent there clues
								if (check_if_lists_same(justone_members_list, justone_clues_list) == true) {
								
									// embed
									embed_clues = new Discord.MessageEmbed();
									embed_clues.setColor(embed_color_chat);
									embed_clues.setDescription("All users have responded to the DM and sent there clues, below is a list of the clues");
									embed_clues.setTitle("Just One Clues");
									embed_clues.setAuthor("JaredBot | " + guild.name, guild.iconURL());
								
									// get clues for specific word
									for (i=0;i<clues.length;i++) {
										//current_clue = clues[i][2].split(",")[i];
										current_clue_list = [];
										for (x=0;x<clues.length;x++) {
											current_clue_list.push(clues[i][2].split(",")[x]);
										}
									
										embed_clues.addField(clues[i][1], current_clue_list.join(", ") + "\n\u200B");
									
									}
								
									// get channel file path
									justone_dir = guild.name.replace(" ","_")+"_"+ guild.id;
									justone_path = logging_path + "/" + justone_dir + "/" + justone_channel_id_fname;
									
									// read channel file
									fs_read.readFile(justone_path, "utf-8", function(err, data) {
										if (err) {
											return console_log("Failed to read justone channel file!", error=true);
										}
										
										// send message to channel
										current_justone_channel = guild.channels.cache.get(data);
										if (current_justone_channel != undefined) {
											current_justone_channel.send(embed_clues);
										}
									})
								
								
									// clear clues file
								
								
								}
							
								// next itteration
								next();
							}
						} process();
					})
				}
			} catch (err) {
				console_log("Error thrown in check function! " + err, error=true);
			}
		}
		
		// run for loop
		check().then(() => {
			console_log("checked just one clues for all servers!");
		}).catch(err => {
			console_log("Error thrown in justone channel IDs! " + err, error=true);
		})
		
	}, just_one_check_clues_timeout);
})

// update the just one channel IDs, every 5 mins
bot.on("ready", msg => {
	read_file(justone_channel_id_fname, justone_channel_IDs);
	setInterval(function() {
		// read channel ID file
		read_file(justone_channel_id_fname, justone_channel_IDs);
		console_log("Updated just One channel IDs dict!");
		
		// read members list, update global var
		read_file(justone_members_fname, justone_members_dict, allow_non_int=true, sep=",", remove_dupes=true);
	
		// read clues file, update global var
		read_file(justone_clues_fname, justone_clues_dict, allow_non_int=true, sep="*", remove_dupes=true);
		
	}, just_one_channel_id_timeout);
})

// update global justone var
//bot.on("ready", msg => {
//	read_file(justone_channel_id_fname, justone_guild[msg.guild.id], allow_non_int=false, sep="", remove_dupes=false);
//	console_log("Just One channel IDs dataset read!");
//})


bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0, 10) == prefix[msg.guild.id]+"remind me") {
			try {
				if (msg.content.toLowerCase().indexOf(" second") > -1) {
					user_input = msg.content.toLowerCase().replace(prefix[msg.guild.id]+"remind me ","").split(" sec")[0]
					time = user_input.split(" ")[user_input.split(" ").length -1];
					reminder = msg.content.toLowerCase().replace(prefix[msg.guild.id]+"remind me ","").split(" in ").slice(0, -1).join(" in ");
			
					setTimeout(function() {
						embed_chat_reply(msg, "<@"+msg.author.id+"> Reminder! "+ reminder.split(" sec")[0]);
					}, 1000*parseInt(time), msg);
					embed_chat_reply(msg, "Ok i will remind you!");
			
				} else if (msg.content.toLowerCase().indexOf(" min") > -1) {
					user_input = msg.content.toLowerCase().replace(prefix[msg.guild.id]+"remind me ","").split(" min")[0]
					time = user_input.split(" ")[user_input.split(" ").length -1];
					reminder = msg.content.toLowerCase().replace(prefix[msg.guild.id]+"remind me ","").split(" in ").slice(0, -1).join(" in ");
			
					setTimeout(function() {
						embed_chat_reply(msg, "<@"+msg.author.id+"> Reminder! "+ reminder.split(" min")[0]);
					}, 1000*parseInt(time)*60, msg);
					embed_chat_reply(msg, "Ok i will remind you!");
				} else if (msg.content != prefix[msg.guild.id]+"remind me") {
					embed_help_reply(msg, {name: "remind me {reminder} {No. min/sec}", value: "sets a reminder, the bot will ping you in the " +
					"specified number of seconds. For example `"+prefix[msg.guild.id]+"remind me to check steam in 10 mins`, will ping you in 10 mins telling you to " +
					"check steam.\n\u200B"});
				}
			} catch (error) {
				embed_error(msg, "Reminder failed!")
				console_log("an error was throw when running the remind me command!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0,7) == prefix[msg.guild.id]+"timer ") {
			time = msg.content.toLowerCase().replace(prefix[msg.guild.id]+"timer ","").split(":");
			if (time.length == 3) {
				if (parseInt(time[0]) != NaN && parseInt(time[1]) != NaN && parseInt(time[2]) != NaN) {
					secs = parseInt(time[2]);
					mins = parseInt(time[1]);
					hour = parseInt(time[0]);
					total = secs + (mins*60) + (hour*3600);
					embed_chat_reply(msg, "Timer set for "+total+" seconds !");
				
					setTimeout(function(){
						embed_chat_reply(msg, "<@"+msg.author.id+"> Timer Finished!");
					}, (secs + (mins*60) + (hour*3600))*1000, msg)
				} else {
					embed_error(msg, "Invalid Format!")
				}
			} else {
				embed_error(msg, "Please use the format Hours:Mins:Seconds (HH:MM:SS)!")
			}
		}
	}
})

//botup time
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"uptime") {
			current_time = new Date();
			run_sec = (current_time - up_time)/1000;
			formatted = parseInt(run_sec / 3600) + " hours, " + parseInt(run_sec % 3600 / 60) + " mins, " + parseInt(run_sec % 3600 % 60);
			console_log(run_sec, formatted);
			embed_chat_reply(msg, "The bot has been online for " + formatted + " seconds");
		}
	}
})

//stopwatch
var stopwatch_start = {};
var stopwatch_on = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0,11) == prefix[msg.guild.id]+"stopwatch ") {
			if (msg.content.toLowerCase().split(prefix[msg.guild.id]+"stopwatch ")[1] == "start") {
				stopwatch_start[msg.guild.id] = new Date();
				stopwatch_on[msg.guild.id] = true;
				embed_chat_reply(msg, "Stopwatch started! type '"+prefix[msg.guild.id]+"stopwatch stop' to end!");
			} 
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0,11) == prefix[msg.guild.id]+"stopwatch ") {
			if (msg.content.toLowerCase().split(prefix[msg.guild.id]+"stopwatch ")[1] == "stop") {
				if (stopwatch_on[msg.guild.id] == true) {
					var stopwatch_stop = new Date();
					run_sec = (stopwatch_stop - stopwatch_start[msg.guild.id])/1000;
					formatted = parseInt(run_sec / 3600) + " hours, " + parseInt(run_sec % 3600 / 60) + " mins, " + parseInt(run_sec % 3600 % 60);
					embed_chat_reply(msg, "Stopwatch stopped!\nRunning time: " + formatted + " seconds!");
					stopwatch_on[msg.guild.id] = false;
				} else {
					embed_chat_reply(msg, "You have not started the stopwatch, type `"+prefix[msg.guild.id]+"stopwatch start` to start!");
				}
			}
		}
	}
})

// URL shortner
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"short ") {
			url = encodeURI(msg.content.slice(7, msg.content.length));
			if (url.slice(0, 8).replace("https","http") == "http://") {
				get_hash(url, "md5", function(digest) {
					// encode string
					chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-~";
					encoded = base(parseInt(digest.slice(0, parseInt(digest.length/2)), 16), chars).slice(0, 5);
					online_url = webserver_url_short + "/" + encoded;
					local_location = local_url_short + "/" + encoded + ".html";
					html = '<meta http-equiv="refresh" content="0; URL='+url+'">';
					
					// create HTML file
					fs_write.writeFile(local_location, html, function(err) {
						if (err) {
							console_log("Failed to generate URL Redirected URL HTML page! " + err, error=true);
							embed_error(msg, "Failed to generate shortened URL! ");
						} else {
							// message user
							embed_chat_reply(msg, "Your shortened URL!\n" + online_url);
						}
					})
				})
			} else {
				embed_error(msg, "Not a valid URL!");
			}
		}
	}
})

// Image Only channel
bot.on("message", msg => {
	if (msg.channel.id == img_only_channel_id) {
		if (msg.content.length > 0) {
			msg.delete();
		}
	}
})

// Higher or Lower
function higher_lower_show_leaderboard(msg) {
	try {
		if (make_server_folder_file(msg, filenames_higherlower) == true) {
			// read leaderboard
			leaderboard_file = logging_path +"/"+ get_server_name(msg) +"/" + filenames_higherlower;
			fs_read.readFile(leaderboard_file, "utf-8", function(err, data) {
				if (err) {
					return console_log("Failed to read higher lower leaderboard file!", error=true);
				}
			
				// sort data
				output_data_array = [];
				output_data_array2 = [];
				hl_leaderboard_array = data.replace(/:/g,": ").split("\n").filter(function(n){return n != ""});
				for (i=0;i<hl_leaderboard_array.length;i++) {
					output_current_part = hl_leaderboard_array[i].split(":");
					output_data_array.push([output_current_part[1], output_current_part[0]]);
				}
				output_data_array.sort();
			
				// convert back to string
				for (i=0;i<output_data_array.length;i++) {
					output_data_array2.push(output_data_array[i][1] + ":" + output_data_array[i][0])
				}
			
				hl_leaderboard_first = output_data_array2[0];
				hl_leaderboard_rest = output_data_array2.slice(1, output_data_array2.length).join("\n") + "\u200B";
		
				// send message
				try {
					embed_higherlower_leaderboard = new Discord.MessageEmbed();
					embed_higherlower_leaderboard.setTitle("Leaderboard");
					embed_higherlower_leaderboard.setColor(embed_color_chat);
					embed_higherlower_leaderboard.addField(hl_leaderboard_first, hl_leaderboard_rest);
					embed_higherlower_leaderboard.setTimestamp();
					msg_channel_send(msg, embed_higherlower_leaderboard);
				} catch {
					embed_chat_reply(msg, "The scoreboard is currently blank, play a game of higher lower to add a score!");
				}
			})
		} else {
			embed_error(msg, "The Higher Lower scoreboard does not exist for your server, you can create a new scoreboard by" +
			" playing a game of higher lower, type `"+prefix[msg.guild.id]+"higherlower` to start the game.");
		}
	} catch (err) {
		console_log("Error thrown in higher_lower_show_leaderboard function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"higherlower") {
			start_game = true;
			random_num = parseInt(Math.random() * 100) % 100;
			embed_chat_reply(msg, "Im thinking of a number between 1 and 100! Guess the number!");
			setTimeout(function(){
				if (start_game == true) {
					embed_chat_reply(msg, "Time is up! My number was " + random_num, footer=["", ""]);
					start_game = false;
					user_counter = 0;
				}
			}, higher_lower_end_game_delay, start_game);
		} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"higherlower leaderboard") {
			higher_lower_show_leaderboard(msg);
		} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"higherlower scoreboard") {
			higher_lower_show_leaderboard(msg);
		} else if (msg.content.toLowerCase().slice(0, 13) == prefix[msg.guild.id]+"higherlower ") {
			if (msg.guild != null && msg.content.slice(13, msg.content.length).length > 0) {
				embed_error(msg, "Invalid parameter, please type `"+prefix[msg.guild.id]+"higherlower` to start the game, "+
				"or if you would like to see the scoreboard type `"+prefix[msg.guild.id]+"higherlower scoreboard` or `"+prefix[msg.guild.id]+"higherlower leaderboard`!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (start_game == true) {
			if (parseInt(msg.content) != NaN) {
				var guess = parseInt(msg.content);
				if (guess < random_num) {
					embed_chat_reply(msg, "Higher!", footer=["", ""]);
					user_counter += 1;
				} else if (guess > random_num) {
					embed_chat_reply(msg, "Lower!", footer=["", ""]);
					user_counter += 1;
				} else if (guess == random_num) {
					start_game = false;
					embed_chat_reply_header(msg, "You took " + user_counter + " guesses!", "Welldone my number was " + random_num);
					setTimeout(function() {
						higher_lower_show_leaderboard(msg);
					}, 1000);
					current_usercount = user_counter;
					user_counter = 0;
					
					// update leaderboard
					make_server_folder_file(msg, filenames_higherlower);
					var leaderboard_file = logging_path +"/"+ get_server_name(msg) +"/" + filenames_higherlower;
					
					// read leaderboard
					fs_read.readFile(leaderboard_file, "utf-8", function(err, data) {
						if (err) {
							return console_log("Failed to read higher lower leaderboard file!", error=true);
						}
						// leaderboard data
						current_higherlower_leaderboard = [];
						higherlower_data_array = [];
						higherlower_raw_data = data.split("\n");
						
						// read file contents as an array
						for (i=0;i<higherlower_raw_data.length;i++) {
							higherlower_current_line = higherlower_raw_data[i].split(":");
							if (higherlower_current_line.length == 2) {
								higherlower_data_array.push(higherlower_current_line);
								
								// add user to leaderboard
								if (higherlower_current_line[0] == msg.author.username) {
									if (isNaN(parseInt(higherlower_current_line[1])) == false) {
										// user score > scoreboard score
										if (current_usercount < higherlower_current_line[1]) {
											higherlower_data_array[i][1] = current_usercount;
										}
									}
								}
							} else {
								if (String(higherlower_data_array).indexOf(msg.author.username) == -1) {
									higherlower_data_array.push([msg.author.username, current_usercount]);
								}
							} 
						}
						
						// format data
						higher_lower_output = "";
						for (ii=0;ii<higherlower_data_array.length;ii++) {
							higher_lower_output = higher_lower_output + higherlower_data_array[ii].join(":") + "\n";
						}
						
						// write scoreboard to file
						fs_write.writeFile(leaderboard_file, higher_lower_output, function(err) {
							if (err) {
								return console_log("Failed to write higher lower score to file!", error=true);
							}
							console_log("wrote higherlower score to scoreboard!");
						})
					})
				}
			}
		}
	}
})

// TicTacToe
var ttt_n = {};
var TicTacToe_start_game = {};
var TicTacToe_draw_board = {};
function draw_board(msg) {
	try {
		if (TicTacToe_draw_board[msg.guild.id] == true) {
			embed_chat_reply(msg, "```   A   B   C\n" +
			"1  "+ttt_n[0][0]+" | "+ttt_n[0][1]+" | "+ttt_n[0][2] + "\n  -----------\n" +
			"2  "+ttt_n[1][0]+" | "+ttt_n[1][1]+" | "+ttt_n[1][2] + "\n  -----------\n" +
			"3  "+ttt_n[2][0]+" | "+ttt_n[2][1]+" | "+ttt_n[2][2] + "```");
		}
	} catch (err) {
		console_log("Error thrown in draw_board function! " + err, error=true);
	}
}

function winning_condition(chk, msg) {
	try {
		TicTacToe_start_game[msg.guild.id] = false;
		ttt_n = [[".", ".", "."], [".", ".", "."],[".", ".", "."]];
		setTimeout(function(){
			msg_channel_send(msg, ["You Win!", "I win!"]["XO".indexOf(chk)]);
		}, 1000);
	} catch (err) {
		console_log("Error thrown in winning_condition function! " + err, error=true);
	}
}

function condition_draw(msg) {
	try {
		current = "";
		for (i=0;i<3;i++) {
			for (ii=0;ii<3;ii++) {
				current += ttt_n[i][ii]
			}
		} if (current.indexOf(".") > -1) {
			msg_channel_send(msg, "Draw!");
			TicTacToe_start_game[msg.guild.id] = false;
		}
	} catch (err) {
		console_log("Error thrown in condition_draw function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"ttt") {
		TicTacToe_start_game[msg.guild.id] = true;
		draw_board(msg);
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (TicTacToe_start_game[msg.guild.id] == true) {
			if (msg.content.length == 2 ) {
				if ("abc".indexOf(msg.content.toLowerCase()[0]) > -1 && "123".indexOf(msg.content.toLowerCase()[1]) > -1 ) {
					console_log(msg.content);
					// user place
					X = "abc".indexOf(msg.content.toLowerCase()[0]);
					Y = "123".indexOf(msg.content.toLowerCase()[1]);
					if (ttt_n[Y][X] == "X" || ttt_n[Y][X] == "O") {
						embed_chat_reply(msg, "This spot is already taken!");
						TicTacToe_draw_board[msg.guild.id] = false;
					} else {
						ttt_n[Y][X] = "X";
					
						// bot place
						bot_X = parseInt(Math.random() * 10) % 3;
						bot_y = parseInt(Math.random() * 10) % 3;
						count = 0;
						bot_failed_place = false;
						while (ttt_n[bot_y][bot_X] == "X" || ttt_n[bot_y][bot_X] == "O") {
							bot_X = parseInt(Math.random() * 10) % 3;
							bot_y = parseInt(Math.random() * 10) % 3;
							console_log("bot place taken!");
							count += 1;
							if (count > 99) {
								console_log("bot failed to place!");
								bot_failed_place = true;
								break;
							}
						} if (bot_failed_place == false) {
							ttt_n[bot_X][bot_y] = "O";
						}
				
						// check conditions
						for (i=0;i<2;i++) {
							chk = "XO"[i];
							if (ttt_n[0][0] == chk && ttt_n[0][1] == chk && ttt_n[0][2] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[1][0] == chk && ttt_n[1][1] == chk && ttt_n[1][2] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[2][0] == chk && ttt_n[2][1] == chk && ttt_n[2][2] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[0][0] == chk && ttt_n[1][0] == chk && ttt_n[2][0] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[0][1] == chk && ttt_n[1][1] == chk && ttt_n[2][1] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[0][2] == chk && ttt_n[1][2] == chk && ttt_n[2][2] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[0][0] == chk && ttt_n[1][1] == chk && ttt_n[2][2] == chk) {
								winning_condition(chk, msg);
							} else if (ttt_n[0][2] == chk && ttt_n[1][1] == chk && ttt_n[2][0] == chk) {
								winning_condition(chk, msg);
							}
						}
				
						// draw board
						draw_board(msg);
						TicTacToe_draw_board[msg.guild.id] = true;
					}
				}
			} 
		}
	}
})

// covid
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"covid") {
			// get html
			request("https://www.worldometers.info/coronavirus/", {
				headers: {
					"User-Agent": user_agent
				},
				body: "",
				method: "GET"
			}, (err, res, html) => {
				if (res.statusCode == 200) {
					// process HTML
					cases = html.split('<div class="maincounter-number">')[1].split('</span>')[0].split('#aaa">')[1];
					deaths = html.split('<h1>Deaths:</h1>')[1].split('</span>')[0].split('<span>')[1];
					recovered = html.split('<h1>Recovered:</h1>')[1].split('</span>')[0].split('<span>')[1];
					updated = html.split('color:#999; margin-top:5px; text-align:center">')[1].split('</div>')[0];
					
					infected_current = html.split('<div class="number-table-main">')[1].split('</div>')[0];
					infected_mild = html.split('<span class="number-table" style="color:#8080FF">')[1].split('</span>')[0];
					infected_serious = html.split('<span class="number-table" style="color:red ">')[1].split('</span>')[0];
					
					closed_cases = html.split('Closed Cases</span>')[1].split('<div class="number-table-main">')[1].split('</div>')[0];
					closed_recovered = html.split('Closed Cases</span>')[1].split('<span class="number-table" style="color:#8ACA2B">')[1].split('</span>')[0];
					closed_deaths = html.split('Closed Cases</span>')[1].split('<span class="number-table">')[1].split('</span>')[0];
					
					// embed
					embed_covid = new Discord.MessageEmbed();
					embed_covid.setColor(embed_color_chat);
					embed_covid.setTitle("Coronavirus Statistics");
					embed_covid.setDescription("This counter was last updated on " + updated  + "\n\u200B");
					embed_covid.addFields(
						{name: "Cases", value: "[" + cases + "]("+webserver_root_address+")\n\u200B", inline: true},
						{name: "Deaths", value: "[" + deaths + "]("+webserver_root_address+")\n\u200B", inline: true},
						{name: "Recovered", value: "[" + recovered + "]("+webserver_root_address+")\n\u200B", inline: true},
						{name: "Active Cases", value: infected_current + "\n\u200B", inline: true},
						{name: "Mild", value: infected_mild + "\n\u200B", inline: true},
						{name: "Critical", value: infected_serious + "\n\u200B", inline: true},
						{name: "Closed Cases", value: closed_cases + "\n\u200B", inline: true},
						{name: "Recovered", value: closed_recovered + "\n\u200B", inline: true},
						{name: "Dead", value: closed_deaths + "\n\u200B", inline: true}
					)
					
					// send message
					msg_channel_send(msg, embed_covid);
					
				} else {
					console_log("Failed to get covid status, server return status code " + res.statusCode + "!", error=true);
				}
			})
		}
	}
})

// sissyvac
bot.on("message", msg => {
	if (new Date() == new Date("2020-12-20")) {
		msg_channel_send(msg, ":sissyvacuum:");
	}
})

// flip a coin
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"flipcoin") {
			coin = [flip_coin_tails, flip_coin_heads][parseInt(Math.random() * 10) % 2];
			name = coin[0].toUpperCase() + coin.slice(1,coin.length).replace(flip_coin_file_extension, "") + "!";
			embed_image(msg, webserver_root_address+"img/src/coins/" + coin, name);
			console_log("Coin fliped for server " + msg.guild.id);
		}
	}
})

// roll a dice
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"roll") {
			num = (parseInt(Math.random() * 100) % 6)+1;
			embed_image(msg, webserver_root_address+"img/src/dice/dice" + num + ".png", num);
			console_log("Dice rolled for server " + msg.guild.id);
		}
	}
})

// owoify
function owo_face() {
	faces = ["(・`ω´・)", "OwO", "owo", "oωo", "òωó", "°ω°", "UwU", ">w<", "^w^"];
	return " " + faces[parseInt((Math.random()*100)%faces.length)] + " ";
}

function owoify(txt, rp=3) {
	letters = { "o" : "ow", "h" : "wh", "g" : "gw", "p" : "pw", "e" : "we",
		"a" : "wa", "f" : "fw", "m" : "mw", "l" : "w", "v" : "w", "r" : "w",
		"w" : "v", "," : owo_face(), "." : owo_face(), "!" : owo_face()}
	output = [];
	last_replace = 0;
	
	for (i=0;i<txt.length;i++) {
		if (Object.keys(letters).indexOf(txt[i]) > -1) {
			if (parseInt(Math.random()*100) % rp == 0 && last_replace != (i-1)) {
				output.push(letters[txt[i]]);
			} else {
				output.push(txt[i]);
			}
			last_replace = i;
		} else {
			output.push(txt[i]);
		}
	}
	return output.join('');
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"owoify") {
			embed_chat_reply(msg, owoify(msg.content.slice(8)));
		}
	}
})

// steam
function help_steam(msg) {
	embed_steam = new Discord.MessageEmbed();
	embed_steam.setTitle("Steam Help");
	embed_steam.setColor(embed_color_chat);
	embed_steam.addFields(
		{name: prefix[msg.guild.id]+"steaminfo {Steam ID}", value: "Shows basic profile statistics for a steam user.\n\u200B"},
		{name: prefix[msg.guild.id]+"steamsale", value: "Shows when the next Steam Sale is.\n\u200B"},
		{name: prefix[msg.guild.id]+"steamdown", value: "Checks if Steam servers are down.\n\u200B"},
		{name: prefix[msg.guild.id]+"sl {Steam ID}", value: "Displays steam ladders stats for the specified account.\n\u200B"},
		{name: prefix[msg.guild.id]+"achiv {Steam ID}", value: "Shows the number of achievements a Steam User has.\n\u200B"},
		{name: prefix[msg.guild.id]+"inv {Steam ID}", value: "Shows the value of a users CSGO inventory.\n\u200B"},
		{name: prefix[msg.guild.id]+"id {Steam ID}", value: "Get Steam user info from ID\n\u200B"},
	)
	embed_steam.setTimestamp();
	msg_channel_send(msg, embed_steam);
}

// steam info
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0, 11) == prefix[msg.guild.id]+"steaminfo ") {
			
			// get user data
			async function get_user_data(msg, callback) {
				try {
					current_user_id = msg.content.slice(11, msg.content.length);
					if (isInt_without_error(current_user_id, 0, 10**20) == true) {
						get_html("https://steamcommunity.com/profiles/" + current_user_id + "?xml=1", function(html) {
							return callback(html);
						})
					} else {
						get_html("https://steamcommunity.com/id/" + current_user_id + "?xml=1", function(html) {
							if (html.indexOf("The specified profile could not be found.") == -1) {
								return callback(html);
							
							} else {
								embed_error(msg, "Could not find user!");
								return false;
							}
						})
					}
				} catch (err) {
					return callback("?");
				}
			}
			
			// get stats
			get_user_data(msg, function(xml) {
				try {
					SteamID64 = format_html(xml.split('<steamID64>')[1].split('</steamID64>')[0]);
					SteamID = format_html(xml.split('<steamID>')[1].split('</steamID>')[0]);
					CustomURL = format_html(xml.split('<customURL>')[1].split('</customURL>')[0]);
					OnlineState = format_html(xml.split('<onlineState>')[1].split('</onlineState>')[0]);
					PrivacyState = format_html(xml.split('<privacyState>')[1].split('</privacyState>')[0]);
					VisibilityState = format_html(xml.split('<visibilityState>')[1].split('</visibilityState>')[0].replace("3", "Public").replace("2", "Friends Only").replace("1", "Private"));
					VacBanned = format_html(xml.split('<vacBanned>')[1].split('</vacBanned>')[0].replace("0", "No").replace("1", "Yes"));
					TradeBanState = format_html(xml.split('<tradeBanState>')[1].split('</tradeBanState>')[0]);
					IsLimitedAccount = format_html(xml.split('<isLimitedAccount>')[1].split('</isLimitedAccount>')[0].replace("0", "No").replace("1", "Yes"));
					MemberSince = format_html(xml.split('<memberSince>')[1].split('</memberSince>')[0]);
					UserLocation = format_html(xml.split('<location>')[1].split('</location>')[0]);
					RealName = format_html(xml.split('<realname>')[1].split('</realname>')[0]);
					Summary = format_html(xml.split('<summary>')[1].split('</summary>')[0]);
					profile_pic = format_html(xml.split('<avatarFull>')[1].split('</avatarFull>')[0].replace(/ /g, ''));
				
					// remove double links from summary
					for (i=0;i<5;i++) {
						http_index = Summary.indexOf("https");
						current_link = Summary.slice(http_index, Summary.slice(http_index).indexOf(" ") + http_index);
						link_split = current_link.split("https");
						if (link_split.length == 3) {
							if (link_split[1] == link_split[2]) {
								Summary = Summary.replace(current_link, "[{HT}"+link_split[1]+"]({HT}"+link_split[1]+")");
							}
						}
					}
				
					// embed
					embed_steamdata = new Discord.MessageEmbed();
					embed_steamdata.setTitle(SteamID);
					embed_steamdata.setColor(embed_colour_info);
					embed_steamdata.setURL("https://steamcommunity.com/profiles/" + SteamID64);
					embed_steamdata.setThumbnail(profile_pic);
					embed_steamdata.setAuthor(SteamID, profile_pic);
					embed_steamdata.addFields(
						{name: "Steam ID", value: SteamID64 + "\n\u200B", inline: true},
						{name: "Steam Name", value: SteamID + "\n\u200B", inline: true},
						{name: "Custom URL", value: CustomURL + "\n\u200B", inline: true},
						{name: "Online Status", value: OnlineState + "\n\u200B", inline: true},
						{name: "Visability", value: VisibilityState + "\n\u200B", inline: true},
						{name: "Privacy", value: PrivacyState + "\n\u200B", inline: true},
						{name: "VAC Banned", value: VacBanned + "\n\u200B", inline: true},
						{name: "Trade Banned", value: TradeBanState + "\n\u200B", inline: true},
						{name: "Limmited Account", value: IsLimitedAccount + "\n\u200B", inline: true},
						{name: "Joined Steam", value: MemberSince + "\n\u200B", inline: true},
						{name: "Location", value: UserLocation + "\n\u200B", inline: true},
						{name: "Real Name", value: RealName + "\n\u200B", inline: true},
						{name: "Summary", value: Summary.replace(/{HT}/g, "https") + "\u200B"},
					)
				
					// send message
					embed_steamdata.setTimestamp();
					msg_channel_send(msg, embed_steamdata);
				} catch (err) {
					embed_error(msg, "Failed to get steam user info, there account might be private or the ID could be be invalid!");
				}
			})
		}
	}
})

// is steam down
function array_to_dict(array) {
	dict = {};
	for (i=0;i<array.length;i++) {
		dict[array[i][0]] = array[i][2];
	}
	return dict;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"steamdown") {
			get_html("https://crowbar.steamstat.us/gravity.json", function(html) {
				data = JSON.parse(html);
				services = array_to_dict(data.services);
				
				// embed
				embed_steamdown = new Discord.MessageEmbed();
				embed_steamdown.setColor(embed_color_chat);
				embed_steamdown.setTitle("Steam Server Status");
				embed_steamdown.addFields(
					{name: "Online", value: services.online + "\n\u200B", inline: true},
					{name: "In Game", value: services.ingame + "\n\u200B", inline: true},
					{name: "\n\u200B", value: "\n\u200B", inline: true},
					{name: "Store", value: services.store + "\n\u200B", inline: true},
					{name: "Community", value: services.community + "\n\u200B", inline: true},
					{name: "Web API", value: services.webapi + "\n\u200B", inline: true},
					{name: "CSGO", value: services.csgo + "\n\u200B", inline: true},
					{name: "Dota 2", value: services.dota2 + "\n\u200B", inline: true},
					{name: "TF2", value: services.tf2 + "\n\u200B", inline: true},
				)
				embed_steamdown.setTimestamp();
				msg_channel_send(msg, embed_steamdown);
			})
		}
	}
})

// steam ladder stats
// to do
// - have seperate smaller menus for `sl profile` and `sl value`
// - show most played game

async function get_user_id(msg, callback) {
	current_user_id = msg.content.split(" ")[1];
	if (isInt_without_error(current_user_id, 0, 10**20) == false) {
		get_html("https://steamcommunity.com/id/" + current_user_id + "?xml=1", function(html) {
			if (html.indexOf("The specified profile could not be found.") == -1) {
				current_user_id = html.split('<steamID64>')[1].split('</steamID64>')[0];
				return callback(current_user_id);
							
			} else {
				embed_error(msg, "Could not find user!");
				return false;
			}
		})
	} else {
		return callback(current_user_id);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"sl ") {
			sl_url = "https://steamladder.com/profile/";
			avatar_url = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/";
			game_badge_url = "https://static.steamladder.com/static/img/game_collector/";
			
			get_user_id(msg, function(current_user_id) {
				if (current_user_id != false) {
					// steam ID
					if (isInt_without_error(current_user_id, 0, 10**20) == true) {
						// get html
						get_html(sl_url +current_user_id, function(html) {
							try {
								// process HTML
								player_name = html.split('<div class="long-name" itemprop="name">')[1].split("</div>")[0];
						
								// profile info
								player_name = e(html, [['<div class="long-name" itemprop="name">', 1], ["</div>", 0]]);
								Avatar_URL = e(html, [['<div class="profile-header">', 1], ['class="steam-avatar">', 0], ['<img itemprop="image" src="', 1]]).replace(/[ \n]/g, "");
								Custom_ID = e(html, [['<th scope="row">Steam ID</th>', 1], ["</td>", 0], [">", 1]]).replace(/[ \n]/g, "");
								Reputation = e(html, [['<th scope="row">Reputation</th>', 1], ["</td>", 0], [">", 1]]).replace(/[ \n]/g, "");
								Public = e(html, [['<i class="material-icons', 1], ["</i>", 0]]).replace(/[ \n]/g, "");
								Country = e(html, [['<th scope="row">Country</th>', 1], ["</a>", 0], ['">', 1]]).replace(/[ \n]/g, "");
								Years = e(html, [['<th scope="row">Steam years ', 1], ["</td>", 0], ["<td>", 1]]).replace(/[ \n]/g, "");
								Donator = e(html, [['<th scope="row">Donator</th>', 1], ["</i>", 0], ['">', 1]]).replace(/[ \n]/g, "");
								Friends = e(html, [['<th scope="row">Friends</th>', 1], ["</a>", 0], ['">', 1]]).replace(/[ \n]/g, "");
								
								// level stats
								Est_cost = e(html, [['<h5>Level stats</h5>', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "");
								Next_lvl_cost = e(html, [['<th scope="row">Next Level Cost ', 1], ["</a>", 0], ['blank">', 1]]).replace(/[ \n]/g, "");
								world_lvl = e(html, [['<th scope="row">World Rank</th>', 1], ["</a>", 0], ['xp/">', 1]]).replace(/[ \n]/g, "");
								region_lvl = e(html, [['<th scope="row">Region Rank</th>', 1], ["</span>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ") + ")";
								country_lvl = e(html, [['<th scope="row">Country Rank</th>', 1], ["</span>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ") + ")";
								best_lvl = e(html, [['<div class="long">World</div>', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ");
						
								// playtime stats
								playtime = e(html, [['<th scope="row">Total Playtime</th>', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "").replace("hours", " hours");
								avg_playtime = e(html, [['<th scope="row">Avg. Playtime ', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "").replace("min", " min");
								world_playtime = e(html, [["<h5>Playtime stats</h5>", 1], ['<th scope="row">World Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								region_playtime = e(html, [["<h5>Playtime stats</h5>", 1], ['<th scope="row">Region Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								country_playtime = e(html, [["<h5>Playtime stats</h5>", 1], ['<th scope="row">Country Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								best_playtime = e(html, [["<h5>Playtime stats</h5>", 1], ['<div class="long">World</div>', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "");
						
								// game stats
								game_badge = game_badge_url + e(html, [['src="'+game_badge_url, 1], [">", 0]]);
								games_owned = e(html, [['class="game-text-stats"', 1], ["</div>", 0]]).replace(/[ \n>]/g, "").replace("Games"," Games");
								Est_game_cost = e(html, [['<h5>Games stats</h5>', 1], ['<th scope="row">Estimated Cost ', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "");
								world_games = e(html, [["<h5>Games stats</h5>", 1], ['<th scope="row">World Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								region_games = e(html, [["<h5>Games stats</h5>", 1], ['<th scope="row">Region Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								country_games = e(html, [["<h5>Games stats</h5>", 1], ['<th scope="row">Country Rank</th>', 1], ["</td>", 0], ['/">', 1]]).replace(/[ \n]/g, "").replace('</a><spanclass="percentage">'," ").replace("</span>","");
								best_games = e(html, [["<h5>Games stats</h5>", 1], ['<div class="long">World</div>', 1], ["</td>", 0], ['<td>', 1]]).replace(/[ \n]/g, "");
						
								// format
								total_cost = "$" + String( Math.round((parseFloat(Est_cost.replace(/[$,]/g,"")) + parseFloat(Est_game_cost.replace(/[$,]/g,""))) * 100 ) / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
								Public = Public.replace("check_circle", "yes").replace("cancel", "no").replace('pos">', "").replace('neg">', "");
								Donator = Donator.replace("cancel", "no");
								avg_playtime = avg_playtime.replace("minutes", "mins");
						
								if (Country.indexOf('Steamyears<iclass="material-iconsinfo"data-') > -1) {
									Country = "Not Specified";
								}
								if (Friends.indexOf('Status</th><tdclass="td_status') > -1) {
									Friends = "Private";
								}
						
								// embed
								embed_sl = new Discord.MessageEmbed();
								embed_sl.setColor(embed_color_chat);
								embed_sl.setAuthor(player_name + "'s Steam Ladders Stats", Avatar_URL, sl_url+current_user_id);
								embed_sl.setThumbnail(encodeURI(Avatar_URL));
								embed_sl.addFields(
									{name: "Level Value", value: "["+Est_cost+"](https://jaredbot.uk/)\n\u200B", inline: true},
									{name: "\n\u200B", value: "\n\u200B", inline: true},
									{name: "Games Value", value: "["+Est_game_cost+"](https://jaredbot.uk/)\n\u200B", inline: true},
									{name: "Total Value", value: "["+total_cost+"](https://jaredbot.uk/)\n\u200B", inline: true},
									{name: "\n\u200B", value: "\n\u200B", inline: true},
									{name: "Games Owned", value: "["+games_owned+"](https://jaredbot.uk/)\n\u200B", inline: true},
							
									{name: "Profile", value: "Name: " + player_name + "\nCustom ID: " + Custom_ID + "\nReputation: " + Reputation +
										"\nPublic: " + Public + "\nCountry: " + Country + "\nAccount Age: " + Years + "\nSL Donator: " + Donator +
										"\nFriends: " + Friends + "\n\u200B", inline: true},
									{name: "\n\u200B", value: "\n\u200B", inline: true},
									{name: "Games", value: "World Rank: " + world_games + "\nRegion Rank: " + region_games + "\nCountry Rank: " + 
										country_games + "\nBest World Rank: " + best_games + "\n\u200B", inline: true},
									{name: "Level", value: "Level Value: " + Est_cost + "\nNext Level Cost: " + Next_lvl_cost + "\nWorld: " +
										world_lvl + "\nRegion: " + region_lvl + "\nCountry: " + country_lvl + "\nBest World Rank: " + 
										best_lvl + "\n\u200B", inline: true},
									{name: "\n\u200B", value: "\n\u200B", inline: true},
									{name: "Playtime", value: "Total Playtime: " + playtime + "\nAvg Playtime: " + avg_playtime + "\nWorld: " +
										world_playtime + "\nRegion: " + region_playtime + "\nCountry: " + country_playtime + "\nBest Playtime: " +
										best_playtime + "\n\u200B", inline: true},
								)
								embed_sl.setTimestamp();
								embed_sl.setFooter(current_user_id);
								msg_channel_send(msg, embed_sl);
							} catch (err) {
								embed_error(msg, "Failed to get user info!");
								console_log("Failed to get steam ladder info! " + err, error=true);
							}
						})
					}
				} else {
					embed_error(msg, "You must enter in the Users steam64 ID");
				}
			})
		}
	}
})

// next steam sale
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"steamsale") {
			get_html("https://steamdb.info/sales/history/", html => {
				// get data
				seconds = html.split('<span id="js-sale-countdown" role="tab" data-target="')[1].split('"')[0] - Date.now();
				sale_name = html.split('<span class="sale-name">')[1].split('</h')[0].replace('</span>', "");
				sale_name = "[" + sale_name.replace(/\n/g, "") + "]("+webserver_root_address+")";
				days = parseInt(seconds / 86400000);
				hours = parseInt((seconds % 86400000) / 3600000);
				mins = parseInt((seconds % 3600000) / 60000);
				secs = parseInt((seconds % 60000) / 1000);
				
				// embed
				embed_steamsale = new Discord.MessageEmbed();
				embed_steamsale.setColor(embed_color_chat);
				embed_steamsale.setTitle("Next Steam sale is in...");
				embed_steamsale.addFields(
					{name: "" +days + " days, " + hours + " hours, " + mins + " mins, " + secs + " seconds!", value: sale_name + "\u200B"},
				)
				embed_steamsale.setTimestamp();
				msg_channel_send(msg, embed_steamsale);
			})
		}
	}
})

// steam achievements
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"achiv " || msg.content.slice(0, 14) == prefix[msg.guild.id]+"achievements ") {
			// get Steam ID
			get_user_id(msg, function(current_user_id) {
				if (current_user_id != false) {
					// get HTML
					get_html("https://completionist.me/steam/profile/" + current_user_id, html => {
						try {
							colm1 = remove_html_tags(html.split('<div class="col-xl-6">')[1].split('<div class="divider')[0]);
							colm1 = colm1.replace(/  /g, "").replace(/\n/g, "").replace(/&hellip;/g, " ").replace(/">/g, ">").replace(/b>/g, ">");
							colm1 = colm1.replace(' Restricted', ' Restricted>').replace(' Maximum', ' Maximum>').split('>');
							name = html.split('<div class="widget-profile-top')[1].split('<h5 class="username">')[1].split('<span class="">')[1].split('</span>')[0].replace(/  /g,'').replace(/\n/g,'');
							pfp = 'https://steamcdn-a.akamaihd.net/steamcommunity/' + html.split('background-image: url(https://steamcdn-a.akamaihd.net/steamcommunity/')[1].split(')')[0];
							perfect_games = html.split('<span class="value text-perfect glow-perfect">')[1].split('</i>')[1].split('</span>')[0].replace(/ /g, '').replace(/\n/g, '');
							data = {};
						
							for (i=0;i<colm1.length;i++) {
								current_row = colm1[i].replace(/b>/g, "").split("Games ")[0].split('Do not count')[0];
								current_row = current_row.replace('Ach', ' Ach');//.replace('to Perfection', 'achiv too 100').replace('in Untouched', 'Untouched Achiv');
								if (current_row.length > 0) {
									row = current_row.split(' ');
									data[row.slice(1, row.length).join('_')] = row[0].replace('Daily', '');
								}
							}
						
							// embed
							embed_achiv = new Discord.MessageEmbed();
							embed_achiv.setColor(embed_color_chat);
							embed_achiv.setTitle(name + " Achievements");
							embed_achiv.setAuthor(name, pfp);
							embed_achiv.setThumbnail(pfp);
							embed_achiv.addFields(
								{name: "\u200B\nAchievements", value: "[" + data.Achievements + "]("+webserver_root_address+")\n\u200B", inline: true},
								{name: "\u200B\nPerfect Games", value: "[" + perfect_games + "]("+webserver_root_address+")\n\u200B", inline: true},
								{name: "\u200B\n", value: "\n\u200B", inline: true},
								
								{name: "Games With Achiv", value: data.owned_games_with_achievements + "\n\u200B", inline: true},
								{name: "Achiv to 100%", value: data.to_Perfection + "\n\u200B", inline: true},
								{name: "Games in Progress", value: data.games_in_progress + "\n\u200B", inline: true},
								
								{name: "Untouched Games", value: data.untouched_games + "\n\u200B", inline: true},
								{name: "Restricted Games", value: data.restricted_games + "\n\u200B", inline: true},
								{name: "Started games", value: data.started_games + "\n\u200B", inline: true},
								
								{name: "Untouched Achiv", value: data.in_Untouched + "\n\u200B", inline: true},
								{name: "Owned Achiv", value: data.in_Owned + "\n\u200B", inline: true},
								{name: "Restricted Achiv", value: data.in_Restricted + "\n\u200B", inline: true},
								
								{name: "Daily Average", value: data.Maximum + "\n\u200B", inline: true},
								{name: "Daily Maximum", value: data.Average + "\n\u200B", inline: true},
								{name: "\n\u200B", value: "\n\u200B", inline: true},
							)
							msg_channel_send(msg, embed_achiv);
						} catch (err) {
							embed_error(msg, "Failed to get user data, the specified account might not be in the database, if you own this account then please go to [completionist.me](https://completionist.me/steam/profile/" + current_user_id+") and sign in!");
							console_log("Failed to get user data " + msg.member.user.tag);
						}
					})
				}
			})
		}
	}
})

// csgo inventory
var inv_retry = {};
var inv_max_tries = 2;
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"inv " || 
		msg.content.slice(0, 11).toLowerCase() == prefix[msg.guild.id]+"inventory ") {
			// get Steam ID
			function get_steam_inventory_value() {
				console_log("Checking steam inventory!");
				get_user_id(msg, function(current_user_id) {
					if (current_user_id != false) {
						// get HTML
						currency = "GBP";
						get_html("https://csgobackpack.net/index.php?nick=" + current_user_id + "&currency=" + currency, html => {
							try {
								// format data
								total_value = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<p>', 1], ['<a', 0]]).replace(/ /g, '').replace("(", ' (')));
								items = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>Items', 1], ['<p>', 1], ['</p>', 0]]).replace(/ /g, '').replace("(", ' (')));
								statreak = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>StatTrak', 1], ['<p>', 1], ['</p>', 0]]).replace(/ /g, '').replace("(", ' (')));
								cases = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>Weapon Cases', 1], ['<p>', 1], ['</p>', 0]]).replace(/ /g, '').replace("(", ' (')));
								knifes = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>Knives', 1], ['<p>', 1], ['</p>', 0]]).replace("(", ' (')));
								graffiti = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>Sealed graffiti', 1], ['<p>', 1], ['</p>', 0]]).replace(/ /g, '').replace("(", ' (')));
								passes = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3>Passes', 1], ['<p>', 1], ['</p>', 0]]).replace(/ /g, '').replace("(", ' (')));
								name = format_html(remove_html_tags(e(html, [['<div id="info"', 1], ['<h3 style', 1], ['>', 1], ['</h3>', 0]]).replace('</h3','')));
								pfp = "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/" + e(html, [['<div id="info"', 1], ['public/images/avatars/', 1], ['"', 0]]);
								
								// embed
								embed_inv = new Discord.MessageEmbed();
								embed_inv.setColor(embed_color_chat);
								embed_inv.setTitle(name + " CSGO Inventory Value");
								embed_inv.setThumbnail(pfp);
								embed_inv.setAuthor(name, pfp);
								embed_inv.setTimestamp();
								embed_inv.addFields(
									{name: "\u200B\nTotal Value", value: total_value + "\n\u200B", inline: true},
									{name: "\u200B\n", value: "\n\u200B", inline: true},
									{name: "\u200B\nTotal Items", value: items + "\n\u200B", inline: true},
									
									{name: "Stattrak", value: statreak + "\u200B", inline: true},
									{name: "Cases", value: cases + "\u200B", inline: true},
									{name: "Knifes", value: knifes + "\u200B", inline: true},
									
									{name: "Graffiti", value: graffiti + "\u200B", inline: true},
									{name: "Passes", value: passes + "\u200B", inline: true},
									{name: "\n\u200B", value: "\u200B", inline: true},
								)
								
								// retry
								if (inv_retry[msg.guild.id] == undefined) {
									inv_retry[msg.guild.id] = 1;
								} else {
									inv_retry[msg.guild.id] += 1;
								}
								
								if (total_value == "?") {
									if (inv_retry[msg.guild.id] < inv_max_tries) {
										setTimeout(function() {
											get_steam_inventory_value();
										}, get_inv_cooldown);
									} else {
										embed_error(msg, "Failed to get Inventory data!");
									}
								} else {
									msg_channel_send(embed_inv);
								}
							} catch (err) {
								embed_error(msg, "Failed to get user data, please wait then try again latter!");
								console_log("Error thrown when fetting users inventory! " + err, error=true);
							}
						})
					}
				})
			} get_steam_inventory_value();
		}
	}
})

// find steam user by ID
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"id ") {
			user_id = encodeURI(msg.content.slice(4, msg.content.length));
			get_html("https://steamidfinder.com/lookup/" + user_id, function(html) {
				pfp = remove_html_tags(format_html(e(html, [['class="img-rounded avatar"', 1], ['src="', 1], ['"', 0]])));
				body = remove_html_tags(format_html(e(html, [['class="col-md-12"', 1], ['class="panel-body"', 1], ['<a target="_blank"', 0]])));
				body2 = remove_dup_chars(remove_dup_chars(remove_dup_chars(body.replace(/[\r\t>]/g, ''), '  ', ' '), '\n\n', '\n'), ' \n', '');
				body2 = body2.replace('profile http', '\nprofile http');
				
				// embed
				embed_user_id = new Discord.MessageEmbed();
				embed_user_id.setColor(embed_color_chat);
				embed_user_id.setThumbnail(pfp);
				embed_user_id.addField('Steam User Info', body2);
				embed_user_id.setTimestamp();
				msg_channel_send(msg, embed_user_id);
				
			})
		}
	}
})

// urban dict
function help_dict(msg) {
	embed_dict = new Discord.MessageEmbed();
	embed_dict.setTitle("Help Dictonary");
	embed_dict.setDescription('If your looking for a professional definition of a word then use dict command, for slang or modern language use urban.');
	embed_dict.setColor(embed_color_chat);
	embed_dict.addFields(
		{name: prefix[msg.guild.id]+"dict", value: "Gets definition for a word from the dictionary.com.\n\u200B"},
		{name: prefix[msg.guild.id]+"urban", value: "Gets definition for a word from the urban dictonary.\n\u200B"},
	)
	embed_dict.setTimestamp();
	msg_channel_send(msg, embed_dict);
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"urban ") {
			word = msg.content.slice(7, msg.content.length);
			get_html("https://www.urbandictionary.com/define.php?term=" + word, function(html) {
				// check for invalid term
				if (html.length == 0) {
					embed_error(msg, "Coudn't find the term you where looking for!");
					return false;
				}
				
				word_name = format_html(remove_html_tags(html.split('<a class="word" href="/define.php?term=')[1].split('">')[1].split('</a>')[0]));
				word_def = format_html(remove_html_tags(html.split('<div class="meaning">')[1].split('</div>')[0]));
					
				// embed
				embed_urban = new Discord.MessageEmbed();
				embed_urban.setColor(embed_color_chat);
				embed_urban.setTitle(word_name.slice(0, 100)  + "\u200B");
				embed_urban.setURL(encodeURI("https://www.urbandictionary.com/define.php?term=" + word));
				if (word_def.length > 2048) {
					embed_urban.setDescription(word_def.slice(0, 2040) + "...\n\u200B");
				} else {
					embed_urban.setDescription(word_def.slice(0, 2040) + "\n\u200B");
				}
				
				embed_urban.setTimestamp();
				msg_channel_send(msg, embed_urban);
			})
		}
	}
})

// dictonary
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"dict ") {
			word = msg.content.slice(6, msg.content.length);
			get_html("https://www.dictionary.com/browse/" + word, function(html) {
				if (html.length > 0) {
					term = format_html(html.split('id="top-definitions-section"')[1].split('<h1 class="css-2m2rhw e1wg9v5m4">')[1].split('</h1>')[0]);
					definition = format_html(remove_html_tags(html.split('id="top-definitions-section"')[1].split('<section class="css-pnw38j e1hk9ate0">')[1].split('<div class="expandable-content">')[0])).split('VIDEO')[0];
					embed_chat_reply_header(msg, definition, term, pfp=false);
				} else {
					embed_error(msg, "Could not find the specified term!");
				}
			})
		}
	}
})

// change prefix
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8).toLowerCase() == "-prefix " || 
		msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"prefix ") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				new_prefix = msg.content.slice(8, msg.content.length);
				if (new_prefix.length == 1) {
					if (ASCII.indexOf(new_prefix) > -1) {
						old_prefix = prefix[msg.guild.id];
						prefix[msg.guild.id] = new_prefix;
						create_file_then_append_data(msg, custom_prefix_filename, prefix[msg.guild.id], endl="", overwrite=true);
						embed_chat_reply(msg, "["+tag_tag_output+"] Prefix changed from `" + old_prefix + "` to `" + prefix[msg.guild.id] + "`!");
						console_log("Prefix changed from '" + old_prefix + "' to '" + "' for " + msg.guild.id, error=false, mod=true);
					} else {
						embed_error(msg, "Prefix must be an ASCII character!");
					}
				} else {
					embed_error(msg, "Prefix must be a single character!");
				}
			} else {
				embed_error(msg, "You need manage messages permission to change the bots prefix!");
			}
		}
	}
})

// show current prefix
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"prefix") {
			embed_chat_reply(msg, "JaredBot's prefix is `" + prefix[msg.guild.id] + "`");
		}
	}
})

// read custom prefixs
var custom_prefix_filename = "prefix.txt";
bot.on("ready", msg => {
	// get prefix
	read_file(custom_prefix_filename, prefix, allow_non_int=true, sep="", remove_dupes=false, single_item=true);
})

// check for blank prefix
bot.on("message", msg => {
	if (msg.guild != null && prefix[msg.guild.id] == undefined) {
		create_file_then_append_data(msg, custom_prefix_filename, "-", endl="", overwrite=true);
		prefix[msg.guild.id] = "-";
		console_log("Set Deafult prefix for server " + msg.guild.name + " !", error=false, mod=true);
	}
})

// get user info
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"userinfo") {
			let member = msg.mentions.members.first();
			if (member != undefined) {
				joined = new Date(member.joinedTimestamp).toGMTString();
				userid = member.id;
				userName = member.user.tag.split("#")[0];
				userTag = member.user.tag;
				nickname = String(member.displayName).replace(null, "None");
				avatar_url = member.user.avatarURL();
				boosting_since = new Date(member.premiumSinceTimestamp).toGMTString();
				joined_discord = new Date(member.user.createdAt).toGMTString();
				current_user_roles = member._roles;
				guild = member;
				if (avatar_url == null) {
					avatar_url = webserver_root_address+"img/src/blank_avatar.png";
				}
			} else {
				joined = new Date(msg.member.joinedTimestamp).toGMTString();
				userid = msg.author.id;
				userName = msg.member.user.tag.split("#")[0];
				userTag = msg.member.user.tag;
				nickname = String(msg.member.displayName).replace(null, "None");
				avatar_url = msg.author.avatarURL();
				boosting_since = new Date(msg.member.premiumSinceTimestamp).toGMTString();
				joined_discord = new Date(msg.member.user.createdAt).toGMTString();
				current_user_roles = msg.member._roles;
				guild = msg.member;
			}
			
			// check for non-nitro user
			if (boosting_since.indexOf("1970") > -1) {
				boosting_since = "Not Boosting";
			}
		
			// get roles
			server_guild = bot.guilds.cache.get(msg.guild.id);
			current_roles = [];
			for (i=0;i<current_user_roles.length;i++) {
				current_roles.push(server_guild.roles.cache.get(current_user_roles[i]).name);
			} 
			roles = current_roles.join("\n");
		
			embed_user_info = new Discord.MessageEmbed();
			embed_user_info.setTitle(userName + " Stats");
			embed_user_info.setColor(embed_color_chat);
			embed_user_info.setURL("https://discordapp.com/users/" + userid);
			embed_user_info.setDescription("These are a list of user stats for " + userName + "\u200B");
			embed_user_info.setAuthor(userName + " | " + msg.guild.name, avatar_url);
			embed_user_info.setThumbnail(avatar_url);
			embed_user_info.addFields(
				{name: "User Name", value: userName + "\n\u200B", inline: true},
				{name: "\n\u200B", value: "\n\u200B", inline: true},
				{name: "Nickname", value: nickname + "\n\u200B", inline: true},
				{name: "Roles", value: roles + "\n\u200B", inline: true},
				{name: "\n\u200B", value: "\n\u200B", inline: true},
				{name: "User ID", value: userid + "\n" + userTag + "\n<@" + userid + ">\n\u200B", inline: true},
				{name: "Joined Server", value: joined + "\n\u200B"},
				{name: "Joined Discord", value: joined_discord + "\n\u200B"},
				{name: "Boosting Since", value: boosting_since + "\n\u200B"}
			)
		
			embed_user_info.setTimestamp();
			embed_user_info.setFooter(userid);
			msg_channel_send(msg, embed_user_info);
		}
	}
})

// server info
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"serverinfo") {
			creation_date = msg.guild.joinedTimestamp;
			
			// get roles
			roles = [];
			msg.guild.roles.cache.forEach(role => {
				roles.push(role.name);
			})
			total_roles = roles.length;
			roles_list = roles.join(", ").replace("@everyone","").slice(0, 1020);
			if (roles_list.length == 1020) {
				roles_list += "...";
			}
			
			// member counts
			member_count = msg.guild.members.cache.filter(member => !member.user.bot).size;
			bot_count = msg.guild.members.cache.filter(member => member.user.bot).size;
			total_members = msg.guild.memberCount;
			
			// status
			online = msg.guild.members.cache.filter(member => member.user.presence.status == "online").size;
			offline = msg.guild.members.cache.filter(member => member.user.presence.status == "offline").size;
			idle = msg.guild.members.cache.filter(member => member.user.presence.status == "idle").size;
			
			// channels
			text_channels = msg.guild.channels.cache.filter(channel => channel.type == "text").size;
			voice_channels = msg.guild.channels.cache.filter(channel => channel.type == "voice").size;
			total_channels = text_channels + voice_channels;
			
			// embed
			embed_serverinfo = new Discord.MessageEmbed();
			embed_serverinfo.setColor(embed_color_chat);
			embed_serverinfo.setTitle("Server Info");
			embed_serverinfo.setDescription("stats for " + msg.guild.name);
			embed_serverinfo.setThumbnail(msg.guild.iconURL());
			embed_serverinfo.setTimestamp();
			embed_serverinfo.addFields(
				{name: "Total Members", value: "["+total_members+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Total Channels", value: "["+total_channels+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Total Roles", value: "["+total_roles+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Member Count", value: "Members: ["+member_count+"]("+webserver_root_address+")\n\u200BBot Count: ["+bot_count+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Status", value: "Online: ["+online+"]("+webserver_root_address+")\n\u200BOffline: ["+offline+"]("+webserver_root_address+")\n\u200BIdle: ["+idle+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Channels", value: "Text Channels: ["+text_channels+"]("+webserver_root_address+")\n\u200BVoice Channels: ["+voice_channels+"]("+webserver_root_address+")\n\u200B", inline: true},
				{name: "Roles", value: roles_list + "\n\u200B", inline: false},
			)
			msg_channel_send(msg, embed_serverinfo);
		}
	}
})

// role info
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"roleinfo") {
			// get role ID
			if (msg.content.indexOf("<@&") > -1) {
				role_id = msg.content.split("<@&")[1].split(">")[0];
			} else if (msg.content.split(" ").length == 2) {
				role_id = msg.content.split(" ")[1];
			} else {
				embed_error(msg, "The role could not be found, please specify a mentionable role, e.g. `"+prefix[msg.guild.id]+"roleinfo @member`, be aware this will " +
				"ping all members with the specified role, to avoid this you can enter a role ID instead `"+prefix[msg.guild.id]+"roleinfo {ID}`");
				return false;
			}
			
			// role
			role = msg.guild.roles.cache.get(role_id);
			members = role.members.map(member => member.user.tag);
			
			// member list
			if (members.join(", ").length > 1000) {
				member_list = members.join(", ").slice(0, 1000) + "...";
			} else {
				member_list = members.join(", ");
			}
			
			// creation date for role
			
			// embed
			embed_role = new Discord.MessageEmbed();
			embed_role.setColor(embed_color_chat);
			embed_role.setDescription("Information for the "+role.name+" on the "+msg.guild.name+" server!");
			embed_role.setTitle("Role Info");
			embed_role.setThumbnail(msg.guild.iconURL());
			embed_role.setTimestamp();
			embed_role.addFields(
				{name: "Name", value: role.name+"\n\u200B", inline: true},
				{name: "\n\u200B", value: "\n\u200B", inline: true},
				{name: "Total Members", value: members.length, inline: true},
				
				{name: "ID", value: role.id+"\n\u200B", inline: true},
				{name: "Color", value: "#"+role.color.toString(16)+"\n\u200B", inline: true},
				{name: "Mentionable", value: role.mentionable+"\n\u200B", inline: true},
				
				{name: "Managed", value: role.managed+"\n\u200B", inline: true},
				{name: "Deleted", value: role.deleted+"\n\u200B", inline: true},
				{name: "Index", value: role.rawPosition+"\n\u200B", inline: true},
				
				{name: "Members", value: member_list+"\n\u200B", inline: false},
			)
			msg_channel_send(msg, embed_role);
		}
	}
})

// networking
function check_string(str, chrList) {
	try {
		returnType = false;
		for (i=0;i<chrList.length;i++) {
			if (str.indexOf(chrList[i]) > -1) {
				returnType = true;
			}
		}
		return returnType;
	} catch (err) {
		console_log("Error thrown in check_string function! " + err, error=true);
	}
}

port_scan_results = {};
function check_port(msg, port, host, reply=true) {
	try {
		// declare array
		url = "https://en.wikipedia.org/wiki/Open_port";
		if (port_scan_results[msg.guild.id] == undefined) {
			port_scan_results[msg.guild.id] = {};
			port_scan_results[msg.guild.id]["open"] = [];
			port_scan_results[msg.guild.id]["closed"] = [];
		}
	
		// check port
		return new Promise(function(resolve, reject) {
			// timeout
			timer = setTimeout(function() {
				reject("timeout");
				s.end();
			}, 2000);
	
			// connection
			s = net.createConnection(port, host, function() {
				clearTimeout(timer);
				resolve();
				s.end();
			})
	
			// error
			s.on("error", function(err) {
				clearTimeout(timer);
				reject(err);
			})
	
		// result
		}).then(function(promise) {
			if (reply == true) {
				embed_chat_reply_header(msg, "port " + port + " is [**open**]("+url+") on " + host + "!", "Port Scan", pfp=true);
			} else {
				port_scan_results[msg.guild.id]["open"].push(port);
			}
		}).catch(function(err) {
			if (reply == true) {
				embed_chat_reply_header(msg, "port " + port + " is [**closed**]("+url+") on " + host + "!", "Port Scan", pfp=true);
			} else {
				port_scan_results[msg.guild.id]["closed"].push(port);
			}
		})
	} catch (err) {
		console_log("Error thrown in check_port function! " + err, error=true);
	}
}

// geoip
function geoip_lookup(msg) {
	try {
		ip = msg.content.slice(7, msg.content.length);
		url = "http://geoiplookup.net/ip/" + ip;
		ipv6_url = "https://www.whtop.com/tools.ip/" + ip;
		ipv6 = false;
	
		// check if IP is valid
		if (check_string(ip, " ghijklmnopqrstuvwxyz!@#$%^&*()_+-={}[]|;'<>,\/") == true) {
			embed_error(msg, "Invalid IP address, please enter a valid IPv4 or IPv6 address, for example `"+prefix[msg.guild.id]+"geoip 216.58.205.46`!");
			return false;
		}
		
		// check for IPv6
		if (ip.indexOf(':') > -1) {
			url = ipv6_url;
			ipv6 = true;
		}
	
		// get html
		request(url, {
			headers: {
				"User-Agent": user_agent
			},
			body: "",
			method: "GET"
		}, (err, res, html) => {
			if (res.statusCode == 200) {
				// check for error
				if (html.indexOf('<strong>Sorry, there was a problem.</strong>') > -1) {
					embed_error(msg, "The server returned invalid IP address error!");
					return false;
				}
			
				// process HTML
				if (ipv6 == true) {
					table = html.split('id="result"')[1].split('<td>Country')[1].split('href="https://www.google.com/maps/')[0];
					output = {
						Continent: e(table, [['<td>Region:', 1], ['<td>', 1], ['</td>', 0]]),
						Country: e(table, [['<td>Country:', 1], ['<span class=', 1], ['<span class', 0]]),
						CountryCode: e(table, [['<td>Country:', 1], ['<span class=', 1], ['"', 0]]),
						Region: e(table, [['<td>Region:', 1], ['<td>', 1], ['</td>', 0]]),
						City: e(table, [['<td>City:', 1], ['<td>', 1], ['</td>', 0]]),
						PostalCode: e(table, [['<td>Zip Code:', 1], ['<td>', 1], ['</td>', 0]]),
						Latitude: e(table, [['Longitude:', 1], ['<td>', 1], ['</td>', 0], ['/', 0]]).replace(/ /g, ''),
						Longitude: e(table, [['Longitude:', 1], ['<td>', 1], ['</td>', 0], ['/', 1]]).replace(/ /g, ''),
						CountryCF: "\u200B",
						State: "\u200B",
						StateCode: "\u200B",
						StateCF: "\u200B",
						DMA: "\u200B",
						MSA: "\u200B",
						Timezone: "\u200B",
						CityCF: "\u200B",
						AreaCode: "\u200B",
					};
					
					
				} else {
					try {
						table = html.split('class="title-mid"')[1].split("</h2>")[1].split('</h2>')[0].replace(/[\n\r\t ]/g, "");
						tag_count = table.split('</div>').length;
						output = {};
						
						for (i=0;i<tag_count;i++) {
							if (table.split('class="ipdata"').length > 1) {
								row = table.split('class="ipdata">')[1].split('</div>')[0].replace('<div ', '');
								table = table.slice(table.indexOf('</div>')+6, table.length);
								row = row.replace("&nbsp;", "").split(":");
								output[row[0]] = row[1];
							}
						}
					} catch (err) {
						embed_error(msg, "Failed to get geoip data! " + err);
						console_log("Failed to get geoip data!", error=true);
					}
				}
			
				// check for error
				if (output.length == 0) {
					embed_error(msg, "Failed to get Geoip information for " +ip+"!");
					return false;
				}
			
				// google maps url
				google_maps = "https://www.google.com/maps/search/?api=1&query=" + output.Latitude + "," + output.Longitude;
			
				// embed
				embed_whois = new Discord.MessageEmbed();
				embed_whois.setColor(embed_color_chat);
				embed_whois.setTitle("WhoIS " + ip);
				embed_whois.setDescription("The Geo-location and country lookup tool performs real-time lookups for an IP to return you " +
				"the geographical location of the specific IP. Here is the location information for ["+ip+"]("+google_maps+")\n\u200B");
				embed_whois.addFields(
					{name: "Continent", value: output.Continent+"\u200B", inline: true},
					{name: "Country", value: output.Country+"\u200B", inline: true},
					{name: "Country Code", value: output.CountryCode+"\u200B", inline: true},
					{name: "Country CF", value: output.CountryCF+"\u200B", inline: true},
					{name: "Region", value: output.Region+"\u200B", inline: true},
					{name: "State", value: output.State+"\u200B", inline: true},
					{name: "State Code", value: output.StateCode+"\u200B", inline: true},
					{name: "State CF", value: output.StateCF+"\u200B", inline: true},
					{name: "DMA", value: output.DMA+"\u200B", inline: true},
					{name: "MSA", value: output.MSA+"\u200B", inline: true},
					{name: "City", value: output.City+"\u200B", inline: true},
					{name: "Postal Code", value: output.PostalCode+"\u200B", inline: true},
					{name: "Timezone", value: output.Timezone+"\u200B", inline: true},
					{name: "Area Code", value: output.AreaCode+"\u200B", inline: true},
					{name: "City CF", value: output.CityCF+"\u200B", inline: true},
					{name: "Latitude", value: output.Latitude+"\n\u200B", inline: true},
					{name: "Longitude", value: output.Longitude+"\n\u200B", inline: true},
					{name: "\n\u200B", value: "\n\u200B", inline: true}
				)
				embed_whois.setTimestamp();
				msg_channel_send(msg, embed_whois);
			
			}
		})
	} catch (err) {
		console_log("Error thrown in geoip_lookup function! " + err, error=true);
	}
}

var execute_cooldown = {};
function execute_cmd(msg, cmd_name, msg_content) {
	try {
		// cooldown
		if (execute_cooldown[msg.guild.id] == undefined) {
			execute_cooldown[msg.guild.id] = false;
		}
	
		// command
		if (execute_cooldown[msg.guild.id] == false) {
			// send initial message
			execute_cooldown[msg.guild.id] = true;
			command = msg_content.slice(cmd_name.length+2, msg_content.length);
			msg_channel_send(msg, "Executing " + cmd_name + " please wait!").then(reply_msg => {
				// run command
				if (check_string(command, "!@#$%^&*()_+-=;:'|,\/<>") == false) {
					exec(cmd_name + " " + command, (err, stdout, stderr) => {
						if (stdout != undefined) {
							try {
								if (reply_msg != undefined) {
									reply_msg.delete();
								}
								execute_cooldown[msg.guild.id] = false;
								stdout = stdout.replace(/[\r\t\b\f]/g, "");
								embed_chat_reply_header(msg, stdout.slice(0, 2048), cmd_name + " Results", pfp=true);
							} catch (err) {
								console_log("Error thrown in execute_cmd function! " + err, error=true);
							}
						}
					})
				} else {
					embed_error(msg, "Failed to run, forbidden characters detected in command!");
					execute_cooldown[msg.guild.id] = false;
					reply_msg.delete();
				}
			}).catch(err => {
				console_log("Error thrown in execute_cmd msg_channel_send! " + err, error=true);
			})
		} else {
			embed_error(msg, "Please wait for the first command to finish executing before issuing another");
		}
	} catch (err) {
		console_log("Error thrown in execute_cmd function! " + err, error=true);
	}
}

function help_network_cmd(msg) {
	try {
		embed_network = new Discord.MessageEmbed();
		embed_network.setTitle("Help Networking commands");
		embed_network.setColor(embed_color_chat);
		embed_network.setAuthor("JaredBot | Command list", lion_profile_pic);
		embed_network.setThumbnail(lion_profile_pic);
		embed_network.setTimestamp();
		embed_network.addFields (
			{name: "Ping", value: "`"+prefix[msg.guild.id]+"ping {host/IP}` test network connection to a server.\n\u200B", inline: true},
			{name: "Nslookup", value: "`"+prefix[msg.guild.id]+"nslookup {host/IP}` gets Name Server information.\n\u200B", inline: true},
			{name: "Tracert", value: "`"+prefix[msg.guild.id]+"tracert {host/IP}` trace packet route through network.\n\u200B", inline: true},
			{name: "Pathping", value: "`"+prefix[msg.guild.id]+"pathping {host/IP}` trade packet route and ping node.\n\u200B", inline: true},
			{name: "Ipconfig", value: "`"+prefix[msg.guild.id]+"ipconfig` show IP address of network adapters.\n\u200B", inline: true},
			{name: "Whois", value: "`"+prefix[msg.guild.id]+"whois {host/IP}` lookup registered info for domain.\n\u200B", inline: true},
			{name: "Speedtest", value: "`"+prefix[msg.guild.id]+"speedtest` measures upload/download speed of JaredBot servers.\n\u200B", inline: true},
			{name: "Geoip", value: "`"+prefix[msg.guild.id]+"geoip {IP}` gets geographical location data for IP.\n\u200B", inline: true},
			{name: "Check Proxy", value: "`"+prefix[msg.guild.id]+"checkproxy` checks if an IP address is a proxy or not.\n\u200B", inline: true},
			{name: "Port Scan", value: "`"+prefix[msg.guild.id]+"help port`.\n\u200B", inline: true},
			
		)
		msg_channel_send(msg, embed_network);
	} catch (err) {
		console_log("Error thrown in help_network_cmd function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"ping ") {
			execute_cmd(msg, "Ping", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"nslookup ") {
			execute_cmd(msg, "Nslookup", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"tracert ") {
			execute_cmd(msg, "Tracert", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"pathping ") {
			execute_cmd(msg, "Pathping", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"ipconfig") {
			if (authorised_IDs.indexOf(msg.author.id) > -1) {
				execute_cmd(msg, "Ipconfig", msg.content);
			} else {
				embed_error(msg, "Only Jared can run the ipconfig command, ipconfig is used to display the IP configuration information " +
				"for the JaredBot servers, knowing the IP would make it easier for an attacker to locate the exact computer the " +
				"server is running on. To prevent aiding an attacker, the command has been locked. Why have this command in the bot at all? " +
				"Sometimes i need to know the IP address of the server, so that i can remotly connect to the machine using a remote desktop " +
				"application, to do maintenance. The server is 'headless' this means it does not have a screen, keyboard, or mouse. The only " +
				" way to interact with it is using remote desktop software, and you have to know the IP in order to connect to the server.");
			}
		} else if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"whois ") {
			execute_cmd(msg, "Whois", msg.content);
		} else if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"speedtest") {
			execute_cmd(msg, "Speedtest", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"echo ") {
			execute_cmd(msg, "Echo", msg.content);
		} else if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"geoip ") {
			geoip_lookup(msg);
		}
	}
})

port_scan_timeout = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"port ") {
			command = msg.content.split(" ");
			if (command.length == 3) {
				port = command[1];
				host = command[2];
				
				// single port
				if (isInt_without_error(port, 0, 65535) == true) {
					if (isInt(msg, port, 0, 65535, "port") == true) {
						if (check_string(host, "!@#$%^&*()_+-= <>,\/?`~") == false) {
							// check port
							check_port(msg, parseInt(port), host, reply=true);
						} else {
							embed_error(msg, "Invalid host, please make sure to enter a valid domain, for example `"+prefix[msg.guild.id]+"port 80 google.com`!");
						}
					}
				
				// port range
				} else {
					if (port.split("-").length == 2) {
						start_port = port.split("-")[0];
						end_port = port.split("-")[1];
						
						// check for undefined
						if (port_scan_timeout[msg.guild.id] == undefined) {
							port_scan_timeout[msg.guild.id] = false;
						}
						
						// run port scan
						if (port_scan_timeout[msg.guild.id] == false) {
							if (isInt(msg, start_port, 0, 65535, "start port") == true) {
								if (isInt(msg, end_port, 0, 65535, "end port") == true) {
									if (end_port > start_port) {
										// timeout
										port_scan_timeout[msg.guild.id] = true;
										mins = parseInt(((end_port - start_port) * 2) / 60);
										secs = parseInt(((((end_port - start_port) * 2) / 60) % 1) * 60);
										embed_chat_reply(msg, "port scan started, the scan is estimated to take "+mins+" mins, and "+secs+" seconds!");
									
										// run port scan over port range
										async function port_range() {
											try {
												port_scan_results[msg.guild.id] = {};
												port_scan_results[msg.guild.id]["open"] = [];
												port_scan_results[msg.guild.id]["closed"] = [];
												for (current_port=start_port;current_port<end_port;current_port++) {
													// check port
													await check_port(msg, parseInt(current_port), host, reply=false);
												}
											} catch (err) {
												console_log("Error thrown in port_range function! " + err, error=true);
											}
										}
										port_range().then(() => {
											// embed
											embed_results = new Discord.MessageEmbed();
											embed_results.setColor(embed_color_chat);
											embed_results.setTitle("Port Scan");
											embed_results.setDescription("Port scan results for " + host + ", " +
											"of the ports that where scanned within the range "+start_port+"-"+end_port+"! " + 
											port_scan_results[msg.guild.id]["open"].length + " where found to be open and " + 
											port_scan_results[msg.guild.id]["closed"].length + " closed!");
											embed_results.addFields(
												{name: "Open", value: port_scan_results[msg.guild.id]["open"].join(", ").slice(0, 1000)+"\n\u200B"},
												{name: "Closed", value: port_scan_results[msg.guild.id]["closed"].join(", ").slice(0, 1000)+"\n\u200B"},
											)
											msg_channel_send(msg, embed_results);
											port_scan_timeout[msg.guild.id] = false;
										}).catch(err => {
											console_log("Error thrown in port_range function! " + err, error=true);
										})
									} else {
										embed_error(msg, "your end port must be larger then your start port!");
									}
								}
							}
						} else {
							embed_error(msg, "Please wait for the current port scan to finish before starting another!");
						}
					}
				}
				
			} else {
				embed_error(msg, "Invalid Syntax! please make sure to use the correct format `"+prefix[msg.guild.id]+"port {port} {host}` for example "+
				"`"+prefix[msg.guild.id]+"port 80 google.com` will check if port 80 is open on the host google");
			}
		}
	}
})

// Proxy check
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 12).toLowerCase() == prefix[msg.guild.id]+"checkproxy " ||
			msg.guild != null && msg.content.slice(0, 12).toLowerCase() == prefix[msg.guild.id]+"proxycheck ") {
			ip = msg.content.slice(12, msg.content.length);
			
			url = "http://api.xdefcon.com/proxy/check/?ip=";
			get_html(url + ip, function(html) {
				response = JSON.parse(html);
				if (response.message.indexOf('IP address is not valid') > -1) {
					embed_error(msg, "The specified IP address is not valid.");
				} else {
					if (response.proxy == true) {
						embed_chat_reply_header(msg, "The IP address `" + ip + "` is using a proxy! Proxy detected!", "Proxy Check", pfp=false);
					} else if (response.proxy == false) {
						embed_chat_reply_header(msg, "The IP address `" + ip + "` is not using a proxy! Proxy not detected!", "Proxy Check", pfp=false);
					}
				}
			})
		}
	}
})


// Check Permissions
function check_perm(member, perm, url) {
	try {
		return "["+["Yes", "No"][[true, false].indexOf(member.hasPermission(perm))]+"]("+url+")";
	} catch {
		return "[?]("+url+")";
	}
}

bot.on("message", msg => {
	if (msg.guild != null && msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"perm") {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			let member = msg.mentions.members.first();
			if (member != undefined) {
				message = member;
				avatar_url = member.user.avatarURL();
				if (avatar_url == null) {
					avatar_url = webserver_root_address+"img/src/blank_avatar.png";
				}
			} else {
				message = msg.member;
				avatar_url = msg.author.avatarURL();
			}
		
			username = message.user.tag.split("#")[0];
			servername = msg.guild.name;
		
			// embed
			embed_perm_check = new Discord.MessageEmbed();
			embed_perm_check.setColor(embed_colour_info);
			embed_perm_check.setTitle(username + " Permission's");
			embed_perm_check.setAuthor(username + " | " + servername, avatar_url, "");
			embed_perm_check.setThumbnail(avatar_url);
			embed_perm_check.setDescription("These are a list of permissions "+username+" has on the "+servername+" server!");
		
			perm_url = "https://discordapp.fandom.com/wiki/Permissions";
		
			// Fields
			embed_perm_check.addFields(
				{name: "Admin", value: check_perm(message, "ADMINISTRATOR", perm_url)+"\n\u200B", inline: true},
				{name: "\u200B", value: "\u200B", inline: true},
				{name: "Mute", value: check_perm(message, "MUTE_MEMBERS", perm_url)+"\n\u200B", inline: true},
				{name: "Kick", value: check_perm(message, "KICK_MEMBERS", perm_url)+"\n\u200B", inline: true},
				{name: "\u200B", value: "\u200B", inline: true},
				{name: "Ban", value: check_perm(message, "BAN_MEMBERS", perm_url)+"\n\u200B", inline: true},
			)
		
			embed_perm_check.addFields(
				{name: "Manage", value: 
					"Manage Roles: " + check_perm(message, "MANAGE_ROLES", perm_url) + "\n" +
					"Manage Permissions: " + check_perm(message, "MANAGE_ROLES_OR_PERMISSIONS", perm_url) + "\n" +
					"Manage Channels: " + check_perm(message, "MANAGE_CHANNELS", perm_url) + "\n" +
					"Manage Messages: " + check_perm(message, "MANAGE_MESSAGES", perm_url) + "\n" +
					"Manage Emojis: " + check_perm(message, "MANAGE_EMOJIS", perm_url) + "\n" +
					"Manage Guild: " + check_perm(message, "MANAGE_GUILD", perm_url) + "\n" +
					"Manage Nicknames: " + check_perm(message, "MANAGE_NICKNAMES", perm_url) + "\n" +
					"Manage WebHooks: " + check_perm(message, "MANAGE_WEBHOOKS", perm_url) + "\n" +
					"Manage AuditLogs: " + check_perm(message, "VIEW_AUDIT_LOG", perm_url) + "\n\u200B", inline: true},
				{name: "\u200B", value: "\u200B", inline: true},
				{name: "Member", value:
					"View Channels: " + check_perm(message, "VIEW_CHANNEL", perm_url) + "\n" +
					"Add Message Reaction: " + check_perm(message, "ADD_REACTIONS", perm_url) + "\n" +
					"Read Message History: " + check_perm(message, "READ_MESSAGE_HISTORY", perm_url) + "\n" +
					"Read Messages: " + check_perm(message, "READ_MESSAGES", perm_url) + "\n" +
					"Send Messages: " + check_perm(message, "SEND_MESSAGES", perm_url) + "\n" +
					"Send Files: " + check_perm(message, "ATTACH_FILES", perm_url) + "\n\u200B", inline: true},
				{name: "Voice Channel", value:
					"Speak: " + check_perm(message, "SPEAK", perm_url) + "\n" +
					"Connect: " + check_perm(message, "CONNECT", perm_url) + "\n" +
					"Move Members: " + check_perm(message, "MOVE_MEMBERS", perm_url) + "\n" +
					"Deafen Members: " + check_perm(message, "DEAFEN_MEMBERS", perm_url) + "\n" +
					"Text To Speach: " + check_perm(message, "SEND_TTS_MESSAGES", perm_url) + "\n" +
					"Voice Detection: " + check_perm(message, "USE_VAD", perm_url) + "\n\u200B", inline: true},
				{name: "\u200B", value: "\u200B", inline: true},
				{name: "Other", value:
					"Use External Emojis: " + check_perm(message, "USE_EXTERNAL_EMOJIS", perm_url) + "\n" +
					"External Emojis: " + check_perm(message, "EXTERNAL_EMOJIS", perm_url) + "\n" +
					"Change Nickname: " + check_perm(message, "CHANGE_NICKNAME", perm_url) + "\n" +
					"Create Invite: " + check_perm(message, "CREATE_INSTANT_INVITE", perm_url) + "\n" +
					"Tag Everyone: " + check_perm(message, "MENTION_EVERYONE", perm_url) + "\n" +
					"Embed Links: " + check_perm(message, "EMBED_LINKS", perm_url) + "\n\u200B", inline: true}
			)
		
			// send message
			embed_perm_check.setTimestamp();
			embed_perm_check.setFooter(msg.author.id);
			msg_channel_send(msg, embed_perm_check);
		}
	}
})

// moderation
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6).toLowerCase() == prefix[msg.guild.id]+"warn ") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				if (msg.author.id != bot_ID) {
					let member = msg.mentions.members.first();
					if (member != undefined) {
						if (member.hasPermission("MANAGE_MESSAGES") == false) {
							embed_modderation(msg, msg.content.slice(5, msg.length), "WARNING!");
							on_warning(msg, 9, msg.content.slice(5, msg.length));
							console_log("user "+member.user.tag+" warned on server "+msg.guild.id+"!", error=false, mod=true);
						} else {
							embed_error(msg, "You can't warn mods/admins!");
						}
					} else {
						embed_error(msg, "Failed to warn! The specified User could not be found!");
					}
				}
			} else {
				embed_error(msg, "You dont have permission to warn, "+mod_error_text+" manage messages permission!");
			}
		}
	}
})

// mute
function remove_duplicate_str(txt, sep) {
	data = txt.split(sep.repeat(2)).join(sep);
	for (i=0;i<txt.split(sep.repeat(2)).length;i++) {
		data = data.split(sep.repeat(2)).join(sep);
	}
	return data;
}

async function log_muted_user(msg, user_ID, add_user=true) {
	try {
		// add user to muted database
		if (add_user == true) {
			create_file_then_append_data(msg, muted_log_file, user_ID, endl=";", overwrite=false);
			console_log("Added user to muted database! ", error=false, mod=true);
		
		// remove user from database
		} else if (add_user == false) {
			remove_text_from_file(msg, user_ID, muted_log_file, sep=";");
			
		}
	} catch (err) {
		console_log("Error thrown in log_muted_user function! " + err, error=true);
	}
}

var muted_users_dict = {};
bot.on("ready", msg => {
	// read file
	read_file(muted_log_file, muted_users_dict, allow_non_int=false, sep=";", remove_dupes=true, single_item=false);
})

async function generate_mute_role(msg, member, take_action=true, doReply=true, msg_is_guild=false) {
	try {
		if (msg_is_guild == true) {
			msg_guild = msg;
		} else {
			msg_guild = msg.guild;
		}
		
		let old_mute = msg_guild.roles.cache.find(role => role.name == "mute");
		let old_invisible = msg_guild.roles.cache.find(role => role.name == "invisible");
		if (old_mute == undefined || old_invisible == undefined) {
			try {
				// the mute role doesn't exist create it
				mute_role = await msg_guild.roles.create({
					data: {
						name: "mute",
						color: "#000000",
						permissions: []
					}
				})
			
				// create invisible role
				let invisible_role = msg_guild.roles.cache.find(role => role.name == "invisible");
				if (invisible_role == undefined) {
					invisible_role = await msg_guild.roles.create({
						data: {
							name: "invisible",
							color: "#000000",
							permissions: []
						}
					})
				}
		
				// update mute role permissions on every channel
				await msg_guild.channels.cache.forEach(channel => {
					channel.updateOverwrite(mute_role, {
						SEND_MESSAGES: false,
						ADD_REACTIONS: false
					}).then(function() {
						console_log("Updated mute role permissions for " + channel.name + " on " + msg_guild.name, error=false, mod=true);
					}).catch(err => {
						console_log("Failed to update mute role for" + channel.name + " on " + msg_guild.name, error=true);
					})
				})
			
				// add invisible role
				await msg_guild.channels.cache.forEach(channel => {
					channel.updateOverwrite(invisible_role, {
						VIEW_CHANNEL: false,
						SEND_MESSAGES: false,
						ADD_REACTIONS: false
					}).then(function() {
						console_log("Updated invisible role for " + channel.name + " on " + msg_guild.name, error=false, mod=true);
					}).catch(err => {
						console_log("Failed to update invisible role for" + channel.name + " on " + msg_guild.name, error=true);
					})
				})
			
				// update role for user
				if (take_action == true) {
					await member.roles.add(mute_role);
					if (doReply == true) {
						await embed_modderation(msg, "<@"+ member + "> This user can no longer talk!", "User Muted!");
						log_muted_user(msg, member.user.id, add_user=true);
					}
					console_log("user "+member.user.tag+" muted on server "+msg_guild.id+"!", error=false, mod=true);
				}
				return true;
			
			} catch (err) {
				console_log("Failed to create mute role for " + msg_guild.name + "! "  +err, error=true);
				if (doReply == true) {
					embed_error(msg, "Failed to mute user, JaredBot might not have the right permissions to preform the requested action! " +
					"Please go to server settings --> roles, then assign the mute and manage role permissions to JaredBot! JaredBot requires " +
					"the manage roles permission in order to create the mute and invisible roles!");
				}
			}
		} else {
			// take action on user
			if (take_action == true) {
				await member.roles.add(old_mute);
				if (doReply == true) {
					await embed_modderation(msg, "<@"+ member + "> This user can no longer talk!", "User Muted!");
					log_muted_user(msg, member.user.id, add_user=true);
				}
				console_log("user "+member.user.tag+" muted on server "+msg_guild.id+"!", error=false, mod=true);
			}
			return true;
		}
	} catch (err) {
		console_log("Error thrown in generate_mute_role function! " + err, error=true);
	}
}

async function remove_muted_role(msg, member) {
	try {
		// generate the role
		await generate_mute_role(msg, member, take_action=false);
	
		// remove mute role from user
		let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
		if (old_mute != undefined) {
			member.roles.remove(old_mute);
			embed_modderation(msg, "<@"+ member + "> They can talk again in text and voice channels!", "User Unmuted!", color="green");
			console_log("user "+member.user.tag+" unmuted on server "+msg.guild.id+"!", error=false, mod=true);
		} else {
			embed_error(msg, "Failed to remove mute role!");
		}
	} catch (err) {
		console_log("Error thrown in remove_muted_role function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"mute") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					if (member.hasPermission("MUTE_MEMBERS") == false) {
						if (msg.guild.me.hasPermission("MANAGE_ROLES") == true) {
							// mute user
							generate_mute_role(msg, member);
						} else {
							embed_error(msg, "Failed to mute the user, JaredBot does not have the right permissions, " +
							"please go to server settings --> roles, then assign JaredBot the manage roles permission and mute permission! "+
							"JaredBot requires the manage roles permission in order to create the mute and invisible roles!");
						}
					} else {
						embed_error(msg, "Admins and Moderators cannot be muted!");
					}
				} else {
					embed_error(msg, "Failed to mute! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to mute, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"unmute") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					if (msg.guild.me.hasPermission("MUTE_MEMBERS") == true) {
						// find muted role
						let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
						if (old_mute != undefined) {
							member.roles.remove(old_mute);
							embed_modderation(msg, "<@"+ member + "> They can talk again in text and voice channels!", "User Unmuted!", color="green");
							console_log("user "+member.user.tag+" unmuted on server "+msg.guild.id+"!", error=false, mod=true);
							log_muted_user(msg, member.user.id, add_user=false);
						} else {
							// messge mute role doesn't exist create it
							remove_muted_role(msg, member);
						}
					} else {
						embed_error(msg, "Failed to unmute member, JaredBot does not have the right permissions, please go to server settings " +
						"--> roles, then assign JaredBot the mute members permission!");
					}
				} else {
					embed_error(msg, "Failed to unmute! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to unmute, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"tempmute") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					message = msg.content.split(" ")
					if (message.length == 3 && message[0] == prefix[msg.guild.id]+"tempmute" && parseInt(message[2]) != NaN) {
						if (message[2] > 0) {
							if (message[2] < 1440) {
								if (member.hasPermission("MUTE_MEMBERS") == false) {
									if (msg.guild.me.hasPermission("MUTE_MEMBERS") == true) {
										// take action
										let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
										if (old_mute != undefined) {
											// mute user
											member.roles.add(old_mute);
											embed_modderation(msg, "<@"+ member + "> This user can no longer talk, they have been muted for "+message[2]+" mins!", "User Temporarily Muted!");
											console_log("user "+member.user.tag+" temp muted on server "+msg.guild.id+"!", error=false, mod=true);
										} else {
											// generate muted role
											generate_mute_role(msg, member);
										}
									
										//unmute user
										setTimeout(function(){
											let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
											if (old_mute != undefined) {
												member.roles.remove(old_mute);
												embed_modderation(msg, "<@"+ member + "> This user can talk again, they have been automatically unmuted!", "User Unmuted!", color="green");
												console_log("user "+member.user.tag+" temp unmuted on server "+msg.guild.id+"!", error=false, mod=true);
											} else {
												// messge mute role doesn't exist create it
												remove_muted_role(msg, member);
											}
										}, parseInt(message[2]) * 1000 * 60, member, msg);
									} else {
										embed_error(msg, "Failed to tempmute the specified user, JaredBot does not have the right permissions," +
										"please go to server settings --> roles, then assign JaredBot the mute members permission!");
									}
								} else {
									embed_error(msg, "Admins and Moderators cannot be muted!");
								}
							} else {
								embed_error(msg, "Mute Length too large, must be less than 24 hours (1440 mins)!");
							}
						} else {
							if (parseInt(message[2]) < 0) {
								embed_error(msg, "Mute Length cant be a negative number!");
							} else {
								embed_error(msg, "Invalid Format! Mute length must be a number!");
							}
						}
					} else {
						embed_error(msg, "Invalid Format! Please use -tempmute @user {length in mins}");
					}
				} else {
					embed_error(msg, "Failed to mute! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to tempmute, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

// tempunmute
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 11).toLowerCase() == prefix[msg.guild.id]+"tempunmute") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					message = msg.content.split(" ");
					console.log([message, message[2]])
					if (message.length == 3 && message[0] == prefix[msg.guild.id]+"tempunmute") {
						if (isInt(msg, message[2], 0, 1440, "tempmute", ErrorMessageEnd="") == true) {
							if (member.hasPermission("MUTE_MEMBERS") == false) {
								if (msg.guild.me.hasPermission("MUTE_MEMBERS") == true) {
									// mins
									mins = parseInt(message[2]) * 60 * 1000;
									
									// unmute the user
									let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
									if (old_mute != undefined) {
										member.roles.remove(old_mute);
										embed_modderation(msg, "<@"+ member + "> This user can talk again, they have been temporerly unmuted for "+message[2]+" mins!", "User Unmuted!", color="green");
										console_log("user "+member.user.tag+" temp unmuted on server "+msg.guild.id+"!", error=false, mod=true);
									} else {
										// messge mute role doesn't exist create it
										remove_muted_role(msg, member);
									}
									
									// mute the user
									setTimeout(function() {
										// take action
										let old_mute = msg.guild.roles.cache.find(role => role.name == "mute");
										if (old_mute != undefined) {
											// mute user
											member.roles.add(old_mute);
											embed_modderation(msg, "<@"+ member + "> This user can no longer talk, they have been muted!", "User Temporarily Muted!");
											console_log("user "+member.user.tag+" temp muted on server "+msg.guild.id+"!", error=false, mod=true);
										} else {
											// generate muted role
											generate_mute_role(msg, member);
										}
									}, mins, member, msg);
								} else {
									embed_error(msg, "Failed to tempmute the specified user, JaredBot does not have the right permissions," +
									"please go to server settings --> roles, then assign JaredBot the mute members permission!");
								}
							} else {
								embed_error(msg, "Admins and Moderators cannot be muted!");
							}
						} else {
							embed_error(msg, "Invalid Format! Mute length must be a number!");
						}
					} else {
						embed_error(msg, "Invalid Format! Please use -tempunmute @user {length in mins}");
					}
				} else {
					embed_error(msg, "Failed to mute! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to tempunmute, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

// kick
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"kick") {
			if (msg.member.hasPermission("KICK_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					if (member.hasPermission("KICK_MEMBERS") == false) {
						if (msg.guild.me.hasPermission("KICK_MEMBERS") == true) {
							member.kick();
							embed_modderation(msg, "<@"+ member + "> This user has been kicked!", "User Kicked!");
							console_log("user "+member.user.tag+" kicked from server "+msg.guild.id+"!", error=false, mod=true);
						} else {
							embed_error(msg, "Failed to kick specified user, JaredBot does not have the right permissions, please go to server " +
							"settings --> roles, then assign JaredBot the kick members permission!");
						}
					} else {
						embed_error(msg, "Admins and Moderators cannot be kicked!");
					}
				} else {
					embed_error(msg, "Failed to kick! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to kick, "+mod_error_text+" kick members permission!");
			}
		}
	}
})

// ban
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"ban" && 
		msg.content.slice(0, 9).toLowerCase() != prefix+"banemoji" && msg.content.slice(0, 7).toLowerCase() != prefix+"banurl") {
			if (msg.member.hasPermission("BAN_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				custom_ID = msg.content.slice(5, msg.content.length);
				if (member != undefined) {
					if (member.hasPermission("BAN_MEMBERS") == false) {
						if (msg.guild.me.hasPermission("BAN_MEMBERS") == true) {
							member.ban();
							embed_modderation(msg, "<@"+ member + "> This user has been Banned, they can't join back!", "User Banned!");
							console_log("user "+member.user.tag+" banned from server "+msg.guild.id+"!", error=false, mod=true);
						} else {
							embed_error(msg, "Failed to ban the specified user, JaredBot does not have the right permissions, please go to " +
							"server settings --> roles, then assign the ban members permission to JaredBot.");
						}
					} else {
						embed_error(msg, "Admins and Moderators cannot be banned!");
					}
				} else {
					embed_error(msg, "Failed to ban! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to ban, "+mod_error_text+" ban members permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"tempban") {
			if (msg.member.hasPermission("BAN_MEMBERS") == true) {
				let member2 = msg.mentions.members.first();
				if (member2 != undefined) {
					if (member2.hasPermission("BAN_MEMBERS") == false) {
						message2 = msg.content.split(" ");
						if (message2.length == 3 && message2[0] == prefix[msg.guild.id]+"tempban" && parseInt(message2[2]) != NaN) {
							if (message2[2] > 0) {
								if (message2[2] < 1440) {
									if (msg.guild.me.hasPermission("BAN_MEMBERS") == true) {
										// ban user
										if (member2.user != undefined) {
											member2.ban();
											embed_modderation(msg, "<@"+ member2 + "> This user has been temporerly banned, they can't join back!", "User Banned!");
											console_log("user "+member2.user.tag+" temp banned from server "+msg.guild.id+"!", error=false, mod=true);
					
											//unnaban user
											setTimeout(function() {
												msg.guild.members.unban(member2);
												embed_modderation(msg, "<@"+ member2 + "> This user can join again, they have been automatically unbaned!", "User Unbaned!");
											}, parseInt(message2[2]) * 1000 * 60, member2, msg);
										}
									} else {
										embed_error(msg, "Failed to tempban the specified user, JaredBot does not have the right permissions, " +
										"please go to server settings --> roles, then assign JaredBot the ban members permission!");
									}
								} else {
									embed_error(msg, "Ban Length too large, must be less than 24 hours (1440 mins)!");
								}
							} else {
								if (parseInt(message2[2]) < 0) {
									embed_error(msg, "Ban Length cant be a negative number!");
								} else {
									embed_error(msg, "Invalid Format! Ban length must be a number!");
								}
							}
						} else {
							embed_error(msg, "Invalid Format! Please use -tempban @user {length in mins}");
						}
					} else {
						embed_error(msg, "Admins and Moderators cannot be banned!");
					}
				} else {
					embed_error(msg, "Failed to ban! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to tempban, "+mod_error_text+" ban members permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"unban" && msg.content.slice(0, 11) != prefix+"unbanemoji") {
			if (msg.member.hasPermission("BAN_MEMBERS") == true) {
				if (msg.guild.me.hasPermission("BAN_MEMBERS") == true) {
					ID = msg.content.slice(7, msg.content.length);
					if (/^\d+$/.test(ID) == true) {
						msg.guild.members.unban(ID);
						embed_modderation(msg, "<@"+ ID + "> This user has been unbanned, they can join back!", "User Unbanned!", color="green");
						console_log("user unbaned from server "+msg.guild.id+"!", error=false, mod=true);
					} else {
						embed_error(msg, "Please specify a User ID! " +
						"you can get the User ID by right clicking on a message the user has sent, then selecting Copy ID");
					}
				} else {
					embed_error(msg, "Failed to unban the specified user, JaredBot does not have the right permissions, please go to server " +
					"settings --> roles, then assign JaredBot the ban members permission!");
				}
			} else {
				embed_error(msg, "You dont have permission to unban, "+mod_error_text+" ban members permission!");
			}
		}
	}
})

// invisible
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"invisible") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				let member = msg.mentions.members.first();
				if (member != undefined) {
					if (member.hasPermission("MUTE_MEMBERS") == false) {
						if (msg.guild.me.hasPermission("MANAGE_ROLES") == true) {
							let invisible_role = msg.guild.roles.cache.find(role => role.name == "invisible");
							if (invisible_role != undefined) {
								member.roles.add(invisible_role);
								embed_modderation(msg, "<@"+ member + "> This user can no longer talk or see any channels!", "User Invisible!");
								console_log("user "+member.user.tag+" invisible on server "+msg.guild.id+"!", error=false, mod=true);
							} else {
								embed_error(msg, "Failed to make the user invisible!");
							}
						} else {
							embed_error(msg, "Failed to make the specific user invisible, JaredBot does not have the right permissions, " +
							"please go to server settings --> roles, then assign JaredBot the manage roles permission! "+
							"JaredBot requires the manage roles permission in order to create the mute and invisible roles!");
						}
					} else {
						embed_error(msg, "Admins and Moderators cannot be invisible!");
					}
				} else {
					embed_error(msg, "Failed to invisible! The specified User could not be found!");
				}
			} else {
				embed_error(msg, "You dont have permission to use invisible, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"visible") {
			if (msg.member.hasPermission("MUTE_MEMBERS") == true) {
				if (msg.guild.me.hasPermission("MANAGE_ROLES") == true) {
					let member = msg.mentions.members.first();
					if (member != undefined) {
						let invisible_role = msg.guild.roles.cache.find(role => role.name == "invisible");
						if (invisible_role != undefined) {
							member.roles.remove(invisible_role);
							embed_modderation(msg, "<@"+ member + "> They can talk again in text and voice channels!", "User Visible!", color="green");
							console_log("user "+member.user.tag+" visible on server "+msg.guild.id+"!", error=false, mod=true);
						} else {
							embed_error(msg, "Failed to make the user visable!");
						}
					} else {
						embed_error(msg, "Failed to visible! The specified User could not be found!");
					}
				} else {
					embed_error(msg, "Failed to make the specified user visable, JaredBot does not have the right permissions, " +
					"please go to server settings --> roles, then assign JaredBot the manage roles permission! JaredBot requires "+
					"the manage roles permissions in order to create the mute and invisible roles!");
				}
			} else {
				embed_error(msg, "You dont have permission to use visible, "+mod_error_text+" mute members permission!");
			}
		}
	}
})

// give role
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"giverole") {
			if (msg.member.hasPermission("MANAGE_ROLES") == true) {
				if (msg.guild.me.hasPermission("MANAGE_ROLES") == true) {
					let member = msg.mentions.members.first();
					error = false;
					role_names = [];
					role_count = 0;
					msg.mentions.roles.forEach((role, index, map) => {
						// add role
						member.roles.add(role).then(robject => {
							console_log("Gave user " + member.user.tag + " role " + role.name + "!", error=false, mod=true);
							role_names.push(role.name);
							
							// message user
							role_count++;
							if (role_count == map.size) {
								if (error == true) {
									embed_error(msg, "Failed to give one or more roles to the user!");
								} else {
									embed_chat_reply(msg, "Gave " + member.user.tag + " the roles " + role_names.join(', ') + "!");
								}
							}
						}).catch(err => {
							console_log("Failed to give role to user! " + err, error=true);
							error = true;
						})
					})
				}
			} else {
				embed_error(msg, "You dont have persmission to use the giverole command, " + mod_error_text + " manage roles permission!");
			}
		}
	}
})

// remove role
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 11).toLowerCase() == prefix[msg.guild.id]+"removerole") {
			if (msg.member.hasPermission("MANAGE_ROLES") == true) {
				if (msg.guild.me.hasPermission("MANAGE_ROLES") == true) {
					let member = msg.mentions.members.first();
					error = false;
					role_names = [];
					role_count = 0;
					msg.mentions.roles.forEach((role, index, map) => {
						// add role
						member.roles.remove(role).then(robject => {
							console_log("removed role " + role.name + " from user " + member.user.tag + "!", error=false, mod=true);
							role_names.push(role.name);
							
							// message user
							role_count++;
							if (role_count == map.size) {
								if (error == true) {
									embed_error(msg, "Failed to remove one or more roles from the user!");
								} else {
									embed_chat_reply(msg, "Removed the roles " + role_names.join(', ') + " from " + member.user.tag +  + "!");
								}
							}
						}).catch(err => {
							console_log("Failed to remove role from user! " + err, error=true);
							error = true;
						})
					})
				}
			} else {
				embed_error(msg, "You dont have persmission to use the giverole command, " + mod_error_text + " manage roles permission!");
			}
		}
	}
})

// logging
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"logging ") {
			if (authorised_IDs.indexOf(msg.author.id) > -1) {
				command = msg.content.slice(9, msg.content.length);
				if (command == "on") {
					logging = true;
					embed_chat_reply(msg, "Logging turned on! All messages are now being logged!");
					console_log("Logging turned on! All messages are now being logged!", error=false, mod=true);
				} else if (command == "off") {
					logging = false;
					embed_chat_reply(msg, "Logging turned off! Messages are no longer being logged!");
					console_log("Logging turned off! Messages are no longer being logged!", error=false, mod=true);
				} else {
					embed_error(msg, "Invalid syntax! Please use -logging [on/off]!");
				}
			} else {
				embed_error(msg, "Currently only Jared can manage logging, as this feature is still in development!");
			}
		}
	}
})

var global_logging_var = {};
bot.on("message", msg => {
	if (msg.guild != null && logging == true) {
		if (msg.channel.id != hentai_channel_ID) {
			try {
				// make directory if it does not exist
				var channel_name = get_server_name(msg, type="channel");	// channel folder
				var server_name = get_server_name(msg);					// server folder
				var dir = logging_path +"/"+ server_name +"/"+ channel_name;
				
				// check if server folder exists
				if (!fs_read.existsSync(logging_path +"/"+ server_name)) {
					fs_read.mkdirSync(logging_path +"/"+ server_name);
				}

				// check if channel folder exists
				if (!fs_read.existsSync(dir)) {
					fs_read.mkdirSync(dir);
				}
				
				// log file name
				date1 = new Date();
				log_current_file = dir + "/server_log_"+date1.getDate()+"-"+(date1.getMonth()+1)+"-"+date1.getFullYear()+".log";
				
				// check for embed
				msg_content = msg.content;
				embed_data = [];
				msg.embeds.forEach(embd => {
					//embed_data = [embd.title, embd.author, embd.description, embd.fields]
					if (embd.description != undefined) {
						embed_data.push("[description] "+embd.description+" [/description]");
					} if (embd.author != undefined) {
						embed_data.push("[author]"+[embd.author.name, embd.author.url, embd.author.iconURL].join(", ")+"[/author]");
					} if (embd.title != undefined) {
						embed_data.push("[title] "+embd.title+" [/title]");
					} if (embd.color != undefined) {
						embed_data.push("[color]"+embd.color+"[/color]");
					} if (embd.thumbnail != undefined) {
						embed_data.push("[thumbnail]"+embd.thumbnail+"[/thumbnail]");
					} if (embd.image != undefined) {
						embed_data.push("[image]"+embd.image.url+"[/image]");
					} if (embd.fields.length > -1) {
						for (i=0;i<embd.fields.length;i++) {
							embed_data.push("[field]"+embd.fields[i].name+"[/field][value]"+String(embd.fields[i].value)+"[/value]");
						}
					} msg_content = embed_data.join(" ").replace(/\n/g, "");
				})
				
				// check for attachment
				msg.attachments.forEach(attch => {
					msg_content += ("<attachment>"+attch.url+"</attachment>".replace(/\n/g, ""));
				})
				
				// check for null
				if (msg.member == null) {
					return false;
				}
				
				// check for undefined
				if (global_logging_var[msg.guild.id] == undefined) {
					global_logging_var[msg.guild.id] = {};
				}
				
				// append data
				data = "["+msg.channel.name+"]["+msg.member.user.tag+"]["+String(date1).split(" GMT")[0]+"] "+msg_content;
				if (data != undefined) {
					global_logging_var[msg.guild.id][log_current_file] = global_logging_var[msg.guild.id][log_current_file] + "\n" + data;
				}
				
			} catch (err) {
				if (msg.guild == null) {
					console_log("Failed to write to log file for server! ", error=true);
				} else {
					console_log("Failed to write to log file for server "+msg.guild.id+"! ", error=true);
				}
			}
		}
	}
})

bot.on("ready", msg => {
	setInterval(function(){
		guild_ids = Object.keys(global_logging_var);
		for (i=0;i<guild_ids.length;i++) {
			channel_ids = Object.keys(global_logging_var[guild_ids[i]]);
			for (c=0;c<channel_ids.length;c++) {
				// write data to log
				data = global_logging_var[guild_ids[i]][channel_ids[c]].replace('undefined\n', '');
				if (data != undefined) {
					create_file_then_append_data_custom_path("global", channel_ids[c], data, endl="\n");
				}
			}
		}
		
		// cleanup
		global_logging_var = {};
		
	}, global_logging_var_interval);
})

// messages sent (log size)
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"msgcount" || 
		msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"logsize") {
			// get folder
			channel_name = get_server_name(msg, type="channel");	// channel folder
			server_name = get_server_name(msg);					// server folder
			dir = logging_path +"/"+ server_name +"/"+ channel_name;
			
			// get log file name
			if (msg.content.split(' ').length == 2) {
				todays_date = msg.content.split(' ')[1].replace(/-0/g, '-');
			} else {
				todays_date = date1.getDate()+"-"+(date1.getMonth()+1)+"-"+date1.getFullYear();
			}
			log_current_file = dir + "/server_log_"+todays_date+".log";
			
			// read the file
			fs_read.readFile(log_current_file, 'utf-8', function(err, data) {
				if (err) {
					embed_error(msg, "Failed to read log file`"+todays_date+"`! Did you type the date correctly `"+prefix[msg.guild.id]+"msgcount DD-MM-YYYY`!");
					console_log("Failed to show log file size! " + err, mod=false, error=true);
				} else {
					msg_counts = data.split('\n').length;
					embed_chat_reply(msg, msg_counts + " messages where sent on " + todays_date + " in "+msg.channel.name+" !");
				}
			})
		}
	}
})

// Snipe (log deleted messages)
bot.on("messageDelete", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (sniping == true) {
			try {
				// get server folder
				server_name = get_server_name(msg);
				output_file = logging_path +"/"+ server_name+"/"+"deleted_messages.log";
				attachments = [];
				
				// format data
				date = String(new Date()).split(" GMT")[0];
				if (msg.member != null) {
					user = msg.member.user.tag;
					channel = msg.channel.name;
					msg_content = msg.content.split("@everyone").join("{everyone}").split("@here").join("{here}").split("@").join("");
				} else {
					console_log("Failed to write deleted message to log file, member is null!", error=true);
					return false;
				}
				
				// check for attachment
				msg.attachments.forEach(attch => {
					// download attachment
					current_url = attch.url;
					extension = current_url.split('.')[current_url.split('.').length-1];
					fname = "del_" + msg.guild.id + "_" + parseInt(new Date().getTime())+"."+extension;
					local_filename = local_deleted_files_dir +"/"+ fname;
					online_filename = webserver_deleted_files_dir +"/"+ fname;
					msg_content += ("<attachment>"+online_filename+"</attachment>".replace(/\n/g, ""));
					
					download(current_url, local_filename, function(fobject) {
						console_log("Download deleted attachment!");
					})
					
				})
				data = "["+channel+"]["+user+"]["+date+"] "+msg_content+"\n";
				
				// check if file exists
				if (fs_read.existsSync(output_file) == true) {
					// append data to log file
					fs_append.appendFile(output_file, data, function(err) {
						if (err) {
							console_log("Failed to read deleted messages log file! " + err, error=true);
						}
					})
				} else {
					// create the file
					create_file_then_append_data(msg, deleted_messages_filename, data, endl="\n", overwrite=false)
				}
			} catch (err) {
				console_log("Failed to write deleted message to log file! " + err, error=true);
			}
		}
	}
})

var snipe_cooldown = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"snipe") {
			if (msg.member.hasPermission("SEND_MESSAGES") == true) {
				// cooldown
				if (snipe_cooldown[msg.guild.id] == undefined) {
					snipe_cooldown[msg.guild.id] = false;
				}
				
				if (snipe_cooldown[msg.guild.id] == false) {
					// timeout
					snipe_cooldown[msg.guild.id] = true;
					setTimeout(function() {
						snipe_cooldown[msg.guild.id] = false;
					}, snipe_cooldown_timeout, msg)
					
					// server name
					server_name = get_server_name(msg);
					output_file = logging_path +"/"+ server_name+"/"+"deleted_messages.log";
					
					// read file
					fs_read.readFile(output_file, "utf8", function(err, data) {
						if (err) {
							return console_log("Failed to read deleted messages snipe log file!", error=true);
						}
						// show deleted messages
						messages = data.split("@everyone").join("{everyone}").split("@here").join("{here}").split("@").join("");
						console_log("Sniping command was issued", error=false, mod=true);
						messages = messages.slice(messages.length-2000, messages.length);
						embed_chat_reply_header(msg, messages, "Deleted Messages", pfp=false);
					})
				} else {
					embed_error(msg, "This command was recently used, please wait " + (snipe_cooldown_timeout/1000/60) + " mins then try again!");
				}
			} else {
				embed_error(msg, "You don't have permission to use this command, " + mod_error_text + " send messages permision!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0,10).toLowerCase() == prefix[msg.guild.id]+"snipping ") {
			if (authorised_IDs.indexOf(msg.author.id) > -1) {
				command = msg.content.slice(10, msg.content.length);
				if (command == "on") {
					sniping = true;
					embed_chat_reply(msg, "Snipping has been turned on! Recently deleted messages will be logged!");
					console_log("Snipping has been turned on! Recently deleted messages will be logged!", error=false, mod=true);
				} else if (command == "off") {
					snipping = false;
					embed_chat_reply(msg, "Snipping has been turned off! Deleted messages will no longer be logged!");
					console_log("Snipping has been turned off! Deleted messages will no longer be logged!", error=false, mod=true);
				}
			} else {
				embed_error(msg, "Currently only Jared can use the snipping command, as this feature is still in development!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"clearlog") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				// server name
				server_name = get_server_name(msg);
				output_file = logging_path +"/"+ server_name+"/"+"deleted_messages.log";
				
				// clear deleted messages log
				var current_time = new Date();
				fs_write.writeFile(output_file, "Log File cleared on " + String(current_time) + "\n", function(err) {
					if (err) {
						return console_log("Failed to clear deleted messages log file!", error=true);
					}
					embed_chat_reply(msg, "deleted messages log file cleared!");
					console_log("deleted messages log file cleared!", error=false, mod=true);
				})
			} else {
				embed_error(msg, "You don't have permission to use this command, " + mod_error_text + " manage messages permision!");
			}
		}
	}
})

// purge
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		// show help menu
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"purge") {
			help_clear(msg);
			return;
		}
		
		// do clear
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"purge " || 
		msg.content.slice(0, 7) == prefix[msg.guild.id]+"clear ") {
			if (msg.content != prefix+"clearlog") {
				if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
					purge_num = msg.content.slice(6, msg.content.length);
					if (isNaN(parseInt(purge_num)) == false) {
						if (purge_num >= 2 && purge_num <= max_purdge_amount) {
							if (purge_num.indexOf(".") == -1 && purge_num.indexOf("-") == -1) {
								// delete the messages
								async function delete_messages() {
									try {
										if (msg.guild.me.hasPermission("MANAGE_MESSAGES") == true) {
											// delete messages
											msg.delete();
											const fetched = await msg.channel.messages.fetch({limit: purge_num});
											msg.channel.bulkDelete(fetched).then(function() {
												// message server
												embed_info_reply(msg, purge_num + " messages deleted by <@"+msg.member.id+">!");
												console_log(purge_num + " messages deleted in server " + msg.guild.id, error=false, mod=true);
											}).catch(err => {
												console_log("Error thrown in purge when trying to bulk delete messages! " + err, error=true);
											})
										} else {
											embed_error(msg, "JaredBot does not have permission to delete messages, please go to server settings --> "+
											"roles, then assign JaredBot the manage messages permission!");
										}
									} catch (err) {
										console_log("Error thrown in delete_messages function! " + err, error=true);
									}
								} delete_messages().catch(error => {
									embed_error(msg, "Failed to delete messages!");
								})
							} else {
								embed_error(msg, "Decimals are not allowed, please enter an integer for the number of messages to purge!")
							}
						} else {
							if (purge_num > max_purdge_amount) {
								embed_error(msg, "Too many messages, you can delete up to " + max_purdge_amount + " max!");
							} else if (purge_num == 0 || purge_num == 1) {
								embed_error(msg, "Too few messages, please sepcify a larger number that is between 2 and " + max_purdge_amount + "!");
							} else if (purge_num < 0) {
								embed_error(msg, "You can't delete a negative number of messages silly, please enter a number between 2 and" + max_purdge_amount + "!");
							}
						}
					} else {
						if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"clear") {
							embed_error(msg, "Invalid Input, the number of messages to delete must be an integer! e.g. `"+prefix[msg.guild.id]+"clear 10` will delete 10 messages!");
						} else {
							embed_error(msg, "Invalid Input, the number of messages to delete must be an integer! e.g. `"+prefix[msg.guild.id]+"purge 10` will delete 10 messages!");
						}
					}
				} else {
					embed_error(msg, "You dont have permission to use the purge command, " + mod_error_text + " manage messages permission!");
				}
			}
		}
	}
})

// automod
function automod_help(msg) {
	try {
		// automod help
		embed_automod_helpmenu = new Discord.MessageEmbed();
		embed_automod_helpmenu.setColor(embed_colour_info);
		embed_automod_helpmenu.setTitle("Automod Help");
		embed_automod_helpmenu.setDescription("Automod is a powerful tool that allows the bot to automatically mute, kick or ban users who " +
		"break specifically defined rules. When users spam, post porn links, or uses offensive language for example, JaredBot’s contenting " +
		"filtering feature will warn them. Automod is designed to run alongside content filtering, acting as a way to punish users who get to many " +
		"warnings. As well as counting content filtering warnings, it will also keep track of warnings moderators and admins give. " +
		"Make sure to enable contant filtering else your automod rules wont be enforced, type `"+prefix[msg.guild.id]+"help filter` for more info!\n\u200B");
		embed_automod_helpmenu.addFields(
			{name: prefix[msg.guild.id]+"automod help", value: "Shows this help menu.\n\u200B"},
			{name: prefix[msg.guild.id]+"automod rules", value: "Shows a list of the active rules applied to your server.\n\u200B"},
			{name: prefix[msg.guild.id]+"automod warnlist", value: "Shows a list of users with the most warnnings on the server.\n\u200B"},
			{name: prefix[msg.guild.id]+"automod", value: "lets you add an automod rule, The syntax for the command is `"+prefix[msg.guild.id]+"automod {action} after {number of} warnings in {length} {mins/hours}`, for example `"+prefix[msg.guild.id]+"automod mute after 10 warnings in 5 mins` will mute any users who recive 5 warnings within 10 mins!\n\u200B"},
			{name: prefix[msg.guild.id]+"automod remove", value: "lets you remove an automod rule, The syntax for the command is `"+prefix[msg.guild.id]+"automod remove {rule number}`, for example `"+prefix[msg.guild.id]+"automod remove 1` will remove the first active rule, i strongly suggest running `"+prefix[msg.guild.id]+"automod rules` first to get a list of all of the rules currently on your sever, then use the automod remove command after.\n\u200B"}
		)
	
		// send message
		embed_automod_helpmenu.setTimestamp();
		msg_channel_send(msg, embed_automod_helpmenu);
	} catch (err) {
		console_log("Error thrown in automod_help function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"automod" || 
		msg.content.toLowerCase() == prefix[msg.guild.id]+"automod help") {
			automod_help(msg);
			
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"automod rules") {
			try {
				// get dir
				automod_dir = get_server_name(msg);
				automod_path = logging_path + "/" + automod_dir + "/" + automod_filename;
				
				// read automod file
				if (fs_read.existsSync(automod_path) == false) {
					throw "File not found!";
				}
				fs_read.readFile(automod_path, "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read automod file", error=true);
					}
				
					// embed
					embed_automod_rules = new Discord.MessageEmbed();
					embed_automod_rules.setColor(embed_color_chat);
					embed_automod_rules.setTitle("Automod Active Rules")
					embed_automod_rules.setDescription("This is a list of all active automod rules currently applied to this server, " +
					"if you would like to remove a rule this can be done by typing `"+prefix[msg.guild.id]+"automod remove {rule number}`!\n\u200B");
				
					// format data
					automod_raw_data = data.split(";");
					for (i=0;i<automod_raw_data.length;i++) {
						try {
							crnt_automod_rule = automod_raw_data[i].split(",");
							if (crnt_automod_rule.length == 3) {
								//automod_rule_time
								if (crnt_automod_rule[2] >= 3600) {
									automod_rule_time = parseInt(crnt_automod_rule[2]/60/60) + " hours";
								} else if (crnt_automod_rule[2] >= 60) {
									automod_rule_time = parseInt(crnt_automod_rule[2]/60) + " mins";
								} else {
									automod_rule_time = crnt_automod_rule[2] + " seconds";
								}
							
								automod_rule_text = "Users who get " + crnt_automod_rule[1] + " warnings after " + automod_rule_time + " will be " + crnt_automod_rule[0].replace("mute", "mut") + "ed";
								embed_automod_rules.addField("Rule " + (i+1), automod_rule_text + "\n\u200B");
								console_log("Automod rule updated for server " + msg.guild.id, error=false, mod=true);
							}
						} catch {
							console_log("Failed to display automod rule on scoreboard!", error=true);
						}
					}
					
					if (automod_raw_data[0] == "") {
						embed_automod_rules.addField("No rules currently on the server!", "See the `"+prefix[msg.guild.id]+"automod help` menu for information on how to add a rule!\n\u200B");
					}
				
					// send message
					embed_automod_rules.setTimestamp();
					msg_channel_send(msg, embed_automod_rules);
				})
			} catch {
				embed_error(msg, "Failed to display automod rules, You don't have any rules setup on your server, please see the `"+prefix[msg.guild.id]+"automod help` menu for information on how to create a rule.");
			}
		} else if (msg.guild != null && msg.content.slice(0, 16) == prefix[msg.guild.id]+"automod remove ") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				rule_no = msg.content.slice(16, msg.content.length);
				// get dir
				automod_path = logging_path + "/" + get_server_name(msg) + "/" + automod_filename;
			
				// read file
				fs_read.readFile(automod_path, "utf-8", function(err, data) {
					if (err) {
						console_log("Failed to read automod file when running remove command", error=true);
					}
					
					// check user input
					automod_data = data.split(";");
					if (automod_data.length > 0) {
						if (isNaN(parseInt(rule_no)) == false) {
							if (rule_no >= 1 && rule_no <= automod_data.length+1) {
								automod_data = (automod_data.slice(0, rule_no-1).concat(automod_data.slice(rule_no, automod_data.length)));
								
								if (data != "") {
									// write to file
									fs_write.writeFile(automod_path, automod_data.join(";"), function(err) {
										if (err) {
											return console_log("Failed to write user input to file when running automod remove command", error=true);
										}
									})
									
									// message user
									embed_info_reply(msg, "Rule " + rule_no + " has been removed!");
								} else {
									embed_error(msg, "Failed to remove rule, no rules are currently setup on your server, please see the `"+prefix[msg.guild.id]+"automod help` menu for more information on how to setup a rule.")
								}
							} else {
								embed_error(msg, "Invalid Input, the specific rule could not be found.");
							}
						} else {
							embed_error(msg, "Invalid Input, your rule number must a number.");
						}
					} else {
						embed_error(msg, "There are no rules currenly setup for this server, see `"+prefix[msg.guild.id]+"automod help` for information on how to create a rule.");
					}
				})
			} else {
				embed_error(msg, "You dont have permission to use the automod commands, " + mod_error_text + " manage messages permission!");
			}
		} else if (msg.guild != null && msg.content.slice(0, 17) == prefix[msg.guild.id]+"automod warnlist") {
			// dir
			warnings_dir = get_server_name(msg);
			warnings_path = logging_path + "/" + warnings_dir + "/" + warnings_filename;
			
			// read file
			automod_file_reader = logging_path +"/"+ get_server_name(msg) +"/" + filenames_higherlower;
			fs_read.readFile(warnings_path, "utf-8", function(err, data) {
				if (err) {
					embed_error(msg, "Failed to read automod warnlist, this could be as a result of no one having had a warning, " +
					"if you have recently added JaredBot to your server, please wait for a few people to break the rules then run this command!");
					return console_log("Failed to read automod warnings file!", error=true);
				}
				
				// scoreboard embed
				embed_automod_warns_list = new Discord.MessageEmbed();
				embed_automod_warns_list.setTitle("Warnings Scoreboard");
				embed_automod_warns_list.setDescription("shows a list of users with the most warnings on the server");
				embed_automod_warns_list.setColor(embed_color_chat);
			
				// format data
				warned_users = data.split("\n");
				warned_users_array = [];
				for (i=0;i<warned_users.length;i++) {
					current_warned_user_tag = warned_users[i].split("|")[0].split("-")[1].split("#")[0];
					current_warned_count = warned_users[i].split("|").length-1;
					warned_users_array.push([current_warned_count, current_warned_user_tag]);
				}
				warned_users_array.sort();
				
				// convert back to string
				warned_user_output = [];
				for (i=0;i<warned_users_array.length;i++) {
					if (i == 0) {
						user_most_warnings = warned_users_array[i][1] + ": " + warned_users_array[i][0]
					} else {
						warned_user_output.push(warned_users_array[i][1] + ": " + warned_users_array[i][0]);
					}
				}
				
				// send message
				embed_automod_warns_list.addField(user_most_warnings + "\u200B", warned_user_output.join("\n").slice(0, 2000) + "\u200B");
				embed_automod_warns_list.setTimestamp();
				msg_channel_send(msg, embed_automod_warns_list);
			})
			
		} else if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"automod ") {
			try {
				automod_error_text = "\n\nThe syntax for the command is `"+prefix[msg.guild.id]+"automod {action} after {number of} warnings in {length} {mins/hours}`, " +
				"for example `"+prefix[msg.guild.id]+"automod mute after 10 warnings in 5 mins` will mute any users who recive 5 warnings within 10 mins!";
				if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
					// get rule
					// -automod mute after 5 warnings in 10 mins
				
					command = msg.content.slice(9, msg.content.length);
					action = command.split(" ")[0];
					no_warnings = command.split("after ")[1].split(" ")[0];
					lengthr = command.split("warnings in ")[1];
					length = lengthr.split(" ")[0];
					minSec = lengthr.split(" ")[1];
				
					if (action == "mute" || action == "kick" || action == "ban") {
						if (isNaN(parseInt(no_warnings)) == false) {
							if (no_warnings >= 1) {
								if (no_warnings <= 100) {
									if (no_warnings.indexOf("-") == -1 && no_warnings.indexOf(".") == -1) {
										if (isNaN(parseInt(length)) == false) {
											if (length >= 1) {
												if (length <= 1440) {
													if (length.indexOf("-") == -1 && length.indexOf(".") == -1) {
														if (minSec.slice(0,4) == "hour" || minSec.slice(0,3) == "min" || minSec.slice(0,3) == "sec") {
															// convert length value
															if (minSec.slice(0, 4) == "hour") {
																converted_length = length * 60 * 60;
															} else if (minSec.slice(0, 3) == "min") {
																converted_length = length * 60;
															} else {
																converted_length = length;
															}
															
															// get directory
															automod_rule = action + "," + no_warnings + "," + converted_length + ";";
															automod_dir = get_server_name(msg);
															automod_path = logging_path + "/" + automod_dir + "/" + automod_filename;
															console_log(automod_rule);
														
															// make file
															async function make_file() {
																make_server_folder_file(msg, automod_filename);
																return;
															}
														
															// append automod rule to file
															async function write_automod_rule(){
																try {
																	await make_file();
																	fs_append.appendFile(automod_path, automod_rule, function(err) {
																		if (err) {
																			console_log("Failed to append data to automod rules file", error=true);
																		}
																	})
																} catch (err) {
																	console_log("Error thrown in write_automod_rule function! " + err, error=true);
																}
															} write_automod_rule();
														
															// message user
															embed_info_reply(msg, "Automod rule updated! Users who get " + no_warnings + " warnings" +
															" in " + length + " " + minSec + ", will now be " + action.replace("mute", "mut") + "ed! " +
															"Please make sure to turn on content filtering in order for these rules to take effect " +
															"type the `"+prefix[msg.guild.id]+"filter on` to turn all filters on, or see `"+prefix[msg.guild.id]+"help filter` for help on configuring filters.");
															console_log("Audomod rule updated for " + msg.guild.id);
														} else {
															embed_error(msg, "Invalid Input, please sepcify `hours`, `mins` or `seconds` for your length of time!" + automod_error_text);
														}
													} else {
														embed_error(msg, "Invalid Input, your length value cannot be a decimal, " + automod_error_text);
													}
												} else {
													embed_error(msg, "Invalid Input, your length value is to large, please make sure the number is less than 1440!" + automod_error_text);
												}
											} else {
												embed_error(msg, "Invalid Input, your length value is to small it must be at least `1 min`!" + automod_error_text);
											}
										} else {
											embed_error(msg, "Invalid Input, your length value must be a number!" + automod_error_text);
										}
									} else {
										embed_error(msg, "Invalid Input, the number of warnings cannot be a decimal!" + automod_error_text);
									}
								} else {
									embed_error(msg, "Invalid Input, the number of warnings value is to large, it must be less than 1000!" + automod_error_text);
								}
							} else {
								embed_error(msg, "Invalid Input, the number of warnings value is to small it must be at least 1!" + automod_error_text);
							}
						} else {
							embed_error(msg, "Invalid Input, your number of warnings must be a number!" + automod_error_text);
						}
					} else {
						embed_error(msg, "Invalid Input, your action must be `mute`, `kick` or `ban`!" + automod_error_text);
					}
				} else {
					embed_error(msg, "You dont have permission to use the automod commands, " + mod_error_text + " manage channels permission!");
				}
			} catch {
				embed_error(msg, "Failed to set automod rule! " + automod_error_text);
			}
		}
	}
})

// automod warning tracker
onwarning_cooldown = {};
function on_warning(msg, warning_code, reason="") {
	try {
		// warning codes
		// 1 - NSFW content
		// 2 - phishing links
		// 3 - spam
		// 4 - being a dick / bullying
		// 5 - promotions
		// 6 - everyone and here tags
		// 7 - asking to be mod
		// 8 - sending offensive messages
		// 9 - custom warning from mod/admin
	
		// check for undefined
		if (onwarning_cooldown[msg.guild.id] == undefined) {
			onwarning_cooldown[msg.guild.id] = false;
		}
	
		// check if function already running
		if (onwarning_cooldown[msg.guild.id] == false) {
	
			// run function
			try {
				onwarning_cooldown[msg.guild.id] = true;
				at_user = msg.mentions.members.first();
				if (at_user == undefined) {
					warned_member = msg.author.id;
					warned_username = msg.member.user.tag;
					msg_guild = msg;
				} else {
					warned_member = at_user.user.id;
					warned_username = at_user.user.tag;
					msg_guild = at_user;
				}
	
				// -- take action on user --
				// get directory
				automod_dir = get_server_name(msg);
				automod_path = logging_path + "/" + automod_dir + "/" + automod_filename;
	
				// read the warning rules file
				fs_read.readFile(automod_path, "utf-8", function(err, data) {
					if (err) {
						return console_log("Failed to read automod rules file!", error=true);
					}
		
					// add user to dict
					if (user_who_broke_rules_dict[warned_member] == undefined) {
						user_who_broke_rules_dict[warned_member] = 1;
					} else {
						user_who_broke_rules_dict[warned_member] += 1;
					}
		
					// check each rule
					rules_raw = data.split(";");
					for (i=0;i<rules_raw.length;i++) {
						current_server_rule = rules_raw[i].split(",");
						current_action = current_server_rule[0];
						current_warning_count = current_server_rule[1];
						current_warning_time = current_server_rule[2];
			
						// check if user has broken the rules
						if (user_who_broke_rules_dict[warned_member] >= current_warning_count) {
							// take action
							user_2_take_action_on = msg_guild.guild.members.cache.get(warned_member);
							if (current_action == "mute") {
								// mute the user
								generate_mute_role(msg, msg.member);
								embed_modderation(msg, "<@"+ warned_member + "> AUTOMOD: This user has been automatically muted as they recived to many warnings!", "User Muted!");
					
							} else if (current_action == "kick") {
								// kick the user
								user_2_take_action_on.kick();
								embed_modderation(msg, "<@"+ warned_member + "> AUTOMOD: This user has been automatically kicked as they recived to many warnings!", "User Kicked!");
					
							} else if (current_action == "ban") {
								// ban the user
								user_2_take_action_on.ban();
								embed_modderation(msg, "<@"+ warned_member + "> AUTOMOD: This user has been automatically banned as they recived to many warnings!", "User Banned!");
							}
						}
			
						// send final warning message
						if (user_who_broke_rules_dict[warned_member] == current_warning_count-1) {
							embed_modderation(msg, "<@"+ warned_member + "> AUTOMOD: You will be "+current_action.replace("mute","mut")+"ed if this continues!", "Final Warning!");
						}
			
						// clear warning from dict after specified time
						if (user_who_broke_rules_dict[warned_member] == 1) {
							if (current_warning_time != undefined) {
								setTimeout(function(){
									user_who_broke_rules_dict[warned_member] = 0;
									console_log("user_who_broke_rules_dict cleared:", user_who_broke_rules_dict);
								}, 1000*parseInt(current_warning_time));
							}
						}
					}
				})
	
				// -- write to log --
				// get directory
				warnings_dir = get_server_name(msg);
				warnings_path = logging_path + "/" + warnings_dir + "/" + warnings_filename;
	
				// make file
				async function make_file() {
					make_server_folder_file(msg, warnings_filename);
						return;
				}
	
				// read file
				async function read_file() {
					await make_file();
					warned_users = [];
					fs_read.readFile(warnings_path, "utf-8", function(err, data) {
						if (err) {
							return console_log("Failed to read wanrings file in on warning function!", error=true);
						}
			
						// get date time
						current_datetime = new Date();
						day = ("00" + current_datetime.getDate()).slice(-2);
						month = ("00" + (current_datetime.getMonth()+1)).slice(-2);
						year = ("0000" + current_datetime.getFullYear()).slice(-4);
						hour = ("00" + current_datetime.getHours()).slice(-2);
						min = ("00" + current_datetime.getMinutes()).slice(-2);
						warn = ("0" + warning_code).slice(-1);
			
						// format reason
						if (reason.indexOf("<@") > -1) {
							reason = reason.split("<@")[1].split(">")[1];
						}
			
						// format is {date}{time}{warning code}
						// DDMMYYYYHHMMW
						datetime_formatted = day + month + year + hour + min + warn;
			
						// add reason if user already in database
						try {
							warnings_data = data.split("\n");
							if (data != "") { 
								for (i=0;i<warnings_data.length;i++) {
									current_warned_user = warnings_data[i].split("|");
									if (current_warned_user[0].split("-")[0] == warned_member) {
										// add the warnning reason to array
										if (warning_code == 9) {
											current_warned_user.push(datetime_formatted + "=" + reason);
										} else {
											current_warned_user.push(datetime_formatted);
										}
									}
									warned_users.push(current_warned_user.join("|"))
								}
							}
			
							// add user if they not in database
							if (data.indexOf(warned_member) == -1) {
								if (warning_code == 9) {
									warned_users.push(warned_member + "-" + warned_username + "|" + datetime_formatted + "=" + reason);
								} else {
									warned_users.push(warned_member + "-" + warned_username + "|" + datetime_formatted);
								}
							}
			
							// write to file
							fs_write.writeFile(warnings_path, warned_users.join("\n"), function(err) {
								if (err) {
									console_log("Failed to write warnings to file!", error=true);
								}
								// clear timeout
								onwarning_cooldown[msg.guild.id] = false;
							})
						} catch {
							console_log("Failed to wrte warnings to file", error=true);
						}
					})
				} read_file();
			} catch {
				console_log("Failed to take action on the user!", error=true);
				onwarning_cooldown[msg.guild.id] = false;
			}
		} else {
			setTimeout(function() {
				on_warning(msg, warning_code, reason);
			}, 100, msg, warning_code, reason);
		}
	} catch (err) {
		console_log("Error thrown in on_warning function! " + err, error=true);
	}
}

// exit
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"exit" || 
		msg.content.toLowerCase() == prefix[msg.guild.id]+"quit") {
			if (authorised_IDs.indexOf(msg.author.id) > -1) {
				embed_chat_reply(msg, "JaredBot has been terminated!");
				console_log("JaredBot has been terminated!", error=false, mod=true);
				setTimeout(function(){
					process.exit(1);
				},100);
			} else {
				embed_error(msg, "This command shuts the bot down, for obvious reasons it can only be used by Jared!");
			}
		}
	}
})

// write to delete messages log
function write_2_log(msg, data, type="content_filter") {
	try {
		// write data to log file
		date = String(new Date()).split(" GMT")[0];
		if (msg.member != null) {
			// get server folder
			server_name = get_server_name(msg);
			output_file = logging_path +"/"+ server_name+"/"+"deleted_messages.log";
			
			// format data
			user = msg.member.user.tag;
			channel = msg.channel.name;
			msg_content = data.split("@everyone").join("{everyone}").split("@here").join("{here}").split("@").join("");
			
			// check for attachment
			msg.attachments.forEach(attch => {
				msg_content += ("<attachment>"+attch.url+"</attachment>".replace(/\n/g, ""));
			})
			data = "["+channel+"]["+user+"]["+date+"] "+msg_content+"\n";
			
			// check if file exists
			if (fs_read.existsSync(output_file) == true) {
				// append data to log file
				fs_append.appendFile(output_file, data, function(err) {
					if (err) {
						console_log("Failed to read deleted messages log file! " + err, error=true);
					}
				})
			} else {
				// create the file
				create_file_then_append_data(msg, deleted_messages_filename, data, endl="\n", overwrite=false);
			}
		} else {
			console_log("Failed to write deleted message to log file!", error=true);
		}
	} catch (err) {
		console_log("Failed to write deleted message to log file!" + err, error=true);
	}
}

// Rules
rule_timeout = {}

// rule 1 (Only post porn in the NSFW channels)
var porn_links = ['xvideos', 'pornhub', 'xhamster', 'xnxx', 'youporn', 'hclips', 'tnaflix', 'tube8', 'spankbang', 'drtuber', 
'spankwire', 'keezmovies', 'nuvid', 'ixxx', 'sunporno', 'pornhd', 'porn300', 'pornone', 'sexvid', 'thumbzilla', 'zbporn', 'fuq', 'xxxbunker', 
'3movs', 'cumlouder', 'xbabe', 'porndroids', 'alohatube', 'maturetube', 'tubev', '4tube', 'bestfreetube', 'shameless', 'megatube', 'porntube', 
'porndig', 'pornburst', 'bigporn', 'fapster', 'porn.biz', 'bobs-tube', 'redporn', 'pornrox', 'pornmaki', 'pornid', 'slutload', 'proporn', 
'pornhost', 'xxxvideos247', 'handjobhub', 'dansmovies', 'porn7', 'forhertube', 'maxiporn', 'pornheed', 'orgasm', 'pornrabbit', 'tiava', 
'fux', 'h2porn', 'metaporn', 'pornxio', 'pornerbros', 'youjizz', 'iporntv', 'mobilepornmovies', 'watchmygf.mobi', 'pornplanner', 'mypornbible', 
'badjojo', 'findtubes', 'pornmd', 'nudevista', 'jasmin', 'imlive', 'liveprivates', 'joyourself', 'stripchat', 'firecams', 'luckycrush', 
'slutroulette', 'sexedchat', 'jerkmate', 'watchmyexgf', 'fantasti', 'watchmygf.me', 'watch-my-gf.com', 'watchmygf.tv', 'lovehomeporn', 
'iknowthatgirl', 'assoass', 'bigassporn', 'punishtube', 'stufferdb', 'pornpics', 'viewgals', 'jpegworld', 'pichunter', 'nakedpornpics', 
'nakedgirls', '18asiantube', 'zenra', 'bdsmstreak', 'punishbang', 'clips4sale', 'zzcartoon', 'hentaihaven', 'hentaicore', 'hentaigasm', 
'fakku', 'gelbooru', 'hentaisea', 'hentaipulse', 'porcore', 'cartoonporno', 'sankakucomplex', 'hentai-foundry', 'eggporncomics', 'vrporn', 
'vrbangers', 'vrsmash', 'badoinkvr', 'wankzvr', 'czechvr', 'sexlikereal', 'virtualrealporn', 'ddfnetworkvr', 'gaymaletube', 'manporn', 
'youporngay', 'gayfuror', 'zzgays', 'justusboys', 'myporngay', 'iptorrents', 'pussytorrent', 'suicidegirls', 'fashiongirls', 'top live sex cams', 
'freeones', 'barelist', 'babepedia', 'kindgirls', 'tubepornstars', 'bellesa', 'stasyq', 'thechive', 'hotsouthindiansex', 'milfporn', 'shemalehd', 
'anyshemale', 'ashemaletube', 'tranny', 'tgtube', 'besttrannypornsites', 'nutaku', '69games', 'gamcore', 'gamesofdesire', 'jerkdolls','hooligapps',
'lifeselector', 'brazzers', 'the gf network', 'reality kings', 'digital playground', 'mofos', 'adulttime', 'twistys', 'teamskeet', 'bangbros', 
'21sextury', 'elegantangel', 'videosz', 'hustler', 'jav hd', 'newsensations', 'pornpros', 'perfect gonzo', 'clubtug', 'bukkake', 
'all japanese pass', '18videoz', 'nubiles', 'kinkyfamily', 'dorcelclub', 'localhussies', 'meetwives', 'adultfriendfinder', 'freelocalsex',
'onlinefreechat', 'perezhilton', 'nakednews', 'avn', 'maxim', 'menshealth', 'forum.xnxx', 'forumophilia', 'jdforum', 'siliconwives', 
'yourdoll', 'sexysexdoll', 'sexyrealsexdolls', 'dollbobo', 'otonajp', 'joylovedolls', 'siliconesexworld', 'acesexdoll', 
'kikdolls', 'yououdoll', 'absolutesexdoll', 'kanadoll', 'sexdollgenie', 'sexdolls-usa', 'nhentai', 'czechvideo', 'mrporn', 'porngeek', 
'xrares', 'fap1', 'pvideo', 'freevidea.cz', 'porncz', 'pornoland', 'porna', 'pornb', 'pornc', 'pornd', 'porne', 'pornf', 'porng', 'pornh', 
'porni', 'pornj', 'pornk', 'pornl', 'pornm', 'pornn', 'porno', 'pornp', 'pornq', 'pornr', 'porns', 'pornt', 'pornu', 'pornv', 'pornw', 'pornx', 
'porny', 'pornz', 'aporn', 'bporn', 'cporn', 'dporn', 'eporn', 'fporn', 'gporn', 'hporn', 'iporn', 'jporn', 'kporn', 'lporn', 'mporn', 'nporn',
'oporn', 'pporn', 'qporn', 'rporn', 'sporn', 'tporn', 'uporn', 'vporn', 'wporn', 'xporn', 'yporn', 'zporn', 'porn.com', 'tubesafari','axxx', 
'bxxx', 'cxxx', 'dxxx', 'exxx', 'fxxx', 'gxxx', 'hxxx', 'ixxx', 'jxxx', 'kxxx', 'lxxx', 'mxxx', 'nxxx', 'oxxx', 'pxxx', 'qxxx', 'rxxx', 'sxxx', 
'txxx', 'uxxx', 'vxxx', 'wxxx', 'xxxx', 'yxxx', 'zxxx', 'xxxa', 'xxxb', 'xxxc', 'xxxd', 'xxxe', 'xxxf', 'xxxg', 'xxxh', 'xxxi', 'xxxj', 'xxxk', 
'xxxl', 'xxxm', 'xxxn', 'xxxo', 'xxxp', 'xxxq', 'xxxr', 'xxxs', 'xxxt', 'xxxu', 'xxxv', 'xxxw', 'xxxx', 'xxxy', 'xxxz', 'webcamsa', 'webcamsb', 
'webcamsc', 'webcamsd', 'webcamse', 'webcamsf', 'webcamsg', 'webcamsh', 'webcamsi', 'webcamsj', 'webcamsk', 'webcamsl', 'webcamsm', 'webcamsn', 
'webcamso', 'webcamsp', 'webcamsq', 'webcamsr', 'webcamss', 'webcamst', 'webcamsu', 'webcamsv', 'webcamsw', 'webcamsx', 'webcamsy', 'webcamsz', 
'awebcams', 'bwebcams', 'cwebcams', 'dwebcams', 'ewebcams', 'fwebcams', 'gwebcams', 'hwebcams', 'iwebcams', 'jwebcams', 'kwebcams', 'lwebcams', 
'mwebcams', 'nwebcams', 'owebcams', 'pwebcams', 'qwebcams', 'rwebcams', 'swebcams', 'twebcams', 'uwebcams', 'vwebcams', 'wwebcams', 'xwebcams', 
'ywebcams', 'zwebcams', 'pornoa', 'pornob', 'pornoc', 'pornod', 'pornoe', 'pornof', 'pornog', 'pornoh', 'pornoi', 'pornoj', 'pornok', 'pornol', 
'pornom', 'pornon', 'pornoo', 'pornop', 'pornoq', 'pornor', 'pornos', 'pornot', 'pornou', 'pornov', 'pornow', 'pornox', 'pornoy', 'pornoz', 'aporno', 
'bporno', 'cporno', 'dporno', 'eporno', 'fporno', 'gporno', 'hporno', 'iporno', 'jporno', 'kporno', 'lporno', 'mporno', 'nporno', 'oporno', 'pporno', 
'qporno', 'rporno', 'sporno', 'tporno', 'uporno', 'vporno', 'wporno', 'xporno', 'yporno', 'zporno', 'ahentai', 'bhentai', 'chentai', 'dhentai', 'ehentai', 
'fhentai', 'ghentai', 'hhentai', 'ihentai', 'jhentai', 'khentai', 'lhentai', 'mhentai', 'nhentai', 'ohentai', 'phentai', 'qhentai', 'rhentai', 'shentai', 
'thentai', 'uhentai', 'vhentai', 'whentai', 'xhentai', 'yhentai', 'zhentai', 'hentaia', 'hentaib', 'hentaic', 'hentaid', 'hentaie', 'hentaif', 'hentaig', 
'hentaih', 'hentaii', 'hentaij', 'hentaik', 'hentail', 'hentaim', 'hentain', 'hentaio', 'hentaip', 'hentaiq', 'hentair', 'hentais', 'hentait', 'hentaiu', 
'hentaiv', 'hentaiw', 'hentaix', 'hentaiy', 'hentaiz', 'dinotube', 'dlouha-videa', 'nejlepsipecko', 'ceskekundy', 'pvideo', 'zaprachy', 'dameporno',
'ceskeloznice', 'free-tv'];

bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("101") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.author.id != bot_ID) {
				for (i=0;i<porn_links.length;i++) {
					if (msg.content.toLowerCase().indexOf(porn_links[i]) > -1) {
						if (msg.content.indexOf(".") > -1) {
							write_2_log(msg, msg.content);
							msg.delete();
							embed_modderation(msg, "<@" + msg.author.id + "> Do not post links to pornographic content!", "WARNING!");
							console_log("user " + msg.member.user.tag + " has been warned for posting pornographic content", error=false, mod=true);
							on_warning(msg, 1);
							return;
						}
					}
				}
			}
		}
	}
})

// rule 2 (No phishing website links)
var Safe_Browsing_API = "";
var phishing_timeouts = {};

function capitalise(txt) {
	try {
		parts = txt.replace(/_/g, " ").split(" ");
		output = [];
		for (i=0;i<parts.length;i++) {
			output.push(parts[i].toUpperCase()[0] + parts[i].toLowerCase().slice(1, parts[i].length));
		}
		return output.join(" ");
	} catch (err) {
		console_log("Error thrown in capitalise function! " + err, error=true);
	}
}

function phishing_link_checker(msg, phishing_url) {
	try {
		url = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + Safe_Browsing_API;
	
		body =  {
			"client": {
				"clientId": "JaredBot", "clientVersion": "1.0.0"},
			"threatInfo": {
				"threatTypes": ["SOCIAL_ENGINEERING", "MALWARE"],
				"platformTypes":    ["ANY_PLATFORM"],
				"threatEntryTypes": ["URL"],
				"threatEntries": [{"url": phishing_url}]
			}
		}
	
		request(url, {
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body),
			method: "POST"
		}, (err, res, body) => {
			if (res != undefined && res.statusCode == 200) {
				response = JSON.parse(body);
				if (Object.keys(response).length == 0) {
					// URL is safe
					console_log("URL is safe!");
				
				} else {
					// URL is unsafe
					console_log("Dangerous URL identified!");
				
					// delete the message
					msg.delete();
				
					// delay on command to prevent warning spam
					if (phishing_timeouts[msg.guild.id] == undefined) {
						phishing_timeouts[msg.guild.id] = -1;
					}
				
					// message user
					if (phishing_timeouts[msg.guild.id] != new Date().getSeconds()) {
						phishing_timeouts[msg.guild.id] = new Date().getSeconds();
					
						// get URL info
						current_type = response["matches"][0]["threatType"];
						current_platform = response["matches"][0]["platformType"];
						current_cache = response["matches"][0]["cacheDuration"];
						current_entry_type = response["matches"][0]["threatEntryType"];
						current_url = response["matches"][0]["threat"]["url"];
				
						domain = phishing_url.replace("https://", "http://").split("http://")[1].split("/")[0];
				
						// embed
						embed_phishing = new Discord.MessageEmbed();
						embed_phishing.setColor(embed_colour_error);
						embed_phishing.setTitle("Phishing Link Detected!");
						embed_phishing.setDescription("Attackers on "+domain+" may trick you into doing something dangerous like "+
						"installing software or revealing your personal information (for example, passwords, phone numbers, or credit cards).\n\u200B");
						embed_phishing.addFields(
							{name: "Domain", value: capitalise(domain) + "\n\u200B", inline: true},
							{name: "\n\u200B", value: "\n\u200B", inline: true},
							{name: "Threat Type", value: capitalise(current_type) + "\n\u200B", inline: true},
							{name: "Effects", value: capitalise(current_platform.replace("ANY_PLATFORM","Multiple Web Browsers"))+"\n\u200B",inline: true},
							{name: "\u200B", value: "\n\u200B", inline: true},
							{name: "Threat Entry Type", value: current_entry_type+"\n\u200B", inline: true},
							{name: "Action", value: "The user <@" + msg.author.id + "> has recvied a warning!\n\u200B"},
						)
						embed_phishing.setTimestamp();
						msg_channel_send(msg, embed_phishing);
						console_log("user " + msg.member.user.tag + " has been warned for posting a phishing link", error=false, mod=true);
					}
				}
			} else if (res != undefined) {
				console_log("The server returned status code " + res.statusCode + "!");
			}
		})
	} catch (err) {
		console_log("Error thrown in phishing_link_checker function! " + err, error=true);
	}
}

function check_trusted_url(url) {
	trusted = ["http://cdn.discordapp.com/attachments/", "http://jaredbot.uk/", "http://google.com", "http://www.youtube.com/",
		"http://youtu.be/skWWN8rHqQ4", "http://en.wikipedia.org", "http://twitter.com", "http://facebook.com", "http://amazon",
		"http://reddit.com", "http://instagram.com", "http://microsoft.com", "http://quora.com", "http://spotify.com",
		"http://steampowered.com", "http://steamcommunity.com/"
	];
	
	for (i=0;i<trusted.length;i++) {
		if (url.replace('https', 'http').slice(0, trusted[i].length) == trusted[i]) {
			return true;
		}
	}
	return false;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		// check if URL in message
		content = msg.content;
		for (i=0;i<(content.match(/http/g) || []).length;i++) {
			if (content.indexOf("http") > -1) {
				content = content.split("https").join("http") + " ";
				content_p1 = content.slice(content.indexOf("http"), content.length);
				current_url = content_p1.slice(0, content_p1.indexOf(" "));
				content = content_p1.slice(current_url.length+1, content_p1.length);
				
				// ignore discord attachments and JaredBot website links
				if (check_trusted_url(current_url) == false) {
					// check URL
					phishing_link_checker(msg, current_url);
					write_2_log(msg, msg.content);
					on_warning(msg, 2);
				}
			}
		}
	}
})

bot.on("ready", msg => {
	fs_read.readFile(safe_browsing_filename, "utf-8", function(err, data) {
		if (err) {
			return console_log("Failed to read safe browsing API file!", error=true);
		}
		Safe_Browsing_API = data;
		console_log("Read Safe Browsing API Key!");
	})
})


// rule 3 (No spamming the same repetitive message)
var max_spam_count = 5;
var user_spam_dict = {};

bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("103") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
				if (msg.author.bot == false) {
					// add user to dict
					if (user_spam_dict[msg.author.id] == undefined) {
						user_spam_dict[msg.author.id] = [1, msg.content, ""]; // count, previous message, new message
					} else {
						user_spam_dict[msg.author.id] = [user_spam_dict[msg.author.id][0], user_spam_dict[msg.author.id][2], msg.content];
						if (user_spam_dict[msg.author.id][1] == user_spam_dict[msg.author.id][2]) {
							user_spam_dict[msg.author.id] = [user_spam_dict[msg.author.id][0]+1, user_spam_dict[msg.author.id][2], msg.content];
						} else {
							user_spam_dict[msg.author.id] = [0, user_spam_dict[msg.author.id][2], msg.content];
						}
					}
				
					// check counter
					if (user_spam_dict[msg.author.id][0] >= max_spam_count) {
						embed_modderation(msg, "<@" + msg.author.id + "> Don't spam the same message!", "WARNING!");
						user_spam_dict[msg.author.id] = [0, user_spam_dict[msg.author.id][2], msg.content];
						console_log("user " + msg.member.user.tag + " has been warned for spamming!", error=false, mod=true);
						on_warning(msg, 3);
					}
				}
			}
		}
	}
})

// rule 4 (Don’t be a dick or bully others, be kind - emoji detection, link remover)
var banned_emojis = {};

bot.on("ready", msg => {
	setTimeout(function(){
		read_file(banned_emoji_filename, banned_emojis);
		console_log("Banned Emoji file read!");
	}, 5000);
})

bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("104") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
				if (msg.author != bot_ID) {
					contents = msg.content.split(" ");
					for (i=0;i<contents.length;i++) {
						if (contents[i].slice(0,2) == "<:" && contents[i].slice(-1) == ">") {
							current_emoji_ID = contents[i].split(":")[2].replace(/\D/g, "");
							if (isNaN(parseInt(current_emoji_ID)) == false) {
								if (banned_emojis[msg.guild.id] != undefined) {
									if (banned_emojis[msg.guild.id].indexOf(current_emoji_ID) > -1) {
										write_2_log(msg, msg.content);
										msg.delete();
										embed_modderation(msg, "<@" + msg.author.id + "> Don't use this emoji!", "WARNING!");
										console_log("user " + msg.member.user.tag + " has been warned for using a banned emoji!", error=false, mod=true);
										on_warning(msg, 4);
										return;
									}
								}
							}
						}
					}
				}
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"banemoji ") {
				if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
					emoji_id = msg.content.slice(10, msg.content.length);
					// list banned emojis
					if (emoji_id == "list") {
						// get directory
						banemoji_dir = get_server_name(msg);
						banemoji_path = logging_path + "/" + banemoji_dir + "/" + banned_emoji_filename;
						
						// read banned emoji list
						fs_read.readFile(banemoji_path, "utf-8", function(err, data) {
							if (err) {
								return console_log("Failed to read banned emojis file!", error=true);
							}
							
							// embed
							embed_banemoji = new Discord.MessageEmbed();
							embed_banemoji.setColor(embed_color_chat);
							embed_banemoji.setTitle("Banned Emoji list");
							embed_banemoji.setDescription("All of the following emoji IDs have been banned on the " + 
							msg.guild.name + " server!\n" + data.replace(/;/g, "\n").slice(0, 2000));
							msg_channel_send(msg, embed_banemoji);
						})
						
					// clear banned emojis
					} else if (emoji_id == "clearall") {
						banemoji_dir = get_server_name(msg);
						banemoji_path = logging_path + "/" + banemoji_dir + "/" + banned_emoji_filename;
						
						// clear banned emoji list
						fs_write.writeFile(banemoji_path, "", function(err) {
							if (err) {
								return console_log("Failed to clear banned emojis list!", error=true);
							}
							embed_chat_reply(msg, "All emoji bans have been cleared!");
						})
						
					}
					
					// ban emoji
					else {
						if (isInt_without_error(emoji_id, 0, 10**20) == true) {
							create_file_then_append_data(msg, banned_emoji_filename, emoji_id, endl=";");
							if (banned_emojis[msg.guild.id] == undefined) {
								banned_emojis[msg.guild.id] = [];
							} banned_emojis[msg.guild.id].push(emoji_id);
							embed_info_reply(msg, "Successfully banned the emoji!");
							console_log("Emoji has been banned for server " + msg.guild.id, error=false, mod=true);
						} else {
							embed_error(msg, "Invalid emoji ID!");
						}
					}
				} else {
					embed_error(msg, "You dont have permission to ban emoji's, " + mod_error_text + "Manage Messages permission!");
				}
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content.slice(0, 12).toLowerCase() == prefix[msg.guild.id]+"unbanemoji ") {
				if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
					emoji_id = msg.content.slice(12, msg.content.length);
					if (isInt_without_error(emoji_id, 0, 10**20) == true) {
						// read the emoji ban file
						current_server_name = bot.guilds.cache.get(msg.guild.id);
						current_server_name = current_server_name.name.replace(" ","_")+"_"+ current_server_name.id;
						f_path = logging_path + "/" + current_server_name + "/" + banned_emoji_filename;
					
						// remove ID from dict
						output = [];
						console_log(banned_emojis[msg.guild.id]);
						for (i=0;i<banned_emojis[msg.guild.id].length;i++) {
							if (banned_emojis[msg.guild.id][i] != emoji_id) {
								output.push(banned_emojis[msg.guild.id][i]);
							}
						}
						banned_emojis[msg.guild.id] = output;
						console_log(output);
					
						//  write to file
						fs_write.writeFile(f_path, output.join(";") + ";", function(err) {
							if (err) {
								return console_log("Failed to write emojis to file after unbanned!", error=true);
							}
						})
					
						// message user
						emoji = bot.emojis.cache.get(emoji_id);
						embed_info_reply(msg, "Emoji ${emoji} unbanned!");
						console_log("Emoji unbanned for server " + msg.guild.id, error=false, mod=true);
					}
				}
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"emoji" || 
		msg.content.toLowerCase() == prefix[msg.guild.id]+"banemoji" || msg.content.toLowerCase() == prefix[msg.guild.id]+"unbanemoji") {
			// embed
			embed_emoji = new Discord.MessageEmbed();
			embed_emoji.setColor(embed_colour_info);
			embed_emoji.setTitle("Emoji Filter Help");
			embed_emoji.setDescription("The emoji filter allows you to ban specific emojis, "+
			"the bot will delete messages that contain the banned emoji and warn the user who posted the message.");
			embed_emoji.addFields(
				{name: prefix[msg.guild.id]+"emoji help", value: "Shows this help menu.\n\u200B"},
				{name: prefix[msg.guild.id]+"banemoji list", value: "Shows a list of the banned emojis IDs for the server.\n\u200B"},
				{name: prefix[msg.guild.id]+"banemoji clearall", value: "Removes all emoji bans from the server.\n\u200B"},
				{name: prefix[msg.guild.id]+"banemoji {emoji ID}", value: "bans the specified emoji by ID, you can get the ID of an emoji by simply right clicking "+
				"on the emoji you would like to ban inside of a message, then clicking *open link*. the emoji source URL will be opened up in "+
				"a web browser, the URL will be `cdn.discordapp.com/emojis/` followed by an ID, simply copy the ID part of the URL "+
				"(refer to the image below), then paste that ID into discord when using the banemoji command, for example "+
				"`"+prefix[msg.guild.id]+"banemoji 779738708844609597` will ban an emoji of a rainbow cat.\n\u200B"},
				{name: prefix[msg.guild.id]+"unbanemoji {emoji ID}", value: "Allows you to unban an emoji, for example `"+prefix[msg.guild.id]+"unbanemoji 779738708844609597` "+
				"will unban an emoji of a rainbow cat. prefer to the banemoji command description above, for information on how to get the "+
				"emoji ID, or look at the image below.\n\u200B"},
			)
			embed_emoji.setImage(emoji_id_url);
			embed_emoji.setTimestamp();
			msg_channel_send(msg, embed_emoji);
			
		}
	}
})

// ban url
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
			if (msg.guild != null && msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"banurl ") {
				if (filter_onoff[msg.guild.id].indexOf("104") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
					if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
						url = msg.content.slice(8, msg.content.length);
						if (url.indexOf(".") > -1) {
							// add URL to banned list
							create_file_then_append_data(msg, banned_urls_channel_file, url, endl=";\n");
							embed_chat_reply(msg, "The URL has been black listed!");
							
							// add URL to dict
							setTimeout(function() {
								if (banned_urls[msg.guild.id] == undefined) {
									banned_urls[msg.guild.id] = [];
									banned_urls[msg.guild.id].push(url);
								} else {
									banned_urls[msg.guild.id].push(url);
								}
							}, 1000);
						} else {
							embed_error(msg, "That is not a valid URL!");
						}
					} else {
						embed_error(msg, "Your not authorised to run the banurl command" + mod_error_text + " manage messages permission!");
					}
				} else {
					embed_error(msg, "Ban URL is part of the emoji spam filter, please turn on the emoji spam filter inorder to use this feature, "+
					"type `"+prefix[msg.guild.id]+"filter on emojispam`, or `"+prefix[msg.guild.id]+"filter` for more information!");
				}
			}
		}
	}
})

var banned_urls = {};
bot.on("ready", msg => {
	// read banned urls list
	read_file(banned_urls_channel_file, banned_urls, allow_non_int=true, sep=";", remove_dupes=true);
	console_log("Banned URLs database read!");
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.author.bot == false) {
			if (banned_urls[msg.guild.id] != undefined && filter_onoff[msg.guild.id] != undefined) {
				if (filter_onoff[msg.guild.id].indexOf("104") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
					// check message content for each URL
					do_warning = false;
					for (i=0;i<banned_urls[msg.guild.id].length;i++) {
						if (msg.content.indexOf("http://") > -1 || msg.content.indexOf("https://") > -1) {
							if (msg.content.indexOf(banned_urls[msg.guild.id][i]) > -1) {
								do_warning = true;
							}
						}
					}
					// take action
					if (do_warning == true) {
						write_2_log(msg, msg.content);
						msg.delete();
						embed_modderation(msg, "<@" + msg.author.id + "> You cannot use this URL!", "WARNING!");
						console_log("user " + msg.member.user.tag + " has been warned for using a banned URL!", error=false, mod=true);
						on_warning(msg, 4);
					}
				}
			}
		}
	}
})

// rule 5 (Only post promotions in the advertisement channel)
bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("105") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
				if (msg.content.indexOf("https://discord.gg/") > -1) {
					if (msg.channel.id != adds_channel_ID) {
						if (msg.author != bot_ID) {
							if (msg.member.hasPermission("MANAGE_MESSAGES") == false) {
								write_2_log(msg, msg.content);
								msg.delete();
								embed_modderation(msg, "<@" + msg.author.id + "> Only post promotions in the adds channel!", "WARNING!");
								console_log("user " + msg.member.user.tag + " has been warned for promotions!", error=false, mod=true);
								on_warning(msg, 5);
							}
						}
					}
				}
			}
		}
	}
})

// rule 6 (No raids, such as pinging everyone)
bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("106") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
				if (msg.author.id != bot_ID) {
					if (msg.member != null) {
						if (msg.content.indexOf("@everyone") > -1) {
							write_2_log(msg, msg.content);
							msg.delete();
							embed_modderation(msg, "<@" + msg.author.id + "> Dont use everyone tag!", "WARNING!");
							console_log("user " + msg.member.user.tag + " has been warned for using the everyone tag!", error=false, mod=true);
							on_warning(msg, 6);
		
						} else if (msg.content.indexOf("@here") > -1) {
							write_2_log(msg, msg.content);
							msg.delete();
							embed_modderation(msg, "<@" + msg.author.id + "> Dont use here tag!", "WARNING!");
							console_log("user " + msg.member.user.tag + " has been warned for using the here tag!", error=false, mod=true);
							on_warning(msg, 6);
						}
					}
				}
			}
		}
	}
})

// rule 7 (No asking to be moderator)
var give_mod = ["can i be mod", "add me as mod", "give me mod", "give mod", "plz mod", "please mod", 
"i want mod", "i want to be mod", "add me to mod"];
var give_adm = ["can i be admin", "add me as admin", "give me admin", "give admin", 
"plz admin", "please admin", "i want admin", "i want to be admin", "add me to admin"];
bot.on("message", msg => {
	if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
		if (filter_onoff[msg.guild.id].indexOf("107") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
			if (msg.guild != null && msg.member != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
				if (msg.member.hasPermission("MANAGE_MESSAGES") == false) {
					// mod
					for (i=0;i<give_mod.length;i++) {
						if (msg.content.indexOf(give_mod[i]) > -1) {
							embed_modderation(msg, "<@" + msg.author.id + "> No asking to be Moderator!", "WARNING!");
							console_log("user " + msg.member.user.tag + " has been warned for asking to be mod!", error=false, mod=true);
							on_warning(msg, 7);
						}
					}
		
					// admin
					for (i=0;i<give_adm.length;i++) {
						if (msg.content.indexOf(give_adm[i]) > -1) {
							embed_modderation(msg, "<@" + msg.author.id + "> No asking to be Admin!", "WARNING!");
							console_log("user " + msg.member.user.tag + " has been warned for asking to be admin!", error=false, mod=true);
							on_warning(msg, 7);
						}
					}
				}
			}
		}
	}
})

// rule 8 (No sending offensive messages)
var trigger_word = ['kill your self', 'kys', 'go fuck', 'fucking die', 'stupid bitch', 'hey bitch', 'nice try bitch', 
'are you a retard', 'fucking retard', 'go fuck yourself', 'of shit', 'nigger', 'nigga', 'niger', 'niga', 'fucking kill', 'fucking bitch', 'poor fuck', 
'dickhead', 'ur mom a hoe', 'dick head', 'motherfucker', 'fuck of', 'fuck you', 'fuck u', 'fucking hoe', 'i will rape', 
"negr", "buzna"];

function check_msg_for_swear(msg, doReply=true, deleteMsg=true, textInput="") {
	try {
		// check for undefined
		if (msg != undefined) {
			if (msg.guild == null || msg.guild == undefined) {
				console_log("Failed to check msg content for swear words, msg is undefined!", error=true);
				return false;
			}
		}
	
		// check message
		if (msg.guild != null && filter_onoff[msg.guild.id] != undefined) {
			if (filter_onoff[msg.guild.id].indexOf("108") > -1 || filter_onoff[msg.guild.id].indexOf("199") > -1) {
				if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
					for (i=0;i<trigger_word.length;i++) {
						// check for text input
						if (textInput.length > 0) {
							msg_content = textInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() // replace accents with letters
						} else {
							msg_content = msg.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() // replace accents with letters
						}
					
						// Format text
						msg_content = msg_content.replace(" ","").replace("\n","").replace("\t",""); // removes spaces and tabs
						msg_content = msg_content.replace("1","i").replace("2","s").replace("5","s").replace("0","o") // replace numbers with letters
				
						if (msg_content.indexOf(trigger_word[i]) > -1) {
							write_2_log(msg, msg.content);
							// delete message
							if (deleteMsg == true) {
								msg.delete().catch(error => {
									console_log("Failed to delete message!", error=true);
								})
							}
						
							// reply
							if (doReply == true) {
								embed_modderation(msg, "<@" + msg.author.id + "> No sending offensive or alarming messages!", "WARNING!");
							}
							console_log("user " + msg.member.user.tag + " has been warned for sending offensive messages!", error=false, mod=true);
							on_warning(msg, 8);
							return true;
						}
					}
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in check_msg_for_swear function! " + err, error=true);
	}
}

bot.on("message", msg => {
	check_msg_for_swear(msg);
})

// toggle content filtering
var filter_onoff = {};

/*
Key Codes:
199 - all filters on
100 - all filters off
101 - rule 1 porn
102 - rule 2 phishing
103 - rule 3 spam
104 - rule 4 emojispam
105 - rule 5 promotions
106 - rule 6 tags
107 - rule 7 mod
108 - rule 8 language
*/

function do_filter(msg, filter_key_code, message_text) {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				// append the filter to file
				create_file_then_append_data(msg, filter_filename, filter_key_code, endl=";");
				embed_info_reply(msg, message_text);
				console_log(message_text + " for " + msg.guild.name, error=false, mod=true);
			
				if (filter_onoff[msg.guild.id] == undefined) {
					filter_onoff[msg.guild.id] = [];
				}
				filter_onoff[msg.guild.id].push(filter_key_code);
			} else {
				embed_error(msg, "You dont have permission to use the content filtering commands, " + mod_error_text + " manage messages permission!");
			}
		}
	} catch (err) {
		console_log("Error thrown in do_filter function! " + err, error=true);
	}
}

function filter_help(msg) {
	try {
		// embed
		embed_filter = new Discord.MessageEmbed();
		embed_filter.setColor(embed_colour_info);
		embed_filter.setTitle("Content Filtering Help");
		embed_filter.setDescription("Content filtering is a feature that allows the bot to automatically remove and warn users who post, "+
		"porn, phishing links, spam, promotions, tags, and use offensive language.");
		embed_filter.addFields(
			{name: prefix[msg.guild.id]+"filter help", value: "Shows this help menu.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on", value: "Turns on all contenting filters, including porn, phishing links, spam, promotions, tags and the offensive language filter.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on porn", value: "Turns on the porn links content filter, any links to porn sites will be removed with this filter.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on phishing", value: "Turns on the phishing links content filter, any links to phishing sites will be removed.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on spam", value: "Turns on the anti-spam content filter, users will be warned for typing the same message multiple times.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on emojispam", value: "Turns on the emoji content filter, this filter will automtically ban specific emojis, type `"+prefix[msg.guild.id]+"emoji` for more info.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on promotion", value: "Turns on the anti-promotion filter, this filter will automatically delete discord invites to other servers.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on tag", value: "Turns on the anti-tag filter, this filter will automatically delete here and everyone tags.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on mod", value: "Turns on the anti-admin filter, this filter deletes messages where users beg for admin or mod.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter on language", value: "Turns on the language filter, this filter will automatically delete messages that contain offensive language.\n\u200B"},
			{name: prefix[msg.guild.id]+"filter off", value: "This will remove all filters currently setup for your server.\n\u200B"},
		)
		embed_filter.setTimestamp();
		msg_channel_send(msg, embed_filter);
	} catch (err) {
		console_log("Error thrown in filter_help function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7) == prefix[msg.guild.id]+"filter") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				if (msg.content.toLowerCase() == prefix[msg.guild.id]+"filter on") {
					do_filter(msg, "199", "All filters have been turned on!");
		
				} else if (msg.content.toLowerCase() == prefix[msg.guild.id]+"filter off") {
					// get directory
					auto_dir = get_server_name(msg);
					auto_path = logging_path + "/" + auto_dir + "/" + filter_filename;
		
					// write file
					fs_write.writeFile(auto_path, "", function(err) {
						if (err) {
							return console_log("Failed to write to filter file!", error=true);
						}
					})
		
					// clear filters from dir
					filter_onoff[msg.guild.id] = [];
		
					// message user
					embed_info_reply(msg, "All filters has been turned off!");
					console_log("All filters turned off for server " + msg.guild.id, error=false, mod=true);
		
				} else if (msg.guild != null && msg.content.slice(0, 15).toLowerCase() == prefix[msg.guild.id]+"filter on porn") {
					do_filter(msg, "101", "The porn links filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 19).toLowerCase() == prefix[msg.guild.id]+"filter on phishing") {
					do_filter(msg, "102", "The phishing links filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 15).toLowerCase() == prefix[msg.guild.id]+"filter on spam") {
					do_filter(msg, "103", "The spam filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 20).toLowerCase() == prefix[msg.guild.id]+"filter on emojispam") {
					do_filter(msg, "104", "The emoji spam filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 20).toLowerCase() == prefix[msg.guild.id]+"filter on promotion") {
					do_filter(msg, "105", "The promotions filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 14).toLowerCase() == prefix[msg.guild.id]+"filter on tag") {
					do_filter(msg, "106", "The everyone and here tags filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 14).toLowerCase() == prefix[msg.guild.id]+"filter on mod") {
					do_filter(msg, "107", "The asking to be mod filter has been turned on!");
		
				} else if (msg.guild != null && msg.content.slice(0, 19).toLowerCase() == prefix[msg.guild.id]+"filter on language") {
					do_filter(msg, "108", "The offensive language filter has been turned on!");
				} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"filter" || msg.content == prefix[msg.guild.id]+"filter help") {
					filter_help(msg);
				}
			} else {
				embed_error(msg, "You dont have permission to use the filter command, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

bot.on("ready", msg => {
	setTimeout(function(){
		read_file(filter_filename, filter_onoff);
		console_log("content filtering rules read!");
	}, 5000);
})

// send message if server is not authroised to run command
bot.on("message", msg => {
	if (msg.author.id != bot_ID) {
		if (msg.guild != null && msg.content.slice(0,1) == prefix) {
			if (msg.content != prefix+"authorise" && msg.content != prefix+"help") {
				var error_text = "[Authorization Error]";
				if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) == -1 && msg.content.indexOf(error_text) == -1) {
					embed_error(msg, error_text+" Your Server is not authorised to run this command! Please type `"+prefix[msg.guild.id]+"authorise` to authorise your server ID!");
				}
			}
		}
	}
})

// authorise server
function authorise_server(msg, reply=true) {
	try {
		// get the server ID
		Server_ID = msg.guild.id;
		
		if (authrosied_server_IDs.indexOf(Server_ID) > -1) {
			if (reply == true) {
				embed_info_reply(msg, "Your Server has already been authorised!");
			}
		} else {
			// write server ID to file
			fs_append.appendFile(authorised_servers, Server_ID + ";\n", function(err) {
				if (err) {
					if (reply == true) {
						embed_error(msg, "Failed to authorise your server ID!");
					}
					return console_log("Failed to authorise server ID", error=true);
				} else {
					if (reply == true) {
						embed_info_reply(msg, "Your Server ID has been authorised!");
					}
					console_log("Server " + msg.guild.id + " has been authorised!");
				
					// update variable
					authrosied_server_IDs.push(Server_ID);
				}
			})
		}
	} catch (err) {
		console_log("Failed to Authorise server, error thrown in authorise_server function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && msg.content == prefix[msg.guild.id]+"authorise") {
		authorise_server(msg, reply=true);
	}
})

// previous adds channel message
var previous_message = "";

// remove duplicate adds from add channel
bot.on("message", msg => {
	if (remove_duplicate_adds == true) {
		if (msg.channel.id == adds_channel_ID) {
			if (msg.author != bot_ID) {
				if (msg.content.indexOf("https://discord.gg/") > -1) {
					current_message = msg.content.split("https://discord.gg/")[1].split(" ")[0].replace("\n","");
					console_log("CURRENT: " + current_message);
					console_log("PREVIOUS: " + previous_message);
						
					// check if new and previous message are the same
					if (current_message == previous_message) {
						write_2_log(msg, msg.content);
						msg.delete();
						embed_info_reply(msg, "You already posted the same invite link in the previous message!");
					}
				}
			}
		}
	}
})

// delete Spotify invite links
bot.on("message", msg => {
	if (content_filtering == true) {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.channel.id != adds_channel_ID) {
				if (msg.author.bot == false) {
					if (msg.activity != null) {
						try {
							InviteURL = msg.activity.partyID;
							if (InviteURL.indexOf("spotify:") > -1) {
								if (msg.channel.id != music_sharring_channel) {
									write_2_log(msg, msg.content);
									msg.delete();
									embed_modderation(msg, "<@" + msg.author.id + "> Only post Spotify connect links in music-sharing!", "WARNING!");
									on_warning(msg, 5);
								}
							} else if (msg.application.name != null) {
								if (msg.channel.id != game_invite_channel) {
									write_2_log(msg, msg.content);
									msg.delete();
									embed_modderation(msg, "<@" + msg.author.id + "> Only post game invite links in game-invites!", "WARNING!");
									on_warning(msg, 5);
								}
							}
							
							//console_log([msg.application.name, msg.channel.id]);
						} catch {
							console_log("Application Invite link detected!");
						}
					}
				}
			}
		}
	}
})

bot.on("message", msg => {
	let add_channel_temp = bot.channels.cache.get(adds_channel_ID);
	add_channel_temp.messages.fetch({ limit: 1}).then(message => {
		try {
			previous_message = message.first().content.split("https://discord.gg/")[1].split(" ")[0].replace("\n","");
		} catch {}
	}).catch(err => {
		console_log("Error thrown in spotify adds link detector! " + err, error=true);
	})
})

// change nickname
/*bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 16) == prefix[msg.guild.id]+"changenickname " || msg.content.slice(0, 12) == prefix[msg.guild.id]+"changenick ") {
			if (msg.member.hasPermission("CHANGE_NICKNAME") == true) {
				if (!msg.guild.me.hasPermission("CHANGE_NICKNAME")) {
					embed_error(msg, "The bot doesn't have permission to change the users nickname!");
				} else {
					let member = msg.mentions.members.first();
					if (member == undefined) {
						msg.member.setNickname(msg.content.split(/ (.+)/)[1]);
					
					} else {
						member.setNickname(msg.content.split(/ (.+)/)[1]);
					}
				}
				
			}
		}
	}
})*/

// slowmode
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.toLowerCase() == prefix[msg.guild.id]+"slowmode off") {
			msg.channel.setRateLimitPerUser("0");
			embed_chat_reply(msg, "slow mode has been turned off!");
			
		} else if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"slowmode ") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				command = msg.content.slice(10, msg.content.length);
				
				// check for 0 interval
				if (command == "0") {
					msg.channel.setRateLimitPerUser(0);
					embed_chat_reply(msg, "Slowmode has been turned off!");
					return true;
				}
				
				// allow MM:SS format
				if (command.indexOf(":") > -1) {
					mins = command.split(":")[0];
					secs = command.split(":")[1];
					if (isInt_without_error(mins, -1, 361) == true) {
						if (isInt_without_error(secs, -1, 61) == true) {
							time = String((parseInt(mins)*60) + parseInt(secs));
						} else {
							if (secs > 60) {
								embed_error(msg, "There are 60 seconds in a min, your seconds value can't be larger then 60!");
							} else {
								embed_error(msg, "Invalid format your specified seconds is not an integer between 0 and 60! The syntax for the command is `"+prefix[msg.guild.id]+"slowmode {MM:SS}`");
							}
							return false;
						}
					} else {
						embed_error(msg, "Invalid format your specified mins is not an integer! The syntax for the command is `"+prefix[msg.guild.id]+"slowmode {MM:SS}`");
						return false;
					}
				} else {
					time = command;
				}
				
				if (isInt(msg, time, 0, 21601, "interval", ErrorMessageEnd="The syntax for the command is `"+prefix[msg.guild.id]+"slowmode {MM:SS}`") == true) {
					msg.channel.setRateLimitPerUser(parseInt(time));
					embed_chat_reply(msg, "Slowmode has been set to " + time + " seconds!");
				}
				
			} else {
				embed_error(msg, "You dont have permission to use slowmode, "+mod_error_text+" manage messages permission!");
			}
		}
	}
})

// Custom Embed Generator
function get_tag_value(txt, tag) {
	try {
		if (commands.indexOf("["+tag+"]") > -1 && commands.indexOf("[/"+tag+"]") > -1) {
			current = commands.split("["+tag+"]")[1].split("[/"+tag+"]");
			if (current.length == 2) {
				return current[0];
			}
		}
	} catch (err) {
		console_log("Error thrown in get_tag_value function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"embed ") {
			commands = msg.content.slice(7, msg.content.length);
			color_codes = {
				"red" : "#FF0000", "cyan" : "#00FFFF", "blue" : "#0000FF", "dark blue" : "#0000A0", "light blue" : "#ADD8E6", "purple" : "#800080",
				"yellow" : "#FFFF00", "lime" : "#00FF00", "magenta" : "#FF00FF", "white" : "	#FFFFFF", "silver" : "#C0C0C0", "grey" : "#808080",
				"black" : "#000000", "orange" : "#FFA500", "brown" : "#A52A2A", "maroon" : "#800000", "green" : "#008000", "olice" : "#808000"
			}
			
			// embed
			embed_custom = new Discord.MessageEmbed();
			
			// setColor - [color]hex color[/color]
			color = get_tag_value(commands, "color");
			if (color != undefined) {
				if (Object.keys(color_codes).indexOf(color) > -1) {
					embed_custom.setColor(color_codes[color]);
				}
			}
			
			// setTitle - [title]text[/title]
			title = get_tag_value(commands, "title");
			if (title != undefined) {
				embed_custom.setTitle(title);
			}
			
			// setDescription - [description]text[/description]
			description = get_tag_value(commands, "description");
			if (description != undefined) {
				embed_custom.setDescription(description);
			}
			
			// setThumbnail - [thumb]url[/thumb]
			thumbnail = encodeURI(get_tag_value(commands, "thumb"));
			if (thumbnail != "undefined") {
				embed_custom.setThumbnail(thumbnail);
			}
			
			// setURL - [url]url[/url]
			url = encodeURI(get_tag_value(commands, "url"));
			if (url != "undefined") {
				embed_custom.setURL(url);
			}
			
			// setImage - [image]url[/image]
			img = encodeURI(get_tag_value(commands, "image"));
			if (img != "undefined") {
				embed_custom.setImage(img);
			}
			
			// setTimestamp - [timestamp]
			if (commands.indexOf("[timestamp]") > -1) {
				embed_custom.setTimestamp();
			}
			
			// setAuthor - [author]text, url, url[/author]
			author = String(get_tag_value(commands, "author")).split(", ").join("").split(",");
			if (author != "undefined") {
				if (author.length == 3) {
					author_text = author[0];
					author_url = encodeURI(author[1]);
					author_url2 = encodeURI(author[2]);
					if (author_url.replace(/s/g, "").indexOf("http://") > -1) {
						if (author_url2.replace(/s/g, "").indexOf("http://") > -1) {
							embed_custom.setAuthor(author_text, author_url, author_url2);
						} else {
							embed_custom.setAuthor(author_text, author_url);
						}
					} else {
						embed_custom.setAuthor(author_text);
					}
				} else if (author.length == 2) {
					if (author[1].replace(/s/g, "").indexOf("http://") > -1) {
						embed_custom.setAuthor(author[0], encodeURI(author[1]));
					} else {
						embed_custom.setAuthor(author[0]);
					}
				} else {
					embed_custom.setAuthor(author[0]);
				}
			}
			
			// addField - [field]header[field] [value]value [inline][/value]
			output = commands;
			
			for (i=0;i<(commands.match(/field/g) || []).length;i++) {
				current_field_index = output.indexOf("[field]");
				if (current_field_index != -1) {
					output = output.slice(current_field_index, output.length);
					field = String(output.slice(output.indexOf("[field]")+7, output.indexOf("[/field]")));
					output = output.slice(field.length, output.length);
					value = String(output.slice(output.indexOf("[value]")+7, output.indexOf("[/value]")));
					
					if (field != "" && value != "") {
						if (i <= 25) {
							if (field.length <= 256 && value.length <= 1024) {
								field_name = field.replace(/\\n/g, "\n\u200B").replace(/\\b/g, "\u200B");
								field_value = value.replace(/\\n/g, "\n\u200B").replace(/\\b/g, "\u200B");
								if (field_value.indexOf("[inline]") > -1) {
									embed_custom.addField(field_name, field_value, true);
								} else {
									embed_custom.addField(field_name, field_value, false);
								}
							}
						}
					}
				}
			}
			
			// setFooter - [footer]text, url[/footer]
			footer = String(get_tag_value(commands, "footer")).split(", ").join(",").split(",");
			if (footer != "undefined") {
				if (footer.length == 2) {
					if (footer[1].replace(/s/g, "").indexOf("http://") == 0) {
						embed_custom.setFooter(footer[0], encodeURI(footer[1]));
					} else {
						embed_custom.setFooter(footer[0]);
					}
				} else {
					embed_custom.setFooter(footer[0]);
				}
			}
			
			// send message
			msg.channel.send(embed_custom).catch(err => {
				embed_error(msg, "Failed to create embed, you likely entered Invalid data, please refer to `"+prefix[msg.guild.id]+"help embed` for information on how to use the command! " + err);
			})
			
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"embed") {
			embed_custom_help = new Discord.MessageEmbed();
			embed_custom_help.setColor(embed_colour_info);
			embed_custom_help.setTitle("Embed Generator");
			embed_custom_help.setDescription("With the embed command you can create your own custom embeds, "+
			"the syntax for the command is `"+prefix[msg.guild.id]+"embed [tags]`, you can use any and all of the specified tags below.\n\u200B");
			embed_custom_help.addFields(
				{name: "[color][/color]", value: "Embed colour e.g. `[color]blue[/color]`.\n\u200B"},
				{name: "[title][/title]", value: "Title e.g. `[title]Server Rules[/title]`.\n\u200B"},
				{name: "[url][/url]", value: "Title Hyperlink e.g. `[url]https://a.com[/url]`.\n\u200B"},
				{name: "[description][/description]", value: "Description e.g. `[description]text[/description]`.\n\u200B"},
				{name: "[thumb][/thumb]", value: "Thumbnail e.g. `[thumb]https://a.com/cat.png[/thumb]`.\n\u200B"},
				{name: "[image][/image]", value: "Image e.g. `[image]https://a.com/cat.png[/image]`.\n\u200B"},
				{name: "[author][/author]", value: "Author e.g. `[author]Jared, https://a.com/cat.png, https://a.com[/author]`.\n\u200B"},
				{name: "[field][/field]", value: "Add Field e.g. `[field]a field[/field]`.\n\u200B"},
				{name: "[value][/value]", value: "Add Field Value e.g. `[value]Some value here[/value]`.\nYou can put fields on same line with `[inline]` tag.\n\u200B"},
				{name: "[timestamp]", value: "Add Timestamp e.g. `[timestamp]`.\n\u200B"},
				{name: "[footer][/footer]", value: "Add Footer e.g. `[footer]text, url, url[/footer]`.\n\u200B"},
				{name: "Special Chars", value: "To add a new line anywhere in your embed type `\\n`, to create blank field type `\\b`."}
			)
			embed_custom_help.setTimestamp();
			msg_channel_send(msg, embed_custom_help);
			
		}
	}
})

// translate
var country_codes = {};
function country_code_name(code) {
	if (country_codes[code] != undefined) {
		return country_codes[code];
	} else {
		return code;
	}
}

function read_dataset_file(file_name, des, global_var) {
	fs_read.readFile(file_name, "utf-8", function(err, data) {
		lines = data.split('\n');
		for (i=0;i<lines.length;i++) {
			line = lines[i].split(',');
			if (line.length == 2) {
				global_var[line[0]] = line[1];
			}
		}
		console_log('Finished '+des+' dataset!')
	})
}

bot.on("ready", msg => {
	read_dataset_file(dataset_country_codes, "Country Code", country_codes)
})

async function process_lan(msg, src, no_english=false, source_lan = "auto", destin_lan = "eng") {
	try {
		url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=";
		url_encode = encodeURI(url + source_lan + "&tl=" + destin_lan + "&dt=t&q=" + src);

		// get html
		request(url_encode, {
			headers: {
				"User-Agent": user_agent
			},
			body: "",
			method: "GET"
		}, (err, res, html) => {
			if (res.statusCode == 200) {
				// process HTML
				tr_dict = JSON.parse(html);
				decoded = tr_dict[0][0][0];
				source_lan = country_code_name(tr_dict[2]);
				des_lan_code = country_code_name(destin_lan);
				speed = tr_dict[6];
				console_log("Google Translate API translated text on " + msg.guild.name);
			
				// check user input for swear
				if (check_msg_for_swear(msg, doReply=false, deleteMsg=false) != true) {
					// check bot reply
					if (check_msg_for_swear(msg, doReply=false, deleteMsg=false, textInput=decoded) == true) {
						embed_modderation(msg, "<@" + msg.author.id + "> No translating offensive or alarming messages!", "WARNING!");
					
						// try to delete message
						msg.delete().catch(error => {
							console_log("Failed to delete message on guild " + msg.guild.name);
						})
					
					} else {
						// embed
						translate_description = "Translated from `"+source_lan+"` to `"+des_lan_code+"` in "+speed+" seconds!";
						translate_URL = "https://translate.google.com/";
						
						if (no_english == true) {
							if (src.toLowerCase().replace(/ /g, '') != decoded.toLowerCase().replace(/ /g, '')) {
								embed_input_output_reply(msg, src, decoded, "Translation", translate_description, url=translate_URL);
							}
						} else {
							embed_input_output_reply(msg, src, decoded, "Translation", translate_description, url=translate_URL);
						}
					}
				}
			}
		})
	} catch (err) {
		console_log("Error throw in process_lan function! " + err, error=true);
	}
}

function translate_message(msg, term, no_english=false, source_lan = "auto", destin_lan = "eng") {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, term.length+1) == prefix[msg.guild.id]+term) {
			src = msg.content.slice(term.length, msg.content.length);
			
			process_lan(msg, src, no_english=false, source_lan=source_lan, destin_lan=destin_lan).catch(error => {
				console_log("error thrown in process_lan function! " + error, error=true);
			})
		}
	}
}

bot.on("message", msg => {
	translate_message(msg, 'translate ', no_english=false, source_lan="auto", destin_lan = "eng");
	translate_message(msg, 'french ', no_english=false, source_lan="eng", destin_lan = "fr");
	translate_message(msg, 'mandarin ', no_english=false, source_lan="eng", destin_lan = "cn");
	translate_message(msg, 'spanish ', no_english=false, source_lan="eng", destin_lan = "es");
	translate_message(msg, 'russian ', no_english=false, source_lan="eng", destin_lan = "ru");
})

// autotranslate
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild.me.hasPermission("SEND_MESSAGES") == true) {
			if (msg.member != null && msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				if (msg.content == prefix[msg.guild.id]+"autotranslate on") {
					// write channel ID to file
					create_file_then_append_data(msg, autotranslate_filename, msg.channel.id, endl="", overwrite=true);
					embed_chat_reply(msg, "Turned autotranslate on, all messages posted in this channel will be automatically translated to English, to turn autotranslate off type `"+prefix[msg.guild.id]+"autotranslate off`");
					autotranslate_channels[msg.guild.id] = [String(msg.channel.id)];
					
				} else if (msg.content == prefix[msg.guild.id]+"autotranslate off") {
					create_file_then_append_data(msg, autotranslate_filename, "", endl="", overwrite=true);
					embed_chat_reply(msg, "Autotranslate turned off, messages will no longer be automtically translated, to turn autotranslate on type `"+prefix[msg.guild.id]+"autotranslate on`");
					autotranslate_channels[msg.guild.id] = "";
				}
			}
		}
	}
})

var dictonary_words = [];
bot.on("ready", msg => {
	fs_read.readFile(dataset_dict_words, "utf-8", function(err, data) {
		if (err) {
			console_log("Failed to read Dictonary Words dataset! " + err, error=true);
		} else {
			dictonary_words = data.toLowerCase().replace(/[\r!@#$%^&*()_+-=:";',.<>/?]/g, '').split('\n');
			console_log("Read Dictonary Words dataset!");
		}	
	})
})

var autotranslate_timeout = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (autotranslate_channels[msg.guild.id] != undefined) {
			if (msg.channel.id == autotranslate_channels[msg.guild.id][0]) {
				if (msg.author.bot == false) {
					// check for undefined
					if (autotranslate_timeout[msg.guild.id] == undefined) {
						autotranslate_timeout[msg.guild.id] = false;
					}
					
					if (autotranslate_timeout[msg.guild.id] == false) {
						// clear timeout
						autotranslate_timeout[msg.guild.id] = true;
						setTimeout(function(){
							autotranslate_timeout[msg.guild.id] = false;
						}, autotranslate_reset_timeout, msg);
						
						// check for empty message
						if (msg.content.length == 0) {
							return true;
						}
						
						// check for emoji
						current_emoji_msg = msg.content.split(":");
						if (current_emoji_msg.length > 2) {
							if (current_emoji_msg[1].indexOf(" ") == -1) {
								return true;
							}
						}
						
						// check for prefixed command
						chars = "!@#$%^&*()-=_+{}|;'|\,.<>/?";
						for (i=0;i<chars.length;i++) {
							if (msg.content[0].indexOf(chars[i]) > -1) {
								return true;
							}
						}
					
						// check if word in dict
						lower_case_msg = msg.content.toLowerCase().split(" ");
						for (i=0;i<dictonary_words.length;i++) {
							for (l=0;l<lower_case_msg.length;l++) {
								if (lower_case_msg[l] == dictonary_words[i]) {
									return true;
								}
							}
						}
						
						// translate text
						process_lan(msg, msg.content, no_english=true).catch(error => {
							console_log("Failed to translate message in autotranslate channel! " + error, error=true);
						})
					}
				}
			}
		}
	}
})

var autotranslate_channels = {};
bot.on("ready", msg => {
	// read file
	read_file(autotranslate_filename, autotranslate_channels, allow_non_int=true, sep="", remove_dupes=false, single_item=false);
})

// ancient languages
function help_code_language(msg) {
	embed_lan = new Discord.MessageEmbed();
	embed_lan.setTitle("Code Language Help");
	embed_lan.setColor(embed_color_chat);
	embed_lan.addFields(
		{name: "Morse Code", value: "`-morse {text}` Converts text to Morse Code.\n\u200B"},
		{name: "Ogham", value: "`-ogham {text}` Converts text to the ancient language Ogham.\n\u200B"},
	)
	msg_channel_send(msg, embed_lan);
}

var morse_letters = {};
bot.on("ready", msg => {
	read_dataset_file(dataset_morse, "Morse Code", morse_letters);
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7) == prefix[msg.guild.id]+"morse ") {
			txt = msg.content.slice(7, msg.content.length);
			letters = [];
			for (i=0;i<txt.length;i++) {
				current_letter = morse_letters[txt[i].toLocaleUpperCase()];
				if (current_letter != undefined) {
					letters.push(current_letter.replace(/[\n\t\r]/g, ''));
				}
			}
			
			// message user
			embed_chat_reply(msg, '`'+letters.join('   ')+'`');
		}
	}
})

function gen_lan(txt, abc) {
	letters = [];
	for (i=0;i<txt.length;i++) {
		current_letter = txt[i].toLocaleLowerCase().charCodeAt()-97;
		if (current_letter <= abc.length) {
			letters.push(abc[current_letter]);
		}
	}
	return letters.join('');
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7) == prefix[msg.guild.id]+"ogham ") {
			ogham = "ᚐᚁᚉᚇᚓᚃᚌᚆᚔᚌᚊᚂᚋᚅᚑᚚᚊᚏᚄᚈᚒᚃᚒᚒᚎᚔᚎ ";
			embed_chat_reply(msg, "`"+gen_lan(msg.content.slice(7, msg.content.length), ogham)+"`");
		}
	}
})


// base (convert to hex, oct, bin)
function hex_oct_bin(msg, base, base_name) {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content.slice(0,5) == prefix[msg.guild.id]+base_name+" ") {
				value = msg.content.slice(5, msg.content.length);
				if (isNaN(parseInt(value))) {
					hex_string = "";
					for (i=0;i<value.length;i++) {
						hex_string = hex_string + String(value.charCodeAt(i).toString(base)) + " ";
					}
					embed_input_output_reply(msg, value, hex_string, "Calculator", "type -help math for list of commands");
				} else {
					calc_output_data = parseInt(value).toString(base);
					embed_input_output_reply(msg, value, calc_output_data, "Calculator", "type -help math for list of commands");
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in hex_oct_bin function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		hex_oct_bin(msg, 16, "hex");
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		hex_oct_bin(msg, 8, "oct");
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		hex_oct_bin(msg, 2, "bin");
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"base") {
			value = msg.content.slice(5, msg.content.length).split(" ");
			if (value.length == 2) {
				base = value[0];
				num = value[1];
				if (isNaN(parseInt(base)) == false && isNaN(parseInt(num)) == false) {
					if (base <= 36 && base >= 2) {
						calc_output_data = parseInt(num).toString(parseInt(base));
						embed_input_output_reply(msg, num, calc_output_data, "Calculator", "type -help math for list of commands");
					} else {
						embed_error(msg, "Your base value must be within the rage 2-36!");
					}
				} else {
					embed_error(msg, "Invalid Format! both your base and num values must be integers!");
				}
			} else {
				embed_error(msg, "Invalid Format! correct format is `"+prefix+"base{num1} {num2}` e.g. `"+prefix+"base10 50`")
			}
		}
	}
})

// base
function base(n, c) {
	n = [n, ""]
	while (n[0] != 0) {
		n[1] = c[n[0] % c.length] + n[1];
		n[0] = parseInt(n[0] / c.length);
	}
	return n[1];
} 

// backwards conversion bin2int, oct2int, hex2int
function base2int(msg, content, command, base_name, base, base_charset) {
	try {
		if (content.slice(0, command.length+2) == prefix[msg.guild.id]+command+" ") {
			value = content.slice(9, content.length);
			for (i=0;i<value.length;i++) {
				if (base_charset.indexOf(value[i]) == -1) {
					embed_error(msg, "Invalid Number! Make sure that your number is in " + base_name + "!");
					return;
				}
			}
			// number is fine
			embed_input_output_reply(msg, value, parseInt(value, base), "Calculator", "type -help math for list of commands");
		}
	} catch (err) {
		console_log("Error thrown in base2int function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"bin2int ") {
			base2int(msg, msg.content, "bin2int", "binary", 2, "01");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"oct2int ") {
			base2int(msg, msg.content, "oct2int", "octodecimal", 8, "01234567");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"hex2int ") {
			base2int(msg, msg.content, "hex2int", "hexadecimal", 16, "0123456789abcdef");
		}
	}
})

// bin2text, oct2text, hex2text
function base2text(msg, base_charset, base) {
	try {
		values = msg.content.slice(10, msg.content.length).split(" ");
		base_names = {2 : "Binary", 8 : "Octal Decimal", 16 : "Hexadecimal"};
		output = "";
	
		for (n=0;n<values.length;n++) {
			// itter through each digit in string
			digits = values[n];
			for (i=0;i<digits.length;i++) {
				if (base_charset.indexOf(digits[i]) == -1) {
					embed_error(msg, "Invalid Input make sure that your number is in "+base_names[base]+"!");
					return true;
				}
			}
	
			// number is fine
			output = output + String.fromCharCode(parseInt(digits, base));
		}
		// send user message
		embed_input_output_reply(msg, values.join(" "), output, "Calculator", "type -help math for list of commands");
	} catch (err) {
		console_log("Error thrown in base2text function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"bin2text ") {
			base2text(msg, "01", 2);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"oct2text ") {
			base2text(msg, "01234567", 8);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"hex2text ") {
			base2text(msg, "0123456789abcdef", 16);
		}
	}
})


// int to roman numberal
function int2roman(msg, num) {
	try {
		units = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
		tens = ["X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
		hundreds = ["C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
		thousands = [
			"M", "MM", "MMM", "MMMM", "Ṽ", "ṼṼ", "ṼṼṼ", "ṼṼṼ", "ṼṼṼṼ", "Ẋ",			// 1,000 to 10,000
			"ẊM", "ẊMM", "ẊMMM", "ẊÎṼ", "ẊṼ", "ẊṼM", "ẊṼMM", "ẊṼMMM", "ẊÎẊ", "ẊẊ",	// 11,000 to 20,000
			"ẊẊM", "ẊẊMM", "ẊẊMMM", "ẊẊÎṼ", "ẊẊṼ", "ẊẊṼM", "ẊẊṼMM", "ẊẊṼMMM", "ẊẊÎẊ", "ẊẊẊ", // 21,000 to 30,000
			"ẊẊẊM", "ẊẊẊMM", "ẊẊẊMMM", "ẊẊẊÎṼ", "ẊẊẊṼ", "ẊẊẊṼM", "ẊẊẊṼMM", "ẊẊẊṼMMM", "ẊẊẊÎẊ", "ẊĹ", // 31,00 to 40,000
			"ẊĹM", "ẊĹMM", "ẊĹMMM", "ẊĹÎṼ", "ẊĹṼ", "ẊĹṼM", "ẊĹṼMM", "ẊĹṼMMM", "ẊĹṼÎẊ", "Ĺ", // 41,000 to 50,000
			"ĹM", "ĹMM", "ĹMMM", "ĹÎṼ", "ĹṼ", "ĹṼM", "ĹṼMM", "ĹṼMMM", "ĹÎẊ", "ĹẊ", // 51,000 to 60,000
			"ĹẊM", "ĹẊMM", "ĹẊMMM", "ĹẊÎṼ", "ĹẊṼ", "ĹẊṼM", "ĹẊṼMM", "ĹẊṼMMM", "ĹẊÎẊ", "ĹẊẊ", // 61,000 to 70,000
			"ĹẊẊM", "ĹẊẊMM", "ĹẊẊMMM", "ĹẊẊÎṼ", "ĹẊẊṼ", "ĹẊẊṼM", "ĹẊẊṼMM", "ĹẊẊṼMMM", "ĹẊẊÎẊ", "ĹẊẊẊ", // 71,000 TO 80,000
			"ĹẊẊẊM", "ĹẊẊẊMM", "ĹẊẊẊMMM", "ĹẊẊẊÎṼ", "ĹẊẊẊṼ", "ĹẊẊẊṼM", "ĹẊẊẊṼMM", "ĹẊẊẊṼMMM", "ĹẊẊẊÎẊ", "ẊƇ", // 81,000 to 90,000
			"ẊƇM", "ẊƇMM", "ẊƇMMM", "ẊƇÎṼ", "ẊƇṼ", "ẊƇṼM", "ẊƇṼMM", "ẊƇṼMMM", "ẊƇÎẊ", // 91,000 to 99,000
		];
		hundred_thousands = [
			"Ƈ", "ƇƇ", "ƇƇƇ", "ƇĎ", "Ď", "ĎƇ", "ĎƇƇ", "ĎƇƇƇ", "Ƈ₥"
		];
		million = [
			"₥", "₥₥", "₥₥₥"
		]
	
		if (isNaN(parseInt(num)) == false) {
			if (parseInt(num) < 5000000 && parseInt(num) > 0) {
				switch (num.length) {
					case 7:
						answer = (million[num[0]-1] + hundred_thousands[num[1]-1] + thousands[num.slice(2,3)-1] + hundreds[num[4]-1] + tens[num[5]-1] + units[num[6]-1]).split("undefined").join("");
						break;
					case 6:
						answer = (hundred_thousands[num[0]-1] + thousands[num.slice(1,3)-1] + hundreds[num[3]-1] + tens[num[4]-1] + units[num[5]-1]).split("undefined").join("");
						break;
					case 5:
						answer = (thousands[num.slice(0,2)-1] + hundreds[num[1]-1] + tens[num[2]-1] + units[num[3]-1]).split("undefined").join("");
						break;
					case 4:
						answer = (thousands[num[0]-1] + hundreds[num[1]-1] + tens[num[2]-1] + units[num[3]-1]).split("undefined").join("");
						break;
					case 3:
						answer = (hundreds[num[0]-1] + tens[num[1]-1] + units[num[2]-1]).split("undefined").join("");
						break;
					case 2:
						answer = (tens[num[0]-1] + units[num[1]-1]).split("undefined").join("");
						break;
					case 1:
						answer = (units[num[0]-1]).split("undefined").join("");
						break;
				}
				// send message
				embed_input_output_reply(msg, num, answer, "Calculator", "type -help math for list of commands");
			} else {
				embed_error(msg, "Invalid Range! Make sure that your number is between 0 and 4999!");
			}
		} else {
			embed_error(msg, "Invalid Input! make sure that your number is an integer!");
		}
	} catch (err) {
		console_log("Error thrown in int2roman function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"roman ") {
			int2roman(msg, msg.content.slice(7, msg.content.length));
		}
	}
})

// mov2mp4
function help_mp4(msg) {
	embed_mp4 = new Discord.MessageEmbed();
	embed_mp4.setColor(embed_color_chat);
	embed_mp4.setTitle("Help File Converter");
	embed_mp4.setDescription("Converts a video file to another format format, type any of the commands below when uploading an attachment to discord to convert the file.\n\u200B");
	embed_mp4.addFields(
		{name: prefix[msg.guild.id]+"mp4", value: "Converts to mp4\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"mov", value: "Converts to mov.\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"webm", value: "Converts to webm.\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"mp4low", value: "Converts to mp4 (under 8MB).\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"movlow", value: "Converts to mov (under 8MB).\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"webmlow", value: "Converts to webm (under 8MB).\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"mp3", value: "Converts video to mp3.\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"gif", value: "Converts video to gif.\n\u200B", inline: true},
		{name: prefix[msg.guild.id]+"render", value: "`"+prefix[msg.guild.id]+"help render`\n\u200B", inline: true},
	)
	embed_mp4.setTimestamp();
	msg_channel_send(msg, embed_mp4);
}

function help_render(msg) {
	embed_render = new Discord.MessageEmbed();
	embed_render.setColor(embed_color_chat);
	embed_render.setTitle("Help Render");
	embed_render.setDescription("The render command is used to automatically render MLT files, `.mlt` is the project file extension of the "+
	"[Shotcut](https://shotcut.org/) video editor. This feature is very useful for people who want to get into video editing but don’t have "+
	"computers powerful enough to render there own videos. Below are instructions on how to use the render engine.\n\u200B");
	embed_render.addFields(
		{name: "1. Copy Files", value: "The first thing you are going to want to do is copy all of your project files into a single folder, this inclues the `.mlt` file, and any video, audio or other files you have used in the project.\n\u200B"},
		{name: "2. Create Zip", value: "Next, create a zip file of all of your project files (you can use a program like [WinRar](https://www.rarlab.com/download.htm) or [7-Zip](https://www.7-zip.org/) to do this), make sure that the files are located in the root of the zip, i.e. they are not in any sub folder.\n\u200B"},
		{name: "3. Upload File", value: "Now that you have your zip file ready, upload the file to discord and type the comand `"+prefix[msg.guild.id]+"render` to begin rendering the video file.\n\u200B"},
		{name: "4. Wait", value: "Finaly after the file has been successfully uploaded to discord, simply wait for the render to finish, JaredBot will post a link to the file when it is done.\n\u200B"},
		{name: "Further help", value: "Please feel free to [watch this video](https://youtu.be/DV0tHwlGD_M) for more information!\n\u200B"}
	)
	embed_render.setTimestamp();
	msg_channel_send(msg, embed_render);
}

var mov2mp4_timeout = {};
var run_command = {};
var mov2mpt_start_time = {};
var render_dots = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"mp4" || msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"mov" || 
		msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"webm" || msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"mp4low" || 
		msg.content.slice(0, 7).toLowerCase() == prefix[msg.guild.id]+"movlow" || msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"webmlow" || 
		msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"mp3" || msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"gif") {
			url = undefined;
			if (msg.content.split(" ").length == 2) {
				if (msg.content.split(" ")[1].replace("https","http").slice(0, 38) == "http://cdn.discordapp.com/attachments/" ||
					msg.content.split(" ")[1].replace("https","http").slice(0, 30) == "http://jaredbot.uk/videos/src/") {
					url = msg.content.split(" ")[1];
				}
			} else {
				msg.attachments.forEach(function(attachment) {
					url = attachment.url;
				})
			}
			
			// check for undefined URL
			if (url == undefined) {
				embed_error(msg, "Not a valid URL or attachment!");
				return false;
			}
			
			// check for undefined timeout
			if (mov2mp4_timeout[msg.guild.id] == undefined) {
				mov2mp4_timeout[msg.guild.id] = false;
			}
			
			if (mov2mp4_timeout[msg.guild.id] == false) {
				// set bitrate
				if (msg.content.slice(0, 6) == prefix[msg.guild.id]+"mp4" || msg.content.slice(0, 6) == prefix[msg.guild.id]+"mov" ||
				msg.content.slice(0, 7) == prefix[msg.guild.id]+"webm") {
					// bit rate
					audio_bitrate = 200;
					target_size = 90;
					max_file_size = 100;
					flags = ' -af "volumedetect" -vn -sn -dn -f null -c:v h264_nvenc';
				
					// web server location
					extension = msg.content.split(".")[msg.content.split(".").length-1].replace(prefix[msg.guild.id],"");
					filename = msg.guild.id+"_"+parseInt((new Date().getTime()) / 1024)+"_output." + extension;
					output_file = server_folder_location + "videos/src/" + filename;
				
				} else if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"mp3") {
					audio_bitrate = 200;
					target_size = 90;
					max_file_size = 100;
					
					extension = "mp3";
					filename = msg.guild.id+"_"+parseInt((new Date().getTime()) / 1024)+"_output." + extension;
					output_file = server_folder_location + "videos/src/" + filename;
					cmd = 'ffmpeg -y -i "' + url + '" -b:a '+audio_bitrate+'k -vn "' + output_file + '"';
				
				} else if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"gif") {
					audio_bitrate = 50;
					target_size = 7;
					max_file_size = 8;
					
					extension = "gif";
					filename = msg.guild.id+"_"+parseInt((new Date().getTime()) / 1024)+"_output." + extension;
					output_file = server_folder_location + "videos/src/" + filename;
					cmd = 'ffmpeg -y -i "' + url + '" -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "' + output_file + '"';
					
				} else {
					// bitrate
					audio_bitrate = 50;
					target_size = 7;
					max_file_size = 8;
					flags = ' -af "volumedetect" -vn -sn -dn -f null -c:v h264_nvenc -r 8 -filter:v fps=fps=8';
				
					// server folder path
					extension = msg.content.split(".")[msg.content.split(".").length-1].replace(prefix[msg.guild.id],"").replace('low','');
					server_name = get_server_name(msg); // server folder
					filename = msg.guild.id+"_"+parseInt((new Date().getTime()) / 1024)+"_output." + extension;
					output_file = server_folder_location + "videos/src/" + filename;
				}
			
				// encode video
				if (url != undefined) {
					mov2mp4_timeout[msg.guild.id] = true;
					mov2mpt_start_time[msg.guild.id] = new Date();
					file2large = false;
					if (url.slice(0, 39) == "https://cdn.discordapp.com/attachments/" && url.indexOf(" ") == -1 ||
						url.slice(0, 31) == "https://jaredbot.uk/videos/src/") {
						if (url.indexOf(".mov") > -1 || url.indexOf(".avi") > -1 || url.indexOf(".webm") > -1 || url.indexOf(".mp4") > -1) {
							// get video length
							console_log("getting file meta data " + msg.guild.name + "!", error=false, mod=true);
							msg_channel_send(msg, "Getting file meta data!");
							exec('ffprobe -i "'+url+'" -show_entries format=duration -v quiet -of csv="p=0"', (err, stdout_size, stderr) => {
								if (err) {
									embed_error("Failed to get video meta data!");
									console_log("Failed to get video meta data!", error=true);
								}
								
								// get file size
								get_metadata(url, function(metadata) {
									target_size = parseFloat(metadata['content-length'] / 1024 / 1024);
								
									// calc bitrate
									if (msg.content.slice(0, 4) != prefix[msg.guild.id]+"mp3" && msg.content.slice(0, 4) != prefix[msg.guild.id]+"gif") {
										bitrate = parseInt((((target_size * 1024 * 1024 * 8) / stdout_size.replace('\r\n','')) / 1024) - audio_bitrate) + "k";
										cmd = 'ffmpeg -y -i "' + url + '" -b:v '+bitrate+' -b:a '+audio_bitrate+'k -qscale 0 "' + output_file + '"' + flags;
									}
									
									// process video
									msg.channel.send("Encoding video please wait!").then(reply_msg => {
										console_log("File Encoding started on " + msg.guild.name + "!", error=false, mod=true);
										
										// edit message
										edit_interval = setInterval(function() {
											fs_read.stat(output_file, function(err, stats) {
												if (stats != undefined) {
													percnt = parseInt(((stats.size / 1024 / 1024) / max_file_size)*100);
													if (percnt <= 100) {
														reply_msg.edit("Encoding video please wait! ["+percnt+"% complete]!");
													} else {
														if (render_dots[msg.guild.id] == undefined) {
															render_dots[msg.guild.id] = 1;
														}
														dots = " •".repeat((render_dots[msg.guild.id] % 5)+1);
														reply_msg.edit("Encoding video please wait! taking longer then expected!" + dots);
														render_dots[msg.guild.id] += 1;
														if (render_dots[msg.guild.id] > 5) {
															render_dots[msg.guild.id] = 0;
														}
													}
												}
												
												// check if file is to large for discord
												if ((new Date() - mov2mpt_start_time[msg.guild.id])/1000 > max_render_time) {
													embed_error(msg, "Stopped processing file as it is taking to long to encode!");
													reply_msg.edit("Encoding video please wait! [100% complete]!");
													clearInterval(edit_interval);
													mov2mp4_timeout[msg.guild.id] = false;
													file2large = true;
													
													// kill ffmpeg process
													if (run_command[msg.guild.id] != undefined && run_command[msg.guild.id]._handle != null) {
														try {
															for (i=0;i<5;i++) {
																exec("taskkill /f /im ffmpeg.exe", (err, stdout, stderr) => {
																	console_log("ffmpeg process terminated!", error=false, mod=true);
																	mov2mp4_timeout[msg.guild.id] = false;
																})
															}
														} catch (err) {
															console_log("Error failed to shutdown ffmpeg process!", error=true);
														}
													}
													
													// delete file
													setTimeout(function() {
														fs_read.unlink(output_file, function(err) {
															if (err) {
																console_log("Failed to delete output.mp4 on " + msg.guild.name + "! " + err, error=true);
															}
															console_log("Deleted output.mp4 on " + msg.guild.name + "!", error=false, mod=true);
														})
													}, 5000)
												}
											})
										}, 2000, output_file, msg);
										
										// encode
										run_command[msg.guild.id] = exec(cmd, (err, stdout, stderr) => {
											console_log("Finished encoding file for " + msg.guild.name + "!", error=false, mod=true);
									
											// check if file exists
											if (fs_read.existsSync(output_file) == true) {
												if (msg.content.slice(0, 7) == prefix[msg.guild.id]+"mp4low" || msg.content.slice(0, 7) == prefix[msg.guild.id]+"movlow" || 
													msg.content.slice(0, 8) == prefix[msg.guild.id]+"webmlow") {
													if (file2large == false) {
														msg_channel_send(msg, "Uploading file to discord servers!").then(uploading_reply => {
															input_extension = url.split(".")[url.split(".").length-1].replace(prefix[msg.guild.id],"");
															msg.channel.send("Converted `"+input_extension+"` to `"+(msg.content+" ").split(" ")[0].slice(1)+"`", { files: [output_file] }).then (sent_file => {
																console_log("File sent to server " + msg.guild.name + "!");
																mov2mp4_timeout[msg.guild.id] = false;
																clearInterval(edit_interval);
																reply_msg.edit("Encoding video please wait! [100% complete]!");
												
																// delete file
																fs_read.unlink(output_file, function(err) {
																	if (err) {
																		console_log("Failed to delete output file on " + msg.guild.name + "! " + err, error=true);
																	}
																	console_log("Deleted output file on " + msg.guild.name + "!", error=false, mod=true);
																})
															}).catch(err => {
																embed_error(msg, "Failed to upload file! " + err);
																msg_channel_send(msg, webserver_root_address + "videos/src/" + filename);
																mov2mp4_timeout[msg.guild.id] = false;
																clearInterval(edit_interval);
															})
														})
													} else {
														mov2mp4_timeout[msg.guild.id] = false;
														clearInterval(edit_interval);
													}
												} else if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"mp4" || 
													msg.content.slice(0, 4) == prefix[msg.guild.id]+"mov" ||
													msg.content.slice(0, 5) == prefix[msg.guild.id]+"webm" ||
													msg.content.slice(0, 4) == prefix[msg.guild.id]+"mp3" ||
													msg.content.slice(0, 4) == prefix[msg.guild.id]+"gif") {
													
													// send message
													if (target_size > 8 && msg.content.slice(0, 4) != prefix[msg.guild.id]+"mp3" &&
														msg.content.slice(0, 4) == prefix[msg.guild.id]+"gif") {
														// link to file on web server
														msg_channel_send(msg, webserver_root_address + "videos/src/" + filename);
														reply_msg.edit("Encoding video please wait! [100% complete]!");
														mov2mp4_timeout[msg.guild.id] = false;
														clearInterval(edit_interval);
													} else {
														// upload file
														input_extension = url.split(".")[url.split(".").length-1].replace(prefix[msg.guild.id],"");
														msg.channel.send("Converted `"+input_extension+"` to `"+(msg.content+" ").split(" ")[0].slice(1)+"`", { files: [output_file] }).then (sent_file => {
															console_log("File sent to server " + msg.guild.name + "!");
															mov2mp4_timeout[msg.guild.id] = false;
															clearInterval(edit_interval);
															reply_msg.edit("Encoding video please wait! [100% complete]!");
												
															// delete file
															fs_read.unlink(output_file, function(err) {
																if (err) {
																	console_log("Failed to delete output file on " + msg.guild.name + "! " + err, error=true);
																}
																console_log("Deleted output file on " + msg.guild.name + "!", error=false, mod=true);
															})
														}).catch(err => {
															msg_channel_send(msg, webserver_root_address + "videos/src/" + filename);
															reply_msg.edit("Encoding video please wait! [100% complete]!");
															mov2mp4_timeout[msg.guild.id] = false;
															clearInterval(edit_interval);
														})
													}
												}
											} else {
												embed_error(msg, "Failed to encode the file!");
												msg_channel_send(msg, webserver_root_address + "videos/src/" + filename);
												mov2mp4_timeout[msg.guild.id] = false;
												clearInterval(edit_interval);
											}
										})
									}).catch(err => {
										console_log("Error thrown in mp4 function! " + err, error=true);
									})
								})
							})
						} else {
							embed_error(msg, "Invalid file type, please make sure to provide a valid file format such as: `.mov`, `.webm`, `.avi`!");
							mov2mp4_timeout[msg.guild.id] = false;
						}
					} else {
						embed_error(msg, "Not a valid discord attachment!");
						mov2mp4_timeout[msg.guild.id] = false;
					}
				} else {
					help_mp4(msg);
				}
			} else {
				embed_error(msg, "Please wait for the first video file to finish encoding before trying to encode another!");
			}
		}
	}
})

// caption
function calc_font_size(img_width, txt) {
	font_sizes = [128, 64, 32, 16, 14, 12, 10, 8];
	sans = {
		128: jimp.FONT_SANS_128_BLACK,
		64: jimp.FONT_SANS_64_BLACK,
		32: jimp.FONT_SANS_32_BLACK,
		16: jimp.FONT_SANS_16_BLACK,
		14: jimp.FONT_SANS_14_BLACK,
		12: jimp.FONT_SANS_12_BLACK,
		10: jimp.FONT_SANS_10_BLACK,
		8: jimp.FONT_SANS_8_BLACK,
	}
	
	font_width = txt.length * font_sizes[0];
	font_size = font_sizes[0];
	for (i=0;i<font_sizes.length;i++) {
		if (font_width > img_width) {
			font_width = txt.length * (font_sizes[i]/2);
			font_size = font_sizes[i];
		}
	}
	
	mid_pos = Math.abs(parseInt((img_width - (parseInt(font_size/2) * txt.length))/2));
	
	return [sans[font_size], font_size, mid_pos];
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 5).toLowerCase() == prefix[msg.guild.id]+"cap " || msg.content.slice(0, 9).toLowerCase() == prefix[msg.guild.id]+"caption ") {
			// url
			parts = msg.content.split(' ');
			url = undefined;
			if (parts[1].replace("https","http").slice(0, 38) == "http://cdn.discordapp.com/attachments/" ||
				parts[1].replace("https","http").slice(0, 30) == "http://jaredbot.uk/videos/src/") {
				url = parts[1];
				index = 2;
				
			} else {
				msg.attachments.forEach(function(attachment) {
					url = attachment.url;
					index = 1;
				})
			}
			
			// check for undefined URL
			if (url == undefined) {
				embed_error(msg, "Not a valid URL or attachment!");
				return false;
			}
			
			// set font size
			extension = url.split('.')[url.split('.').length-1];
			if (isInt_without_error(parts[parts.length-1], 1, 256) == true) {
				font_size = parts[parts.length-1];
				index2 = font_size.length;
			} else {
				font_size = 100;
				index2 = 0;
			}
			
			// video font
			if (extension == "mp4" || extension == "mov" || extension == "webm" || extension == "avi") {
				// var
				ifile = url;
				font = local_font_impact;
				txt = msg.content.slice(parts.slice(0, index).join(' ').length+1, msg.content.length-index2);
				font_color = "black";
				
				text_offset = 10;
				box = 1;
				bg_color = "white";
				bg_opacity = 0.5;
				bg_border = 5;
				x_pos = "(w-text_w)/2";
				y_pos = text_offset;
				output_filename = "output_" + msg.guild.id + "_" + parseInt(new Date().getTime() / 1000) +"."+ extension;
				output_file = server_folder_location + "videos/src/" + output_filename;
				input_file = server_folder_location + "videos/src/temp_" + output_filename;
				output_online = webserver_root_address + "videos/src/" + output_filename;
				bar_h = parseInt(font_size) + text_offset;
				
				// download video
				download(ifile, input_file, function(fobject) {
					// get resolution
					probe_cmd = `ffprobe -v error -show_entries stream=width,height -of default=noprint_wrappers=1 "${input_file}"`;
					exec(probe_cmd, (err, stdout, stderr) => {
						if (index2 == 0) {
							img_width = stdout.split('width=')[1].split('height')[0].replace(/[\r\n]/g, '');
							font_size = calc_font_size(img_width, txt)[1];
							bar_h = parseInt(font_size) + text_offset;
						}
						
						// command
						cmd = `ffmpeg -y -i "${input_file}" -vf "pad=in_w:in_h+${bar_h}:0:${bar_h}:white, crop=in_w:in_h:0:0, drawtext=${font} : \\text=\'${txt}\': fontcolor=${font_color}: fontsize=${font_size}: box=${box}: boxcolor=${bg_color}@${bg_opacity}: \boxborderw=${bg_border}: x=${x_pos}: y=${y_pos}" -crf 20 -codec:a copy "${output_file}"`;
						exec(cmd, (err, stdout, stderr) => {
							if (err) {
								console_log('Failed to render video! ' + err, error=true);
							}
							
							// upload files < 8MB to server
							file_size = fs_read.statSync(output_file).size;
							if (file_size / 1024 / 1024 < 8) {
								msg.channel.send("Captioned video!", {files: [output_file]}).catch(err => {
									console_log("Failed to upload captioned file to discord servers! " + err, error=true);
									msg.channel.send("Captioned video! " + output_online).catch(err => {
										console_log("Failed to send captioned video file to server! " + err, error=true);
									})
								}).catch(err => {
									console_log("Failed to send message! " + err, error=true);
								})
							} else {
								// message user
								msg.channel.send("Captioned video! " + output_online).catch(err => {
									console_log("Failed to send captioned video link to server! " + err, error=true);
								}).catch(err => {
									console_log("Failed to send message! " + err, error=true);
								})
							}
						})
					})
				})
			} else if (extension == "png" || extension == "jpg" || extension == "webp") {
				// vars
				output_filename = "output_" + msg.guild.id + "_" + parseInt(new Date().getTime() / 1000) +"."+ extension;
				output_file = server_folder_location + "videos/src/" + output_filename;
				output_online = webserver_root_address + "videos/src/" + output_filename;
				txt = msg.content.slice(parts.slice(0, index).join(' ').length+1, msg.content.length-index2);
				
				// read body
				try {
					jimp.read(url, function(err, body) {
						if (err) {
							embed_error(msg, "Failed to read image file! ", error=true);
							console_log("Failed to read image file in caption command! " + err, error=true);
							return false;
						}
						
						// read black bar
						jimp.read(local_blank_white, function(err, bar) {
							sans_font = calc_font_size(body.bitmap.width, txt); // returns font, font size, mid pos
							bar.resize(body.bitmap.width, body.bitmap.height + sans_font[1]);
							bar.blit(body, 0, sans_font[1]);
							
							// add font
							jimp.loadFont(sans_font[0]).then(function(font) {
								bar.print(font, sans_font[2], 0, txt);
								
								// write to file
								bar.write(output_file, err => {
									if (err) {
										console_log("Failed to write captioned file to disk! " + err, error=true);
									}
									
									// message user
									file_size = fs_read.statSync(output_file).size;
									if (file_size / 1024 / 1024 < 8) {
										msg.channel.send("Captioned Image!", {files: [output_file]}).catch(err => {
											console_log("Failed to upload captioned image to discord servers! " + err, error=true);
											msg.channel.send("Captioned Image! " + output_online).catch(err => {
												console_log("Failed to send captioned image to server! " + err, error=true);
											})
										}).catch(err => {
											console_log("Failed to send message! " + err, error=true);
										})
									} else {
										// message user
										msg.channel.send("Captioned image! " + output_online).catch(err => {
											console_log("Failed to send captioned video link to server! " + err, error=true);
										})
									}
								})
							}).catch(err => {
								console_log("Failed to load font for caption image! " + err, error=true);
							})
							
							
						})
						
					})
				} catch (err) {
					console_log("Error thrown in caption image function! " + err, error=true);
				}
			} else if (extension == "gif") {
				embed_error(msg, "Gifs are currently not supported but i plan to add the feature!");
				
			} else {
				embed_error(msg, 'Not a valid file type, please only upload image or video files!');
			}
			
		}
	}
})

// render project
render_timeout = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"render") {
			url = undefined;
			msg.attachments.forEach(function(attachment) {
				url = attachment.url.replace("https", "http");
			})
			
			// check for undefined timeout
			if (mov2mp4_timeout[msg.guild.id] == undefined) {
				mov2mp4_timeout[msg.guild.id] = false;
			}
			
			if (mov2mp4_timeout[msg.guild.id] == false) {
				if (url != undefined) {
					mov2mp4_timeout[msg.guild.id] = true;
					if (url.indexOf(" ") == -1 && url.indexOf("http://cdn.discordapp.com/attachments/") > -1) {
						if (url.indexOf(".zip") > -1) {
							// file name
							fname = "project_" + msg.guild.id + "_" + parseInt((new Date().getTime())/1000) + ".zip";
							mlt_local = server_folder_location + "videos/mlt/" + fname;
							mlt_dir = server_folder_location + "videos/mlt/" + fname.replace(".zip","");
							mlt_name = mlt_dir + "/" + fname.replace(".zip", ".mlt");
							mp4_output = server_folder_location + "videos/src/" + fname.replace(".zip", ".mp4");
							online_output = webserver_root_address + "videos/src/" + fname.replace(".zip", ".mp4");
							
							async function extract_zip(file_name, target_dir) {
								await fs_append.promises.mkdir(target_dir, {recursive: true});
								try {
									// extract file
									await zip_extract(file_name, {dir: target_dir});
									console_log("Finished extracting zip file!", error=false, mod=true);
									
									// rename files
									fs_append.readdirSync(target_dir).forEach(file => {
										if (file.split(".")[file.split(".").length -1] == "mlt") {
											fs_append.rename(target_dir +"/"+file, mlt_name, function(err) {
												console_log("Renamed mlt file!", error=false, mod=true);
											});
										}
									})
								} catch (err) {
									console_log("Failed to extract zip file! " + err, error=true);
								}
							}
							
							// kill melt process
							render_timeout[msg.guild.id] = setTimeout(function(){
								if (run_command[msg.guild.id] != undefined && run_command[msg.guild.id]._handle != null) {
									try {
										exec("taskkill /f /im melt.exe", (err, stdout, stderr) => {
											console_log("melt process terminated!", error=false, mod=true);
											mov2mp4_timeout[msg.guild.id] = false;
											clearTimeout(render_timeout);
											msg_channel_send(msg, "Script terminated as it ran for too long, max CPU time is " + parseInt(max_render_time/1000/60) + " mins!");
											
											// delete output file
											setTimeout(function(){
												try {
													fs_append.unlinkSync(mp4_output);
												} catch (err) {
													console_log("Failed to delete output file " + mp4_output + "!", error=true);
												}
											}, 1000, mp4_output);
										})
									} catch (err) {
										console_log("Error failed to shutdown ffmpeg process!", error=true);
									}
								}
							}, max_render_time, msg, mp4_output);
							
							// download zip
							msg_channel_send(msg, "Downloading Zip file!");
							download(url, mlt_local, function(fobject) {
								// extract zip
								msg_channel_send(msg, "Extracting zip!");
								extract_zip(mlt_local, mlt_dir).then(function() {
									// render video
									msg.channel.send("Rendering video file!").then(render_msg => {
										cmd = '"' + shotcut_melt_location + '" "' + mlt_name + '" -consumer avformat:'+mp4_output+' f=mp4 -silent -quiet';
										run_command[msg.guild.id] = exec(cmd, (err, stdout, stderr) => {
											console_log("Finished rendering file file for " + msg.guild.name + "!", error=false, mod=true);
											
											// delete files (cleanup)
											try {
												fs_append.rmdirSync(mlt_dir, {recursive: true});
												fs_append.unlinkSync(mlt_local);
												
											} catch (err) {
												console_log("Failed to remove MLT files! " + err, error=true);
											}
										
											// check if file exists
											if (fs_read.existsSync(mp4_output) == true) {
												// message user
												msg_channel_send(msg, online_output);
												mov2mp4_timeout[msg.guild.id] = false;
												clearTimeout(render_timeout);
											} else {
												embed_error(msg, "Failed to render video!");
												mov2mp4_timeout[msg.guild.id] = false;
												clearTimeout(render_timeout);
											}
										})
									}).catch(err => {
										console_log("Failed to send message! " + err, error=true);
									})
								})
							})
						} else {
							embed_error(msg, "Please provide a zip file, containg your `.mlt` file and other video files.");
							mov2mp4_timeout[msg.guild.id] = false;
							clearTimeout(render_timeout);
						}
					} else {
						embed_error(msg, "Not a valid discord attachment!", error=true);
						mov2mp4_timeout[msg.guild.id] = false;
						clearTimeout(render_timeout);
					}
				} else {
					help_render(msg);
				}
			} else {
				embed_error(msg, "Please wait for the first video file to finish rendering before trying to render another!");
				mov2mp4_timeout[msg.guild.id] = false;
				clearTimeout(render_timeout);
			}
		}
	}
})

// upscale image
upscale_cooldown = {}
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 8) == prefix[msg.guild.id]+"upscale") {
			// check for undefined
			if (upscale_cooldown[msg.guild.id] == undefined) {
				upscale_cooldown[msg.guild.id] = false;
			}
			
			if (upscale_cooldown[msg.guild.id] == false) {
				upscale_cooldown[msg.guild.id] = true
				url = undefined;
				msg.attachments.forEach(function(attachment) {
					url = attachment.url.replace("https", "http");
				})
				
				// get upscale value
				num = msg.content.split(" ");
				if (num.length == 2 && isInt_without_error(num[1], 0, 11) == true) {
					rescale = parseInt(num[1]);
				} else {
					rescale = 2;
				}
				
				filename = "res_" + msg.guild.id + "_" + parseInt(new Date().getTime() / 1000);
				output_file = server_folder_location + "videos/src/" + filename + ".png";
				online_file = webserver_root_address + "videos/src/" + filename + ".png";
				msg_channel_send(msg, "Photo is being upscaled please wait!");
				
				jimp.read(url, function(err, file) {
					if (err) {
						embed_error(msg, "Failed to upscale image! " + err);
					} else {
						try {
							width = file.bitmap.width
							height = file.bitmap.height
							file.resize(width * rescale, height * rescale).write(output_file);
							description = "upscaled image from `"+width+"x"+height+"` to `"+(width*rescale)+"x"+(height*rescale)+"`! ";
							embed_chat_reply(msg, description + online_file);
							upscale_cooldown[msg.guild.id] = false;
						} catch (err) {
							embed_error(msg, "Failed to upscale image! " + err);
							upscale_cooldown[msg.guild.id] = false;
						}
					}
				})
			} else {
				embed_error(msg, "Please wait for the first image to finish processing before trying starting another!");
			}
		}
	}
})

// YouTube download
function help_download(msg) {
	embed_download = new Discord.MessageEmbed();
	embed_download.setColor(embed_color_chat);
	embed_download.setTitle("YouTube Downloader help");
	embed_download.addFields(
		{name: prefix[msg.guild.id]+"download", value: "Downloads a YouTube video at the highest resolution (supports 8K).\n\u200B"},
		{name: prefix[msg.guild.id]+"downloadlow", value: "Downloads a YouTube video at the lowest resolution (144p).\n\u200B"},
		{name: prefix[msg.guild.id]+"downloadmp3", value: "Downloads only the audio of a YouTube video.\n\u200B"},
		{name: prefix[msg.guild.id]+"yt", value: "Searchs YouTube and posts link to video, e.g. `"+prefix[msg.guild.id]+"yt coffin dance`.\n\u200B"},
	)
	embed_download.setTimestamp();
	msg_channel_send(msg, embed_download);
}

function max_number(num){
	if (num > 100) {
		return "video taking longer then expected to download (file might be very large)...";
	} else {
		return num + "%";
	}
}

var yt_download_time = {};
var yt_download_interval = {};
var yt_download_start_time = {};
var yt_timeout = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 10).toLowerCase() == prefix[msg.guild.id]+"download " || 
			msg.content.slice(0, 13).toLowerCase() == prefix[msg.guild.id]+"downloadlow " || 
			msg.content.slice(0, 13).toLowerCase() == prefix[msg.guild.id]+"downloadmp3 ") {
			if (msg.content.slice(0, 13) == prefix[msg.guild.id]+"downloadmp3 " || msg.content.slice(0, 13) == prefix[msg.guild.id]+"downloadlow ") {
				url = msg.content.slice(13, msg.content.length).replace("http://", "https://");
				ytdl_filter_video = {quality: "lowestvideo", filter: "video"};
			} else {
				url = msg.content.slice(10, msg.content.length).replace("http://", "https://");
				ytdl_filter_video = {quality: "highestvideo", filter: "video"};
			}
			
			if (url.indexOf(" ") == -1) {
				if (url.indexOf("https://youtu.be") == 0 || url.indexOf("https://www.youtube.com") == 0) {
					// check for undefined
					if (yt_timeout[msg.guild.id] == undefined) {
						yt_timeout[msg.guild.id] = false;
					}
					
					if (yt_timeout[msg.guild.id] == false) {
						yt_timeout[msg.guild.id] = true;
					
						// file names
						fname =  msg.guild.id + "_" + parseInt((new Date().getTime())/1000);
						output_video = server_folder_location + 'videos/src/temp_vid_'+fname+'.mp4';
						output_audio = server_folder_location + 'videos/src/temp_audio_'+fname+'.wav';
						output_audiomp3 = server_folder_location + 'videos/src/output_'+fname+'.mp3';
						mered_video = server_folder_location + 'videos/src/output_'+fname+'.mp4';
						online_url = webserver_root_address + 'videos/src/output_'+fname+'.mp4';
						online_urlmp3 = webserver_root_address + 'videos/src/output_'+fname+'.mp3';
					
						// download time
						async function get_download_time() {
							data = await ytdl.getBasicInfo(url);
							yt_download_time[msg.guild.id] = parseInt(data.videoDetails.lengthSeconds / (download_speed / 20));
						} get_download_time();
					
						// process video
						msg.channel.send("Downloading please wait...").then(msg_reply => {
							// timeout
							yt_download_interval[msg.guild.id] = setInterval(function() {
								if (yt_download_start_time[msg.guild.id] != undefined) {
									yt_download_start_time[msg.guild.id] += 2;
									if (yt_download_time[msg.guild.id] != undefined) {
										if (yt_download_time[msg.guild.id] > yt_download_start_time[msg.guild.id]) {
											current_prct = parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100);
											msg_reply.edit("Downloading please wait... " + max_number(current_prct)).catch(err => {
												console_log("Failed to edit message! " + err, error=true);
											})
										}
									}
								}
							}, 2000, msg, msg_reply);
							
							try {
								if (msg.content.slice(0, 10) == prefix[msg.guild.id]+"download " || msg.content.slice(0, 13) == prefix[msg.guild.id]+"downloadlow ") {
									// download video
									yt_download_time[msg.guild.id] = 1;
									yt_download_start_time[msg.guild.id] = 0;
									current_prct = max_number(parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100));
									msg_reply.edit("Downloading video... " + current_prct);
									ytdl(url, ytdl_filter_video).pipe(fs_write.createWriteStream(output_video)
									).on("finish", vid => {
										console_log("Downloaded video!", error=false, mod=true);
						
										// download audio
										current_prct = max_number(parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100));
										msg_reply.edit("Downloading audio... " + current_prct);
										ytdl(url, {filter:"audioonly", quality:"highestaudio"}).pipe(fs_write.createWriteStream(output_audio)
										).on("finish", aud => {
											console_log("Downloaded Audio!", error=false, mod=true);
							
											// merge with ffmpeg
											current_prct = max_number(parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100));
											msg_reply.edit("merging video and audio... " + current_prct);
											cmd = 'ffmpeg -i "' + output_video + '" -i "' + output_audio + '" -c:v copy -c:a aac "' + mered_video + '"';
											exec(cmd, (err, stdout, stderr) => {
												if (err) {
													console_log("Error thrown when merging video and audio! " + err, error=true);
												}
												console_log("Merged video and audio!", error=false, mod=true);
								
												// delete temp files
												fs_append.unlink(output_video, file1 => {
													fs_append.unlink(output_audio, file2 => {
														console_log("Deleted temp files!", error=false, mod=true);
													})
												})
								
												// message user
												tm = parseInt(yt_autodelete_timeout / 60 / 60 / 1000);
												msg_channel_send(msg, "The file will be automatically deleted from the server in "+tm+" hour! " + online_url);
												msg_reply.edit("Finished processing video!");
												
												// autodelete file
												setTimeout(function() {
													try {
														fs_write.unlinkSync(mered_video)
														console_log("Deleted file " + mered_video + "!");
													} catch (err) {
														console_log("Failed to delete file " + mered_video + "! " + err);
													}
													console_log("Deleted file " + mered_video + "!");
												}, yt_autodelete_timeout, mered_video);
												
												// cleanup
												clearInterval(yt_download_interval[msg.guild.id]);
												yt_download_start_time[msg.guild.id] = 0;
												yt_download_time[msg.guild.id] = 0;
												yt_timeout[msg.guild.id] = false;
											})
										})
									})
								} else if (prefix[msg.guild.id]+"downloadmp3 ") {
									// download audio
									yt_download_time[msg.guild.id] = 1;
									yt_download_start_time[msg.guild.id] = 0;
									current_prct = max_number(parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100));
									msg_reply.edit("Downloading audio... " + current_prct);
									ytdl(url, {filter:"audioonly", quality:"highestaudio"}).pipe(fs_write.createWriteStream(output_audio)
									).on("finish", aud => {
										console_log("Downloaded Audio!", error=false, mod=true);
										
										// convert to mp3
										current_prct = max_number(parseInt((yt_download_start_time[msg.guild.id] / yt_download_time[msg.guild.id])*100));
										msg_reply.edit("encoding audio as mp3... " + current_prct);
										cmd = 'ffmpeg -i "' + output_audio + '" -vn "' + output_audiomp3 + '"';
										exec(cmd, (err, stdout, stderr) => {
											if (err) {
												console_log("Error thrown when merging video and audio! " + err, error=true);
											}
											console_log("Converted to mp3!", error=false, mod=true);
											
											// delete temp files
											fs_append.unlink(output_audio, file1 => {
												console_log("Deleted temp files!", error=false, mod=true);
											})
											
											// message user
											tm = parseInt(yt_autodelete_timeout / 60 / 60 / 1000);
											msg_channel_send(msg, "The file will be automatically deleted from the server in "+tm+" hour! " + online_urlmp3);
											
											// autodelete file
											setTimeout(function() {
												try {
													fs_write.unlinkSync(output_audiomp3);
													console_log("Deleted file " + output_audiomp3 + "!");
												} catch (err) {
													console_log("Failed to delete file " + output_audiomp3 + "! " + err);
												}
												console_log("Deleted file " + output_audiomp3 + "!");
											}, yt_autodelete_timeout, output_audiomp3);
											
											// cleanup
											clearInterval(yt_download_interval[msg.guild.id]);
											yt_download_start_time[msg.guild.id] = 0;
											yt_download_time[msg.guild.id] = 0;
											yt_timeout[msg.guild.id] = false;
											msg_reply.edit("Finished processing audio!");
										})
									})
								}
							} catch (err) {
								embed_error(msg, "Failed to download video!");
								console_log("Failed to download video! " + err, error=true);
								clearInterval(yt_download_interval[msg.guild.id]);
								yt_download_start_time[msg.guild.id] = 0;
								yt_download_time[msg.guild.id] = 0;
								yt_timeout[msg.guild.id] = false;
							}
						}).catch(err => {
							console_log("Failed to send message! " + err, error=true);
						})
					} else {
						embed_error(msg, "Please wait for the first video to finish download before trying to download another!");
					}
				} else {
					embed_error(msg, "Not a valid YouTube URL!");
				}
			} else {
				embed_error(msg, "Not a valid URL!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"yt " || msg.content.slice(0, 10) == prefix[msg.guild.id]+"ytsearch ") {
			command = msg.content.slice(msg.content.split(" ")[0].length, msg.content.length);
			youtube.search(command).then(response => {
				if (response != undefined) {
					// embed
					url = "https://www.youtube.com/watch?v=";
					msg_channel_send(msg, url + response.videos[0].id);
				}
			})
		}
	}
})

// Instagram download
function help_ig(msg) {
	embed_ig = new Discord.MessageEmbed();
	embed_ig.setColor(embed_color_chat);
	embed_ig.setTitle("Instagram Downloader help");
	embed_ig.addFields(
		{name: prefix[msg.guild.id]+"ig", value: "Downloads an instagram post.\n\u200B"},
	)
	embed_ig.setTimestamp();
	msg_channel_send(msg, embed_ig);
}

function get_extensions(arr) {
	new_arr = [];
	for (i=0;i<arr.length;i++) {
		new_arr.push("." + arr[i].split(".")[arr[i].split(".").length-1]);
	}
	return new_arr;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"ig ") {
			url = msg.content.slice(4, msg.content.length).split('?')[0];
			if (url.indexOf(" ") == -1) {
				// format URL
				url = url.split("/").filter(function(e){return e.length > 0});
				post_ID = url[url.length-1].split('?')[0];
				
				// dir
				drive = server_folder_location.split(":/")[0] + ":";
				src_dir = server_folder_location + 'videos/src';
				output_dir = server_folder_location + 'videos/src/-' + post_ID;
				online_location = webserver_root_address + 'videos/src';
				post_mp4 = false;
				
				// download post
				cmd = drive + " && cd "+src_dir+" && instaloader -- -" + post_ID;
				exec(cmd, (err, stdout, stderr) => {
					if (err) {
						console_log("Failed to download instagram post!" + err, error=true);
					}
					
					// get files in dir
					fs_read.readdir(output_dir, (err, files) => {
						if (err) {
							console_log("Failed to read files in dir! " + err, error=true);
							embed_error(msg, "Failed to download post!");
							return false;
						}
						
						// move and rename file
						extensions = get_extensions(files)
						
						if (get_extensions(files).indexOf(".mp4") > -1) {
							temp_fname = files[get_extensions(files).indexOf(".mp4")];
							extension = ".mp4";
						} else if (get_extensions(files).indexOf(".jpg") > -1) {
							temp_fname = files[get_extensions(files).indexOf(".jpg")];
							extension = ".png";
						} else {
							console_log("Post has an invalid file extension!", error=true);
							return false;
						}
						
						// rename file
						output_file = "output_" + post_ID + extension;
						local_file = src_dir + "/" + output_file;
						fs_read.rename(output_dir + "/" + temp_fname, local_file, fobject => {
							console_log("Renamed file!");
							
							// delete post dir
							fs_write.rmdir(output_dir, {recursive: true}, function(err) {
								if (err) {
									console_log("Failed to delete ig post folder!");
								} 
								console_log("Deleted post file!");
								
								// check if post is < 8MB
								file_size = fs_read.statSync(local_file).size;
								if (file_size / 1024 / 1024 < 8) {
									// upload file to discord
									embed_image_attachment(msg, local_file, "ig", function(err) {
										if (err == false) {
											console_log("Failed to upload file to discord servers, trying to send link! " + err, error=true);
											msg.channel.send(online_location + "/" + output_file).catch(err => {
												if (err) {
													console_log("Failed to send link to discord servers!", error=true);
												}
											}).catch(err => {
												console_log("Failed to send message! " + err, error=true);
											})
										}
										
										// delete file now that it's been uploaded
										setTimeout(function(){
											fs_write.unlink(local_file, err => {
												if (err) {
													console_log("Failed to delete ig post!");
												}
											})
										}, 1000);
									})
								
								// file to large to upload send link instead
								} else {
									// message user
									msg.channel.send(online_location + "/" + output_file).catch(err => {
										console_log("Failed to send file to discord server " + msg.guild.name + "!", error=true);
									}).catch(err => {
										console_log("Failed to send message! " + err, error=true);
									})
								}
							})
						})
					})
				})
			} else {
				embed_error(msg, "Invalid instagram post!");
			}
		}
	}
})

// test
bot.on("message", msg => {
	if (msg.content == "-test1") {
		
	}
})


// python challenges
var python_challenges = [];

function send_py_challenge(msg, is_channel=false) {
	try {
		// random challenge
		challenge = python_challenges[parseInt(Math.random() * 1000) % python_challenges.length];
		challenge = challenge.replace(/\r/g,"").replace(/\n\n/g, "").replace(/\n\n\n/g, "");
			
		// embed
		embed_py_challenge = new Discord.MessageEmbed();
		embed_py_challenge.setColor(embed_color_chat);
		embed_py_challenge.setTitle("Python Challenge");
		embed_py_challenge.setThumbnail(py_logo);
			
		// check for example
		if (challenge.indexOf("Example:") > -1) {
			example = challenge.split("Question:")[1].split("Example:")[1].split("Hints:")[0];
			question = challenge.split("Question:")[1].split("Example:")[0];
			hint = challenge.split("Hints:")[1];
			embed_py_challenge.addFields(
				{name: "Question", value: question + "\n\u200B"},
				{name: "Example", value: example + "\n\u200B"},
				{name: "Hint", value: hint + "\n\u200B"},
			)
		} else {
			question = challenge.split("Question:")[1].split("Hints:")[0];
			hint = challenge.split("Hints:")[1];
			embed_py_challenge.addFields(
				{name: "Question", value: question + "\n\u200B"},
				{name: "Hint", value: hint + "\n\u200B"},
			)
		}
		
		// send message
		embed_py_challenge.setTimestamp();
		embed_py_challenge.setFooter("py");
		if (is_channel == true) {
			channel.send(embed_py_challenge);
		} else {
			msg_channel_send(msg, embed_py_challenge);
		}
		
	} catch {
		console_log(msg, "Failed to send challenge to server!", error=true);
		embed_chat_reply(msg, "Failed to fetch challenge, please try again!");
	}
}

bot.on("ready", msg => {
	// read the python challenges dataset
	fs_read.readFile(py_challenges_dataset, "utf8", function(err, data) {
		if (err) {
			return console_log("Failed to read python challenges file!", error=true);			
		}
		
		// add data to python challenges variable
		python_challenges = data.split("[SEPERATOR]");
		console_log("Read Python Challenges dataset!");
		
	})
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"pychallenge" || msg.content == prefix[msg.guild.id]+"py challenge") {
			send_py_challenge(msg);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"autopy" || msg.content == prefix[msg.guild.id]+"autopychallenge") {
			// embed
			embed_autopy = new Discord.MessageEmbed();
			embed_autopy.setColor(embed_colour_info);
			embed_autopy.setTitle("Help AutoPyChallenges");
			embed_autopy.setDescription("AutoPyChallenge will automatically post a new Python challenge every 24 hours!");
			embed_autopy.addFields(
				{name: prefix[msg.guild.id]+"autopy on", value: "Turns on autopy posting a new challenge every 24 hours.\n\u200B"},
				{name: prefix[msg.guild.id]+"autopy off", value: "Turns off autopy, it will no longer post daily challenges.\n\u200B"}
			)
			embed_autopy.setTimestamp();
			msg_channel_send(msg, embed_autopy);
		
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"autopychallenge on" || msg.content == prefix[msg.guild.id]+"autopy on") {
			// get directory
			auto_dir = get_server_name(msg);
			auto_path = logging_path + "/" + auto_dir + "/" + auto_py_challenge_filename;
			
			// write channel ID to file
			fs_write.writeFile(auto_path, msg.channel.id, function(err) {
				if (err) {
					return console_log("Failed to write channel ID to autopy file!", error=true);
				}
			})
			embed_chat_reply(msg, "Auto Python Challenge enabled, a new challenge will be posted every 24 hours in this channel!" +
				"Type the `"+prefix[msg.guild.id]+"autopychallenge off` to turn off!");
				
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"autopychallenge off" || msg.content == prefix[msg.guild.id]+"autopy off") {
			// clear file
			clear_file(msg, auto_py_challenge_filename);
			
			// message user
			embed_chat_reply(msg, "Auto Python Challenge disabled");
		}
	}
})

// for guild in authorised servers
// if guild has autopy enabled, add guild to sent_pychallenge dict
// [cooldown, autopy enabled, channel ID]

var sent_pychallenge = {};
bot.on("ready", msg => {
	// read 
	read_file(auto_py_challenge_filename, sent_pychallenge);
})


bot.on("ready", msg => {
	setInterval(function() {
		keys = Object.keys(sent_pychallenge);
		for (i=0;i<keys.length;i++) {
			if (sent_pychallenge[keys[i]] != undefined) {
				current_time = new Date();
				if (current_time.getHours() == 4 && current_time.getMinutes() == 39) {
					// send message
					channel = bot.channels.cache.get(sent_pychallenge[keys[i]]);
					send_py_challenge(channel, is_channel=true);
				
				}
			}
		}
		
	}, 5000);
})


// periodic table
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"element ") {
			element_no = msg.content.slice(9, msg.content.length);
			element_names = {
				"hydrogen" : 1, "helium" : 2, "lithium" : 3, "beryllium" : 4, "boron" : 5, "carbon" : 6, "nitrogen" : 7, "oxygen" : 8,
				"fluorine" : 9, "neon" : 10, "sodium" : 11, "magnesium" : 12, "aluminum" : 13, "silicon" : 14, "phosphorus" : 15, "sulfur" : 16, 
				"chlorine" : 17, "argon" : 18, "potassium" : 19, "calcium" : 20, "scandium" : 21, "titanium" : 22, "vanadium" : 23, "chromium" : 24,
				"manganese" : 25, "iron" : 26, "cobalt" : 27, "nickel" : 28, "copper" : 29, "zinc" : 30, "gallium" : 31, "germanium" : 32, "arsenic" : 33,
				"selenium" : 34, "bromine" : 35, "krypton" : 36, "rubidium" : 37, "strontium" : 38, "yttrium" : 39, "zirconium" : 40, "niobium" : 41,
				"molybdenum" : 42, "technetium" : 43, "ruthenium" : 44, "rhodium" : 45, "palladium" : 46, "silver" : 47, "cadmium" : 48, "indium" : 49,
				"tin" : 50, "antimony" : 51, "tellurium" : 52, "iodine" : 53, "xenon" : 54, "cesium" : 55, "barium" : 56, "lanthanum" : 57, "cerium" : 58,
				"praseodymium" : 59, "neodymium" : 60, "promethium" : 61, "samarium" : 62, "europium" : 63, "gadolinium" : 64, "terbium" : 65, "dysprosium" : 66,
				"holmium" : 67, "erbium" : 68, "thulium" : 69, "ytterbium" : 70, "lutetium" : 71, "hafnium" : 72, "tantalum" : 73, "tungsten" : 74, "rhenium" : 75,
				"osmium" : 76, "iridium" : 77, "platinum" : 78, "gold" : 79, "mercury" : 80, "thallium" : 81, "lead" : 82, "bismuth" : 83, "polonium" : 84,
				"astatine" : 85, "radon" : 86, "francium" : 87, "radium" : 88, "actinium" : 89, "thorium" : 90, "protactinium" : 91, "uranium" : 92, "neptunium" : 93,
				"plutonium" : 94, "americium" : 95, "curium" : 96, "berkelium" : 97, "californium" : 98, "einsteinium" : 99, "fermium" : 100, "mendelevium" : 101,
				"nobelium" : 102, "lawrencium" : 103, "rutherfordium" : 104, "dubnium" : 105, "seaborgium" : 106, "bohrium" : 107, "hassium" : 108, "meitnerium" : 109
			}
			
			if (isNaN(parseInt(element_no)) == true) {
				element_no = element_names[element_no.toLowerCase()];
			}
			
			
			if (isNaN(parseInt(element_no)) == false) {
				if (element_no >= 1 && element_no <= 109) {
					// read dataset
					fs_read.readFile(dataset_elements, "utf8", function(err, data) {
						if (err) {
							return console_log("Failed to read elements database!", error=true);
						}
						//get element
						headers = [	'Number', 'Atomic Weight', 'Name', 'Symbol', 'Melting Point (°C)', 'Boiling Point (°F)', 'Density* (g/cm3)', 
						'Earth crust (%)*', 'Discovery (Year)', 'Group', 'Electron configuration', 'Ionization energy (eV)', 'Description'];
						data_array = data.split("\n")[element_no-1].split("|");
						info = "";
						
						// message
						embed_element = new Discord.MessageEmbed();
						embed_element.setColor(embed_colour_info);
					
						for (i=0;i<headers.length;i++) {
							try {
								if (headers[i] == "Description") {
									embed_element.setDescription(data_array[i]);
								} else {
									embed_element.addField(headers[i], data_array[i], true);
								}
								
								if (headers[i] == "Name") {
									embed_element.setTitle(data_array[i]);
									embed_element.setURL("https://en.wikipedia.org/wiki/" + data_array[i]);
								}
								
							} catch {
								//info = info + (headers[i] + ":\t" + data_array[i]) + "\n";
							}
						}
					
						// send message to user
						embed_element.setTimestamp();
						embed_element.setFooter(element_no);
						embed_element.setImage(webserver_elms_dataset + "/" + element_no + ".png");
						msg_channel_send(msg, embed_element);
					
					})
				} else {
					embed_error(msg, "Not a valid element number! make sure the number is within range 1 to 109!");
				}
			} else {
				embed_error(msg, "Invalid Format! the correct format is `"+prefix[msg.guild.id]+"element {element No.}` or `"+prefix[msg.guild.id]+"element {name}`, " +
				"For example `"+prefix[msg.guild.id]+"element 94` will display information on Plutonium or `"+prefix[msg.guild.id]+"element gold` will display information on Gold!");
			}
		} else if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"element") {
			embed_error(msg, "Invalid Format! the correct format is `"+prefix[msg.guild.id]+"element {element No.}` or `"+prefix[msg.guild.id]+"element {name}`, " +
			"For example `"+prefix[msg.guild.id]+"element 94` will display information on Plutonium or `"+prefix[msg.guild.id]+"element gold` will display information on Gold!");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"periodictable" || msg.content == prefix[msg.guild.id]+"table") {
			reply_text = "You can type `"+prefix[msg.guild.id]+"element {elm no.}` to get more speific information about an element!";

			// Send Message
			embed_periodic_table = new Discord.MessageEmbed();
			embed_periodic_table.setColor(embed_colour_info);
			embed_periodic_table.setTitle("Periodic Table");
			embed_periodic_table.setDescription(reply_text);
			embed_periodic_table.setImage(periodic_table);
			embed_periodic_table.setTimestamp();
			msg_channel_send(msg, embed_periodic_table);
			
		}
	}
})

// Pokemon
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"pokemon ") {
			poke_index = msg.content.slice(9, msg.content.length);
			
			// check if poke index is a name
			if (isNaN(parseInt(poke_index)) == true) {
				fs_read.readFile(dataset_pokemon, "utf8", function(err, data) {
					if (err) {
						return console_log("Failed to read pokemon database!", error=true);
					}
					
					//get data
					raw_data_names = data.split("\n");
					raw_data_names_array = [];
					for (i=0;i<raw_data_names.length;i++) {
						try {
							raw_data_names_array.push(raw_data_names[i].split("Name:")[1].split("|")[0].split(" ").join("").toLowerCase());
						} catch {
							console_log("Failed to add pokemon '" + raw_data_names[i] + "' to list", error=true);
						}
					}
				
					// check if poke index is in the file
					if (raw_data_names_array.indexOf(poke_index.toLowerCase().split(" ").join("")) > -1) {
						poke_index = raw_data_names_array.indexOf(poke_index.toLowerCase().split(" ").join("")) +1;
					}
				})
			}
			
			// display pokemon card
			setTimeout(function() {
				if (isNaN(parseInt(poke_index)) == false) {
					if (poke_index >= 1 && poke_index <= 893) {
						if (String(poke_index).lastIndexOf(".") == -1 && String(poke_index).indexOf("-") == -1) {
							// read file
							fs_read.readFile(dataset_pokemon, "utf8", function(err, data) {
								if (err) {
									return console_log("Failed to read pokemon database!", error=true);
								}
					
								// embed
								embed_pokemon = new Discord.MessageEmbed();
								embed_pokemon.setColor(embed_colour_info);
								
								try {
									// format data
									pokemons = [];
									basic_stats = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"];
									pokemon_raw_data = data.split("\n")[poke_index-1].split("|");
									poke_description = "";
									poke_basic_stats = "";
					
									for (i=0;i<pokemon_raw_data.length;i++) {
										poke_current_line = pokemon_raw_data[i].split("\r").join("").split("\n").join("");
										poke_header = poke_current_line.split(":")[0];
										poke_value = poke_current_line.split(":")[1];
						
										if (poke_header == "Name") {
											embed_pokemon.setTitle(poke_value + "\u200B");
											embed_pokemon.setURL("https://www.pokemon.com/uk/pokedex/" + poke_value);
										} else if (poke_header == "Description_X") {
											poke_description = poke_description + "X: " + poke_value + "\n\u200B";
										} else if (poke_header == "Description_Y") {
											poke_description = poke_description + "Y: " + poke_value + "\n\u200B";
										} else if (poke_header == "Number") {
											embed_pokemon.setFooter(poke_value + "\u200B");
											embed_pokemon.setTimestamp();
										} else if (basic_stats.indexOf(poke_header) > -1) {
											// padding var
											current_padding =  "🟦".repeat(poke_value);
											footer_poke_paddings = [8, 6, 5, 1, 0, 6];
											footer_poke_spaces = [2, 1, 1, 1, 1, 2];
							
											// padding
											invisible_chars = "\u2800".repeat(footer_poke_paddings[basic_stats.indexOf(poke_header)]);
											space_chars = " ".repeat(footer_poke_spaces[basic_stats.indexOf(poke_header)]);
											poke_header_padding =  invisible_chars + space_chars + poke_header;
							
											poke_basic_stats = poke_basic_stats + poke_header_padding + ": " + current_padding + "\n";
										} else {
											if (poke_header != "") {
												embed_pokemon.addField(poke_header + "\u200B", poke_value + "\u200B", true);
											}
										}
									}
					
									// send message
									embed_pokemon.setDescription(poke_description + "\u200B");
									embed_pokemon.setAuthor("Pokemon Card");
									embed_pokemon.setFooter(""+poke_basic_stats + "\n" + poke_index);
									embed_pokemon.setImage(webserver_pokemon_dataset + "/" + poke_index + ".png");
									msg_channel_send(msg, embed_pokemon);
								} catch {
									embed_error(msg, "Failed to get pokemon info for unknown reason!");
								}
							})
						} else {
							embed_error(msg, "Decimal indexs are not allowd, please make sure you enter a whole number!");
						}
					} else {
						embed_error(msg, "Pokemon index out of range, please make sure your number is between 1 and 893!");
					}
				} else {
					embed_error(msg, "The specified pokemon could not be found, you can specify a pokemon by index, " +
					"for example `"+prefix[msg.guild.id]+"pokemon 39` will show info for Jigglypuff , or by name e.g. `"+prefix[msg.guild.id]+"pokemon Pikachu` for info on Pikachu!")
				}
			}, read_input_file_pokemon_dataset);
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"pokemon") {
			embed_error(msg, "Please Specify a pokemon, you can specify a pokemon by index, " +
			"for example `"+prefix[msg.guild.id]+"pokemon 39` will show info for Jigglypuff , or by name e.g. `"+prefix[msg.guild.id]+"pokemon Pikachu` for info on Pikachu!")
		}
	}
})

// Medicine
var medicines = {};

bot.on("ready", msg => {
	// read file
	fs_read.readFile(dataset_medicine, "utf8", function(err, data) {
		if (err) {
			return console_log("Failed to read medicines database!", error=true);
		}
		
		lines = data.split(";");
		for (i=0;i<lines.length;i++) {
			current_line = lines[i].split("\t");
			if (current_line.length == 4) {
				name = current_line[0].replace(/[^\x00-\x7F]/g, "").replace(/\r/g,"").replace(/\n/g, "");
				description = current_line[1];
				common_side_effects = current_line[2];
				
				// add to dict
				medicines[name.toLowerCase()] = [name, description, common_side_effects];
			}
		}
		console_log("Medicines dataset read!");
	})
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"medicine ") {
			med_name = medicines[msg.content.slice(10, msg.content.length).toLowerCase()];
			
			if (med_name != undefined) {
				// embed
				embed_medicine = new Discord.MessageEmbed();
				embed_medicine.setColor(embed_color_chat);
				embed_medicine.setImage(webserver_medicines_dataset + "/" + med_name[0] + ".png");
				embed_medicine.setTitle(med_name[0]);
				embed_medicine.setDescription(med_name[1]);
				embed_medicine.addFields(
					{name: "\u200B\nCommon Side Effects", value: med_name[2]},
				)
				embed_medicine.setTimestamp();
				msg_channel_send(msg, embed_medicine);
				
			} else {
				embed_error(msg, "The specified medicine could not be found in the database!");
			}
			
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"medicine") {
			// keys
			medicines_AZ = {};
			keyset = Object.keys(medicines);
			for (i=0;i<keyset.length;i++) {
				current_key = keyset[i].replace(/[^\x00-\x7F]/g, "").replace(/\r/g,"");
				if (medicines_AZ[current_key[0]] == undefined) {
					medicines_AZ[current_key[0]] = [];
				}
				medicines_AZ[current_key[0]].push(current_key);
			}
			
			// embed
			embed_medicine_help = new Discord.MessageEmbed();
			embed_medicine_help.setColor(embed_colour_info);
			embed_medicine_help.setTitle("Medicine Help");
			embed_medicine_help.setDescription("To use the medicine command type `"+prefix[msg.guild.id]+"medicine {name}` for example `"+prefix[msg.guild.id]+"medicine ibuprofen` "+
			"will show information on the Ibuprofen medicine, such as a description of what the medicine does and it's common side effects. "+
			"Below is a list of all medicine names currently in the database:\n\u200B");
			
			medicines_AZ_keyset = Object.keys(medicines_AZ);
			for (i=0;i<medicines_AZ_keyset.length;i++) {
				if (medicines_AZ_keyset[i] != undefined) {
					if (medicines_AZ_keyset[i].indexOf("undefined") == -1) {
						current_value = medicines_AZ[medicines_AZ_keyset[i]].join(", ") + "\u200B";
						embed_medicine_help.addField(medicines_AZ_keyset[i]+ "\u200B", current_value, true);
					}
				}
			}
			embed_medicine_help.addField("\u200B", "\u200B", true);
			
			msg_channel_send(msg, embed_medicine_help);
			
		}
	}
})

// --- Play Music ---
// commands to add
// - soundcloud {song name}		- search soundcloud for a song
// - search	{song name}			- searches YouTube for a song and displays list of search results
// - lyrics	{song name}			- get lyrics of current playing song
// - clean						- deleted the bots message and commands in channel
// - leavecleanup				- removes absent user's songs from the queue

var YouTube_Data_API;
var song_queus = {};
var song_player = {};
var channel_guild = {};
var stream = {};
var forced_song = {};
var loop = {};
var loopq = {};
var backup_queue = {};
var dj = {};
var steamOptions = {};
var freeplay = {};

bot.on("ready", msg => {
	fs_read.readFile(youtube_data_filename, "utf-8", function(err, data) {
		if (err) {
			return console_log("Failed to read youtube data API key file!", error=true);
		}
		YouTube_Data_API = data;
		console_log("Read YouTube Data API Key!");
	})
})

function check_youtube_url(url) {
	try {
		url = url.replace("https", "http");
		if (url.slice(0, 12) == "http://youtu" || url.slice(0, 18) == "http://www.youtube") {
			if (url.indexOf(".") > -1 && url.indexOf(" ") == -1) {
				return true;
			}
		}
		return false;
	} catch (err) {
		console_log("Error thrown in check_youtube_url function! " + err, error=true);
	}
}

async function freeplay_get_next(msg, channel, forceplay_url, seek, volume, connection, current_song) {
	try {
		// check for undefined
		if (msg == undefined || msg == null || msg.guild == undefined || msg.guild == null) {
			console_log("Error throw in song manager, msg is null or undefined!", error=true);
		}
	
		// get html
		await request(current_song[0], {
			headers: {
				"User-Agent": user_agent
			},
			body: "",
			method: "GET"
		}, (err, res, html) => {
			if (res.statusCode == 200) {
				// process HTML
				links = html.split('watch?v=');
				urls = [];
				for (i=0;i<links.length;i++) {
					current_url = links[i].split('"')[0].split('\\')[0].split('&amp')[0];
					if (current_url.length == 11) {
						if (current_song[0].indexOf(current_url) == -1) {
							if (urls.indexOf(current_url) == -1) {
								urls.push(current_url);
							}
						}
					}
				}
			
				// pick a random song
				rand_song = urls[parseInt(Math.random() * 100) % urls.length];
				upnext = "https://youtube.com/watch?v=" + rand_song;
			
				song_url = encodeURI(upnext);
				song_id = song_url.replace("watch?v=","").split("/").slice(-1).slice(0, 20);
			
				// check for empty queue
				if (song_queus[msg.guild.id] == undefined) {
					song_queus[msg.guild.id] = [];
				}
			
				// add song to queue
				song_queus[msg.guild.id].push([song_url, bot_ID]);
				console_log("Freeplay added song '" + song_id + "' to queue on server " + msg.guild.name);
			
				// play song
				song_manager(msg, channel, forceplay_url, seek, volume, connection);
			
			
			} else {
				console_log("Freeplay failed to get song, youtube returned status code "+res.statusCode+"!", error=true);
			}
		})
	} catch (err) {
		console_log("Error throw in freeplay_get_next function! " + err, error=true);
	}
}

function song_manager(msg, channel, forceplay_url, seek, volume, connection) {
	try {
		// check for undefined
		if (msg == undefined || msg == null || msg.guild == undefined || msg.guild == null) {
			console_log("Error throw in song manager, msg is null or undefined!", error=true);
		}
	
		// - forceplay - forces the song to play (ignores everything else in queue)
		if (forceplay == true) {
			console_log("Forceplayed song for server " + msg.guild.id);
			
			// check if the song is an mp3 file
			if (song_queus[msg.guild.id][2] == true) {
				dj[msg.guild.id] = connection.play(stream[msg.guild.id], steamOptions[msg.guild.id]);
			} else {
				// play the song
				stream[msg.guild.id] = ytdl(forceplay_url, {filter:"audioonly", quality:"highestaudio"});
				dj[msg.guild.id] = connection.play(stream[msg.guild.id], steamOptions[msg.guild.id]);
			}
		} else {
			if (seek == 0) {
				console_log("Queue started for server " + msg.guild.id);
			}
			
			// check if the song is an mp3 file
			if (song_queus[msg.guild.id][2] == true) {
				dj[msg.guild.id] = connection.play(stream[msg.guild.id], steamOptions[msg.guild.id]);
			} else {
				// play the song
				stream[msg.guild.id] = ytdl(song_queus[msg.guild.id][0][0], {filter:"audioonly", quality:"highestaudio"});
				dj[msg.guild.id] = connection.play(stream[msg.guild.id], steamOptions[msg.guild.id]);
			}
		}
			
		// leave channel if the users leave
		dj[msg.guild.id].on("end", end => {
			channel.leave();
		})
				
		// check if queue is empty
		if (song_queus[msg.guild.id] == undefined) {
			return false;
		}
	
		// go to next song in queue
		dj[msg.guild.id].on("finish", song_finished => {
			if (loop[msg.guild.id] == true) {
				// loop song
				song_manager(msg, channel, forceplay_url, seek, volume, connection);
			} else {
				// remove song from queue
				last_song = song_queus[msg.guild.id][0];
				song_queus[msg.guild.id] = song_queus[msg.guild.id].slice(1, song_queus[msg.guild.id].length);
				// play next song
				if (song_queus[msg.guild.id][0] == undefined) {
					// check for loop queue
					if (loopq[msg.guild.id] == true) {
						song_queus[msg.guild.id] = backup_queue[msg.guild.id];
						song_manager(msg, channel, forceplay_url, seek, volume, connection);
						console_log("The queue will be looped for " + msg.guild.id);
					} else {
						// queue ended
						if (freeplay[msg.guild.id] == true) {
							// freeplay is on, choose another song to add to queue
							async function await_get_song() {
								song_queus[msg.guild.id] = song_queus[msg.guild.id].slice(1, song_queus[msg.guild.id].length);
								await freeplay_get_next(msg, channel, forceplay_url, seek, volume, connection, last_song);
								console_log("Queue ended on server " + msg.guild.name + " freeplay playing random song!");
							
							} await_get_song();
						} else {
							// queue ended, leave voice channel
							channel.leave();
							song_player[msg.guild.id] = false;
							song_queus[msg.guild.id] = [];
							console_log("queue ended for " + channel);
						}
					}
				} else {
					song_manager(msg, channel, forceplay_url, seek, volume, connection);
				}
			}
		})
	} catch (err) {
		console_log("Error thrown in song_manager function! " + err, error=true);
	}
}

function play_song(msg, channel, forceplay=false, forceplay_url="", seek=0, volume=1) {
	try {
		steamOptions[msg.guild.id] = {seek: seek, volume: volume};
		if (channel != null && channel != undefined) {
			// when the user joins the channel
			try {
				channel.join().then(connection => {
					try {
						// play song
						song_manager(msg, channel, forceplay_url, seek, volume, connection);
				
					} catch (err) {
						console_log("an error was throw in the play song song manager function!", error=true);
					}
				}).catch(err => {
					console_log("JaredBot failed to join voice channel an error was thrown in the join vc function!", error=true);
				})
			} catch {
				console_log("Failed to join channel!", error=true);
			}
		}
	} catch (err) {
		console_log("Error thrown in play_song function! " + err, error=true);
	}
}

function song_info(msg, response, yt_url) {
	try {
		// song info
		song_name = response.videos[0].title;
		song_description = response.videos[0].description.slice(0, 2048);
		song_thumbnail = response.videos[0].thumbnail;
	
		// get requested by
		if (forced_song[msg.guild.id] == undefined) {
			request_by = bot.users.cache.get(song_queus[msg.guild.id][0][1]).tag;
		} else {
			request_by = forced_song[msg.guild.id][1];
		} if (request_by == null) {
			request_by = "Unknown";
		}
	
		// embed
		embed_music_info = new Discord.MessageEmbed();
		embed_music_info.setColor(embed_color_chat);
		embed_music_info.setTitle(song_name);
		embed_music_info.setURL(yt_url);
		embed_music_info.setDescription(song_description);
		embed_music_info.setAuthor("Now playing 🎵", cat_profile_pic);
		embed_music_info.setThumbnail(song_thumbnail);
		embed_music_info.setFooter("Requested by: " + request_by + "\u200B");
		msg_channel_send(msg, embed_music_info);
		
	} catch (err) {
		console_log("Error thrown in song_info function! " + err, error=true);
	}
}

function disconnect(msg, customMessage="") {
	try {
		// get bots voice channel
		channel = channel_guild[msg.guild.id];
		if (channel == undefined) {
			embed_error(msg, "Your not connected to any voice channel!");
			return false;
		}
			
		// check if user is in bots voice channel
		user_channel = msg.member.voice.channel;
		if (user_channel == channel) {
			channel.leave();
			song_player[msg.guild.id] = false;
			song_queus[msg.guild.id] = [];
			channel_guild[msg.guild.id] = undefined;
			loop[msg.guild.id] = false;
			loopq[msg.guild.id] = false;
			if (customMessage.length == 0) {
				embed_info_reply(msg, "Successfully disconnected from voice channel!");
			} else {
				embed_info_reply(msg, customMessage)
			}
		} else {
			embed_error(msg, "Your not connected to same voice channel as the bot!");
		}
	} catch (err) {
		console_log("Error thrown in disconnect function! " + err, error=true);
	}
}

function help_music(msg) {
	try {
		embed_music = new Discord.MessageEmbed();
		embed_music.setColor(embed_color_chat);
		embed_music.setTitle("Help Music");
		embed_music.setAuthor("JaredBot | Command list", lion_profile_pic);
		embed_music.setThumbnail(lion_profile_pic);
		embed_music.addFields(
			{name: "Play", value:"`"+prefix[msg.guild.id]+"help play`\n\u200B", inline: true},
			{name: "Force Play", value:"`"+prefix[msg.guild.id]+"help foreplace`\n\u200B", inline: true},
			{name: "Skip", value:"`"+prefix[msg.guild.id]+"help skip`\n\u200B", inline: true},
			{name: "Skip To", value: "`"+prefix[msg.guild.id]+"help skipto`\n\u200B", inline: true},
			{name: "Disconnect", value:"`"+prefix[msg.guild.id]+"help disconnect`\n\u200B", inline: true},
			{name: "Now Playing", value:"`"+prefix[msg.guild.id]+"help np`\n\u200B", inline: true},
			{name: "Test Audio", value:"`"+prefix[msg.guild.id]+"help ping`\n`"+prefix[msg.guild.id]+"help testaudio`\n\u200B", inline: true},
			{name: "Queue", value:"`"+prefix[msg.guild.id]+"help queue`\n\u200B", inline: true},
			{name: "Reverse", value:"`"+prefix[msg.guild.id]+"help playtop`\n\u200B", inline: true},
			{name: "Remove", value:"`"+prefix[msg.guild.id]+"help remove`\n\u200B", inline: true},
			{name: "Move", value:"`"+prefix[msg.guild.id]+"help move`\n\u200B", inline: true},
			{name: "Loop", value: "`"+prefix[msg.guild.id]+"help loop`\n`"+prefix[msg.guild.id]+"help loopq`\n\u200B", inline: true},
			{name: "Clear Queue", value: "`"+prefix[msg.guild.id]+"help clearq`\n\u200B", inline: true},
			{name: "Del Duplicate", value: "`"+prefix[msg.guild.id]+"help removedupes`\n\u200B", inline: true},
			{name: "Shuffle", value: "`"+prefix[msg.guild.id]+"help shuffle`\n\u200B", inline: true},
			{name: "Replay", value: "`"+prefix[msg.guild.id]+"help replay`\n\u200B", inline: true},
			{name: "Join", value: "`"+prefix[msg.guild.id]+"help join`\n\u200B", inline: true},
			{name: "Pause Resume", value: "`"+prefix[msg.guild.id]+"help pause`\n`"+prefix[msg.guild.id]+"help resume`\n\u200B", inline: true},
			{name: "Song Info", value: "`"+prefix[msg.guild.id]+"help songinfo`\n\u200B", inline: true},
			{name: "Seek", value: "`"+prefix[msg.guild.id]+"help seek`\n\u200B", inline: true},
			{name: "Forward", value: "`"+prefix[msg.guild.id]+"help forward`\n\u200B", inline: true},
			{name: "Rewind", value: "`"+prefix[msg.guild.id]+"help rewind`\n\u200B", inline: true},
			{name: "Volume", value: "`"+prefix[msg.guild.id]+"help volume`\n\u200B", inline: true},
			{name: "Free Play", value: "`"+prefix[msg.guild.id]+"help freeplay`\n\u200B", inline: true}
		)
		embed_music.setTimestamp();
		msg_channel_send(msg, embed_music);
	} catch (err) {
		console_log("Error thrown in help_music function! " + err, error=true);
	}
}

function help_clear(msg) {
	try {
		embed_clear_help = new Discord.MessageEmbed();
		embed_clear_help.setColor(embed_colour_info);
		embed_clear_help.setTitle("Help Clear");
		embed_clear_help.addFields(
		{name: prefix[msg.guild.id]+"clear {no messages}", value: "`clear` is a mod/admin command that delete messages, it is the same as `purge`, "+
		"the syntax for the command is `"+prefix[msg.guild.id]+"clear {no messages}` for example `"+prefix[msg.guild.id]+"clear 10` will delete 10 messages.\n\u200B"},
		{name: prefix[msg.guild.id]+"clearq", value: "If you are listenning to music and would like to clear the song queue, then use the music "+
		"command `"+prefix[msg.guild.id]+"clearq`, clearq will clear the song queue removing any songs in the queue.\n\u200B"},
		{name: prefix[msg.guild.id]+"clearwelcome", value: "the `"+prefix[msg.guild.id]+"clearwelcome` and `"+prefix[msg.guild.id]+"clearleave` " +
		"are used to clear the welcome and leave channels."}
		)
		embed_clear_help.setTimestamp();
		msg_channel_send(msg, embed_clear_help);
	} catch (err) {
		console_log("Error thrown in help_clear function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"music help" || msg.content == prefix[msg.guild.id]+"aliases") {
			// embed
			help_music(msg);
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		// - play {song name / URL} (plays song with given name or url)
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"play" || msg.content.slice(0, 11) == prefix[msg.guild.id]+"forceplay " || 
			msg.content == prefix[msg.guild.id]+"skip" || msg.content.slice(0, 7) == prefix[msg.guild.id]+"skipto" || msg.content.slice(0, 10) == prefix[msg.guild.id]+"playskip "
			|| msg.content.slice(0, 6) == prefix[msg.guild.id]+"seek " || msg.content.slice(0, 6) == prefix[msg.guild.id]+"seek " || msg.content.slice(0, 9) == prefix[msg.guild.id]+"forward "
			|| msg.content.slice(0, 8) == prefix[msg.guild.id]+"rewind " || msg.content.slice(0, 8) == prefix[msg.guild.id]+"volume " || msg.content == prefix[msg.guild.id]+"fs"
			|| msg.content.slice(0, 3) == prefix[msg.guild.id]+"p ") {
			command = msg.content.slice(msg.content.split(" ")[0].length+1, msg.content.length);
			
			// check for forceplay
			if (msg.guild != null && msg.content.slice(0, 11) == prefix[msg.guild.id]+"forceplay " || msg.content.slice(0, 10) == prefix[msg.guild.id]+"playskip ") {
				forceplay = true;
			} else {
				forceplay = false;
			}
			
			// freeplay default
			if (song_queus[msg.guild.id] == undefined) {
				freeplay[msg.guild.id] = true;
			}
			
			// get users voice channel
			channel = msg.member.voice.channel;
			if (channel == undefined) {
				embed_error(msg, "Your not connected to any voice channel!");
				return false;
			} else {
				// check if the bot is already in voice channel
				if (channel_guild[msg.guild.id] != undefined) {
					user_channel = msg.member.voice.channel;
					bot_channel = msg.guild.voice;
					
					// check if the bot is in a voice channel
					if (bot_channel == null) {
						channel_guild[msg.guild.id] = channel;
						
					// check if user is in same channel as bot
					} else {
						if (bot_channel.connection != null) {
							if (user_channel == bot_channel.connection.channel) {
								channel_guild[msg.guild.id] = channel;
								
								// seek, forward, rewind
								if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"seek " || msg.content.slice(0, 9) == prefix[msg.guild.id]+"forward " || 
									msg.content.slice(0, 8) == prefix[msg.guild.id]+"rewind " || msg.content.slice(0, 8) == prefix[msg.guild.id]+"volume ") {
									
									// check if song is actully playing
									if (dj[msg.guild.id] == undefined) {
										embed_error(msg, "Please make sure a song is actully playing!");
										return false;
									}
									
									// get length of the song
									song_length = dj[msg.guild.id]._writableState.length;
									
									// check if volume is being changed
									if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"volume ") {
										// max volume
										song_length = 101;
									}
									
									// split command
									seek = msg.content.split(" ")[1];
									
									// check if command is in format MM:SS
									if (seek.split(":").length == 2) {
										seek_amount = String(parseInt((seek.split(":")[0]*60)) + parseInt(seek.split(":")[1]));
									} else {
										seek_amount = seek;
									}
									
									// check if seek amount is an int
									command_name = msg.content.split(" ")[0].slice(1, msg.content.length);
									if (isInt(msg, seek_amount, 0, song_length, command_name, ErrorMessageEnd="") == true) {
										//play song
										
										// - seek (seeks to a certain point in the curent track)
										if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"seek ") {
											play_song(msg, channel, forceplay=false, forceplay_url="", seek=parseInt(seek_amount), volume=1);
										
										// - forward {sec} (fast forward by a certain number of seconds)
										} else if (msg.guild != null && msg.content.slice(0, 9) == prefix[msg.guild.id]+"forward ") {
											forward_amount = parseInt(dj[msg.guild.id].streamTime/1000) + parseInt(seek_amount) + steamOptions[msg.guild.id].seek;
											if (forward_amount < dj[msg.guild.id]._writableState.length) {
												play_song(msg, channel, forceplay=false, forceplay_url="", seek=forward_amount, volume=1);
											} else {
												embed_error(msg, "You can't fast forward this far!");
												return false;
											}
										
										// - rewind {sec} (rewinds by specified amount in track)
										} else if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"rewind ") {
											backwards_amount = parseInt(dj[msg.guild.id].streamTime/1000) - parseInt(seek_amount) + steamOptions[msg.guild.id].seek;
											if (backwards_amount > 0) {
												play_song(msg, channel, forceplay=false, forceplay_url="", seek=backwards_amount, volume=1);
											} else {
												embed_error(msg, "You can't rewind this far back!");
												return false;
											}
											
										// - volume {no} (change the volume of the music)
										} else if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"volume ") {
											current_timestamp = parseInt(dj[msg.guild.id].streamTime/1000);
											volume = parseInt(msg.content.slice(8, msg.content.length))/100;
											play_song(msg, channel, forceplay=false, forceplay_url="", seek=current_timestamp, volume=volume);
											embed_info_reply(msg, "Volume changed to " + volume*100 + "%!");
											return true;
										}
										
										seek_mins = ("00"+String(seek_amount / 60).split(".")[0]).slice(-2);
										seek_secs = ("00"+String(Math.round(("0." + String(seek_amount / 60).split(".")[1])*60)).replace("NaN", "0")).slice(-2);
										embed_chat_reply(msg, "Seeked to " + seek_mins+":"+seek_secs + " in the track!");
									} else {
										return false;
									}
									return true;
								}
							} else {
								embed_error(msg, "Your not in the same voice channel as the bot!");
								return false;
							}
						} else {
							console_log("The bot is not in a voice channel!");
						}
					}
				} else {
					channel_guild[msg.guild.id] = channel;
				}
			}
			
			// seek
			if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"seek " || msg.content.slice(0, 9) == prefix[msg.guild.id]+"forward " || 
				msg.content.slice(0, 8) == prefix[msg.guild.id]+"rewind " || msg.content.slice(0, 8) == prefix[msg.guild.id]+"volume ") {
				command_name = msg.content.split(" ")[0].slice(1, msg.content.length);
				embed_error(msg, "Failed to "+command_name+", make sure that the bot is connected to a voice channel and playing a song!");
				return false;
			}
			
			// skip (skips the current playing song)
			if (msg.guild != null && msg.content == prefix[msg.guild.id]+"skip" || msg.content.slice(0, 7) == prefix[msg.guild.id]+"skipto" || msg.content == prefix[msg.guild.id]+"fs") {
				// check if queue is undefined
				if (song_queus[msg.guild.id] == undefined) {
					embed_error(msg, "Unable to skip song, there are no songs in the queue");
					return;
				}
				
				if (msg.guild != null && msg.content == prefix[msg.guild.id]+"skip" || msg.content == prefix[msg.guild.id]+"fs") {
					// remove song from queue
					song_queus[msg.guild.id] = song_queus[msg.guild.id].slice(1, song_queus[msg.guild.id].length);
				
				// skipto {index} (skip to certain point in queue)
				} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"skipto") {
					embed_error(msg, "Unable to skip to song, invalid input, the syntax for the command is `"+prefix[msg.guild.id]+"skipto {song index}`!")
					return false;
				} else if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"skipto ") {
					// check if queue contains less than 2 songs
					queue_length = Object.keys(song_queus[msg.guild.id]).length;
					if (queue_length < 2) {
						embed_error(msg, "There needs to be atleast 2 songs in the queue in order to skip to!");
						return false;
					}
					
					// check if user input is valid index
					skipto_index = msg.content.slice(8, msg.content.length);
					if (isInt(msg, skipto_index, 1, queue_length+1, "index", ErrorMessageEnd="") == true) {
						// remove song from queue
						song_queus[msg.guild.id] = song_queus[msg.guild.id].slice(parseInt(skipto_index)-1, song_queus[msg.guild.id].length);
						
					} else {
						return false;
					}
				}
				
				// check if queue is empty
				if (song_queus[msg.guild.id].length == 0) {
					disconnect(msg, customMessage="End of queue reached, to play another song type `"+prefix[msg.guild.id]+"play {song name / URL}`!");
					return;
					
				} else {
					// play next song
					play_song(msg, channel);
					embed_chat_reply(msg, "Song skipped!");
				}
				return;
			}
			
			// find song by URL
			if (msg.content.slice(0, 6) == prefix[msg.guild.id]+"play " || msg.content.slice(0, 3) == prefix[msg.guild.id]+"p ") {
				part_url = command.replace("https://","http://");
				if (part_url.slice(0, 12) == "http://youtu" || part_url.slice(0, 18) == "http://www.youtube") {
					if (part_url.indexOf(".") > -1 && part_url.indexOf(" ") == -1) {
						// YouTube URL
						song_url = encodeURI(command);
						song_id = song_url.replace("watch?v=","").split("/").slice(-1).slice(0, 20);
						if (forceplay == false) {
							if (song_queus[msg.guild.id] == undefined) {
								song_queus[msg.guild.id] = [[song_url, msg.author.id]];
							} else {
								song_queus[msg.guild.id].push([song_url, msg.author.id]);
							}
							forced_song[msg.guild.id] = undefined;
							console_log("Added song '" + song_id + "' to queue on server " + msg.guild.id + "!");
						} else if (forceplay == true) {
							forced_song[msg.guild.id] = [song_url, msg.author.id];
							console_log("Force playing song '" + song_id + "' on server " + msg.guild.id + "!");
						}
					} else {
						embed_error(msg, "Not a valid YouTube URL!");
						return false;
					}
				
					// play the song
					if (song_player[msg.guild.id] != true) {
						song_player[msg.guild.id] = true;
						play_song(msg, channel, forceplay=forceplay, forceplay_url=song_url);
					}
				// find song by name
				} else {
					// GET info on song
					youtube.search(command).then(response => {
						if (response != []) {
							// check if song exists
							if (response.videos[0] == undefined) {
								embed_error(msg, "Unable to find the song! Make sure you spelt the song name correctly, "+
									"also try make your search more specific, for example by entering in the song name and artist.");
								return false;
							} else {
								song_id = response.videos[0].id;
								if (song_id == undefined) {
									embed_error(msg, "Unable to find the song! Make sure you spelt the song name correctly, "+
									"also try make your search more specific, for example by entering in the song name and artist.");
									return false;
								}
							}
						
							song_url = "https://youtube.com/watch?v=" + song_id;
						
							// add song to queue
							if (forceplay == false) {
								if (song_queus[msg.guild.id] == undefined) {
									song_queus[msg.guild.id] = [[song_url, msg.author.id]];
								} else {
									song_queus[msg.guild.id].push([song_url, msg.author.id]);
								}
								console_log("Added song '" + song_id + "' to queue on server " + msg.guild.id + "!");
							} else if (forceplay == true) {
								forced_song[msg.guild.id] = [song_url, msg.author.id];
								console_log("Force playing song '" + song_id + "' on server " + msg.guild.id + "!");
							}
						
							// play the song
							if (song_player[msg.guild.id] != true || forceplay == true) {
								song_player[msg.guild.id] = true;
								play_song(msg, channel, forceplay=forceplay, forceplay_url=song_url);
							}
						
							// embed
							song_info(msg, response, song_url);
						}
					}).catch(err => {
						console_log("Error thrown in find song by name youtube search! " + err, error=true);
					})
				}
			
			// play audio file
			} else if (msg.content == prefix[msg.guild.id]+"play" || msg.content.slice(0, 10) == prefix[msg.guild.id]+"play http") {
				url = undefined;
				if (msg.content.split(" ").length == 2) {
					if (msg.content.split(" ")[1].replace("https","http").slice(0, 38) == "http://cdn.discordapp.com/attachments/" ||
						msg.content.split(" ")[1].replace("https","http").slice(0, 30) == "http://jaredbot.uk/videos/src/") {
						url = msg.content.split(" ")[1];
					}
				} else {
					msg.attachments.forEach(function(attachment) {
						url = attachment.url;
					})
				}
				
				// check file extension
				extension = url.split('.').slice(-1);
				if (extension != "mp3" || extension != "wav") {
					embed_error(msg, "File ype not supported!");
					url = undefined;
				}
				
				// check for undefined URL
				if (url != undefined) {
					// add song to queue
					if (forceplay == false) {
						if (song_queus[msg.guild.id] == undefined) {
							song_queus[msg.guild.id] = [[url, msg.author.id, true]];
						} else {
							song_queus[msg.guild.id].push([url, msg.author.id, true]);
						}
						forced_song[msg.guild.id] = undefined;
						console_log("Added song '" + url + "' to queue on server " + msg.guild.id + "!");
					} else if (forceplay == true) {
						forced_song[msg.guild.id] = [url, msg.author.id];
						console_log("Force playing song '" + url + "' on server " + msg.guild.id + "!");
					}
					
					// play the song
					if (song_player[msg.guild.id] != true || forceplay == true) {
						song_player[msg.guild.id] = true;
						play_song(msg, channel, forceplay=forceplay, forceplay_url=url);
					}
				}
				
			}
			
		// - disconnect (disconnects bot from channel)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"disconnect" || msg.content == prefix[msg.guild.id]+"d"
		|| msg.content == prefix[msg.guild.id]+"leave") {
			// disconnect user
			disconnect(msg);
		
		// - np (now playing)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"np" || msg.content == prefix[msg.guild.id]+"nowplaying") {
			// check if current song is YouTube URL
			if (song_queus[msg.guild.id] != undefined) {
				if (song_queus[msg.guild.id][0] != undefined) {
					if (check_youtube_url(song_queus[msg.guild.id][0][0]) == true) {
						// get song URL
						if (forced_song[msg.guild.id] == undefined) {
							song_url = song_queus[msg.guild.id][0][0];
						} else {
							song_url = forced_song[msg.guild.id][0];
						}
					
						// get song ID
						if (song_url.indexOf("watch?v=") > -1) {
							song_ID = song_url.split("watch?v=")[1].split("/")[0];
						} else {
							song_ID = song_url.split("://youtu")[1].split("/")[1];
						}
				
						// format URL
						yt_url = "https://youtube.com/watch?v=" + song_ID;
						youtube.search(song_ID).then(response => {
							if (response != undefined) {
								// embed
								song_info(msg, response, yt_url);
							}
						}).catch(err => {
							console_log("Error thrown in now playing youtube search! " + err, error=true);
						})
					}
				} else {
					embed_error(msg, "No song is currently playing!");
				}
			} else {
				embed_error(msg, "There are no songs currently in the queue! type `"+prefix[msg.guild.id]+"play {url / name}` to play a song");
			}
		
		// - ping (checks the bots response time to discord)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"ping") {
			if (msg.author.bot == false) {
				msg.channel.send(msg, "Pinging...").then(res => {
					// measure response time
					ping = res.createdTimestamp - msg.createdTimestamp;
					res.delete();
					
					// embed
					embed_ping = new Discord.MessageEmbed();
					embed_ping.setColor(embed_color_chat);
					embed_ping.setDescription("🏓 The bots response time to the server is " + ping + "ms!");
					embed_ping.setTimestamp();
					msg_channel_send(msg, embed_ping);
				}).catch(err => {
					console_log("Error thrown in music ping! " + err, error=true);
				})
			}
		// - queue (lets you view the queue)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"queue" || msg.content == prefix[msg.guild.id]+"q") {
			// embed
			embed_queue = new Discord.MessageEmbed();
			embed_queue.setColor(embed_color_chat);
			embed_queue.setTitle("Song Queue");
			embed_queue.setTimestamp();
			embed_queue.setFooter("🎶");
			embed_queue.setDescription("This is a list of the songs currently in the queue, to remove a song type `"+prefix[msg.guild.id]+"remove {song index}`, "+
			"for example `"+prefix[msg.guild.id]+"remove 1` will remove the first song in the queue.\n\u200B");
			
			// check if queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "There are no songs currently in the queue, to add a song to the queue type `"+prefix[msg.guild.id]+"play {song name or URL}`");
				return false;
			} else if (song_queus[msg.guild.id].length == 0) {
				embed_error(msg, "There are no songs currently in the queue, to add a song to the queue type `"+prefix[msg.guild.id]+"play {song name or URL}`")
				return false;
			}
			
			// get info on the songs
			async function get_song_info() {
				try {
					for (i=0;i<song_queus[msg.guild.id].length;i++) {
						await new Promise(next => {
							// get song ID
							song_url = song_queus[msg.guild.id][i][0];
							if (song_url.indexOf("watch?v=") > -1) {
								song_ID = song_url.split("watch?v=")[1].split("/")[0];
							} else {
								song_ID = song_url.split("://youtu")[1].split("/")[1];
							}
						
							// get song
							if (i < 25) {
								youtube.search(song_ID).then(response => {
									song_name = response.videos[0].title;
									if (i == 0) {
										embed_queue.addField("__Currently Playing:__\n"+song_name, "Index: " + (i+1) + "\nSong ID: " + song_ID + "\n\u200B");
									} else if (i == 1){
										embed_queue.addField("__Queue:__\n"+song_name, "Index: " + (i+1) + "\nSong ID: " + song_ID + "\n\u200B");
									} else {
										embed_queue.addField(song_name, "Index: " + (i+1) + "\nSong ID: " + song_ID + "\n\u200B");
									}
									next();
								}).catch(err => {
									console_log("Error thrown in get_song_info youtube search! " + err, error=true);
								})
							}
						})
					}
				} catch (err) {
					console_log("Error thrown in get_song_info function! " + err, error=true);
				}
			}
			
			// send message
			get_song_info().then(() => {
				msg_channel_send(msg, embed_queue);
			}).catch(err => {
				console_log("Error thrown in get_song_info! " + err, error=true);
			})
		
		// - remove	{index in queue} (removes a song from the queue)
		} else if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"remove " || msg.content.slice(0, 3) == prefix[msg.guild.id]+"r ") {
			command = msg.content.slice(8, msg.content.length);
			
			// check if the queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "The queue is empty you can't remove a song!");
				return false;
			} else if (song_queus[msg.guild.id].length == 0) {
				embed_error(msg, "The queue is empty you can't remove a song!");
				return false;
			}
			
			// check is input is valid index, then remove the song from queue
			if (isInt(msg, command, 0, song_queus[msg.guild.id].length+2, "index", ErrorMessageEnd="") == true) {
				// make song at specified index undefined
				song_queus[msg.guild.id][parseInt(command)-1] = undefined;
				
				// remove the song from list
				current_songs = [];
				for (i=0;i<song_queus[msg.guild.id].length;i++) {
					if (song_queus[msg.guild.id][i] != undefined) {
						current_songs.push(song_queus[msg.guild.id][i]);
					}
				}
				song_queus[msg.guild.id] = current_songs;
				
				// message user
				embed_info_reply(msg, "The song at index " + command + " was removed from the queue!");
				
			}
		
		// - playtop (reverses the order of the queue to play the last song first)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"playtop" || msg.content == prefix[msg.guild.id]+"reverse") {
			// check if the queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "The queue is empty you can't reverse an empty queue!");
				return false;
			} else if (song_queus[msg.guild.id].length == 0) {
				embed_error(msg, "The queue is empty you can't reverse an empty queue!");
				return false;
			}
			
			// reverse
			current_song = [song_queus[msg.guild.id][0]];
			reversed_songs = [];
			
			current_queue = song_queus[msg.guild.id].slice(1, song_queus[msg.guild.id].length);
			for (i=0;i<current_queue.length;i++) {
				reversed_songs.push(current_queue[current_queue.length - i -1]);
			}
			
			// message user
			song_queus[msg.guild.id] = current_song.concat(reversed_songs);
			embed_info_reply(msg, "The song queue has been reversed, the last song will be played first after this current song finishes");
		
		// - move {old pos} {new pos} (move a song to diffrent position in queue)
		} else if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"move " || msg.content.slice(0, 3) == prefix[msg.guild.id]+"m ") {
			// check if the queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "The queue is empty you can't reverse an empty queue!");
				return false;
			} else if (song_queus[msg.guild.id].length < 2) {
				embed_error(msg, "There needs to be atleast 2 songs in the queue to use the move command!");
				return false;
			}
			
			command = msg.content.slice(6, msg.content.length).split(" ");
			if (command.length == 2) {
				first_index = command[0];
				second_index = command[1];
				
				if (isInt(msg, first_index, 0, song_queus[msg.guild.id]+2, "first index", ErrorMessageEnd="") == true) {
					if (isInt(msg, second_index, 0, song_queus[msg.guild.id]+2, "second index", ErrorMessageEnd="") == true) {
						// update positions in array
						first_pos = song_queus[msg.guild.id][parseInt(first_index)-1];
						second_pos = song_queus[msg.guild.id][parseInt(second_index)-1];
						
						song_queus[msg.guild.id][parseInt(second_index)-1] = first_pos;
						song_queus[msg.guild.id][parseInt(first_index)-1] = second_pos;
						
						// message user
						embed_info_reply(msg, "The song at index " + first_index + " has been moved to index " + second_index + " in the queue!");
						
					}
				}
			} else {
				embed_error(msg, "Invalid Syntax, the format for the command is `"+prefix[msg.guild.id]+"move {index 1} {index 2}`.");
			}
		
		// - loop (loops the current song)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"loop" || msg.content == prefix[msg.guild.id]+"l") {
			// toggle loop
			if (loop[msg.guild.id] == undefined || loop[msg.guild.id] == false) {
				loop[msg.guild.id] = true;
				embed_info_reply(msg, "Loop enabled, the current song will be looped, type `"+prefix[msg.guild.id]+"loop` to toggle it off.");
			} else {
				loop[msg.guild.id] = false;
				embed_info_reply(msg, "Loop disable, the current song will no longer be looped, type `"+prefix[msg.guild.id]+"loop` to toggle it on.");
			}
		
		// - loopqueue (loops the whole queue)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"loopq" || msg.content == prefix[msg.guild.id]+"lq") {
			// backup queue
			backup_queue[msg.guild.id] = song_queus[msg.guild.id];
			
			// toggle loop queue
			if (loopq[msg.guild.id] == undefined || loopq[msg.guild.id] == false) {
				loopq[msg.guild.id] = true;
				embed_info_reply(msg, "Loop Queue enabled, the queue will be looped, type `"+prefix[msg.guild.id]+"loopq` to toggle it off.");
			} else {
				loopq[msg.guild.id] = false;
				embed_info_reply(msg, "Loop Queue disabled, the queue will not longer be looped, type `"+prefix[msg.guild.id]+"loopq` to toggle it on.");
			}
			
			
		// - clear (clears the queue, removing all queued songs)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"clearq" || msg.content == prefix[msg.guild.id]+"cq") {
			song_queus[msg.guild.id] = [];
			embed_chat_reply(msg, "The song queue has been cleared by "+msg.member.user.tag+"!");
			
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"clear") {
			help_clear(msg);
			
		// - removedupes (removes duplicate songs from queue)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"removedupes" || msg.content == prefix[msg.guild.id]+"rd") {
			// check if the queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "The queue is empty you can't remove duplicates on an empty queue!");
				return false;
			} else if (song_queus[msg.guild.id].length < 2) {
				embed_error(msg, "There needs to be atleast 2 songs in the queue to use the remove duplicatess command!");
				return false;
			}
			
			
			// remove values be addign to dict
			temp_dict = {};
			for (i=0;i<song_queus[msg.guild.id].length;i++) {
				if (temp_dict[song_queus[msg.guild.id][i]] == undefined) {
					temp_dict[song_queus[msg.guild.id][i][0]] = song_queus[msg.guild.id][i][1];
				}
			}
			
			// convert dict to list
			temp_list = [];
			for (i=0;i<Object.keys(temp_dict).length;i++) {
				temp_list.push([Object.keys(temp_dict)[i], temp_dict[Object.keys(temp_dict)[i]]]);
			}
			
			// message user
			song_queus[msg.guild.id] = temp_list;
			embed_chat_reply(msg, "All duplicate songs have been removed from the queue!");
		
		// - shuffle (randomly shuffles the queue)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"shuffle" || msg.content == prefix[msg.guild.id]+"s") {
			// check if queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "Failed to shuffle, the queue is empty!");
				return false;
			} else if (Object.keys(song_queus[msg.guild.id]).length < 2) {
				embed_error(msg, "There needs to be atleast 2 songs in the queue in order to shuffle!");
				return false;
			}
			
			// get first song
			current_song = song_queus[msg.guild.id][0];
			current_queue = song_queus[msg.guild.id].slice(1, song_queus[msg.guild.id].length);
			
			// random order
			queue_order = [];
			for (i=0;i<current_queue.length;i++) {
				rand_index = parseInt(Math.random()*100) % current_queue.length;
				while (queue_order.indexOf(rand_index) > -1) {
					rand_index = parseInt(Math.random()*100) % current_queue.length;
				}
				queue_order.push(rand_index);
			}
			
			// shuffle queue
			temp_queue = [current_song];
			for (i=0;i<queue_order.length;i++) {
				temp_queue.push(current_queue[queue_order[i]]);
			}
			
			// message user
			song_queus[msg.guild.id] = temp_queue;
			embed_chat_reply(msg, "The queue has been randomly shuffled!");
		
		// - replay (replays the current song from beginning)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"replay") {
			// check if queue is empty
			if (song_queus[msg.guild.id] == undefined) {
				embed_error(msg, "Failed to replay song, the queue is empty!");
				return false;
			} else if (Object.keys(song_queus[msg.guild.id]).length < 1) {
				embed_error(msg, "There needs to be atleast 1 song in the queue in order to replay!");
				return false;
			}
			
			// replay song
			play_song(msg, channel_guild[msg.guild.id]);
			embed_chat_reply(msg, "The current song has been replayed from the beginning!");
		
		// - testaudio (tests that ytdl is functional and can play a youtube video)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"testaudio") {
			console_log("Audio test started on server " + msg.guild.id);
			// get users voice channel
			channel = msg.member.voice.channel;
			if (channel == undefined) {
				embed_error(msg, "Your not connected to any voice channel!");
				return false;
			} else {
				forced_song[msg.guild.id] = [audio_test_video_url, msg.author.id];
			}
			
			// play the song
			if (song_player[msg.guild.id] != true) {
				song_player[msg.guild.id] = true;
				play_song(msg, channel, forceplay=true, forceplay_url=audio_test_video_url);
			}
			
		// - join (make the bot join the voice channel of the message sender)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"join" || msg.content == prefix[msg.guild.id]+"j") {
			// get users voice channel
			channel = msg.member.voice.channel;
			if (channel == undefined) {
				embed_error(msg, "Your not connected to any voice channel!");
				return false;
			} else {
				try {
					channel.join().then(connection => {
						embed_info_reply(msg, "JaredBot has joined voice channel " +msg.channel.id+ "!");
					}).catch(error => {
						console_log(msg, "Failed to join voice channel on guild " + msg.guild.name, error=true);
					})
				} catch {
					console_log("Failed to join channel on " + msg.guild.name);
				}
			}
		
		// - pause (pause the current playing track)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"pause") {
			dj[msg.guild.id].pause();
			embed_info_reply(msg, "The song has been paused!");
		
		// - resume (resume paused music)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"resume") {
			dj[msg.guild.id].resume();
			embed_info_reply(msg, "The has been resumed!");
		
		// - settings (shows the music player settings, volume, loop, queue length)
		} else if (msg.guild != null && msg.content == prefix[msg.guild.id]+"settings" || msg.content == prefix[msg.guild.id]+"songinfo" || msg.content == prefix[msg.guild.id]+"streaminfo") {
			if (dj[msg.guild.id] != undefined && song_queus[msg.guild.id] != undefined) {
				// check if queue is empty
				if (song_queus[msg.guild.id] == undefined) {
					embed_error(msg, "There are no songs currently in the queue, to add a song to the queue type `"+prefix[msg.guild.id]+"play {song name or URL}`");
					return false;
				} else if (song_queus[msg.guild.id].length == 0) {
					embed_error(msg, "There are no songs currently in the queue, to add a song to the queue type `"+prefix[msg.guild.id]+"play {song name or URL}`")
					return false;
				}
				
				// stream stats
				song_length = dj[msg.guild.id]._writableState.length;
				seek = dj[msg.guild.id].streamOptions.seek;
				volume = dj[msg.guild.id].streamOptions.volume;
				bitrate = dj[msg.guild.id].streamOptions.bitrate;
				start_time = dj[msg.guild.id].startTime;
				pause_time = dj[msg.guild.id].pausedSince;
			
				// youtube stats
				song_id = song_queus[msg.guild.id][0][0].replace("watch?v=","").split("/").slice(-1);
				youtube.search(song_id).then(response => {
					if (response != []) {
						// check if song exists
						if (response.videos[0] != undefined) {
							video = response.videos[0]
							song_id = video.id;
							song_title = video.title;
							song_link = video.link;
							song_thumbnail = video.thumbnail;
							song_description = video.description;
							song_views = video.views;
							song_date = video.uploaded;
							
							channel_name = video.channel.name;
							channel_verified = video.channel.verified;
							channel_link = video.channel.link;
							channel_thumbnail = video.channel.thumbnail;
							
							// embed
							settings_embed = new Discord.MessageEmbed();
							settings_embed.setColor(embed_colour_info);
							settings_embed.setURL(song_link);
							settings_embed.setTitle("Stream Information");
							settings_embed.setAuthor(channel_name, channel_thumbnail, channel_link);
							settings_embed.setDescription("Currently playing **" + song_title + "** by " + channel_name);
							settings_embed.setThumbnail(song_thumbnail);
							
							// times
							if (pause_time == null) {
								format_pause_time = "Not Paused";
							} else {
								format_pause_time = new Date(pause_time).toLocaleTimeString()+"\n\u200B";
							}
							
							// format MM:SS
							length_mins = ("00"+String(song_length / 60).split(".")[0]).slice(-2);
							length_secs = ("00"+String(Math.round(("0." + String(song_length / 60).split(".")[1])*60)).replace("NaN", "0")).slice(-2);
							seek_mins = ("00"+String(seek / 60).split(".")[0]).slice(-2);
							seek_secs = ("00"+String(Math.round(("0." + String(seek / 60).split(".")[1])*60)).replace("NaN", "0")).slice(-2);
							
							// add fields
							settings_embed.addFields(
								{name: "Song Length", value: length_mins+":"+length_secs, inline:true},
								{name: "Volume", value: (volume*100)+"%\n\u200B", inline:true},
								{name: "Bitrate", value: bitrate+"kbps\n\u200B", inline:true},
								{name: "Start Time", value: new Date(start_time).toLocaleTimeString()+"\n\u200B", inline:true},
								{name: "Paused Since", value: format_pause_time, inline:true},
								{name: "Seek", value: seek_mins+":"+seek_secs+"\n\u200B", inline:true},
								{name: "Song Name", value: channel_name+"\n\u200B", inline:true},
								{name: "Views", value: String(song_views).replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"\n\u200B", inline:true},
								{name: "Published", value: song_date+"\n\u200B", inline:true},
							)
							settings_embed.setFooter(song_id);
							settings_embed.setTimestamp();
							msg_channel_send(msg, settings_embed);
						}
					}
				}).catch(err => {
					console_log("Error thrown in msuic settings! " + err, error=true);
				})
			} else {
				embed_error(msg, "Unable to get song info, make sure the bot is connected to a voice channel and a song is currently playing!");
			}
			
		// free play (instead of disconnecting, randomly choose another song once the queue ends)
		} else if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"freeplay ") {
			command = msg.content.slice(10, msg.content.length);
			if (command == "on") {
				freeplay[msg.guild.id] = true;
				embed_chat_reply(msg, "Freeplay turned on, JaredBot will automatically choose a new song once the queue as ended!");
				
			} else if (command == "off") {
				freeplay[msg.guild.id] = false;
				embed_chat_reply(msg, "Freeplay turned off, JaredBot will now only play the songs in the queue, once the queue reaches the end, "+
				"JaredBot will leave the voice channel.");
				
			} else {
				embed_error(msg, "Invalid option, the syntax for the command is `"+prefix[msg.guild.id]+"freeplay [on/off]`, to turn freeplay on type `"+prefix[msg.guild.id]+"freeplay on`" +
				", to turn it off type `"+prefix[msg.guild.id]+"freeplay off`");
			}
			
		}
	}
})

// play mp3
/*bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"play" || msg.content.slice(0, 10) == prefix[msg.guild.id]+"play http") {
			url = undefined;
			if (msg.content.split(" ").length == 2) {
				if (msg.content.split(" ")[1].replace("https","http").slice(0, 38) == "http://cdn.discordapp.com/attachments/" ||
					msg.content.split(" ")[1].replace("https","http").slice(0, 30) == "http://jaredbot.uk/videos/src/") {
					url = msg.content.split(" ")[1];
				}
			} else {
				msg.attachments.forEach(function(attachment) {
					url = attachment.url;
				})
			}
			
			// check for undefined URL
			if (url == undefined) {
				return false;
			}
			
			// play mp3
			channel = msg.member.voice.channel;
			if (channel == undefined) {
				embed_error(msg, "Your not connected to any voice channel!");
				return false;
			} else {
				// check if the bot is already in voice channel
				if (channel_guild[msg.guild.id] != undefined) {
					user_channel = msg.member.voice.channel;
					bot_channel = msg.guild.voice;
					
					// check if the bot is in a voice channel
					if (bot_channel == null) {
						channel_guild[msg.guild.id] = channel;
						
					// check if user is in same channel as bot
					} else {
						if (bot_channel.connection != null) {
							if (user_channel == bot_channel.connection.channel) {
								channel.join().then(connection => {
									connection.play(url, {filter:"audioonly", quality:"highestaudio"});
								}
							}
						}
					}
				}
			}
		}
	}
})*/

function dict2string(dict) {
	output = [];
	for (i in dict) {
		if (dict.hasOwnProperty(i)) {
			output.push("'" + i + "' : '" + dict[i]);
		}
	}
	return "{" + output.join(", ") + "}";
}

bot.on("message", msg => {
	try {
		if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
			if (msg.guild != null && msg.content == prefix[msg.guild.id]+"globaldicts") {
				if (authorised_IDs.indexOf(msg.author.id) > -1) {
					output = "";
				
					// Music Dicts
					output += "\n// --- Music Dicts ---\n";
					output += "\n\n// song_queus\n" + dict2string(song_queus);
					output += "\n\n// song_player\n" + dict2string(song_player);
					output += "\n\n// channel_guild\n" + dict2string(channel_guild);
					output += "\n\n// stream\n" + dict2string(stream);
					output += "\n\n// forced_song\n" + dict2string(forced_song);
					output += "\n\n// loop\n" + dict2string(loop);
					output += "\n\n// loopq\n" + dict2string(loopq);
					output += "\n\n// backup_queue\n" + dict2string(backup_queue);
					output += "\n\n// dj\n" + dict2string(dj);
					output += "\n\n// steamOptions\n" + dict2string(steamOptions);
					output += "\n\n// freeplay\n" + dict2string(freeplay);
				
					// Other
					output += "\n// --- Other ---\n";
					output += "\n\n// user_who_broke_rules_dict\n" + dict2string(user_who_broke_rules_dict);
					output += "\n\n// dataset_counts\n" + dict2string(dataset_counts);
					output += "\n\n// letter_emojis\n" + dict2string(letter_emojis);
					output += "\n\n// self_roles_dict\n" + dict2string(self_roles_dict);

					// auto post
					output += "\n// --- Auto Post ---";
					output += "\n\n// meme_intervals\n" + dict2string(meme_intervals);
					output += "\n\n// photo_intervals\n" + dict2string(photo_intervals);
					output += "\n\n// bird_intervals\n" + dict2string(bird_intervals);
					output += "\n\n// car_intervals\n" + dict2string(car_intervals);
					output += "\n\n// cat_intervals\n" + dict2string(cat_intervals);
					output += "\n\n// dog_intervals\n" + dict2string(dog_intervals);
					output += "\n\n// snake_intervals\n" + dict2string(snake_intervals);

					// justone
					output += "\n// --- JustOne ---";
					output += "\n\n// justone_guild\n" + dict2string(justone_guild);
					output += "\n\n// justone_members_dict\n" + dict2string(justone_members_dict);
					output += "\n\n// justone_clues_dict\n" + dict2string(justone_clues_dict);
					output += "\n\n// justone_channel_IDs\n" + dict2string(justone_channel_IDs);

					// networking
					output += "\n// --- Networking ---";
					output += "\n\n// justone_members_dict\n" + dict2string(port_scan_results);
					output += "\n\n// justone_members_dict\n" + dict2string(port_scan_timeout);

					// execute
					output += "\n// --- Execute ---";
					output += "\n\n// execute_cooldown\n" + dict2string(execute_cooldown);

					// rules
					output += "\n// --- Rules ---";
					output += "\n\n// rule_timeout\n" + dict2string(rule_timeout);
					output += "\n\n// phishing_timeouts\n" + dict2string(phishing_timeouts);
					output += "\n\n// user_spam_dict\n" + dict2string(user_spam_dict);
					output += "\n\n// banned_emojis\n" + dict2string(banned_emojis);
					output += "\n\n// banned_urls\n" + dict2string(banned_urls);
					output += "\n\n// filter_onoff\n" + dict2string(filter_onoff);
				
					// Py Challenges
					output += "\n// --- Py Challenges ---";
					output += "\n\n// sent_pychallenge\n" + dict2string(sent_pychallenge);

					// Levels
					output += "\n// --- levels ---";
					output += "\n\n// updating_leaderboard\n" + dict2string(updating_leaderboard);
					output += "\n\n// leaderboard_cooldown\n" + dict2string(leaderboard_cooldown);
					output += "\n\n// leaderboard_intervals\n" + dict2string(leaderboard_intervals);
				
					// Welcome
					output += "\n// --- Welcome ---";
					output += "\n\n// welcome_channel_ids\n" + dict2string(welcome_channel_ids);
					output += "\n\n// first_time_join\n" + dict2string(first_time_join);
					
					// prefix
					output += "\n// --- Prefix ---";
					output += "\n\n// Prefix\n" + dict2string(prefix);
		
					// write dicts to file
					fs_write.writeFile("logs/global_dicts.txt", output, function(err) {
						if (err) {
							return console_log("Failed to write Global dicts to file! ", error=true);
						}
					})
				
					// message user
					embed_chat_reply(msg, "Wrote Global Dicts to file!");
				
				} else {
					embed_error(msg, "You dont have permission to use this command, this command can only be used by Jared!");
				}
			}
		}
	} catch (err) {
		console_log("Error thrown in globaldicts! " + err, error=true);
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 11) == prefix[msg.guild.id]+"wordcount ") {
			txt = msg.content.slice(11, msg.content.length);
			embed_chat_reply(msg, "The text contains: "+txt.split(" ").length+" words!");
		}
	}
})


// maths functions
function is_leap(msg, year) {
	try {
		if ((year % 4 && (year % 100 != 0 || year % 400 == 0)) == true) {
			leapyear_output = "false " + year + " is not a leap year!";
			embed_input_output_reply(msg, year, leapyear_output, "Calculator", "type -help math for list of commands");
		} else {
			leapyear_output = "true " + year + " is a leap year!";
			embed_input_output_reply(msg, year, leapyear_output, "Calculator", "type -help math for list of commands");
		}
	} catch (err) {
		console_log("Error thrown in is_leap function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"isleap ") {
			year = msg.content.slice(8, msg.content.length);
			if (isNaN(parseInt(year)) == false) {
				if (year % 1 == 0) {
					is_leap(msg, year);
				} else {
					embed_error(msg, "Year must be a whole number!");
				}
			} else {
				embed_error(msg, "Invalid Format! The correct format is `"+prefix[msg.guild.id]+"isleap {year}`!");
			}
		}
	}
})

// days till date
function help_calendar(msg) {
	embed_calendar = new Discord.MessageEmbed();
	embed_calendar.setColor(embed_color_chat);
	embed_calendar.setTitle("Help calendar");
	embed_calendar.addFields(
		{name: "Public holidays", value: "Type `"+prefix[msg.guild.id]+"christmas`, `"+prefix[msg.guild.id]+"halloween`, `"+prefix[msg.guild.id]+"year` to get the number of days till a specific public holiday.\n\u200B"},
		{name: "Days till date", value: "Type `"+prefix[msg.guild.id]+"date {YY:MM:DD}` to get the number of days to a specific date, for example `-date 2022-12-31`.\n\u200B"},
	)
	embed_calendar.setTimestamp();
	msg_channel_send(msg, embed_calendar);
}

function days_to_date(date, txt) {
	new_years = parseInt(Math.abs((new Date() - new Date(String(date))) / 1000));
	res = sec_to_days_mins_hours(new_years);
	year = new Date().getFullYear();
	return `There are ${res[0]} days, ${res[1]} hours, ${res[2]} mins, and ${res[3]} seconds ${txt}!`;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"year") {
			year = new Date().getFullYear();
			embed_chat_reply(msg, days_to_date(year+1, "till the end of " + year));
			
		} else if (msg.content == prefix[msg.guild.id]+"christmas") {
			xmas = new Date(new Date().getFullYear()+'-12-25');
			embed_chat_reply(msg, days_to_date(xmas, "until Christmas"));
			
		} else if (msg.content == prefix[msg.guild.id]+"halloween") {
			hell = new Date(new Date().getFullYear()+'-10-31');
			embed_chat_reply(msg, days_to_date(hell, "until halloween"));
			
		} else if (msg.content.slice(0, 6) == prefix[msg.guild.id]+"date ") {
			date = msg.content.slice(6, msg.content.length);
			embed_chat_reply(msg, days_to_date(date, "until " + date));
		}
	}
})

// is prime
function is_prime(n) {
	for (i=2;i<n;i++) {
		if (n % i == 0) {
			return false;
		}
	}
	return n > 1;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 9) == prefix[msg.guild.id]+"isprime ") {
			num = msg.content.slice(9, msg.content.length);
			if (isInt(msg, num, 0, large_numb, "number") == true) {
				embed_input_output_reply(msg, "IsPrime( "+num+" )", is_prime(num), "Calculator");
			}
			
		}
	}
})

// fibonacci
function fib(x) {
	n = [0, 1];
	d = [];
	for (i=0;i<x;i++) {
		s = n[0] + n[1];
		n[0] = n[1];
		n[1] = s;
		d.push(s);
	}
	return d;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 5) == prefix[msg.guild.id]+"fib " || msg.content.slice(0, 11) == prefix[msg.guild.id]+"fibonacci ") {
			num = msg.content.split(' ')[1];
			if (isInt(msg, num, 0, large_numb, "number") == true) {
				embed_chat_reply(msg, ([0, 1].concat(fib(parseInt(num)))).join(" ").slice(0, 2000));
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"bmi ") {
			input_text = msg.content.slice(5, msg.content.length).split(" ");
			if (input_text.length == 2) {
				if (isNaN(parseInt(input_text[0])) == false && isNaN(parseInt(input_text[1])) == false) {
					bmi =  parseInt(input_text[1]) / ( (parseInt(input_text[0])/100) ** 2);
					reply_text = "\nHeight: "+input_text[0]+"cm\nWeight: "+input_text[1]+"kg\nBMI: "  +bmi.toFixed(2);
					if (bmi <= 18.5) {
						reply_text = reply_text + "\nWeight Status: Underweight";
					} else if (bmi >= 18.5 && bmi <= 24.9) {
						reply_text = reply_text + "\nWeight Status: Normal Weight";
					} else if (bmi >= 25.0 && bmi <= 29.0) {
						reply_text = reply_text + "\nWeight Status: Overweight";
					} else if (bmi >= 30.0 && bmi <= 34.9) {
						reply_text = reply_text + "\nWeight Status: Obesity Class 1";
					} else if (bmi >= 35.0 && bmi <= 39.9) {
						reply_text = reply_text + "\nWeight Status: Obesity Class 2";
					} else if (bmi >= 40) {
						reply_text = reply_text + "\nWeight Status: Obesity Class 3";
					}
				
					// send message
					embed_info_reply(msg, reply_text+"\n\nPlease be aware that BMI is not an accurate representation of a persons health, as it does not take into account fat or muscle."+
					" For example a person who does a lots of sport, may have a higher BMI then someone that is inactive, but be a lot healthier.");
				} else {
					embed_error(msg, "Invalid Input! Your height and weight must be numbers!");
				}
			} else {
				embed_error(msg, "Invalid format! should be `"+prefix[msg.guild.id]+"bmi {height in cm} {weight in kg}`");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase().slice(0, 3) == prefix[msg.guild.id]+"c " || msg.content.toLowerCase().slice(0, 3) == prefix[msg.guild.id]+"f ") {
			temp = msg.content.slice(3, msg.content.length);
			if (isNaN(parseInt(temp)) == false) {
				if (msg.content.toLowerCase().slice(0, 3) == prefix[msg.guild.id]+"c ") {
					temp_output = String(((temp * (9/5)) + 32).toFixed(1)).replace(".0","");
					embed_input_output_reply(msg, temp+"°C", temp_output+"°F", "Calculator", "type -help math for list of commands");
					
				} else if (msg.content.toLowerCase().slice(0, 3) == prefix[msg.guild.id]+"f ") {
					temp_output = String(((temp - 32) * (5/9)).toFixed(1)).replace(".0","");
					embed_input_output_reply(msg, temp+"°F", temp_output+"°C", "Calculator", "type -help math for list of commands");
				}
			} else {
				embed_error(msg, "Invalid Input! your temperature must be a number!");
			}
		}
	}
})

// random
function randint(start, end) {
	return (parseInt(Math.random()*100) % (end - start)) + start;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"postcode") {
			url = "https://www.generatormix.com/random-uk-postcode-generator";
			get_html(url, function(html) {
				postcode = html.split('id="output"')[1].split('<h3 class="text-center">')[1].split('</h3>')[0];
				embed_chat_reply(msg, "Your Random post code is `" + postcode + "`!");
			})
		}
	}
})

// calc
function check_eval_input(txt) {
	allow_chars = "0123456789+-*/%&|!~^<>(). ";
	for (i=0;i<txt.length;i++) {
		if (allow_chars.indexOf(txt[i]) == -1) {
			return false;
		}
	}
	return true;
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"calc ") {
			// easter egg
			if (msg.content == prefix[msg.guild.id]+"calc meow") {
				embed_chat_reply(msg, "Meow is equal too 69!");
				return true;
			} else if (msg.content == prefix[msg.guild.id]+"calc 42") {
				embed_chat_reply(msg, "Answer to the Ultimate Question of Life, the Universe, and Everything!");
				return true;
			}
			
			// Calculate using eval
			command = msg.content.slice(6, msg.content.length);
			try {
				if (check_eval_input(command) == true) {
					answer = eval(command);
					// send message to user
					if (isNaN(answer) == true) {
						embed_error(msg, "Error! Failed to calculate!");
					} else if (answer == Infinity) {
						embed_error(msg, "Infinity Error! Answer is to big!");
					} else {
						calc_output = msg.content.slice(6, msg.content.length);
						embed_input_output_reply(msg, calc_output, answer, "Calculator", "type -help math for list of commands");
					}
				} else {
					embed_error(msg, "Failed to calculate, not a valid formula!");
				}
			} catch (err) {
				embed_error(msg, "Failed to calculate, error thrown!");
			}
		}
	}
})

// add, subtract, times, divide
function add_sub(msg, operator, op) {
	if (msg.content.slice(0, operator.length+1) == prefix[msg.guild.id]+operator) {
		command = msg.content.split(" ");
		if (isInt(msg, command[1], ~large_numb, large_numb, "first number") == true) {
			if (isInt(msg, command[2], ~large_numb, large_numb, "second number") == true) {
				num1 = parseFloat(command[1]);
				num2 = parseFloat(command[2]);
				embed_input_output_reply(msg, command[1]+op+command[2], {
					"+" : num1 + num2,
					"-" : num1 - num2,
					"*" : num1 * num2,
					"/" : num1 / num2,
					"**" : num1 ** num2,
					"%" : num1 % num2,
					"&" : num1 & num2,
					"|" : num1 | num2,
					"^" : num1 ^ num2,
				}[op], "Calculator");
			}
		}
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		add_sub(msg, "add ", "+");
		add_sub(msg, "sub ", "-");
		add_sub(msg, "subtract ", "-");
		add_sub(msg, "times ", "*");
		add_sub(msg, "multiply ", "*");
		add_sub(msg, "divide ", "/");
		add_sub(msg, "div ", "/");
		add_sub(msg, "power ", "**");
		add_sub(msg, "pow ", "**");
		add_sub(msg, "mod", "%")
		
		// bitwise
		add_sub(msg, "and", "&");
		add_sub(msg, "or", "|");
		add_sub(msg, "xor", "^");
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 4) == prefix[msg.guild.id]+"not") {
			command = msg.content.split(' ');
			if (command[1] != undefined && isInt_without_error(command[1], ~large_numb,large_numb) == true) {
				embed_input_output_reply(msg, "~"+command[1], ~command[1], "Calculator");
			}
		}
	}
})

// calc help
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.toLowerCase() == prefix[msg.guild.id]+"calc") {
			embed_calc_help = new Discord.MessageEmbed();
			embed_calc_help.setTitle("Calculator");
			embed_calc_help.setColor(embed_colour_info);
			embed_calc_help.setDescription("to use the calculator type `"+prefix[msg.guild.id]+"calc {equation}`! For example: `"+prefix[msg.guild.id]+"calc 2**10-24` Will return `1000`! " +
				"Be aware the order of operation is not compliant to BIDMAS, calculations are preformed in the order they are typed! " +
				"When using the calculator all of the following operators are valid");
			embed_calc_help.addFields(
				{name: "+", value: "Addition, adds number together, 56 + 44 = 100", inline: true},
				{name: prefix[msg.guild.id]+"", value: "Subtraction, subtract numbers, 100 - 10 = 90", inline: true},
				{name: "*", value: "Times, times numbers together, 91*10 = 910", inline: true},
				{name: "/", value: "Division, divide numbers, 66 / 3 = 22", inline: true},
				{name: "%", value: "Modules, modula numbers together, 69 % 2 = 1", inline: true},
				{name: "**", value: "Power, raise a number to the power of, 2 ** 10 = 1024", inline: true},
				{name: "&", value: "AND, use the AND bitwise AND operator on a number, 8 & 8 = 8", inline: true},
				{name: "|", value: "OR, use the OR bitwise operator on a number, 34 | 89 = 123", inline: true},
				{name: "^", value: "XOR, use the XOR bitwise operator on a number, 2 ^ 8 = 10", inline: true},
				{name: "<<", value: "Left Shift bitwise operator, shift the binary bits in a number left, 2 << 10 = 2048", inline: true},
				{name: ">>", value: "Right Shift bitwise operator, shift the binary bits in a number right, 343434 >> 10 = 335", inline: true}
			)
			msg_channel_send(msg, embed_calc_help);
		}
	}
})

// int2num
function hundred(n) {
	try {
		units = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
		tens = ["ten", "twenty", "thirty", "fourty", "fifty", "sixty", "seventy", "eighty", "ninety"];
		teens = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
	
		if (n >= 1 && n <= 19) {
			return (units + [",ten,"] + teens).split(",")[n-1];
		} else if (String(n).length == 2 && n % 10 == 0) {
			return tens[String(n)[0]-1];
		} else if (String(n).length == 2) {
			return tens[String(n)[0]-1] + " " + units[String(n)[1]-1];
		} else if (String(n).length == 3 && String(n)[1] == 1 && String(n)[2] == 0) {
			return units[String(n)[0]-1] + " hundred and ten";
		} else if (String(n).length == 3 && n % 100 == 0) {
			return units[String(n)[0]-1] + " hundred";
		} else if (String(n).length == 3 && String(n)[1] == 1) {
			return (units[String(n)[0]-1] + " hundred and " + teens[String(n)[2]-1]).replace("undefined","").replace("  "," ");
		} else if (String(n).length == 3) {
			return (units[String(n)[0]-1] + " hundred and " + tens[String(n)[1]-1] + " " + units[String(n)[2]-1]).replace("undefined","").replace("  "," ");
		} else if (n == 0) {
			return "zero";
		}
	} catch (err) {
		console_log("Error thrown in hundred function! " + err, err=true);
	}
}

function int2num(msg, n, doReply) {
	try {
		scale = ["", "thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion",
		"Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion",
		"Quindecillion", "Sexdecillion", "Septendecillion", "Octodecillion", "Novemdecillion", "Vigintillion", "Unvigintillion",
		"Duovigintillion", "Trevigintillion", "Quattuorvigintillion", "Quinvigintillion", "Sexvigintillion", "Septenvigintillion",
		"Octovigintillion", "Novemvigintillion", "Trigintillion", "Untrigintillion", "Duotrigintillion"];
	
		values = [];
		num = String(n).split("").reverse().join("").replace("-","");
		for (i=0;i<(num.length/3);i++) {
			values.push( num.slice(i*3, (i*3)+3).split("").reverse().join("") );
		}
	
		for (i=0;i<values.length;i++) {
			if (values[i] == "000" || values[i] == "0") {
				values[i] = "";
			} else {
				values[i] = hundred(parseInt(values[i])) + " " + scale[i];
			}
		}
	
		values = values.filter(function(item) {
			return item != "";
		})
	
		output = values.reverse().join(", ").replace("  "," ");
		if (n < 0) {
			output = "minus " + output;
		}
	
		// send message
		if (doReply == true) {
			embed_info_reply(msg, output);
		} else {
			return output;
		}
	} catch (err) {
		console_log("Error thrown in int2num function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"saynum " || msg.content.slice(0, 10) == prefix[msg.guild.id]+"int2text ") {
			if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"int2text ") {
				num = msg.content.slice(10, msg.content.length);
			} else {
				num = msg.content.slice(8, msg.content.length);
			}
			if (isNaN(parseInt(num)) == false) {
				if (num > (10**99) == false) {
					if (num.indexOf(".") == -1) {
						int2num(msg, parseInt(num), true);
					} else {
						// decimal number
						units = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
						output = [];
						for (i=0;i<num.split(".")[1].length;i++) {
							output.push(units[ num.split(".")[1][i]]);
						}
					
						decimal_part = output.join(" ");
						int_part = int2num(msg, parseInt(num), false);
					
						// send message
						embed_info_reply(msg, (int_part + " point " + decimal_part).replace("  "," "));
					}
				} else {
					embed_error(msg, "Invalid Range Number to large! Make sure your number is < 10^99!");
				}
			} else {
				embed_error(msg, "Invalid Input! Make sure that you type a number!")
			}
		}
	}
})

// converters
function help_converter(msg) {
	embed_con = new Discord.MessageEmbed();
	embed_con.setColor(embed_color_chat);
	embed_con.setTitle("Help Converter");
	embed_con.addFields(
		{name: prefix[msg.guild.id]+"human2cat", value: "`"+prefix[msg.guild.id]+"human2cat {num} [years/months]` Converts humans years to cat years!"}
	)
	embed_con.setTimestamp();
	msg_channel_send(msg, embed_con);
}

// cat too human years
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 11) == prefix[msg.guild.id]+"human2cat ") {
			conversion = {
				0.16 : 2, 0.25 : 4, 0.33 : 6, 0.41 : 8, 0.5 : 10, 0.58 : 12, 0.66 : 12.5, 0.75 : 13, 0.83 : 14, 0.91 : 14.4, 1 : 15, 
				1.5 : 21, 2 : 24, 3 : 28, 4 : 32, 5 : 36, 6 : 40, 7 : 44, 8 : 48, 9 : 52, 10 : 56, 11 : 60, 12 : 64, 13 : 68, 14 : 72, 
				15 : 76, 16 : 80, 17 : 84, 18 : 88, 19 : 92, 20 : 96, 21 : 100, 22 : 104, 23 : 108, 24 : 112, 25 : 116
			}
			
			content = msg.content.slice(11, msg.content.length).split(' ').concat(['']);
			num = content[0];
			unit = content[1].replace(/s/g, '');
			if (unit.length == 0) {
				unit = "year";
			}
			
			if (isInt(msg, num, 0, large_numb, "number") == true) {
				if (unit == "month") {
					if (num <= 12) {
						num = String(num/12).slice(0, String(num/12).split(".")[0].length+3);
					} else {
						num = parseInt(num/12);
					}
				} else if (unit != "year") {
					embed_error(msg, "Not a valid format, the syntax for the command is `"+prefix[msg.guild.id]+"human2cat {num} "+
					"[years/months]` for example `"+prefix[msg.guild.id]+"human2cat 2` will convert 2 human years to cat years.")
				}
				
				if (num > 25) {
					answer = (num*4)+16;
					num = 25;
				} else {
					answer = conversion[num];
				}
				
				// convert
				embed_catage = new Discord.MessageEmbed();
				embed_catage.setTitle("Cat Age Converter");
				embed_catage.setColor(embed_color_chat);
				embed_catage.setDescription("`"+content[0]+"` human "+unit+" is `"+answer+"` cat years!");
				embed_catage.setImage(webserver_cat_age_dataset + "/" + num + ".png");
				msg_channel_send(msg, embed_catage);
			}
		}
	}
})

// among us

var among_us_quotes = ["You are sus!", "I saw you vent in electrical", "I saw Green in O2", "Why is no one fixing O2", "Oh your crewmate? Name every task",
	"Where?", "You sus", "I think it was purple", "It wasn’t me I was in vents", "Red is susssssssss", "Green is so sus",
	"Come to medbay and watch me scan"]
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"amongus" ||
			msg.content.slice(0, 4).toLowerCase() == prefix[msg.guild.id]+"sus") {
			embed_chat_reply(msg, among_us_quotes[parseInt(Math.random() * 100) % among_us_quotes.length]);
		}
	}
})


// google
function get_urls(html) {
	url = "https://encrypted-tbn0.gstatic.com/"
	data = html.split('src="' + url);
	output = [];
	for (i=0;i<data.length;i++) {
		output.push(url + data[i].split('"')[0].split("'")[0]);
	}
	return output.slice(1, output.length);
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 8).toLowerCase() == prefix[msg.guild.id]+"google ") {
			query = msg.content.slice(8, msg.content.length);
			if (query.length > 0) {
				get_html("https://www.google.co.uk/search?q="+query+"&tbm=isch&safe=active", function(html) {
					urls = get_urls(html);
					console.log(html);
					if (urls.length == 0) {
						embed_error(msg, "Failed to fetch image, JaredBot has **safe search** enabled! this means NSFW content won't be shown. "+
						"If your search contains NSFW terms, then this could be the reason for the bot failling to find a photo, else if your "+
						"search is very specific please consider making it more general!");
					} else {
						url = urls[parseInt(Math.random() * 100) % urls.length];
						embed_image(msg, url, query, guild="msg", header=query);
					}
				})
			}
		}
	}
})

// hash
function hash(msg, hashName) {
	try {
		var sum = cryp.createHash(hashName);
	
		sum.update(msg.content.slice(5, msg.content.length));
		hash_input_text = msg.content.slice(5, msg.content.length);
		embed_input_output_reply(msg, hash_input_text, sum.digest('hex'), "Calculator", "type -help math for list of commands");
	} catch (err) {
		console_log("Error thrown in hash function! " + err, error=true);
	}
}

function hash_help(msg) {
	try {
		embed_help_hash = new Discord.MessageEmbed();
		embed_help_hash.setColor(embed_colour_info);
		embed_help_hash.setTitle("Help Hash");
		embed_help_hash.addFields(
			{name: prefix[msg.guild.id]+"hash", value: "Generates checksums for a file, add the comment `"+prefix[msg.guild.id]+"hash` when uploading a file to discord to display hashs.\n\u200B"},
			{name: prefix[msg.guild.id]+"md4", value: "Generates an MD4 hash, for example `"+prefix[msg.guild.id]+"md4 Hello` produces `a58fc871f5f68e4146474ac1e2f07419`.\n\u200B"},
			{name: prefix[msg.guild.id]+"md5", value: "Generates an MD5 hash, for example `"+prefix[msg.guild.id]+"md5 Hello` produces `8b1a9953c4611296a827abf8c47804d7`.\n\u200B"},
			{name: prefix[msg.guild.id]+"sha1", value: "Generates an SHA1 hash, for example `"+prefix[msg.guild.id]+"sha1 Hello` produces `2cb42271c614a1f32dee3a8cc7d7e4d62dc04be7`.\n\u200B"},
			{name: prefix[msg.guild.id]+"sha224", value: "Generates an SHA224 hash, for example `"+prefix[msg.guild.id]+"sha224 Hello` produces `3315a79f00f1179473f3b86aed44f7db56009d14b971d6361e705de2`.\n\u200B"},
			{name: prefix[msg.guild.id]+"sha256", value: "Generates an SHA256 hash, for example `"+prefix[msg.guild.id]+"sha256 Hello` produces `62fa62853835a432efe7c8e82723b5e66be7319780033746dcdce168f0ec8554`.\n\u200B"},
			{name: prefix[msg.guild.id]+"sha384", value: "Generates an SHA384 hash, for example `"+prefix[msg.guild.id]+"sha384 Hello` produces `6be6ea8b48cebdbf0cd1629b2203b5ba58f754948f2dadb6f006f4b49f89e8eefe1b6dfcd4cb2bbb458783d9e1f13a48`.\n\u200B"},
			{name: prefix[msg.guild.id]+"sha512", value: "Generates an SHA512 hash, for example `"+prefix[msg.guild.id]+"sha512 Hello` produces `f6317fb1129b48c616400af50db8b5b458e68eb08555a6289bbb858e91166ce8d51850ee9b4c77da8579f977fd22c2d627bbe471af628309bc1c023a9c4e3718`.\n\u200B"},
			{name: prefix[msg.guild.id]+"rhash", value: "Decrypt a hash using rainbow tables, for example `"+prefix[msg.guild.id]+"rhash 420d97235124da5bf24c51a35edb1119f653ce09` returns the decrypt text `jared`.\n\u200B"},
		)
		embed_help_hash.setTimestamp();
		msg_channel_send(msg, embed_help_hash);
	} catch (err) {
		console_log("Error thrown in hash_help function! " + err, error=true);
	}
}

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"md4 ") {
			hash(msg, "md4");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"md5 ") {
			hash(msg, "md5");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"sha1 ") {
			hash(msg, "sha1");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"sha224 ") {
			hash(msg, "sha224");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"sha256 ") {
			hash(msg, "sha256");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"sha384 ") {
			hash(msg, "sha384");
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 8) == prefix[msg.guild.id]+"sha512 ") {
			hash(msg, "sha512");
		}
	}
})

// hash file
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"hash") {
			url = undefined;
			msg.attachments.forEach(function(attachment) {
				url = attachment.url.replace("https", "http");
			})
			
			if (url == undefined) {
				hash_help(msg);
			} else {
				try {
					// download file
					fname = msg.guild.id + "_" + parseInt(new Date().getTime() / 1000) + ".data";
					dest = server_folder_location + "videos/src/" + fname;
					download(url, dest, function(fobject) {
						// hash file
						get_md5(msg, dest, function(digest_dict) {
							// check for error
							if (digest_dict == false) {
								embed_error(msg, "Failed to hash the file, please try again! " + err);
								return false;
							}
							
							// checksums
							digest_string = "MD4: `" + digest_dict["md4"] + "`\n\u200B" +
								"MD5: `" + digest_dict["md5"] + "`\n\u200B" +
								"SHA1: `" + digest_dict["sha1"] + "`\n\u200B" +
								"SHA224: `" + digest_dict["sha224"] + "`\n\u200B" +
								"SHA256: `" + digest_dict["sha256"] + "`\n\u200B" +
								"SHA384: `" + digest_dict["sha384"] + "`\n\u200B" +
								"SHA512: `" + digest_dict["sha512"] + "`\n\u200B"
						
							// meta data
							stats = fs_append.statSync(dest);
							file_size = (stats.size/1024/1024).toFixed(1)+"MB (" + String(stats.size).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " bytes)";
						
							// delete file
							fs_write.unlink(dest, err => {
								if (err) {
									console_log("Failed to delete file! " + err, error=true);
								}
							
								// append hash to file
								data = "\n--- " + new Date().toGMTString() + " ---\n" + url.split("/")[url.split("/").length-1] + "\n" + digest_string;
								fs_append.appendFile(local_hash_log, data.replace(/`/g, ""), function(err) {
									if (err) {
										console_log("Failed to append hash to crypto.txt! " + err, error=true);
									}
								
									// embed
									embed_hash = new Discord.MessageEmbed();
									embed_hash.setColor(embed_color_chat);
									embed_hash.setTitle("Hash Info");
									embed_hash.setDescription("Below is the cryptographic information for [this]("+url+") file, SHA and MD checksums have been generated. You can also find plain text copy of the hashs [here]("+online_hash_log+").\n\u200B");
									embed_hash.addFields(
										{name: "File Name", value: url.split("/")[url.split("/").length-1] + "\n\u200B", inline: true},
										{name: "Size", value:  file_size + "\n\u200B", inline: true},
										{name: "Checksums", value: digest_string}
									)
									embed_hash.setTimestamp();
									msg_channel_send(msg, embed_hash);
								
								})
							})
						})
					})
				} catch (err) {
					console_log("An error was thrown when hasing a file! " + err, error=true);
					embed_error(msg, "Failed to hash the file, please try again!");
				}
			}
		}
	}
})

// reverse hash
function is_hex(txt) {
	for (i=0;i<txt.length;i++) {
		if ("0123456789abcdef".indexOf(txt[i]) == -1) {
			return false;
		}
	}
	return true;
}

var rhash_timeout = {};
var rhash_cooldown = 10*1000;
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7) == prefix[msg.guild.id]+"rhash " ) {
			if (rhash_timeout[msg.guild.id] == undefined) {
				rhash_timeout[msg.guild.id] = false;
			}
			
			if (rhash_timeout[msg.guild.id] == false) {
				// timeout
				rhash_timeout[msg.guild.id] = true;
				setTimeout(function(){
					rhash_timeout[msg.guild.id] = false;
				}, rhash_cooldown, msg)
				
				// reverse hash
				hash = msg.content.slice(7, msg.content.length);
				hash_lengths = {
					32 : "https://md5.gromweb.com/?md5=",
					40 : "https://sha1.gromweb.com/?hash=",
				}
				
				if (is_hex(hash) == true) {
					if (hash_lengths[hash.length] != undefined) {
						url = hash_lengths[hash.length] + hash;
						get_html(url, function(html) {
							try {
								input = html.split('<section id="section">')[1].split('<em class="long-content string">')[1].split('</em>')[0];
								description = "finds the input of a hash using a rainbow table.";
								embed_input_output_reply(msg, hash, input, "Decrypt Hash", description=description);
							} catch (err) {
								embed_error(msg, "failed to reverse hash, Hash not found!");
							}
						})
					} else {
						embed_error(msg, "Not a valid hash, please enter only an md5 or sha1 hash!");
					}
				} else {
					embed_error(msg, "Not a valid hash, please make sure your hash is in hexadecimal!");
				}
			} else {
				embed_error(msg, "Your entering hashes too fast, please wait " + (rhash_cooldown / 1000) + " seconds then try again!");
			}
		}
	}
})

// Caesar Cipher
ASCII_short = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !#$%^&*()_+-=<>,./?[]";
function shift(msg, txt, places) {
	try {
		chars = String(txt).split("");
		output = [];
		for (i=0;i<chars.length;i++) {
			if (places.indexOf('-') > -1) {
				current_chr = ((ASCII_short.indexOf(chars[i]) + ASCII_short.length) - parseInt(places.replace(/-/g,''))) % ASCII_short.length;
				if (current_chr != -1) {
					output.push(ASCII_short[current_chr]);
				}
			} else {
				current_chr = ((ASCII_short.indexOf(chars[i]) + ASCII_short.length) + parseInt(places.replace(/-/g,''))) % ASCII_short.length;
				if (current_chr != -1) {
					output.push(ASCII_short[current_chr]);
				}
			}
		}
		embed_chat_reply(msg, output.join(""));
	} catch (err) {
		console_log("Error thrown in shift function! " + err, error=true);
	}
}

// check the text is all alpha and numbers only
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"shift") {
			if (msg.guild != null && msg.content == prefix[msg.guild.id]+"shift") {
				embed_chat_reply(msg, "The syntax for the command is `"+prefix[msg.guild.id]+"shift{places} {text}` " +
				"for example `"+prefix[msg.guild.id]+"shift8 Hello World` will produce the message digest `PWttX.X6tM`, " +
				"to get back the original string we can then do `"+prefix[msg.guild.id]+"shift-8 PWttX.X6tM`");
			
			} else {
				places = msg.content.slice(6, msg.content.length).split(" ")[0];
				txt = msg.content.slice(7 + places.length, msg.content.length);				
		
				if (isInt_without_error(places.replace('-',''), 0, large_numb) == true) {
					shift(msg, txt, places);
				} else {
					embed_error(msg, "Invalid Input! the correct format is '-shift{No. places} {text}'!");
				}
			}
		}
	}
})

// solve
var solver_interval = {}
var solver_previous_hash = {};
var solver_max_tries = {};
var solver_max_tries_num = 35;
var solver_cooldown = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 7) == prefix[msg.guild.id]+"solve ") {
			// check cooldown
			if (solver_cooldown[msg.guildid] == undefined) {
				solver_cooldown[msg.guildid] = false;
			}
			
			// process file
			if (solver_cooldown[msg.guildid] == false) {
				solver_cooldown[msg.guildid] = true;
				// write user input to file
				content = msg.content.slice(7, msg.content.length);
				create_file_then_append_data_custom_path(msg, solver_filename, content, endl="", overwrite=true);
				
				// write initial message
				msg_channel_send(msg, "Thinking please wait...");
				
				/*get_md5(msg, solver_output, function(hash_dict) {
					// previous hash
					solver_previous_hash[msg.guild.id] = hash_dict.md5;
					
					// check for answer
					solver_interval[msg.guild.id] = setInterval(function() {
						// check max tries
						if (solver_max_tries[msg.guild.id] == undefined) {
							solver_max_tries[msg.guild.id] = 0;
						}
						solver_max_tries[msg.guild.id] += 1;
						if (solver_max_tries[msg.guild.id] >= solver_max_tries_num) {
							clearInterval(solver_interval[msg.guild.id]);
							embed_error(msg, "Failed to solve the equation");
							solver_cooldown[msg.guildid] = false;
						}
						
						// get hash
						get_md5(msg, solver_output, function(hash_dict) {
							current_hash = hash_dict.md5;
							if (current_hash != solver_previous_hash[msg.guild.id]) {
								// message user
								embed_image_attachment(msg, solver_output, "Equation Answer", function(object) {
									console_log("Maths equation solved successfully!");
								})
								
								// stop interval
								clearInterval(solver_interval[msg.guild.id]);
								solver_cooldown[msg.guildid] = false;
							}
						})
					}, 4000);
				})*/
				
				// check if file exists
				if (fs_read.existsSync(solver_output) == true) {
					// delete file
					fs_write.unlink(solver_output, err => {
						if (err) {
							console_log("Failed to delete the file!", error=true);
						}
					})
				}
				
				// timeout
				solver_interval[msg.guild.id] = setInterval(function() {
					// check max tries
					if (solver_max_tries[msg.guild.id] == undefined) {
						solver_max_tries[msg.guild.id] = 0;
					}
					solver_max_tries[msg.guild.id] += 1;
					
					if (solver_max_tries[msg.guild.id] >= solver_max_tries_num) {
						clearInterval(solver_interval[msg.guild.id]);
						embed_error(msg, "Failed to solve the equation");
						solver_cooldown[msg.guildid] = false;
					}
					
					// check if file exists
					if (fs_read.existsSync(solver_output) == true) {
						clearInterval(solver_interval[msg.guild.id]);
						// message user
						embed_image_attachment(msg, solver_output, "Equation Answer", function(object) {
							console_log("Maths equation solved successfully!");
							// delete the file
							setTimeout(function(){
								fs_write.unlink(solver_output, err => {
									if (err) {
										console_log("Failed to delete the file!", error=true);
									}
								})
								solver_cooldown[msg.guildid] = false;
								solver_max_tries[msg.guild.id] = 0;
							}, 4000);
						})
					}
				}, 4000);
			} else {
				embed_error(msg, "Please wait for the first equation to finish processing before trying another!");
			}
		}
	}
})

// --- levels ---
var levels = {};

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (levels[msg.guild.id] != undefined) {
			if (msg.member != null) {
				if (msg.author.bot == false) {
					if (levels[msg.guild.id][msg.member.id] == undefined) {
						levels[msg.guild.id][msg.member.id] = 1;
					} else {
						levels[msg.guild.id][msg.member.id] += 1;
					}
				}
			}
		} else {
			// add user to dict
			levels[msg.guild.id] = {};
			if (msg.member != null) {
				if (msg.author.bot == false) {
					levels[msg.guild.id][msg.member.id] = 1;
				}
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 10) == prefix[msg.guild.id]+"addscore ") {
			if (msg.member.hasPermission("BAN_MEMBERS") == true) {
				command = msg.content.slice(10, msg.content.length).split(",");
				if (command.length == 2) {
					user_id = command[0];
					msg_count = command[1];
					if (isInt(msg, user_id, 0, 10**18, "User ID", ErrorMessageEnd="") == true) {
						if (isInt(msg, msg_count, 0, 10**18, "User ID", ErrorMessageEnd="") == true) {
							// add the user
							levels[msg.guild.id][user_id] = parseInt(msg_count);
							embed_chat_reply(msg, "Added user " + user_id + " to the global dictionary!");
						}
					}
				}
			} else {
				embed_error(msg, "You don't have permission to manually add members to the scoreboard!");
			}
		}
	}
})

// write cached msg counts to file
var write_msg_log = true;
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (write_msg_log == true) {
			// timeout
			write_msg_log = false;
			setTimeout(function() {
				write_msg_log = true;
			}, write_msg_cache_timeout);
		
			// make file
			make_server_folder_file(msg, message_count_channel_file);
		
			// get directory
			server_name = get_server_name(msg);
			f_path = logging_path + "/" + server_name + "/" + message_count_channel_file;
		
			// check if file exists
			if (fs_read.existsSync(f_path) == true) {
				// read message count file
				fs_read.readFile(f_path, "utf8", function(err, data) {
					if (err) {
						return console_log("Failed to read message counts file!", error=true);
					}
				
					// format data
					current_data = {};
					file_line = data.replace(/\n/g,"").split(";");
					for (i=0;i<file_line.length;i++) {
						current_line = file_line[i].split(",");
						if (current_line.length == 2) {
							current_data[current_line[0]] = parseInt(current_line[1]);
						}
					
					}
				
					// add new counts
					current_counts = levels[msg.guild.id];
					current_count_keys = Object.keys(current_counts);
				
					for (i=0;i<current_count_keys.length;i++) {
						// add users to dict
						if (current_data[current_count_keys[i]] == undefined) {
							current_data[current_count_keys[i]] = parseInt(current_counts[current_count_keys[i]]);
						} else {
							current_data[current_count_keys[i]] += parseInt(current_counts[current_count_keys[i]]);
						}
					}
				
					// clear counts
					levels[msg.guild.id] = {};
				
					// convert dict to string
					current_keys = Object.keys(current_data);
					output = [];
					for (i=0;i<current_keys.length;i++) {
						output.push(current_keys[i] + "," + current_data[current_keys[i]] + ";");
					}
				
					// write data to file
					fs_write.writeFile(f_path, output.join("\n"), function(err) {
						if (err) {
							return console_log("Failed to write to message counts file!", error=true);
						}
					})
				})
			}
		}
	}
})

// create leaderboard
const leaderboard_row_html = `
<div class="row">
	<div class="left-colm">
		<div class="rank-div">
			<div class="#Rank_Class#">#User_Rank#</div>
		</div>
		<div class="user-avatar-div">
			<img class="user-avatar" src="#User_Avatar_URL#"></img>
		</div>
		<p class="user-name">#User_Name#</p>
	</div>
	<div class="right-colm">
		<div class="level-circle">
			<div class="lvl-cl-div">
				<span class="lvl-cl-header">Level</span>
				<span class="lvl-cl-value">#User_Level#</span>
			</div>
		</div>
		<div class="colm-cnt-msg">
			<span class="com-cnt-header">Experiance</span>
			<p class="com-cnt-value">#User_XP#</p>
		</div>
		<div class="colm-cnt-xp">
			<span class="com-cnt-header">Messages</span>
			<p class="com-cnt-value">#User_Message_Count#</p>
		</div>
	</div>
</div>
`

function sort_array(array, sublist=false) {
	try {
		// sort
		sorted = [];
		for (x=0;x<array.length;x++) {
			highest = ["", 0];
			for (i=0;i<array.length;i++) {
				current_id = array[i].split(",")[0].replace(/\D/g, "");
				current_count = array[i].split(",")[1];
				if (String(sorted).indexOf(current_id) == -1) {
					if (parseInt(current_count) > highest[1]) {
						highest = [current_id, current_count];
					}
				}
			}
			if (highest[0].length > 0) {
				sorted.push(highest);
			}
		}
	
		// convert back to string
		if (sublist == false) {
			sorted_str = [];
			for (i=0;i<sorted.length;i++) {
				sorted_str.push(sorted[i].join(","));
			}
			return sorted_str;
		} else {
			return sorted;
		}
	} catch (err) {
		console_log("Error thrown in sort_array function! " + err, error=true);
	}
}

function ab_num(n) {
	try {
		n = String(n);
		if (n.length <= 3) {
			return n;
		} else if (n.length > 3 && n.length < 6) {
			return n.slice(0, n.length-3) + "." + n.slice(n.length-3, n.length-2) + "k";
		} else if (n.length == 6) {
			return n.slice(0, n.length-3) + "k";
		} else if (n.length > 6 && n.length < 9) {
			return n.slice(0, n.length-6) + "." + n.slice(n.length-6, n.length-5) + "m";
		} else if (n.length == 9) {
			return n.slice(0, n.length-6) + "m";
		} else if (n.length > 9) {
			return "Too Big";
		}
	} catch (err) {
		console_log("Error thrown in ab_num function! " + err, error=true);
	}
}

// -- leaderboard --
// check if user is in guild
async function check_member(msg, user_ID) {
	try {
		msg.guild.members.fetch(user_ID).then(user => {
			return true;
		}).catch(error => {
			return false;
		})
	} catch (err) {
		console_log("Error thrown in check_member function! " + err, error=true);
	}
}

// leaderboard global vars
var lb_server_name = {};
var lb_f_path = {};
var lb_new_template = {};
var lb_current_members = {};
var lb_rows = {};
var lb_rows_raw = {};
var lb_current_user = {};
var lb_current_user_id = {};
var lb_current_user_msg_count = {};
var lb_current_user_lvl = {};
var lb_current_user_xp = {};
var lb_current_user_rank = {};
var lb_current_user_avatar_URL = {};
var lb_current_username = {};
var lb_current_user_row = {};
var lb_user_itterations = {};
var lb_raw_output = {};
var lb_rows_length = {};
var lb_leaderboard_path = {};
var lb_final_output = {};

var updating_leaderboard = {};
function update_leaderboad(msg) {
	try {
		// get directory
		lb_server_name[msg.guild.id] = get_server_name(msg);
		lb_f_path[msg.guild.id] = logging_path + "/" + lb_server_name[msg.guild.id] + "/" + message_count_channel_file;
		updating_leaderboard[msg.guild.id] = true;
		
		// check if file exists
		if (fs_read.existsSync(lb_f_path[msg.guild.id]) == true) {
			// read message count file
			fs_read.readFile(lb_f_path[msg.guild.id], "utf8", function(err, data_members) {
				if (err) {
					return console_log("Failed to read message counts file!", error=true);
				}
			
				// backup file
				create_file_then_append_data(msg, message_count_channel_file + ".backup.txt", data_members, endl="", overwrite=true);
			
				// backup after hour min
				if (new Date().getMinutes() == 0) {
					setTimeout(function() {
						create_file_then_append_data(msg, message_count_channel_file + ".backup1.txt", data_members, endl="", overwrite=true);
					}, 5000);
				}
			
				// read HTML template
				fs_read.readFile(local_msg_template, "utf8", function(err, data_template) {
					if (err) {
						return console_log("Failed to read message template file!", error=true);
					}
				
					lb_new_template[msg.guild.id] = data_template.replace("#Server_Name#", msg.guild.name).replace("#Server_Avatar_URL#", msg.guild.iconURL());
					
					// sort the data
					lb_current_members[msg.guild.id] = data_members.split(";");
					lb_current_members[msg.guild.id] = sort_array(lb_current_members[msg.guild.id]);
					console_log("Updating leaderboard for " + msg.guild.name + "!");
						
					// create rows
					lb_rows[msg.guild.id] = [];
					lb_rows_raw[msg.guild.id] = [];
					async function generate_rows() {
						try {
							for (lb_user_itterations[msg.guild.id]=0;lb_user_itterations[msg.guild.id]<lb_current_members[msg.guild.id].length;lb_user_itterations[msg.guild.id]++) {
								lb_current_user[msg.guild.id] = lb_current_members[msg.guild.id][lb_user_itterations[msg.guild.id]].split(",");
								lb_current_user_id[msg.guild.id] = lb_current_user[msg.guild.id][0].replace(/\D/, "");
								if (lb_current_user[msg.guild.id].length == 2) {
							
									if (true) {
										await new Promise(next => {
											// get user guild
											msg.guild.members.fetch(lb_current_user_id[msg.guild.id]).then(current_guild => {
												if (current_guild != undefined) {
													// get user info
													lb_current_user_msg_count[msg.guild.id] = lb_current_user[msg.guild.id][1];
													lb_current_user_lvl[msg.guild.id] = parseInt(parseInt(lb_current_user_msg_count[msg.guild.id]) / xp_per_level);
													lb_current_user_xp[msg.guild.id] = parseInt(lb_current_user_msg_count[msg.guild.id]) * xp_per_msg;
													lb_current_user_rank[msg.guild.id] = lb_user_itterations[msg.guild.id]+1;
													lb_current_user_avatar_URL[msg.guild.id] = current_guild.user.avatarURL();
													lb_current_username[msg.guild.id] = current_guild.user.username;
											
													// raw data
													lb_rows_raw[msg.guild.id].push([lb_current_user_id[msg.guild.id], lb_current_username[msg.guild.id], lb_current_user_rank[msg.guild.id], lb_current_user_msg_count[msg.guild.id], lb_current_user_lvl[msg.guild.id], lb_current_user_xp[msg.guild.id]]);
								
													// update row
													lb_current_user_row[msg.guild.id] = leaderboard_row_html.replace("#User_Name#", lb_current_username[msg.guild.id]);
													lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#User_Level#", lb_current_user_lvl[msg.guild.id]);
													lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#User_XP#", ab_num(lb_current_user_xp[msg.guild.id]));
													lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#User_Message_Count#", lb_current_user_msg_count[msg.guild.id].replace(/\B(?=(\d{3})+(?!\d))/g, ","));
								
													lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#User_Rank#", lb_current_user_rank[msg.guild.id]);
													lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#User_Avatar_URL#", lb_current_user_avatar_URL[msg.guild.id]);
								
													// rank colours
													if (lb_current_user_rank[msg.guild.id] == 1) {
														lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#Rank_Class#", "rank-gold");
													} else if (lb_current_user_rank[msg.guild.id] == 2) {
														lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#Rank_Class#", "rank-silver");
													} else if (lb_current_user_rank[msg.guild.id] == 3) {
														lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#Rank_Class#", "rank-bronze");
													} else {
														lb_current_user_row[msg.guild.id] = lb_current_user_row[msg.guild.id].replace("#Rank_Class#", "rank");
													}
								
													// add row to rows list
													lb_rows[msg.guild.id].push(lb_current_user_row[msg.guild.id]);
										
													// next
													next();
												}
											}).catch(error => {
												// skip to next user
												next();
											})
										})
									}
								}
							}
						} catch (err) {
							console_log("Error thrown in generate_rows function! " + err, error=true);
						}
					}
				
					// generate HTML
					generate_rows().then(() => {
						// raw leaderboard
						lb_raw_output[msg.guild.id] = [];
						lb_rows_length[msg.guild.id] = 0;
						for (i=0;i<lb_rows_raw[msg.guild.id].length;i++) {
							lb_raw_output[msg.guild.id].push(lb_rows_raw[msg.guild.id][i].join(","));
							lb_rows_length[msg.guild.id] = lb_rows_raw[msg.guild.id][i].length;
						}
					
						// write rank data
						create_file_then_append_data(msg, leaderboard_raw, lb_raw_output[msg.guild.id].join(";\n"), endl="", overwrite=true);
					
						// format data
						//server_name = msg.guild.name.replace(/ /g, "_");
						lb_leaderboard_path[msg.guild.id] = local_leaderboard_dir + "/" + lb_server_name[msg.guild.id] + ".html";
						lb_final_output[msg.guild.id] = lb_new_template[msg.guild.id].replace("#rows#", lb_rows[msg.guild.id].join("\n"));
					
						// write data
						console_log("wrote HTML to file!");
						fs_write.writeFile(lb_leaderboard_path[msg.guild.id], lb_final_output[msg.guild.id], function(err) {
							if (err) {
								return console_log("Failed to write HTML to leaderboard file!", error=true);
							}
						})
						
						// console
						console_log("updated leaderboard for " + msg.guild.name);
						setTimeout(function() {
							updating_leaderboard[msg.guild.id] = false;
						}, 5000);
					})
				})
			})
		}
	} catch (err) {
		console_log("Error thrown in update_leaderboad function! " + err, error=true);
	}
}

var leaderboard_cooldown = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 6) == prefix[msg.guild.id]+"level" || msg.content.slice(0, 12) == prefix[msg.guild.id]+"leaderboard" || 
			msg.content.slice(0, 11) == prefix[msg.guild.id]+"scoreboard" || msg.content.slice(0, 6) == prefix[msg.guild.id]+"score" || 
			msg.content.slice(0, 9) == prefix[msg.guild.id]+"messages" || msg.content.slice(0, 13) == prefix[msg.guild.id]+"messagecount") {
			// send leaderboard
			embed_chat_reply(msg, webserver_leaderboard_dir + "/" + get_server_name(msg) + ".html");
		}
	}
})

var leaderboard_intervals = {};
bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (leaderboard_intervals[msg.guild.id] == undefined) {
			leaderboard_intervals[msg.guild.id] = true;
		} else if (leaderboard_intervals[msg.guild.id] == true) {
			if (msg.content != prefix+"levels") {
				// timeout to stop leaderboard updating on every message
				leaderboard_intervals[msg.guild.id] = false;
				guild_id = msg.guild.id;
				setTimeout(function() {
					leaderboard_intervals[guild_id] = true;
				}, leader_autoupdate_timeout, guild_id);
			
				// update leaderboard
				update_leaderboad(msg);
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content == prefix[msg.guild.id]+"forceupdate") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				update_leaderboad(msg);
				console_log("Leaderboard update being forced on server! " + msg.guild.name, error=false, mod=true);
				embed_chat_reply(msg, "Leaderboard update forced!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content.slice(0, 5) == prefix[msg.guild.id]+"rank") {
			
			async function generate_rank_card(message, rank, lvl, progress, statusName, current_user_id) {
				try {
					// check for undefined
					if (msg.guild == undefined || msg.guild == null) {
						console_log("Failed to send rank card, guild is undefined!", error=true);
						return false;
					}
				
					// local file locations
					bg = server_folder_location + "img/src/web/rank/bg1.png";
					ly2 = server_folder_location + "img/src/web/rank/ly2.png";
					lvl_txt = server_folder_location + "img/src/web/rank/level_text.png";
					rank_txt = server_folder_location + "img/src/web/rank/rank_text.png";
					blank = server_folder_location + "img/src/web/rank/blank.png";
					custom_font_path = server_folder_location + "img/src/web/rank/font.fnt";
					status1 = server_folder_location + "img/src/web/rank/status/" + statusName + ".png";
				
					// web server locations
					rand_num = parseInt(Math.random() * 1000000);
					local_output_img = server_folder_location + "rank_cards/"+current_user_id+rand_num+".png";
					webserver_location = webserver_root_address + "rank_cards/"+current_user_id+rand_num+".png";
					avatar_img = message.displayAvatarURL().replace(".webp", ".png");
				
					// load images
					img_bg = await jimp.read(bg);
					img_ly2 = await jimp.read(ly2);
					img_lvl_txt = await jimp.read(lvl_txt);
					img_rank_txt = await jimp.read(rank_txt);
					img_avatar = await jimp.read(avatar_img);
					blank = await jimp.read(blank);
				
					statuso = await jimp.read(status1);
				
					// load numbers
					nums = {};
					for (i=0;i<10;i++) {
						nums[i] = await jimp.read(server_folder_location + "img/src/web/rank/nums_32/"+String(i)+".png");
					}
				
					// fonts
					font1 = await jimp.loadFont(custom_font_path);
					font2 = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
					font3 = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
				
					// add images
					await img_bg.blit(img_ly2, 15, 15).write(local_output_img);
					await img_bg.blit(img_avatar.resize(50, 50), 40, 35).write(local_output_img);
					await img_bg.blit(statuso.resize(20, 20), 72, 70).write(local_output_img);
				
					// add progress bar
					progress = String(parseInt(progress) % 30)
					if (isNaN(progress) == false && progress != undefined) {
						progress_bar = await jimp.read(server_folder_location + "img/src/web/rank/progress_bar_blue/"+progress+".png")
						await img_bg.blit(progress_bar, 90, 70).write(local_output_img);
					}
				
					// add username
					username = [message.tag.split("#")[0], message.tag.split("#")[1]];
					await img_bg.print(font2, 100, 35, username[0]).write(local_output_img);
				
					// add username numbers
					await img_bg.print(font3, (username[0].length*20)+90, 50, username[1]).write(local_output_img);
				
					// add rank
					await img_bg.blit(img_rank_txt.resize(40, 10), 210, 30).write(local_output_img);
					await img_bg.print(font2, 250, 10, "#"+String(rank)).write(local_output_img);
				
					// add level
					await img_bg.blit(img_lvl_txt.resize(40, 10), (String(rank).length*18)+265, 30).write(local_output_img);
					await img_bg.print(font2, (String(rank).length*18)+265+40, 10, String(lvl)).write(local_output_img);
				
					// send message
					if (msg.guild.me.hasPermission("ATTACH_FILES") == true) {
						msg_channel_send(msg, "\u200B", {files: [webserver_location]});
				
						// delete file
						setTimeout(function(){
							try {
								fs_write.unlink(local_output_img, (err) => {
									console_log("Failed to delete file " + local_output_img, err=true);
								})
							} catch {
								console_log("Failed to delete rank card!", err=true);
							}
						}, 5000);
					} else {
						console_log("JaredBot does not have permission to attach files on " + msg.guild.name + "!");
						embed_error("JaredBot does not have permission to attach files, please go to server settings --> roles, then " +
						"assign JaredBot the attach files role!");
					}
				} catch (err) {
					console_log("Error thrown in generate_rank_card function! " + err, error=true);
				}
			}
			
			// get directory
			server_name = get_server_name(msg);
			f_path = logging_path + "/" + server_name + "/" + leaderboard_raw;
		
			// check if file exists
			if (fs_read.existsSync(f_path) == true) {
				// read message count file
				fs_read.readFile(f_path, "utf8", function(err, data) {
					if (err) {
						return console_log("Failed to read raw leaderboard file!", error=true);
					}
					
					
					// get user
					let member = msg.mentions.members.first();
					if (member != undefined) {
						user_id = member.id;
						member_o = member.user;
						
						// check if user is bot
						if (member.bot == true) {
							embed_chat_reply(msg, "Bots don't have ranks");
							return false;
						}
					} else {
						user_id = msg.author.id;
						member_o = msg.author;
					}
					
					if (data.indexOf(user_id) > -1) {
						// format data
						current_user_data = data.split(user_id)[1].split(";")[0].split(",");
						
						// fetch member
						channel_guild = bot.channels.cache.get(msg.channel.id);
						channel_guild.guild.members.fetch(user_id).then(function(members) {
							members.guild.members.fetch(user_id).then(function(member) {
								// get info
								name = current_user_data[1];
								rank = current_user_data[2];
								msg_count = current_user_data[3];
								user_lvl = current_user_data[4];
								user_xp = current_user_data[5];
								statusName = member.user.presence.status;
								progress = parseInt((parseInt(msg_count) % xp_per_level) / 3);
								
								// generate rank card
								generate_rank_card(member_o, rank, user_lvl, progress, statusName, user_id);
								
							}).catch(error => {
								embed_chat_reply(msg, "Failed to fetch info on the requested user.");
								return false;
							})
						})
						
					} else {
						embed_error(msg, "Failed to fetch info on the requested user! they might not have sent enough messages, " +
						"could be a bot, or could be new to the server so don't have a rank yet.");
						return false;
					}
				})
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"restorebackup") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				// get directory
				server_name = get_server_name(msg);
				f_path = logging_path + "/" + server_name + "/" + message_count_channel_file + ".backup.txt";
				updating_leaderboard[msg.guild.id] = true;
		
				// check if file exists
				if (fs_read.existsSync(f_path) == true) {
					// read message count backup file
					fs_read.readFile(f_path, "utf8", function(err, data_members) {
						if (err) {
							return console_log("Failed to read file " + message_count_channel_file + "on restore backup!", error=true);
						}
			
						// write backup data to msg count
						create_file_then_append_data(msg, message_count_channel_file, data_members, endl="", overwrite=true);
						
						// clear cached messages
						levels[msg.guild.id] = {};
						
						// update leaderboard
						update_leaderboad(msg);
						
						// message user
						embed_chat_reply(msg, "Backup scoreboard restored!");
						
					})
				}
			}
		}
	}
})

// Wellcome
var welcome_channel_ids = {};
var welcome_backgrounds = [];
var welcome_asets = {};

function help_welcome(msg) {
	try {
		// embed
		embed_welcome = new Discord.MessageEmbed();
		embed_welcome.setColor(embed_color_chat);
		embed_welcome.setTitle("Welcomer Help");
		embed_welcome.setDescription("Welcomer is a feature that will automatically post a message when a user joins or leaves the server!\n\u200B");
		embed_welcome.addFields(
			{name: "Welcome", value: "`"+prefix[msg.guild.id]+"welcome` sets the channel the command is run in as the welcome channel, when users leave or join the server, a message will be automtically posted in the welcome channel.\n\u200B"},
			{name: "Clear welcome", value: "`"+prefix[msg.guild.id]+"clearwelcome` clears the welcome channel, leave/join messages will no longer be posted in the welcome channel.\n\u200B"},
			{name: "Welcome Message", value: "`"+prefix[msg.guild.id]+"welcomemessage {txt}` lets you set a custom welcome message, for example `"+prefix[msg.guild.id]+"welcomemessage Hello [user] welcome to [server] please see the #rules channel!` The [user] and [server] values will be automatically filled out.\n\u200B"},
			{name: "Clear Message", value: "`"+prefix[msg.guild.id]+"clearwelcomemessage` clears the Custom Wlecome Message text, the bot will just use the default message after running this command.\n\u200B"},
			{name: "Leave Channel", value: "`"+prefix[msg.guild.id]+"leavechannel` sets a custom leave channel, by deafult all leave messages will be posted in the welcome channel, but this command lets you set a custom leave channel so they are posted there instead.\n\u200B"},
			{name: "Clear Leave", value: "`"+prefix[msg.guild.id]+"clearleave` clears the leave channel, leave messages will no longer be posted in the custom leave channel and instead be posted in the welcome channel.\n\u200B"}
		)
		embed_welcome.setTimestamp();
		msg_channel_send(msg, embed_welcome);
	} catch (err) {
		console_log("Error thrown in help_welcome function! " + err, error=true);
	}
}

bot.on("ready", msg => {
	// update channel IDs global var
	read_file(welcome_channel_name, welcome_channel_ids, allow_non_int=false, sep="", remove_dupes=false);
	console_log("Read welcome channel IDs");
	
	// load backgrounds
	bg_location = server_folder_location + "img/src/web/welcome/backgrounds";
	
	fs_read.readdir(bg_location, (err, files) => {
		async function read_bg_files() {
			try {
				for (var i=0;i<files.length;i++) {
					await new Promise(next => {
						// load image
						fname = "bg" + ((parseInt(Math.random() * 100) % files.length)+1) + ".png";
						jimp.read(bg_location + "/" + fname).then(current_bg => {
							welcome_backgrounds.push(current_bg);
							next();
						})
					}).catch(error => {
						console_log("Failed to load background file " +i, err=error);
					})
				}
			} catch (err) {
				console_log("Error thrown in read_bg_files function! " + err, error=true);
			}
		}
		read_bg_files().then(function() {
			console_log("Loaded all welcome backgrounds!");
		})
	})
	
	// load other welcome background files
	async function load_assets() {
		try {
			welcome_asets["blank"] = await jimp.read(server_folder_location + "img/src/web/welcome/blank.png");
			welcome_asets["white"] = await jimp.read(server_folder_location + "img/src/web/welcome/white.png");
			welcome_asets["font1"] = await jimp.loadFont(jimp.FONT_SANS_32_WHITE);
			welcome_asets["font2"] = await jimp.loadFont(jimp.FONT_SANS_16_WHITE);
		} catch (err) {
			console_log("Error thrown in load_assets function! " + err, error=true);
		}
	}
	load_assets().then(function() {
		console_log("Loaded all other welcome assets!");
	})
})

// Welcome card
bot.on("guildMemberAdd", member => {
	// user info
	username = member.user.username;
	user_avatar = member.user.displayAvatarURL();
	guild_id = member.guild.id;
	
	// read channel file
	if (welcome_channel_ids[guild_id] != undefined) {
		// send message
		bot.channels.fetch(welcome_channel_ids[guild_id]).then(channel => {
			// welcome card
			async function welcome_card() {
				try {
					// read files
					img_bg = welcome_backgrounds[parseInt(Math.random() * 10) % welcome_backgrounds.length];
					user_pfp = await jimp.read(user_avatar.replace(".webp", ".png"));
				
					// locations
					rand_num = parseInt(Math.random() * 1000000);
					local_output_img = server_folder_location + "img/src/web/welcome/welcome_cards"+username.replace(/[ #]/g,"_")+rand_num+".png";
					webserver_location = server_folder_location + "img/src/web/welcome/welcome_cards"+username.replace(/[ #]/g,"_")+rand_num+".png";
				
					// add avatar
					await img_bg.blit(welcome_asets["blank"].resize(380, 140), 10, 10).write(local_output_img);
					await img_bg.blit(welcome_asets["white"].resize(84, 84), 158, 28).write(local_output_img);
					await img_bg.blit(user_pfp.resize(80, 80), 160, 30).write(local_output_img);
				
					// add text
					await img_bg.print(welcome_asets["font2"], 75, 120, username + " just joined the server!").write(local_output_img);
					
					// send message
					if (welcome_text[guild_id] != undefined && welcome_text[guild_id].length > 0) {
						message = welcome_text[guild_id].replace('[user]', username).replace('[server]', member.guild.name);
						channel.send(message, {files: [webserver_location]});
					} else {
						channel.send("Hey **"+username+"** welcome to " + member.guild.name+"!", {files: [webserver_location]});
					}
				
					// delete welcome card
					setTimeout(function(){
						try {
							fs_write.unlink(local_output_img, (err) => {
								console_log("Failed to delete welcome card file " + local_output_img, err=true);
							})
						} catch {
							console_log("Failed to delete rank card!", err=true);
						}
					}, 5000);
				} catch (err) {
					console_log("Error thrown in welcome_card function! " + err, error=true);
				}
			} welcome_card().then(function() {
				console_log("User " + username + " joined server " + guild_id, error=false, mod=true);
				
				// give user muted role
				//generate_mute_role(member.guild, member, take_action=true, doReply=false, msg_is_guild=true);
				
			});
		})
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 16) == prefix[msg.guild.id]+"welcomemessage ") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				message = msg.content.slice(16, msg.content.length);
				create_file_then_append_data(msg, custom_wellcome_filename, message, endl="", overwrite=true);
				embed_chat_reply(msg, "Custom welcome message set to `"+message+"`");
				welcome_text[msg.guild.id] = message;
			} else {
				embed_error(msg, "You dont have permission to set the welcome message, " + mod_error_text + " manage messages permission!");
			}
		} else if (msg.content == prefix[msg.guild.id]+"clearwelcomemessage") {
			if (msg.member.hasPermission("MANAGE_MESSAGES") == true) {
				create_file_then_append_data(msg, custom_wellcome_filename, "", endl="", overwrite=true);
				embed_chat_reply(msg, "Clearned custom welcome message, the server will now use the default welcome message!");
				welcome_text[msg.guild.id] = "";
			} else {
				embed_error(msg, "You dont have permission to set the welcome message, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

var welcome_text = {};
var leave_channels = {};
bot.on("ready", msg => {
	read_file(custom_wellcome_filename, welcome_text, allow_non_int=true, sep="\u200B", remove_dupes=false, single_item=true);
	read_file(leave_channel_name, leave_channels, allow_non_int=true, sep="\u200B", remove_dupes=false, single_item=false);
})

// Leave
bot.on("guildMemberRemove", member => {
	// read channel file
	username = member.user.username;
	guild_id = member.guild.id;
	
	if (leave_channels[guild_id] != undefined && leave_channels[guild_id].length > 0) {
		// send message
		bot.channels.fetch(leave_channels[guild_id][0]).then(channel => {
			channel.send("**"+username + "** just left the server!").catch(err => {
				console_log("Failed to send message! " + err, error=true);
			})
			console_log(username + " just left the server " + guild_id, err=false, mod=true);
			
		}).catch (error => {
			console_log("error raised when user left server! " + error, err=true);
		})
	} else if (welcome_channel_ids[guild_id] != undefined) {
		// send message
		bot.channels.fetch(welcome_channel_ids[guild_id]).then(channel => {
			channel.send("**"+username + "** just left the server!").catch(err => {
				console_log("Failed to send message! " + err, error=true);
			})
			console_log(username + " just left the server " + guild_id, err=false, mod=true);
			
		}).catch (error => {
			console_log("error raised when user left server!", err=true);
		})
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"leavechannel") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				create_file_then_append_data(msg, leave_channel_name, msg.channel.id, endl="", overwrite=true);
				embed_chat_reply(msg, "leave messages will now be posted in " + msg.channel.name + " when a user leaves the server!");
				console_log("Leave channel set for server " + msg.guild.name + "!", error=false, mod=true);
				leave_channels[msg.guild.id] = msg.channel.id;
				
			} else {
				embed_error(msg, "You dont have permission to set the leave channel, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"clearleave") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				// clear file
				clear_file(msg, leave_channel_name);
				leave_channels[msg.guild.id] = undefined;
				
				// message user
				embed_chat_reply(msg, "Leave file cleared!");
				
			} else {
				embed_error(msg, "You dont have permission to set the leave channel, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"welcome") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				create_file_then_append_data(msg, welcome_channel_name, msg.channel.id, endl="", overwrite=true);
				embed_chat_reply(msg, "welcome messages will now be posted in " + msg.channel.name + " when a user joins the server!");
				console_log("Welcome channel set for server " + msg.guild.name + "!", error=false, mod=true);
			} else {
				embed_error(msg, "You dont have permission to set the welcome channel, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.guild != null && msg.content == prefix[msg.guild.id]+"clearwelcome") {
			if (msg.member.hasPermission("MANAGE_CHANNELS") == true) {
				// clear file
				clear_file(msg, welcome_channel_name);
				
				// message user
				embed_chat_reply(msg, "Welcome file cleared!");
			} else {
				embed_error(msg, "You dont have permission to set the welcome channel, " + mod_error_text + " manage messages permission!");
			}
		}
	}
})

// send message when bot is added to server (join server)
bot.on("guildCreate", guild => {
	try {
		// check for undefined
		if (guild == undefined || guild == null) {
			return false;
		}
	
		// find text channel
		console_log("JaredBot joined server " + guild.name, error=false, mod=true);
		first_channel = "";
		guild.channels.cache.forEach(channel => {
			if (channel.type == "text" && first_channel == "") {
				if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
					first_channel = channel;
				}
			}
		})
	
		first_time_join[guild.id] = true;
	
		// embed
		embed_join = new Discord.MessageEmbed();
		embed_join.setColor(embed_color_chat);
		embed_join.setTitle("Welcome");
		embed_join.setDescription("Thanks for adding JaredBot to your server, the default prefix for the bot is `"+prefix[msg.guild.id]+"` (you can change this with `"+prefix[msg.guild.id]+"prefix`), "+
		"you can type `"+prefix[msg.guild.id]+"help` for a list of commands! Below are some recommendations on features to setup for your server.\n\u200B");
		embed_join.setThumbnail(lion_profile_pic);
		embed_join.setAuthor("JaredBot", lion_profile_pic);
		embed_join.addFields(
			{name: "AutoMod", value: "Setup JaredBot to automatically warn, mute, kick, and ban users who break the rules (anti-raid protection) type `"+prefix[msg.guild.id]+"help automod` for more info.\n\u200B"},
			{name: "Content Filters", value: "Setup contenting filtering to automatically remove, bad language, phishing, porn links, promotions, and spam. type `"+prefix[msg.guild.id]+"help filter` for more info.\n\u200B"},
			{name: "Welcomer", value: "set a welcome channel for your server, type `"+prefix[msg.guild.id]+"help welcome` for more info.\n\u200B"},
			{name: "Autopost", value: "setup JaredBot to automatically posts images in a channel, type `"+prefix[msg.guild.id]+"help autopost` for more info.\n\u200B"},
		)
		embed_join.setTimestamp();
		first_channel.send(embed_join).catch(err => {
			console_log("Failed to send message to new server! " + err, error=true);
		});
	} catch (err) {
		console_log("Error thrown when joining server, failed to display welcome screen! " + err, error=true);
	}
})

first_time_join = {};
bot.on("message", msg => {
	if (msg.guild != null) {
		if (first_time_join[msg.guild.id] == true) {
			first_time_join[msg.guild.id] = false;
			
			try {
				// authorise server
				authorise_server(msg, reply=false);
				console_log("Authorised server " +  guild.id, error=false, mod=true);
				
				// prefix
				create_file_then_append_data(msg, custom_prefix_filename, "-", endl="", overwrite=true);
	
				// generate msg count files
				update_leaderboad(msg);
				console_log("Generating leaderboard files!");
		
				// generate mute role
				console_log("Generating mute roles on server "+msg.guild.name+"!", error=false, mod=true);
				generate_mute_role(msg, msg.member, take_action=false, doReply=false).then(function() {
					console_log("Finished generating mute and invisible roles on "+msg.guild.name+"!", error=false, mod=true);
				}).catch(error => {
					console_log("Failed to generate mute and invisible roles on "+msg.guild.name+"!");
				})
			
				// update leaderboard
				update_leaderboad(msg);
				
			} catch (err) {
				console_log("Error was thrown when bot joined server! " + err, error=true);
			}
		}
	}
})

// map command
var global_cities = [];
var global_countries = [];
bot.on("ready", msg => {
	fs_read.readFile(dataset_cities, "utf8", function(err, data) {
		if (err) {
			return console_log("Failed to read file", error=true);
		}
		global_cities = data.toLowerCase().split("\n");
		console_log("Read cities dataset!");
	});
	fs_read.readFile(dataset_countries, "utf8", function(err, data) {
		if (err) {
			return console_log("Failed to read file", error=true);
		}
		global_countries = data.toLowerCase().split("\n");
		console_log("Read countries dataset!");
	});
})

bot.on("message", msg => {
	if (msg.guild != null && authrosied_server_IDs.indexOf(msg.guild.id) > -1) {
		if (msg.content.slice(0, 5) == prefix[msg.guild.id]+"map ") {
			command = msg.content.slice(5, msg.content.length).toLowerCase();
			// countries
			for (i=0;i<global_countries.length;i++) {
				if (global_countries[i].indexOf(command) > -1) {
					full_path = webserver_country_dataset + "/" + encodeURI(global_countries[i].slice(0, -1)) + ".png";
					embed_image(msg, full_path, command, guild="msg", header="");
					return true;
				}
			}
			
			// cities
			for (i=0;i<global_cities.length;i++) {
				if (global_cities[i].indexOf(command) > -1) {
					full_path = webserver_cities_dataset + "/" + encodeURI(global_cities[i].slice(0, -1)) + ".png";
					embed_image(msg, full_path, command, guild="msg", header="");
					return true;
				}
			}
			embed_error(msg, "Failed to find city!");
		}
	}
})

bot.on("error", error => {
	console_log("An error was thrown somewhere in the code! " + err, error=true);
})

