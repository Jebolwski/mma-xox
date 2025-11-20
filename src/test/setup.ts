import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase
vi.mock('../firebase', () => ({
    db: {},
    auth: {
        currentUser: null,
    },
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn((_auth, callback) => {
        callback(null);
        return vi.fn(); // unsubscribe function
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
}))

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    setDoc: vi.fn(),
    getDoc: vi.fn(),
}))

// Mock React Router - JSX olmadan
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams()],
    Navigate: ({ to }: { to: string }) => ({ type: 'Navigate', props: { to } }),
    Link: ({ to, children }: { to: string; children: any }) => ({ type: 'Link', props: { to, children } }),
    BrowserRouter: ({ children }: { children: any }) => children,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})