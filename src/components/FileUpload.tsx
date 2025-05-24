import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUpload: (url: string, fileName: string, fileSize: number, type: 'image' | 'file') => void;
  onClose: () => void;
}

export function FileUpload({ onUpload, onClose }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      // Ensure the path includes a folder (recommended by Supabase docs)
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          upsert: false // Prevent overwrite, can be set to true if you want to allow
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      const publicUrl = data?.publicUrl || '';
      const isImage = file.type.startsWith('image/');
      onUpload(publicUrl, file.name, file.size, isImage ? 'image' : 'file');

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload File</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Choose an image or file to upload
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </div>
            {uploading && (
              <p className="text-sm text-center text-gray-600">
                Uploading...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
