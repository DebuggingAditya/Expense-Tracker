// src/services/ExpenseService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7202";

/**
 * Parse fetch Response → { ok, status, data, raw, headers }
 */
async function parseResponse(response) {
  const raw = await response.text().catch(() => null);
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  const headers = {};
  try {
    for (const [k, v] of response.headers.entries()) {
      headers[k] = v;
    }
  } catch {
    // ignore header parsing errors
  }

  return { ok: response.ok, status: response.status, data, raw, headers };
}

/**
 * handleResponse → throws on non-ok
 */
async function handleResponse(response) {
  const parsed = await parseResponse(response);
  if (!parsed.ok) {
    const msg =
      (parsed.data && (parsed.data.message || parsed.data.error)) ||
      `Request failed (${parsed.status})`;
    const err = new Error(msg);
    err.status = parsed.status;
    err.data = parsed.data;
    err.raw = parsed.raw;
    err.headers = parsed.headers;
    throw err;
  }
  return parsed.data;
}

export const ExpenseService = {
  // GET /api/expenses
  getExpenses: async (token) => {
    const res = await fetch(`${API_BASE_URL}/api/expenses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return handleResponse(res);
  },

  // GET /api/expenses/{id}
  getExpense: async (id, token) => {
    if (!id) throw new Error("Expense id is required");
    const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return handleResponse(res);
  },

  // POST /api/expenses
  createExpense: async (expenseData, token) => {
    const res = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(res);
  },

  // Debug variant (never throws)
  createExpenseRaw: async (expenseData, token) => {
    const res = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(expenseData),
    });
    return parseResponse(res);
  },

  // PUT /api/expenses/{id}
  updateExpense: async (id, expenseData, token) => {
    if (!id) throw new Error("Expense id is required");
    const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(expenseData),
    });
    return handleResponse(res);
  },

  // DELETE /api/expenses/{id}
  deleteExpense: async (id, token) => {
    if (!id) throw new Error("Expense id is required");
    const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (res.ok) return true;

    const parsed = await parseResponse(res);
    const msg =
      (parsed.data && (parsed.data.message || parsed.data.error)) ||
      `Delete failed (${parsed.status})`;
    const err = new Error(msg);
    err.status = parsed.status;
    err.data = parsed.data;
    err.raw = parsed.raw;
    err.headers = parsed.headers;
    throw err;
  },
};
