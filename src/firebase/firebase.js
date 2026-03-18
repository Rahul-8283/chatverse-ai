import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

export const listenForMessages = (chatId, setMessages) => {
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

export { auth, db };
