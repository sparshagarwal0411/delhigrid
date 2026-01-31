import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from "lucide-react";
import { searchWards, getStatusFromScore } from "@/data/wards";
import { Ward } from "@/types";
import { useNavigate } from "react-router-dom";

interface WardSearchProps {
  onSelect?: (ward: Ward) => void;
  placeholder?: string;
}

export function WardSearch({ onSelect, placeholder = "Search by ward name or number..." }: WardSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ward[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 1) {
      const searchResults = searchWards(value).slice(0, 8);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (ward: Ward) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect(ward);
    } else {
      navigate(`/ward/${ward.id}`);
    }
  };

  const getStatusBadge = (score: number) => {
    const status = getStatusFromScore(score);
    return (
      <Badge variant={`pollution-${status}` as any} className="text-xs">
        {score}
      </Badge>
    );
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          className="pl-10 pr-4 h-12 text-base"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-2 z-50 max-h-80 overflow-auto shadow-lg">
          {results.map((ward) => (
            <Button
              key={ward.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3 px-3"
              onClick={() => handleSelect(ward)}
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">Ward {ward.id}: {ward.name}</div>
                <div className="text-xs text-muted-foreground">{ward.zone}</div>
              </div>
              {getStatusBadge(ward.pollutionScore)}
            </Button>
          ))}
        </Card>
      )}

      {isOpen && query.length >= 1 && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50 text-center text-muted-foreground">
          No wards found matching "{query}"
        </Card>
      )}
    </div>
  );
}
