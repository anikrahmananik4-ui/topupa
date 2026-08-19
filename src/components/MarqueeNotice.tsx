import React from 'react';
import { Volume2 } from 'lucide-react';

interface MarqueeNoticeProps {
  text: string;
  active: boolean;
}

export const MarqueeNotice: React.FC<MarqueeNoticeProps> = ({ text, active }) => {
  if (!active || !text) return null;

  return (
    <div className="bg-blue-600 text-white text-xs md:text-sm py-2 px-4 flex items-center shadow-inner overflow-hidden">
      <div className="flex items-center gap-2 font-bold bg-blue-700 px-2.5 py-1 rounded text-xs shrink-0 mr-3">
        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
        <span>NOTICE</span>
      </div>
      <div className="overflow-hidden relative w-full">
        <div className="whitespace-nowrap animate-marquee inline-block font-medium">
          {text}
        </div>
      </div>
    </div>
  );
};
