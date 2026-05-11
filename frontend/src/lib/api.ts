// ── Chlorobiota API client ────────────────────────────────────────────────────
// All calls go to the FastAPI backend running on VITE_API_URL.
// Set this in your project root .env file:
//   VITE_API_URL=http://localhost:8000

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.2:800';

// ── /chat/start ───────────────────────────────────────────────────────────────
// Upload an image and receive a session ID.
// The session ID is used for all follow-up messages.
export async function apiStartSession(file: File): Promise<string> {
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${BASE_URL}/chat/start`, {
    method: 'POST',
    body: form,
    // Do NOT set Content-Type — the browser sets multipart boundary automatically
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.session_id as string;
}

// ── /chat/message ─────────────────────────────────────────────────────────────
// Send a text question about the uploaded image.
// The backend keeps the full conversation history server-side.
export async function apiSendMessage(sessionId: string, question: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.answer as string;
}

// ── /chat/clear ───────────────────────────────────────────────────────────────
// Delete the session and free server memory.
// Call this when the user uploads a new image or leaves the page.
export async function apiClearSession(sessionId: string): Promise<void> {
  await fetch(`${BASE_URL}/chat/clear/${sessionId}`, { method: 'DELETE' });
  // Silently ignore errors — session may have already expired
}