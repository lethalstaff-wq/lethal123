import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) { console.error("Missing env vars"); process.exit(1) }
const db = createClient(supabaseUrl, supabaseKey)

// ── Seeded random ──
let _seed = 42
function sr() { _seed = (_seed * 16807 + 0) % 2147483647; return (_seed & 0x7fffffff) / 0x7fffffff }
function pick(arr) { return arr[Math.floor(sr() * arr.length)] }
function pickN(arr, n) { const s = [...arr]; for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(sr() * (i + 1)); [s[i], s[j]] = [s[j], s[i]] } return s.slice(0, n) }

// ── Product IDs ──
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
const productIds = Object.keys(PRODUCTS)

// ── Usernames ──
const prefixes = ["dark","xo","zz","sk","fn","ez","tt","gg","nrg","vibe","pro","lit","dma","goat","ace","ice","kai","max","zap","neo","ray","jax","fox","hex","pix","ryn","blz","crx","drp","flx","hyp","lvl","qst","vrx","bnk","wrp","kz","vx","rx","zk","dx","mx","jx","tx","nx","qx","sx","bx"]
const suffixes = ["sniper","king","lord","boy","kid","player","gamer","beast","wolf","hawk","yt","ttv","fn","69","420","xx","zz","360","v2","xd","lol","gg","pro","x","z","wrld","szn","vibes","gang","mode","wave","ctrl","zone","sync","star","fire","bolt","rush","sz","hz","kd"]
const domains = ["gmail.com","gmail.com","gmail.com","gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com","proton.me"]

function makeUser() {
  const a = pick(prefixes), b = pick(suffixes), n = Math.floor(sr() * 999)
  const username = `${a}${b}${n}`
  const email = `${username}@${pick(domains)}`
  return { username, email }
}

// ── Time labels ──
const times = [
  "2 min ago","5 min ago","8 min ago","12 min ago","17 min ago","23 min ago","34 min ago","45 min ago",
  "1 hour ago","2 hours ago","3 hours ago","4 hours ago","5 hours ago","6 hours ago","8 hours ago","10 hours ago",
  "12 hours ago","16 hours ago","20 hours ago","1 day ago","2 days ago","3 days ago","4 days ago","5 days ago","6 days ago",
  "1 week ago","1 week ago","2 weeks ago","2 weeks ago","3 weeks ago","1 month ago","1 month ago","2 months ago","3 months ago",
]

// ── Review templates per product category ──

const spooferReviews5 = [
  "perm spoofer saved my main after hwid ban. setup was so easy and ive been playing clean for weeks now",
  "got banned on fn and thought my pc was done for. this spoofer fixed everything in like 5 min. absolute lifesaver",
  "been using the perm spoofer for 2 months now, not a single issue. completely changed my hwid and anti cheat doesnt detect it",
  "best spoofer on the market no cap. tried 3 others before this and they all got detected within a week. this one is still going strong",
  "temp spoofer works perfectly for what i need. quick and easy, just run it before playing and ur good to go",
  "my pc was hardware banned from warzone and this spoofer got me right back in. support helped me set it up too",
  "honestly didnt think itd work but it does. been playing on my main for 3 weeks after being hwid banned",
  "perm spoofer is the way to go if ur serious. one time setup and u never have to worry about hwid bans again",
  "super clean spoofer. doesnt mess with any other software on my pc and works exactly as described",
  "got my key instantly and the setup guide was clear. spoofed my hwid in under 3 min and been good since",
  "this is the only spoofer that actually works against vanguard. ive been unbanned for over a month now",
  "bought the temp spoofer first to test it out, worked so well that i upgraded to perm. no issues whatsoever",
  "went from hwid banned to playing ranked again in 10 min flat. this spoofer is genuinely undetected",
  "tried a free spoofer before and it bricked my windows install. this one is clean, safe, and actually works",
  "support team walked me through the entire setup on discord. spoofer has been running flawlessly since day 1",
  "if ur hwid banned just buy this. stop wasting time with sketchy free tools. this actually works and stays undetected",
  "the fact that it survives windows updates is insane. most spoofers need to be reapplied but this one just keeps going",
  "bought for a friend too after mine worked so well. both of us playing on our mains again with zero problems",
  "perm spoofer + fn external combo is unstoppable. been dominating ranked for weeks and no ban in sight",
  "was skeptical but the reviews convinced me. glad i pulled the trigger, this spoofer is legit af",
  "used to get banned every other week on alt accounts. got the perm spoofer and havent been banned once since",
  "spoofed my entire hardware profile in one click. whoever made this tool is a genius fr",
  "my friend got detected using another spoofer and i showed him this one. hes been clean ever since lol",
  "even after the last anti cheat update it still works perfectly. these guys update fast",
  "cleanest unban method ive ever used. no traces, no issues, just clean hardware ids all around",
  "ran the spoofer and checked with a hwid reader, completely different ids across the board. quality product",
  "temp spoofer is great for testing. ran it for a week then upgraded to perm. smooth transition no problems",
  "this spoofer saved me from having to buy a new pc. actually works against be, eac, and vanguard",
  "ive been hwid banned twice before and both times this spoofer got me back in under 10 min",
  "the auto update feature is nice. dont have to worry about manually updating after patches",
]

const cheatReviews5 = [
  "fn external is absolutely insane. the aimbot feels so natural and smooth, doesnt look like cheating at all on replay",
  "the esp is crazy clean. perfect render distance and it doesnt tank fps at all. running 200+ fps with it on",
  "blurred dma is the best cheat ive ever used. completely separate from game pc so theres zero detection risk",
  "been using streck dma for a month and its amazing for the price. great entry point if ur new to dma",
  "aimbot on the fn external is insane. smooth aim, customizable fov, bone priority. everything u need",
  "the softaim is so clean. nobody can tell on replay and it looks completely natural even in slow motion",
  "been streaming with this on and nobody has called me out once. the esp overlay is invisible to obs",
  "dma cheat is on another level compared to software cheats. zero fps impact since it runs on separate hardware",
  "streck dma gives you the basics but does them really well. esp + aimbot at a budget price, cant go wrong",
  "blurred dma has every feature u could want. radar, esp, aimbot, triggerbot, all customizable and smooth",
  "the fn external works perfectly with the latest season. they pushed an update within hours of the patch",
  "aim assist on controller already feels like aimbot but this takes it to another level lmao. nobody suspects",
  "tried multiple fn cheats before and they all got detected. this one has been running for 2 months clean",
  "the prediction on moving targets is actually insane. hitting shots i never would without it",
  "box esp + distance markers make it so easy to position in late game. been winning so many more games",
  "skeleton esp is my favorite feature. u can see exactly what theyre doing behind walls without it being too obvious",
  "loot esp filter is underrated. i can see only purple and gold items, saves so much time looting",
  "blurred dma radar is amazing. mini map shows every player in real time. game changing for competitive",
  "the cheat menu is so clean and easy to use. everything is organized and the hotkeys work perfectly",
  "bought for fortnite but it works on other games too. versatile af",
  "no fps drop at all. i was worried itd affect performance but literally cant tell its running",
  "aimbot fov and smooth settings are perfect. set it low enough and it just looks like good aim",
  "been using for 3 weeks in arena and went from gold to unreal. this thing is actually cracked",
  "the instant headshot feature is insane but i keep it on body shots to stay under the radar",
  "visibility checks actually work. it only aims when theres a clear line of sight so no snapping to walls",
  "update speed is crazy. new fn season dropped and they had the cheat updated within 2 hours",
  "bought the fn external as a test and immediately got the dma bundle because the quality was so good",
  "recoil control is perfect. combined with aimbot its literally impossible to miss",
  "the draw distance on esp is insane. i can see players from 300m away easy",
  "triggerbot is my favorite feature. just hover over someone and it fires automatically. so clean",
]

const firmwareReviews5 = [
  "custom firmware is absolutely worth the investment. running eac bypass without a single detection for 6 weeks",
  "firmware makes the dma board completely invisible to anti cheat. its like it doesnt even exist",
  "got the custom firmware and the difference from stock is massive. way more stable and undetectable",
  "the firmware updates come fast after every game patch. never had to wait more than a few hours",
  "been running custom firmware for over 2 months now. zero detections, zero issues, zero stress",
  "this firmware bypasses every anti cheat ive tested it against. be, eac, vanguard, all clean",
  "the emulation is perfect. anti cheat sees my dma board as a regular pcie device. genius level stuff",
  "firmware flashing was easy with their guide. took about 10 min and everything worked first try",
  "custom firmware + blurred dma = literally undetectable. this combo is goated",
  "the latency improvement over stock firmware is noticeable too. reads are faster and smoother",
  "stopped using stock firmware after trying this. the detection rate difference is night and day",
  "whoever develops this firmware knows what theyre doing. the anti detection methods are next level",
  "ive been running this firmware across multiple games simultaneously. all undetected, all smooth",
  "the firmware survived the last big eac update that caught a ton of other providers. still clean",
  "support helped me flash the firmware over discord screen share. super easy process",
  "custom firmware is the one upgrade every dma user should make. stock firmware is basically asking to get caught",
  "been through 3 game updates and 2 anti cheat patches. firmware still working perfectly",
  "the device id spoofing in the firmware is what makes it special. ac cant fingerprint the board at all",
  "flashed the firmware in under 5 min with their tool. no technical knowledge needed honestly",
  "running this on a 75t and its flawless. best firmware available for screamer boards",
]

const bundleReviews5 = [
  "dma elite bundle has everything u need. board + firmware + cheat all configured and ready to go",
  "bought the advanced bundle and setup took 20 min with discord support. everything works out the box",
  "basic bundle is a great starting point. got the board and firmware, added the cheat later",
  "the bundle discount is actually insane. saved like 40% compared to buying everything separately",
  "elite bundle came with everything pre configured. just plugged in and started playing. easiest setup ever",
  "fast delivery too. ordered on monday and had it by wednesday. everything was packaged well",
  "the bundle comes with step by step setup instructions that are actually clear and easy to follow",
  "bought the advanced bundle for my friend as a gift. he loves it and setup was smooth",
  "everything in the bundle works together perfectly. no compatibility issues at all",
  "elite bundle is the way to go if u want the best experience. custom firmware + blurred dma is insane",
  "basic bundle got me started in dma. upgraded to advanced a month later and its even better",
  "delivery was instant for the digital parts and the hardware shipped same day. impressed",
  "the fact that they configure everything before shipping saves so much hassle. plug and play",
  "bundle value is unmatched. tried pricing it out separately from other providers and its way more expensive",
  "got the dma elite bundle and my kd went from 1.2 to 4.5 in a week. absolute game changer literally",
  "support helped configure my setup over discord after the bundle arrived. above and beyond service",
  "advanced bundle with blurred is the sweet spot imo. great features without breaking the bank",
  "everything arrived exactly as described. board was brand new and firmware was pre flashed perfectly",
  "bought the elite bundle 2 months ago and havent looked back. best money ive spent on gaming",
  "the bundle deals they run during sales are even crazier. got mine 30% off during black friday",
]

// 4-star reviews (positive but with minor complaint)
const fourStarReviews = [
  { text: "spoofer works great but the initial setup could be a bit easier for beginners. once its running its perfect tho", pid: "perm-spoofer" },
  { text: "fn external is fire but i wish the menu had more color options for esp. minor thing but still a solid 4", pid: "fortnite-external" },
  { text: "blurred dma is amazing but it took me a while to figure out the config. support helped tho", pid: "blurred" },
  { text: "temp spoofer does what it says but id rather just get perm for the peace of mind. works fine tho", pid: "temp-spoofer" },
  { text: "streck is good for the price but the features are limited compared to blurred. u get what u pay for", pid: "streck" },
  { text: "firmware is great but the flashing process was a bit nerve wracking first time. worked perfectly after tho", pid: "custom-dma-firmware" },
  { text: "basic bundle is solid but i wish it came with more detailed video tutorials for noobs", pid: "dma-basic" },
  { text: "fn aimbot is smooth but sometimes the fov needs tweaking between games. small complaint really", pid: "fortnite-external" },
  { text: "perm spoofer is excellent but took about 15 min to setup instead of the 5 they advertise. still worth it", pid: "perm-spoofer" },
  { text: "advanced bundle is great but shipping took 4 days instead of 2. everything works perfectly tho", pid: "dma-advanced" },
  { text: "esp is clean but i wish they had a night mode color scheme. default colors are fine just preference", pid: "blurred" },
  { text: "elite bundle is worth every penny but the price is steep. quality justifies it tho no question", pid: "dma-elite" },
  { text: "custom firmware works amazingly but updates sometimes take a day after a major patch. usually its faster", pid: "custom-dma-firmware" },
  { text: "aimbot is crazy good but the smoothing could use one more preset between low and medium", pid: "fortnite-external" },
  { text: "spoofer is undetected and works perfectly. only giving 4 because the ui could look more modern", pid: "perm-spoofer" },
]

// 3-star reviews (mixed, with team response)
const threeStarReviews = [
  { text: "took a while to set up and had some issues with windows 11 but support fixed it for me. works now", pid: "perm-spoofer", response: "Thanks for your patience! Win11 has some quirks but glad our team got it sorted for you. Enjoy!" },
  { text: "fn external is decent but i feel like the aimbot could be smoother. its ok for the price", pid: "fortnite-external", response: "Try adjusting the smooth value to 4-6 and FOV to 80. Most users find that sweet spot perfect. Let us know if you need help configuring!" },
  { text: "streck works but the features are pretty basic compared to what i expected. does the job tho", pid: "streck", response: "Streck is our budget option designed for simplicity. For more features check out Blurred DMA -- it has everything you're looking for!" },
  { text: "had some initial detection issues but they pushed an update and fixed it. been clean since", pid: "blurred", response: "We patched that within 4 hours of the AC update. Glad it's working perfectly now! We always push fixes fast." },
  { text: "bundle arrived fine but i needed help with the firmware flashing. support was helpful tho", pid: "dma-basic", response: "Happy our support team could help! We now include a video guide with all bundles to make the process easier." },
]

// 2-star reviews (negative, with team response + some refunds)
const twoStarReviews = [
  { text: "spoofer stopped working after windows update. had to contact support to fix it", pid: "temp-spoofer", response: "Windows updates can sometimes affect the spoofer. We've pushed a patch and added auto-recovery. Please update to the latest version!", refund: false },
  { text: "the esp overlay was laggy on my setup. not sure if its my hardware or the cheat", pid: "streck", response: "This is usually a USB bandwidth issue. Try using a dedicated USB controller. If issues persist, reach out to support for a free hardware check!", refund: false },
  { text: "ordered a bundle and one component arrived damaged. had to wait for replacement", pid: "dma-advanced", response: "We sincerely apologize for the damaged component. Replacement was shipped immediately and we've improved our packaging. Full refund has been issued for the inconvenience.", refund: true },
]

// 1-star reviews (bad, with team response + refunds)
const oneStarReviews = [
  { text: "got detected on first day. not happy about this at all", pid: "fortnite-external", response: "We're sorry to hear that. After investigating, this was due to incorrect config settings. We've issued a full refund and our team is available to help you set it up properly if you'd like to try again.", refund: true },
  { text: "firmware bricked my dma board had to reflash completely", pid: "custom-dma-firmware", response: "We deeply apologize for this experience. This was caused by a power interruption during flashing. We've issued a full refund, sent a replacement board, and updated our flashing tool to include a fail-safe recovery mode.", refund: true },
  { text: "support took 2 days to respond to my ticket. unacceptable", pid: "perm-spoofer", response: "We sincerely apologize for the delayed response. This was during a major update period with high ticket volume. We've since expanded our support team to ensure sub-2-hour response times. Full refund issued.", refund: true },
  { text: "paid for perm spoofer but the key didnt activate. waste of money", pid: "perm-spoofer", response: "This was a delivery system error that has been fixed. Full refund issued immediately and a new working key was sent. We apologize for the inconvenience.", refund: true },
]

async function main() {
  // Clear existing reviews
  console.log("Clearing existing reviews...")
  await db.from("reviews").delete().neq("id", 0)

  const allReviews = []
  let idx = 0

  // ── 5-star reviews: 2800 total (2300 auto + 500 manual) ──
  const fiveStarTemplates = {
    spoofer: spooferReviews5,
    cheat: cheatReviews5,
    firmware: firmwareReviews5,
    bundle: bundleReviews5,
  }

  for (let i = 0; i < 2800; i++) {
    _seed = i * 7 + 31
    const pid = pick(productIds)
    const cat = PRODUCTS[pid].cat
    const templates = fiveStarTemplates[cat]
    let text = pick(templates)

    // Add variety: prefix/suffix variations
    const variations = [
      "", "honestly ", "ngl ", "fr ", "tbh ", "no lie ", "straight up ", "deadass ", "lowkey ",
    ]
    const endings = [
      "", " highly recommend", " 10/10", " goated", " worth every penny", " no cap", " best purchase ever",
      " would buy again", " absolute fire", " cant complain", " love it",
    ]
    text = pick(variations) + text + pick(endings)

    const { username, email } = makeUser()
    const isAuto = i < 2300

    allReviews.push({
      text,
      rating: 5,
      product_id: pid,
      username,
      email,
      time_label: pick(times),
      verified: true,
      is_auto: isAuto,
      refunded: false,
      helpful: Math.floor(sr() * 30),
      team_response: null,
    })
    idx++
  }

  // ── 4-star reviews: 130 ──
  for (let i = 0; i < 130; i++) {
    _seed = i * 13 + 777
    const template = fourStarReviews[i % fourStarReviews.length]
    let text = template.text
    // Slight variation
    const starts = ["", "overall ", "tbh ", "ngl "]
    text = pick(starts) + text
    const { username, email } = makeUser()
    allReviews.push({
      text,
      rating: 4,
      product_id: template.pid,
      username,
      email,
      time_label: pick(times),
      verified: true,
      is_auto: sr() > 0.5,
      refunded: false,
      helpful: Math.floor(sr() * 15),
      team_response: null,
    })
    idx++
  }

  // ── 3-star reviews: 40 ──
  for (let i = 0; i < 40; i++) {
    _seed = i * 19 + 333
    const template = threeStarReviews[i % threeStarReviews.length]
    const { username, email } = makeUser()
    allReviews.push({
      text: template.text,
      rating: 3,
      product_id: template.pid,
      username,
      email,
      time_label: pick(times),
      verified: true,
      is_auto: false,
      refunded: false,
      helpful: Math.floor(sr() * 8),
      team_response: template.response,
    })
    idx++
  }

  // ── 2-star reviews: 20 ──
  for (let i = 0; i < 20; i++) {
    _seed = i * 23 + 555
    const template = twoStarReviews[i % twoStarReviews.length]
    const { username, email } = makeUser()
    allReviews.push({
      text: template.text,
      rating: 2,
      product_id: template.pid,
      username,
      email,
      time_label: pick(times),
      verified: true,
      is_auto: false,
      refunded: template.refund,
      helpful: Math.floor(sr() * 5),
      team_response: template.response,
    })
    idx++
  }

  // ── 1-star reviews: 10 ──
  for (let i = 0; i < 10; i++) {
    _seed = i * 29 + 999
    const template = oneStarReviews[i % oneStarReviews.length]
    const { username, email } = makeUser()
    allReviews.push({
      text: template.text,
      rating: 1,
      product_id: template.pid,
      username,
      email,
      time_label: pick(times),
      verified: true,
      is_auto: false,
      refunded: template.refund,
      helpful: Math.floor(sr() * 3),
      team_response: template.response,
    })
    idx++
  }

  console.log(`Generated ${allReviews.length} reviews. Inserting in batches...`)

  // Insert in batches of 500
  for (let i = 0; i < allReviews.length; i += 500) {
    const batch = allReviews.slice(i, i + 500)
    const { error } = await db.from("reviews").insert(batch)
    if (error) {
      console.error(`Batch ${i}-${i + 500} failed:`, error.message)
    } else {
      console.log(`Inserted batch ${i}-${i + batch.length}`)
    }
  }

  // Verify count
  const { count } = await db.from("reviews").select("*", { count: "exact", head: true })
  console.log(`Done! Total reviews in DB: ${count}`)
}

main().catch(console.error)
