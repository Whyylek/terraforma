// User roles
export type UserRole = 'guest' | 'client' | 'worker' | 'admin';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  // Worker specific fields
  salary_hourly_rate?: number;
  client_hourly_rate?: number;
  // Registration
  secret_code?: string;
}

// Service/Item types
export type ServiceType = 'service' | 'product';

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  price: number;
  unit: string;
  image?: string;
  category: string;
}

// Order statuses
export type OrderStatus = 'new' | 'scheduled' | 'in_progress' | 'completed' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  status: OrderStatus;
  description: string;
  address: string;
  created_at: string;
  scheduled_date?: string;
  manager_notes?: string;
  // Financial data
  work_hours?: number;
  hourly_rate?: number;
  transport_km?: number;
  transport_rate?: number;
  materials_cost?: number;
  total_amount?: number;
  // Assigned workers
  assigned_workers?: string[];
}

// Schedule/Shift
export interface Schedule {
  id: string;
  order_id: string;
  worker_id: string;
  worker_name: string;
  date: string;
  start_time: string;
  end_time?: string;
  address: string;
  notes?: string;
  tools_needed?: string[];
  status: 'planned' | 'in_progress' | 'completed';
}

// Work Log (daily report from worker)
export interface WorkLog {
  id: string;
  schedule_id: string;
  worker_id: string;
  order_id: string;
  date: string;
  actual_hours: number;
  km_driven: number;
  notes?: string;
  submitted_at: string;
}

// Portfolio item
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  completed_date: string;
  services: string[];
}

// Calendar event
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'order' | 'schedule';
  status: string;
  client_name?: string;
  address?: string;
}

// Chat message for AI assistant
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Salary calculation for worker
export interface SalaryRecord {
  id: string;
  worker_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  hourly_rate: number;
  total_km: number;
  km_rate: number;
  total_amount: number;
  status: 'calculated' | 'paid';
}
