// Compat layer to replace Supabase with PHP API
// This mimics the Supabase client interface used in the app

// Dynamically determine API URL
// If running on the live hostinger site, use the absolute URL or relative /api
// For local XAMPP, use the subfolder path
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isLocal
  ? 'http://localhost/gold/kind-craft-portal/api'
  : 'https://darkseagreen-ram-733578.hostingersite.com/api';

// Helper to determine token key based on current portal path
const getTokenKey = () => {
  const path = window.location.pathname;
  if (path.includes('/admin')) return "sb-admin-token";
  if (path.includes('/matrimony')) return "sb-matrimony-token";
  if (path.includes('/member') || path.includes('/members')) return "sb-member-token";
  return "sb-member-token"; // Default
};

// Helper to make requests
async function apiRequest(endpoint: string, method: string, body?: any) {
  const key = getTokenKey();
  const token = localStorage.getItem(key);
  const headers: Record<string, string> = {};

  console.log('[API Request]', method, endpoint, 'Using Key:', key, 'Token exists:', !!token);

  // Note: FormData handles its own Content-Type boundary
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API Request] Attaching Authorization header');
  } else {
    console.warn(`[API Request] No token found in localStorage (${key})`);
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    // Check if response is JSON (DELETE might return empty)
    const text = await res.text();
    // basic check if text is html error
    if (text.trim().startsWith('<')) {
      console.error('API Returned HTML instead of JSON:', text);
      return { error: { message: 'Server error: Invalid response format' } };
    }
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API Request Error:', error);
    return { error: { message: 'Network error' } };
  }
}

class SupabaseCompat {
  auth = {
    signInWithPassword: async ({ phone, password }: any) => {
      const res = await apiRequest('/auth/login.php', 'POST', { phone, password });
      if (!res.error && res.data?.session) {
        localStorage.setItem(getTokenKey(), res.data.session.access_token);
        this._notifyAuthListeners('SIGNED_IN', res.data.session);
      }
      return res;
    },
    signUp: async (credentials: any) => {
      // Handle options.data.full_name
      const payload = {
        phone: credentials.phone,
        password: credentials.password,
        options: credentials.options
      };
      const res = await apiRequest('/auth/register.php', 'POST', payload);
      if (!res.error && res.data?.session) {
        localStorage.setItem(getTokenKey(), res.data.session.access_token);
        this._notifyAuthListeners('SIGNED_IN', res.data.session);
      }
      return res;
    },
    signOut: async () => {
      localStorage.removeItem(getTokenKey());
      this._notifyAuthListeners('SIGNED_OUT', null);
      return { error: null };
    },
    getSession: async () => {
      const token = localStorage.getItem(getTokenKey());
      if (!token) return { data: { session: null } };

      // Verify token with /me
      const res = await apiRequest('/auth/me.php', 'GET');
      if (res.error) {
        return { data: { session: null } };
      }

      const session = {
        access_token: token,
        user: res.data
      };
      return { data: { session } };
    },
    onAuthStateChange: (callback: any) => {
      this.authListeners.push(callback);
      // Immediate firing not always needed but consistent with Supabase behavior
      this.auth.getSession().then(({ data }) => {
        callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.authListeners = this.authListeners.filter(cb => cb !== callback);
            }
          }
        }
      };
    },
    getUser: async () => {
      const res = await apiRequest('/auth/me.php', 'GET');
      return { data: { user: res.data }, error: res.error };
    },
    updateUser: async (attributes: any) => {
      const res = await apiRequest('/auth/update.php', 'PUT', attributes);
      return res;
    }
  };

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const formData = new FormData();
        // PHP expects 'file' key
        formData.append('file', file);
        formData.append('filename', path); // Send the intended filename
        const res = await apiRequest('/upload.php', 'POST', formData);

        if (res.error) return { data: null, error: res.error };
        // res.data.publicUrl
        return { data: { path: res.data.publicUrl }, error: null };
      },
      getPublicUrl: (path: string) => {
        const baseUrl = API_URL.replace('/api', '');
        let publicUrl = path;

        if (path.startsWith('http')) {
          return { data: { publicUrl } };
        }

        if (path.startsWith('/public/')) {
          publicUrl = `${baseUrl}${path}`;
        } else if (path.startsWith('/uploads/')) {
          publicUrl = `${baseUrl}/public${path}`;
        } else {
          // Assume it's just a filename
          publicUrl = `${baseUrl}/public/uploads/${path}`;
        }

        return { data: { publicUrl } };
      }
    })
  }

  private authListeners: Function[] = [];

  private _notifyAuthListeners(event: string, session: any) {
    this.authListeners.forEach(cb => cb(event, session));
  }

  from(table: string) {
    // Map table aliases
    let endpointTable = table;
    if (table === 'contact_messages') endpointTable = 'contact_messages'; // I named file contact_messages.php actually
    return new QueryBuilder(endpointTable);
  }
}

class QueryBuilder {
  private table: string;
  private filters: Record<string, any> = {};
  private _updateData: any = null;
  private _delete: boolean = false;
  private _countOption: string | null = null;
  private _headOption: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*', options?: { count?: string, head?: boolean }) {
    if (options?.count) this._countOption = options.count;
    if (options?.head) this._headOption = options.head;
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  neq(column: string, value: any) { return this; } // Ignored for now

  order(column: string, { ascending = true } = {}) { return this; }

  limit(count: number) { return this; }

  maybeSingle() {
    return this.then((res: any) => {
      if (res.data && res.data.length > 0) {
        return { data: res.data[0], error: null };
      }
      return { data: null, error: null };
    });
  }

  single() {
    return this.then((res: any) => {
      if (res.data && res.data.length > 0) {
        return { data: res.data[0], error: null };
      }
      return { data: null, error: { message: 'Row not found' } };
    });
  }

  update(data: any) {
    this._updateData = data;
    return this;
  }

  delete() {
    this._delete = true;
    return this;
  }

  async then(resolve: any, reject?: any) {
    let endpoint = `/${this.table}.php`;
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(this.filters)) {
      params.append(key, String(val));
    }

    let method = 'GET';
    let body = undefined;

    if (this._updateData) {
      method = 'PUT';
      body = this._updateData;
      if (Object.keys(this.filters).length > 0) {
        endpoint += '?' + params.toString();
      }
    } else if (this._delete) {
      method = 'DELETE';
      if (Object.keys(this.filters).length > 0) {
        endpoint += '?' + params.toString();
      }
    } else {
      // GET
      if (Object.keys(this.filters).length > 0) {
        endpoint += '?' + params.toString();
      }
    }

    const res = await apiRequest(endpoint, method, body);

    // Support for count/head options used in dashboard
    if (this._countOption || this._headOption) {
      const dataLen = Array.isArray(res.data) ? res.data.length : 0;
      const countRes = {
        data: this._headOption ? null : res.data,
        count: dataLen,
        error: res.error
      };
      return resolve(countRes);
    }

    return resolve(res);
  }

  async insert(data: any) {
    // Unwrap array if it's a single item (PHP API expects object, Supabase sends array)
    const payload = Array.isArray(data) && data.length === 1 ? data[0] : data;
    const res = await apiRequest(`/${this.table}.php`, 'POST', payload);
    return res;
  }
}

export const supabase = new SupabaseCompat() as any;