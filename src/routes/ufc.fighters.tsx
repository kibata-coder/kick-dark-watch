import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/ufc/fighters")({
  component: FightersPage,
});

type FighterData = {
  id: string;
  name: string;
  nickname: string;
  weightClass: string;
  record: string;
  image: string;
  ufcUrl: string;
};

const topFighters: FighterData[] = [
  {
    id: "rafael-fiziev",
    name: "Rafael Fiziev",
    nickname: "Ataman",
    weightClass: "Lightweight",
    record: "12-3-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rafael_Fiziev.jpg/500px-Rafael_Fiziev.jpg",
    ufcUrl: "https://www.ufc.com/athlete/rafael-fiziev",
  },
  {
    id: "manuel-torres",
    name: "Manuel Torres",
    nickname: "El Loco",
    weightClass: "Lightweight",
    record: "17-3-0 (W-L-D)",
    image: "/images/manuel_torres.png",
    ufcUrl: "https://www.ufc.com/athlete/manuel-torres",
  },
  {
    id: "jon-jones",
    name: "Jon Jones",
    nickname: "Bones",
    weightClass: "Heavyweight Champion",
    record: "27-1-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Jon_Jones_-_Supporting_Brain_Health_Study.jpg/500px-Jon_Jones_-_Supporting_Brain_Health_Study.jpg",
    ufcUrl: "https://www.ufc.com/athlete/jon-jones",
  },
  {
    id: "islam-makhachev",
    name: "Islam Makhachev",
    nickname: "",
    weightClass: "Lightweight Champion",
    record: "25-1-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Islam_Makhachev_and_Sergey_Melikov_2025_%28cropped%29.jpg/500px-Islam_Makhachev_and_Sergey_Melikov_2025_%28cropped%29.jpg",
    ufcUrl: "https://www.ufc.com/athlete/islam-makhachev",
  },
  {
    id: "leon-edwards",
    name: "Leon Edwards",
    nickname: "Rocky",
    weightClass: "Welterweight Champion",
    record: "22-3-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Leon_Edwards_2021.png/500px-Leon_Edwards_2021.png",
    ufcUrl: "https://www.ufc.com/athlete/leon-edwards",
  },
  {
    id: "conor-mcgregor",
    name: "Conor McGregor",
    nickname: "The Notorious",
    weightClass: "Lightweight",
    record: "22-6-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Conor_McGregor_2025.jpeg/500px-Conor_McGregor_2025.jpeg",
    ufcUrl: "https://www.ufc.com/athlete/conor-mcgregor",
  }
];

function FightersPage() {
  return (
    <div className="py-6 animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Athlete Roster
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topFighters.map((fighter) => (
          <Card 
            key={fighter.id} 
            className="group cursor-pointer overflow-hidden bg-card/40 backdrop-blur hover:bg-card/80 transition-all duration-300 border-primary/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            onClick={() => window.open(fighter.ufcUrl, "_blank")}
          >
            <div className="aspect-[4/3] w-full relative overflow-hidden bg-zinc-900/50">
              <img
                src={fighter.image}
                alt={fighter.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-black text-2xl uppercase tracking-tight">{fighter.name}</h3>
                {fighter.nickname && (
                  <p className="text-primary text-sm font-bold tracking-wider uppercase">"{fighter.nickname}"</p>
                )}
              </div>
            </div>
            <CardContent className="pt-4 flex items-center justify-between border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Division</span>
                <span className="text-sm font-medium">{fighter.weightClass}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Record</span>
                <Badge variant="secondary" className="mt-1 font-mono tracking-tight bg-zinc-800 text-zinc-100">{fighter.record.split(' ')[0]}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
