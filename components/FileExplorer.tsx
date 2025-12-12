import React, { useState } from 'react';
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, File } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: Record<string, FileNode>;
  content?: string;
}

interface FileExplorerProps {
  files: Array<{ path: string; content: string }>;
  onFileSelect: (content: string, path: string) => void;
  selectedPath: string | null;
}

const buildFileTree = (files: Array<{ path: string; content: string }>) => {
  const root: Record<string, FileNode> = {};

  files.forEach(file => {
    const parts = file.path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        const isFile = index === parts.length - 1;
        currentLevel[part] = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : {},
          content: isFile ? file.content : undefined
        };
      }
      
      if (index < parts.length - 1) {
        currentLevel = currentLevel[part].children!;
      }
    });
  });

  return root;
};

const FileItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  onSelect: (content: string, path: string) => void;
  selectedPath: string | null; 
}> = ({ node, depth, onSelect, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(depth === 0); // Default expand root folders
  
  const isSelected = node.path === selectedPath;
  const paddingLeft = `${depth * 12 + 12}px`;

  if (node.type === 'folder') {
    return (
      <div className="select-none">
        <div 
          className="flex items-center py-1 px-2 hover:bg-zinc-800/50 cursor-pointer text-zinc-400 hover:text-zinc-200 transition-colors"
          style={{ paddingLeft }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
          {isOpen ? <FolderOpen size={14} className="mr-2 text-yellow-500/80" /> : <Folder size={14} className="mr-2 text-yellow-500/80" />}
          <span className="text-xs font-medium truncate">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {(Object.values(node.children) as FileNode[])
              .sort((a, b) => {
                  // Sort folders first, then files
                  if (a.type === b.type) return a.name.localeCompare(b.name);
                  return a.type === 'folder' ? -1 : 1;
              })
              .map(child => (
              <FileItem 
                key={child.path} 
                node={child} 
                depth={depth + 1} 
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center py-1 px-2 cursor-pointer transition-colors border-l-2 ${
        isSelected 
          ? 'bg-blue-500/10 text-blue-300 border-blue-500' 
          : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300 border-transparent'
      }`}
      style={{ paddingLeft }}
      onClick={() => onSelect(node.content || '', node.path)}
    >
      <FileCode size={14} className="mr-2 opacity-70" />
      <span className="text-xs truncate">{node.name}</span>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, selectedPath }) => {
  const tree = buildFileTree(files);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0d10] border border-zinc-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
         <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Project Explorer</span>
         <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{files.length} files</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {Object.values(tree).map(node => (
          <FileItem 
            key={node.path} 
            node={node} 
            depth={0} 
            onSelect={onFileSelect}
            selectedPath={selectedPath}
          />
        ))}
        {files.length === 0 && (
            <div className="text-center p-4 text-zinc-600 text-xs">
                No files found
            </div>
        )}
      </div>
    </div>
  );
};