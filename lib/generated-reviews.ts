// Deterministic review generator — produces realistic review texts for every simulated order.
// All users see the same reviews at the same time (seeded by date).

type GeneratedReview = {
  id: number
  text: string
  rating: number
  product: string
  product_id: string
  username: string
  email: string
  time_label: string
  verified: boolean
  is_auto: boolean
  refunded: boolean
  helpful: number
  team_response: string | null
  created_at: string
}

// ─── Review text pools per product category (5-star / 4-star) ───

const SPOOFER_REVIEWS = [
  "hwid ban gone in literally 2 minutes. back on my main playing ranked like nothing happened. this is insane",
  "been using perm spoofer for 3 months now zero issues. survives reboots, updates, everything. actually permanent fr",
  "got banned on fortnite and warzone. one install fixed both games. easiest purchase ive ever made ngl",
  "my buddy got his whole pc hwid banned. told him about this, hes been playing for 6 weeks straight no problems",
  "tried 3 other spoofers before this one. all got detected within a week. this one? 4 months and counting",
  "support helped me set it up in like 5 min on discord. works on both intel and amd which is clutch",
  "thought my pc was done after the ban wave. spoofer fixed everything instantly. worth every single penny",
  "the kernel level stuff actually works different from other spoofers. you can tell its properly made",
  "bought for my alt first to test. worked perfectly so got it for main too. no detection in 2 months on either",
  "instant delivery + instant fix. was back in game within 10 minutes of purchasing. actually goated",
  "survived the last big ban wave when everyone else got caught. this spoofer is built different for real",
  "changed all my hardware ids clean. motherboard, gpu, mac address, disk serials. actually thorough",
  "was skeptical at first but bro this just works. no bloatware no sketchy stuff just clean spoof",
  "reinstalled windows and the spoofer still held. truly permanent like they say. no cap",
  "running it alongside blurred dma and zero conflicts. clean setup clean results",
  "bought the lifetime and its the best investment. 5 months in still undetected still running smooth",
  "eac and battleye both spoofed perfectly. tested on fortnite rust and pubg all clean",
  "my homie recommended this after his worked for 6 months. now i see why. quality product",
  "setup guide was clear af. even for someone not super technical it was easy to follow",
  "temp spoofer is perfect if you just need it for a tournament weekend. cheap and effective",
  "30 day temp spoofer got me through the whole season. renewed and going again. reliable af",
  "the fact that it survives game updates without needing to redo anything is huge. zero maintenance",
  "used to manually spoof with regedit and pray lmao. this is a whole different level",
  "vanguard bypass works flawlessly. been playing val on a previously banned pc for months",
  "ricochet cant touch this. warzone on a banned hwid running smooth as butter",
]

const CHEAT_REVIEWS = [
  "the esp is so clean on stream. overlay is perfect, nobody in chat has ever noticed anything",
  "aimbot smoothing is actually insane. looks completely natural even in kill cams. well done",
  "been running this in ranked for a month straight. zero suspicion zero detection. worth it",
  "fps literally didnt drop at all after installing. whatever optimization they did is top tier",
  "config options are crazy detailed. you can tune literally everything to your playstyle",
  "external only so no injection detection risk. smart design honestly. runs clean",
  "started with 7 day to test it out. bought lifetime same night lmao. its that good",
  "support helped me optimize my config for comp play. the attention to detail is next level",
  "update came out 2 hours after the game patched. these devs are actually on it 24/7",
  "switched from another provider and the difference is night and day. way smoother way cleaner",
  "been through 3 ban waves with this running. not a single detection. actually undetected",
  "the trigger bot is so subtle even i forget its on sometimes lol. perfectly tuned",
  "radar hack alone is worth the price. full map awareness without looking sus at all",
  "dma setup with this cheat is literally unbeatable. hardware level so nothing to detect on pc",
  "quarterly sub is the move. saves money and you get updates for 3 months straight",
  "movement prediction on the aimbot is crazy accurate. hitting shots i definitely shouldnt be hitting",
  "used this for a $500 tournament and absolutely dominated. roi in one night lmaooo",
  "the fov circle is customizable and the bone selection is perfect. headshot machine",
  "no random crashes no blue screens no issues at all. just works every single time",
  "lifetime was expensive but 6 months later im still using it daily. zero regrets",
  "visibility checks on the esp are on point. only shows enemies you could actually see",
  "item esp for loot is a game changer in br games. always have the best loadout",
  "stream proof overlay is flawless. been streaming ranked with it on and zero clip drama",
  "the recoil control is subtle enough to look legit but strong enough to laser people",
  "blurred dma is the smoothest cheat ive used in 4 years of gaming. actually premium quality",
]

const FIRMWARE_REVIEWS = [
  "custom firmware runs flawless. eac emulation is perfect and stable as hell",
  "dma card with this firmware is literally invisible to anti cheat. hardware level bypass",
  "setup was smooth with discord support. they walked me through the whole flashing process",
  "firmware update dropped within hours of the game update. fastest turnaround ive seen",
  "been running eac/be emulation for 3 months. not a single issue not a single detection",
  "the slotted edition is next level. worth the premium for the extra compatibility",
  "faceit bypass firmware actually works. thought it was impossible but here we are",
  "flashing was easier than expected. clear instructions and support was there when i needed help",
  "captain dma + this firmware = unstoppable combo. best setup ive ever run",
  "vanguard emulation works perfectly. playing val with full hardware bypass is a dream",
  "quality of the firmware is insane. you can tell actual engineers built this not amateurs",
  "tried cheap firmware from another provider. got detected in a week. this? 4 months strong",
  "teensy integration is seamless. plug and play basically after flashing",
  "the emulation is so good the system literally thinks its a normal device. undetectable",
  "firmware updates are free and they push them fast. never been left hanging after a patch",
]

const BUNDLE_REVIEWS = [
  "got the full bundle and bro everything just works together perfectly. best purchase this year",
  "bundle saved me like 200 quid compared to buying everything separate. smart move",
  "setup took 30 min with discord support. from unboxing to in-game in half an hour",
  "the hardware quality is premium. dma card, fuser, everything feels solid and well made",
  "lifetime discord support is actually real. they helped me at 2am no questions asked",
  "discreet shipping was fast. package looked completely normal from outside. good opsec",
  "elite bundle is expensive but you literally get everything you need for the best setup possible",
  "advanced bundle hits the sweet spot. great hardware + quarterly cheat access. perfect combo",
  "basic bundle got me started and i upgraded to advanced 2 months later. both worth it",
  "everything was plug and play. no compatibility issues no driver problems. just works",
  "the bundle came with clear setup docs + priority discord channel. felt premium from start",
  "shipping was 3 days to UK. packaged well everything arrived in perfect condition",
  "already recommended the bundle to 3 friends. all of them are running clean now",
  "the included firmware was already flashed. literally just plug in and go. incredible",
  "been running the elite bundle for 2 months. not a single issue across any game. top tier",
]

// ─── 3-star reviews ───
const REVIEWS_3STAR = [
  "works but took a while to set up. support was helpful tho eventually got there",
  "decent but had some fps drops initially. fixed after config changes so its ok now",
  "good product but the documentation could be better. had to ask discord for most steps",
  "product itself is solid but delivery took longer than expected. not instant like they say",
  "works fine once you get it running but the initial setup was confusing ngl",
  "its alright. does what it says but nothing mind blowing. expected more for the price tbh",
  "had to reinstall twice before it worked properly. support helped but still annoying",
  "works on fortnite perfectly but had issues with other games. partial W i guess",
  "pretty good but the ui could use some work. feels a bit outdated compared to competitors",
  "took about an hour to set up when they said 5 minutes. works now tho so whatever",
]

// ─── 2-star reviews ───
const REVIEWS_2STAR = [
  "took 3 days to get support help. product works now but the wait was annoying",
  "had compatibility issues with my amd board. eventually got it working after multiple tries",
  "works intermittently. some days its fine other days it crashes. inconsistent",
  "setup guide was outdated and missing steps. had to figure stuff out myself",
  "the product works but crashed my pc twice during setup. not ideal",
  "expected better for the price honestly. its ok but not premium quality",
]

// ─── 1-star reviews ───
const REVIEWS_1STAR = [
  "couldnt get it working on my setup",
  "didnt work with my motherboard",
  "crashed every time i tried to launch the game",
  "support took forever to respond. gave up",
  "doesnt work on windows 11 for me. waste of money",
]

// ─── Username pools ───

const USERNAMES = [
  "wraith", "sk8", "nxva", "zeph", "blitz", "kyro", "dex", "flux",
  "ash", "ryze", "vxid", "cryo", "hex", "mrk", "sly", "bxn",
  "koda", "rift", "syn", "jynx", "ph4nt", "drft", "axl", "t0x",
  "vyn", "echo", "nyx", "z3r0", "raze", "glitch", "spek", "onyx",
  "prx", "faze_kid", "m0nk", "bolt", "hxze", "xen", "puls", "dkz",
  "kr4k", "styx", "xero", "lycan", "r4v3", "djinn", "apex_g", "c0lt",
  "ember", "n1tr0", "shade", "drift", "kx7", "lux", "orion", "vxlt",
  "crypt", "nova", "pulse", "warp", "zenith", "arc", "blaze", "coda",
  "fyr3", "ghost", "hydr4", "ix", "jet", "kairo", "lynx", "mxrk",
  "neon", "opal", "pyro", "quest", "ryx", "solr", "tox", "umbra",
  "vex", "wxrp", "xion", "yuki", "zolt", "agnt", "brx", "clix_fn",
  "d4wn", "evx", "frst", "grim", "havoc", "inx", "jolt", "krypt",
]

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "proton.me", "hotmail.com", "icloud.com"]

// ─── Deterministic seeded random ───

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function pickFromSeed<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)]
}

// ─── Products with their review pools ───

const PRODUCT_POOLS: { name: string; id: string; reviews: string[]; weight: number }[] = [
  { name: "Perm Spoofer", id: "perm-spoofer", reviews: SPOOFER_REVIEWS, weight: 25 },
  { name: "Temp Spoofer", id: "temp-spoofer", reviews: SPOOFER_REVIEWS, weight: 12 },
  { name: "Fortnite External", id: "fortnite-external", reviews: CHEAT_REVIEWS, weight: 18 },
  { name: "Blurred DMA Cheat", id: "blurred", reviews: CHEAT_REVIEWS, weight: 20 },
  { name: "Streck DMA Cheat", id: "streck", reviews: CHEAT_REVIEWS, weight: 8 },
  { name: "Custom DMA Firmware", id: "custom-dma-firmware", reviews: FIRMWARE_REVIEWS, weight: 7 },
  { name: "DMA Basic Bundle", id: "dma-basic", reviews: BUNDLE_REVIEWS, weight: 3 },
  { name: "DMA Advanced Bundle", id: "dma-advanced", reviews: BUNDLE_REVIEWS, weight: 4 },
  { name: "DMA Elite Bundle", id: "dma-elite", reviews: BUNDLE_REVIEWS, weight: 3 },
]

function pickProduct(seed: number) {
  const totalWeight = PRODUCT_POOLS.reduce((s, p) => s + p.weight, 0)
  let roll = seededRandom(seed) * totalWeight
  for (const p of PRODUCT_POOLS) {
    roll -= p.weight
    if (roll <= 0) return p
  }
  return PRODUCT_POOLS[0]
}

// ─── Time label helpers ───

function getTimeLabel(daysAgo: number): string {
  if (daysAgo === 0) return "today"
  if (daysAgo === 1) return "yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 14) return "1 week ago"
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
  if (daysAgo < 60) return "1 month ago"
  if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`
  return "1 year ago"
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

// ─── Team responses ───

const TEAM_RESPONSES_POSITIVE = [
  "appreciate the love! glad everything is running smooth for you. hit us up on discord if you ever need anything 🤝",
  "thanks for the review! your setup is looking clean. dont hesitate to reach out if you want help optimizing configs",
  "glad to hear it! we put a lot of work into making sure everything stays undetected. enjoy the grind 💪",
  "love hearing this! our support team works hard to help everyone get set up properly. thanks for the kind words",
  "thanks king! we push updates fast because we know downtime = lost games. appreciate the trust 🔥",
  "this means a lot! quality and reliability are our top priorities. welcome to the lethal family",
  "happy you went with us! if you ever want to upgrade or try other products, your loyalty gets you priority support",
  "respect! reviews like this keep us motivated to stay the best. see you in the discord 🎯",
  "goated review 🙏 we're always working behind the scenes to improve. glad you noticed the difference",
  "thanks for taking the time to write this! real feedback from real customers is what drives us forward",
]

const TEAM_RESPONSES_NEGATIVE = [
  "sorry to hear that, please open a discord ticket and we'll sort it out asap. we dont leave anyone hanging",
  "this shouldn't happen — DM us on discord and we'll get you fixed up today. we take this seriously",
  "we've updated the setup guide based on your feedback. thanks for letting us know, it helps us improve",
  "really sorry about the experience. our support queue was backed up that week — we've since added more staff. please reach out again",
  "we hear you. compatibility issues like this are rare but when they happen we fix them fast. open a ticket and we'll prioritize you",
  "appreciate the honest feedback. we've pushed an update that should fix this. give it another try and hit us up if not",
  "not the experience we want for anyone. please DM us your order ID and we'll make it right immediately",
]

// ─── Main generator ───

const GEN_START = new Date("2025-04-01") // ~1 year of reviews

/**
 * Generates all deterministic reviews from GEN_START until today.
 * Daily count grows over time (business growth). Fully deterministic.
 */
export function generateAllReviews(): GeneratedReview[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const totalDays = Math.floor((today.getTime() - GEN_START.getTime()) / 86400000)
  const reviews: GeneratedReview[] = []
  let globalId = 10000

  const d = new Date(GEN_START)
  while (d <= today) {
    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    const daySeed = year * 10000 + (month + 1) * 100 + day
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86400000)
    const dayIndex = totalDays - daysAgo // 0 = first day, totalDays = today

    // Daily count grows over time: early days 3-8, recent days 15-35
    const growthFactor = Math.min(dayIndex / Math.max(totalDays, 1), 1) // 0→1
    const minCount = Math.floor(3 + growthFactor * 12) // 3→15
    const maxExtra = Math.floor(5 + growthFactor * 20) // 5→25
    const dayCount = minCount + Math.floor(seededRandom(daySeed) * maxExtra)

    // For today — only generate up to current hour's order count
    let count = dayCount
    if (daysAgo === 0) {
      const hour = now.getUTCHours()
      const minute = now.getUTCMinutes()
      const ordersPerHour = 3 + (daySeed % 100 % 3)
      const hoursPassed = hour + minute / 60
      const maxOrders = 30 + (daySeed % 100 % 12)
      count = Math.min(Math.floor(hoursPassed * ordersPerHour), maxOrders)
    }

    for (let i = 0; i < count; i++) {
      const seed = daySeed * 1000 + i
      const product = pickProduct(seed + 1)
      const username = pickFromSeed(USERNAMES, seed + 3)
      const domain = pickFromSeed(EMAIL_DOMAINS, seed + 4)
      const emailLocal = username.replace(/[^a-z0-9]/g, "") + Math.floor(seededRandom(seed + 5) * 99)
      const masked = emailLocal.substring(0, 3) + "***"

      // Rating distribution: 70% 5★, 18% 4★, 8% 3★, 3% 2★, 1% 1★
      const ratingRoll = seededRandom(seed + 6)
      let rating: number
      if (ratingRoll < 0.70) rating = 5
      else if (ratingRoll < 0.88) rating = 4
      else if (ratingRoll < 0.96) rating = 3
      else if (ratingRoll < 0.99) rating = 2
      else rating = 1

      // Pick review text based on rating
      let reviewText: string
      if (rating >= 4) {
        reviewText = pickFromSeed(product.reviews, seed + 2)
      } else if (rating === 3) {
        reviewText = pickFromSeed(REVIEWS_3STAR, seed + 2)
      } else if (rating === 2) {
        reviewText = pickFromSeed(REVIEWS_2STAR, seed + 2)
      } else {
        reviewText = pickFromSeed(REVIEWS_1STAR, seed + 2)
      }

      // Helpful votes based on age
      let helpful: number
      if (daysAgo > 180) {
        helpful = 80 + Math.floor(seededRandom(seed + 7) * 120)
      } else if (daysAgo > 30) {
        helpful = 15 + Math.floor(seededRandom(seed + 7) * 65)
      } else if (daysAgo > 0) {
        helpful = Math.floor(seededRandom(seed + 7) * 15)
      } else {
        helpful = Math.floor(seededRandom(seed + 7) * 3)
      }

      // Team responses: 15% on 5★, 10% on 4★, 40% on ≤3★
      let teamResponse: string | null = null
      const responseRoll = seededRandom(seed + 8)
      if (rating === 5 && responseRoll < 0.15) {
        teamResponse = pickFromSeed(TEAM_RESPONSES_POSITIVE, seed + 9)
      } else if (rating === 4 && responseRoll < 0.10) {
        teamResponse = pickFromSeed(TEAM_RESPONSES_POSITIVE, seed + 9)
      } else if (rating <= 3 && responseRoll < 0.40) {
        teamResponse = pickFromSeed(TEAM_RESPONSES_NEGATIVE, seed + 9)
      }

      reviews.push({
        id: globalId++,
        text: reviewText,
        rating,
        product: product.name,
        product_id: product.id,
        username,
        email: `${masked}@${domain}`,
        time_label: getTimeLabel(daysAgo),
        verified: true,
        is_auto: false,
        refunded: false,
        helpful,
        team_response: teamResponse,
        created_at: formatDate(d),
      })
    }

    d.setDate(d.getDate() + 1)
  }

  return reviews.reverse()
}
