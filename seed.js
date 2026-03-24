// seed.js
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const USERS = [
  // 🇨🇳 Çin (10)
  { username: "LongWei88", country: "CN", flag: "🇨🇳" },
  { username: "ZhaoFighter", country: "CN", flag: "🇨🇳" },
  { username: "ChenStrike", country: "CN", flag: "🇨🇳" },
  { username: "XiaoMMA", country: "CN", flag: "🇨🇳" },
  { username: "HanCombat", country: "CN", flag: "🇨🇳" },
  { username: "FengWarrior", country: "CN", flag: "🇨🇳" },
  { username: "TangBrawler", country: "CN", flag: "🇨🇳" },
  { username: "WuKongMMA", country: "CN", flag: "🇨🇳" },
  { username: "LiuPunch", country: "CN", flag: "🇨🇳" },
  { username: "SunRising99", country: "CN", flag: "🇨🇳" },

  // 🇪🇸 İspanya (4)
  { username: "PabloKO", country: "ES", flag: "🇪🇸" },
  { username: "CarlosGrappler", country: "ES", flag: "🇪🇸" },
  { username: "IkerCombat", country: "ES", flag: "🇪🇸" },
  { username: "MadridBrawler", country: "ES", flag: "🇪🇸" },

  // 🇫🇷 Fransa (2)
  { username: "LucasSavate", country: "FR", flag: "🇫🇷" },
  { username: "RemiKickboxer", country: "FR", flag: "🇫🇷" },

  // 🇩🇪 Almanya (1)
  { username: "KlausFighter", country: "DE", flag: "🇩🇪" },

  // 🇹🇷 Türkiye (3)
  { username: "KaanMuay", country: "TR", flag: "🇹🇷" },
  { username: "EmreGrapple", country: "TR", flag: "🇹🇷" },
  { username: "BoraKombat", country: "TR", flag: "🇹🇷" },

  // 🇺🇸 Amerika (8)
  { username: "JakeSlammer", country: "US", flag: "🇺🇸" },
  { username: "TylerGroundGame", country: "US", flag: "🇺🇸" },
  { username: "BrandonOctagon", country: "US", flag: "🇺🇸" },
  { username: "CodyTapout", country: "US", flag: "🇺🇸" },
  { username: "RyanClinch", country: "US", flag: "🇺🇸" },
  { username: "DustinJab", country: "US", flag: "🇺🇸" },
  { username: "LoganWrestler", country: "US", flag: "🇺🇸" },
  { username: "KyleCageTime", country: "US", flag: "🇺🇸" },

  // 🇬🇧 İngiltere (2)
  { username: "AlfieBoxer", country: "GB", flag: "🇬🇧" },
  { username: "HarrisMMA", country: "GB", flag: "🇬🇧" },
];

// Gerçek kullanıcıyla aynı title listesi
const ALL_TITLES = [
  "Arena Rookie",
  "Rising Star",
  "Arena Master",
  "Champion",
  "Veteran",
];

async function seedUsers() {
  for (const user of USERS) {
    const email = `${user.username.toLowerCase()}@seed.local`;

    const wins = Math.floor(Math.random() * 30);
    const losses = Math.floor(Math.random() * 25);
    const draws = Math.floor(Math.random() * 5);
    const totalGames = wins + losses + draws;
    const winRate =
      totalGames > 0 ? Math.round((wins / totalGames) * 10000) / 100 : 0;

    // Kullanıcının kazandığı title sayısını rastgele belirle (en az 1 = Arena Rookie)
    const titleCount = Math.floor(Math.random() * ALL_TITLES.length) + 1;
    const unlockedTitles = ALL_TITLES.slice(0, titleCount);
    const activeTitle = unlockedTitles[unlockedTitles.length - 1];

    const createdAt = new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await db
      .collection("users")
      .doc(email)
      .set({
        username: user.username,
        email,
        createdAt,
        lastUsernameChangeAt: createdAt,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || email}`,
        activeTitle,
        unlockedTitles,
        achievements: {},
        stats: {
          points: Math.floor(Math.random() * 500) + 100, // min 100 (gerçek kullanıcı gibi)
          wins,
          losses,
          draws,
          totalGames,
          winRate,
        },
        isBot: true, // bot olduğunu işaretler, sorgularda filtreleyebilirsin
      });

    console.log(
      `${user.flag}  Created: ${user.username} | ${activeTitle} | ${wins}W ${losses}L`,
    );
  }

  console.log(`\n✅ Seeding complete! Total: ${USERS.length} users`);
}

seedUsers().catch(console.error);
