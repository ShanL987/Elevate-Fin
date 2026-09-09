import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { 
  UserFinancialData, 
  UserLoan, 
  FinancialProfile,
  FinancialHealthSnapshot,
  NotificationRecord,
  NotificationPreferences
} from '../types';
import { computeFinancialTelemetry } from '../utils/finance';

// Config resolution (supporting json config + optional Vite env overrides)
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
};

export { onAuthStateChanged };
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Use specified database ID if present, otherwise default
export const db: Firestore = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Authentication Methods
 */
export async function signUpWithEmail(fullName: string, email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;

  // Set displayName in Firebase Auth
  if (fullName.trim()) {
    await updateProfile(user, { displayName: fullName.trim() });
  }

  // Create initial user profile in Firestore
  const initialData: Partial<UserFinancialData> = {
    uid: user.uid,
    name: fullName.trim() || 'Private Client',
    email: user.email || email.trim(),
    provider: 'password',
    createdAt: new Date().toISOString(),
    onboardingCompleted: false,
    monthlyIncome: 85000,
    monthlyExpenses: 38000,
    savings: 280000,
    investments: 150000,
    creditScore: 785,
    healthInsuranceCoverage: 1000000,
    termInsuranceCoverage: 10000000,
    clientTier: 'Premier Client Tier',
    healthScore: 82,
    monthlyEmi: 0,
    debtRatio: 0,
    safeAdditionalEmi: 34000,
    liquidRunwayMonths: 7.3,
  };

  await setDoc(doc(db, 'users', user.uid), initialData, { merge: true });
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  // Check if profile exists; if not, create it
  const userDocRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userDocRef);

  if (!existingDoc.exists()) {
    const initialData: Partial<UserFinancialData> = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Google Client',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      provider: 'google',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
      monthlyIncome: 95000,
      monthlyExpenses: 42000,
      savings: 350000,
      investments: 200000,
      creditScore: 800,
      healthInsuranceCoverage: 1500000,
      termInsuranceCoverage: 15000000,
      clientTier: 'Private Wealth Tier',
      healthScore: 85,
      monthlyEmi: 0,
      debtRatio: 0,
      safeAdditionalEmi: 38000,
      liquidRunwayMonths: 8.3,
    };
    await setDoc(userDocRef, initialData, { merge: true });
  } else if (user.photoURL && !existingDoc.data()?.photoURL) {
    await updateDoc(userDocRef, { photoURL: user.photoURL });
  }

  return user;
}

export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Firestore User Profile Management
 */
export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserFinancialData | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as UserFinancialData);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.error('Error fetching user profile snapshot:', err);
      onError?.(err);
    }
  );
}

export async function updateUserProfile(uid: string, updates: Partial<UserFinancialData>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Firestore Loans Management
 */
export function subscribeToUserLoans(
  uid: string,
  onLoans: (loans: UserLoan[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const loansCollection = collection(db, 'users', uid, 'loans');
  return onSnapshot(
    loansCollection,
    (snapshot) => {
      const loans: UserLoan[] = [];
      snapshot.forEach((docSnap) => {
        loans.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<UserLoan, 'id'>),
        });
      });
      // Sort newest first
      loans.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onLoans(loans);
    },
    (err) => {
      console.error('Error fetching loans snapshot:', err);
      onError?.(err);
    }
  );
}

export async function addUserLoan(uid: string, loan: Omit<UserLoan, 'id'>): Promise<string> {
  const loansCollection = collection(db, 'users', uid, 'loans');
  const now = new Date().toISOString();
  const docRef = await addDoc(loansCollection, {
    ...loan,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateUserLoan(uid: string, loanId: string, updates: Partial<UserLoan>): Promise<void> {
  const loanDocRef = doc(db, 'users', uid, 'loans', loanId);
  await updateDoc(loanDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteUserLoan(uid: string, loanId: string): Promise<void> {
  const loanDocRef = doc(db, 'users', uid, 'loans', loanId);
  await deleteDoc(loanDocRef);
}

/**
 * Helper to transform UserFinancialData + UserLoans into standard FinancialProfile for app views
 */
export function buildFinancialProfile(
  userData: UserFinancialData | null,
  loans: UserLoan[]
): FinancialProfile {
  if (!userData) {
    return {
      monthlyIncome: 80000,
      monthlyEmi: 0,
      debtRatio: 0,
      healthScore: 80,
      safeAdditionalEmi: 32000,
      clientName: 'Private Client',
      clientTier: 'Premier Client Tier',
      liquidRunwayMonths: 8.0,
      creditScore: 785,
      activeLoanCount: 0,
    };
  }

  // Calculate sum of active loan EMIs
  const activeLoans = loans.filter((l) => l.status === 'active');
  const totalEmi = activeLoans.reduce((sum, l) => sum + (Number(l.emi) || 0), 0);
  
  // Categorize EMIs for telemetry breakdown
  let home = 0;
  let personal = 0;
  let auto = 0;
  let other = 0;

  activeLoans.forEach((l) => {
    const val = Number(l.emi) || 0;
    if (l.type === 'home') home += val;
    else if (l.type === 'personal') personal += val;
    else if (l.type === 'auto') auto += val;
    else other += val;
  });

  const telemetry = computeFinancialTelemetry({
    name: userData.name,
    monthlyIncome: userData.monthlyIncome,
    homeLoanEmi: home,
    personalLoanEmi: personal,
    autoLoanEmi: auto,
    otherEmi: other,
    totalMonthlyEmi: totalEmi,
    liquidSavings: userData.savings,
    tier: userData.clientTier,
  });

  // Ensure credit score from user profile is respected if set
  if (userData.creditScore && userData.creditScore > 300) {
    telemetry.creditScore = userData.creditScore;
  }

  return {
    ...telemetry,
    clientName: userData.name,
    clientTier: userData.clientTier || telemetry.clientTier,
  };
}

/**
 * Financial Health Snapshots Persistence
 * Collection: users/{uid}/financialHealthSnapshots/{snapshotId}
 */
export async function saveFinancialHealthSnapshot(
  uid: string, 
  snapshot: Omit<FinancialHealthSnapshot, 'id'>
): Promise<string> {
  const collectionRef = collection(db, 'users', uid, 'financialHealthSnapshots');
  const docRef = await addDoc(collectionRef, {
    ...snapshot,
    timestamp: snapshot.timestamp || new Date().toISOString(),
  });
  return docRef.id;
}

export function subscribeToFinancialHealthSnapshots(
  uid: string,
  onSnapshots: (snapshots: FinancialHealthSnapshot[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, 'users', uid, 'financialHealthSnapshots');
  return onSnapshot(
    collectionRef,
    (querySnap) => {
      const items: FinancialHealthSnapshot[] = [];
      querySnap.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<FinancialHealthSnapshot, 'id'>),
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onSnapshots(items);
    },
    (err) => {
      console.error('Error in financialHealthSnapshots listener:', err);
      onError?.(err);
    }
  );
}

/**
 * Notifications & Alert History Persistence
 * Collection: users/{uid}/notifications/{notificationId}
 */
export async function saveNotificationRecord(
  uid: string,
  notification: Omit<NotificationRecord, 'id'>
): Promise<string> {
  const collectionRef = collection(db, 'users', uid, 'notifications');
  const docRef = await addDoc(collectionRef, {
    ...notification,
    createdAt: notification.createdAt || new Date().toISOString(),
  });
  return docRef.id;
}

export function subscribeToNotifications(
  uid: string,
  onNotifications: (notifications: NotificationRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, 'users', uid, 'notifications');
  return onSnapshot(
    collectionRef,
    (querySnap) => {
      const items: NotificationRecord[] = [];
      querySnap.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<NotificationRecord, 'id'>),
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onNotifications(items);
    },
    (err) => {
      console.error('Error in notifications listener:', err);
      onError?.(err);
    }
  );
}

/**
 * Notification Preferences
 * Doc: users/{uid}/notificationPreferences/settings
 */
export async function getNotificationPreferences(uid: string): Promise<NotificationPreferences> {
  const defaultPrefs: NotificationPreferences = {
    weeklyCheckin: true,
    dangerZoneAlerts: true,
    spendingAlerts: true,
    creditAlerts: true,
    loanEmiAlerts: true,
  };

  try {
    const docRef = doc(db, 'users', uid, 'notificationPreferences', 'settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultPrefs, ...(docSnap.data() as NotificationPreferences) };
    }
  } catch (err) {
    console.error('Error fetching notification preferences:', err);
  }
  return defaultPrefs;
}

export async function updateNotificationPreferences(
  uid: string,
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'notificationPreferences', 'settings');
  await setDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export function subscribeToNotificationPreferences(
  uid: string,
  onPrefs: (prefs: NotificationPreferences) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const defaultPrefs: NotificationPreferences = {
    weeklyCheckin: true,
    dangerZoneAlerts: true,
    spendingAlerts: true,
    creditAlerts: true,
    loanEmiAlerts: true,
  };

  const docRef = doc(db, 'users', uid, 'notificationPreferences', 'settings');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onPrefs({ ...defaultPrefs, ...(docSnap.data() as NotificationPreferences) });
      } else {
        onPrefs(defaultPrefs);
      }
    },
    (err) => {
      console.error('Error in notificationPreferences listener:', err);
      onError?.(err);
    }
  );
}

