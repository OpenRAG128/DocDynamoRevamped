/**
 * API utility for DocDynamo backend communication
 */

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// CHAT API ENDPOINTS
// ==========================================

/**
 * Send a message to an existing chat
 * @param {Object} params
 * @param {string} params.chatId - The chat ID
 * @param {string} params.question - The user's question
 * @param {string} [params.persona] - The chat persona
 * @returns {Promise<{response: string, additional_info: string, recommendations: string[], chat_id: string}>}
 */
export async function sendChatMessage({ chatId, question, persona }) {
  const response = await fetch(`${API_URL}/api/chat/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      question,
      persona,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get list of all chats for the current user
 * @param {Object} [options]
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Number of chats per page
 * @returns {Promise<{chats: Array<{_id: string, user_id: string, title: string, created_at: number, updated_at: number}>, page: number, total: number, has_more: boolean, total_pages: number}>}
 */
export async function getChatList({ page = 1, limit = 20 } = {}) {
  const response = await fetch(
    `${API_URL}/api/chat/list?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get messages for a specific chat
 * @param {string} chatId - The chat ID
 * @param {Object} [options]
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=50] - Messages per page
 * @param {string} [options.order='asc'] - Sort order
 * @returns {Promise<{messages: Array<{_id: string, chat_id: string, role: string, content: string, created_at: number}>, chat: Object, page: number, total: number, has_more: boolean, total_pages: number, order: string}>}
 */
export async function getChatMessages(
  chatId,
  { page = 1, limit = 50, order = "asc" } = {},
) {
  const response = await fetch(
    `${API_URL}/api/chat/${chatId}/messages?page=${page}&limit=${limit}&order=${order}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Initialize a new chat conversation
 * @returns {Promise<{chat_id: string, title: string}>}
 */
export async function createChat() {
  const response = await fetch(`${API_URL}/api/chat/create`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Rename an existing chat
 * @param {string} chatId - The chat ID
 * @param {string} title - The new title for the chat
 * @returns {Promise<{success: boolean, message: string, title: string, updated_at: number}>}
 */
export async function renameChat(chatId, title) {
  const response = await fetch(`${API_URL}/api/chat/${chatId}/title`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Permanently delete a chat and all its messages
 * @param {string} chatId - The chat ID
 * @returns {Promise<{success: boolean, message: string, deleted_messages: number}>}
 */
export async function deleteChat(chatId) {
  const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
