import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { parseGuardiansCsv, GuardianImportRow } from "@/lib/parseCsv";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
} from "lucide-react";

interface ImportGuardiansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStatus = "idle" | "parsing" | "preview" | "importing" | "complete" | "error";

export function ImportGuardiansDialog({
  open,
  onOpenChange,
}: ImportGuardiansDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [parsedData, setParsedData] = useState<GuardianImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  }>({ success: 0, failed: 0, errors: [] });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("parsing");
    setParsedData([]);
    setParseErrors([]);

    try {
      const content = await file.text();
      const result = parseGuardiansCsv(content);

      setParsedData(result.data);
      setParseErrors(result.errors);

      if (result.data.length > 0) {
        setStatus("preview");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setParseErrors(["Erro ao ler o arquivo. Verifique se é um arquivo CSV válido."]);
      setStatus("error");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    setStatus("importing");
    setImportProgress(0);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < parsedData.length; i++) {
      const guardian = parsedData[i];

      try {
        const { error } = await supabase.from("guardians").insert({
          full_name: guardian.full_name,
          phone: guardian.phone,
          email: guardian.email || null,
          relationship: guardian.relationship || "parent",
          is_authorized_pickup: guardian.is_authorized_pickup ?? true,
        });

        if (error) {
          results.failed++;
          results.errors.push(`${guardian.full_name}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${guardian.full_name}: Erro desconhecido`);
      }

      setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setImportResults(results);
    setStatus("complete");
    queryClient.invalidateQueries({ queryKey: ["guardians"] });

    if (results.success > 0) {
      toast.success(`${results.success} responsável(is) importado(s) com sucesso!`);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["Nome Completo", "Telefone", "E-mail", "Parentesco", "Autorizado para Busca"];
    const exampleRow = ["Maria Silva", "(11) 99999-9999", "maria@email.com", "Mãe", "Sim"];
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo_responsaveis.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStatus("idle");
    setParsedData([]);
    setParseErrors([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, errors: [] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Responsáveis</DialogTitle>
          <DialogDescription>
            Importe responsáveis em lote a partir de um arquivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Idle state - File selection */}
          {status === "idle" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Arraste um arquivo CSV ou clique para selecionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-import"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-sm">Formato esperado do CSV:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Nome Completo</strong> (obrigatório)</li>
                  <li>• <strong>Telefone</strong> (obrigatório)</li>
                  <li>• E-mail (opcional)</li>
                  <li>• Parentesco: Pai, Mãe, Responsável, Avô/Avó, Outro (opcional)</li>
                  <li>• Autorizado para Busca: Sim/Não (opcional, padrão: Sim)</li>
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="px-0"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar modelo de CSV
                </Button>
              </div>
            </div>
          )}

          {/* Parsing state */}
          {status === "parsing" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Processando arquivo...</p>
            </div>
          )}

          {/* Preview state */}
          {status === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {parsedData.length} válidos
                </Badge>
                {parseErrors.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="h-3 w-3 text-destructive" />
                    {parseErrors.length} erros
                  </Badge>
                )}
              </div>

              {parseErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ScrollArea className="max-h-24">
                      <ul className="text-sm space-y-1">
                        {parseErrors.slice(0, 10).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {parseErrors.length > 10 && (
                          <li>...e mais {parseErrors.length - 10} erros</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border">
                <div className="bg-muted px-4 py-2 text-sm font-medium border-b">
                  Pré-visualização ({parsedData.length} registros)
                </div>
                <ScrollArea className="max-h-48">
                  <div className="divide-y">
                    {parsedData.slice(0, 10).map((guardian, i) => (
                      <div key={i} className="px-4 py-2 text-sm flex justify-between items-center">
                        <div>
                          <span className="font-medium">{guardian.full_name}</span>
                          <span className="text-muted-foreground ml-2">
                            {guardian.phone}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {guardian.relationship || "parent"}
                        </Badge>
                      </div>
                    ))}
                    {parsedData.length > 10 && (
                      <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                        ...e mais {parsedData.length - 10} registros
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Importing state */}
          {status === "importing" && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-4 text-sm font-medium">Importando responsáveis...</p>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {importProgress}% concluído
              </p>
            </div>
          )}

          {/* Complete state */}
          {status === "complete" && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">Importação Concluída!</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {importResults.success}
                  </div>
                  <div className="text-sm text-muted-foreground">Importados</div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {importResults.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Falhas</div>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ScrollArea className="max-h-24">
                      <ul className="text-sm space-y-1">
                        {importResults.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">
                  Não foi possível processar o arquivo
                </p>
                <ScrollArea className="max-h-24">
                  <ul className="text-sm space-y-1">
                    {parseErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {status === "idle" && (
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          )}

          {status === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStatus("idle")}>
                Voltar
              </Button>
              <Button onClick={handleImport}>
                Importar {parsedData.length} responsável(is)
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStatus("idle")}>Tentar Novamente</Button>
            </>
          )}

          {status === "complete" && (
            <Button onClick={handleClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
