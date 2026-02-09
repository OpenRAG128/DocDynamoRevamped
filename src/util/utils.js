import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
      const db = event.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id" });
      }
    };
  });
};

export const saveFilesToIndexedDB = async (files, chatId) => {
  try {
    const db = await initDB();
    const tx = db.transaction("files", "readwrite");
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
    const db = await initDB();
    const tx = db.transaction("files", "readonly");
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
    const db = await initDB();
    const tx = db.transaction("files", "readwrite");
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
