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
    <Card className="p-6 border-border/40 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Identity & Virtual Profile</h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select an avatar style for your workspace presence</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefreshAll} className="h-9 px-4 font-bold text-xs shadow-sm">
          <Shuffle className="h-3.5 w-3.5 mr-2" />
          Regenerate All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {avatarStyles.map((style) => (
          <div key={style} className="relative group">
            <Card
              className={`p-4 cursor-pointer transition-all duration-300 border-border/40 hover:shadow-md ${selectedStyle === style
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5"
                : "bg-secondary/10 hover:bg-secondary/20"
                }`}
              onClick={() => handleStyleSelect(style)}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar
                    style={style}
                    seed={previewSeeds[style]}
                    size={56}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  {selectedStyle === style && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold tracking-tight mb-1">{styleLabels[style]}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-all h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm shadow-sm absolute top-2 right-2"
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

      <div className="mt-8 p-5 bg-secondary/20 border border-border/40 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-elegant">
            <Avatar style={selectedStyle} seed={selectedSeed} size={40} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Active Core Identity</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight">Style: <span className="text-primary">{styleLabels[selectedStyle]}</span></span>
              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 h-4 border-primary/20 bg-primary/5 text-primary">
                #{selectedSeed.slice(0, 6)}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 font-bold text-xs shadow-sm bg-background"
            onClick={() => handleRefreshSeed(selectedStyle)}
          >
            <Shuffle className="h-3.5 w-3.5 mr-2" />
            Randomize Seed
          </Button>
        </div>
      </div>
    </Card>
  );
};
