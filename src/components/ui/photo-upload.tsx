import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const compressionOptions = {
  maxSizeMB: 0.5, // Max 500KB after compression
  maxWidthOrHeight: 1024, // Max dimension
  useWebWorker: true,
  fileType: "image/webp" as const, // Convert to WebP for better compression
};

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUploaded: (url: string) => void;
  onPhotoRemoved?: () => void;
  folder: "children" | "guardians";
  entityId?: string;
  initials?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const buttonSizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function PhotoUpload({
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  folder,
  entityId,
  initials = "?",
  size = "md",
  className,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentPhotoUrl;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      return;
    }

    setIsUploading(true);
    
    try {
      // Compress image
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      // Create preview from compressed file
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Upload to Supabase Storage
      const fileName = `${folder}/${entityId || Date.now()}-${Date.now()}.webp`;

      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/webp",
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(data.path);

      onPhotoUploaded(urlData.publicUrl);
      toast.success("Foto comprimida e enviada com sucesso!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao enviar foto. Tente novamente.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPreviewUrl(null);
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(sizeClasses[size], "border-2 border-border")}>
        <AvatarImage src={displayUrl || undefined} alt="Foto" />
        <AvatarFallback className="text-lg font-medium bg-muted">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Upload/Camera Button */}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className={cn(
          buttonSizeClasses[size],
          "absolute -bottom-1 -right-1 rounded-full shadow-md",
          isUploading && "pointer-events-none"
        )}
        onClick={triggerFileInput}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : displayUrl ? (
          <Camera className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>

      {/* Remove Button */}
      {displayUrl && !isUploading && onPhotoRemoved && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className={cn(
            buttonSizeClasses[size],
            "absolute -top-1 -right-1 rounded-full shadow-md"
          )}
          onClick={handleRemovePhoto}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
