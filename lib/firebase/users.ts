import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "./config"

// Register a new user
export async function registerUser(email, password, name) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with name
    await updateProfile(user, { displayName: name })

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name,
      createdAt: new Date(),
      isAdmin: false,
    })

    return {
      uid: user.uid,
      email: user.email,
      name,
      isAdmin: false,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Sign in a user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))

    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...userDoc.data(),
      }
    } else {
      // If user doesn't exist in Firestore, create a basic profile
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
        createdAt: new Date(),
        isAdmin: false,
      }

      await setDoc(doc(db, "users", user.uid), userData)

      return userData
    }
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out a user
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    return true
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get user profile
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))

    if (userDoc.exists()) {
      return {
        uid,
        ...userDoc.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(uid, userData) {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    })

    return {
      uid,
      ...userData,
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function getUsers(limitCount = 100) {
  try {
    const usersCollection = collection(db, "users")
    const q = query(usersCollection, orderBy("createdAt", "desc"), limit(limitCount))
    const usersSnapshot = await getDocs(q)

    const users = usersSnapshot.docs.map((doc) => {
      const userData = doc.data()
      return {
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLogin: userData.lastLogin?.toDate() || null,
      }
    })

    return users
  } catch (error) {
    console.error("Error getting users:", error)
    return []
  }
}
