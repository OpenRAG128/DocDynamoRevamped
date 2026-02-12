import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

// Tailwind utility
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// IndexedDB helpers for file storage
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DocDynamoDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const idb = event.target.result;
      if (!idb.objectStoreNames.contains("files")) {
        idb.createObjectStore("files", { keyPath: "id" });
      }
    };
  });
};

export const saveFilesToIndexedDB = async (files, chatId) => {
  try {
    const idb = await initDB();
    const tx = idb.transaction("files", "readwrite");
    const store = tx.objectStore("files");

    files.forEach((file) => {
      store.add({
        id: `${chatId}_${file.name}_${Date.now()}`,
        chatId: chatId,
        name: file.name,
        type: file.type,
        size: file.size,
        data: file,
        timestamp: new Date().toISOString(),
      });
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Error saving files to IndexedDB:", error);
    throw error;
  }
};

export const getFilesFromIndexedDB = async (chatId) => {
  try {
    const idb = await initDB();
    const tx = idb.transaction("files", "readonly");
    const store = tx.objectStore("files");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allFiles = request.result;
        const chatFiles = allFiles.filter((f) => f.chatId === chatId);
        resolve(chatFiles);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error retrieving files from IndexedDB:", error);
    throw error;
  }
};

export const deleteFilesFromIndexedDB = async (chatId) => {
  try {
    // First, get all files for this chat
    const allFiles = await getFilesFromIndexedDB(chatId);

    if (allFiles.length === 0) {
      return; // Nothing to delete
    }

    // Then create a new transaction to delete them
    const idb = await initDB();
    const tx = idb.transaction("files", "readwrite");
    const store = tx.objectStore("files");

    allFiles.forEach((file) => {
      store.delete(file.id);
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("Error deleting files from IndexedDB:", error);
    throw error;
  }
};

// User-specific chat storage helpers
export const getUserChatStorageKey = (userId) => {
  return userId ? `docDynamoChats_${userId}` : "docDynamoChats_guest";
};

export const getUserChats = (userId) => {
  try {
    const key = getUserChatStorageKey(userId);
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    console.error("Error loading user chats:", error);
    return [];
  }
};

export const saveUserChats = (userId, chats) => {
  try {
    const key = getUserChatStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving user chats:", error);
  }
};

export const clearUserChats = async (userId) => {
  try {
    const key = getUserChatStorageKey(userId);
    const chats = JSON.parse(localStorage.getItem(key) || "[]");

    // Delete all files associated with user's chats from IndexedDB
    for (const chat of chats) {
      await deleteFilesFromIndexedDB(chat.id);
    }

    // Clear localStorage
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing user chats:", error);
  }
};

export const generateGuestId = () => {
  return `guest_${crypto.randomUUID()}`;
};

// ==========================================
// CLOUD SYNC FUNCTIONS (Firebase Firestore + Storage)
// ==========================================

// Check if user is a guest (guests don't sync to cloud)
export const isGuestUser = (userId) => {
  return !userId || userId.startsWith("guest_");
};

// Save chat metadata to Firestore (files stay local)
export const saveChatToCloud = async (chatData, userId) => {
  if (isGuestUser(userId)) {
    console.log("Guest user - skipping cloud save");
    return;
  }

  try {
    const chatRef = doc(db, "users", userId, "chats", chatData.id);
    await setDoc(chatRef, {
      ...chatData,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving chat to cloud:", error);
  }
};

// Get all chats from Firestore for a user
export const getChatsFromCloud = async (userId) => {
  if (isGuestUser(userId)) {
    return [];
  }

  try {
    const chatsRef = collection(db, "users", userId, "chats");
    const q = query(chatsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching chats from cloud:", error);
    return [];
  }
};

// Get a single chat from Firestore
export const getChatFromCloud = async (chatId, userId) => {
  if (isGuestUser(userId)) {
    return null;
  }

  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    const snapshot = await getDoc(chatRef);

    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching chat from cloud:", error);
    return null;
  }
};

// Delete chat from cloud (Firestore only - no Storage)
export const deleteChatFromCloud = async (chatId, userId) => {
  if (isGuestUser(userId)) {
    return;
  }

  try {
    // Delete chat document from Firestore
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error("Error deleting chat from cloud:", error);
  }
};

// Sync local chats to cloud (for migration or backup)
export const syncLocalToCloud = async (userId) => {
  if (isGuestUser(userId)) {
    return;
  }

  const localChats = getUserChats(userId);

  for (const chat of localChats) {
    await saveChatToCloud(chat, userId);
  }
};

// Sync cloud chats to local storage
export const syncCloudToLocal = async (userId) => {
  if (isGuestUser(userId)) {
    return;
  }

  try {
    const cloudChats = await getChatsFromCloud(userId);
    if (cloudChats.length > 0) {
      saveUserChats(userId, cloudChats);
    }
    return cloudChats;
  } catch (error) {
    console.error("Error syncing cloud to local:", error);
    return [];
  }
};

// Get files from local IndexedDB (files are NOT synced to cloud)
// Returns empty array with filesNotSynced flag if chat exists in cloud but files are missing locally
export const getFilesWithCloudFallback = async (chatId, userId) => {
  // Try local IndexedDB
  const files = await getFilesFromIndexedDB(chatId);

  if (files && files.length > 0) {
    return files;
  }

  // Files not found locally
  // If user is logged in, check if chat exists in cloud (files need re-upload)
  if (!isGuestUser(userId)) {
    const chat = await getChatFromCloud(chatId, userId);
    if (chat && chat.files && chat.files.length > 0) {
      // Chat exists in cloud but files are not available locally
      // Return empty array - the UI should show a message to re-upload
      console.log(
        "Chat found in cloud but files need to be re-uploaded locally",
      );
      return [];
    }
  }

  return [];
};

// Combined save: saves files locally and metadata to cloud
export const saveChatWithCloudSync = async (
  chatId,
  chatData,
  files,
  userId,
) => {
  // Always save files to local IndexedDB (files don't sync to cloud)
  await saveFilesToIndexedDB(files, chatId);

  const localChats = getUserChats(userId);
  const newChat = {
    id: chatId,
    title: chatData.message?.substring(0, 50) || "New Chat",
    timestamp: new Date().toISOString(),
    role: chatData.role,
    files: files.map((f) => f.name),
    message: chatData.message,
  };
  localChats.unshift(newChat);
  saveUserChats(userId, localChats);

  // If logged in, save chat metadata to Firestore (no file upload)
  if (!isGuestUser(userId)) {
    await saveChatToCloud(newChat, userId);
  }

  return newChat;
};

// Delete chat from both local and cloud
export const deleteChatWithCloudSync = async (chatId, userId) => {
  // Delete from local
  await deleteFilesFromIndexedDB(chatId);
  const localChats = getUserChats(userId);
  const updatedChats = localChats.filter((chat) => chat.id !== chatId);
  saveUserChats(userId, updatedChats);

  // Delete from cloud
  await deleteChatFromCloud(chatId, userId);

  return updatedChats;
};
