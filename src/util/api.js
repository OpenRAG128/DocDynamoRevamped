/**
 * API utility for DocDynamo backend communication
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Send initial query with document(s) - creates a new chat session
 * @param {Object} params
 * @param {File|File[]} params.docs - The document file(s) to query
 * @param {string} params.question - The user's question
 * @param {string} params.persona - The chat persona (Student, Researcher, etc.)
 * @returns {Promise<{answer: string, chat_id: string}>}
 */
export async function queryDocument({ docs, question, persona }) {
  const formData = new FormData();
  const fileArray = Array.isArray(docs) ? docs : [docs];
  fileArray.forEach((doc) => {
    formData.append("docs", doc);
  });
  formData.append("question", question);
  formData.append("persona", persona);

  const response = await fetch(`${API_URL}/api/query`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Generate questions from document context
 * @returns {Promise<Object>}
 */
export async function generateQuestions() {
  const response = await fetch(`${API_URL}/generate_questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate concepts from document
 * @returns {Promise<Object>}
 */
export async function generateConcepts() {
  const response = await fetch(`${API_URL}/generate_concepts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Process URLs for document extraction
 * @param {string[]} urls - Array of URLs to process
 * @returns {Promise<Object>}
 */
export async function processUrls(urls) {
  const response = await fetch(`${API_URL}/process_urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Reset/start over the session
 * @returns {Promise<Object>}
 */
export async function resetSession() {
  const response = await fetch(`${API_URL}/start_over`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate markdown from text
 * @param {string} text - Text to convert to markdown
 * @returns {Promise<Object>}
 */
export async function generateMarkdown(text) {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ==========================================
// CHAT API ENDPOINTS
// ==========================================
// Workflow:
// 1. First message with docs: use queryDocument() - creates chat and returns chat_id
// 2. Subsequent messages: use sendChatMessage() with the stored chat_id

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
 * @returns {Promise<Array<{_id: string, title: string, updated_at: number}>>}
 */
export async function getChatList() {
  const response = await fetch(`${API_URL}/api/chat/list`, {
    method: "GET",
    credentials: "include",
  });

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
 * @returns {Promise<{messages: Array<{role: string, content: string, created_at: number}>, total: number, page: number}>}
 */
export async function getChatMessages(chatId, { page = 1, limit = 50 } = {}) {
  const response = await fetch(
    `${API_URL}/api/chat/${chatId}/messages?page=${page}&limit=${limit}`,
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
