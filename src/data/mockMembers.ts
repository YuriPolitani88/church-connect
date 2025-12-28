import { Member } from "@/types/member";

export const mockMembers: Member[] = [
  {
    id: "1",
    fullName: "João Santos",
    email: "joao.santos@email.com",
    phone: "+44 7700 900123",
    postcode: "SW1A 1AA",
    nationality: "Brasileiro",
    birthDate: "1989-12-28",
    type: "member",
    status: "active",
    baptized: true,
    ministry: "Louvor",
    visitCount: 52,
    lastVisit: "2024-12-22",
    createdAt: "2023-01-15",
    customFields: [],
  },
  {
    id: "2",
    fullName: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "+44 7700 900456",
    postcode: "E1 6AN",
    nationality: "Portuguesa",
    birthDate: "1992-12-28",
    type: "leader",
    status: "active",
    baptized: true,
    ministry: "Células",
    visitCount: 48,
    lastVisit: "2024-12-22",
    createdAt: "2023-02-20",
    customFields: [],
  },
  {
    id: "3",
    fullName: "Pedro Costa",
    email: "pedro.costa@email.com",
    phone: "+44 7700 900789",
    postcode: "N1 9GU",
    nationality: "Brasileiro",
    birthDate: "1978-12-28",
    type: "pastor",
    status: "active",
    baptized: true,
    ministry: "Pastoral",
    visitCount: 104,
    lastVisit: "2024-12-22",
    createdAt: "2022-06-10",
    customFields: [],
  },
  {
    id: "4",
    fullName: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "+44 7700 900321",
    postcode: "SE1 9SG",
    nationality: "Brasileira",
    birthDate: "1995-03-15",
    type: "visitor",
    status: "pending",
    baptized: false,
    ministry: "",
    visitCount: 3,
    lastVisit: "2024-12-15",
    createdAt: "2024-11-20",
    customFields: [],
  },
  {
    id: "5",
    fullName: "Carlos Mendes",
    email: "carlos.mendes@email.com",
    phone: "+44 7700 900654",
    postcode: "W1D 3QF",
    nationality: "Angolano",
    birthDate: "1985-07-22",
    type: "volunteer",
    status: "active",
    baptized: true,
    ministry: "Mídia",
    visitCount: 35,
    lastVisit: "2024-12-20",
    createdAt: "2023-08-05",
    customFields: [],
  },
  {
    id: "6",
    fullName: "Beatriz Ferreira",
    email: "beatriz.ferreira@email.com",
    phone: "+44 7700 900987",
    postcode: "EC2A 4NE",
    nationality: "Brasileira",
    birthDate: "1990-11-08",
    type: "member",
    status: "inactive",
    baptized: true,
    ministry: "Kids",
    visitCount: 20,
    lastVisit: "2024-10-10",
    createdAt: "2023-03-12",
    customFields: [],
  },
  {
    id: "7",
    fullName: "Lucas Rodrigues",
    email: "lucas.rodrigues@email.com",
    phone: "+44 7700 900111",
    postcode: "WC2N 5DU",
    nationality: "Brasileiro",
    birthDate: "2000-05-25",
    type: "visitor",
    status: "pending",
    baptized: false,
    ministry: "",
    visitCount: 5,
    lastVisit: "2024-12-21",
    createdAt: "2024-12-01",
    customFields: [],
    notes: "Visitante recorrente - potencial membro",
  },
  {
    id: "8",
    fullName: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "+44 7700 900222",
    postcode: "NW1 4SA",
    nationality: "Brasileira",
    birthDate: "1988-09-30",
    type: "leader",
    status: "active",
    baptized: true,
    ministry: "Mulheres",
    visitCount: 40,
    lastVisit: "2024-12-22",
    createdAt: "2023-04-18",
    customFields: [],
  },
];

// Helper function to check if member has birthday today
export function isBirthdayToday(birthDate: string): boolean {
  const today = new Date();
  const birth = new Date(birthDate);
  return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
}

// Helper function to check if member is inactive (no visit in 30+ days)
export function isInactive(lastVisit: string): boolean {
  const today = new Date();
  const last = new Date(lastVisit);
  const diffTime = Math.abs(today.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 30;
}

// Helper function to check if visitor is recurring (3+ visits)
export function isRecurringVisitor(member: Member): boolean {
  return member.type === "visitor" && member.visitCount >= 3;
}
