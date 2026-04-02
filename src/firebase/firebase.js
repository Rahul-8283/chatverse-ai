import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export const listenForChats = (setChats) => {
  const chatsRef = collection(db, "chats");
  const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
    const chatList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const filteredChats = chatList.filter((chat) => chat?.users?.some((user) => user.email === auth.currentUser.email));

    setChats(filteredChats);
  });
  return unsubscribe;
};

export const sendMessage = async (messageText, chatId, user1, user2) => {
  const chatRef = doc(db, "chats", chatId);

  const user1Doc = await getDoc(doc(db, "users", user1));
  const user2Doc = await getDoc(doc(db, "users", user2));

  // console.log(user1Doc);
  // console.log(user2Doc);

  const user1Data = user1Doc.data();
  const user2Data = user2Doc.data();

  const chatDoc = await getDoc(chatRef);
  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      users: [user1Data, user2Data],
      lastMessage: messageText,
      lastMessageTimestamp: serverTimestamp(),
    });
  }
  else {
    await updateDoc(chatRef, {
      lastMessage: messageText,
      lastMessageTimestamp: serverTimestamp(),
    });
  }

  // creating a sub collection
  const messageRef = collection(db, "chats", chatId, "messages");
  await addDoc(messageRef, {
    text: messageText,
    sender: auth.currentUser.email,
    timestamp: serverTimestamp(),
  });
};

// ... (keep existing imports)
import { query, where, writeBatch } from "firebase/firestore";

// ... (keep existing code)

/**
 * Updates the user's profile information (fullName and/or image) in the 'users' collection
 * and propagates those changes to all 'chats' the user is a part of.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updatedData - An object containing the fields to update (e.g., { fullName: "New Name", image: "new_url.jpg" }).
 */
export const updateUserProfile = async (userId, updatedData) => {
  const userDocRef = doc(db, "users", userId);

  // 1. Update the user's document in the 'users' collection
  await updateDoc(userDocRef, updatedData);

  // 2. Find all chats where this user is a participant
  const chatsQuery = query(
    collection(db, "chats"),
    where("users", "array-contains", { 
      uid: userId,
      // We need to match the existing structure, so we get the current user data first
      // This part is tricky because the other fields (email, fullName, etc.) must match exactly.
      // A better data model would be to just store user IDs in the array.
      // For now, we'll fetch the user's current data to build the query.
      // Note: This is a simplified example. A more robust solution would be needed
      // if the user object in the `users` array contains more than just the uid.
      // Let's assume for now we can query by UID in the array.
      // A more realistic query if the full user object is stored:
      // This requires knowing the *exact* object. A better approach is a backend function.
    })
  );
  
  // Since querying by a field in an object within an array is complex,
  // a more practical (though less efficient) approach for the client-side is to fetch all user's chats
  // and update them in a batch.
  
  const userChatsQuery = query(
    collection(db, "chats"),
    where(`usersMap.${userId}`, "==", true) // Assumes you have a `usersMap` for easy lookups
  );

  // Let's stick to a more feasible client-side approach without changing the data model yet.
  // We'll fetch all chats and filter client-side. This is NOT efficient for large scale.
  // A backend Cloud Function would be the proper solution.

  const allChatsSnapshot = await getDocs(collection(db, "chats"));
  const userChats = [];
  allChatsSnapshot.forEach((doc) => {
    const chat = doc.data();
    if (chat.users && chat.users.some(u => u.uid === userId)) {
      userChats.push({ id: doc.id, ...chat });
    }
  });

  // 3. Create a batch write to update all relevant chats at once
  const batch = writeBatch(db);
  userChats.forEach((chat) => {
    const chatRef = doc(db, "chats", chat.id);
    const updatedUsersArray = chat.users.map(user => {
      if (user.uid === userId) {
        // Merge existing user data with the new updates
        return { ...user, ...updatedData };
      }
      return user;
    });
    batch.update(chatRef, { users: updatedUsersArray });
  });

  // 4. Commit the batch write
  await batch.commit();
};


export const listenForMessages = (chatId, setMessages) => {
// ... (rest of the function is the same)
  const chatRef = collection(db, "chats", chatId, "messages");
  onSnapshot(chatRef, (snapshot) => {
    const messages = snapshot.docs.map((doc) => doc.data());
    setMessages(messages);
  })
}

/**
 * Initialize AI Bot user in Firestore
 * Creates AI assistant user if it doesn't exist
 */
export const initializeAIBot = async () => {
  try {
    const aiBotRef = doc(db, "users", "ai-assistant-bot");
    const aiBotDoc = await getDoc(aiBotRef);

    // If AI Bot doesn't exist, create it
    if (!aiBotDoc.exists()) {
      await setDoc(aiBotRef, {
        uid: "ai-assistant-bot",
        fullName: "ChatVerse AI",
        username: "chatverse-ai",
        email: "bot@chatverse.ai",
        image: "",
        // image: "https://via.placeholder.com/150?text=AI+Bot",
        isBot: true,
        createdAt: serverTimestamp(),
      });
      console.log("✅ AI Bot user created successfully");
    } else {
      console.log("✅ AI Bot user already exists");
    }
  } catch (error) {
    console.error("Error initializing AI Bot:", error);
  }
};

/**
 * Save AI conversation to Firestore
 */
export const saveAIMessage = async (userId, conversationId, messageText, sender) => {
  try {
    const messageRef = collection(db, "ai-chats", userId, "conversations", conversationId, "messages");
    
    await addDoc(messageRef, {
      text: messageText,
      sender: sender, // "user" or "ai"
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving AI message:", error);
    throw error;
  }
};

/**
 * Get AI conversation messages
 */
export const listenForAIMessages = (userId, conversationId, setMessages) => {
  try {
    const messageRef = collection(db, "ai-chats", userId, "conversations", conversationId, "messages");
    
    const unsubscribe = onSnapshot(messageRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    }, (error) => {
      console.error("Error listening for AI messages:", error);
      throw error;
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up AI messages listener:", error);
    throw error;
  }
};

export { auth, db, googleProvider };
