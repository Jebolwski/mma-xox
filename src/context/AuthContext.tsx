import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const createUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.email!);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Yeni kullanıcı için profil oluştur
        const defaultStats = {
          points: 100,
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          level: "Silver",
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        await setDoc(userRef, {
          email: user.email,
          username: user.email?.split("@")[0] || "User",
          stats: defaultStats,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        });

        console.log("User profile created in Firestore");
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(auth, email, password).then(
      (userCredential) => {
        // Kullanıcı oluşturulduktan sonra Firestore'a ekle
        console.log("userCredential:", userCredential);

        createUserProfile(userCredential.user);
      },
    );
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email)),
      );

      if (userSnap.empty) {
        // New user - create profile with Google info
        const baseUsername = user.email!.split("@")[0].toLowerCase();
        let username = baseUsername
          .replace(/[^a-z0-9_-]/g, "_")
          .substring(0, 14);

        // Check if username is available
        let counter = 1;
        let isAvailable = false;

        while (!isAvailable) {
          const usernameQuery = query(
            collection(db, "users"),
            where("username", "==", username),
          );
          const usernameSnap = await getDocs(usernameQuery);
          if (usernameSnap.empty) {
            isAvailable = true;
          } else {
            username = `${baseUsername}${counter}`;
            counter++;
          }
        }

        const newUserProfile = {
          email: user.email,
          username: username,
          lastUsernameChangeAt: new Date().toISOString(),
          avatarUrl:
            user.photoURL ||
            "https://preview.redd.it/the-new-discord-default-profile-pictures-v0-tbhgxr7adj7f1.png?width=1024&auto=webp&s=d64e0fdfeac749167246780dcc5e82915c6d7b70",
          activeTitle: "Arena Rookie",
          unlockedTitles: ["Arena Rookie"],
          achievements: {},
          stats: {
            points: 100,
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          },
          createdAt: new Date().toISOString(),
        };

        const userRef = doc(db, "users", user.email!);
        await setDoc(userRef, newUserProfile);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signInWithTwitter = async (): Promise<void> => {
    try {
      const provider = new OAuthProvider("twitter.com");
      provider.addScope("tweet.read");
      provider.addScope("users.read");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userSnap = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email)),
      );

      if (userSnap.empty) {
        // New user - create profile with Twitter info
        const baseUsername = user.email!.split("@")[0].toLowerCase();
        let username = baseUsername
          .replace(/[^a-z0-9_-]/g, "_")
          .substring(0, 14);

        // Check if username is available
        let counter = 1;
        let isAvailable = false;

        while (!isAvailable) {
          const usernameQuery = query(
            collection(db, "users"),
            where("username", "==", username),
          );
          const usernameSnap = await getDocs(usernameQuery);
          if (usernameSnap.empty) {
            isAvailable = true;
          } else {
            username = `${baseUsername}${counter}`;
            counter++;
          }
        }

        const newUserProfile = {
          email: user.email,
          username: username,
          lastUsernameChangeAt: new Date().toISOString(),
          avatarUrl:
            user.photoURL ||
            "https://preview.redd.it/the-new-discord-default-profile-pictures-v0-tbhgxr7adj7f1.png?width=1024&auto=webp&s=d64e0fdfeac749167246780dcc5e82915c6d7b70",
          activeTitle: "Arena Rookie",
          unlockedTitles: ["Arena Rookie"],
          achievements: {},
          stats: {
            points: 100,
            totalGames: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          },
          createdAt: new Date().toISOString(),
        };

        const userRef = doc(db, "users", user.email!);
        await setDoc(userRef, newUserProfile);
      }
    } catch (error) {
      console.error("Twitter sign-in error:", error);
      throw error;
    }
  };

  const logout = () => {
    return firebaseSignOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    signInWithGoogle,
    signInWithTwitter,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
