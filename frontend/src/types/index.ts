export type RequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface EquipmentCatalog {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
}

export interface RequestItem {
  id?: string;
  equipmentType: string;
  specification?: string;
  quantity: number;
}

export interface EquipmentRequest {
  id: string;
  requestNumber?: string;
  requesterId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  title: string;
  purpose: string;
  additionalNote: string | null;
  requiredDate: string;
  status: RequestStatus;
  approverId: string | null;
  rejectReason: string | null;
  items: RequestItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}
