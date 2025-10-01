import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Import db from your firebase configuration

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
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
      }
    );
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
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
