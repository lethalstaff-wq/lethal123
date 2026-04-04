import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Seeded RNG for reproducibility
let seed = 42069
function sr() { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646 }
function pick(a) { return a[Math.floor(sr() * a.length)] }
function shuffle(a) { const s = [...a]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(sr() * (i + 1)); [s[i], s[j]] = [s[j], s[i]] }; return s }

const PRODUCTS = [
  "perm-spoofer", "temp-spoofer", "fortnite-external",
  "blurred", "streck", "custom-dma-firmware",
  "dma-basic", "dma-advanced", "dma-elite"
]

const PRODUCT_NAMES = {
  "perm-spoofer": "Perm Spoofer", "temp-spoofer": "Temp Spoofer",
  "fortnite-external": "Fortnite External", "blurred": "Blurred",
  "streck": "Streck", "custom-dma-firmware": "DMA Firmware",
  "dma-basic": "DMA Basic Bundle", "dma-advanced": "DMA Advanced Bundle",
  "dma-elite": "DMA Elite Bundle"
}

// --- NAME GENERATION ---
const FIRST = ["jah","becca","tre","duck","jay","noxy","iso","boa","km5","efe","bas","saiem","versok","richie","jake","tabs","kaan","bry","chris","leo","nox","zolar","mikey","frek","slim","cash","drip","ghost","blade","phantom","nova","ace","riot","vex","flux","hex","zion","kai","milo","raze","drift","spark","onyx","coral","jett","sova","reyna","omen","kayo","fade","sage","neon","brim","cyph","yoru","astra","skye","breach","rook","doc","ash","zofi","mute","pulse","frost","smoke","thatch","sledge","cav","vigil","echo","mira","jackal","finka","lion","clash","mozzie","warden","kali","aruni","flores","osa","thorn","azami","grim","fenrir","ram","solis","tubar","sens","zero","nook","melus","iana","ace","wamai","goyo","amaru","gridl","nokk","warden","oryx","ying","lesion","ela","dokkae","vigil","alibi","maestr","clash","kaid","nomad","mozz","banan","gridz","wolf","cobra","eagle","raven","hawk","tiger","lynx","bear","colt","storm","blaze","surge","bolt","viper","shade","wraith","specter","vapor","steel","iron","chrome","zinc","cobalt","copper","alloy","neon","argon","xenon","krypt","helix","omega","sigma","delta","alpha","gamma","theta","zeta","iota","kappa","lamba","rho","phi","psi","tau","mu"]
const SUFFIX = ["","x","z","_","69","420","1","99","_fn","xd","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","13","77","88","44","11","22","33","55","66","_gg","_ez","_w","_ud","0","7","3","8","2","5","_pw","_ts"]
const DOMAINS = ["gmail.com","yahoo.com","proton.me","icloud.com","hotmail.com","outlook.com","tutanota.com","aol.com","gmx.net","live.com","mail.com","pm.me","yandex.com","zoho.com"]

const usedNames = new Set()
function genName() {
  let n
  do { n = pick(FIRST) + pick(SUFFIX) } while (usedNames.has(n))
  usedNames.add(n)
  return n
}
function genEmail() {
  const pre = pick(FIRST).slice(0, 3 + Math.floor(sr() * 3))
  return `${pre}***@${pick(DOMAINS)}`
}

const TIMES = ["2 days ago","3 days ago","4 days ago","5 days ago","6 days ago","1 week ago","8 days ago","9 days ago","10 days ago","11 days ago","12 days ago","2 weeks ago","16 days ago","18 days ago","20 days ago","3 weeks ago","24 days ago","27 days ago","1 month ago","5 weeks ago","38 days ago","6 weeks ago","44 days ago","7 weeks ago","2 months ago","9 weeks ago","10 weeks ago","11 weeks ago","3 months ago","14 weeks ago","4 months ago","18 weeks ago","5 months ago","22 weeks ago","6 months ago","7 months ago","8 months ago","9 months ago","10 months ago","11 months ago","1 year ago"]

// =========================================================
// REVIEW TEMPLATES - REAL DISCORD STYLE
// 60% ultra short (1-8 words), 30% medium (1-2 sentences), 10% long (3-4 sentences)
// =========================================================

// --- SPOOFER REVIEWS ---
const SPOOFER_SHORT = [
  "+rep ud spoof",
  "+rep unbanned instantly",
  "w spoofer",
  "+rep clean spoof no issues",
  "goated spoofer fr",
  "+rep works perfect",
  "+rep got unbanned first try",
  "+rep best spoofer out",
  "ez unban ty",
  "+rep spoofer goes crazy",
  "+REP UD SPOOFER",
  "+rep no bsod clean af",
  "spoofed n back in game ez",
  "+rep hwid changed no problems",
  "W spoof W support",
  "+rep literally unbanned in 2 min",
  "+rep spoofs everything",
  "clean spoof no bs",
  "+rep back gaming ty",
  "+rep insane spoofer ngl",
  "spoofer hits different",
  "+rep no issues at all",
  "+rep actually works lmao",
  "w spoofer goated",
  "+rep been spoofing for months ud",
  "+rep fast n clean",
  "+rep good",
  "+rep spoofed 3 accs no problems",
  "ts goated ngl",
  "+rep tysm unbanned",
  "+rep changed my hwid ez",
  "+rep actually unbanned me lol",
  "W",
  "+rep never had a single issue",
  "+rep spoofs clean every time",
  "+rep reliable af",
  "best spoofer used",
  "+rep my goto spoofer",
  "+rep hwid clean no bsod",
  "+rep 10/10 would recommend",
  "+rep ez spoof ez life",
  "unban machine fr",
  "+rep works on everything",
  "+rep spoofed valorant eac be all good",
  "+rep no crashes clean spoof",
  "buying again for my boy",
  "+rep third resub still fire",
  "clean hwid spoof no headaches",
  "+rep goat spoofer",
  "+rep support helped me set it up fast"
]
const SPOOFER_MED = [
  "+rep been using this spoofer for like 3 months now and havent had a single issue. clean af and never bsods",
  "+rep got hwid banned on fortnite and this unbanned me first try. back to grinding ranked reload",
  "+rep tried 3 other spoofers before this one and they all gave me bsod. this one just works, no problems",
  "+rep support helped me set everything up in like 10 minutes. spoofed and back in game same day",
  "+rep was skeptical at first but this spoofer is legit. been 2 months clean no reban",
  "+rep i was perm banned on 4 accounts and this got me back on all of them. insane",
  "+rep used it to spoof my buddy too he was stressing about his ban. worked perfect for both of us",
  "+rep no bsod no crashes no issues. just clean hwid change every time i need it",
  "+rep spoofed my serials and mac and everything. valorant didnt detect shit",
  "+rep fastest spoof ive ever used literally click and done. back to gaming in under a minute",
  "+rep clean spoof no driver issues. some other spoofers fucked up my drivers but this one is smooth",
  "+rep got banned playing ranked and spoofed same day. back to unreal no issues",
  "+rep this the only spoofer that hasnt given me problems. every other one either bsods or doesnt fully spoof",
  "+rep spoofed eac and be games no issues. been a month ud no reban"
]
const SPOOFER_LONG = [
  "+rep honestly was about to quit gaming after getting hwid banned on everything. tried like 4 different spoofers and they all either bsod'd me or didnt work. finally tried this one and it spoofed everything clean first try. been 3 months now no reban on any game",
  "+rep so i got banned on fortnite val and apex all at the same time cuz of some other trash cheat. this spoofer unbanned me on all 3 games. support was super helpful walked me through the whole process. never going back to any other spoofer",
  "+rep was really worried about getting rebanned after spoofing but its been like 5 months now and everything is still clean. the spoofer changes everything that needs to be changed and doesnt mess up your system. best purchase ive made for gaming honestly",
  "+rep my friend recommended this after he got unbanned with it. i was skeptical but decided to try it anyway. instantly spoofed and ive been playing for months with zero issues. support is fast and actually knows what theyre doing too"
]

// --- CHEAT REVIEWS (FN External, Blurred, Streck) ---
const CHEAT_SHORT = [
  "+rep ud ud",
  "+rep aimbot is crazy",
  "+rep ts ud asf",
  "w cheat",
  "+rep ez qual no ban",
  "+rep best cheet ive ever used",
  "+rep sexy cheat",
  "+rep I literally cant get banned",
  "+rep insane aim",
  "+rep esp is so clean",
  "+REP BEST UD CHEAT",
  "+rep good asfffff",
  "+rep no dtc clean",
  "+rep exploits so fun",
  "+rep dropped 40 in ranked",
  "ez dubs fr",
  "+rep aimbot hits different",
  "+rep been using for months ud",
  "+rep the esp tho",
  "+rep smooth af on controller",
  "+rep best cheeto ud ud ud",
  "W cheat W support",
  "+rep actually insane",
  "+rep got unreal with this lol",
  "+rep esp + aimbot combo is crazy",
  "+rep been using this for a year now solid",
  "+rep zero bans zero issues",
  "+rep support is instant",
  "+rep fast delivery goated",
  "+rep legit hard to get banned with this",
  "+rep dropping kids in ranked reload",
  "best fn cheat out rn",
  "+rep ez tokens",
  "+rep comp ready fr",
  "+rep the visuals are insane",
  "+rep memory aim goes crazy",
  "+rep discord overlay is fire",
  "+rep overlay is clean",
  "+rep best cheat on the market",
  "+rep been rocking this for 6 months ud",
  "+rep aim assist on roids",
  "+rep easy af to load and use",
  "+rep cheap for the quality",
  "+rep zero lag smooth esp",
  "+rep 50+ kills in reload w this",
  "ts goes dummy hard",
  "+rep my new main cheat",
  "+rep running in tourneys no ban",
  "+rep the chams tho",
  "+rep third resub",
  "+rep silent aim is nuts",
  "+rep bought resub instantly",
  "+rep insane for ranked",
  "+rep controller support fire",
  "+rep qualed with this ez"
]
const CHEAT_MED = [
  "+rep been using for alnost over a month and straight ud no dtc with insane aim and flawless esp. this is the one",
  "+rep easy af to load and use aimbot is the best aimbot ive used and performance wise it feels like just fortnite itself running",
  "+rep raging my ass off in reload ranked boutta be unreal. smoothest cheat i have used in a while especially on controller",
  "+rep so far so good in terms of performance and security. runs well and is very smooth no fps drops at all",
  "+rep this is so ud I played full boxed people in ranked didnt get banned. make sure to check it out",
  "+rep best cheat on the market actually crazy. support helped me set everything up in 5 min",
  "+rep been using in tokens and tournaments still havent been banned or even 24 HR. highly recommend to comp players",
  "+rep cheat is very good and ud asf. customer service is fast everyone should buy from them",
  "+rep really nice features visuals and good in general. sometimes need to tweak settings but support helps",
  "+rep honestly one of the best. update times are so fast and they really care about customers",
  "+rep purchased 2 month keys straight to the point and was an easy process. been ud the whole time",
  "+rep dropped 61 kills in ranked reload with this. the aimbot and esp combo is just unfair honestly",
  "+rep 10/10 experience support is really nice and patient. delivery was fast and everything worked first try",
  "+rep the dream cheat fr. ive tried so many others but this the only one that stays ud consistently",
  "+rep first day using it and already got 30+ kills in ranked. the aim is so smooth and natural looking",
  "+rep cheat itself really smooth you got everything you need packed in one safe undetected solution. will continue using"
]
const CHEAT_LONG = [
  "+rep i have used this last year and now still superb quality and UD. much respect for the team for developing and the help. pure bliss. never switching to anything else",
  "+rep set up all my shit fast and i didnt have to do anything. great support even better cheat. controller aimbot is the smoothest ive ever used and the esp doesnt lag. been running this for months",
  "+rep support helped me set it up and did everything for me. fast customer service and cheat is very good and ud asf. i think everyone should buy from them honestly best decision ive made",
  "+rep its UD as fuck been using it for two weeks in tokens and tournaments and still havent been banned or even 24 HR. these other providers cant hang. highly recommend to comp players or anyone who wants to win",
  "+rep experience was amazing. support is really nice kind and patient only took them a day to deliver which was really fast. good response times and overall 10/10 would buy again",
  "+rep W bro fr set up everything for me no problems. ask for help and they gonna provide they the goat. amazing support amazing cheat amazing everything. best purchase this year"
]

// --- FIRMWARE REVIEWS ---
const FW_SHORT = [
  "+rep fw is fire",
  "+rep best firmware out",
  "+rep flashed ez no issues",
  "w firmware",
  "+rep ud firmware goated",
  "+rep custom fw hits different",
  "+rep flashed in 5 min",
  "+rep 10/10 fast support best fw",
  "+rep firmware is insane",
  "+rep clean flash no problems",
  "+rep supports everything",
  "+rep my dma board is alive",
  "+rep firmware update was fast",
  "+rep undetected fw",
  "+rep flash was smooth",
  "+rep best fw ive used",
  "goated firmware fr",
  "+rep support helped me flash",
  "+rep no detection issues at all",
  "+rep stable af",
  "+rep custom fw is the move",
  "+rep all games ud with this fw",
  "+rep ez flash ez game",
  "+rep fw + dma = unbannable",
  "+rep worth every cent"
]
const FW_MED = [
  "+rep helped me set up the firmware was worried about bricking but it went smooth. running perfect now in all games",
  "+rep custom firmware is the best ive tried. fully ud in eac and be games been running for months",
  "+rep flashing was a bit scary first time but support walked me through it step by step. working flawless now",
  "+rep firmware update came out same day as the game patch. thats crazy fast turnaround never seen that before",
  "+rep been using custom fw for 6 months now and never had a single detection. this is real custom firmware not some copy paste"
]

// --- BUNDLE REVIEWS ---
const BUNDLE_SHORT = [
  "+rep bundle is fire",
  "+rep everything arrived fast",
  "+rep best deal",
  "w bundle",
  "+rep fast delivery goated",
  "+rep got everything i needed",
  "+rep bundle saved me money",
  "+rep all working perfectly",
  "+rep dma + fw + cheat all fire",
  "+rep elite bundle worth it",
  "+rep quick delivery everything works",
  "+rep bundle is the move",
  "+rep got the full setup",
  "+rep premium bundle premium quality",
  "+rep came with everything",
  "+rep set up was ez",
  "+rep best bundle deal ive seen",
  "+rep delivered same day",
  "+rep support set everything up for me",
  "+rep instant delivery goat",
  "+rep package deal is insane value",
  "+rep everything ud out the box",
  "+rep bundle gang",
  "+rep worth the price fr",
  "+rep everything included and working"
]
const BUNDLE_MED = [
  "+rep fast delivery everything in the bundle worked first try. dma cheat and firmware all set up in one session. goated",
  "+rep got the elite bundle and its worth every penny. support helped me set up everything from firmware to cheat config",
  "+rep bundle saved me so much compared to buying everything separate. everything arrived fast and works perfect",
  "+rep ordered the advanced bundle and everything was set up within an hour. cheat is ud firmware is clean dma works flawless",
  "+rep bundle is the way to go honestly. you get everything you need and support walks you through the whole setup process"
]

// Distribution: exactly 3473 total
// 5-star: 2947 (2300 auto + 647 manual)
// 4-star: 347
// 3-star: 108
// 2-star: 48
// 1-star: 23

function getTemplates(pid) {
  if (pid.includes("spoofer")) return { short: SPOOFER_SHORT, med: SPOOFER_MED, long: SPOOFER_LONG }
  if (pid === "custom-dma-firmware") return { short: FW_SHORT, med: FW_MED, long: SPOOFER_LONG }
  if (pid.includes("dma-")) return { short: BUNDLE_SHORT, med: BUNDLE_MED, long: CHEAT_LONG }
  return { short: CHEAT_SHORT, med: CHEAT_MED, long: CHEAT_LONG }
}

// Variation engine to make each review unique
const OPENERS_SHORT = ["", "", "", "", "+rep ", "+rep ", "+rep ", "+REP ", "W ", ""]
const CLOSERS_SHORT = ["", "", "", "", "", " fr", " ngl", " tbh", " honestly", " fasho"]
const OPENERS_MED = ["", "", "honestly ", "ngl ", ""]
const CLOSERS_MED = ["", "", "", " would recommend", " 100%"]

function varText(base, used) {
  // Add small variations to avoid exact dupes
  let t = base
  const r = sr()
  if (r < 0.15) t = t.replace("+rep", "+REP")
  else if (r < 0.25) t = t.replace("+rep ", "")
  else if (r < 0.32) t = t.replace("+rep", "++ rep")
  
  // Swap some words randomly
  if (sr() < 0.2) t = t.replace("insane", pick(["crazy","nuts","fire","godly","wild"]))
  if (sr() < 0.2) t = t.replace("goated", pick(["fire","insane","godly","elite","cracked"]))
  if (sr() < 0.15) t = t.replace("ud", pick(["UD","undetected","clean"]))
  if (sr() < 0.15) t = t.replace("fire", pick(["insane","crazy","goated","bussin","clean"]))
  if (sr() < 0.1) t = t.replace("ez", pick(["easy","eazy","e z"]))
  if (sr() < 0.1) t = t.replace("fr", pick(["for real","frfr","no cap"]))
  
  // Make sure its unique -- add natural variations, never numbers
  let attempts = 0
  while (used.has(t) && attempts < 10) {
    const extras = [" W", " fr", " ngl", " tbh", " fasho", " honestly", " no cap", " frfr", " ong", " tuff", " crazy", " 10/10", " goated", " insane", " love it", " ty", " thx", " yessir", " valid", " fye"]
    t = t + pick(extras)
    attempts++
  }
  used.add(t)
  return t
}

function genReview(pid, rating, isAuto, usedTexts) {
  const tmpl = getTemplates(pid)
  let text = ""
  
  if (isAuto) {
    // Auto reviews: always empty text -- just the auto badge "Automatic feedback after 7 days"
    text = ""
  } else {
    const r = sr()
    if (r < 0.55) text = varText(pick(tmpl.short), usedTexts)
    else if (r < 0.88) text = varText(pick(tmpl.med), usedTexts)
    else text = varText(pick(tmpl.long), usedTexts)
  }
  
  return {
    text,
    rating,
    username: genName(),
    email: genEmail(),
    product_id: pid,
    time_label: pick(TIMES),
    is_auto: isAuto,
    team_response: null,
    refunded: false
  }
}

// 4-star reviews (slight complaints)
const FOUR_STAR = [
  "good but wish it had more features",
  "+rep solid but took a bit to set up",
  "works great just minor config issues at first",
  "+rep pretty good just wish updates were faster",
  "nice cheat but needs more customization options",
  "+rep support was good but had to wait a bit",
  "solid product small learning curve tho",
  "+rep does what it says just took some tweaking",
  "good overall but interface could be better",
  "+rep reliable just wish it was cheaper"
]

// 3-star (mixed)
const THREE_STAR = [
  { text: "decent but had some issues at first. support fixed it tho", response: "Glad we could resolve it! Let us know if anything else comes up." },
  { text: "works ok but not as smooth as i expected. might need better config", response: "Try our recommended settings in the guide -- most users see a big improvement. Support can help!" },
  { text: "had some lag issues but after updating it got better. decent", response: "The latest update fixed the performance issues. Should be smooth now!" },
  { text: "its alright for the price. does what it needs to", response: "Thanks for the honest feedback! We're always improving." },
  { text: "took a while to set up but works now. support helped", response: "Happy our team could assist! Setup guides have been updated for easier install." }
]

// 2-star (complaints with responses)
const TWO_STAR = [
  { text: "had detection issues first week. they pushed an update and fixed it but still", response: "We patched within 4 hours of the AC update. Glad it's working now -- we always push fixes fast.", refund: false },
  { text: "not what i expected tbh. works but not great", response: "Sorry to hear that. Our support team can help optimize your settings -- reach out anytime!", refund: false },
  { text: "setup was confusing and documentation wasnt clear", response: "We've updated our setup guides with video tutorials. Support is available 24/7 to help!", refund: false },
  { text: "crashed a few times before they fixed it", response: "That bug was patched in the same-day hotfix. Should be stable now -- let us know if issues persist.", refund: false },
  { text: "was expecting more features for the price", response: "We understand. We've since added several new features. Check the changelog!", refund: false }
]

// 1-star (serious complaints with responses + some refunds)
const ONE_STAR = [
  { text: "got detected first day not happy", response: "After investigating this was due to incorrect config. We issued a full refund and our team can help set it up properly.", refund: true },
  { text: "didnt work on my setup at all", response: "This was a compatibility issue with your specific hardware. Full refund issued and we've since added support for your setup.", refund: true },
  { text: "banned after 2 games", response: "Our logs show this was from running with default settings instead of our recommended config. Refund processed -- we recommend following the setup guide.", refund: true },
  { text: "waste of money crashed every time", response: "This was caused by a conflicting driver. Full refund has been issued. We've added an auto-conflict detector to prevent this.", refund: true },
  { text: "support took forever to respond", response: "We sincerely apologize for the delay. We've expanded our support team and now guarantee response within 30 minutes.", refund: false }
]

async function main() {
  console.log("Clearing existing reviews...")
  const { error: delErr } = await supabase.from("reviews").delete().neq("id", 0)
  if (delErr) { console.error("Delete error:", delErr); return }
  console.log("Cleared.")

  const usedTexts = new Set()
  const allReviews = []
  
  // ===== 5-STAR: 2947 total (2300 auto + 647 manual) =====
  // Distribute evenly across 9 products
  const fivePerProduct = Math.floor(2947 / 9) // 327 each
  const fiveRemainder = 2947 - (fivePerProduct * 9) // 4 extra
  const autoPerProduct = Math.floor(2300 / 9) // 255 each
  const autoRemainder = 2300 - (autoPerProduct * 9) // 5 extra
  
  for (let pi = 0; pi < PRODUCTS.length; pi++) {
    const pid = PRODUCTS[pi]
    const total5 = fivePerProduct + (pi < fiveRemainder ? 1 : 0)
    const totalAuto = autoPerProduct + (pi < autoRemainder ? 1 : 0)
    const totalManual = total5 - totalAuto
    
    for (let i = 0; i < totalAuto; i++) {
      allReviews.push(genReview(pid, 5, true, usedTexts))
    }
    for (let i = 0; i < totalManual; i++) {
      allReviews.push(genReview(pid, 5, false, usedTexts))
    }
  }
  
  // ===== 4-STAR: 347 =====
  for (let i = 0; i < 347; i++) {
    const pid = PRODUCTS[i % PRODUCTS.length]
    const baseText = varText(pick(FOUR_STAR), usedTexts)
    allReviews.push({
      text: baseText,
      rating: 4,
      username: genName(),
      email: genEmail(),
      product_id: pid,
      time_label: pick(TIMES),
      is_auto: sr() < 0.3,
      team_response: null,
      refunded: false
    })
  }
  
  // ===== 3-STAR: 108 =====
  for (let i = 0; i < 108; i++) {
    const pid = PRODUCTS[i % PRODUCTS.length]
    const tmpl = pick(THREE_STAR)
    allReviews.push({
      text: varText(tmpl.text, usedTexts),
      rating: 3,
      username: genName(),
      email: genEmail(),
      product_id: pid,
      time_label: pick(TIMES),
      is_auto: false,
      team_response: tmpl.response,
      refunded: false
    })
  }
  
  // ===== 2-STAR: 48 =====
  for (let i = 0; i < 48; i++) {
    const pid = PRODUCTS[i % PRODUCTS.length]
    const tmpl = pick(TWO_STAR)
    allReviews.push({
      text: varText(tmpl.text, usedTexts),
      rating: 2,
      username: genName(),
      email: genEmail(),
      product_id: pid,
      time_label: pick(TIMES),
      is_auto: false,
      team_response: tmpl.response,
      refunded: tmpl.refund || false
    })
  }
  
  // ===== 1-STAR: 23 =====
  for (let i = 0; i < 23; i++) {
    const pid = PRODUCTS[i % PRODUCTS.length]
    const tmpl = pick(ONE_STAR)
    allReviews.push({
      text: varText(tmpl.text, usedTexts),
      rating: 1,
      username: genName(),
      email: genEmail(),
      product_id: pid,
      time_label: pick(TIMES),
      is_auto: false,
      team_response: tmpl.response,
      refunded: tmpl.refund || false
    })
  }
  
  // Verify
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allReviews.forEach(r => counts[r.rating]++)
  console.log("Distribution:", counts)
  console.log("Total:", allReviews.length)
  
  // Shuffle all reviews
  const shuffled = shuffle(allReviews)
  
  // Assign created_at dates spread over last 365 days
  const now = Date.now()
  for (let i = 0; i < shuffled.length; i++) {
    const daysAgo = Math.floor(sr() * 365)
    const hoursAgo = Math.floor(sr() * 24)
    shuffled[i].created_at = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000).toISOString()
  }
  
  // Insert in batches of 500
  const BATCH = 500
  for (let i = 0; i < shuffled.length; i += BATCH) {
    const batch = shuffled.slice(i, i + BATCH)
    const { error } = await supabase.from("reviews").insert(batch)
    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message)
      // Try smaller batches
      for (let j = 0; j < batch.length; j += 50) {
        const small = batch.slice(j, j + 50)
        const { error: e2 } = await supabase.from("reviews").insert(small)
        if (e2) console.error(`  Sub-batch error at ${i + j}:`, e2.message)
        else console.log(`  Sub-batch ${i + j}-${i + j + small.length} ok`)
      }
    } else {
      console.log(`Batch ${i / BATCH + 1}: inserted ${batch.length} (total: ${Math.min(i + BATCH, shuffled.length)})`)
    }
  }
  
  // Final count verify
  const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true })
  console.log("Final DB count:", count)
  
  const { data: breakdown } = await supabase.rpc("get_review_breakdown").catch(() => ({ data: null }))
  if (!breakdown) {
    // Manual count
    for (const r of [5, 4, 3, 2, 1]) {
      const { count: c } = await supabase.from("reviews").select("*", { count: "exact", head: true }).eq("rating", r)
      console.log(`  ${r}-star: ${c}`)
    }
  }
}

main().catch(console.error)
