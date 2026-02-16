/**
 * API utility for DocDynamo backend communication
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Send a query to the backend with document(s) and get AI response
 * @param {Object} params
 * @param {File|Blob} params.doc - The document file to query
 * @param {string} params.question - The user's question
 * @param {string} params.persona - The chat persona (Student, Researcher, etc.)
 * @returns {Promise<{answer: string}>}
 */
export async function queryDocument({ doc, question, persona }) {
  const formData = new FormData();
  formData.append("docs", doc);
  formData.append("question", question);
  formData.append("persona", persona);

  const response = await fetch(`${API_URL}/api/query`, {
    method: "POST",
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
// NEW CHAT API ENDPOINTS
// ==========================================

/**
 * Create a new chat session
 * @returns {Promise<{chat_id: string}>}
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
 * Send a message to a chat
 * @param {Object} params
 * @param {string} params.chatId - The chat ID
 * @param {string} params.question - The user's question
 * @param {string} [params.persona] - The chat persona
 * @param {File[]} [params.docs] - Optional document files to upload
 * @returns {Promise<{response: string, additional_info: string, recommendations: string[], chat_id: string}>}
 */
export async function sendChatMessage({
  chatId,
  question,
  persona,
  docs = [],
}) {
  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("question", question);
  if (persona) {
    formData.append("persona", persona);
  }
  docs.forEach((doc) => {
    formData.append("docs[]", doc);
  });

  const response = await fetch(`${API_URL}/api/chat/message`, {
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
