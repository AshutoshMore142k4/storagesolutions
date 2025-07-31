'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import FilePreview from './file-preview';
import { 
  Folder, 
  File, 
  FileImage, 
  FileText, 
  Download, 
  Eye,
  ArrowLeft,
  Loader2,
  Upload,
  Trash2,
  Edit,
  Search,
  FolderPlus,
  X
} from 'lucide-react';

interface FileItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  type: 'file';
}

interface FolderItem {
  name: string;
  type: 'folder';
  prefix: string;
}

interface S3Response {
  success: boolean;
  folders: FolderItem[];
  files: FileItem[];
  prefix: string;
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return <File className="h-4 w-4 text-gray-500" />;
  }
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  const textExtensions = ['txt', 'md', 'json', 'xml', 'csv'];
  
  if (imageExtensions.includes(extension)) {
    return <FileImage className="h-4 w-4 text-green-400" />;
  }
  
  if (textExtensions.includes(extension)) {
    return <FileText className="h-4 w-4 text-blue-400" />;
  }
  
  return <File className="h-4 w-4 text-gray-500" />;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function FileStructure() {
  const [data, setData] = useState<S3Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Enhanced features state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: any;
    isFolder: boolean;
  }>({ isOpen: false, item: null, isFolder: false });
  
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    item: any;
    newName: string;
    isFolder: boolean;
  }>({ isOpen: false, item: null, newName: '', isFolder: false });
  
  const [createFolderDialog, setCreateFolderDialog] = useState<{
    isOpen: boolean;
    folderName: string;
  }>({ isOpen: false, folderName: '' });
  
  const [previewDialog, setPreviewDialog] = useState<{
    isOpen: boolean;
    fileKey: string;
    fileName: string;
    fileUrl: string;
  }>({ isOpen: false, fileKey: '', fileName: '', fileUrl: '' });

  const fetchData = async (prefix: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = prefix 
        ? `/api/objects?prefix=${encodeURIComponent(prefix)}` 
        : '/api/objects';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const result: S3Response = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      
      setData(result);
      
      if (prefix) {
        const parts = prefix.split('/').filter(Boolean);
        setBreadcrumbs(parts);
      } else {
        setBreadcrumbs([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderPrefix: string) => {
    fetchData(folderPrefix);
  };

  const navigateUp = () => {
    if (breadcrumbs.length > 0) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const newPrefix = newBreadcrumbs.length > 0 
        ? newBreadcrumbs.join('/') + '/' 
        : '';
      fetchData(newPrefix);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      fetchData('');
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const newPrefix = newBreadcrumbs.join('/') + '/';
      fetchData(newPrefix);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const currentPrefix = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : '';
      const fileKey = currentPrefix + file.name;
      
      const uploadResponse = await fetch(
        `/api/upload?key=${encodeURIComponent(fileKey)}&contentType=${encodeURIComponent(file.type)}`
      );
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error('Failed to get upload URL');
      }
      
      const uploadToS3Response = await fetch(uploadResult.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadToS3Response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const currentPrefix2 = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : '';
      await fetchData(currentPrefix2);
      
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.results);
        setShowSearch(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (item: any, isFolder: boolean) => {
    try {
      const key = isFolder ? item.prefix : item.key;
      const response = await fetch(`/api/delete?key=${encodeURIComponent(key)}&isFolder=${isFolder}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const currentPrefix = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : '';
        await fetchData(currentPrefix);
        setDeleteDialog({ isOpen: false, item: null, isFolder: false });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete item');
    }
  };

  const handleRename = async () => {
    try {
      const { item, newName, isFolder } = renameDialog;
      const oldKey = isFolder ? item.prefix : item.key;
      const currentPrefix = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : '';
      const newKey = currentPrefix + newName + (isFolder ? '/' : '');
      
      const response = await fetch('/api/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldKey, newKey, isFolder }),
      });
      
      if (response.ok) {
        await fetchData(currentPrefix);
        setRenameDialog({ isOpen: false, item: null, newName: '', isFolder: false });
      }
    } catch (error) {
      console.error('Rename error:', error);
      setError('Failed to rename item');
    }
  };

  const handleCreateFolder = async () => {
    try {
      const currentPrefix = breadcrumbs.length > 0 ? breadcrumbs.join('/') + '/' : '';
      const response = await fetch('/api/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          folderName: createFolderDialog.folderName,
          currentPrefix 
        }),
      });
      
      if (response.ok) {
        await fetchData(currentPrefix);
        setCreateFolderDialog({ isOpen: false, folderName: '' });
      }
    } catch (error) {
      console.error('Create folder error:', error);
      setError('Failed to create folder');
    }
  };

  const handlePreview = async (fileKey: string, fileName: string) => {
    try {
      const response = await fetch(`/api/file?key=${encodeURIComponent(fileKey)}`);
      const result = await response.json();
      
      if (result.url) {
        setPreviewDialog({
          isOpen: true,
          fileKey,
          fileName,
          fileUrl: result.url
        });
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="flex items-center justify-center p-16">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-400 text-sm">Loading</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-900/50 border border-gray-800 rounded-lg">
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <File className="h-8 w-8 text-gray-600 mb-3" />
          <p className="text-gray-300 mb-1">Error loading files</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button 
            onClick={() => fetchData()} 
            variant="ghost"
            className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 border border-gray-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {breadcrumbs.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={navigateUp}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 h-8 w-8 p-0"
                title="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateFolderDialog({ isOpen: true, folderName: '' })}
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 h-8 w-8 p-0"
                title="New Folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  id="upload-input"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <Button 
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  asChild
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-50 h-8 w-8 p-0"
                  title="Upload"
                >
                  <label htmlFor="upload-input" className="cursor-pointer flex items-center justify-center w-full h-full">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </label>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <button 
                onClick={() => navigateToBreadcrumb(-1)}
                className="hover:text-gray-300 px-1"
              >
                Home
              </button>
              {breadcrumbs.map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  <span className="text-gray-600">/</span>
                  <button 
                    onClick={() => navigateToBreadcrumb(index)}
                    className="hover:text-gray-300 px-1"
                  >
                    {part}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Search Bar */}
          {showSearch && (
            <div className="p-3 bg-gray-950/50 rounded border border-gray-800">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    handleSearch(query);
                  }}
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 h-8 text-sm"
                />
                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-gray-400 hover:text-gray-300 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div key={result.key || index} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {getFileIcon(result.name)}
                        <span className="text-gray-300 text-xs">{result.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(result.key, result.name)}
                        className="text-gray-400 hover:text-gray-300 h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-800">
        {/* Folders */}
        {data?.folders && data.folders.length > 0 && data.folders.map((folder) => (
          <div 
            key={folder.prefix}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors group"
          >
            <button 
              className="flex items-center gap-3 flex-1 text-left"
              onClick={() => navigateToFolder(folder.prefix)}
            >
              <Folder className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300 text-sm">{folder.name}</span>
            </button>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameDialog({
                    isOpen: true,
                    item: folder,
                    newName: folder.name,
                    isFolder: true
                  });
                }}
                className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({
                    isOpen: true,
                    item: folder,
                    isFolder: true
                  });
                }}
                className="text-gray-500 hover:text-red-400 h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Files */}
        {data?.files && data.files.length > 0 && data.files.map((file) => (
          <div 
            key={file.key}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(file.name)}
              <div className="min-w-0 flex-1">
                <div className="text-gray-300 text-sm truncate">{file.name}</div>
                <div className="text-gray-500 text-xs">
                  {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreview(file.key, file.name)}
                className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const response = await fetch(`/api/file?key=${encodeURIComponent(file.key)}`);
                  const result = await response.json();
                  if (result.url) {
                    const a = document.createElement('a');
                    a.href = result.url;
                    a.download = file.name;
                    a.click();
                  }
                }}
                className="text-gray-500 hover:text-gray-300 h-7 w-7 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRenameDialog({
                    isOpen: true,
                    item: file,
                    newName: file.name,
                    isFolder: false
                  });
                }}
                className="text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDeleteDialog({
                    isOpen: true,
                    item: file,
                    isFolder: false
                  });
                }}
                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {(!data?.folders?.length && !data?.files?.length) && (
          <div className="p-12 text-center">
            <Folder className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No files or folders</p>
          </div>
        )}
      </div>
      
      {/* Dialogs */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, isOpen: open })
      }>
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Delete "{deleteDialog.item?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.item, deleteDialog.isFolder)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={renameDialog.isOpen} onOpenChange={(open) => 
        setRenameDialog({ ...renameDialog, isOpen: open })
      }>
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Rename</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              New name for "{renameDialog.item?.name}":
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              value={renameDialog.newName}
              onChange={(e) => setRenameDialog({ ...renameDialog, newName: e.target.value })}
              placeholder="New name"
              className="bg-gray-800 border-gray-700 text-gray-300"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRename} className="bg-blue-600 hover:bg-blue-700">
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={createFolderDialog.isOpen} onOpenChange={(open) => 
        setCreateFolderDialog({ ...createFolderDialog, isOpen: open })
      }>
        <AlertDialogContent className="bg-gray-900 border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">New Folder</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Enter folder name:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              value={createFolderDialog.folderName}
              onChange={(e) => setCreateFolderDialog({ ...createFolderDialog, folderName: e.target.value })}
              placeholder="Folder name"
              className="bg-gray-800 border-gray-700 text-gray-300"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700">
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreview
        isOpen={previewDialog.isOpen}
        onClose={() => setPreviewDialog({ ...previewDialog, isOpen: false })}
        fileKey={previewDialog.fileKey}
        fileName={previewDialog.fileName}
        fileUrl={previewDialog.fileUrl}
      />
    </div>
  );
}
