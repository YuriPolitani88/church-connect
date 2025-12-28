export type MemberType = "visitor" | "member" | "volunteer" | "leader" | "pastor";

export type MemberStatus = "active" | "inactive" | "pending";

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "dropdown" | "checkbox";
  value: string | number | boolean | null;
  required: boolean;
  options?: string[]; // For dropdown type
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  nationality: string;
  birthDate: string;
  type: MemberType;
  status: MemberStatus;
  baptized: boolean;
  ministry: string;
  photoUrl?: string;
  customFields: CustomField[];
  visitCount: number;
  lastVisit: string;
  createdAt: string;
  notes?: string;
}

export const memberTypeLabels: Record<MemberType, string> = {
  visitor: "Visitante",
  member: "Membro",
  volunteer: "Voluntário",
  leader: "Líder",
  pastor: "Pastor",
};

export const memberTypeColors: Record<MemberType, string> = {
  visitor: "bg-warning/10 text-warning border-warning/30",
  member: "bg-primary/10 text-primary border-primary/30",
  volunteer: "bg-accent/10 text-accent border-accent/30",
  leader: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  pastor: "bg-success/10 text-success border-success/30",
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  pending: "Pendente",
};

export const memberStatusColors: Record<MemberStatus, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
};
