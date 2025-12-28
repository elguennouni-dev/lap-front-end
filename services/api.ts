import { 
  User, 
  Order, 
  Task, 
  UserRole, 
  TaskType, 
  OrderStatus,
  Zone,
  DashboardStats
} from '../types';

const API_URL = 'http://13.62.231.162:2099/';

const handleResponse = async (response: Response) => {
  const url = response.url;
  const status = response.status;
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { error: text };
  }

  console.groupCollapsed(`[API] ${response.status} - ${url}`);
  console.log('Statut:', status);
  console.log('Données:', data);
  console.groupEnd();

  if (!response.ok) {
    throw new Error(data.message || data.error || `Erreur HTTP! Statut: ${status}`);
  }
  return data;
};

export const api = {

  login: async (email: string, password: string): Promise<{success: boolean; message: string; user?: User; otpRequired?: boolean}> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usernameOrEmail: email, password: password }),
      });
      const data = await handleResponse(res);

      if (data.otpRequired) return { success: true, message: data.message, otpRequired: true };
      if (data.loggedIn && data.userDto) {
        return { success: true, message: 'Connexion réussie', user: data.userDto };
      }
      return { success: false, message: data.message || 'Échec de la connexion' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<{success: boolean; message: string; user?: User}> => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('otp', otp);
      const res = await fetch(`${API_URL}/auth/verify-otp?${params.toString()}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await handleResponse(res);
      if (data.loggedIn && data.userDto) {
        return { success: true, message: 'OTP vérifié', user: data.userDto };
      }
      return { success: false, message: data.message || 'OTP Invalide' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  resendOtp: async (email: string) => ({ success: true, message: "Code renvoyé" }),

  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/user`, { credentials: 'include' });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  getZones: async (): Promise<Zone[]> => {
    const res = await fetch(`${API_URL}/zone`, { credentials: 'include' });
    const data = await handleResponse(res);
    return Array.isArray(data) ? data : [];
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/commande`, { credentials: 'include' });
      const data = await handleResponse(res);
      if (Array.isArray(data)) {
          return data.filter((item: any) => item !== null && item !== undefined).map((order: any) => ({
              ...order,
              tasks: Array.isArray(order.tasks) ? order.tasks : [] 
          }));
      }
      return [];
    } catch (e) {
      console.error("[Erreur API] getOrders:", e);
      return [];
    }
  },

  getOrder: async (orderId: number): Promise<Order | undefined> => {
    const res = await fetch(`${API_URL}/commande/${orderId}`, { credentials: 'include' });
    const data = await handleResponse(res);
    if (data) {
        data.tasks = Array.isArray(data.tasks) ? data.tasks : [];
    }
    return data;
  },

  createOrder: async (orderData: any, logoFile?: File, facadeFile?: File): Promise<Order> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(orderData)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    if (logoFile) formData.append('logo', logoFile);
    if (facadeFile) formData.append('photoFacade', facadeFile);

    const res = await fetch(`${API_URL}/commande`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return await handleResponse(res);
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    await fetch(`${API_URL}/commande/${orderId}`, { method: 'DELETE', credentials: 'include' });
  },

  assignTask: async (orderId: number, assigneeId: number, taskType: TaskType): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/workflow/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ commandeId: orderId, assigneeId: assigneeId, taskType: taskType }),
    }));
  },

  completeTask: async (taskId: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await handleResponse(await fetch(`${API_URL}/workflow/task/${taskId}/complete`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    }));
  },

completeTaskSimple: async (taskId: number): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/workflow/task/${taskId}/complete-simple`, {
        method: 'PUT',
        credentials: 'include'
    }));
},

  validateTask: async (taskId: number, approved: boolean): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/workflow/task/${taskId}/validate?approved=${approved}`, {
      method: 'PUT',
      credentials: 'include'
    }));
  },

  moveOrderToStock: async (orderId: number): Promise<void> => {
    await handleResponse(await fetch(`${API_URL}/workflow/commande/${orderId}/move-to-stock`, {
        method: 'PUT',
        credentials: 'include'
    }));
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch(`${API_URL}/statistics/dashboard`, { credentials: 'include' });
      return await handleResponse(res);
    } catch (e) { return { newOrders: 0, inProgress: 0, completed: 0, breakdown: {} }; }
  },

  getTasksByUser: async (userId: number): Promise<Task[]> => {
    try {
      const orders = await api.getOrders();
      const userTasks: Task[] = [];
      
      orders.forEach(order => {
        if (order.tasks && Array.isArray(order.tasks)) {
          order.tasks.forEach(task => {
            if (task.assignee && task.assignee.id === userId) {
              userTasks.push({ ...task, order: order });
            }
          });
        }
      });
      
      return userTasks;
    } catch (e) {
      console.error("Erreur lors de l'extraction des tâches:", e);
      return [];
    }
  },

  createZone: async (nom: string): Promise<void> => {
    const res = await fetch(`${API_URL}/zone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nom: nom }),
    });
    await handleResponse(res);
  },

  deleteZone: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/zone/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await handleResponse(res);
  },
};