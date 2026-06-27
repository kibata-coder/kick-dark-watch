
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Swords, Shield, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/ufc/fighters")({
  component: FightersPage,
  validateSearch: (search: Record<string, unknown>): { fighter?: string } => {
    return {
      fighter: typeof search.fighter === "string" ? search.fighter : undefined,
    };
  },
});

type FighterData = {
  id: string;
  name: string;
  nickname: string;
  weightClass: string;
  record: string;
  image: string;
  stats: {
    age: number;
    height: string;
    weight: string;
    reach: string;
    stance: string;
    striking: { slpm: number; accuracy: number; absorbed: number; defense: number };
    grappling: { tdAvg: number; tdAccuracy: number; tdDefense: number; subAvg: number };
  };
};

const topFighters: FighterData[] = [
  {
    id: "rafael-fiziev",
    name: "Rafael Fiziev",
    nickname: "Ataman",
    weightClass: "Lightweight",
    record: "12-3-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rafael_Fiziev.jpg/500px-Rafael_Fiziev.jpg",
    stats: {
      age: 31, height: "5' 8\"", weight: "156 lbs", reach: "71\"", stance: "Orthodox",
      striking: { slpm: 4.8, accuracy: 51, absorbed: 4.9, defense: 48 },
      grappling: { tdAvg: 0.3, tdAccuracy: 40, tdDefense: 90, subAvg: 0.0 }
    }
  },
  {
    id: "manuel-torres",
    name: "Manuel Torres",
    nickname: "El Loco",
    weightClass: "Lightweight",
    record: "17-3-0 (W-L-D)",
    image: "/images/manuel_torres.png",
    stats: {
      age: 31, height: "5' 10\"", weight: "155 lbs", reach: "73\"", stance: "Orthodox",
      striking: { slpm: 5.2, accuracy: 48, absorbed: 3.1, defense: 55 },
      grappling: { tdAvg: 1.1, tdAccuracy: 35, tdDefense: 85, subAvg: 1.5 }
    }
  },
  {
    id: "jon-jones",
    name: "Jon Jones",
    nickname: "Bones",
    weightClass: "Heavyweight Champion",
    record: "27-1-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Jon_Jones_-_Supporting_Brain_Health_Study.jpg/500px-Jon_Jones_-_Supporting_Brain_Health_Study.jpg",
    stats: {
      age: 36, height: "6' 4\"", weight: "248 lbs", reach: "84\"", stance: "Orthodox",
      striking: { slpm: 4.3, accuracy: 57, absorbed: 2.2, defense: 64 },
      grappling: { tdAvg: 1.9, tdAccuracy: 45, tdDefense: 95, subAvg: 0.8 }
    }
  },
  {
    id: "islam-makhachev",
    name: "Islam Makhachev",
    nickname: "",
    weightClass: "Lightweight Champion",
    record: "25-1-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Islam_Makhachev_and_Sergey_Melikov_2025_%28cropped%29.jpg/500px-Islam_Makhachev_and_Sergey_Melikov_2025_%28cropped%29.jpg",
    stats: {
      age: 32, height: "5' 10\"", weight: "155 lbs", reach: "70\"", stance: "Southpaw",
      striking: { slpm: 2.4, accuracy: 60, absorbed: 1.3, defense: 61 },
      grappling: { tdAvg: 3.1, tdAccuracy: 61, tdDefense: 90, subAvg: 1.2 }
    }
  },
  {
    id: "leon-edwards",
    name: "Leon Edwards",
    nickname: "Rocky",
    weightClass: "Welterweight Champion",
    record: "22-3-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Leon_Edwards_2021.png/500px-Leon_Edwards_2021.png",
    stats: {
      age: 32, height: "6' 2\"", weight: "170 lbs", reach: "74\"", stance: "Southpaw",
      striking: { slpm: 2.8, accuracy: 53, absorbed: 2.4, defense: 53 },
      grappling: { tdAvg: 1.2, tdAccuracy: 33, tdDefense: 70, subAvg: 0.3 }
    }
  },
  {
    id: "conor-mcgregor",
    name: "Conor McGregor",
    nickname: "The Notorious",
    weightClass: "Lightweight",
    record: "22-6-0 (W-L-D)",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Conor_McGregor_2025.jpeg/500px-Conor_McGregor_2025.jpeg",
    stats: {
      age: 35, height: "5' 9\"", weight: "155 lbs", reach: "74\"", stance: "Southpaw",
      striking: { slpm: 5.3, accuracy: 49, absorbed: 4.6, defense: 54 },
      grappling: { tdAvg: 0.7, tdAccuracy: 55, tdDefense: 66, subAvg: 0.0 }
    }
  }
];

function StatItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function FighterProfile({ fighter, onBack }: { fighter: FighterData; onBack: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="mb-4" onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Roster
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-[#1a1c23] to-[#0a0a0c] border border-white/10 mb-8 min-h-[400px] flex items-center shadow-2xl">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          <div className="flex-1 space-y-4">
            {fighter.nickname && (
              <Badge variant="outline" className="text-primary border-primary/30 uppercase tracking-widest px-3 py-1 bg-primary/5">
                "{fighter.nickname}"
              </Badge>
            )}
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
              {fighter.name.split(' ')[0]} <br/>
              <span className="text-primary">{fighter.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Badge className="bg-white text-black hover:bg-gray-200 text-lg px-4 py-1.5 rounded-sm uppercase tracking-wider font-bold">
                {fighter.weightClass}
              </Badge>
              <span className="text-2xl font-mono font-light text-gray-300">{fighter.record}</span>
            </div>
          </div>
          
          <div className="w-64 h-64 md:w-80 md:h-80 relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
            <img 
              src={fighter.image} 
              alt={fighter.name} 
              className="relative z-10 w-full h-full object-cover rounded-full border-4 border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Tale of the Tape */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-card/40 backdrop-blur border-white/5 text-center py-4">
          <StatItem label="Age" value={fighter.stats.age} />
        </Card>
        <Card className="bg-card/40 backdrop-blur border-white/5 text-center py-4">
          <StatItem label="Height" value={fighter.stats.height} />
        </Card>
        <Card className="bg-card/40 backdrop-blur border-white/5 text-center py-4">
          <StatItem label="Weight" value={fighter.stats.weight} />
        </Card>
        <Card className="bg-card/40 backdrop-blur border-white/5 text-center py-4">
          <StatItem label="Reach" value={fighter.stats.reach} />
        </Card>
        <Card className="bg-card/40 backdrop-blur border-white/5 text-center py-4">
          <StatItem label="Stance" value={fighter.stats.stance} />
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Striking */}
        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-white/5 pb-4">
            <Swords className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Striking</h3>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Sig. Strike Accuracy</span>
                <span className="text-sm font-mono">{fighter.stats.striking.accuracy}%</span>
              </div>
              <Progress value={fighter.stats.striking.accuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Sig. Strike Defense</span>
                <span className="text-sm font-mono">{fighter.stats.striking.defense}%</span>
              </div>
              <Progress value={fighter.stats.striking.defense} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <StatItem label="SLpM" value={fighter.stats.striking.slpm} />
              <StatItem label="SApM" value={fighter.stats.striking.absorbed} />
            </div>
          </CardContent>
        </Card>

        {/* Grappling */}
        <Card className="bg-card/60 backdrop-blur border-white/10">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-white/5 pb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Grappling</h3>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Takedown Accuracy</span>
                <span className="text-sm font-mono">{fighter.stats.grappling.tdAccuracy}%</span>
              </div>
              <Progress value={fighter.stats.grappling.tdAccuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">Takedown Defense</span>
                <span className="text-sm font-mono">{fighter.stats.grappling.tdDefense}%</span>
              </div>
              <Progress value={fighter.stats.grappling.tdDefense} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <StatItem label="TD Avg" value={fighter.stats.grappling.tdAvg} />
              <StatItem label="Sub Avg" value={fighter.stats.grappling.subAvg} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FightersPage() {
  const { fighter: selectedId } = Route.useSearch();
  const navigate = Route.useNavigate();
  
  const selectedFighter = selectedId ? topFighters.find(f => f.id === selectedId) : null;

  if (selectedFighter) {
    return <FighterProfile fighter={selectedFighter} onBack={() => navigate({ search: { fighter: undefined } })} />;
  }

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
            onClick={() => navigate({ search: { fighter: fighter.id } })}
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
