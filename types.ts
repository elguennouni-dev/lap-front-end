export interface FileAttachment {
  file_id: number;
  task_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DESIGNER = 'DESIGNER',
  COMMERCIAL = 'COMMERCIAL',
  IMPRIMEUR = 'IMPRIMEUR',
  LOGISTIQUE = 'LOGISTIQUE',
}

export enum OrderStatus {
  NEW_ORDER = 'Nouvelle Commande',
  DESIGN_ASSIGNED = 'Design Assigné',
  DESIGN_IN_PROGRESS = 'Design en Cours',
  DESIGN_PENDING_APPROVAL = 'Design en Attente d\'Approbation',
  DESIGN_APPROVED = 'Design Approuvé',
  PRODUCTION_ASSIGNED = 'Production Assignée',
  PRODUCTION_IN_PROGRESS = 'Production en Cours',
  PRODUCTION_COMPLETE = 'Production Terminée',
  FINAL_PENDING_APPROVAL = 'Approbation Finale en Attente',
  COMPLETED = 'Terminée',
  CANCELED = 'Annulée'
}

export enum TaskStatus {
  PENDING = 'En attente',
  ACCEPTED = 'Acceptée',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Terminée',
  REJECTED = 'Rejetée'
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string | null;
  roles: UserRole[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  customer_id: number;
  customer_type: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  created_by: number;
  assigned_imprimeur_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  product_id: number;
  product_code?: string;
  product_name: string;
  description?: string;
  category?: string;
  unit_price: number;
  tx_tva?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PanneauConfig {
  id?: number | string;
  taille_h: string;
  taille_v: string;
  contenu: string | string[];
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: string;
  panneaux?: PanneauConfig[]; 
  created_at?: string;
}

export interface Task {
  task_id: number;
  order_id: number;
  step_id: number;
  step_name: string;
  assigned_to: number;
  assigned_by: number;
  status: TaskStatus;
  start_date?: string | null;
  end_date?: string | null;
  estimated_hours?: number;
  real_hours?: number | null;
  comments?: string;
  design_files?: FileAttachment[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: number;
  order_number: string;
  customer_id: number;
  status: OrderStatus;
  priority: string;
  order_date: string;
  // delivery_date removed
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  created_by: number;
  assigned_designer_id?: number | null;
  assigned_imprimeur_id?: number | null;
  is_required?: boolean;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  tasks: Task[];

  // Custom Fields
  commercial: string;
  nom_propriete: string;
  zone: string;
  type_panneau: string;
  avec_logo: string;
  support: string;
  nom_a_afficher: string;
  panneaux: PanneauConfig[];
}