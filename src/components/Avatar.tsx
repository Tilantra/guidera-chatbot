import { createAvatar } from '@dicebear/core';
import { 
  adventurer, 
  bigSmile, 
  bottts, 
  funEmoji, 
  icons, 
  identicon, 
  initials, 
  lorelei, 
  micah, 
  miniavs, 
  openPeeps, 
  personas, 
  pixelArt, 
  shapes 
} from '@dicebear/collection';

const avatarStyles = {
  adventurer,
  'big-smile': bigSmile,
  bottts,
  'fun-emoji': funEmoji,
  icons,
  identicon,
  initials,
  lorelei,
  micah,
  miniavs,
  'open-peeps': openPeeps,
  personas,
  'pixel-art': pixelArt,
  shapes,
};

interface AvatarProps {
  style: string;
  seed: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Avatar = ({ style, seed, size = 40, className = "", onClick }: AvatarProps) => {
  const avatarStyle = avatarStyles[style as keyof typeof avatarStyles];
  
  if (!avatarStyle) {
    // Fallback to initials if style not found
    const avatar = createAvatar(initials, {
      seed,
      size,
    });
    
    return (
      <div 
        className={`inline-block rounded-full overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
        style={{ width: size, height: size }}
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: avatar.toString() }}
      />
    );
  }

  const avatar = createAvatar(avatarStyle, {
    seed,
    size,
  });

  return (
    <div 
      className={`inline-block rounded-full overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: avatar.toString() }}
    />
  );
};

export const getAvatarStyles = () => Object.keys(avatarStyles);

export const generateRandomSeed = () => Math.random().toString(36).substring(2, 10);
