'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink } from 'lucide-react';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileKey: string;
  fileName: string;
  fileUrl: string;
}

export default function FilePreview({ isOpen, onClose, fileKey, fileName, fileUrl }: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (filename: string) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    return imageExts.includes(getFileExtension(filename));
  };

  const isText = (filename: string) => {
    const textExts = ['txt', 'md', 'json', 'xml', 'csv', 'js', 'ts', 'html', 'css', 'py', 'java'];
    return textExts.includes(getFileExtension(filename));
  };

  const isPdf = (filename: string) => {
    return getFileExtension(filename) === 'pdf';
  };

  const isVideo = (filename: string) => {
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    return videoExts.includes(getFileExtension(filename));
  };

  const isAudio = (filename: string) => {
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    return audioExts.includes(getFileExtension(filename));
  };

  const renderPreview = () => {
    if (isImage(fileName)) {
      return (
        <div className="flex justify-center">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="max-w-full max-h-96 object-contain"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      );
    }

    if (isPdf(fileName)) {
      return (
        <div className="w-full h-96">
          <iframe 
            src={fileUrl}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }

    if (isVideo(fileName)) {
      return (
        <div className="flex justify-center">
          <video 
            controls 
            className="max-w-full max-h-96"
            onLoadedData={() => setLoading(false)}
          >
            <source src={fileUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio(fileName)) {
      return (
        <div className="flex justify-center p-8">
          <audio 
            controls 
            className="w-full max-w-md"
            onLoadedData={() => setLoading(false)}
          >
            <source src={fileUrl} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // For other file types, show download option
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground mb-4">
          Preview not available for this file type
        </p>
        <Button onClick={() => window.open(fileUrl, '_blank')}>
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate flex-1">{fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = fileName;
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {loading && (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
