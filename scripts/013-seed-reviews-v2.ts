import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) { console.error("Missing env vars"); process.exit(1) }
const db = createClient(supabaseUrl, supabaseKey)

// ── Seeded random ──
let _s = 777
function sr() { _s = (_s * 48271 + 0) % 2147483647; return (_s & 0x7fffffff) / 0x7fffffff }
function pick(a) { return a[Math.floor(sr() * a.length)] }
function shuffle(a) { const s = [...a]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(sr() * (i + 1)); [s[i], s[j]] = [s[j], s[i]] }; return s }

// ── Products ──
const PRODUCTS = {
  "perm-spoofer": { name: "Perm Spoofer", cat: "spoofer" },
  "temp-spoofer": { name: "Temp Spoofer", cat: "spoofer" },
  "fortnite-external": { name: "Fortnite External", cat: "cheat" },
  "blurred": { name: "Blurred DMA Cheat", cat: "cheat" },
  "streck": { name: "Streck DMA Cheat", cat: "cheat" },
  "custom-dma-firmware": { name: "Custom DMA Firmware", cat: "firmware" },
  "dma-basic": { name: "DMA Basic Bundle", cat: "bundle" },
  "dma-advanced": { name: "DMA Advanced Bundle", cat: "bundle" },
  "dma-elite": { name: "DMA Elite Bundle", cat: "bundle" },
}
const pids = Object.keys(PRODUCTS)

// ── Usernames ──
const pre = ["dark","xo","zz","sk","fn","ez","tt","gg","nrg","vibe","pro","lit","dma","goat","ace","ice","kai","max","zap","neo","ray","jax","fox","hex","pix","ryn","blz","crx","flx","hyp","lvl","vrx","wrp","kz","vx","rx","zk","dx","mx","jx","tx","nx","qx","sx","bx","nova","riot","fury","apex","void","blk","ash","cryo","omni","flux","zen","arc","ink","coda","lynx","onyx","byte","nuke","vex","orb","ion","rift","aura","jinx","myth","sage","warp","grim","lux","shade"]
const suf = ["sniper","king","lord","kid","player","gamer","beast","wolf","hawk","yt","ttv","fn","69","420","xx","zz","360","v2","xd","gg","pro","x","z","wrld","szn","vibes","mode","wave","ctrl","zone","sync","star","fire","bolt","rush","hz","kd","fps","cfg","exe","ow2","val","cs2","aim","crack","dev","mod","src","ops","hq","lab","io"]
const doms = ["gmail.com","gmail.com","gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com","proton.me"]

const usedNames = new Set()
function makeUser() {
  let u = ""
  for (let i = 0; i < 50; i++) {
    u = `${pick(pre)}${pick(suf)}${Math.floor(sr() * 9999)}`
    if (!usedNames.has(u)) break
  }
  usedNames.add(u)
  return { username: u, email: `${u}@${pick(doms)}` }
}

const times = [
  "just now","1 min ago","2 min ago","3 min ago","5 min ago","7 min ago","9 min ago","11 min ago","14 min ago","18 min ago","22 min ago","27 min ago","33 min ago","40 min ago","48 min ago",
  "1 hour ago","1 hour ago","2 hours ago","2 hours ago","3 hours ago","4 hours ago","5 hours ago","6 hours ago","7 hours ago","8 hours ago","9 hours ago","10 hours ago","12 hours ago","14 hours ago","16 hours ago","18 hours ago","20 hours ago","22 hours ago",
  "1 day ago","1 day ago","2 days ago","2 days ago","3 days ago","3 days ago","4 days ago","5 days ago","6 days ago",
  "1 week ago","1 week ago","1 week ago","2 weeks ago","2 weeks ago","3 weeks ago","3 weeks ago",
  "1 month ago","1 month ago","1 month ago","2 months ago","2 months ago","3 months ago","4 months ago","5 months ago","6 months ago"
]

// ═══════════════════════════════════════════════
// 5-STAR REVIEW TEMPLATES - ~40 per product category = massive variety
// The {name} placeholder gets replaced with the actual product name
// ═══════════════════════════════════════════════

const r5_spoofer = [
  "been hwid banned on 3 accounts and {name} cleared them all in under 2 minutes, genuinely insane",
  "{name} is hands down the best spoofer ive ever used, unban worked first try no issues",
  "tried like 4 different spoofers before this and {name} is the only one that actually works consistently",
  "got banned mid game, ran {name} and was back playing within 5 minutes, absolute lifesaver",
  "{name} saved my entire setup, was about to buy a new pc but this spoofed everything clean",
  "my hwid ban was permanent and {name} reversed it instantly, best money ive ever spent",
  "literally zero issues with {name}, ran it once and all my bans gone, back to gaming",
  "support helped me set up {name} perfectly, unban worked on the first attempt",
  "was skeptical at first but {name} actually delivered, all traces cleaned from my system",
  "used {name} after getting banned from multiple games, every single one unbanned now",
  "the fact that {name} works on every anti cheat is crazy, havent had a single issue",
  "{name} is so easy to use even my friend who knows nothing about computers got it working",
  "bought {name} expecting it to be mid but holy it actually works perfectly lmao",
  "permanent hwid ban on fortnite cleared with {name} in literally 60 seconds",
  "every other spoofer got detected within a week, {name} has been working for months now",
  "ran {name} and it cleaned everything, even stuff i didnt know was flagged on my system",
  "got ip banned and hwid banned at the same time, {name} fixed both instantly",
  "{name} is the real deal, tested it on 3 different pcs and works flawlessly every time",
  "the spoof is so deep that even after multiple game updates {name} still holds strong",
  "my buddy recommended {name} after he got unbanned and yeah it works exactly as advertised",
  "customer support walked me through the whole {name} setup in discord, unbanned in 10 min",
  "i was about to give up gaming entirely until i found {name}, literally brought me back",
  "{name} cleared my hardware fingerprint completely, no flags on any new accounts",
  "used to get instant bans on new accounts until {name} fixed my machine, now zero issues",
  "{name} worked on eac vanguard and battleye all at once, incredible software",
  "the speed of {name} is insane, i expected it to take hours but it was done in minutes",
  "been using {name} for 6 months with zero issues, never got re-flagged once",
  "my main account was banned for 2 years and {name} got me back on it, im speechless",
  "fastest spoofer ive ever used, {name} had me unbanned before i finished my coffee",
  "ran {name} on my laptop too and it worked just as well, no difference between systems",
  "super clean interface on {name}, one click and everything is spoofed properly",
  "the amount of serials and identifiers that {name} spoofs is way more than competitors",
  "my entire friend group uses {name} now after they saw how fast it unbanned me",
  "{name} even cleaned my registry entries that other spoofers left behind, thorough af",
  "never writing a review but {name} deserves it, this thing genuinely saved my gaming career",
  "bought {name} at 3am in a panic after getting banned and it worked instantly lol",
  "the permanent spoof actually sticks unlike other tools where you have to redo it constantly",
  "updated my bios and everything and still no reban after using {name}, its the real deal",
  "{name} spoofed things i didnt even know anti cheats were tracking, thats how thorough it is",
  "went from being hardware banned on every game to playing normally thanks to {name}",
]

const r5_cheat = [
  "{name} aimbot is the smoothest ive ever used, looks completely legit even in killcams",
  "the esp on {name} is insanely clean, no flickering no lag just perfect visual info",
  "been using {name} for months and zero detections, anti cheat updates dont even phase it",
  "{name} configs are insane out of the box, didnt even need to adjust anything",
  "my kd went from 1.2 to 4.8 with {name} and nobody suspects anything because its so smooth",
  "the bone aimbot on {name} locks on so naturally, even spectators cant tell",
  "{name} radar hack alone is worth the price, complete game awareness at all times",
  "just started using {name} and already dropped 30 kills my first game lmfao",
  "the smoothness settings on {name} aimbot are so granular you can make it look 100% legit",
  "every feature on {name} works exactly as described, no broken stuff no bugs",
  "updated within hours of the new anti cheat patch, {name} team doesnt sleep i swear",
  "{name} aim assist is crazy, its like having controller aim assist but on keyboard and mouse",
  "the box esp on {name} is my favorite, clean outlines that dont clutter the screen",
  "been through so many cheats and {name} is the only one that never let me down",
  "trigger bot on {name} is insane, the reaction time settings make it look so human",
  "{name} runs perfectly in the background, zero fps drop on my mid range pc",
  "the magic bullet feature on {name} is hilarious, people have no idea whats happening",
  "used {name} in scrims and nobody noticed, thats how good the legitimacy settings are",
  "{name} dma bypass is flawless, anti cheat literally cant see it running",
  "my squad all uses {name} now and we win every tournament we enter lol",
  "the item esp on {name} shows everything, loot chests ammo boxes everything highlighted",
  "prediction on {name} aimbot is so accurate it hits moving targets at any range",
  "installed {name} in 5 minutes with the guide they sent me, easiest setup ever",
  "{name} has the best fov slider ive ever seen, the circle preview makes it so easy to tune",
  "the silent aim on {name} is unreal, bullets just find their target without visible snapping",
  "no screen tear no stuttering {name} runs like butter even during intense fights",
  "customized my {name} config to look completely legit and ive been running it for weeks",
  "{name} stream proof mode actually works, streamed for 3 hours and overlay was invisible",
  "the aimbot humanization on {name} is next level, adds slight overcorrection like real aim",
  "every game update they patch {name} within hours, never been offline for more than a day",
  "my friend bought {name} after watching me play and thought i was just cracked lmao",
  "{name} skeleton esp is my go to, can see exactly how enemies are positioned behind walls",
  "the distance tags on {name} esp are so helpful for planning engagements",
  "ran {name} through 3 major anti cheat updates without a single detection, its built different",
  "the auto fire feature on {name} times shots perfectly for max damage headshots",
  "dropped a 40 bomb my first game with {name}, my teammates thought i was hacking wait",
  "{name} is worth every penny, the amount of features you get for the price is unmatched",
  "color esp on {name} lets me customize everything, enemies are red teammates are blue",
  "snapline feature on {name} points right to enemies, never get surprised again",
  "the recoil control on {name} makes every gun a laser beam, zero spray pattern to learn",
]

const r5_firmware = [
  "{name} made my dma card completely invisible to any anti cheat, absolute game changer",
  "flashed {name} in under 10 minutes with the guide, board works perfectly now",
  "my dma setup was getting detected until i installed {name}, now its fully stealth",
  "the custom fpga config in {name} spoofs every identifier perfectly, not a single flag",
  "{name} is the reason my dma cheat has been undetected for 6 months straight",
  "flashing process for {name} was scary but support walked me through it step by step",
  "after installing {name} my dma board looks like a generic usb controller to the system",
  "{name} spoofs vendor id device id serial number everything, truly comprehensive",
  "been through 3 anti cheat updates since flashing {name} and zero detection",
  "the emulation on {name} is so good that even hardware enumeration tools see a fake device",
  "my screamer board was getting flagged instantly until {name} fixed the signatures",
  "{name} includes a recovery mode so even if something goes wrong you can reflash safely",
  "support team helped me flash {name} over a discord call, they knew exactly what to do",
  "the read speeds after flashing {name} are actually better than stock firmware",
  "every firmware update from lethal gets pushed automatically, always staying ahead of detections",
  "compared {name} to other firmware providers and the depth of spoofing is unmatched",
  "my 75t was detected by vanguard until i flashed {name}, now its completely invisible",
  "{name} works with screamer boards squirrel boards and every major dma platform",
  "the pcie id spoofing on {name} is perfect, shows up as a realtek audio controller lol",
  "bought a used dma board that was flagged and {name} made it brand new again",
  "zero fps impact after flashing {name}, my dma reads are just as fast as before",
  "{name} firmware updates come out before anti cheat updates even go live sometimes",
  "the documentation for {name} is incredibly detailed, flashed it myself first try",
  "{name} makes your dma card look like standard motherboard hardware to the os",
  "after {name} my vanguard stopped throwing errors completely, its like the card doesnt exist",
  "flashed {name} on two different boards and both work flawlessly with no trace",
  "the scatter read pattern on {name} prevents any timing based detection methods",
  "{name} changed my pcie bar sizes so the card matches a legitimate device perfectly",
  "honestly {name} is the most important part of any dma setup, without it youre exposed",
  "my eac ban wave immunity is entirely thanks to {name}, cant recommend it enough",
]

const r5_bundle = [
  "{name} arrived fast and everything was set up within an hour, incredible value",
  "the whole {name} package works together seamlessly, firmware cheat and spoofer all pre configured",
  "got my {name} delivered and the team helped me install everything via discord call",
  "{name} saved me hundreds compared to buying everything separately, best deal in the scene",
  "every component in the {name} is top tier quality, no cheap knockoff hardware",
  "the fact that {name} comes pre flashed with custom firmware is a massive time saver",
  "my {name} setup has been running for 4 months now without a single issue or detection",
  "{name} comes with lifetime firmware updates which is insane at this price point",
  "ordered {name} on monday received it wednesday, super fast shipping for hardware",
  "the cable management in {name} is clean, everything routes properly inside my case",
  "{name} included detailed setup instructions plus video walkthrough, couldnt be easier",
  "was nervous about dma hardware but {name} made the whole process simple",
  "the performance of the {name} hardware is better than i expected for the price bracket",
  "support configured my {name} remotely and tested everything before i even had to ask",
  "{name} bundle is the perfect entry point into dma gaming, everything just works",
  "upgraded from basic to {name} and the difference in features and stability is massive",
  "the card included in {name} has better read speeds than some standalone boards ive tested",
  "every piece of hardware in the {name} is individually tested before shipping which is rare",
  "my {name} came double boxed with anti static bags, they actually care about the hardware",
  "the pre loaded configs in {name} worked perfectly out of the box on fortnite and warzone",
  "got {name} as a gift for my brother and hes been gaming undetected ever since",
  "{name} customer service is 10/10, they stayed on call until everything was running",
  "compared prices and {name} is easily the best value for a complete dma setup",
  "the elite tier {name} comes with priority support which has been incredibly responsive",
  "returned my old hardware setup and bought {name} instead, leagues better in every way",
  "my {name} survived a windows update a bios flash and a driver reset all still undetected",
  "the included spoofer in {name} is the same premium one they sell standalone, no cut corners",
  "setup took 45 minutes total with the {name} video guide, easiest hardware install ever",
  "everything in the {name} is compatible with each other perfectly, no conflicts no crashes",
  "been recommending {name} to everyone in my discord server, 12 people bought it so far",
]

// ═══════════════════════════════════════════════
// VARIATION PATTERNS - make each review unique
// ═══════════════════════════════════════════════

const openers = [
  "","","","","","","","","","","","","","","","","","","","",
  "yo ","bro ","ngl ","honestly ","fr ","deadass ","lowkey ","bruh ","real talk ","no cap ",
  "listen ","yooo ","man ","okay so ","update: ","alright ","holy ","damn ","lets go ","w ","big w ","huge w ",
]
const closers = [
  "","","","","","","","","","","","","","","","","","","","",
  " 10/10"," W"," huge W"," no complaints"," love it"," goated"," legendary"," chef's kiss"," worth every cent"," massive W",
  " will buy again"," S tier"," top tier"," built different"," unmatched"," perfection"," insane value"," elite",
  " best purchase ever"," absolutely cracked"," never going back"," changed my life"," fire"," W product"," straight heat",
]

function variate(base, productName) {
  let t = base.replace(/\{name\}/g, productName)
  t = pick(openers) + t + pick(closers)
  // Randomly uppercase first letter or not
  if (sr() > 0.3) t = t.charAt(0).toUpperCase() + t.slice(1)
  return t
}

// ═══════════════════════════════════════════════
// 4-STAR, 3-STAR, 2-STAR, 1-STAR TEMPLATES
// ═══════════════════════════════════════════════

const r4_all = [
  { t: "really solid product overall, the only minor thing is the initial setup took a bit longer than expected. once running its perfect", resp: null },
  { t: "great quality and works exactly as described. took off one star because shipping could be slightly faster but thats about it", resp: null },
  { t: "aimbot is incredible but i wish there were a few more customization options for the esp colors. still amazing though", resp: null },
  { t: "works perfectly on every game ive tried. only reason for 4 stars is the config menu could be more intuitive for beginners", resp: null },
  { t: "been using this for 3 weeks with zero issues. slightly steep price but you absolutely get what you pay for", resp: null },
  { t: "customer support is great but had to wait about 30 minutes for my ticket to be picked up. product itself is flawless", resp: null },
  { t: "everything works exactly as promised. would be 5 stars if the documentation was a bit more detailed for first timers", resp: null },
  { t: "the software is amazing and undetected but the installer could use a cleaner UI. minor cosmetic thing honestly", resp: null },
  { t: "super happy with my purchase. only nitpick is that updates occasionally require a manual restart which is a small inconvenience", resp: null },
  { t: "quality is top notch and delivery was fast. giving 4 stars because i had a small config issue that support resolved quickly", resp: null },
  { t: "phenomenal product that does exactly what it says. would give 5 but the file size is a bit large for what it is", resp: null },
  { t: "works great on fortnite and warzone. deducting one star because it took me two tries to get the initial setup right", resp: null },
  { t: "performance is excellent, no fps drops at all. only thing i wish is that there was a mac version available too", resp: null },
]

const r3_all = [
  { t: "decent product but took me a while to configure properly. once set up it works well though. average experience overall", resp: "We appreciate the honest feedback! We've since added a video setup guide that walks through every step. Let us know if you'd like assistance optimizing your config -- we're happy to help!" },
  { t: "works okay but ive seen better from competitors at a similar price point. not bad just not mind blowing", resp: "Thanks for the feedback. We'd love to know which specific features you felt were lacking -- we're always improving and your input helps shape future updates!" },
  { t: "had some lag issues during the first few days but it seems to have stabilized after the latest update", resp: "The performance issue was resolved in patch 2.4.1. If you experience any further lag, please reach out and we'll optimize your settings personally!" },
  { t: "setup was confusing without the video guide but once i found it everything went smoothly from there", resp: "We've updated our setup process to include the video guide link directly in the download. Sorry for the initial confusion and glad it works well now!" },
  { t: "product is fine but i expected more features based on the description. what it does do it does well", resp: "We hear you! Several new features are being added in the next update based on community feedback. Stay tuned for the changelog!" },
  { t: "mixed feelings. the core functionality is solid but had a few minor bugs that needed support intervention", resp: "Thank you for reaching out to support -- those bugs were patched within 24 hours of your report. We take every issue seriously!" },
  { t: "delivery was fast but the initial config didnt work on my system. support helped but it took a couple hours", resp: "We apologize for the compatibility issue. We've since added automatic system detection to prevent this. Your patience is appreciated!" },
]

const r2_all = [
  { t: "had some detection issues initially which was frustrating. support resolved it but it shouldnt have happened", resp: "We sincerely apologize for this experience. This was caused by a rare driver conflict that has been permanently fixed in the latest update. We've issued a credit to your account as compensation.", refund: true },
  { t: "product works but the setup process was way too complicated for what it should be", resp: "We completely understand your frustration. We've overhauled our setup wizard to be much simpler -- it's now a one-click install process. We'd love for you to give it another try!", refund: false },
  { t: "decent when it works but ive had to reconfigure it twice after game updates", resp: "We apologize for the inconvenience. We've implemented auto-updating configs that adjust automatically after game patches. A partial refund has been processed for the trouble.", refund: true },
  { t: "expected better performance based on the price. its okay but not amazing", resp: "We value your honest feedback. We've optimized our core engine significantly since your purchase. Please update to the latest version -- the performance improvement is substantial!", refund: false },
]

const r1_all = [
  { t: "got detected on first day which was really disappointing", resp: "We deeply apologize for this experience. After investigating, this was caused by an outdated config that slipped through our QA process. We've issued a full refund and implemented additional testing to prevent this from happening again. You're welcome to try again at no cost.", refund: true },
  { t: "installation completely failed and had to reinstall windows", resp: "We are extremely sorry for this serious issue. This was traced to a rare UEFI conflict that we've since patched. A full refund has been issued and we've sent you a replacement license. Our senior tech will personally assist with your setup if you'd like to try again.", refund: true },
  { t: "doesnt work as advertised and support took forever to respond", resp: "We sincerely apologize for both the product issue and the slow support response. We've since expanded our support team to ensure sub-15-minute response times. A full refund has been processed and we'd love the opportunity to make this right.", refund: true },
]

// ═══════════════════════════════════════════════
// BUILD EXACTLY 3000 REVIEWS
// Distribution: 2800 five-star (2300 auto + 500 manual), 130 four-star, 40 three-star, 20 two-star, 10 one-star
// ═══════════════════════════════════════════════

function buildReviews() {
  const reviews = []
  const templateMap = {}
  for (const pid of pids) {
    const cat = PRODUCTS[pid].cat
    if (cat === "spoofer") templateMap[pid] = r5_spoofer
    else if (cat === "cheat") templateMap[pid] = r5_cheat
    else if (cat === "firmware") templateMap[pid] = r5_firmware
    else templateMap[pid] = r5_bundle
  }

  // --- 2800 five-star reviews ---
  // Distribute evenly: ~311 per product (311*9=2799, +1)
  const perProduct5 = Math.floor(2800 / pids.length)
  let remaining5 = 2800 - perProduct5 * pids.length

  for (const pid of pids) {
    const count = perProduct5 + (remaining5-- > 0 ? 1 : 0)
    const templates = templateMap[pid]
    const autoCount = Math.round(count * (2300 / 2800))  // proportional auto
    for (let i = 0; i < count; i++) {
      const tpl = templates[i % templates.length]
      const { username, email } = makeUser()
      reviews.push({
        text: variate(tpl, PRODUCTS[pid].name),
        rating: 5,
        username,
        email,
        product_id: pid,
        time_label: pick(times),
        is_auto: i < autoCount,
        team_response: null,
        refunded: false,
      })
    }
  }

  // --- 130 four-star reviews, spread across products ---
  const perProduct4 = Math.floor(130 / pids.length)
  let remaining4 = 130 - perProduct4 * pids.length
  for (const pid of pids) {
    const count = perProduct4 + (remaining4-- > 0 ? 1 : 0)
    for (let i = 0; i < count; i++) {
      const tpl = r4_all[i % r4_all.length]
      const { username, email } = makeUser()
      reviews.push({
        text: variate(tpl.t, PRODUCTS[pid].name),
        rating: 4,
        username,
        email,
        product_id: pid,
        time_label: pick(times),
        is_auto: false,
        team_response: tpl.resp,
        refunded: false,
      })
    }
  }

  // --- 40 three-star reviews ---
  const perProduct3 = Math.floor(40 / pids.length)
  let remaining3 = 40 - perProduct3 * pids.length
  for (const pid of pids) {
    const count = perProduct3 + (remaining3-- > 0 ? 1 : 0)
    for (let i = 0; i < count; i++) {
      const tpl = r3_all[i % r3_all.length]
      const { username, email } = makeUser()
      reviews.push({
        text: variate(tpl.t, PRODUCTS[pid].name),
        rating: 3,
        username,
        email,
        product_id: pid,
        time_label: pick(times),
        is_auto: false,
        team_response: tpl.resp,
        refunded: false,
      })
    }
  }

  // --- 20 two-star reviews ---
  const perProduct2 = Math.floor(20 / pids.length)
  let remaining2 = 20 - perProduct2 * pids.length
  for (const pid of pids) {
    const count = perProduct2 + (remaining2-- > 0 ? 1 : 0)
    for (let i = 0; i < count; i++) {
      const tpl = r2_all[i % r2_all.length]
      const { username, email } = makeUser()
      reviews.push({
        text: variate(tpl.t, PRODUCTS[pid].name),
        rating: 2,
        username,
        email,
        product_id: pid,
        time_label: pick(times),
        is_auto: false,
        team_response: tpl.resp,
        refunded: tpl.refund ?? false,
      })
    }
  }

  // --- 10 one-star reviews ---
  const perProduct1 = Math.floor(10 / pids.length)
  let remaining1 = 10 - perProduct1 * pids.length
  for (const pid of pids) {
    const count = perProduct1 + (remaining1-- > 0 ? 1 : 0)
    for (let i = 0; i < count; i++) {
      const tpl = r1_all[i % r1_all.length]
      const { username, email } = makeUser()
      reviews.push({
        text: variate(tpl.t, PRODUCTS[pid].name),
        rating: 1,
        username,
        email,
        product_id: pid,
        time_label: pick(times),
        is_auto: false,
        team_response: tpl.resp,
        refunded: tpl.refund ?? true,
      })
    }
  }

  return shuffle(reviews)
}

async function main() {
  console.log("Deleting all existing reviews...")
  const { error: delErr } = await db.from("reviews").delete().neq("id", 0)
  if (delErr) console.log("Delete warning:", delErr.message)

  const reviews = buildReviews()
  console.log(`Built ${reviews.length} reviews. Distribution:`)
  const dist = [5,4,3,2,1].map(r => `${r}-star: ${reviews.filter(x=>x.rating===r).length}`)
  console.log(dist.join(", "))
  const autoCnt = reviews.filter(r => r.is_auto).length
  console.log(`Auto reviews: ${autoCnt}, Manual: ${reviews.length - autoCnt}`)

  // Insert in batches of 500
  const BATCH = 500
  for (let i = 0; i < reviews.length; i += BATCH) {
    const batch = reviews.slice(i, i + BATCH)
    const { error } = await db.from("reviews").insert(batch)
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error.message)
      // Try smaller batches
      for (let j = 0; j < batch.length; j += 50) {
        const mini = batch.slice(j, j + 50)
        const { error: e2 } = await db.from("reviews").insert(mini)
        if (e2) console.error(`  Mini batch at ${i + j} failed:`, e2.message)
        else console.log(`  Mini batch at ${i + j}: ${mini.length} inserted`)
      }
    } else {
      console.log(`Batch ${i / BATCH + 1}: ${batch.length} inserted (total: ${Math.min(i + BATCH, reviews.length)})`)
    }
  }

  // Verify final count
  const { count } = await db.from("reviews").select("*", { count: "exact", head: true })
  console.log(`\nFinal count in DB: ${count}`)
  console.log("Done!")
}

main().catch(console.error)
