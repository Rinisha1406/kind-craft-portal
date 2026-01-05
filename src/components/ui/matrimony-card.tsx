import { MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatrimonyCardProps {
  fullName: string;
  age: number;
  gender: string;
  occupation?: string;
  education?: string;
  location?: string;
  bio?: string;
  imageUrl?: string;
  onContact?: () => void;
}

const MatrimonyCard = ({
  fullName,
  age,
  gender,
  occupation,
  education,
  location,
  bio,
  imageUrl,
  onContact,
}: MatrimonyCardProps) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 border border-border group">
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fullName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-6xl">👤</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {age} yrs • {gender}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
          {fullName}
        </h3>
        <div className="space-y-2 mb-4">
          {occupation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 text-primary" />
              {occupation}
            </div>
          )}
          {education && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-primary" />
              {education}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {location}
            </div>
          )}
        </div>
        {bio && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{bio}</p>
        )}
        <Button onClick={onContact} className="w-full gold-gradient hover:opacity-90 text-primary-foreground">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default MatrimonyCard;
