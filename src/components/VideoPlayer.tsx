import React from 'react';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  placeholder?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, placeholder }) => {
  if (placeholder || !url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800">
        <PlayCircle className="w-12 h-12 text-slate-600" />
      </div>
    );
  }

  // Handle Google Drive links
  // Standard file format: https://drive.google.com/file/d/[ID]/view -> preview
  // Standard folder format: https://drive.google.com/drive/folders/[ID] -> embeddedfolderview
  let embedUrl = url;
  if (url.includes('drive.google.com')) {
    if (url.includes('/folders/')) {
      const folderMatch = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      if (folderMatch && folderMatch[1]) {
        embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
      }
    } else {
      // Extract ID using regex to be more robust
      const match = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
      if (match && match[1]) {
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      } else if (url.includes('/view')) {
        embedUrl = url.replace('/view', '/preview');
      }
    }
  }

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full border-0"
      allow="autoplay; fullscreen"
      referrerPolicy="no-referrer"
      title="Learning Session"
    />
  );
};
