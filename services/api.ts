import { MOCK_USERS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS } from '../data/mockData';
import { User, Order, OrderStatus, Customer, Product, Task, TaskStatus, UserRole, FileAttachment } from '../types';

let users: User[] = MOCK_USERS;
let orders: Order[] = MOCK_ORDERS;
let customers: Customer[] = MOCK_CUSTOMERS;
let products: Product[] = MOCK_PRODUCTS;

const simulateNetwork = (delay = 500) => new Promise(res => setTimeout(res, delay));

export const api = {
  login: async (email: string, password: string): Promise<{success: boolean; message: string; user?: User}> => {
    await simulateNetwork();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'Utilisateur non trouvé' };
    }

    if (user.roles.includes(UserRole.ADMIN)) {
      return { 
        success: true, 
        message: 'OTP envoyé', 
        user 
      };
    } else {
      return { 
        success: true, 
        message: 'Connexion réussie', 
        user 
      };
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<{success: boolean; message: string; user?: User}> => {
    await simulateNetwork();
    
    if (otp === '123456') {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        return { 
          success: true, 
          message: 'OTP vérifié avec succès', 
          user 
        };
      }
    }
    
    return { success: false, message: 'OTP invalide' };
  },

  getUsers: async (): Promise<User[]> => {
    await simulateNetwork();
    return [...users];
  },
  
  getUser: async (userId: number): Promise<User | undefined> => {
    await simulateNetwork();
    return users.find(u => u.user_id === userId);
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    await simulateNetwork();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: async (userData: Omit<User, 'user_id'>): Promise<User> => {
    await simulateNetwork();
    const newUser: User = {
      ...userData,
      user_id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    await simulateNetwork();
    const userIndex = users.findIndex(u => u.user_id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updated_at: new Date().toISOString(),
    };
    
    return users[userIndex];
  },

  deleteUser: async (userId: number): Promise<void> => {
    await simulateNetwork();
    const userIndex = users.findIndex(u => u.user_id === userId);
    if (userIndex === -1) throw new Error("User not found");
    users.splice(userIndex, 1);
  },

  getCustomers: async (): Promise<Customer[]> => {
    await simulateNetwork();
    return [...customers];
  },

  getCustomer: async (customerId: number): Promise<Customer | undefined> => {
    await simulateNetwork();
    return customers.find(c => c.customer_id === customerId);
  },

  createCustomer: async (customerData: Omit<Customer, 'customer_id'>): Promise<Customer> => {
    await simulateNetwork();
    const newCustomer: Customer = {
      ...customerData,
      customer_id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customers.push(newCustomer);
    return newCustomer;
  },

  updateCustomer: async (customerId: number, customerData: Partial<Customer>): Promise<Customer> => {
    await simulateNetwork();
    const customerIndex = customers.findIndex(c => c.customer_id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...customerData,
      updated_at: new Date().toISOString(),
    };
    
    return customers[customerIndex];
  },

  deleteCustomer: async (customerId: number): Promise<void> => {
    await simulateNetwork();
    const customerIndex = customers.findIndex(c => c.customer_id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found");
    customers.splice(customerIndex, 1);
  },

  getProducts: async (): Promise<Product[]> => {
    await simulateNetwork();
    return [...products];
  },

  getProduct: async (productId: number): Promise<Product | undefined> => {
    await simulateNetwork();
    return products.find(p => p.product_id === productId);
  },

  createProduct: async (productData: Omit<Product, 'product_id'>): Promise<Product> => {
    await simulateNetwork();
    const newProduct: Product = {
      ...productData,
      product_id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct: async (productId: number, productData: Partial<Product>): Promise<Product> => {
    await simulateNetwork();
    const productIndex = products.findIndex(p => p.product_id === productId);
    if (productIndex === -1) throw new Error("Product not found");
    
    products[productIndex] = {
      ...products[productIndex],
      ...productData,
      updated_at: new Date().toISOString(),
    };
    
    return products[productIndex];
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await simulateNetwork();
    const productIndex = products.findIndex(p => p.product_id === productId);
    if (productIndex === -1) throw new Error("Product not found");
    products.splice(productIndex, 1);
  },

  getOrders: async (): Promise<Order[]> => {
    await simulateNetwork();
    return [...orders].sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  },
  
  getOrder: async (orderId: number): Promise<Order | undefined> => {
    await simulateNetwork();
    return orders.find(o => o.order_id === orderId);
  },
  
  createOrder: async (orderData: Omit<Order, 'order_id' | 'order_number' | 'tasks'>): Promise<Order> => {
    await simulateNetwork();
    const newOrder: Order = {
      ...orderData,
      order_id: Date.now(),
      order_number: `CMD-${Date.now().toString().slice(-6)}`,
      tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    return newOrder;
  },

  updateOrder: async (orderId: number, orderData: Partial<Order>): Promise<Order> => {
    await simulateNetwork();
    const orderIndex = orders.findIndex(o => o.order_id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...orderData,
      updated_at: new Date().toISOString(),
    };
    
    return orders[orderIndex];
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    await simulateNetwork();
    const orderIndex = orders.findIndex(o => o.order_id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    orders.splice(orderIndex, 1);
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<Order> => {
    await simulateNetwork(800);
    const orderIndex = orders.findIndex(o => o.order_id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");
    
    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    return orders[orderIndex];
  },

  assignTask: async (orderId: number, step_name: string, assigned_to: number, assigned_by: number): Promise<Order> => {
    await simulateNetwork();
    const orderIndex = orders.findIndex(o => o.order_id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    const newTask: Task = {
      task_id: Date.now(),
      order_id: orderId,
      step_id: step_name === 'Design' ? 1 : 2,
      step_name,
      assigned_to,
      assigned_by,
      status: TaskStatus.PENDING,
      start_date: null,
      end_date: null,
      estimated_hours: step_name === 'Design' ? 8 : 16,
      real_hours: null,
      comments: '',
      design_files: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    orders[orderIndex].tasks.push(newTask);

    if (step_name === 'Design') orders[orderIndex].status = OrderStatus.DESIGN_ASSIGNED;
    if (step_name === 'Production') orders[orderIndex].status = OrderStatus.PRODUCTION_ASSIGNED;

    return orders[orderIndex];
  },

  updateTaskStatus: async (orderId: number, taskId: number, taskStatus: TaskStatus): Promise<Task> => {
    await simulateNetwork();
    const orderIndex = orders.findIndex(o => o.order_id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    const taskIndex = orders[orderIndex].tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const task = orders[orderIndex].tasks[taskIndex];
    task.status = taskStatus;
    task.updated_at = new Date().toISOString();

    if (taskStatus === TaskStatus.ACCEPTED) {
      task.start_date = new Date().toISOString();
      if (task.step_name === "Design") orders[orderIndex].status = OrderStatus.DESIGN_IN_PROGRESS;
      if (task.step_name === "Production") orders[orderIndex].status = OrderStatus.PRODUCTION_IN_PROGRESS;
    }

    if (taskStatus === TaskStatus.COMPLETED) {
      task.end_date = new Date().toISOString();
      task.real_hours = 6;

      if (task.step_name === "Design") orders[orderIndex].status = OrderStatus.DESIGN_PENDING_APPROVAL;
      if (task.step_name === "Production") orders[orderIndex].status = OrderStatus.PRODUCTION_COMPLETE;
    }

    return task;
  },

  uploadDesignFile: async (taskId: number, file: File, uploadedBy: number): Promise<FileAttachment> => {
    await simulateNetwork(1000);
    
    const attachment: FileAttachment = {
      file_id: Date.now(),
      task_id: taskId,
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      file_type: file.type,
      file_size: file.size,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
    };

    for (const order of orders) {
      const task = order.tasks.find(t => t.task_id === taskId);
      if (task) {
        if (!task.design_files) task.design_files = [];
        task.design_files.push(attachment);
        task.updated_at = new Date().toISOString();
        break;
      }
    }

    return attachment;
  },

  getTaskDesignFiles: async (taskId: number): Promise<FileAttachment[]> => {
    await simulateNetwork();
    for (const order of orders) {
      const task = order.tasks.find(t => t.task_id === taskId);
      if (task) return task.design_files || [];
    }
    return [];
  },

  deleteDesignFile: async (fileId: number): Promise<void> => {
    await simulateNetwork();
    for (const order of orders) {
      for (const task of order.tasks) {
        if (task.design_files) {
          const index = task.design_files.findIndex(f => f.file_id === fileId);
          if (index !== -1) {
            task.design_files.splice(index, 1);
            task.updated_at = new Date().toISOString();
            return;
          }
        }
      }
    }
    throw new Error("File not found");
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    await simulateNetwork();
    return users.filter(u => u.roles.includes(role));
  },

  getOrdersByStatus: async (status: OrderStatus): Promise<Order[]> => {
    await simulateNetwork();
    return orders.filter(o => o.status === status);
  },

  getOrdersByCustomer: async (customerId: number): Promise<Order[]> => {
    await simulateNetwork();
    return orders.filter(o => o.customer_id === customerId);
  },

  getTasksByUser: async (userId: number): Promise<Task[]> => {
    await simulateNetwork();
    const results: Task[] = [];

    orders.forEach(order => {
      order.tasks.forEach(task => {
        if (task.assigned_to === userId) {
          results.push(task);
        }
      });
    });

    return results;
  },

  resendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
    await simulateNetwork();
    return { success: true, message: "OTP renvoyé avec succès" };
  },
};