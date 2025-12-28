export enum UserRole {
  ADMINISTRATEUR = 'ADMINISTRATEUR',
  COMMERCIAL = 'COMMERCIAL',
  DESIGNER = 'DESIGNER',
  IMPRIMEUR = 'IMPRIMEUR',
  LOGISTIQUE = 'LOGISTIQUE'
}

export enum OrderStatus {
  CREEE = 'CREEE',
  EN_DESIGN = 'EN_DESIGN',
  EN_IMPRESSION = 'EN_IMPRESSION',
  IMPRESSION_VALIDE = 'IMPRESSION_VALIDE',
  EN_LIVRAISON = 'EN_LIVRAISON',
  LIVRAISON_VALIDE = 'LIVRAISON_VALIDE',
  TERMINEE_STOCK = 'TERMINEE_STOCK'
}

export enum TaskType {
  DESIGN = 'DESIGN',
  IMPRESSION = 'IMPRESSION',
  LIVRAISON = 'LIVRAISON'
}

export enum TaskStatus {
  ASSIGNEE = 'ASSIGNEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  VALIDEE = 'VALIDEE',
  REJETEE = 'REJETEE'
}

export enum TypeTravaux {
  PANNEAU = 'PANNEAU',
  ONEWAY = 'ONEWAY'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface Zone {
  id: number;
  nom: string;
}

export interface Task {
  id: number;
  type: TaskType;
  status: TaskStatus;
  assignee?: User; // Can be null if not assigned
  uploadFile?: string;
  // We add 'order' here optionally for Frontend convenience when flattening lists
  order?: Order; 
}

export interface PanneauDetails {
  id: number;
  hauteurCm: number;
  largeurCm: number;
  logoNomRequis: boolean;
  logoFile?: string;
  nomSaisi: string;
  autresDetails: string;
}

export interface OnewayDetails {
  id: number;
  manuscriptText: string;
  photoFacadeFile?: string;
  logoNomRequis: boolean;
  logoFile?: string;
  nomSaisi: string;
  autreDetails: string;
}

export interface Order {
  id: number;
  nomPropriete: string;
  etat: OrderStatus;
  typeTravaux: TypeTravaux;
  zone: Zone;
  createdDate: string; // Matches 'createdDate' in Java DTO
  panneauDetails?: PanneauDetails;
  onewayDetails?: OnewayDetails;
  tasks: Task[]; // Matches 'private List<TaskDto> tasks' in Java
}

export interface DashboardStats {
    newOrders: number;
    inProgress: number;
    completed: number;
    breakdown: Record<string, number>;
}