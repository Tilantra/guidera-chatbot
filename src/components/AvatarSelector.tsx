import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, getAvatarStyles, generateRandomSeed } from "./Avatar";
import { Shuffle, Check } from "lucide-react";

interface AvatarSelectorProps {
  currentStyle: string;
  currentSeed: string;
  onAvatarChange: (style: string, seed: string) => void;
}

export const AvatarSelector = ({ currentStyle, currentSeed, onAvatarChange }: AvatarSelectorProps) => {
  const [selectedStyle, setSelectedStyle] = useState(currentStyle);
  const [selectedSeed, setSelectedSeed] = useState(currentSeed);
  const [previewSeeds, setPreviewSeeds] = useState<Record<string, string>>(() => {
    const styles = getAvatarStyles();
    const seeds: Record<string, string> = {};
    styles.forEach(style => {
      seeds[style] = style === currentStyle ? currentSeed : generateRandomSeed();
    });
    return seeds;
  });

  const avatarStyles = getAvatarStyles();
  
  const styleLabels: Record<string, string> = {
    adventurer: "Adventurer",
    'big-smile': "Big Smile", 
    bottts: "Robots",
    'fun-emoji': "Fun Emoji",
    icons: "Icons",
    identicon: "Identicon",
    initials: "Initials",
    lorelei: "Lorelei",
    micah: "Micah",
    miniavs: "Mini Avatars",
    'open-peeps': "Open Peeps",
    personas: "Personas", 
    'pixel-art': "Pixel Art",
    shapes: "Shapes",
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    setSelectedSeed(previewSeeds[style]);
    onAvatarChange(style, previewSeeds[style]);
  };

  const handleRefreshSeed = (style: string) => {
    const newSeed = generateRandomSeed();
    setPreviewSeeds(prev => ({ ...prev, [style]: newSeed }));
    
    if (style === selectedStyle) {
      setSelectedSeed(newSeed);
      onAvatarChange(style, newSeed);
    }
  };

  const handleRefreshAll = () => {
    const newSeeds: Record<string, string> = {};
    avatarStyles.forEach(style => {
      newSeeds[style] = generateRandomSeed();
    });
    setPreviewSeeds(newSeeds);
    
    // Update selected if it's currently selected
    if (selectedStyle) {
      setSelectedSeed(newSeeds[selectedStyle]);
      onAvatarChange(selectedStyle, newSeeds[selectedStyle]);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Choose Your Avatar</h3>
        <Button variant="outline" size="sm" onClick={handleRefreshAll}>
          <Shuffle className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {avatarStyles.map((style) => (
          <div key={style} className="relative group">
            <Card 
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                selectedStyle === style 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleStyleSelect(style)}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar 
                    style={style} 
                    seed={previewSeeds[style]} 
                    size={48}
                    className="transition-transform group-hover:scale-105"
                  />
                  {selectedStyle === style && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{styleLabels[style]}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshSeed(style);
                  }}
                >
                  <Shuffle className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Avatar style={selectedStyle} seed={selectedSeed} size={32} />
          <div>
            <p className="text-sm font-medium">Selected Avatar</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {styleLabels[selectedStyle]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleRefreshSeed(selectedStyle)}
              >
                <Shuffle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
