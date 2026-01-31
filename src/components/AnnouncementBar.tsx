import { Download, MapPin } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
        {[...Array(4)].map((_, i) => (
          <a
            key={i}
            href="/documents/delhi-ward-map.pdf"
            download="Delhi-Ward-Map-2023.pdf"
            className="inline-flex items-center gap-2 hover:underline cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Download Latest Delhi Ward Map</span>
            <Download className="h-4 w-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
