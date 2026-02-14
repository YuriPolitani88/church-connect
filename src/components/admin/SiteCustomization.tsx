import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Image, Palette, Type, Plus } from "lucide-react";
import { useSiteSettings, SiteSetting } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import browserImageCompression from "browser-image-compression";

function ImageSettingCard({
  setting,
  onUpdate,
  onRemove,
  uploading,
}: {
  setting: SiteSetting;
  onUpdate: (key: string, file: File) => void;
  onRemove: (key: string) => void;
  uploading: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Label className="text-sm font-medium">{setting.label}</Label>
        {setting.setting_value ? (
          <div className="relative group">
            <img
              src={setting.setting_value}
              alt={setting.label}
              className="w-full h-40 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={uploading === setting.setting_key}
              >
                {uploading === setting.setting_key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Trocar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onRemove(setting.setting_key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            disabled={uploading === setting.setting_key}
          >
            {uploading === setting.setting_key ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Image className="h-8 w-8" />
                <span className="text-sm">Clique para enviar</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpdate(setting.setting_key, file);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}

function TextSettingCard({
  setting,
  onSave,
  saving,
}: {
  setting: SiteSetting;
  onSave: (key: string, value: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(setting.setting_value || "");

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Label className="text-sm font-medium">{setting.label}</Label>
        <div className="flex gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={setting.label} />
          <Button
            size="sm"
            onClick={() => onSave(setting.setting_key, value)}
            disabled={saving || value === (setting.setting_value || "")}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorSettingCard({
  setting,
  onSave,
  saving,
}: {
  setting: SiteSetting;
  onSave: (key: string, value: string) => void;
  saving: boolean;
}) {
  const [value, setValue] = useState(setting.setting_value || "#000000");

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <Label className="text-sm font-medium">{setting.label}</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 w-14 rounded border cursor-pointer"
          />
          <Input value={value} onChange={(e) => setValue(e.target.value)} className="w-32 font-mono text-sm" />
          <Button
            size="sm"
            onClick={() => onSave(setting.setting_key, value)}
            disabled={saving || value === (setting.setting_value || "#000000")}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteCustomization() {
  const { settings, isLoading, updateSetting, createSetting, deleteSetting } = useSiteSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: "", label: "", type: "image", category: "gallery" });

  const handleImageUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const compressed = await browserImageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const ext = "webp";
      const path = `${key}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("site-assets").upload(path, compressed, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("site-assets").getPublicUrl(path);
      await updateSetting.mutateAsync({ key, value: urlData.publicUrl });
      toast({ title: "Imagem atualizada", description: "A imagem foi salva com sucesso." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao enviar imagem.", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (key: string) => {
    try {
      await updateSetting.mutateAsync({ key, value: null });
      toast({ title: "Imagem removida" });
    } catch {
      toast({ title: "Erro", description: "Falha ao remover imagem.", variant: "destructive" });
    }
  };

  const handleSaveText = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      await updateSetting.mutateAsync({ key, value: value || null });
      toast({ title: "Configuração salva" });
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.key.trim() || !newSetting.label.trim()) return;
    try {
      await createSetting.mutateAsync({
        setting_key: newSetting.key,
        setting_type: newSetting.type,
        label: newSetting.label,
        category: newSetting.category,
      });
      setNewSetting({ key: "", label: "", type: "image", category: "gallery" });
      setShowNewForm(false);
      toast({ title: "Campo adicionado" });
    } catch {
      toast({ title: "Erro", description: "Falha ao criar campo.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const imageSettings = settings.filter((s) => s.setting_type === "image");
  const colorSettings = settings.filter((s) => s.setting_type === "color");
  const textSettings = settings.filter((s) => s.setting_type === "text");

  return (
    <div className="space-y-6">
      {/* Images / Branding */}
      {imageSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imagens e Branding
            </CardTitle>
            <CardDescription>Logo, banners e imagens do culto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {imageSettings.map((s) => (
                <ImageSettingCard key={s.id} setting={s} onUpdate={handleImageUpload} onRemove={handleRemoveImage} uploading={uploading} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Colors */}
      {colorSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cores
            </CardTitle>
            <CardDescription>Personalize as cores da identidade visual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {colorSettings.map((s) => (
                <ColorSettingCard key={s.id} setting={s} onSave={handleSaveText} saving={savingKey === s.setting_key} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text */}
      {textSettings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Textos
            </CardTitle>
            <CardDescription>Nome e informações exibidas no aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {textSettings.map((s) => (
                <TextSettingCard key={s.id} setting={s} onSave={handleSaveText} saving={savingKey === s.setting_key} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new setting */}
      <Card>
        <CardContent className="pt-4">
          {showNewForm ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Chave (único)</Label>
                  <Input
                    placeholder="ex: worship_image_1"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value.replace(/\s/g, "_").toLowerCase() })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Nome exibido</Label>
                  <Input
                    placeholder="ex: Imagem do Culto 1"
                    value={newSetting.label}
                    onChange={(e) => setNewSetting({ ...newSetting, label: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={newSetting.type}
                    onChange={(e) => setNewSetting({ ...newSetting, type: e.target.value })}
                  >
                    <option value="image">Imagem</option>
                    <option value="text">Texto</option>
                    <option value="color">Cor</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={newSetting.category}
                    onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
                  >
                    <option value="branding">Branding</option>
                    <option value="gallery">Galeria</option>
                    <option value="colors">Cores</option>
                    <option value="general">Geral</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddSetting} disabled={!newSetting.key.trim() || !newSetting.label.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar novo campo personalizável
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
