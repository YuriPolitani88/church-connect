export interface Guardian {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  relationship: "father" | "mother" | "guardian" | "grandparent" | "other";
  isAuthorizedPickup: boolean;
}

export interface Child {
  id: string;
  fullName: string;
  birthDate: string;
  photoUrl?: string;
  guardians: Guardian[];
  
  // Health & Safety (critical fields)
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
  specialNeeds: string[];
  emergencyNotes: string;
  
  // Church info
  classRoom: string;
  ageGroup: "nursery" | "toddler" | "preschool" | "elementary";
  
  createdAt: string;
  status: "active" | "inactive";
}

export interface CheckIn {
  id: string;
  childId: string;
  guardianId: string;
  checkInTime: string;
  checkOutTime?: string;
  checkOutGuardianId?: string;
  classRoom: string;
  date: string;
  qrCode: string;
  status: "checked_in" | "checked_out";
  notes?: string;
}

export interface ParentAlert {
  id: string;
  childId: string;
  guardianId: string;
  type: "pickup_request" | "health_issue" | "urgent" | "general";
  title: string;
  message: string;
  sentAt: string;
  readAt?: string;
  sentBy: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface ClassRoom {
  id: string;
  name: string;
  ageGroup: Child["ageGroup"];
  capacity: number;
  currentCount: number;
  teacherIds: string[];
}

export const ageGroupLabels: Record<Child["ageGroup"], string> = {
  nursery: "Berçário (0-1 ano)",
  toddler: "Maternal (1-2 anos)",
  preschool: "Jardim (3-5 anos)",
  elementary: "Infantil (6-10 anos)",
};

export const relationshipLabels: Record<Guardian["relationship"], string> = {
  father: "Pai",
  mother: "Mãe",
  guardian: "Responsável Legal",
  grandparent: "Avô/Avó",
  other: "Outro",
};

export const alertTypeLabels: Record<ParentAlert["type"], string> = {
  pickup_request: "Pedido de Busca",
  health_issue: "Problema de Saúde",
  urgent: "Urgente",
  general: "Geral",
};

export const alertPriorityColors: Record<ParentAlert["priority"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/10 text-warning",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-destructive/10 text-destructive",
};
