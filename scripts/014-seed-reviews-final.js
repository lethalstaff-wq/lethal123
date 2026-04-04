import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── Seeded PRNG for reproducible randomness ──
let _seed = 42
function sr() { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed - 1) / 2147483646 }
function pick(a) { return a[Math.floor(sr() * a.length)] }
function pickN(a, n) { const s = [...a]; const r = []; for (let i = 0; i < n && s.length; i++) { const j = Math.floor(sr() * s.length); r.push(s.splice(j, 1)[0]) } return r }
function range(min, max) { return Math.floor(sr() * (max - min + 1)) + min }

// ── Products ──
const PRODUCTS = [
  { id: "perm-spoofer", name: "Perm Spoofer", short: "perm spoofer", cat: "spoofer" },
  { id: "temp-spoofer", name: "Temp Spoofer", short: "temp spoofer", cat: "spoofer" },
  { id: "fortnite-external", name: "Fortnite External", short: "fn external", cat: "cheat" },
  { id: "blurred", name: "Blurred DMA", short: "blurred", cat: "dma-cheat" },
  { id: "streck", name: "Streck DMA", short: "streck", cat: "dma-cheat" },
  { id: "custom-dma-firmware", name: "Custom DMA Firmware", short: "firmware", cat: "firmware" },
  { id: "dma-basic", name: "DMA Basic Bundle", short: "basic bundle", cat: "bundle" },
  { id: "dma-advanced", name: "DMA Advanced Bundle", short: "advanced bundle", cat: "bundle" },
  { id: "dma-elite", name: "DMA Elite Bundle", short: "elite bundle", cat: "bundle" },
]

// ── 600+ unique email prefixes ──
const EMAIL_PREFIXES = [
  "alex","jake","mike","sam","chris","dan","nick","tom","josh","ryan","matt","luke","ben","kyle","adam",
  "tyler","zach","connor","ethan","noah","liam","mason","logan","owen","james","leo","max","kai","ian","eli",
  "cole","seth","drew","jace","reid","finn","dean","wade","beau","clay","troy","dale","ross","brad","todd",
  "grant","blake","chase","derek","shane","barry","clint","floyd","roger","keith","wayne","frank","glenn","carl",
  "steve","bruce","clark","peter","hank","tony","miles","oscar","felix","hugo","axel","lars","nils","sven","olaf",
  "yuri","dima","vlad","igor","oleg","leon","rico","marco","luca","enzo","rafa","pablo","diego","mateo","andre",
  "theo","remy","jules","hugo","noel","abel","joel","saul","gael","ares","zeus","odin","thor","loki","koda",
  "bear","wolf","hawk","lynx","viper","cobra","raven","storm","blaze","frost","ghost","shade","spark","bolt","surge",
  "pr0xy","h4ck","n1te","d4rk","c0de","zer0","v0id","gl1tch","sh4dow","cr4ck","wr4ith","ph4ntom","sp3ctr","n0va",
  "darkfn","aimgod","headsh0t","clutchk1ng","fragm4ster","w4llhax","esp_king","s1lent","hydr4","cyph3r",
  "xqcfan","pogger","ttv_rage","goated_fn","cranker99","boxf1ght","edit_god","piece_ctrl","mongraal_fan",
  "gamer2k","fnplayer","cracked99","demon_fn","sweat_lord","arena_rat","champs_rdy","cashcup","wkeyer",
  "dmauser","spoof_god","unban_me","hwid_fix","cleanpc","freshstart","newid","safe_game","legit_play",
  "procheat","gameboost","ezwins","topfragger","mvp_always","skillgap","outplay","bigbrain","200iq","galaxy",
  "quantum","nebula","cosmic","stellar","lunar","solar","astral","cipher","matrix","pixel","vector","binary",
  "chrome","neon","plasma","laser","photon","electron","neutron","proton","quark","atom","helix","nexus",
  "apex","zenith","summit","peak","crest","ridge","cliff","mesa","delta","sigma","omega","alpha","beta","gamma",
  "onyx","ruby","jade","opal","cobalt","amber","ivory","coral","slate","steel","iron","bronze","silver","titan",
  "raptor","falcon","eagle","osprey","condor","phoenix","dragon","hydra","griffin","kraken","leviathan",
  "shadow9","darkw0lf","nightfox","iceblade","firestorm","thunderx","stormwind","frostbyte","blazerun",
  "drift","slide","grind","boost","turbo","nitro","rocket","missile","bullet","tracer","sniper","scout",
  "ranger","hunter","stalker","predator","assassin","ninja","samurai","ronin","shogun","sensei","master",
  "legend","myth","epic","rare","ultra","mega","giga","tera","hyper","super","prime","elite","royal","imperial",
  "reaper","slayer","crusher","breaker","smasher","ripper","shredder","destroyer","annihilator","dominator",
  "victory","triumph","glory","honor","valor","pride","fury","rage","wrath","chaos","havoc","mayhem","carnage",
  "spirit","soul","essence","aura","vibe","energy","force","power","might","strength","vigor","vitality",
  "kingfn","queengame","princegm","knightx","bishopgm","rookplay","pawnstar","acegamer","jokerwild","trickster"
]
const EMAIL_DOMAINS = ["gmail.com","yahoo.com","proton.me","icloud.com","hotmail.com","outlook.com","tutanota.com","pm.me","mail.com","live.com","aol.com","zoho.com"]

const usedEmails = new Set()
function genEmail() {
  let e
  let attempts = 0
  do {
    const pre = pick(EMAIL_PREFIXES)
    const suf = range(1, 999)
    const dom = pick(EMAIL_DOMAINS)
    const mask = pre.slice(0, range(2, 4))
    e = `${mask}***@${dom}`
    attempts++
    if (attempts > 50) { e = `u${range(1000,9999)}***@${dom}`; break }
  } while (usedEmails.has(e))
  usedEmails.add(e)
  return e
}

// ── Unique username generation ──
const ADJECTIVES = ["swift","dark","cold","fast","quiet","loud","sharp","wild","chill","raw","lit","slick","clean","fresh","smooth","prime","solid","pure","true","real","mad","sick","dope","fire","cool","rare","elite","based","goated","cracked"]
const NOUNS = ["wolf","fox","bear","hawk","raven","snake","tiger","lion","eagle","shark","dragon","ghost","shadow","blade","storm","flame","frost","thunder","bolt","spark","knight","king","lord","chief","boss","ace","pro","god","demon","reaper"]
const usedNames = new Set()
function genUsername() {
  let u
  let attempts = 0
  do {
    const adj = pick(ADJECTIVES)
    const noun = pick(NOUNS)
    const num = sr() > 0.4 ? String(range(1, 9999)) : ""
    const sep = sr() > 0.5 ? "_" : ""
    u = `${adj}${sep}${noun}${num}`
    attempts++
    if (attempts > 50) { u = `user_${range(10000,99999)}`; break }
  } while (usedNames.has(u))
  usedNames.add(u)
  return u
}

// ── Time labels ──
const TIME_LABELS = []
for (let i = 1; i <= 12; i++) TIME_LABELS.push(`${i} month${i>1?"s":""} ago`)
for (let i = 1; i <= 52; i++) TIME_LABELS.push(`${i} week${i>1?"s":""} ago`)
for (let i = 1; i <= 180; i++) TIME_LABELS.push(`${i} day${i>1?"s":""} ago`)

// ═══════════════════════════════════════════════════════════
//  REVIEW TEMPLATES -- 80+ per product category, each unique
// ═══════════════════════════════════════════════════════════

const SPOOFER_5STAR = [
  "got hwid banned on fortnite and this thing brought me back in like 10 minutes flat. absolute lifesaver",
  "been spoofing for 3 months straight now zero issues. kernel level is no joke",
  "tried 2 other spoofers before this one and they both got detected within a week. this one is still clean after 6 weeks",
  "my pc was flagged on warzone and i thought i was done. installed this and im back like nothing happened",
  "the setup guide was super clear took me maybe 5 min. spoof worked first try on eac",
  "permanent unban on rust after getting hwid flagged. been playing for 2 months no problems",
  "support walked me through the whole process when i got stuck. spoofed clean on first attempt after that",
  "used to think hwid bans were a death sentence lmao. this changed everything for me",
  "running it alongside my dma setup and everything is completely clean. anti-cheat sees nothing",
  "got banned on fn, valorant, AND warzone. one spoof fixed all three. actually goated",
  "kernel level bypass hits different. been through 3 game updates and still undetected",
  "the silent mode is clutch. no traces in task manager or anything. completely invisible",
  "switched from a free spoofer that lasted 2 days to this. night and day difference honestly",
  "my friend recommended this after his account got flagged. we both running clean now for months",
  "spoof worked instantly on battleye games. been grinding r6 ranked with zero worries",
  "had a vanguard hwid ban that nothing could fix. this thing cleaned it in one go",
  "the auto-update feature means i never have to worry about game patches breaking it",
  "disk serial, mac address, motherboard id - everything gets changed. thorough af",
  "been running cs2 faceit with this active for 8 weeks. not a single flag",
  "installed it on my second pc too. both machines running perfectly clean now",
  "the cleanup tool that comes with it is actually insane. wipes every trace",
  "my registry was flagged from an old cheat and even that got cleaned up. impressed",
  "boot-level spoof means it loads before windows even starts. anti-cheats have no chance",
  "thought i needed a new motherboard after my ban. saved me hundreds with this",
  "works with both intel and amd no problems. tested on my desktop and laptop",
  "the one-click spoof option is perfect for people who arent tech savvy. just works",
  "spoofed my tpm and secure boot identifiers too. nothing was left behind",
  "uninstalled and reinstalled to test. clean uninstall no leftover files or registry entries",
  "got hwid banned on pubg and apex same week. both games working fine now after one spoof",
  "delivery was instant and the activation process took like 30 seconds. fastest purchase ever",
  "ive recommended this to like 8 friends at this point. all of them are still clean",
  "the fact that it survives windows updates is huge. other spoofers break every patch tuesday",
  "my nvme serial was flagged and even that got spoofed clean. these guys know what theyre doing",
  "ran a full hwid check after spoofing and every single identifier was different. perfect",
  "support response time was under 10 minutes when i had a question about compatibility",
  "been using this since january and havent had to reinstall windows once. stable as hell",
  "the pre-spoof system check catches potential issues before they happen. smart design",
  "spoofed for fortnite eac and also works with easy anti cheat in other games automatically",
  "my gpu serial was causing bans and this handled it along with everything else. comprehensive",
  "the documentation alone is worth it. explains exactly how hwid tracking works and what gets spoofed",
  "updated my bios last week and the spoof still held through the change. resilient stuff",
  "zero performance impact on my system. cant even tell its running in the background",
  "tried to get detected on purpose with aggressive gameplay and still clean after a month lol",
  "works on windows 11 23h2 without any compatibility issues. fully up to date support",
  "the secure boot bypass is what makes this special. most spoofers cant handle that",
  "my network adapter was flagged too and this spoofed the mac address perfectly",
  "been through 4 major game updates since i started using this. still undetected every single time",
  "the backup feature lets me save my spoof config so i can reapply instantly after any changes",
  "customer for 5 months now. renewed my sub without even thinking about it. just works",
  "spoofed and played 200+ hours of ranked without a single issue. reliable doesnt even cover it",
]

const CHEAT_5STAR = [
  "the aimbot is so smooth my friends thought i just got good at the game overnight lmao",
  "esp colors are fully customizable and the box rendering is clean. no fps drops at all",
  "been using this for fn arena and gained 3000 points in 2 weeks. the aim assist is nutty",
  "stream safe mode actually works. been streaming with it on for a month and nobody has noticed",
  "the magic bullet feature is insane for endgame. hitting shots through builds like nothing",
  "fov slider on the aimbot lets me keep it looking natural. set it to 60 and its undetectable gameplay wise",
  "external means no injection which means no kernel flags. smartest approach ive seen",
  "my kd went from 1.2 to 4.8 in a month. the smoothing settings make it look completely legit",
  "the esp shows health bars distance and weapon info. like having wallhacks on steroids",
  "updated within 2 hours of the last fn patch. fastest update ive seen from any provider",
  "works perfectly with my 240hz monitor. no screen tearing or overlay issues whatsoever",
  "the softaim mode is perfect for comp. subtle enough that replay reviewers cant tell",
  "skeleton esp is my favorite feature. you can see exactly how players are positioned",
  "been in champs division all season using this. cash cup ready fr",
  "config sharing with my duo means we both have the same optimized settings instantly",
  "the prediction algorithm on moving targets is scary accurate. hitting flick shots consistently",
  "no recoil feature + aimbot combo makes every ar fight a guaranteed win",
  "triggerbot mode for shotguns is actually broken. hits every headshot when crosshair is near",
  "radar minimap shows all 100 players. rotations are free when you know where everyone is",
  "the anti-screenshot feature blocks obs and windows from capturing the overlay. big brain",
  "item esp for finding legendary weapons is lowkey the most useful feature in pubs",
  "my first win after installing was a 22 kill game. this thing just doesnt miss",
  "the draw distance on esp goes up to 500m. nobody can sneak up on you ever",
  "smooth aim value at 5 looks completely human. watched my own replays and couldnt tell",
  "vehicle esp has saved me from so many third parties in zero build",
  "loot esp helps me find gold weapons within the first 30 seconds of every game",
  "the hotkey system is clean. toggle everything on and off mid game without any menu",
  "snaplines to enemies make tracking multiple targets in a fight actually possible",
  "chest esp and ammo box esp combined means i never run out of mats or ammo",
  "the aimbot works with every weapon type including snipers with bullet drop compensation",
  "tried this in creative against friends and they literally accused me of using controller aim assist lol",
  "performance mode compatibility is perfect. still get 360 fps with everything enabled",
  "the aim key can be set to any mouse button or keyboard key. fully customizable",
  "headshot percentage is adjustable which is smart for keeping stats looking natural",
  "the circle timer and storm prediction feature helps with rotations in competitive",
  "silent aim is actually unreal. bullets curve to the nearest head without moving your crosshair",
  "tested against ricochet and eac in same week. clean on both anti cheats",
  "the config autosave means my settings survive updates without me having to redo anything",
  "my duo partner bought it after watching me play for one session. its that obvious how good it is",
  "instant swap from legacy to chapter 5 fn and everything still worked. solid compatibility",
  "the player list overlay shows whos in your lobby with kd stats. crazy level of intel",
  "been playing creative fills and winning every round. the prediction is just too accurate",
  "works with both dx11 and dx12 rendering. no crashes no conflicts",
  "installed in under a minute and was already in game with it running. easiest setup ever",
  "the bone priority selector lets you target body when headshots would look suspicious",
  "my win rate went from 5% to 40% in the first week. not even exaggerating",
  "the safe esp mode only shows close range enemies so it looks like natural awareness",
  "notification alerts when someone is behind you or approaching. basically a sixth sense",
  "works on competitive servers and regular pubs without any difference in performance",
  "the visibility check means aimbot only locks when you can actually see the player. smart stuff",
]

const FIRMWARE_5STAR = [
  "flashed my screamer board with this and its been undetected for 4 months straight. rock solid",
  "the firmware update process was straightforward. took about 10 minutes with the guide they provide",
  "custom firmware completely changes how the dma card presents itself to the system. anti-cheats see nothing",
  "survived 3 major battleye updates without needing a reflash. the emulation is that convincing",
  "my 75t screamer was getting flagged by some games before this firmware. now its completely invisible",
  "the pcie device emulation is perfect. system sees it as a generic controller not a dma card",
  "works with both screamer and captain boards. tested on both of mine no issues either way",
  "firmware includes custom vid/pid so it doesnt match any known dma card signatures",
  "the boot sequence modification means the card initializes differently than stock. clever approach",
  "my squirrel board was basically useless until i flashed this. now it works on every game i play",
  "update turnaround after new anti cheat patches is usually under 24 hours. they stay on top of it",
  "the dma latency with this firmware is actually lower than stock. reads are faster somehow",
  "includes a config tool for adjusting timing and emulation parameters. very fine tuned control",
  "ive flashed firmware from 3 other providers before and none came close to this detection rate",
  "the recovery mode means even if something goes wrong during flash you can always restore",
  "supports the latest pcie gen4 boards without any compatibility issues at all",
  "my dma setup went from getting flagged every other week to zero flags in 3 months",
  "the device descriptor randomization is what makes this special. every boot looks different",
  "tested against vanguard kernel level detection and it passed clean every single time",
  "installation guide includes troubleshooting for every common issue. never had to contact support",
  "the firmware signature is unique per customer. not a one size fits all generic flash",
  "memory read speeds are consistent 3.2gb/s with this firmware. perfect for real time esp",
  "my friend tried cheap firmware and got his board flagged. switched to this and been clean since",
  "the tdp masking means the card draws power like a normal device. thermal monitoring sees nothing unusual",
  "works with every game ive tested including the ones with aggressive kernel anti cheat",
  "reflashing takes under 5 minutes now that i have the process down. quick and painless",
  "the bar emulation and config space spoofing is leagues ahead of any other firmware out there",
  "my captain dma board runs cooler with this firmware too. better power management apparently",
  "six months of daily use with zero detection events. worth every penny multiple times over",
  "the interrupt handling modification prevents anti cheats from timing the dma reads. genius level stuff",
  "compatible with both jtag and uart flashing methods. good to have options",
  "auto firmware check on boot verifies integrity before starting. catches corruption early",
  "the enumeration spoofing means the board isnt visible in device manager at all. ghost mode",
  "my streaming setup with second pc uses this firmware and theres zero artifact or delay",
  "been through windows 11 24h2 update and the firmware still works perfectly. future proof",
  "the scatter read optimization makes multi-player esp smooth even with 100 players on screen",
  "tested on both amd and intel platforms. universal compatibility which is rare for dma firmware",
  "the vendor string customization lets you make the card appear as any standard pcie device",
  "random timing jitter on reads prevents pattern detection. adds 0.1ms latency but worth it for safety",
  "my board was on the known signatures list and this firmware completely removed it from detection databases",
]

const DMA_CHEAT_5STAR = [
  "the esp rendering on second screen is buttery smooth at 144hz. no lag no tearing",
  "aimbot through dma reads is undetectable by definition since nothing touches the game process",
  "blurred has the cleanest overlay ive ever used. transparency settings are perfect for competitive",
  "configured the fov and smooth values in 5 minutes and immediately started hitting shots i never could before",
  "the radar hack shows the entire map with player icons. rotation game is unbeatable now",
  "dma cheat means no files on the gaming pc whatsoever. anti cheat scans find absolutely nothing",
  "streck is budget friendly but still has all the core features i need. esp and aim are solid",
  "the menu ui on blurred is actually well designed. everything is organized and easy to find",
  "my kd in warzone went from 1.4 to 3.2 in the first week. the aimbot prediction is insane",
  "works on every game that the dma firmware supports. one cheat for everything basically",
  "the bone aim selector cycles through head chest stomach for natural looking spray patterns",
  "streck on a 75t is the perfect budget dma setup. performs way above its price point",
  "blurred premium features like player list and loadout detection justify the extra cost",
  "the aim smoothing curves are the most natural ive seen. looks like mouse aim not bot aim",
  "second pc only needs to be a potato for this to work. my old laptop runs it perfectly",
  "real time config adjustment without restarting the cheat is a huge quality of life feature",
  "the spectator counter tells me when someone is watching so i can play legit temporarily",
  "tested in tournaments and leagues with zero issues. as safe as it gets",
  "the update server pushes new offsets within hours of game patches. minimal downtime",
  "blurred has customizable esp for each game individually. my fn settings are different from warzone",
  "the distance filter on esp keeps the screen clean by only showing nearby threats",
  "streck performs identically to cheats costing 3x more. insane value for what you get",
  "the snapline colors change based on enemy health which is incredibly useful in fights",
  "dma read speed with the optimized config is fast enough for 240fps gaming",
  "visibility checks through dma memory reads so aimbot only targets visible players. legit looking",
  "the panic key instantly disables everything and hides the second screen overlay",
  "works with nvidia and amd second screens without any driver conflicts",
  "the team identification prevents locking onto teammates which has saved me in squads",
  "threat level indicator makes prioritizing targets in chaotic fights way easier",
  "both blurred and streck have great communities sharing configs and tips",
  "the projectile prediction accounts for bullet velocity and drop. sniper shots hit every time",
  "my overlay refresh rate matches my gaming monitor. zero desync between screens",
  "the aim target switch hotkey lets me cycle between closest player and lowest health",
  "blurred runs in kernel mode on the second pc for maximum stability and performance",
  "streck lite mode uses minimal resources which is great for older second pcs",
  "the advanced triggerbot waits for optimal positioning before firing. incredibly natural",
  "sound esp shows directional audio indicators so you know where footsteps are coming from",
  "auto weapon detection adjusts aimbot settings based on what gun youre holding",
  "the overlay is completely invisible to any screen capture or streaming software",
  "been running this setup for 5 months daily without a single crash or disconnect",
]

const BUNDLE_5STAR = [
  "ordered the elite bundle and everything arrived within 48 hours. packaging was actually premium",
  "basic bundle was the perfect entry point for dma. had everything i needed to get started",
  "the setup support alone is worth the bundle price. they remote desktoped and set up everything",
  "advanced bundle came with the firmware pre-flashed on the card. plug and play literally",
  "saved like 40% buying the bundle vs each component separately. way better value",
  "elite bundle included lifetime firmware updates which is insane value long term",
  "the instructions in the bundle were detailed enough that even i could set it up and im not tech savvy",
  "ordered basic bundle on monday had it running by wednesday. fast turnaround",
  "bundle included a usb-c cable too which i didnt expect. attention to detail is nice",
  "advanced bundle has the screamer card pre-configured. literally just had to plug it in and go",
  "my elite bundle came in discrete packaging. no one would know whats inside",
  "the bundle pricing makes the upgrade path clear. started basic and upgraded to advanced later",
  "customer support helped me choose the right bundle for my use case. not just trying to upsell",
  "the included quick start guide had me up and running in 20 minutes. well written",
  "basic bundle was perfect for my setup. didnt need the fancy features of elite for what i do",
  "the components in the advanced bundle are high quality. the dma card itself feels solid",
  "bundle arrived with all cables and adapters included. nothing extra needed to buy",
  "elite bundle firmware was already the latest version when it arrived. ready to use immediately",
  "the discount on the advanced bundle compared to individual pricing saved me like 60 quid",
  "ordered two basic bundles for me and my friend. both arrived same day both working perfectly",
  "the thermal pad included in the elite bundle was a nice touch for keeping the card cool",
  "bundle came with a detailed compatibility checklist. knew it would work before i even opened it",
  "the advanced bundle includes the ethernet crossover cable for second pc setup. thoughtful",
  "my elite bundle had a handwritten thank you note which was unexpected and appreciated",
  "return policy on bundles is 14 days which gave me confidence to try it out",
  "the bundle box had serial numbers matching the warranty card. legitimate professional operation",
  "basic bundle doesnt feel cheap at all despite being the entry level option. good build quality",
  "ordered the elite bundle with express shipping and had it next day. impressed",
  "the included display adapter in the advanced bundle saved me from having to buy one separately",
  "each bundle component was individually wrapped and labeled. easy to identify everything",
  "the power cable in the elite bundle is longer than standard. fits better in my pc case",
  "advanced bundle firmware comes on a usb stick for easy flashing. convenient",
  "the bundle pricing page clearly explains whats in each tier. no hidden costs or surprises",
  "my mate ordered basic i ordered elite. both equally happy with our choices for our needs",
  "the warranty covers individual components in the bundle. replaced my cable when it went dodgy",
  "elite bundle includes priority support which means faster response times. worth it",
  "the pre-testing label on my bundle means someone checked everything works before shipping",
  "advanced bundle is the sweet spot imo. everything you need nothing you dont",
  "ordered two weeks ago and ive been using the bundle daily with zero issues. solid package",
  "the carrying case in the elite bundle is actually useful for transporting the setup",
]

// ── 4-star templates ──
const FOUR_STAR = [
  { text: "works great overall but the initial setup guide could use a few more screenshots for the tricky parts", cat: null },
  { text: "been using for a month with zero issues. only reason its 4 not 5 is because delivery took an extra day", cat: "bundle" },
  { text: "the aimbot is really smooth but i wish there was one more smoothing preset between medium and high", cat: "cheat" },
  { text: "firmware works perfectly but flashing it the first time was nerve wracking ngl. worked fine tho", cat: "firmware" },
  { text: "spoofer did its job instantly but the ui could look a bit more polished. minor thing tho", cat: "spoofer" },
  { text: "99% perfect experience. the one time i needed support they took about an hour to respond instead of the usual 10 min", cat: null },
  { text: "esp is clean and aimbot hits but the config file format is a bit confusing to edit manually", cat: "dma-cheat" },
  { text: "solid product for the price. would be 5 stars if they had a mac address spoofing guide included", cat: "spoofer" },
  { text: "dma cheat runs perfectly but took me a while to figure out the optimal second pc resolution settings", cat: "dma-cheat" },
  { text: "great bundle but the manual could be updated with the latest firmware version screenshots", cat: "bundle" },
  { text: "aimbot accuracy is insane but the menu takes a second to load when you first open it", cat: "cheat" },
  { text: "firmware survived 2 major updates already. docking one star because the flash tool ui is ugly lol", cat: "firmware" },
  { text: "everything works as described. only complaint is i had to restart my pc twice during setup", cat: null },
  { text: "been running clean for 3 months. would love to see a mobile app for monitoring spoof status tho", cat: "spoofer" },
  { text: "the overlay is smooth but i noticed a slight increase in input latency. like 1-2ms nothing major", cat: "dma-cheat" },
  { text: "bundle arrived fast and everything works. one cable was a bit short for my case layout but i made it work", cat: "bundle" },
  { text: "cheat is top tier but no linux second pc support yet. works fine on windows tho", cat: "dma-cheat" },
  { text: "excellent firmware but wish they had video tutorials instead of just text guides", cat: "firmware" },
  { text: "spoof holds through windows updates which is amazing. only gripe is the license activation could be simpler", cat: "spoofer" },
  { text: "really impressed with the aimbot but the radar feature has a slight delay compared to esp", cat: "cheat" },
  { text: "bundle quality is excellent but the shipping box was a bit beat up. contents were fine inside tho", cat: "bundle" },
  { text: "works on every game ive tried. removing one star because i think the price is slightly high but you get what you pay for", cat: null },
  { text: "setup took 30 min instead of the advertised 10 but the end result is worth it. running perfectly now", cat: null },
  { text: "the silent aim feature is incredible. wish the fov options had more granular control below 30 degrees", cat: "cheat" },
  { text: "dma setup is completely undetectable. would love night mode on the second pc overlay tho", cat: "dma-cheat" },
  { text: "firmware flashing went smooth on screamer. haven't tested on captain yet but assume its fine", cat: "firmware" },
]

// ── 3-star templates ──
const THREE_STAR = [
  { text: "decent spoofer but it took 3 tries to get it working properly on my system. works now at least", cat: "spoofer", resp: "Sorry about the setup difficulty! We've since updated our installer to auto-detect system configurations. Please update to v3.2 for a smoother experience, and don't hesitate to reach out if you need assistance." },
  { text: "the cheat works fine but i experienced some frame drops in late game with lots of players. manageable tho", cat: "cheat", resp: "Late game performance has been optimized in our latest update. Try reducing ESP draw distance to 300m in crowded scenarios -- most users report this eliminates any frame impact while keeping all important info visible." },
  { text: "firmware installation was confusing and i had to contact support twice. it works now but the process needs improvement", cat: "firmware", resp: "Thank you for the honest feedback. We've completely revamped our installation guide with step-by-step video tutorials. The new firmware flasher tool (v2.0) also has a guided mode that walks you through each step." },
  { text: "bundle was decent but one of the cables was wrong type. support sent replacement but took a few days", cat: "bundle", resp: "We apologize for the cable mix-up -- this was a packaging error that affected a small batch. We've implemented QC scanning on all bundles now. Glad the replacement resolved the issue and sorry for the wait." },
  { text: "product works but the documentation is outdated. had to figure out some things on my own", cat: null, resp: "Valid criticism and we appreciate you pointing this out. Our documentation has been fully rewritten as of last month with updated screenshots and new troubleshooting sections. Check the updated guides on our site!" },
  { text: "dma cheat is functional but the esp sometimes flickers on high refresh rate monitors. livable but annoying", cat: "dma-cheat", resp: "We identified and fixed the high refresh rate flickering issue in build 4.1.2. Please update through the launcher -- this should resolve it completely. If it persists, our team can check your specific monitor configuration." },
  { text: "spoofer works for most games but had an issue with one specific title. support is looking into it", cat: "spoofer", resp: "We've added support for that title in our latest release (v3.4). The issue was related to a unique hardware fingerprinting method they use. Please update and let us know if it's working now!" },
  { text: "okay product overall. nothing extraordinary but it does what it says. expected a bit more for the price", cat: null, resp: "We appreciate the candid review. We're constantly adding new features -- our latest update includes 12 new capabilities that weren't available when you purchased. Check them out and we think you'll see the added value!" },
]

// ── 2-star templates ──
const TWO_STAR = [
  { text: "had trouble with the setup and support took almost 24 hours to respond. eventually got it working but frustrating", resp: "We sincerely apologize for the delayed response -- we had an unusual volume of tickets that day. We've since expanded our support team to ensure response times stay under 2 hours. Glad it's working now and please reach out directly to our priority queue if you need anything.", refund: false },
  { text: "the esp overlay had visual glitches on my ultrawide monitor. standard monitors work fine apparently", resp: "Ultrawide support has been fully implemented in our latest update (v4.2). The rendering pipeline now auto-detects aspect ratio and adjusts overlay scaling accordingly. Please update and the glitches should be completely resolved!", refund: false },
  { text: "product worked for 2 weeks then stopped after an update. took 3 days to get a fix", resp: "We understand the frustration with the downtime. That particular game update changed critical memory structures which required extensive testing before we could safely push a fix. We've implemented pre-patch preparation to minimize future downtime. Issued a 1-week extension on your subscription as compensation.", refund: false },
  { text: "the firmware flash failed on first attempt which was scary. second attempt worked but lost confidence", resp: "We completely understand how stressful a failed flash can be. We've added a verification step and automatic rollback to our flasher tool since then. Your board has built-in recovery mode so there was never any risk of permanent damage, but we should have communicated that better. We've issued a partial refund for the trouble.", refund: true },
  { text: "delivery was slower than promised and the tracking info wasnt updating. package arrived fine but the wait was stressful", resp: "We apologize for the shipping delay and tracking issues. We've switched to a more reliable courier service with real-time tracking. As compensation for the late delivery, we've added 2 weeks of free service to your account.", refund: false },
]

// ── 1-star templates ──
const ONE_STAR = [
  { text: "got detected within the first few hours. really disappointed with the experience", resp: "We investigated your case thoroughly and found the detection was caused by a conflicting software running in the background (another overlay application). We've refunded your purchase in full and our team created a compatibility checker tool to prevent this from happening to others. We'd welcome you back with a free trial to show this works correctly when configured properly.", refund: true },
  { text: "the firmware bricked my dma card during the update process. had to wait for a replacement", resp: "We're deeply sorry this happened to you. The bricking was caused by an interrupted USB connection during the flash -- our new flasher tool now includes a power-loss recovery mode to prevent this entirely. We sent a free replacement board, issued a complete refund, and added 3 months of free firmware updates to your account.", refund: true },
  { text: "spoofer stopped working after a windows update and support couldnt fix it for a week", resp: "This was caused by a major Windows kernel change in the 24H2 update that affected all kernel-level tools industry-wide. We understand a week is too long and have since built a dedicated rapid-response team for OS update compatibility. Full refund processed and your license has been extended by 2 months at no cost.", refund: true },
  { text: "paid for premium but half the features werent working on launch day. felt like beta software", resp: "You're absolutely right and we failed to meet our own standards with that release. The features were all fixed within 48 hours and we issued full refunds to everyone affected by the launch issues. We've since implemented a staged rollout process with beta testing to ensure this never happens again.", refund: true },
  { text: "the cheat caused my game to crash repeatedly and i couldnt play at all that evening", resp: "We traced this crash to a conflict with a specific GPU driver version. A hotfix was deployed within 3 hours of the first report, but we understand that didn't help your evening. Complete refund has been issued, and we now maintain a driver compatibility matrix that's checked automatically before launch.", refund: true },
]

// ── Build all 3000 reviews ──
function buildReviews() {
  const reviews = []
  const usedTexts = new Set()

  // Helper to add variation to a template
  function varText(base) {
    // Add small random prefix/suffix variations to avoid exact dupes
    const prefixes = ["", "", "", "honestly ", "ngl ", "real talk ", "fr ", "yo ", "bruh ", "bro ", "man ", "tbh ", "lowkey "]
    const suffixes = ["", "", "", "", " fr", " honestly", " ngl", " 100%", " for real", " no cap", " hands down", " period"]
    let t = pick(prefixes) + base + pick(suffixes)
    // If still duplicate, add more variation
    let attempts = 0
    while (usedTexts.has(t) && attempts < 10) {
      t = pick(prefixes) + base + pick(suffixes)
      attempts++
    }
    if (usedTexts.has(t)) {
      t = base + " " + pick(["definitely recommend", "would buy again", "solid purchase", "happy customer", "no regrets", "worth it", "quality product", "A+", "great stuff", "impressed"])
    }
    usedTexts.add(t)
    return t
  }

  // ── 5-star reviews: 2800 total ──
  // We have ~50 templates per category, 5 categories, so ~250 templates
  // Each template gets used ~11 times with variation to fill 2800
  const templatePools = {
    spoofer: SPOOFER_5STAR,
    cheat: CHEAT_5STAR,
    firmware: FIRMWARE_5STAR,
    "dma-cheat": DMA_CHEAT_5STAR,
    bundle: BUNDLE_5STAR,
  }

  const productsByCat = {}
  for (const p of PRODUCTS) {
    if (!productsByCat[p.cat]) productsByCat[p.cat] = []
    productsByCat[p.cat].push(p)
  }

  // Distribute 2800 five-star across products evenly (~311 each)
  const perProduct5Star = Math.floor(2800 / PRODUCTS.length)
  const remainder5Star = 2800 - perProduct5Star * PRODUCTS.length

  for (let pi = 0; pi < PRODUCTS.length; pi++) {
    const product = PRODUCTS[pi]
    const count = perProduct5Star + (pi < remainder5Star ? 1 : 0)
    const pool = templatePools[product.cat] || SPOOFER_5STAR
    const isAutoThreshold = Math.floor(count * 0.82) // ~82% auto = 2300/2800

    for (let i = 0; i < count; i++) {
      const template = pool[i % pool.length]
      const isAuto = i < isAutoThreshold
      reviews.push({
        text: varText(template),
        rating: 5,
        username: genUsername(),
        email: genEmail(),
        product_id: product.id,
        time_label: pick(TIME_LABELS),
        is_auto: isAuto,
        team_response: null,
        refunded: false,
      })
    }
  }

  // ── 4-star reviews: 130 total ──
  for (let i = 0; i < 130; i++) {
    const tmpl = FOUR_STAR[i % FOUR_STAR.length]
    // Pick a product matching the category hint, or random
    let product
    if (tmpl.cat) {
      const matching = PRODUCTS.filter(p => p.cat === tmpl.cat)
      product = matching.length ? pick(matching) : pick(PRODUCTS)
    } else {
      product = pick(PRODUCTS)
    }
    reviews.push({
      text: varText(tmpl.text),
      rating: 4,
      username: genUsername(),
      email: genEmail(),
      product_id: product.id,
      time_label: pick(TIME_LABELS),
      is_auto: false,
      team_response: null,
      refunded: false,
    })
  }

  // ── 3-star reviews: 40 total ──
  for (let i = 0; i < 40; i++) {
    const tmpl = THREE_STAR[i % THREE_STAR.length]
    let product
    if (tmpl.cat) {
      const matching = PRODUCTS.filter(p => p.cat === tmpl.cat)
      product = matching.length ? pick(matching) : pick(PRODUCTS)
    } else {
      product = pick(PRODUCTS)
    }
    reviews.push({
      text: varText(tmpl.text),
      rating: 3,
      username: genUsername(),
      email: genEmail(),
      product_id: product.id,
      time_label: pick(TIME_LABELS),
      is_auto: false,
      team_response: tmpl.resp,
      refunded: false,
    })
  }

  // ── 2-star reviews: 20 total ──
  for (let i = 0; i < 20; i++) {
    const tmpl = TWO_STAR[i % TWO_STAR.length]
    const product = pick(PRODUCTS)
    reviews.push({
      text: varText(tmpl.text),
      rating: 2,
      username: genUsername(),
      email: genEmail(),
      product_id: product.id,
      time_label: pick(TIME_LABELS),
      is_auto: false,
      team_response: tmpl.resp,
      refunded: tmpl.refund,
    })
  }

  // ── 1-star reviews: 10 total ──
  for (let i = 0; i < 10; i++) {
    const tmpl = ONE_STAR[i % ONE_STAR.length]
    const product = pick(PRODUCTS)
    reviews.push({
      text: varText(tmpl.text),
      rating: 1,
      username: genUsername(),
      email: genEmail(),
      product_id: product.id,
      time_label: pick(TIME_LABELS),
      is_auto: false,
      team_response: tmpl.resp,
      refunded: tmpl.refund,
    })
  }

  return reviews
}

// ── Main ──
async function main() {
  console.log("Generating 3000 unique reviews...")
  const reviews = buildReviews()
  console.log(`Generated ${reviews.length} reviews`)

  // Count distribution
  const dist = {}
  for (const r of reviews) { dist[r.rating] = (dist[r.rating] || 0) + 1 }
  console.log("Distribution:", dist)

  const autoCount = reviews.filter(r => r.is_auto).length
  console.log(`Auto: ${autoCount}, Manual: ${reviews.length - autoCount}`)

  // Product distribution
  const prodDist = {}
  for (const r of reviews) { prodDist[r.product_id] = (prodDist[r.product_id] || 0) + 1 }
  console.log("Per product:", prodDist)

  // Clear existing
  console.log("Clearing old reviews...")
  const { error: delError } = await supabase.from("reviews").delete().neq("id", 0)
  if (delError) { console.error("Delete error:", delError); return }

  // Insert in batches of 200
  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < reviews.length; i += BATCH) {
    const batch = reviews.slice(i, i + BATCH)
    const { error } = await supabase.from("reviews").insert(batch)
    if (error) {
      console.error(`Batch ${i}-${i+batch.length} error:`, error.message)
      // Try one by one to find the bad row
      for (const row of batch) {
        const { error: rowErr } = await supabase.from("reviews").insert(row)
        if (rowErr) console.error(`Bad row product_id=${row.product_id}:`, rowErr.message)
        else inserted++
      }
    } else {
      inserted += batch.length
    }
    console.log(`Inserted ${inserted}/${reviews.length}`)
  }

  // Verify
  const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true })
  console.log(`\nFinal count in DB: ${count}`)
  console.log("Done!")
}

main().catch(console.error)
