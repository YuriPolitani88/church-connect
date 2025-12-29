import { Child, CheckIn, ParentAlert, ClassRoom, Guardian } from "@/types/kids";

export const mockGuardians: Guardian[] = [
  {
    id: "g1",
    memberId: "m1",
    name: "Carlos Silva",
    phone: "+44 7700 900001",
    relationship: "father",
    isAuthorizedPickup: true,
  },
  {
    id: "g2",
    memberId: "m2",
    name: "Ana Silva",
    phone: "+44 7700 900002",
    relationship: "mother",
    isAuthorizedPickup: true,
  },
  {
    id: "g3",
    memberId: "m3",
    name: "João Santos",
    phone: "+44 7700 900003",
    relationship: "father",
    isAuthorizedPickup: true,
  },
  {
    id: "g4",
    memberId: "m4",
    name: "Maria Santos",
    phone: "+44 7700 900004",
    relationship: "mother",
    isAuthorizedPickup: true,
  },
  {
    id: "g5",
    memberId: "m5",
    name: "Pedro Costa",
    phone: "+44 7700 900005",
    relationship: "father",
    isAuthorizedPickup: true,
  },
];

export const mockChildren: Child[] = [
  {
    id: "c1",
    fullName: "Lucas Silva",
    birthDate: "2020-03-15",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    guardians: [mockGuardians[0], mockGuardians[1]],
    allergies: ["Amendoim", "Leite"],
    medications: [],
    dietaryRestrictions: ["Sem lactose"],
    specialNeeds: [],
    emergencyNotes: "Em caso de reação alérgica, ligar imediatamente para os pais.",
    classRoom: "Jardim A",
    ageGroup: "preschool",
    createdAt: "2023-01-15",
    status: "active",
  },
  {
    id: "c2",
    fullName: "Sofia Santos",
    birthDate: "2021-07-22",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    guardians: [mockGuardians[2], mockGuardians[3]],
    allergies: [],
    medications: ["Inalador para asma"],
    dietaryRestrictions: [],
    specialNeeds: ["Asma leve - precisa de inalador em caso de crise"],
    emergencyNotes: "Inalador está na mochila. Em caso de dificuldade respiratória, administrar 2 puffs.",
    classRoom: "Maternal B",
    ageGroup: "toddler",
    createdAt: "2023-03-10",
    status: "active",
  },
  {
    id: "c3",
    fullName: "Miguel Costa",
    birthDate: "2019-11-08",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
    guardians: [mockGuardians[4]],
    allergies: ["Glúten", "Frutos do mar"],
    medications: [],
    dietaryRestrictions: ["Celíaco - sem glúten"],
    specialNeeds: [],
    emergencyNotes: "",
    classRoom: "Infantil A",
    ageGroup: "elementary",
    createdAt: "2023-02-20",
    status: "active",
  },
  {
    id: "c4",
    fullName: "Isabella Oliveira",
    birthDate: "2022-01-30",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella",
    guardians: [mockGuardians[0], mockGuardians[1]],
    allergies: [],
    medications: [],
    dietaryRestrictions: [],
    specialNeeds: [],
    emergencyNotes: "",
    classRoom: "Berçário",
    ageGroup: "nursery",
    createdAt: "2023-06-01",
    status: "active",
  },
  {
    id: "c5",
    fullName: "Gabriel Lima",
    birthDate: "2020-09-12",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
    guardians: [mockGuardians[2]],
    allergies: ["Ovo"],
    medications: [],
    dietaryRestrictions: ["Sem ovo"],
    specialNeeds: [],
    emergencyNotes: "Alergia moderada - evitar contato com ovos.",
    classRoom: "Jardim A",
    ageGroup: "preschool",
    createdAt: "2023-04-15",
    status: "active",
  },
];

export const mockClassRooms: ClassRoom[] = [
  { id: "r1", name: "Berçário", ageGroup: "nursery", capacity: 8, currentCount: 3, teacherIds: ["t1"] },
  { id: "r2", name: "Maternal A", ageGroup: "toddler", capacity: 10, currentCount: 5, teacherIds: ["t2"] },
  { id: "r3", name: "Maternal B", ageGroup: "toddler", capacity: 10, currentCount: 4, teacherIds: ["t2"] },
  { id: "r4", name: "Jardim A", ageGroup: "preschool", capacity: 15, currentCount: 8, teacherIds: ["t3"] },
  { id: "r5", name: "Infantil A", ageGroup: "elementary", capacity: 20, currentCount: 12, teacherIds: ["t4"] },
];

const today = new Date().toISOString().split("T")[0];

export const mockCheckIns: CheckIn[] = [
  {
    id: "ci1",
    childId: "c1",
    guardianId: "g1",
    checkInTime: "09:30",
    classRoom: "Jardim A",
    date: today,
    qrCode: "KIDS-C1-" + today,
    status: "checked_in",
  },
  {
    id: "ci2",
    childId: "c2",
    guardianId: "g3",
    checkInTime: "09:45",
    classRoom: "Maternal B",
    date: today,
    qrCode: "KIDS-C2-" + today,
    status: "checked_in",
  },
  {
    id: "ci3",
    childId: "c3",
    guardianId: "g5",
    checkInTime: "10:00",
    classRoom: "Infantil A",
    date: today,
    qrCode: "KIDS-C3-" + today,
    status: "checked_in",
  },
  {
    id: "ci4",
    childId: "c5",
    guardianId: "g2",
    checkInTime: "09:50",
    classRoom: "Jardim A",
    date: today,
    qrCode: "KIDS-C5-" + today,
    status: "checked_in",
  },
];

export const mockAlerts: ParentAlert[] = [
  {
    id: "a1",
    childId: "c1",
    guardianId: "g1",
    type: "general",
    title: "Atividade concluída",
    message: "Lucas participou ativamente da aula de hoje!",
    sentAt: new Date().toISOString(),
    sentBy: "Professora Maria",
    priority: "low",
  },
];

export const getChildById = (id: string): Child | undefined => {
  return mockChildren.find((c) => c.id === id);
};

export const getCheckedInChildren = (): Child[] => {
  const checkedInIds = mockCheckIns
    .filter((ci) => ci.status === "checked_in" && ci.date === today)
    .map((ci) => ci.childId);
  return mockChildren.filter((c) => checkedInIds.includes(c.id));
};

export const hasAllergies = (child: Child): boolean => {
  return child.allergies.length > 0;
};

export const hasSpecialNeeds = (child: Child): boolean => {
  return child.specialNeeds.length > 0 || child.medications.length > 0;
};

export const getCheckInForChild = (childId: string): CheckIn | undefined => {
  return mockCheckIns.find(
    (ci) => ci.childId === childId && ci.date === today && ci.status === "checked_in"
  );
};
