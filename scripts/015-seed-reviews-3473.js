import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── PRNG ──
let _s = 77
function sr() { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646 }
function pick(a) { return a[Math.floor(sr() * a.length)] }
function range(lo, hi) { return Math.floor(sr() * (hi - lo + 1)) + lo }

// ── Products ──
const P = [
  { id: "perm-spoofer", name: "Perm Spoofer", cat: "spoofer" },
  { id: "temp-spoofer", name: "Temp Spoofer", cat: "spoofer" },
  { id: "fortnite-external", name: "Fortnite External", cat: "cheat" },
  { id: "blurred", name: "Blurred DMA", cat: "dma" },
  { id: "streck", name: "Streck DMA", cat: "dma" },
  { id: "custom-dma-firmware", name: "Custom DMA Firmware", cat: "firmware" },
  { id: "dma-basic", name: "DMA Basic Bundle", cat: "bundle" },
  { id: "dma-advanced", name: "DMA Advanced Bundle", cat: "bundle" },
  { id: "dma-elite", name: "DMA Elite Bundle", cat: "bundle" },
]

// ── 500+ unique email prefixes ──
const EP = "alex,jake,mike,sam,chris,dan,nick,tom,josh,ryan,matt,luke,ben,kyle,adam,tyler,zach,connor,ethan,noah,liam,mason,logan,owen,james,leo,max,kai,ian,eli,cole,seth,drew,jace,reid,finn,dean,wade,beau,clay,troy,dale,ross,brad,todd,grant,blake,chase,derek,shane,barry,clint,floyd,roger,keith,wayne,frank,glenn,carl,steve,bruce,clark,peter,hank,tony,miles,oscar,felix,hugo,axel,lars,nils,sven,olaf,yuri,dima,vlad,igor,oleg,leon,rico,marco,luca,enzo,rafa,pablo,diego,andre,theo,remy,jules,noel,abel,joel,saul,gael,ares,zeus,odin,thor,loki,koda,bear,wolf,hawk,viper,cobra,raven,storm,blaze,frost,ghost,shade,spark,bolt,surge,proxy,hack,nite,dark,code,zer0,v0id,glitch,shadow,crack,wraith,phantom,spectr,nova,aimgod,headshot,clutch,frag,wallhax,espking,silent,hydra,cypher,pogger,goated,cranker,boxfight,editgod,piece,mongraal,gamer,fnplayer,cracked,demon,sweat,arena,champs,cashcup,wkeyer,dmauser,spoofgod,unbanme,hwidfix,cleanpc,freshstart,newid,safegame,legit,procheat,gameboost,ezwins,topfrag,mvp,skillgap,outplay,bigbrain,iq200,galaxy,quantum,nebula,cosmic,stellar,lunar,solar,astral,cipher,matrix,pixel,vector,binary,chrome,neon,plasma,laser,photon,electron,neutron,proton,quark,atom,helix,nexus,apex,zenith,summit,peak,crest,ridge,cliff,mesa,delta,sigma,omega,alpha,beta,gamma,onyx,ruby,jade,opal,cobalt,amber,ivory,coral,slate,steel,iron,bronze,silver,titan,raptor,falcon,eagle,osprey,condor,phoenix,dragon,hydra2,griffin,kraken,shadow9,darkwolf,nightfox,iceblade,firestorm,thunder,stormwind,frostbyte,blazerun,drift,slide,grind,boost,turbo,nitro,rocket,missile,bullet,tracer,sniper,scout,ranger,hunter,stalker,predator,assassin,ninja,samurai,ronin,shogun,sensei,legend,myth,epic,rare,ultra,mega,giga,tera,hyper,super,prime,elite,royal,imperial,reaper,slayer,crusher,breaker,smasher,ripper,shredder,destroyer,annihilator,dominator,xray,flash,flare,ember,cinder,ash,soot,char,thorn,spike,fang,claw,talon,edge,blade,saber,lance,pike,javelin,arrow,crossbow,siege,raid,assault,strike,surge2,pulse,wave,tide,flux,rift,warp,shift,twist,morph,clone,dupe,glitch2,bug,patch,update,hotfix,deploy,launch,ignite,kindle,torch,bonfire,inferno,comet,meteor,orbit,gravity,void2,abyss,chasm,depth,ocean,river,creek,brook,spring,lake,pond,marsh,reef,coast,shore,bay,cape,isle,grove,glade,vale,dale2,glen,moor,heath,field,plain,steppe,dune,oasis,mesa2,plateau,ravine,canyon,gorge,basin,harbor,port,dock,pier,wharf,anchor,helm,mast,stern,bow,deck,hull,keel,rudder,sail,compass,beacon,flint,slate2,stone,pebble,gravel,sand,dust,mist,fog,haze,dew,rain,drizzle,gust,breeze,zephyr,cyclone,twister,vortex,maelstrom".split(",")
const DOM = ["gmail.com","outlook.com","hotmail.com","yahoo.com","proton.me","icloud.com","aol.com","mail.com","gmx.com","zoho.com","pm.me","tutanota.com","fastmail.com","hey.com","live.com","msn.com"]

const usedEmails = new Set()
function genEmail() {
  let e
  do {
    e = pick(EP) + range(1, 999) + "@" + pick(DOM)
  } while (usedEmails.has(e))
  usedEmails.add(e)
  return e
}

const usedNames = new Set()
function genName() {
  const firsts = ["Alex","Jake","Mike","Sam","Chris","Dan","Nick","Tom","Josh","Ryan","Matt","Luke","Ben","Kyle","Adam","Tyler","Zach","Connor","Ethan","Noah","Liam","Mason","Logan","Owen","James","Leo","Max","Kai","Ian","Eli","Cole","Seth","Drew","Jace","Reid","Finn","Dean","Wade","Beau","Clay","Troy","Dale","Ross","Brad","Todd","Grant","Blake","Chase","Derek","Shane","Marco","Luca","Enzo","Diego","Andre","Theo","Remy","Jules","Hugo","Noel","Abel","Joel","Felix","Oscar","Axel","Lars","Nils","Sven","Vlad","Igor","Leon","Rico","Pablo","Victor","Roman","Emil","Odin","Wolf","Hawk","Storm","Blaze","Frost","Ghost","Spark","Bolt","Surge","Phoenix","Drake","Cruz","Jett","Knox","Nash","Zane","Rhys","Gage","Lane","Cruz2","Tate","Grey"]
  let n
  do {
    n = pick(firsts) + range(1, 9999)
  } while (usedNames.has(n))
  usedNames.add(n)
  return n
}

function genDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(range(0, 23), range(0, 59), range(0, 59))
  return d.toISOString()
}

function timeLabel(daysAgo) {
  if (daysAgo <= 0) return "today"
  if (daysAgo === 1) return "yesterday"
  if (daysAgo < 7) return daysAgo + " days ago"
  if (daysAgo < 30) return Math.floor(daysAgo / 7) + " weeks ago"
  if (daysAgo < 365) return Math.floor(daysAgo / 30) + " months ago"
  return Math.floor(daysAgo / 365) + " years ago"
}

// ── 5-star review templates per category (80+ each, way more variety) ──
const T5 = {
  spoofer: [
    "got permabanned last week and this spoofer brought me back to life. playing clean since day 1 no issues",
    "been hwid banned for months tried everything else and nothing worked until i found this. instant unban legit magic",
    "spoofer is insane. changed my hwid in seconds and i was back in the game. no crashes no problems at all",
    "used 3 other spoofers before this one and they all got detected. this one has been safe for 4 months straight now",
    "my friend recommended this after his ban got lifted. tried it myself and yeah its the real deal no cap",
    "cleanest spoofer on the market hands down. one click and ur hwid is completely fresh. support was helpful too",
    "got banned on 3 accounts and this fixed everything. playing on all of them now with zero issues whatsoever",
    "was about to buy a whole new pc because of my hwid ban but this saved me hundreds. works perfectly every single time",
    "spoofer hasnt been detected in 6 months thats actually insane. other ones get caught within weeks usually",
    "the setup took literally 2 minutes and my ban was gone. best money ive ever spent on anything gaming related tbh",
    "thought hwid bans were permanent until i found this. undetected and working flawlessly since february",
    "this spoofer saved my gaming career not even joking. went from permabanned to champion rank in 2 weeks",
    "installation was braindead easy. even my buddy who knows nothing about computers got it working in 5 mins",
    "been spoofing for 8 months now and still clean. the devs actually update this thing regularly which matters",
    "tried the temp spoofer first then upgraded to perm. both work amazing but perm is worth the extra for sure",
    "every anticheat update i get nervous but this spoofer just keeps working. devs are always on top of patches",
    "used to spend hours trying to manually change my hwid but this does it perfectly in one click. massive W",
    "my whole squad uses this spoofer now after seeing my results. all of us unbanned and playing ranked again",
    "the serial change feature is clutch. completely wipes all hardware identifiers. anticheat cant see anything",
    "customer support literally walked me through the whole setup on discord. got it working in under 10 minutes",
    "this thing spoofs everything - drives disk serials mac address the whole nine yards. absolutely thorough",
    "went from banned on every account to having 5 clean accounts running simultaneously. spoofer is godtier",
    "been recommending this to everyone in my discord server. already got like 12 people unbanned with it",
    "the perm spoofer is worth every penny. one purchase and youre set for life. no subscriptions no bs",
    "updated my drivers and it still works perfectly. some spoofers break after driver updates but not this one",
    "i was skeptical at first because nothing else worked but this actually delivered. playing ban-free since march",
    "easiest unban process ive ever seen. download run click done. back in the lobby within 5 minutes total",
    "this is the only spoofer that actually works against the latest anticheat versions. tested it myself thoroughly",
    "bought it for fortnite ban but it works for every game. unbanned across warzone apex and fortnite all at once",
    "the fact that this survives windows updates is impressive. most spoofers die after a major windows patch",
  ],
  cheat: [
    "the aimbot on this is buttery smooth. nobody can tell its not legit because the smoothing is perfect",
    "esp is incredibly clean and the menu is so easy to use. been running it for 3 months without a single issue",
    "this fn external is undetected since launch thats actually crazy. best purchase ive made for gaming",
    "aim assist feels completely natural. my friends spectate me and cant tell the difference from a legit player",
    "the fov settings are perfect. you can make it look completely natural or go full rage mode your choice",
    "finally found a cheat that actually works and doesnt get you banned within a week. this one is built different",
    "box esp and skeleton are so clean. the visuals dont lag or flicker at all even in intense build fights",
    "been using this external for 5 months now and still going strong. zero bans zero detections absolute beast",
    "the smoothing algorithm on the aimbot is next level. hits look completely organic even on replay",
    "started using this and my kd went from 1.2 to 4.8 in a week. teammates think i just got really good lmao",
    "stream proof mode works perfectly. i stream with this on and nothing shows on obs at all its insane",
    "the triggerbot feature is insane for shotgun fights. instant reaction time but looks completely legit",
    "this cheat respects the game more than full rage cheats. you can play competitive without anyone suspecting",
    "updates come out within hours of game patches. devs are actually dedicated and on top of every single update",
    "the prediction is next level. hits moving targets perfectly even when theyre building and editing at full speed",
    "running this on my main account for 4 months and not a single warning or ban. thats confidence in the product",
    "the softaim feature is underrated. makes your aim look naturally good without any obvious locking behavior",
    "loot esp saves so much time. i can see every chest supply drop and weapon through walls. huge advantage early game",
    "tried like 5 other fn cheats and they all got me banned. this one is the only one thats actually safe long term",
    "the config system is perfect. saved my settings once and now every update it just loads them automatically",
    "recoil control on this is chef kiss. my ar spray is literally a laser beam now and it looks completely natural",
    "been in champions league with this running the whole time. not a single manual ban or automated detection",
    "the distance display on esp is so useful for sniper shots. know exactly when to engage and when to hold",
    "this external doesnt inject into the game at all which is why its so safe. smart approach by the devs",
    "customizable esp colors are a nice touch. i can see enemies in bright red and teammates in green instantly",
    "player warning system is genius. alerts me when someone is looking at me so i can react before they shoot",
    "the silent aim option is incredible for tournaments. hits shots that look like pure skill every single time",
    "circle prediction feature saved me so many games. always know where to rotate and when to start moving",
    "inventory esp lets me see what weapons everyone has. huge tactical advantage in endgame scenarios",
    "been using since season 2 and the devs have never missed a single update. reliability is unmatched honestly",
  ],
  dma: [
    "dma cheat is on another level. completely hardware level so nothing runs on gaming pc at all. undetectable",
    "blurred is the best dma cheat ive ever used. the features are insane and it never gets detected period",
    "streck is amazing value for what you get. all the essential features at a price that doesnt break the bank",
    "the radar on this dma cheat is crystal clear. see every player on a second monitor in real time no lag",
    "running dma means zero software on my gaming pc. anticheat literally cannot find anything because theres nothing",
    "the aimbot through dma is incredible. smooth as butter and impossible to detect from the game side",
    "been using blurred for 7 months in competitive. not a single ban across any of my accounts its ridiculous",
    "the overlay quality on dma is sharper than any software cheat ive used. colors are vivid and no ghosting",
    "setup was actually easier than expected. plugged in the card loaded the firmware and was gaming in 20 mins",
    "dma approach is genius. since nothing touches the game pc theres literally nothing for anticheat to scan",
    "streck has everything i need at a great price. esp aimbot radar all running smooth through the dma card",
    "the performance is incredible. zero fps impact because all processing happens on the second computer",
    "blurred dma features are premium quality. the bone esp skeleton rendering is the cleanest ive ever seen",
    "my friend got me into dma cheats and i can never go back to software. the safety level is incomparable",
    "the dma radar is a game changer for competitive. see everyone on the map and plan rotations perfectly",
    "running this on a dedicated capture card setup and the visual quality is stunning. no lag no artifacts",
    "streck updates fast after game patches. usually within 2-4 hours the new version is ready to download",
    "blurred has features i didnt even know i needed. the loot filter alone saves me minutes every single match",
    "the admin panel for dma settings is clean and intuitive. change any setting on the fly without restarting",
    "dma gives me peace of mind. no kernel level detection no ring0 scanning nothing can find this setup",
    "been running blurred on lan tournaments and nobody has a clue. hardware level is the future of this scene",
    "streck might be budget but the features dont feel budget at all. everything works exactly as described",
    "the customization on blurred is insane. literally every visual element can be tweaked to your preference",
    "dma aimbot with hardware acceleration is noticeably smoother than any software aimbot ive used before",
    "playing in scrims with dma and consistently winning. teammates think i just have perfect game sense lol",
    "zero crashes zero freezes zero bsods. dma is so stable compared to software cheats that crash constantly",
    "the sound esp through dma is a nice touch. hear footsteps with directional audio overlay on screen",
    "switched from software to dma 8 months ago and its like playing a completely different game. total freedom",
    "blurred devs are passionate about the product. you can tell they actually use it themselves and care about quality",
    "streck for the price is unbeatable. i compared features with products twice the cost and streck holds up",
  ],
  firmware: [
    "custom firmware made my dma card completely invisible to any detection. the craftsmanship is incredible",
    "flashing was nerve wracking at first but the guide was perfect. firmware loaded first try zero issues",
    "this firmware is the missing piece for dma safety. without it your card can still be fingerprinted",
    "went from detectable to invisible in 15 minutes. the custom firmware changes everything about dma security",
    "the unique serial numbers generated are perfect. every card gets a completely unique identity thats genius",
    "firmware updates come fast whenever a new detection method appears. devs are proactive not reactive",
    "my dma card was getting flagged until i flashed this firmware. now its completely invisible to everything",
    "the device descriptor spoofing is incredible. card identifies as a generic usb device now. completely stealth",
    "was worried about bricking my card but the flashing tool has a failsafe recovery mode. worked flawlessly",
    "support helped me through the flashing process live on discord. took 10 minutes total start to finish",
    "this firmware is what separates a detectable dma setup from a truly invisible one. essential purchase",
    "the bar descriptor randomization is a feature i havent seen anywhere else. next level stealth technology",
    "flashed 3 different dma cards with this firmware and all 3 worked perfectly first time. consistency is key",
    "firmware makes my card show up as a completely different device in device manager. undetectable approach",
    "the memory timing optimization in the firmware actually improved my dma read speeds by like 15 percent",
    "custom firmware plus blurred is the ultimate combo. literally cannot be detected by any current anticheat",
    "been running custom firmware for 9 months and zero detections. this is what real undetected means",
    "the bios level changes this firmware makes are permanent and survive any windows reinstall. truly persistent",
    "other firmware providers just change the pid vid but this one goes deep into descriptor spoofing. proper stealth",
    "my card was on the ban list before flashing. after custom firmware its a completely new device to the system",
    "firmware flashing tool auto detects your card model and applies the right config. couldnt be easier honestly",
    "the stealth features in this firmware are military grade. complete device identity transformation",
    "was using stock firmware and got flagged within a week. custom firmware fixed everything permanently",
    "the read speed optimizations alone make this worth it. faster dma reads mean less latency on the overlay",
    "support sent me a custom build for my specific card revision when the generic one didnt work. above and beyond",
  ],
  bundle: [
    "the elite bundle is insane value. dma card firmware cheat all configured and ready to go out of the box",
    "got the basic bundle and it had everything i needed to get started. great entry point into dma cheating",
    "advanced bundle came with everything pre configured. literally plug and play within 15 minutes of delivery",
    "delivery was fast af. ordered on monday got it thursday. everything was packaged perfectly and working",
    "the bundle saved me so much money vs buying everything separately. plus everything is guaranteed compatible",
    "elite bundle is premium quality. the dma card is top tier and the firmware was already flashed perfectly",
    "ordered the basic bundle as a gift for my friend. he was gaming with it the same day it arrived. easy setup",
    "the advanced bundle includes features i didnt even know existed. the preconfigured settings are perfect",
    "bundle packaging was discreet and professional. no one would know whats inside just looking at the box",
    "got the elite bundle and the included setup guide made everything crystal clear. gaming within 30 mins of unboxing",
    "the compatibility guarantee with bundles is clutch. everything works together perfectly out of the box",
    "ordered basic bundle upgraded to advanced a month later. both experiences were flawless from ordering to gaming",
    "the dma card in the elite bundle is top shelf quality. build quality and performance exceeded my expectations",
    "bundle came with pre loaded configs for multiple games. didnt even need to tweak anything it just worked",
    "delivery tracking was accurate and fast. support messaged me proactively with tracking info which was nice",
    "the value of the advanced bundle is crazy. everything you need in one package at a price that makes sense",
    "got the elite bundle for christmas and its the best thing ive bought all year. absolutely worth every penny",
    "basic bundle is perfect for beginners. comes with everything and the setup documentation is super clear",
    "the bundle approach means everything is tested together before shipping. no compatibility headaches at all",
    "ordered two bundles one for me one for my duo partner. both arrived fast and both work identically perfect",
    "elite bundle includes premium support which saved me when i had a config question. response in minutes",
    "the pre flashed firmware in the bundle is a huge time saver. no need to flash anything yourself",
    "advanced bundle has the perfect balance of features and price. recommended it to my whole team already",
    "bundle arrived in 2 days to US. international shipping for a friend took 5 days which is still fast",
    "the cable management kit in the elite bundle is a nice touch. keeps the dma setup clean and organized",
  ],
}

// ── 4-star templates ──
const T4 = [
  { t: "really good product overall but the setup guide could be a bit more detailed for complete beginners", cats: ["spoofer","cheat","dma","firmware","bundle"] },
  { t: "works great but wish the menu had more customization options for the ui. small thing tho still solid", cats: ["cheat","dma"] },
  { t: "amazing product but took a day to ship instead of same day. not a big deal but worth mentioning", cats: ["bundle"] },
  { t: "been using for 2 months no issues at all. only reason for 4 stars is the price could be a little lower", cats: ["cheat","dma","spoofer"] },
  { t: "everything works perfectly but the initial config takes some time to get right. support helped tho", cats: ["dma","firmware"] },
  { t: "solid product very safe very reliable. only giving 4 because the discord support response took 2 hours", cats: ["spoofer","cheat","dma","firmware","bundle"] },
  { t: "love the product and use it daily. minor fps dip on my lower end setup but nothing game breaking", cats: ["cheat","dma"] },
  { t: "great spoofer works on everything. wish there was a video tutorial instead of just text instructions", cats: ["spoofer"] },
  { t: "firmware flashing went smooth but i wish the tool had a progress bar. was stressful watching it sit there", cats: ["firmware"] },
  { t: "bundle is amazing value but the packaging could be more premium for the price point. product itself is A+", cats: ["bundle"] },
  { t: "incredible features and very safe. only thing missing is a built in config sharing system between users", cats: ["cheat","dma"] },
  { t: "product is 10/10 but the download link expired and i had to contact support for a new one. minor inconvenience", cats: ["spoofer","cheat"] },
  { t: "works flawlessly on my setup. giving 4 stars because updates sometimes take 6-8 hours after a game patch", cats: ["cheat","dma"] },
  { t: "the product itself is perfect but i wish they accepted more payment methods. crypto was fine tho", cats: ["spoofer","cheat","dma","firmware","bundle"] },
  { t: "dma card quality is excellent. only missing star because the cable included was a bit short for my setup", cats: ["bundle","dma"] },
  { t: "super reliable and safe. just wish there was a mobile app to monitor status when im away from my pc", cats: ["spoofer","dma"] },
  { t: "streck does exactly what it promises for the price. few less features than blurred but still very solid", cats: ["dma"] },
  { t: "excellent results and great support team. the only minor thing is the ui could look a bit more modern", cats: ["cheat","dma","spoofer"] },
  { t: "everything works as advertised. four stars because i had to reinstall once after a windows update", cats: ["spoofer","cheat"] },
  { t: "fast delivery great product. would be 5 stars but the tracking info wasnt updated until it was almost here", cats: ["bundle"] },
]

// ── 3/2/1 star templates with responses ──
const T3 = [
  { t: "decent product but had some issues setting it up initially. support fixed it but took a while", cats: ["spoofer","cheat","dma","firmware"], r: "Sorry about the setup difficulties! We've since updated our installation guide with video tutorials. Please reach out anytime if you need help." },
  { t: "works ok but i expected more features for the price honestly. does the basics well tho", cats: ["cheat","dma"], r: "We appreciate the feedback! We're constantly adding new features. Check our changelog for recent updates -- you might find some new additions you'll love." },
  { t: "spoofer worked but had to run it twice before it took effect. once it worked it was fine tho", cats: ["spoofer"], r: "This can happen if background processes interfere. Running as admin with antivirus disabled first usually fixes this. We've also pushed an update to handle this automatically." },
  { t: "firmware flashing was confusing at first. it works now but the process could be smoother for sure", cats: ["firmware"], r: "Thank you for the feedback! We've completely redesigned our flashing tool with a step-by-step wizard. Please download v2.0 for a much smoother experience." },
  { t: "bundle arrived on time but the dma card was different model than pictured. still works fine tho", cats: ["bundle"], r: "We occasionally substitute equivalent cards when specific models are out of stock. All substitutes meet the same performance specs. Sorry for the confusion!" },
  { t: "product is fine but the update schedule is a bit slow after major game patches", cats: ["cheat","dma"], r: "We understand the frustration. We've expanded our dev team and now guarantee updates within 4 hours of any game patch." },
  { t: "had some lag on the overlay initially. tweaked some settings and its better now but wasnt plug and play", cats: ["dma"], r: "Overlay lag is usually a USB bandwidth issue. We now include an optimization guide with every purchase. Happy to help you dial in the perfect settings!" },
  { t: "its alright. nothing groundbreaking but gets the job done for casual play. expected a bit more honestly", cats: ["cheat","spoofer"], r: "We appreciate the honest review! If you haven't explored our advanced settings, there's a lot of power there. Our support team can help you unlock the full potential." },
]

const T2 = [
  { t: "had a lot of trouble getting it to work. support eventually helped but it took 3 days to resolve", cats: ["spoofer","cheat","dma","firmware"], r: "We sincerely apologize for the delayed response. We've since hired additional support staff and now guarantee responses within 2 hours. We'd love to make it right for you.", refund: false },
  { t: "got detected once after a big update. they fixed it fast but still lost my account over it", cats: ["cheat","dma"], r: "We're deeply sorry about the detection. This was an isolated incident after a major anticheat overhaul. We've issued a full refund and implemented emergency patching protocols to prevent this.", refund: true },
  { t: "the esp overlay had some visual glitches on my ultrawide monitor. worked fine on regular monitor tho", cats: ["cheat","dma"], r: "Thank you for reporting this! We've pushed an ultrawide display fix in our latest update. Please update to the latest version and let us know if the issue persists.", refund: false },
  { t: "bundle shipping took way longer than advertised. product itself works but the wait was frustrating", cats: ["bundle"], r: "We apologize for the shipping delay. This was during a high-demand period. We've since partnered with faster logistics providers. Full refund has been issued for the inconvenience.", refund: true },
  { t: "firmware flash failed first time and i panicked. second try worked but the experience was stressful", cats: ["firmware"], r: "We're sorry for the stress! We've added automatic rollback protection to our flashing tool so this can't happen anymore. Your card is perfectly safe.", refund: false },
]

const T1 = [
  { t: "got detected on first day. anticheat flagged it immediately and i got banned on my main account", r: "We're extremely sorry. After investigation this was caused by an incorrect configuration on your end. We've issued a full refund sent you a replacement license and our team set up the correct config for you personally.", refund: true },
  { t: "product didnt work at all on my system. tried everything support said and nothing fixed it", r: "We sincerely apologize. This was a rare hardware incompatibility issue. Full refund has been processed and we've added your hardware config to our compatibility testing to prevent this for future customers.", refund: true },
  { t: "firmware bricked my dma card during flashing. had to get a new one which cost me extra money", r: "We deeply apologize for this terrible experience. This was caused by a power interruption during flashing. We've issued a full refund sent a free replacement card and our flashing tool now has fail-safe recovery mode.", refund: true },
  { t: "shipping was a disaster. package arrived damaged and the dma card had a bent pin. very disappointing", r: "We are so sorry about this. We've completely overhauled our packaging process. A full refund has been issued and a new bundle is being shipped to you express at no charge with premium protective packaging.", refund: true },
  { t: "charged me twice for the same order and support took forever to respond about the refund", r: "We sincerely apologize for the billing error and slow response. Both charges have been refunded in full plus we've added a complimentary month of premium support to your account. We've also fixed the payment processing bug.", refund: true },
]

// ── Build reviews ──
// Target: 3473 total = 2947 five + 347 four + 108 three + 48 two + 23 one
async function main() {
  console.log("Deleting old reviews...")
  const { error: delErr } = await supabase.from("reviews").delete().gte("id", 0)
  if (delErr) console.error("Delete error:", delErr.message)

  const reviews = []
  const productIds = P.map(p => p.id)
  let autoCount = 0

  // ── 2947 five-star reviews ──
  for (let i = 0; i < 2947; i++) {
    const prod = P[i % P.length]
    const catKey = prod.cat === "dma" ? "dma" : prod.cat
    const templates = T5[catKey] || T5.cheat
    const isAuto = autoCount < 2300
    if (isAuto) autoCount++
    const baseText = templates[i % templates.length]
    // Make each review unique by combining template with small variations
    const variations = [
      "", " highly recommend", " 10/10 would buy again", " absolute fire", " no complaints whatsoever",
      " seriously the best", " exceeded expectations", " game changer fr", " worth every single penny",
      " cant say enough good things", " been telling everyone about this", " life saver honestly",
      " top tier product", " goated purchase", " massive W for real", " chef kiss quality",
      " nothing else compares", " this is the one", " certified banger", " S tier no question",
      " completely satisfied", " better than expected", " insanely good", " premium quality",
      " exactly what i needed", " flawless experience", " zero regrets", " love this thing",
      " hands down the best", " perfection honestly", " could not be happier",
    ]
    const text = isAuto ? "" : baseText + variations[i % variations.length]
    const daysAgo = range(1, 365)

    reviews.push({
      text,
      rating: 5,
      username: genName(),
      email: genEmail(),
      product_id: prod.id,
      time_label: timeLabel(daysAgo),
      is_auto: isAuto,
      verified: true,
      team_response: null,
      refunded: false,
      helpful: range(0, 24),
      created_at: genDate(daysAgo),
    })
  }

  // ── 347 four-star reviews ──
  for (let i = 0; i < 347; i++) {
    const prod = P[i % P.length]
    const matching = T4.filter(t => t.cats.includes(prod.cat === "dma" ? "dma" : prod.cat))
    const tmpl = matching.length > 0 ? matching[i % matching.length] : T4[i % T4.length]
    const daysAgo = range(1, 300)
    reviews.push({
      text: tmpl.t,
      rating: 4,
      username: genName(),
      email: genEmail(),
      product_id: prod.id,
      time_label: timeLabel(daysAgo),
      is_auto: false,
      verified: true,
      team_response: null,
      refunded: false,
      helpful: range(0, 15),
      created_at: genDate(daysAgo),
    })
  }

  // ── 108 three-star reviews ──
  for (let i = 0; i < 108; i++) {
    const prod = P[i % P.length]
    const matching = T3.filter(t => t.cats.includes(prod.cat === "dma" ? "dma" : prod.cat))
    const tmpl = matching.length > 0 ? matching[i % matching.length] : T3[i % T3.length]
    const daysAgo = range(14, 365)
    reviews.push({
      text: tmpl.t,
      rating: 3,
      username: genName(),
      email: genEmail(),
      product_id: prod.id,
      time_label: timeLabel(daysAgo),
      is_auto: false,
      verified: true,
      team_response: tmpl.r,
      refunded: false,
      helpful: range(0, 8),
      created_at: genDate(daysAgo),
    })
  }

  // ── 48 two-star reviews ──
  for (let i = 0; i < 48; i++) {
    const prod = P[i % P.length]
    const matching = T2.filter(t => t.cats.includes(prod.cat === "dma" ? "dma" : prod.cat))
    const tmpl = matching.length > 0 ? matching[i % matching.length] : T2[i % T2.length]
    const daysAgo = range(30, 365)
    reviews.push({
      text: tmpl.t,
      rating: 2,
      username: genName(),
      email: genEmail(),
      product_id: prod.id,
      time_label: timeLabel(daysAgo),
      is_auto: false,
      verified: true,
      team_response: tmpl.r,
      refunded: tmpl.refund || false,
      helpful: range(0, 5),
      created_at: genDate(daysAgo),
    })
  }

  // ── 23 one-star reviews ──
  for (let i = 0; i < 23; i++) {
    const prod = P[i % P.length]
    const tmpl = T1[i % T1.length]
    const daysAgo = range(60, 365)
    reviews.push({
      text: tmpl.t,
      rating: 1,
      username: genName(),
      email: genEmail(),
      product_id: prod.id,
      time_label: timeLabel(daysAgo),
      is_auto: false,
      verified: true,
      team_response: tmpl.r,
      refunded: tmpl.refund || false,
      helpful: range(0, 3),
      created_at: genDate(daysAgo),
    })
  }

  console.log(`Built ${reviews.length} reviews (target: 3473)`)
  console.log(`5-star: ${reviews.filter(r => r.rating === 5).length} (auto: ${reviews.filter(r => r.rating === 5 && r.is_auto).length})`)
  console.log(`4-star: ${reviews.filter(r => r.rating === 4).length}`)
  console.log(`3-star: ${reviews.filter(r => r.rating === 3).length}`)
  console.log(`2-star: ${reviews.filter(r => r.rating === 2).length}`)
  console.log(`1-star: ${reviews.filter(r => r.rating === 1).length}`)

  // Insert in batches of 500
  const BATCH = 500
  for (let i = 0; i < reviews.length; i += BATCH) {
    const batch = reviews.slice(i, i + BATCH)
    const { error } = await supabase.from("reviews").insert(batch)
    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message)
    } else {
      console.log(`Batch ${Math.floor(i/BATCH)+1}: inserted ${batch.length} (${i+batch.length}/${reviews.length})`)
    }
  }

  // Verify
  const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true })
  console.log(`Final DB count: ${count}`)
}

main().catch(console.error)
