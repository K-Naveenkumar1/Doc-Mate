
import React, { useState } from "react";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, FileText, Image, FilePlus, FolderPlus, Folder, X, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

// Define the FileItem interface
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url: string;
  category: 'prescription' | 'report' | 'other';
  folderId: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  createdDate: string;
}

const Files: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Prescription_July2025.pdf",
      type: "application/pdf",
      size: "1.2 MB",
      uploadDate: "2025-07-12",
      url: "#",
      category: "prescription",
      folderId: "folder-1"
    },
    {
      id: "2",
      name: "BloodTest_2025.pdf",
      type: "application/pdf",
      size: "3.4 MB",
      uploadDate: "2025-06-28",
      url: "#",
      category: "report",
      folderId: "folder-2"
    },
    {
      id: "3",
      name: "XRay_Chest.jpg",
      type: "image/jpeg",
      size: "5.1 MB",
      uploadDate: "2025-06-15",
      url: "#",
      category: "report",
      folderId: null
    }
  ]);

  const [folders, setFolders] = useState<FolderItem[]>([
    {
      id: "folder-1",
      name: "Prescriptions",
      createdDate: "2025-06-10"
    },
    {
      id: "folder-2",
      name: "Lab Reports",
      createdDate: "2025-06-15"
    }
  ]);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      simulateUpload(fileList);
    }
  };

  const simulateUpload = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        
        // Add files to state when upload is "complete"
        setTimeout(() => {
          const newFiles: FileItem[] = Array.from(fileList).map((file, index) => {
            return {
              id: `new-${Date.now()}-${index}`,
              name: file.name,
              type: file.type,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadDate: new Date().toISOString().split('T')[0],
              url: "#",
              category: file.name.toLowerCase().includes('prescription') ? 'prescription' : 'report',
              folderId: activeFolderId
            };
          });
          
          setFiles([...newFiles, ...files]);
          setIsUploading(false);
          
          toast({
            title: "Files Uploaded",
            description: `Successfully uploaded ${newFiles.length} file(s)`,
          });
        }, 500);
      }
      setUploadProgress(progress);
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      simulateUpload(fileList);
    }
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "File Deleted",
      description: "The file has been removed successfully",
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="text-blue-500" size={24} />;
    } else if (type.includes('pdf')) {
      return <FileText className="text-red-500" size={24} />;
    } else {
      return <File className="text-gray-500" size={24} />;
    }
  };

  const createNewFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setShowNewFolderInput(false);
      
      toast({
        title: "Folder Created",
        description: `Created folder "${newFolderName.trim()}"`,
      });
    }
  };

  const deleteFolder = (id: string) => {
    // Move files from this folder to "no folder"
    const updatedFiles = files.map(file => {
      if (file.folderId === id) {
        return { ...file, folderId: null };
      }
      return file;
    });
    
    setFiles(updatedFiles);
    setFolders(folders.filter(folder => folder.id !== id));
    
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }
    
    toast({
      title: "Folder Deleted",
      description: "The folder has been removed successfully",
    });
  };

  const filteredFiles = files.filter(file => {
    // First filter by selected tab
    const categoryMatch = selectedTab === "all" || file.category === selectedTab;
    
    // Then filter by active folder
    const folderMatch = activeFolderId === null || file.folderId === activeFolderId;
    
    // Then filter by search
    const searchMatch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && folderMatch && searchMatch;
  });

  return (
    <Container>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">
            Medical Records
          </h1>
          <p className="text-gray-400 mt-2">
            Securely store and manage all your medical documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with folders and upload */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-white/10 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Folders</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-primary/20"
                    onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                  >
                    <FolderPlus size={16} />
                  </Button>
                </div>
                <CardDescription className="text-gray-500">
                  Organize your medical files
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                {showNewFolderInput && (
                  <div className="flex p-3 border-b border-white/10">
                    <Input
                      type="text"
                      className="flex-1 h-8 bg-black/20 border-white/10 text-white"
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-8 text-primary"
                      onClick={createNewFolder}
                    >
                      Add
                    </Button>
                  </div>
                )}
                
                <div className="space-y-px">
                  <Button
                    variant={activeFolderId === null ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none px-4 py-2 text-left h-auto"
                    onClick={() => setActiveFolderId(null)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    <span className="font-normal">All Files</span>
                    <span className="ml-auto bg-gray-800 text-xs rounded-full px-2 py-0.5">
                      {files.length}
                    </span>
                  </Button>
                  
                  {folders.map(folder => (
                    <div key={folder.id} className="flex items-center group">
                      <Button
                        variant={activeFolderId === folder.id ? "secondary" : "ghost"}
                        className="flex-1 justify-start rounded-none px-4 py-2 text-left h-auto"
                        onClick={() => setActiveFolderId(folder.id)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        <span className="font-normal truncate max-w-[140px]">{folder.name}</span>
                        <span className="ml-auto bg-gray-800 text-xs rounded-full px-2 py-0.5">
                          {files.filter(f => f.folderId === folder.id).length}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => deleteFolder(folder.id)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload Files</CardTitle>
                <CardDescription className="text-gray-500">
                  Add new medical records to your account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isUploading ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Uploading...</span>
                      <span className="text-white">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 w-full" />
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isDragging ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary/50 hover:bg-primary/5"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Drop Files Here</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      or click to browse from your device
                    </p>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-primary hover:opacity-90">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Select Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Files view */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    {activeFolderId 
                      ? folders.find(f => f.id === activeFolderId)?.name || 'Selected Folder'
                      : 'All Files'
                    }
                  </CardTitle>
                  
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9 bg-black/20 border-white/10 text-white"
                    />
                  </div>
                </div>
                
                <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Files</TabsTrigger>
                    <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
                    <TabsTrigger value="report">Reports</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">No Files Found</h3>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      {searchQuery 
                        ? "No files match your search query. Try using different keywords."
                        : "Upload some files to see them here. You can drag and drop files or use the upload button."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredFiles.map(file => (
                      <div 
                        key={file.id} 
                        className="flex items-center p-4 bg-black/20 border border-white/10 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center mr-4">
                          {getFileIcon(file.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{file.name}</h4>
                          <div className="flex text-xs text-gray-400 mt-1 gap-2">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{format(new Date(file.uploadDate), 'MMM d, yyyy')}</span>
                            {file.folderId && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[150px]">
                                  {folders.find(f => f.id === file.folderId)?.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Download size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => deleteFile(file.id)}
                          >
                            <X size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Files;
