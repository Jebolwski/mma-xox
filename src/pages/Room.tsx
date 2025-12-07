import { useEffect, useContext, useRef, useState } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { arrayUnion, Timestamp } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc,
  documentId,
  runTransaction,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { usePageTitle } from "../hooks/usePageTitle";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import return_img from "../assets/return.png";
import win from "../assets/sounds/win.mp3";
import draw from "../assets/sounds/draw.mp3";
import fighters_url from "../assets/data/fighters_updated_new.json";
import wrong from "../assets/sounds/wrong.mp3";
import correct from "../assets/sounds/correct.mp3";
import Filters from "../logic/filters";
import { Fighter, FilterDifficulty } from "../interfaces/Fighter";
import { ThemeContext } from "../context/ThemeContext";
import Confetti from "react-confetti";
import { getDoc, increment } from "firebase/firestore";
import { useWindowSize } from "react-use";
import { ROOM_TTL_MS } from "../services/roomCleanup";
import { useAuth } from "../context/AuthContext";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const stateRole = (location.state as any)?.role;
  const statePlayerName = (location.state as any)?.name;
  const stateIsRanked = (location.state as any)?.isRanked;

  const [searchParams] = useSearchParams();
  const role = stateRole || searchParams.get("role");
  const playerName = statePlayerName || searchParams.get("name");
  const isRanked = stateIsRanked ?? searchParams.get("ranked") === "true";
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const [gameState, setGameState] = useState<any>(null);
  const [guest, setGuest] = useState<any>(null);
  const [turn, setTurn] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [filters, setFilters]: any = useState();
  const [selected, setSelected]: any = useState();
  const [showConfetti, setShowConfetti] = useState(false);
  const prevGuestNow = useRef<string | null>(null);

  usePageTitle(roomId ? `MMA XOX - Room ${roomId}` : "MMA XOX • Room");

  const isRankedRoom = (gameState?.isRankedRoom ?? isRanked) === true;

  const showUserBanner =
    !!currentUser || (!isRankedRoom && (role === "host" || role === "guest"));

  const [fighter00, setFighter00]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter01, setFighter01]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter02, setFighter02]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter10, setFighter10]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter11, setFighter11]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter12, setFighter12]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter20, setFighter20]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter21, setFighter21]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });
  const [fighter22, setFighter22]: any = useState({
    url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
    text: "",
    bg: "from-stone-300 to-stone-500",
  });

  const [filtersSelected, setFiltersSelected]: any = useState([]);
  const [pushFirestore, setPushFirestore]: any = useState(false);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [positionsFighters, setPositionsFighters]: any = useState({
    position03: {},
    position04: {},
    position05: {},
    position13: {},
    position14: {},
    position15: {},
    position23: {},
    position24: {},
    position25: {},
  });
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [timerLength, setTimerLength] = useState("-2");
  const [hasExited, setHasExited] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [guestForfeitModal, setGuestForfeitModal] = useState(false);
  const [hostForfeitModal, setHostForfeitModal] = useState(false);
  const [rankedForfeitModal, setRankedForfeitModal] = useState(false);
  const [guestForfeitVictoryModal, setGuestForfeitVictoryModal] =
    useState(false);
  const [showWaitingGuest, setShowWaitingGuest] = useState(false);
  const [userUsername, setUserUsername] = useState("");
  const { width, height } = useWindowSize();

  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("muted") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("muted", JSON.stringify(muted));
    } catch {}
  }, [muted]);

  // Firestore'dan username'i çek
  useEffect(() => {
    if (currentUser?.email) {
      const userRef = doc(db, "users", currentUser.email);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserUsername(docSnap.data().username || "");
        }
      });
    }
  }, [currentUser]);

  // sfx helper
  const playSfx = (src: string) => {
    if (muted) return;
    try {
      const a = new Audio(src);
      a.volume = 0.9;
      a.play();
    } catch {}
  };

  useEffect(() => {
    if (gameState?.winner) {
      if (gameState.winner !== "draw") {
        setShowConfetti(true);
      }
      // Bu useEffect sadece bir kere tetiklenir, bu yüzden kontrol ekleyelim
      if (!gameState.statsUpdated) {
        // statsUpdated gibi bir flag kontrolü
        updatePlayerStats(gameState.winner);
        // Tekrar çalışmasını önlemek için odaya bir flag yazabiliriz
        if (roomId && role === "host") {
          const roomRef = doc(db, "rooms", roomId);
          updateDoc(roomRef, { statsUpdated: true });
        }
      }
    } else {
      setShowConfetti(false);
    }
  }, [gameState?.winner]);

  useEffect(() => {
    if (!roomId || !gameState) return;

    // Eğer ranked match + gameStarted ve winner yok ise state'i koru
    if (gameState.isRankedRoom && gameState.gameStarted && !gameState.winner) {
      // Zaten devam eden oyunu koru; yeni başlatma / resetleme yapma
      // (mevcut snapshot listener zaten board/turn/timer'ı senkronize eder)
      // Eğer resetGame() veya startGame() çağrısı varsa, bunu atlayın:
      // setGameStarted(true); // mevcut gameState.gameStarted kullanılıyor
      // setBoard(...) gibi local state varsa snapshot'tan alın
    } else if (!gameState.gameStarted && role === "host") {
      // Host refresh yaptıysa ama oyun başlamamışsa izin ver
    }
  }, [roomId, gameState, role]);

  useEffect(() => {
    document.title = "MMA XOX - Online Game";
  }, []);

  useEffect(() => {
    if (!roomId || !gameState || !gameState.gameStarted || gameState.winner) {
      return; // Oyun başlamamışsa veya bitmişse heartbeat gönderme
    }

    const heartbeatInterval = setInterval(async () => {
      try {
        const roomRef = doc(db, "rooms", roomId);

        if (role === "host") {
          // Host heartbeat gönder
          await updateDoc(roomRef, {
            hostLastActive: serverTimestamp(),
          });
        } else if (role === "guest") {
          // Guest heartbeat gönder
          await updateDoc(roomRef, {
            guestLastActive: serverTimestamp(),
          });
        }
      } catch (error) {
        console.warn("Heartbeat update failed:", error);
      }
    }, 5000); // Her 5 saniyede bir

    return () => clearInterval(heartbeatInterval);
  }, [roomId, gameState?.gameStarted, gameState?.winner, role]);

  // TIMEOUT CHECKER: Her 15 saniyede bir opponent'in heartbeat'ini kontrol et
  useEffect(() => {
    if (!roomId || !gameState || !gameState.gameStarted || gameState.winner) {
      return; // Oyun başlamamışsa veya bitmişse kontrol yapma
    }

    let hasAlreadyForfeit = false; // Forfeit'i sadece bir kere tetikle

    const timeoutCheckInterval = setInterval(async () => {
      if (hasAlreadyForfeit) return; // Zaten forfeit olduysa çık

      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) return;

        const data = roomSnap.data();

        // Eğer zaten winner varsa, artık kontrol yapma
        if (data.winner) {
          hasAlreadyForfeit = true;
          return;
        }

        const now = Date.now();
        const TIMEOUT_MS = 15000; // 15 saniye

        // Host timeout kontrol et (guest bakısı)
        if (role === "guest") {
          const hostLastActive = data.hostLastActive?.toMillis?.() || 0;
          const hostTimeout = now - hostLastActive > TIMEOUT_MS;

          if (hostTimeout) {
            hasAlreadyForfeit = true;

            // Transaction ile atomik güncelleme yap
            await runTransaction(db, async (transaction) => {
              const roomDoc = await transaction.get(roomRef);
              if (!roomDoc.exists() || roomDoc.data().winner) return; // Already updated

              transaction.update(roomRef, {
                winner: "blue",
                gameStarted: false,
                isForfeited: true, // 🚩 Forfeit flag ekle (updatePlayerStats'da skip etmek için)
                lastActivityAt: serverTimestamp(),
              });

              // Stats güncelle
              if (data.hostEmail && data.guestEmail) {
                const hostRef = doc(db, "users", data.hostEmail);
                const guestRef = doc(db, "users", data.guestEmail);

                transaction.update(hostRef, {
                  "stats.points": increment(-5),
                  "stats.losses": increment(1),
                  "stats.totalGames": increment(1),
                });

                transaction.update(guestRef, {
                  "stats.points": increment(15),
                  "stats.wins": increment(1),
                  "stats.totalGames": increment(1),
                });
              }
            }).then(() => {
              const hostEmail = gameState.hostEmail;
              const guestEmail = gameState.guestEmail;
              updateWinRates(hostEmail, guestEmail);
            });

            // Modal aç - guest seçim yapabilir
            setHostForfeitModal(true);
            toast.success("🏆 Host disconnected! You win!");
          }
        } else if (role === "host") {
          // Guest timeout kontrol et (host bakısı)
          const guestLastActive = data.guestLastActive?.toMillis?.() || 0;
          const guestTimeout = now - guestLastActive > TIMEOUT_MS;

          if (guestTimeout && data.guest?.now) {
            hasAlreadyForfeit = true;

            // Transaction ile atomik güncelleme yap
            await runTransaction(db, async (transaction) => {
              const roomDoc = await transaction.get(roomRef);
              if (!roomDoc.exists() || roomDoc.data().winner) return; // Already updated

              transaction.update(roomRef, {
                winner: "red",
                gameStarted: false,
                isForfeited: true, // 🚩 Forfeit flag ekle
                positionsFighters: {},
                hostReady: false,
                guest: { prev: null, now: null },
                guestReady: false,
                lastActivityAt: serverTimestamp(),
                expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
              });

              // Stats güncelle
              if (data.hostEmail && data.guestEmail) {
                const hostRef = doc(db, "users", data.hostEmail);
                const guestRef = doc(db, "users", data.guestEmail);

                transaction.update(hostRef, {
                  "stats.points": increment(15),
                  "stats.wins": increment(1),
                  "stats.totalGames": increment(1),
                });

                transaction.update(guestRef, {
                  "stats.points": increment(-5),
                  "stats.losses": increment(1),
                  "stats.totalGames": increment(1),
                });
              }
            });

            // Modal aç - host seçim yapabilir
            setGuestForfeitModal(true);
            toast.success("🏆 Guest disconnected! You win!");
          }
        }
      } catch (error) {
        console.warn("Timeout check failed:", error);
      }
    }, 15000); // Her 15 saniyede bir kontrol et

    return () => clearInterval(timeoutCheckInterval);
  }, [roomId, gameState?.gameStarted, gameState?.winner, role, navigate]);

  // Wait for Host modal'ını kapat eğer host yeni maç başlattıysa
  useEffect(() => {
    if (
      showWaitingGuest &&
      gameState?.gameStarted === false &&
      gameState?.winner === null
    ) {
      // Oyun reset edildi, modal'ı kapat
      setShowWaitingGuest(false);
    }
  }, [gameState?.gameStarted, gameState?.winner, showWaitingGuest]);

  useEffect(() => {
    if (!roomId) return;

    const collectionRef = collection(db, "rooms");
    const q = query(collectionRef, where(documentId(), "==", roomId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        if (role === "guest") {
          toast.info("Host has left the game!");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
        return;
      }

      const updatedData: any = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        positions: Object.keys(doc.data().positions || {}).length,
      }))[0];

      // Odanın 3 saatten eski ve guest.now null ise sil
      if (updatedData.createdAt && updatedData.guest?.now == null) {
        const createdAtDate =
          updatedData.createdAt.seconds * 1000 +
          Math.floor(updatedData.createdAt.nanoseconds / 1000000);
        const now = Date.now();
        const threeHours = 3 * 60 * 60 * 1000;
        if (now - createdAtDate > threeHours) {
          const roomRef = doc(db, "rooms", roomId);
          try {
            await runTransaction(db, async (transaction) => {
              const roomDoc = await transaction.get(roomRef);
              if (!roomDoc.exists()) return;
              transaction.delete(roomRef);
            });
          } catch (error) {
            console.error("Oda otomatik silinirken hata:", error);
          }
          return;
        }
      }

      //firestore'daki sadece idli olan fightersPositions'ı fighters_url'den alan fonksiyon
      const getFightersByPositions = (positionsFighters: any) => {
        const updatedPositions: any = {};

        // Her bir pozisyon için
        Object.keys(positionsFighters).forEach((position) => {
          // O pozisyondaki fighter ID'lerini al
          const fighterIds = positionsFighters[position];

          // Bu ID'lere sahip fighterları fighters_url'den bul
          const fighters = fighterIds
            .map((fighterId: number) =>
              fighters_url.find((fighter) => fighter.Id === fighterId)
            )
            .filter(Boolean); // undefined olanları filtrele

          // Bulunan fighterları pozisyona ata
          updatedPositions[position] = fighters;
        });

        return updatedPositions;
      };

      if (
        updatedData.positionsFighters &&
        Object.keys(updatedData.positionsFighters).length > 0
      ) {
        setPositionsFighters(
          getFightersByPositions(updatedData.positionsFighters)
        );
      }

      if (updatedData.fighter00) setFighter00(updatedData.fighter00);
      if (updatedData.fighter01) setFighter01(updatedData.fighter01);
      if (updatedData.fighter02) setFighter02(updatedData.fighter02);
      if (updatedData.fighter10) setFighter10(updatedData.fighter10);
      if (updatedData.fighter11) setFighter11(updatedData.fighter11);
      if (updatedData.fighter12) setFighter12(updatedData.fighter12);
      if (updatedData.fighter20) setFighter20(updatedData.fighter20);
      if (updatedData.fighter21) setFighter21(updatedData.fighter21);
      if (updatedData.fighter22) setFighter22(updatedData.fighter22);

      if (updatedData.gameStarted) {
        setGameStarted(true);
        if (updatedData.turn) setTurn(updatedData.turn);
        if (updatedData.filtersSelected)
          setFiltersSelected(updatedData.filtersSelected);
        // Timer ve difficulty değerlerini de restore et
        if (updatedData.timerLength !== undefined) {
          setTimerLength(String(updatedData.timerLength));
        }
        if (updatedData.difficulty) {
          setDifficulty(updatedData.difficulty);
        }
      }

      setGuest(updatedData?.guest.now);
      setGameState(updatedData);
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, role]);

  useEffect(() => {
    if (role === "host" && !gameState) {
      const initializeGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);

        // Önce odanın var olup olmadığını kontrol et
        const roomSnap = await getDoc(roomRef);

        // Eğer oda zaten varsa (refresh durumu) hiçbir şey yapma
        if (roomSnap.exists()) {
          const data = roomSnap.data();
          // Eğer oyun zaten başlamışsa hiçbir şey yapma (refresh / resume durumları için)
          if (data?.gameStarted) {
            return;
          }
        }
        await setDoc(roomRef, {
          host: playerName,
          hostEmail: currentUser?.email || null,
          hostJoinMethod: "create",
          guest: { prev: null, now: null },
          guestEmail: null,
          guestJoinMethod: null,
          isRankedRoom: isRanked,
          hostReady: false,
          guestReady: false,
          hostWantsRematch: false, // EKLE
          guestWantsRematch: false, // EKLE
          turn: "red",
          gameStarted: false,
          filtersSelected: [],
          timerLength: isRanked ? "30" : "-2",
          difficulty: isRanked ? "MEDIUM" : "MEDIUM",
          createdAt: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
          hostLastActive: serverTimestamp(),
          guestLastActive: serverTimestamp(),
          expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
          fighter00: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter01: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter02: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter10: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter11: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter12: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter20: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter21: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
          fighter22: {
            url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
            text: "",
            bg: "from-stone-300 to-stone-500",
          },
        });
      };
      initializeGame();
    }
  }, [roomId, role, playerName, isRanked]); // isRanked'i dependency'e ekle

  useEffect(() => {
    if (
      role === "guest" &&
      gameState &&
      gameState?.guest.now == null &&
      !hasExited
    ) {
      const joinGame = async () => {
        const roomRef = doc(db, "rooms", roomId!);

        await updateDoc(roomRef, {
          guest: { prev: gameState.guest.now || null, now: playerName },
          guestEmail: currentUser?.email || null, // BURAYA EKLEDİK
          guestJoinMethod: "direct-link", // İsterseniz bunu da ekleyebilirsiniz
          guestLastActive: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
          expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
        });
      };

      joinGame();
    }
  }, [gameState, role, playerName, roomId, hasExited, currentUser]);

  useEffect(() => {
    if (
      role === "guest" &&
      gameState?.guest.now &&
      !gameState?.guestEmail &&
      currentUser?.email &&
      roomId
    ) {
      const roomRef = doc(db, "rooms", roomId);
      updateDoc(roomRef, {
        guestEmail: currentUser.email,
      });
    }
  }, [
    gameState?.guest.now,
    gameState?.guestEmail,
    currentUser?.email,
    roomId,
    role,
  ]);

  useEffect(() => {
    if (
      gameState?.isRankedRoom &&
      gameState?.hostReady &&
      gameState?.guestReady &&
      !gameState?.gameStarted &&
      role === "host"
    ) {
      const hasFighters =
        gameState.fighter00?.text ||
        gameState.fighter01?.text ||
        gameState.fighter02?.text;
      if (hasFighters) {
        return;
      }

      setDifficulty("MEDIUM");
      startGame("30");
      toast.success("🏆 Both players ready! Starting ranked match...");
    }
  }, [
    gameState?.hostReady,
    gameState?.guestReady,
    gameState?.gameStarted,
    role,
    gameState?.isRankedRoom, // Bağımlılığı ekle
  ]);

  useEffect(() => {
    if (!roomId) return;

    const updateGameState = async () => {
      try {
        // getFilters artık hesaplanan değerleri döndürüyor
        const result = await getFilters();

        if (!result) {
          console.error("getFilters failed to produce filters.");
          return;
        }

        const { filters_arr, newPositions } = result;

        const roomRef = doc(db, "rooms", roomId);

        const updatedDataFilters = filters_arr.map(
          ({ filter_fighters, ...rest }: any) => rest
        );

        const updatedDataPositionFighters: any = {};
        updatedDataPositionFighters.position03 = (
          newPositions.position03 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position04 = (
          newPositions.position04 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position05 = (
          newPositions.position05 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position13 = (
          newPositions.position13 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position14 = (
          newPositions.position14 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position15 = (
          newPositions.position15 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position23 = (
          newPositions.position23 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position24 = (
          newPositions.position24 || []
        ).map((fighter: Fighter) => fighter.Id);
        updatedDataPositionFighters.position25 = (
          newPositions.position25 || []
        ).map((fighter: Fighter) => fighter.Id);

        await updateDoc(roomRef, {
          gameStarted: gameStarted,
          difficulty: difficulty,
          timer: timerLength,
          timerLength: timerLength,
          filtersSelected: updatedDataFilters,
          positionsFighters: updatedDataPositionFighters,
          turn: "red",
          gameEnded: false,
          winner: null,
          guest: { prev: gameState?.guest.now || null, now: guest || null },
          lastActivityAt: serverTimestamp(),
          expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
        });

        // yazma tamamlandıktan sonra tekrar tetiklememek için pushFirestore'u false yap
        setPushFirestore(false);
      } catch (error) {
        console.error("Firestore güncelleme hatası:", error);
      }
    };

    if (gameStarted && pushFirestore) {
      updateGameState();
    }
  }, [pushFirestore]);

  useEffect(() => {
    if (filters != undefined) {
      getFilters();
    }
  }, [filters]);

  useEffect(() => {
    if (
      gameState?.isRankedRoom &&
      gameState?.hostWantsRematch &&
      gameState?.guestWantsRematch &&
      gameState?.winner
    ) {
      // 2 saniye bekle sonra yeni maçı başlat
      const timer = setTimeout(() => {
        startNewRankedMatch();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [
    gameState?.hostWantsRematch,
    gameState?.guestWantsRematch,
    gameState?.winner,
    gameState?.gameStarted,
  ]);

  // Show guest forfeit victory modal when host forfeits
  useEffect(() => {
    if (
      gameState?.forfeit &&
      gameState?.winner === "guest" &&
      role === "guest"
    ) {
      setGuestForfeitVictoryModal(true);
    }
  }, [gameState?.forfeit, gameState?.winner, role]);

  useEffect(() => {
    const winner = checkWinner();

    if (winner) {
      return;
    }
  }, [gameState]);

  useEffect(() => {
    // Oyun bitmişse timer'ı durdur
    if (gameState?.winner) {
      return;
    }

    const interval = setInterval(() => {
      if (gameState?.gameStarted == true) {
        if (!roomId) return;

        const roomRef = doc(db, "rooms", roomId);
        if (timerLength != "-2") {
          if (gameState.timerLength <= 0) {
            // Timer 0'a ulaştıysa: timer'ı reset et ve turn'ü değiştir
            updateDoc(roomRef, {
              timerLength: parseInt(timerLength) || 30, // Timer'ı orijinal değerine reset et
              turn: gameState.turn == "red" ? "blue" : "red",
            });
          } else {
            // Henüz zamanı varsa: timer'ı 1 saniye azalt
            updateDoc(roomRef, {
              timerLength: gameState.timerLength - 1,
            });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState?.gameStarted,
    gameState?.timerLength,
    gameState?.turn,
    gameState?.winner,
    timerLength,
    roomId,
  ]); // gameState dependency'sine gameState.winner da dahil

  useEffect(() => {
    if (gameState != null && role === "host") {
      const currentGuestNow = gameState.guest?.now;

      // Önceki değer null iken şimdiki değer doluysa -> Biri katıldı
      if (prevGuestNow.current === null && currentGuestNow !== null) {
        toast.success(`${currentGuestNow} joined the game!`);
      }
      // Önceki değer dolu iken şimdiki değer null ise -> Biri ayrıldı
      else if (prevGuestNow.current !== null && currentGuestNow === null) {
        toast.info(`${prevGuestNow.current} left the game!`);

        // Guest çıkınca oyun ve ready state'lerini reset et
        const resetGame = async () => {
          const roomRef = doc(db, "rooms", roomId!);
          await updateDoc(roomRef, {
            gameStarted: false,
            positionsFighters: {},
            hostReady: false,
            guestReady: false,
            lastActivityAt: serverTimestamp(),
            expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
          });
        };
        resetGame();
      }

      // Bir sonraki çalıştırma için mevcut değeri "önceki değer" olarak ata
      prevGuestNow.current = currentGuestNow;
    }
    // Bağımlılığı sadece guest.now'a indirge
  }, [gameState?.guest?.now, role, roomId]);

  useEffect(() => {
    if (
      fighter00.bg != "from-red-800 to-red-900" &&
      fighter00.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter00({
        ...fighter00,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter01.bg != "from-red-800 to-red-900" &&
      fighter01.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter01({
        ...fighter01,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter02.bg != "from-red-800 to-red-900" &&
      fighter02.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter02({
        ...fighter02,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter10.bg != "from-red-800 to-red-900" &&
      fighter10.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter10({
        ...fighter10,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter11.bg != "from-red-800 to-red-900" &&
      fighter11.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter11({
        ...fighter11,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter12.bg != "from-red-800 to-red-900" &&
      fighter12.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter12({
        ...fighter12,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter20.bg != "from-red-800 to-red-900" &&
      fighter20.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter20({
        ...fighter20,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter21.bg != "from-red-800 to-red-900" &&
      fighter21.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter21({
        ...fighter21,
        bg: "from-stone-300 to-stone-500",
      });
    }
    if (
      fighter22.bg != "from-red-800 to-red-900" &&
      fighter22.bg != "from-blue-800 to-blue-900"
    ) {
      setFighter22({
        ...fighter22,
        bg: "from-stone-300 to-stone-500",
      });
    }
  }, [theme]);

  const updatePlayerStats = async (winner: "red" | "blue" | "draw") => {
    // 🚩 FORFEIT CHECK: Eğer forfeit olmuşsa, stats zaten transaction'da güncellendi, skip et
    if (gameState?.isForfeited) {
      return;
    }

    if (!gameState?.isRankedRoom) {
      return;
    }

    const hostEmail = gameState.hostEmail;
    const guestEmail = gameState.guestEmail;

    if (!hostEmail || !guestEmail) {
      console.error("❌ Host or guest email is missing for ranked match.");
      return;
    }

    // 🔑 Current user'ın kim olduğunu belirle
    const isHost = currentUser?.email === hostEmail;
    const isGuest = currentUser?.email === guestEmail;

    if (!isHost && !isGuest) {
      console.error("❌ Current user is neither host nor guest.");
      return;
    }

    const hostIsWinner = winner === "red";
    const guestIsWinner = winner === "blue";

    try {
      if (isHost) {
        // 🏠 HOST: Sadece kendi stats'ını güncelle
        const hostRef = doc(db, "users", hostEmail);
        const hostDoc = await getDoc(hostRef);

        if (!hostDoc.exists()) {
          throw "Host profile could not be found.";
        }

        const hostProfile = hostDoc.data();
        const hostNewAchievements = { ...hostProfile.achievements };
        const hostNewUnlockedTitles = [];

        if (hostIsWinner) {
          if (!hostProfile.achievements.firstWin) {
            hostNewAchievements.firstWin = new Date().toISOString();
            hostNewUnlockedTitles.push("First Blood");
            toast.success("🏆 New achievement unlocked! First Blood");
          }
          const newWinCount = (hostProfile.stats.wins || 0) + 1;
          if (newWinCount >= 10 && !hostProfile.achievements.tenWins) {
            hostNewAchievements.tenWins = new Date().toISOString();
            hostNewUnlockedTitles.push("Arena Master");
            toast.success("🏆 New achievement unlocked! Arena Master");
          }
        }

        await updateDoc(hostRef, {
          "stats.points": increment(
            hostIsWinner ? 15 : winner === "draw" ? 2 : -5
          ),
          "stats.wins": increment(hostIsWinner ? 1 : 0),
          "stats.losses": increment(guestIsWinner ? 1 : 0),
          "stats.draws": increment(winner === "draw" ? 1 : 0),
          "stats.totalGames": increment(1),
          achievements: hostNewAchievements,
          unlockedTitles: arrayUnion(...hostNewUnlockedTitles),
        }).then(() => {
          updateWinRates(hostEmail, guestEmail);
        });

        toast.success("🏆 Ranked match completed! Stats updated.");
      } else if (isGuest) {
        // 👥 GUEST: Sadece kendi stats'ını güncelle
        const guestRef = doc(db, "users", guestEmail);
        const guestDoc = await getDoc(guestRef);

        if (!guestDoc.exists()) {
          throw "Guest profile could not be found.";
        }

        const guestProfile = guestDoc.data();
        const guestNewAchievements = { ...guestProfile.achievements };
        const guestNewUnlockedTitles = [];

        if (guestIsWinner) {
          if (!guestProfile.achievements.firstWin) {
            guestNewAchievements.firstWin = new Date().toISOString();
            guestNewUnlockedTitles.push("First Blood");
            toast.success("🏆 New achievement unlocked! First Blood");
          }
          const newWinCount = (guestProfile.stats.wins || 0) + 1;
          if (newWinCount >= 10 && !guestProfile.achievements.tenWins) {
            guestNewAchievements.tenWins = new Date().toISOString();
            guestNewUnlockedTitles.push("Arena Master");
            toast.success("🏆 New achievement unlocked! Arena Master");
          }
        }

        await updateDoc(guestRef, {
          "stats.points": increment(
            guestIsWinner ? 15 : winner === "draw" ? 2 : -5
          ),
          "stats.wins": increment(guestIsWinner ? 1 : 0),
          "stats.losses": increment(hostIsWinner ? 1 : 0),
          "stats.draws": increment(winner === "draw" ? 1 : 0),
          "stats.totalGames": increment(1),
          achievements: guestNewAchievements,
          unlockedTitles: arrayUnion(...guestNewUnlockedTitles),
        }).then(() => {
          updateWinRates(hostEmail, guestEmail);
        });

        toast.success("🏆 Ranked match completed! Stats updated.");
      }
    } catch (error) {
      console.error("❌ Failed to update player stats:", error);
      toast.error("Failed to update player stats.");
    }
  };

  // Win rate güncelleme fonksiyonu (future use)
  const updateWinRates = async (hostEmail: string, guestEmail: string) => {
    try {
      const hostDoc = await getDoc(doc(db, "users", hostEmail));
      if (hostDoc.exists()) {
        const hostStats = hostDoc.data().stats;
        const hostWinRate =
          hostStats.totalGames > 0
            ? (hostStats.wins / hostStats.totalGames) * 100
            : 0;

        await updateDoc(doc(db, "users", hostEmail), {
          "stats.winRate": Math.round(hostWinRate * 100) / 100,
        });
      }

      const guestDoc = await getDoc(doc(db, "users", guestEmail));
      if (guestDoc.exists()) {
        const guestStats = guestDoc.data().stats;
        const guestWinRate =
          guestStats.totalGames > 0
            ? (guestStats.wins / guestStats.totalGames) * 100
            : 0;

        await updateDoc(doc(db, "users", guestEmail), {
          "stats.winRate": Math.round(guestWinRate * 100) / 100,
        });
      }
    } catch (error) {
      console.error("Win rate güncelleme hatası:", error);
    }
  };

  const resetTimerFirestore = async () => {
    if (!roomId || !gameState) return;

    // gameState'teki currentTimer değerini orijinal timer değerine resetle
    // Örnek: Timer 45 saniye olarak set edilmişse, hep 45'e geri dön
    const roomRef = doc(db, "rooms", roomId);

    // Oyun başlarken kaydedilen orijinal timerLength'i bul
    // gameState.originalTimerLength varsa onu, yoksa gameState'i okunacak başlangıç değeri al
    // En basit: user "30", "45", "60" seçti, oyun başlarken kaydedildi, o değer hep reset olmalı
    // Bunu bilmek için başlangıçtaki timerLength'i roomData'dan oku
    const roomDoc = await getDoc(roomRef);
    const originalTimer = roomDoc.data()?.timer || 30;

    await updateDoc(roomRef, {
      timerLength: originalTimer,
      lastActivityAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });
  };

  const switchTurn = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
      turn: gameState.turn == "red" ? "blue" : "red",
      lastActivityAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });
  };

  const startGame = async (customTimerLength?: string) => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      const data = roomSnap.data();
      // Eğer oyun zaten devam ediyorsa ve fighterlar doluysa resetleme
      const hasFighters =
        data.fighter00?.text || data.fighter01?.text || data.fighter02?.text;
      if (hasFighters && data.gameStarted) {
        return;
      }
    }

    const f: FilterDifficulty = Filters();

    if (difficulty == "EASY") {
      setFilters(f.easy);
    } else if (difficulty == "MEDIUM") {
      setFilters(f.medium);
    } else {
      setFilters(f.hard);
    }

    setGameStarted(true);

    // ✅ FIRESTORE'A DA YAZALIM
    // customTimerLength varsa onu kullan (ranked maçta), yoksa state'i kullan
    const finalTimerLength = customTimerLength || timerLength;
    await updateDoc(roomRef, {
      gameStarted: true,
      difficulty: difficulty,
      timerLength: finalTimerLength,
      lastActivityAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });

    setPushFirestore(true);
  };

  // Room.tsx - fonksiyonların arasına ekle

  const startNewRankedMatch = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    // Oyunu sıfırla ama ranked ayarları koru
    await updateDoc(roomRef, {
      gameStarted: false,
      gameEnded: false,
      winner: null,
      turn: "red",
      timerLength: "30", // Ranked için sabit
      difficulty: "MEDIUM", // Ranked için sabit
      filtersSelected: [],
      positionsFighters: {},
      hostReady: false,
      guestReady: false,
      hostWantsRematch: false, // SIFIRLA
      guestWantsRematch: false, // SIFIRLA
      fighter00: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter01: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter02: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter10: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter11: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter12: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter20: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter21: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter22: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      statsUpdated: false, // 🔑 REMATCH'TE STATS GÜNCELLEMESINI TETIKLE
      lastActivityAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
    });

    // Local state'leri de sıfırla
    setGameStarted(false);
    setShowConfetti(false);

    toast.success("🏆 New ranked match starting!");
  };

  const getFilters = async () => {
    // Eğer state'teki filters boşsa fallback al
    let activeFilters: any = filters;
    if (
      !activeFilters ||
      (Array.isArray(activeFilters) && activeFilters.length === 0)
    ) {
      const all = Filters();
      activeFilters =
        difficulty === "EASY"
          ? all.easy
          : difficulty === "HARD"
          ? all.hard
          : all.medium;
      setFilters(activeFilters);
    }

    let isDone: boolean = false;
    let finish = 0;

    while (!isDone && finish < 1500) {
      finish += 1;
      const filters_arr: any = [];
      while (filters_arr.length < 6) {
        const random_index = Math.floor(Math.random() * activeFilters.length);
        if (!filters_arr.includes(activeFilters[random_index])) {
          filters_arr.push(activeFilters[random_index]);
        }
      }

      if (!filters_arr[3] || !filters_arr[4] || !filters_arr[5]) {
        console.error(
          "HATA: filters_arr[3], filters_arr[4] veya filters_arr[5] undefined!"
        );
        continue;
      }

      const newPositions: any = {
        position03: [],
        position04: [],
        position05: [],
        position13: [],
        position14: [],
        position15: [],
        position23: [],
        position24: [],
        position25: [],
      };

      for (let i = 0; i < 3; i++) {
        const a = filters_arr[i]?.filter_fighters || [];
        const b3 = filters_arr[3]?.filter_fighters || [];
        const b4 = filters_arr[4]?.filter_fighters || [];
        const b5 = filters_arr[5]?.filter_fighters || [];

        const intersection3 = a.filter((fighter1: Fighter) =>
          b3.some((fighter2: Fighter) => fighter1.Id === fighter2.Id)
        );
        const intersection4 = a.filter((fighter1: Fighter) =>
          b4.some((fighter2: Fighter) => fighter1.Id === fighter2.Id)
        );
        const intersection5 = a.filter((fighter1: Fighter) =>
          b5.some((fighter2: Fighter) => fighter1.Id === fighter2.Id)
        );

        if (
          intersection3.length < 3 ||
          intersection4.length < 3 ||
          intersection5.length < 3
        ) {
          break;
        }

        if (i === 0) {
          newPositions.position03 = intersection3;
          newPositions.position04 = intersection4;
          newPositions.position05 = intersection5;
        } else if (i === 1) {
          newPositions.position13 = intersection3;
          newPositions.position14 = intersection4;
          newPositions.position15 = intersection5;
        } else if (i === 2) {
          newPositions.position23 = intersection3;
          newPositions.position24 = intersection4;
          newPositions.position25 = intersection5;
        }

        if (i === 2) {
          isDone = true;
          break;
        }
      }

      if (isDone) {
        setPositionsFighters(newPositions);
        setFiltersSelected(filters_arr);
        return { filters_arr, newPositions };
      }
    }

    return null;
  };

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const filterByName = (name: string) => {
    if (name.length < 4) {
      setFighters([]);
      return;
    }

    const nameLower = name.toLowerCase();
    const inputWords = nameLower.split(/\s+/).filter((w) => w.length > 0);

    const scoredFighters = fighters_url.map((fighter) => {
      const fighterNameLower = fighter.Fighter.toLowerCase();
      const fighterWords = fighterNameLower.split(/\s+/);

      let totalScore = 0;
      let matchCount = 0;

      for (const inputWord of inputWords) {
        for (const fighterWord of fighterWords) {
          const distance = levenshteinDistance(inputWord, fighterWord);

          // Tolerance: 1-2 character edits
          if (distance <= 2) {
            totalScore += 10 - distance;
            matchCount++;
            break;
          }

          // Include match (higher priority)
          if (fighterWord.includes(inputWord)) {
            totalScore += 15;
            matchCount++;
            break;
          }
        }
      }

      return { fighter, score: totalScore, matchCount };
    });

    // Filter and sort by relevance
    const filteredFighters = scoredFighters
      .filter((item) => item.matchCount > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.fighter);

    setFighters(filteredFighters);
  };

  const toggleFighterPick = () => {
    if (role == "host" && gameState.turn == "blue") {
      toast.error("Its your opponents turn!");
      return;
    } else if (role == "guest" && gameState.turn == "red") {
      toast.error("Its your opponents turn!");
      return;
    }
    const div = document.querySelector(".select-fighter");
    div?.classList.toggle("hidden");
  };

  const restartGame = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
      gameStarted: false,
      gameEnded: false,
      winner: null,
      turn: "red",
      timerLength: "-2",
      filtersSelected: [],
      positionsFighters: {},
      statsUpdated: false,
      fighter00: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter01: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter02: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter10: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter11: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter12: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter20: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter21: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
      fighter22: {
        url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
        text: "",
        bg: "from-stone-300 to-stone-500",
      },
    });

    // local state'leri de sıfırla
    setGameStarted(false);
    setFiltersSelected([]);
    setPushFirestore(false);
    setPositionsFighters({
      position03: {},
      position04: {},
      position05: {},
      position13: {},
      position14: {},
      position15: {},
      position23: {},
      position24: {},
      position25: {},
    });

    setFilters(null);
    setFighter00({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter01({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter02({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter10({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter11({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter12({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter20({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter21({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setFighter22({
      url: "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png",
      text: "",
      bg: "from-stone-300 to-stone-500",
    });
    setTurn("red");
  };

  const updateBox = async (fighter: Fighter) => {
    const picture =
      fighter.Picture === "Unknown"
        ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
        : fighter.Picture;
    const name = fighter.Fighter;

    if (role == "host" && gameState.turn == "blue") {
      toast.error("Its your opponents turn!");
      return;
    } else if (role == "guest" && gameState.turn == "red") {
      toast.error("Its your opponents turn!");
      return;
    }

    if (!roomId) return;

    const roomRef = doc(db, "rooms", roomId);

    const fighterMap: { [key: string]: keyof typeof positionsFighters } = {
      fighter00: "position03",
      fighter01: "position13",
      fighter02: "position23",
      fighter10: "position04",
      fighter11: "position14",
      fighter12: "position24",
      fighter20: "position05",
      fighter21: "position15",
      fighter22: "position25",
    };

    if (!fighterMap[selected]) return;

    const positionKey = fighterMap[selected];
    if (!positionsFighters[positionKey].includes(fighter)) {
      notify();
      playSfx(wrong); // ❌ Yanlış seçim sesi
      await updateDoc(roomRef, {
        timerLength: gameState.timer,
        turn: gameState.turn === "red" ? "blue" : "red",
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
      });
    } else {
      const bgColor =
        gameState.turn === "red"
          ? "from-red-800 to-red-900"
          : "from-blue-800 to-blue-900";

      const setterMap: { [key: string]: Function } = {
        fighter00: setFighter00,
        fighter01: setFighter01,
        fighter02: setFighter02,
        fighter10: setFighter10,
        fighter11: setFighter11,
        fighter12: setFighter12,
        fighter20: setFighter20,
        fighter21: setFighter21,
        fighter22: setFighter22,
      };

      setterMap[selected]({ url: picture, text: name, bg: bgColor });

      playSfx(correct); // ✅ Doğru seçim sesi
      await updateDoc(roomRef, {
        [selected]: {
          // selected değişkenini key olarak kullan (fighter01, fighter02 vs.)
          url: picture,
          text: name,
          bg:
            gameState.turn === "red"
              ? "from-red-800 to-red-900"
              : "from-blue-800 to-blue-900",
          fighterId: fighter.Id,
        },
        guest: { prev: gameState?.guest.now, now: guest },
        timerLength: gameState.timer,
        turn: gameState.turn === "red" ? "blue" : "red",
        lastActivityAt: serverTimestamp(),
        expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
      });
    }

    setTurn(turn === "red" ? "blue" : "red");
    //setTimer(timerLength);
    toggleFighterPick();
    resetInput();
    //setFigters([]);
  };

  const resetInput = () => {
    const input: any = document.querySelector(".input-fighter");
    input.value = "";
  };

  const checkWinner = () => {
    if (!gameState) {
      return;
    }
    const board = [
      [
        gameState?.fighter00.bg,
        gameState?.fighter01.bg,
        gameState?.fighter02.bg,
      ],
      [
        gameState?.fighter10.bg,
        gameState?.fighter11.bg,
        gameState?.fighter12.bg,
      ],
      [
        gameState?.fighter20.bg,
        gameState?.fighter21.bg,
        gameState?.fighter22.bg,
      ],
    ];

    const winPatterns = [
      // Yatay Kazanma
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      // Dikey Kazanma
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      // Çapraz Kazanma
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    // 🎯 Kazanan var mı kontrol et
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      const cellA = board[a[0]][a[1]];
      const cellB = board[b[0]][b[1]];
      const cellC = board[c[0]][c[1]];

      if (!roomId) return;
      const roomRef = doc(db, "rooms", roomId);

      if (
        cellA !== "from-stone-300 to-stone-500" &&
        cellA === cellB &&
        cellB === cellC
      ) {
        if (cellA.includes("red")) {
          updateDoc(roomRef, {
            winner: "red",
          });
          // updatePlayerStats("red"); KALDIR
          playSfx(win);
          return "red";
        } else {
          updateDoc(roomRef, {
            winner: "blue",
          });
          // updatePlayerStats("blue"); KALDIR
          playSfx(win);
          return "blue";
        }
      }
    }

    // 🎯 Beraberlik kontrolü
    const isBoardFull = board
      .flat()
      .every((cell) => cell !== "from-stone-300 to-stone-500");

    if (isBoardFull) {
      if (!roomId) return;
      const roomRef = doc(db, "rooms", roomId);
      updateDoc(roomRef, {
        winner: "draw",
        gameStarted: false,
      });
      playSfx(draw);
      return "Draw!";
    }

    return null;
  };

  const handleExit = async () => {
    if (!roomId || !playerName || !role || isExiting) return;

    // Ranked maçta oyun devam ederken çıkmak isterse modal aç
    if (
      gameState?.isRankedRoom &&
      gameState?.gameStarted &&
      !gameState?.winner &&
      role === "host"
    ) {
      setRankedForfeitModal(true);
      return;
    }

    setIsExiting(true);
    const roomRef = doc(db, "rooms", roomId);

    try {
      if (role === "host") {
        // Host çıkarsa odayı tamamen sil

        // Transaction içinde silme işlemini gerçekleştir
        await runTransaction(db, async (transaction) => {
          // Önce odayı kontrol et
          const roomDoc = await transaction.get(roomRef);

          if (!roomDoc.exists()) {
            return;
          }

          // Odayı sil
          transaction.delete(roomRef);
        });

        // Toast mesajını göster ve 1.5 saniye sonra yönlendir
        toast.success("Room deleted successfully!");
        setTimeout(() => {
          navigate("/menu");
        }, 1500);
      } else if (role === "guest") {
        // Guest çıkarsa sadece guest'i null yap
        setHasExited(true); // Guest'in çıkış yaptığını işaretle
        await updateDoc(roomRef, {
          guest: { prev: gameState.guest.now || null, now: null },
          gameStarted: false,
        });
        navigate("/menu");
      }
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      console.error(
        "Hata detayı:",
        error instanceof Error ? error.message : "Bilinmeyen hata"
      );
      toast.error("An error occurred while exiting!");
      // Hata durumunda da ana sayfaya yönlendir
      navigate("/menu");
    } finally {
      setIsExiting(false);
    }
  };

  // Handle ranked forfeit - host loses, guest wins
  const handleRankedForfeit = async () => {
    if (!roomId || !gameState) return;

    setRankedForfeitModal(false);
    setIsExiting(true);

    try {
      const roomRef = doc(db, "rooms", roomId);
      const hostRef = doc(db, "users", gameState.hostEmail);
      const guestRef = doc(db, "users", gameState.guestEmail);

      // Update game result - guest wins by forfeit
      await runTransaction(db, async (transaction) => {
        transaction.update(roomRef, {
          winner: "guest",
          forfeit: true,
          gameStarted: false,
          filtersSelected: [],
          positionsFighters: {},
        });

        // Host loses, guest wins
        transaction.update(hostRef, {
          "stats.totalGames": increment(1),
          "stats.losses": increment(1),
        });

        transaction.update(guestRef, {
          "stats.totalGames": increment(1),
          "stats.wins": increment(1),
          "stats.points": increment(15),
        });
      });

      toast.success("🏆 Guest wins! Host forfeited!");

      // Host goes to menu immediately
      navigate("/menu");

      // Delete room in background (don't wait)
      runTransaction(db, async (transaction) => {
        try {
          const roomDoc = await transaction.get(roomRef);
          if (roomDoc.exists()) {
            transaction.delete(roomRef);
          }
        } catch (err) {
          console.warn("Room deletion failed:", err);
        }
      }).catch((err) => console.warn("Room deletion error:", err));
    } catch (error) {
      console.error("Forfeit failed:", error);
      toast.error("An error occurred during forfeit!");
      setIsExiting(false);
    }
  };

  const notify = () => toast.error("Fighter doesnt meet the requirements.");

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800"
          : "bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100"
      } min-h-[100vh] relative overflow-hidden`}
    >
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
        />
      )}
      {/* Animated Mountains */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute bottom-0 left-0 w-full h-32 ${
            theme === "dark" ? "bg-blue-800/30" : "bg-blue-200/30"
          } transform rotate-1 -mb-4`}
          style={{
            clipPath: "polygon(0 100%, 100% 100%, 85% 0, 0 20%)",
          }}
        />
        <div
          className={`absolute bottom-0 right-0 w-full h-40 ${
            theme === "dark" ? "bg-indigo-700/20" : "bg-indigo-300/20"
          } transform -rotate-1 -mb-6`}
          style={{
            clipPath: "polygon(15% 0, 100% 30%, 100% 100%, 0 100%)",
          }}
        />
      </div>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 10, top: 20, delay: 0, duration: 3 },
          { left: 20, top: 40, delay: 1, duration: 4 },
          { left: 80, top: 10, delay: 2, duration: 3.5 },
          { left: 70, top: 60, delay: 0.5, duration: 4.5 },
          { left: 30, top: 70, delay: 1.5, duration: 3 },
          { left: 90, top: 30, delay: 2.5, duration: 4 },
          { left: 5, top: 80, delay: 0.8, duration: 3.8 },
          { left: 60, top: 15, delay: 1.8, duration: 4.2 },
          { left: 40, top: 90, delay: 2.2, duration: 3.2 },
          { left: 85, top: 70, delay: 0.3, duration: 4.8 },
          { left: 15, top: 50, delay: 1.3, duration: 3.6 },
          { left: 75, top: 85, delay: 2.8, duration: 4.4 },
          { left: 50, top: 5, delay: 0.6, duration: 3.4 },
          { left: 25, top: 25, delay: 1.6, duration: 4.6 },
          { left: 95, top: 50, delay: 2.6, duration: 3.8 },
          { left: 35, top: 35, delay: 0.9, duration: 4.1 },
          { left: 65, top: 75, delay: 1.9, duration: 3.7 },
          { left: 45, top: 45, delay: 2.9, duration: 4.3 },
          { left: 55, top: 65, delay: 0.4, duration: 3.9 },
          { left: 8, top: 12, delay: 1.4, duration: 4.7 },
        ].map((particle, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${
              theme === "dark" ? "bg-blue-300" : "bg-white"
            } rounded-full animate-pulse`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />
      {/* Tema değiştirme butonu */}
      <div className="absolute z-30 top-6 left-6">
        <div
          onClick={toggleTheme}
          className={`p-3 rounded-full cursor-pointer transition-all duration-300 backdrop-blur-md border ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-700/80"
              : "bg-white/80 border-slate-200/50 hover:bg-white/90"
          } shadow-xl hover:scale-110`}
        >
          {theme === "dark" ? (
            <img
              src="https://clipart-library.com/images/6iypd9jin.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Light mode"
            />
          ) : (
            <img
              src="https://clipart-library.com/img/1669853.png"
              className="lg:w-6 lg:h-6 w-5 h-5"
              alt="Dark mode"
            />
          )}
        </div>
      </div>
      {/* Mute + Back buttons */}
      <div className="absolute z-30 top-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          title={muted ? "Unmute" : "Mute"}
          className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
              : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
          }`}
        >
          <span className="text-xl">{muted ? "🔇" : "🔊"}</span>
        </button>
        <div
          onClick={handleExit}
          className={`p-2 rounded-full border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-slate-700/90"
              : "bg-white/90 border-slate-300 text-slate-700 hover:bg-white"
          }`}
        >
          <div className="flex gap-2">
            <img
              src={return_img || "/placeholder.svg"}
              className="w-6"
            />
            <p className="font-semibold">Back to menu</p>
          </div>
        </div>
      </div>
      {/* Kullanıcı adı gösterimi - üst orta */}
      {showUserBanner && (
        <div className="absolute top-24 lg:top-6 left-1/2 transform -translate-x-1/2 z-30">
          <div
            className={`px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-md border shadow-xl ${
              theme === "dark"
                ? "bg-slate-800/80 border-slate-600/50 text-white"
                : "bg-white/80 border-slate-200/50 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  theme === "dark" ? "bg-green-400" : "bg-green-500"
                } animate-pulse`}
              />{" "}
              <span className="font-semibold text-sm">
                {" "}
                {userUsername ||
                  currentUser?.email?.split("@")[0] ||
                  playerName ||
                  "Player"}
              </span>
              {gameState?.isRankedRoom && (
                <div className="text-yellow-500 text-xs">🏆</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {!gameState.forfeit ? (
        <div
          className={`${
            gameState.winner == null || guestForfeitModal || hostForfeitModal
              ? "hidden"
              : "absolute"
          } ${
            theme === "dark" ? "bg-[#00000061]" : "bg-[#ffffff61]"
          }  rounded-lg w-full h-full z-40`}
        >
          <div className="flex justify-center mt-12">
            <div
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-indigo-800 to-indigo-900 border-indigo-700 shadow-indigo-900 text-white"
                  : "bg-gradient-to-r from-indigo-100 to-sky-200 border-indigo-300 shadow-indigo-300/50"
              } bg-gradient-to-r border-2 w-80 lg:px-6 lg:py-4 px-4 py-2 rounded-lg shadow-lg`}
            >
              <p className="xl:text-2xl text-center lg:text-xl text-lg font-semibold">
                Game Finished!
              </p>
              {gameState.winner == "red" ? (
                <p className="text-red-500 font-semibold text-xl mt-4 text-center">
                  {gameState.host} wins! 🏆
                </p>
              ) : gameState.winner == "blue" ? (
                <p className="text-blue-500 font-semibold text-xl mt-4 text-center">
                  {gameState.guest.now} wins! 🏆
                </p>
              ) : (
                <p
                  className={`${
                    theme === "dark" ? "text-stone-100" : "text-stone-700"
                  } font-semibold text-xl mt-4 text-center`}
                >
                  Draw! 🤝
                </p>
              )}

              {/* CASUAL MAÇLAR - Host için Play Again, Guest için Return/Wait */}
              {!gameState?.isRankedRoom && role == "host" && (
                <div className="flex justify-center">
                  <button
                    onClick={restartGame}
                    className={`bg-gradient-to-r cursor-pointer ${
                      theme === "dark"
                        ? "from-sky-600 to-indigo-700 text-white border-indigo-600"
                        : "from-indigo-200 to-sky-300 text-black border-indigo-400"
                    } border text-lg font-semibold px-3 py-1 rounded-lg shadow-lg hover:shadow-xl duration-200 mt-5`}
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* CASUAL MAÇLAR - Guest için seçenekler */}
              {!gameState?.isRankedRoom && role == "guest" && (
                <div className=" mt-5">
                  <button
                    onClick={() => navigate("/menu")}
                    className={`bg-gradient-to-r w-full cursor-pointer ${
                      theme === "dark"
                        ? "from-red-600 to-orange-700 text-white border-red-600"
                        : "from-red-300 to-orange-300 text-black border-red-400"
                    } border text-lg font-semibold px-3 py-1 rounded-lg shadow-lg hover:shadow-xl duration-200`}
                  >
                    Return to Menu
                  </button>
                  <button
                    onClick={() => setShowWaitingGuest(true)}
                    className={`bg-gradient-to-r w-full mt-3 cursor-pointer ${
                      theme === "dark"
                        ? "from-sky-600 to-indigo-700 text-white border-indigo-600"
                        : "from-indigo-200 to-sky-300 text-black border-indigo-400"
                    } border text-lg font-semibold px-3 py-1 rounded-lg shadow-lg hover:shadow-xl duration-200`}
                  >
                    Wait for Host
                  </button>
                </div>
              )}

              {/* RANKED MAÇLAR - Her iki oyuncuya da seçenek sun */}
              {gameState?.isRankedRoom && (
                <div className="mt-4 z-40">
                  <div
                    className={`text-center mb-4 px-4 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-yellow-900/30 border border-yellow-600"
                        : "bg-yellow-100 border border-yellow-400"
                    }`}
                  >
                    <p className="text-sm text-yellow-600 font-semibold">
                      🏆 Ranked Match Completed
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        theme === "dark" ? "text-yellow-400" : "text-yellow-700"
                      }`}
                    >
                      Points have been updated!
                    </p>
                  </div>

                  {/* Play Again Status */}
                  <div
                    className={`p-3 rounded-lg border mb-4 ${
                      theme === "dark"
                        ? "bg-slate-700/50 border-slate-600"
                        : "bg-slate-100 border-slate-300"
                    }`}
                  >
                    <h3 className="text-sm font-semibold mb-2 text-center">
                      Play Again?
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>{gameState.host}:</span>
                        <span
                          className={`font-semibold ${
                            gameState.hostWantsRematch
                              ? "text-green-500"
                              : "text-orange-500"
                          }`}
                        >
                          {gameState.hostWantsRematch
                            ? "✅ Yes"
                            : "⏳ Deciding..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{gameState.guest.now}:</span>
                        <span
                          className={`font-semibold ${
                            gameState.guestWantsRematch
                              ? "text-green-500"
                              : "text-orange-500"
                          }`}
                        >
                          {gameState.guestWantsRematch
                            ? "✅ Yes"
                            : "⏳ Deciding..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-center">
                    {/* Play Again Button */}
                    {((role === "host" && !gameState.hostWantsRematch) ||
                      (role === "guest" && !gameState.guestWantsRematch)) && (
                      <button
                        onClick={async () => {
                          if (!roomId) return;
                          const roomRef = doc(db, "rooms", roomId);

                          if (role === "host") {
                            await updateDoc(roomRef, {
                              hostWantsRematch: true,
                            });
                          } else {
                            await updateDoc(roomRef, {
                              guestWantsRematch: true,
                            });
                          }

                          toast.success("Waiting for opponent's decision...");
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        Play Again
                      </button>
                    )}

                    {/* Return to Menu Button */}
                    <button
                      onClick={() => navigate("/menu")}
                      className={`px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Return to Menu
                    </button>
                  </div>

                  {/* Both want rematch message */}
                  {gameState.hostWantsRematch &&
                    gameState.guestWantsRematch && (
                      <div className="text-center mt-3">
                        <p
                          className={`text-sm font-semibold ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          🎮 Starting new ranked match...
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Oyun alanı */}
      {!gameState.forfeit ? (
        <div
          className={`flex flex-col items-center justify-center h-full ${
            theme == "dark" ? "text-white" : "text-black"
          }`}
        >
          <div className="w-fit mb-4">
            <div className="text-2xl mb-2 mt-42 lg:mt-28 text-center">
              Room Code: {roomId}
            </div>
            {gameState.gameStarted == false &&
            gameState.guest.now != null &&
            role == "guest" ? (
              <div className="text-2xl text-center">
                Host is setting up the game...
              </div>
            ) : null}

            {gameState.guest.now == null ? (
              <p className="text-2xl text-center">Waiting for an opponent...</p>
            ) : null}
            <div className="text-center">
              <div>
                {gameState?.gameStarted == true &&
                parseInt(gameState?.timerLength) >= 0 ? (
                  <p
                    className={`xl:text-xl md:hidden block lg:text-lg text-base text-center font-semibold ${
                      gameState?.turn == "red"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {gameState.timerLength} seconds
                  </p>
                ) : null}
              </div>
              <div
                className={`${
                  gameState?.gameStarted == true ? "flex" : "hidden"
                } justify-between items-center gap-3 flex-wrap text-right pt-2 px-4 md:px-0`}
              >
                {/* Restart Game butonu - sadece casual maçlarda göster */}
                {!gameState?.isRankedRoom && role == "host" && (
                  <div
                    onClick={() => {
                      restartGame();
                    }}
                    className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-white"
                        : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80"
                    }`}
                  >
                    Restart Game
                  </div>
                )}

                {/* Ranked maçlarda bilgi göster */}
                {gameState?.isRankedRoom && (
                  <div
                    className={`flex gap-2 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-yellow-700/80 to-yellow-600/80 border-yellow-500/30 text-yellow-100"
                        : "bg-gradient-to-r from-yellow-200/80 to-yellow-300/80 border-yellow-400/30 text-yellow-800"
                    }`}
                  >
                    🏆 <span>Ranked Match</span>
                  </div>
                )}

                <div>
                  {gameState?.gameStarted == true &&
                  parseInt(gameState?.timerLength) >= 0 ? (
                    <p
                      className={`xl:text-xl md:block hidden lg:text-lg text-base text-center font-semibold ${
                        gameState?.turn == "red"
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {gameState.timerLength} seconds
                    </p>
                  ) : null}
                </div>
                {/* Turn bilgisi ve Skip butonu */}
                {gameState?.turn == "red" ? (
                  <div
                    className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 duration-200 transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-red-400"
                        : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80 text-red-600"
                    }`}
                  >
                    <p>
                      Turn :{" "}
                      {gameState.turn == "red"
                        ? gameState.host
                        : gameState.guest.now}
                    </p>
                    {role == "host" && (
                      <div
                        onClick={() => {
                          switchTurn();
                          resetTimerFirestore();
                        }}
                        className={`${
                          theme === "dark"
                            ? "bg-slate-500 border-slate-700 text-slate-200"
                            : "bg-gradient-to-b from-slate-200 to-slate-300 border-slate-400 text-slate-900"
                        } cursor-pointer xl:text-base text-xs px-2 rounded-lg shadow-lg border hover:opacity-80 transition-opacity`}
                      >
                        Skip
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`cursor-pointer flex gap-4 items-center xl:text-base text-xs font-semibold w-fit px-6 py-2 rounded-lg shadow-xl backdrop-blur-sm border-2 duration-200 transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/30 hover:from-slate-600/80 hover:to-slate-500/80 text-blue-400"
                        : "bg-gradient-to-r from-white/80 to-gray-100/80 border-gray-200/30 hover:from-gray-50/80 hover:to-white/80 text-blue-600"
                    }`}
                  >
                    <p>
                      Turn :{" "}
                      {gameState.turn == "red"
                        ? gameState.host
                        : gameState.guest.now}
                    </p>
                    {role == "guest" && (
                      <div
                        onClick={() => {
                          switchTurn();
                          resetTimerFirestore();
                        }}
                        className={`${
                          theme === "dark"
                            ? "bg-slate-500 border-slate-700 text-slate-200"
                            : "bg-gradient-to-b from-slate-200 to-slate-300 border-slate-400 text-slate-900"
                        } cursor-pointer xl:text-base text-xs px-2 rounded-lg shadow-lg border hover:opacity-80 transition-opacity`}
                      >
                        Skip
                      </div>
                    )}
                  </div>
                )}
              </div>
              {role === "host" &&
                gameState.guest.now != null &&
                gameState?.gameStarted == false && (
                  <div className="absolute w-full h-full top-0 left-0">
                    <div className="flex w-full h-full justify-center items-center bg-[#00000092]">
                      <div
                        className={`${
                          theme == "dark" ? "" : ""
                        } z-30 bg-gradient-to-b rounded-lg p-5 px-10`}
                      >
                        <div className="flex gap-3 items-center justify-center">
                          <img
                            src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                            alt="logo"
                            className="w-10 drop-shadow-lg"
                          />
                          <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                            MMA XOX {gameState?.isRankedRoom && "🏆"}
                          </h1>
                        </div>
                        <div className="flex text-center justify-center">
                          <div className="mt-6">
                            {/* Sadece casual maçlarda zorluk seçimi göster */}
                            {!gameState?.isRankedRoom && (
                              <div className="mb-4">
                                <h2
                                  className={`font-semibold text-lg mb-2 ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-slate-800"
                                  }`}
                                >
                                  CHOOSE DIFFICULTY
                                </h2>
                                <select
                                  value={difficulty}
                                  onChange={(e) =>
                                    setDifficulty(e.target.value)
                                  }
                                  className={`${
                                    theme === "dark"
                                      ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                                      : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                                  } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                                >
                                  <option
                                    value="EASY"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    EASY
                                  </option>
                                  <option
                                    value="MEDIUM"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    MEDIUM
                                  </option>
                                  <option
                                    value="HARD"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    HARD
                                  </option>
                                </select>
                              </div>
                            )}

                            {/* Ranked maçlarda bilgi göster */}
                            {gameState?.isRankedRoom && (
                              <div className="mb-4">
                                <div
                                  className={`p-4 rounded-lg border-2 ${
                                    theme === "dark"
                                      ? "bg-yellow-900/30 border-yellow-600"
                                      : "bg-yellow-100/50 border-yellow-400"
                                  }`}
                                >
                                  <h2 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                                    🏆{" "}
                                    <span className="text-yellow-600">
                                      Ranked Match
                                    </span>
                                  </h2>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span>Difficulty:</span>
                                      <span className="font-bold text-orange-500">
                                        MEDIUM
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>Timer:</span>
                                      <span className="font-bold text-blue-500">
                                        30 Seconds
                                      </span>
                                    </div>
                                    <p
                                      className={`text-xs mt-2 ${
                                        theme === "dark"
                                          ? "text-yellow-400"
                                          : "text-yellow-700"
                                      }`}
                                    >
                                      Settings are fixed for competitive
                                      fairness
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Ranked maçlarda ready status göster */}
                            {gameState?.isRankedRoom && (
                              <div className="mb-4">
                                <div
                                  className={`p-3 rounded-lg border ${
                                    theme === "dark"
                                      ? "bg-slate-700/50 border-slate-600"
                                      : "bg-slate-100 border-slate-300"
                                  }`}
                                >
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span>You ({gameState.host}):</span>
                                      <span
                                        className={`font-semibold ${
                                          gameState.hostReady
                                            ? "text-green-500"
                                            : "text-orange-500"
                                        }`}
                                      >
                                        {gameState.hostReady
                                          ? "✅ Ready"
                                          : "⏳ Waiting..."}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>
                                        Guest ({gameState.guest.now}):
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          gameState.guestReady
                                            ? "text-green-500"
                                            : "text-orange-500"
                                        }`}
                                      >
                                        {gameState.guestReady
                                          ? "✅ Ready"
                                          : "⏳ Waiting..."}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Timer seçimi - sadece casual maçlarda */}
                            {!gameState?.isRankedRoom && (
                              <div className="mb-3">
                                <h2 className="font-semibold text-lg">TIMER</h2>
                                <select
                                  value={timerLength}
                                  onChange={(e) =>
                                    setTimerLength(e.target.value)
                                  }
                                  className={`${
                                    theme === "dark"
                                      ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                                      : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                                  } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                                >
                                  <option
                                    value="-2"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    No time limit
                                  </option>
                                  <option
                                    value="20"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    20 Seconds
                                  </option>
                                  <option
                                    value="30"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    30 Seconds
                                  </option>
                                  <option
                                    value="40"
                                    className={`${
                                      theme === "dark"
                                        ? "bg-indigo-800"
                                        : "bg-sky-100"
                                    }`}
                                  >
                                    40 Seconds
                                  </option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (gameState.guest.now != null) {
                              // Ranked maçlarda otomatik ayarlar
                              if (gameState?.isRankedRoom) {
                                setDifficulty("MEDIUM");
                                setTimerLength("30");
                              }
                              startGame();
                            } else {
                              toast.info("No participant found for the game!");
                            }
                          }}
                          className={`${
                            theme === "dark"
                              ? "border-indigo-600 bg-gradient-to-r from-green-700 to-green-700 text-green-100 hover:from-green-600 hover:to-green-600"
                              : "border-green-400 bg-gradient-to-r from-green-300 to-green-400 text-green-900 hover:from-green-400 hover:to-green-500"
                          } ${
                            gameState.guest.now == null
                              ? "opacity-70"
                              : "opacity-100 cursor-pointer"
                          } border-2 mt-6 text-xl hover:shadow-2xl px-6 py-2 shadow-lg duration-300 cursor-pointer rounded-xl font-bold transform hover:scale-105 transition-all focus:ring-2 focus:ring-blue-400`}
                        >
                          {gameState?.isRankedRoom
                            ? "START RANKED MATCH! 🏆"
                            : "PLAY!"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            <div className="w-full flex justify-center items-center">
              {gameState?.gameStarted && gameState.guest.now != null ? (
                <div
                  className={`${
                    theme === "dark"
                      ? "bg-indigo-700/50 text-stone-200 shadow-indigo-800/20 border-indigo-900"
                      : "bg-indigo-200/50 text-stone-700 shadow-indigo-100/20 border-indigo-200"
                  } rounded-lg border relative h-fit mt-3 shadow-xl w-fit`}
                >
                  <div className={`flex gap-[2px] text-white`}>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      <div>
                        <div className="flex items-center justify-center">
                          <img
                            src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                            className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md"
                          />
                        </div>
                        <p
                          className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          MMA XOX
                        </p>
                      </div>
                    </div>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState != null &&
                      gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[0].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[0].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[0]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[0].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[1].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[1].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[1]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[1].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[2].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[2].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[2]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[2].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                  </div>
                  <div className={`flex gap-[2px] text-white`}>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[3].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[3].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[3]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[3].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter00.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter00");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter00.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter00.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter00.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter01.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter01");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter01.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter01.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter01.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter02.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter02");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter02.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter02.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter02.text}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex gap-[2px] text-white`}>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[4].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[4].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[4]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[4].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter10.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter10");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter10.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter10.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter10.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter11.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter11");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter11.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter11.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter11.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter12.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter12");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter12.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter12.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter12.text}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`flex gap-[2px] text-white`}>
                    <div
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 border ${
                        theme === "dark"
                          ? "border-stone-500 bg-stone-700"
                          : "border-stone-500 bg-stone-300"
                      } rounded-lg text-center flex items-center justify-center p-1`}
                    >
                      {gameState?.filtersSelected.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-center">
                            {gameState?.filtersSelected[5].filter_image !=
                            null ? (
                              <img
                                src={gameState?.filtersSelected[5].filter_image}
                                className="xl:w-12 lg:w-10 md:w-9 w-7 rounded-md transition-opacity duration-500 opacity-0"
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <h2 className="text-red-500 font-bold xl:text-3xl lg:text-xl text-lg italic">
                                {
                                  gameState?.filtersSelected[5]
                                    .filter_no_image_text
                                }
                              </h2>
                            )}
                          </div>
                          <p
                            className={`font-semibold xl:pt-2 pt-1 xl:text-base md:text-lg sm:text-sm text-[12px] ${
                              theme === "dark" ? "text-white" : "text-black"
                            }`}
                          >
                            {gameState?.filtersSelected[5].filter_text}
                          </p>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter20.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter20");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter20.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter20.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter20.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter21.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter21");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter21.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter21.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter21.text}
                        </p>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        if (
                          gameState.fighter22.bg ===
                          "from-stone-300 to-stone-500"
                        ) {
                          toggleFighterPick();
                          setSelected("fighter22");
                        } else {
                          toast.info("Fighter already selected.");
                        }
                      }}
                      className={`xl:w-44 xl:h-44 md:w-32 md:h-32 sm:w-24 sm:h-24 w-20 h-20 cursor-pointer border ${
                        theme === "dark"
                          ? "border-stone-700"
                          : "border-stone-500"
                      } rounded-lg shadow-md bg-gradient-to-b ${
                        gameState.fighter22.bg
                      } text-center flex items-center justify-center`}
                    >
                      <div>
                        <div className="flex justify-center">
                          <img
                            src={gameState.fighter22.url}
                            className="xl:w-12 lg:w-10 md:w-9 w-6"
                          />
                        </div>
                        <p className="font-semibold xl:text-lg lg:text-base md:text-sm text-xs mt-1 leading-[15px]">
                          {gameState.fighter22.text}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`absolute hidden select-fighter w-full text-white bottom-0 ${
                      theme === "dark"
                        ? "bg-stone-700 border-stone-600"
                        : "bg-stone-200 border-stone-400"
                    } rounded-lg border shadow-lg left-0`}
                  >
                    <div className="p-2 w-full">
                      <input
                        type="text"
                        onChange={(e) => {
                          filterByName(e.target.value);
                        }}
                        placeholder="Search for a fighter..."
                        className="bg-white input-fighter text-black xl:text-base text-sm px-3 w-full py-1 rounded-lg hover:outline-0 focus:outline-1 outline-stone-500 shadow-lg"
                      />
                      {fighters && fighters.length > 0 ? (
                        <div className="w-full h-48 overflow-scroll overflow-x-hidden">
                          {fighters.map((fighter: any, key: any) => (
                            <div
                              onClick={() => {
                                updateBox(fighter);
                              }}
                              key={key}
                              className={`flex items-center border cursor-pointer gap-6 my-3 px-2 pt-2 bg-gradient-to-r ${
                                theme === "dark"
                                  ? "from-stone-800 to-stone-900 border-stone-900 text-white"
                                  : "from-stone-300 to-stone-500 border-stone-400 text-black"
                              } shadow-lg rounded-lg`}
                            >
                              <img
                                src={
                                  fighter.Picture == "Unknown"
                                    ? "https://cdn2.iconfinder.com/data/icons/social-messaging-productivity-6-1/128/profile-image-male-question-512.png"
                                    : fighter.Picture
                                }
                                onLoad={(e) => {
                                  e.currentTarget.classList.remove("opacity-0");
                                  e.currentTarget.classList.add("opacity-100");
                                }}
                                className="xl:w-13 w-10 opacity-0 transition-opacity duration-500"
                                loading="lazy"
                              />
                              <p className="xl:text-lg md:text-base text-sm font-semibold">
                                {fighter.Fighter}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex justify-end py-2">
                        <button
                          onClick={() => {
                            toggleFighterPick();
                          }}
                          className={` ${
                            theme === "dark"
                              ? "bg-stone-800 text-white border-stone-600"
                              : "bg-stone-300 text-black border-stone-400"
                          } px-6 py-1 font-semibold rounded-tr-lg rounded-bl-lg shadow-lg border cursor-pointer`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* GUEST READY MODAL - Yeni eklenen kısım */}
      {role === "guest" &&
        gameState.guest.now != null &&
        gameState?.gameStarted == false &&
        gameState?.isRankedRoom && (
          <div className="absolute w-full h-full top-0 left-0">
            <div className="flex w-full h-full justify-center items-center bg-[#00000092]">
              <div
                className={`${
                  theme == "dark"
                    ? "from-indigo-700 to-indigo-800 border-indigo-600"
                    : "from-indigo-100 to-indigo-200 border-indigo-300"
                } z-30 bg-gradient-to-b border-2 rounded-lg p-5 px-10`}
              >
                <div className="flex gap-3 items-center justify-center">
                  <img
                    src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                    alt="logo"
                    className="w-10 drop-shadow-lg"
                  />
                  <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                    MMA XOX 🏆
                  </h1>
                </div>
                <div className="flex text-center justify-center">
                  <div className="mt-6">
                    {/* Ranked maç bilgisi */}
                    <div className="mb-4">
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          theme === "dark"
                            ? "bg-yellow-900/30 border-yellow-600"
                            : "bg-yellow-100/50 border-yellow-400"
                        }`}
                      >
                        <h2 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                          🏆{" "}
                          <span className="text-yellow-600">Ranked Match</span>
                        </h2>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Difficulty:</span>
                            <span className="font-bold text-orange-500">
                              MEDIUM
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Timer:</span>
                            <span className="font-bold text-blue-500">
                              30 Seconds
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-2 ${
                              theme === "dark"
                                ? "text-yellow-400"
                                : "text-yellow-700"
                            }`}
                          >
                            Settings are fixed for competitive fairness
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ready status */}
                    <div className="mb-4">
                      <div
                        className={`p-3 rounded-lg border ${
                          theme === "dark"
                            ? "bg-slate-700/50 border-slate-600"
                            : "bg-slate-100 border-slate-300"
                        }`}
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Host ({gameState.host}):</span>
                            <span
                              className={`font-semibold ${
                                gameState.hostReady
                                  ? "text-green-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {gameState.hostReady
                                ? "✅ Ready"
                                : "⏳ Setting up..."}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>You ({gameState.guest.now}):</span>
                            <span
                              className={`font-semibold ${
                                gameState.guestReady
                                  ? "text-green-500"
                                  : "text-orange-500"
                              }`}
                            >
                              {gameState.guestReady
                                ? "✅ Ready"
                                : "⏳ Waiting..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!roomId) return;
                    const roomRef = doc(db, "rooms", roomId);
                    await updateDoc(roomRef, {
                      guestReady: true,
                      lastActivityAt: serverTimestamp(),
                      expireAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
                    });
                    toast.success("You are ready! Waiting for host...");
                  }}
                  disabled={gameState.guestReady}
                  className={`${
                    gameState.guestReady
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105"
                  } ${
                    theme === "dark"
                      ? "border-indigo-600 bg-gradient-to-r from-green-700 to-green-700 text-green-100 hover:from-green-600 hover:to-green-600"
                      : "border-green-400 bg-gradient-to-r from-green-300 to-green-400 text-green-900 hover:from-green-400 hover:to-green-500"
                  } border-2 mt-6 text-xl hover:shadow-2xl px-6 py-2 shadow-lg duration-300 rounded-xl font-bold transform transition-all focus:ring-2 focus:ring-green-400 w-full`}
                >
                  {gameState.guestReady
                    ? "✅ Ready! Waiting for host..."
                    : "🚀 I'm Ready!"}
                </button>
              </div>
            </div>
          </div>
        )}
      {/* HOST SETUP MODAL - Güncellenmiş hali */}
      {role === "host" &&
        gameState.guest.now != null &&
        gameState?.gameStarted == false && (
          <div className="absolute w-full h-full top-0 left-0">
            <div className="flex w-full h-full justify-center items-center bg-[#00000092]">
              <div
                className={`${
                  theme == "dark"
                    ? "from-indigo-700 to-indigo-800 border-indigo-600"
                    : "from-indigo-100 to-indigo-200 border-indigo-300"
                } z-30 bg-gradient-to-b border-2 rounded-lg p-5 px-10`}
              >
                <div className="flex gap-3 items-center justify-center">
                  <img
                    src="https://cdn-icons-png.freepik.com/512/921/921676.png"
                    alt="logo"
                    className="w-10 drop-shadow-lg"
                  />
                  <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                    MMA XOX {gameState?.isRankedRoom && "🏆"}
                  </h1>
                </div>
                <div className="flex text-center justify-center">
                  <div className="mt-6">
                    {/* Sadece casual maçlarda zorluk seçimi göster */}
                    {!gameState?.isRankedRoom && (
                      <div className="mb-4">
                        <h2
                          className={`font-semibold text-lg mb-2 ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}
                        >
                          CHOOSE DIFFICULTY
                        </h2>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className={`${
                            theme === "dark"
                              ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                              : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                          } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                        >
                          <option
                            value="EASY"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            EASY
                          </option>
                          <option
                            value="MEDIUM"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            MEDIUM
                          </option>
                          <option
                            value="HARD"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            HARD
                          </option>
                        </select>
                      </div>
                    )}

                    {/* Ranked maçlarda bilgi göster */}
                    {gameState?.isRankedRoom && (
                      <div className="mb-4">
                        <div
                          className={`p-4 rounded-lg border-2 ${
                            theme === "dark"
                              ? "bg-yellow-900/30 border-yellow-600"
                              : "bg-yellow-100/50 border-yellow-400"
                          }`}
                        >
                          <h2 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                            🏆{" "}
                            <span className="text-yellow-600">
                              Ranked Match
                            </span>
                          </h2>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Difficulty:</span>
                              <span className="font-bold text-orange-500">
                                MEDIUM
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Timer:</span>
                              <span className="font-bold text-blue-500">
                                30 Seconds
                              </span>
                            </div>
                            <p
                              className={`text-xs mt-2 ${
                                theme === "dark"
                                  ? "text-yellow-400"
                                  : "text-yellow-700"
                              }`}
                            >
                              Settings are fixed for competitive fairness
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ranked maçlarda ready status göster */}
                    {gameState?.isRankedRoom && (
                      <div className="mb-4">
                        <div
                          className={`p-3 rounded-lg border ${
                            theme === "dark"
                              ? "bg-slate-700/50 border-slate-600"
                              : "bg-slate-100 border-slate-300"
                          }`}
                        >
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>You ({gameState.host}):</span>
                              <span
                                className={`font-semibold ${
                                  gameState.hostReady
                                    ? "text-green-500"
                                    : "text-orange-500"
                                }`}
                              >
                                {gameState.hostReady
                                  ? "✅ Ready"
                                  : "⏳ Waiting..."}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Guest ({gameState.guest.now}):</span>
                              <span
                                className={`font-semibold ${
                                  gameState.guestReady
                                    ? "text-green-500"
                                    : "text-orange-500"
                                }`}
                              >
                                {gameState.guestReady
                                  ? "✅ Ready"
                                  : "⏳ Waiting..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timer seçimi - sadece casual maçlarda */}
                    {!gameState?.isRankedRoom && (
                      <div className="mb-3">
                        <h2
                          className={`${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          } font-semibold text-lg`}
                        >
                          TIMER
                        </h2>
                        <select
                          value={timerLength}
                          onChange={(e) => setTimerLength(e.target.value)}
                          className={`${
                            theme === "dark"
                              ? "text-indigo-100 bg-gradient-to-r from-indigo-800 to-indigo-800 border-indigo-600"
                              : "text-indigo-900 bg-gradient-to-r from-indigo-200 to-sky-300 border-indigo-400"
                          } shadow-lg focus:outline-0 cursor-pointer border-2 font-semibold rounded-lg px-3 py-1 transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-indigo-400`}
                        >
                          <option
                            value="-2"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            No time limit
                          </option>
                          <option
                            value="20"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            20 Seconds
                          </option>
                          <option
                            value="30"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            30 Seconds
                          </option>
                          <option
                            value="40"
                            className={`${
                              theme === "dark" ? "bg-indigo-800" : "bg-sky-100"
                            }`}
                          >
                            40 Seconds
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (gameState.guest.now != null) {
                      // Ranked maçlarda otomatik ayarlar
                      if (gameState?.isRankedRoom) {
                        setDifficulty("MEDIUM");
                        setTimerLength("30");

                        // Host ready durumunu işaretle
                        if (!roomId) return;
                        const roomRef = doc(db, "rooms", roomId);
                        await updateDoc(roomRef, {
                          hostReady: true,
                          lastActivityAt: serverTimestamp(),
                          expireAt: Timestamp.fromMillis(
                            Date.now() + ROOM_TTL_MS
                          ),
                        });

                        // Her iki taraf da ready ise oyunu başlat
                        if (gameState.guestReady) {
                          startGame();
                        } else {
                          toast.success("You are ready! Waiting for guest...");
                        }
                      } else {
                        // Casual maçlarda direkt başlatılacak
                        startGame();
                      }
                    } else {
                      toast.info("No participant found for the game!");
                    }
                  }}
                  disabled={gameState?.isRankedRoom && gameState.hostReady}
                  className={`${
                    gameState?.isRankedRoom && gameState.hostReady
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105"
                  } ${
                    theme === "dark"
                      ? "border-indigo-600 bg-gradient-to-r from-green-700 to-green-700 text-green-100 hover:from-green-600 hover:to-green-600"
                      : "border-green-400 bg-gradient-to-r from-green-300 to-green-400 text-green-900 hover:from-green-400 hover:to-green-500"
                  } border-2 mt-6 text-xl hover:shadow-2xl px-6 py-2 shadow-lg duration-300 rounded-xl font-bold transform transition-all focus:ring-2 focus:ring-green-400 w-full
                   ${
                     gameState.guest.now == null ? "opacity-70" : "opacity-100"
                   } border-2 mt-6 text-xl hover:shadow-2xl px-6 py-2 shadow-lg duration-300 rounded-xl font-bold transform transition-all focus:ring-2 focus:ring-blue-400`}
                >
                  {gameState?.isRankedRoom
                    ? gameState.hostReady
                      ? "✅ Ready! Waiting for guest..."
                      : "🚀 I'm Ready!"
                    : "PLAY!"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Guest Forfeit Modal */}
      {guestForfeitModal && role === "host" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`${
              theme === "dark"
                ? "bg-gradient-to-br from-indigo-700 to-indigo-900 border-indigo-600 shadow-indigo-900/75"
                : "bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-300 shadow-indigo-200/75"
            } border-2 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl`}
          >
            <h2
              className={`${
                theme === "dark" ? "text-white" : "text-gray-900"
              } text-3xl font-bold text-center mb-2`}
            >
              Guest Forfeited!
            </h2>

            <p
              className={`${
                theme === "dark" ? "text-purple-200" : "text-purple-700"
              } text-center text-lg mb-6`}
            >
              🏆 You win by forfeit!
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setGuestForfeitModal(false);
                  startNewRankedMatch();
                }}
                className={`${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:scale-[1.03] hover:to-green-600 text-white duration-200 cursor-pointer"
                    : "bg-gradient-to-r from-green-400 to-green-500 hover:scale-[1.03] text-green-900 duration-200 cursor-pointer"
                } w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                Play Again
              </button>

              <button
                onClick={() => {
                  setGuestForfeitModal(false);
                  navigate("/menu");
                }}
                className={`${
                  theme === "dark"
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.03] text-white duration-200 cursor-pointer"
                    : "bg-gradient-to-r from-red-400 to-red-500 hover:scale-[1.03] text-red-900 duration-200 cursor-pointer"
                } w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wait for Host Modal - Casual maçlarda guest oyuncu bir sonraki maç için host'u beklerken */}
      {showWaitingGuest && !gameState?.isRankedRoom && role === "guest" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-600"
                : "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300"
            } border-2 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl`}
          >
            <h2
              className={`${
                theme === "dark" ? "text-white" : "text-gray-900"
              } text-3xl font-bold text-center mb-2`}
            >
              Waiting for Host
            </h2>

            <p
              className={`${
                theme === "dark" ? "text-blue-200" : "text-blue-700"
              } text-center text-lg mb-6`}
            >
              ⏳ Waiting for {gameState?.host} to start a new game...
            </p>

            {/* Animasyon için dönen nokta */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                  } animate-bounce`}
                ></div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                  } animate-bounce delay-100`}
                ></div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                  } animate-bounce delay-200`}
                ></div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWaitingGuest(false);
                navigate("/menu");
              }}
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.03] text-white duration-200 cursor-pointer"
                  : "bg-gradient-to-r from-red-400 to-red-500 hover:scale-[1.03] text-red-900 duration-200 cursor-pointer"
              } w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              Go Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Host Forfeit Modal */}
      {hostForfeitModal && role === "guest" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`${
              theme === "dark"
                ? "bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-600"
                : "bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300"
            } border-2 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl`}
          >
            <h2
              className={`${
                theme === "dark" ? "text-white" : "text-gray-900"
              } text-3xl font-bold text-center mb-2`}
            >
              Host Forfeited!
            </h2>

            <p
              className={`${
                theme === "dark" ? "text-purple-200" : "text-purple-700"
              } text-center text-lg mb-6`}
            >
              🏆 You win by forfeit!
            </p>

            <button
              onClick={() => {
                setHostForfeitModal(false);
                navigate("/menu");
              }}
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.03] text-white duration-200 cursor-pointer"
                  : "bg-gradient-to-r from-red-400 to-red-500 hover:scale-[1.03] text-red-900 duration-200 cursor-pointer"
              } w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Ranked Forfeit Modal - Host asking for exit during active game */}
      {rankedForfeitModal && role === "host" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`${
              theme === "dark"
                ? "bg-gradient-to-r from-indigo-800 to-indigo-900 border-indigo-700"
                : "bg-gradient-to-r from-indigo-100 to-sky-200 border-indigo-300"
            } border-2 w-80 lg:px-6 lg:py-4 px-4 py-2 rounded-lg shadow-lg`}
          >
            <p className="xl:text-2xl text-center lg:text-xl text-lg font-semibold mb-4">
              ⚠️ Forfeit Match?
            </p>
            <p
              className={`text-center mb-6 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              You will lose this ranked game. Guest will win and gain points.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRankedForfeitModal(false)}
                className={`${
                  theme === "dark"
                    ? "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white"
                    : "bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-200 hover:to-slate-300 text-black"
                } flex-1 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                Cancel
              </button>
              <button
                onClick={handleRankedForfeit}
                className={`${
                  theme === "dark"
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
                    : "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-300 hover:to-red-400 text-red-900"
                } flex-1 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                Yes, Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest sees host forfeited modal */}
      {guestForfeitVictoryModal && role === "guest" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            className={`${
              theme === "dark"
                ? "bg-gradient-to-r from-green-800 to-emerald-900 border-green-700"
                : "bg-gradient-to-r from-green-100 to-emerald-200 border-green-300"
            } border-2 w-80 lg:px-6 lg:py-4 px-4 py-2 rounded-lg shadow-lg`}
          >
            <p className="xl:text-2xl text-center lg:text-xl text-lg font-semibold mb-4">
              🏆 Victory!
            </p>
            <p
              className={`text-center mb-6 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Host forfeited the match. You win and gain 15 points!
            </p>
            <button
              onClick={() => {
                setGuestForfeitVictoryModal(false);
                navigate("/menu");
              }}
              className={`${
                theme === "dark"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                  : "bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-300 hover:to-emerald-300 text-green-900"
              } w-full py-2 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl`}
            >
              Go Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
