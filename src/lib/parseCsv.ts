export interface CsvParseResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
}

export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (line.trim() === "") continue;

    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === "," || char === ";") {
          row.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export interface GuardianImportRow {
  full_name: string;
  phone: string;
  email?: string;
  relationship?: string;
  is_authorized_pickup?: boolean;
}

const relationshipMap: Record<string, string> = {
  pai: "father",
  mãe: "mother",
  mae: "mother",
  responsável: "parent",
  responsavel: "parent",
  "responsável legal": "guardian",
  "responsavel legal": "guardian",
  "avô": "grandparent",
  "avó": "grandparent",
  avo: "grandparent",
  "avô/avó": "grandparent",
  outro: "other",
  // English mappings
  father: "father",
  mother: "mother",
  parent: "parent",
  guardian: "guardian",
  grandparent: "grandparent",
  other: "other",
};

function normalizeRelationship(value: string): string {
  const normalized = relationshipMap[value.toLowerCase()];
  return normalized || "parent";
}

function normalizeBoolean(value: string): boolean {
  const trueValues = ["sim", "yes", "true", "1", "s", "y"];
  return trueValues.includes(value.toLowerCase());
}

export function parseGuardiansCsv(content: string): CsvParseResult<GuardianImportRow> {
  const rows = parseCsv(content);
  const errors: string[] = [];
  const data: GuardianImportRow[] = [];

  if (rows.length === 0) {
    return { data: [], errors: ["Arquivo vazio"], totalRows: 0 };
  }

  // First row is headers
  const headers = rows[0].map((h) => h.toLowerCase().trim());
  
  // Find column indexes
  const nameIndex = headers.findIndex((h) => 
    h.includes("nome") || h === "name" || h === "full_name"
  );
  const phoneIndex = headers.findIndex((h) => 
    h.includes("telefone") || h.includes("phone") || h.includes("celular") || h.includes("fone")
  );
  const emailIndex = headers.findIndex((h) => 
    h.includes("email") || h.includes("e-mail")
  );
  const relationshipIndex = headers.findIndex((h) => 
    h.includes("parentesco") || h.includes("relationship") || h.includes("relação") || h.includes("relacao")
  );
  const authorizedIndex = headers.findIndex((h) => 
    h.includes("autorizado") || h.includes("authorized") || h.includes("busca") || h.includes("pickup")
  );

  if (nameIndex === -1) {
    errors.push("Coluna 'Nome' não encontrada no cabeçalho");
  }
  if (phoneIndex === -1) {
    errors.push("Coluna 'Telefone' não encontrada no cabeçalho");
  }

  if (errors.length > 0) {
    return { data: [], errors, totalRows: rows.length - 1 };
  }

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const fullName = row[nameIndex]?.trim() || "";
    const phone = row[phoneIndex]?.trim() || "";

    // Validate required fields
    if (!fullName) {
      errors.push(`Linha ${rowNum}: Nome é obrigatório`);
      continue;
    }
    if (!phone) {
      errors.push(`Linha ${rowNum}: Telefone é obrigatório`);
      continue;
    }

    // Validate phone format (basic validation)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 8) {
      errors.push(`Linha ${rowNum}: Telefone inválido - "${phone}"`);
      continue;
    }

    // Validate email if present
    const email = emailIndex !== -1 ? row[emailIndex]?.trim() : undefined;
    if (email && !email.includes("@")) {
      errors.push(`Linha ${rowNum}: E-mail inválido - "${email}"`);
      continue;
    }

    // Parse optional fields
    const relationshipRaw = relationshipIndex !== -1 ? row[relationshipIndex]?.trim() : "";
    const relationship = relationshipRaw ? normalizeRelationship(relationshipRaw) : "parent";

    const authorizedRaw = authorizedIndex !== -1 ? row[authorizedIndex]?.trim() : "";
    const isAuthorizedPickup = authorizedRaw ? normalizeBoolean(authorizedRaw) : true;

    data.push({
      full_name: fullName,
      phone: phone,
      email: email || undefined,
      relationship,
      is_authorized_pickup: isAuthorizedPickup,
    });
  }

  return { data, errors, totalRows: rows.length - 1 };
}
