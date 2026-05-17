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
  // Standard format: https://drive.google.com/file/d/[ID]/view
  // Embed format: https://drive.google.com/file/d/[ID]/preview
  let embedUrl = url;
  if (url.includes('drive.google.com')) {
    // Extract ID using regex to be more robust
    const match = url.match(/\/file\/d\/([^\/]+)/) || url.match(/id=([^\&]+)/);
    if (match && match[1]) {
      embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    } else if (url.includes('/view')) {
      embedUrl = url.replace('/view', '/preview');
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
