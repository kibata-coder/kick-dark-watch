import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Team = {
  name: string;
  code: string;
  flag: string;
  score?: number | null;
  isWinner?: boolean;
};

type MatchNode = {
  id: string;
  round: string;
  team1: Team;
  team2: Team;
  date?: string;
};

// Generate dummy data for a symmetrical 32-team bracket
const MOCK_TEAMS = [
  { name: "Argentina", code: "ARG", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/202.png" },
  { name: "Brazil", code: "BRA", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/205.png" },
  { name: "France", code: "FRA", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/478.png" },
  { name: "England", code: "ENG", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/468.png" },
  { name: "Spain", code: "ESP", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/164.png" },
  { name: "Germany", code: "GER", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/481.png" },
  { name: "Portugal", code: "POR", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/482.png" },
  { name: "Netherlands", code: "NED", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/449.png" },
  { name: "Italy", code: "ITA", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png" },
  { name: "Uruguay", code: "URU", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/214.png" },
  { name: "Croatia", code: "CRO", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/477.png" },
  { name: "Morocco", code: "MAR", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/644.png" },
  { name: "USA", code: "USA", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/660.png" },
  { name: "Mexico", code: "MEX", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/203.png" },
  { name: "Japan", code: "JPN", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/624.png" },
  { name: "Senegal", code: "SEN", flag: "https://a.espncdn.com/i/teamlogos/soccer/500/650.png" }
];

const getTbdTeam = (): Team => ({ name: "TBD", code: "TBD", flag: "" });

// Left Side
const leftR32: MatchNode[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `L_R32_${i}`,
  round: "Round of 32",
  team1: MOCK_TEAMS[i] || getTbdTeam(),
  team2: getTbdTeam(),
}));
const leftR16: MatchNode[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `L_R16_${i}`, round: "Round of 16", team1: getTbdTeam(), team2: getTbdTeam()
}));
const leftQF: MatchNode[] = Array.from({ length: 2 }).map((_, i) => ({
  id: `L_QF_${i}`, round: "Quarter-Final", team1: getTbdTeam(), team2: getTbdTeam()
}));
const leftSF: MatchNode[] = [{
  id: `L_SF_0`, round: "Semi-Final", team1: getTbdTeam(), team2: getTbdTeam()
}];

// Right Side
const rightR32: MatchNode[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `R_R32_${i}`,
  round: "Round of 32",
  team1: MOCK_TEAMS[8 + i] || getTbdTeam(),
  team2: getTbdTeam(),
}));
const rightR16: MatchNode[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `R_R16_${i}`, round: "Round of 16", team1: getTbdTeam(), team2: getTbdTeam()
}));
const rightQF: MatchNode[] = Array.from({ length: 2 }).map((_, i) => ({
  id: `R_QF_${i}`, round: "Quarter-Final", team1: getTbdTeam(), team2: getTbdTeam()
}));
const rightSF: MatchNode[] = [{
  id: `R_SF_0`, round: "Semi-Final", team1: getTbdTeam(), team2: getTbdTeam()
}];

// Final
const finalMatch: MatchNode = {
  id: `FINAL`, round: "Final", team1: getTbdTeam(), team2: getTbdTeam()
};

function MatchCard({ match }: { match: MatchNode }) {
  return (
    <Card className="w-48 bg-card border border-border overflow-hidden text-sm flex flex-col shrink-0 shadow-sm relative z-10 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="bg-muted/50 px-2 py-1 text-[10px] font-bold text-center border-b border-border text-muted-foreground uppercase tracking-wider">
        {match.round}
      </div>
      <div className="flex flex-col">
        <TeamRow team={match.team1} />
        <div className="h-px w-full bg-border" />
        <TeamRow team={match.team2} />
      </div>
    </Card>
  );
}

function TeamRow({ team }: { team: Team }) {
  return (
    <div className={`flex items-center justify-between px-2 py-1.5 ${team.isWinner ? "bg-primary/5" : ""}`}>
      <div className="flex items-center gap-2">
        {team.flag ? (
          <img src={team.flag} alt={team.code} className="w-4 h-3 object-cover rounded-sm" />
        ) : (
          <div className="w-4 h-3 bg-muted rounded-sm" />
        )}
        <span className={`font-medium ${team.name === "TBD" ? "text-muted-foreground" : "text-foreground"}`}>
          {team.code}
        </span>
      </div>
      <span className="font-bold text-xs">{team.score ?? "-"}</span>
    </div>
  );
}

function Column({ matches, justify }: { matches: MatchNode[], justify: "start" | "center" | "end" | "space-around" }) {
  return (
    <div className={`flex flex-col gap-4 justify-${justify} h-full py-4`}>
      {matches.map(m => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}

// Connectors for SVG drawing
function Connector({ type }: { type: "right" | "left" | "straight" }) {
  // We use CSS borders to draw the bracket lines instead of complex SVGs for a fluid, responsive layout.
  return null;
}

export function WorldCupBracket() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Center scroll on load
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const handleMouseUp = () => setIsDragging(false);
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    if (containerRef.current) {
      const container = containerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }
  };

  return (
    <div className="relative w-full border border-border rounded-xl bg-muted/10 overflow-hidden flex flex-col h-[700px]">
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-card border border-border rounded-lg p-1 shadow-md">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="h-px bg-border w-full" />
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={resetZoom}>
          <Maximize className="w-4 h-4" />
        </Button>
        <div className="h-px bg-border w-full" />
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Interactive Panning Area */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} scrollbar-hide select-none`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div 
          className="min-w-max min-h-max p-12 flex justify-center items-center transition-transform duration-200 origin-center"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Symmetrical Bracket Layout */}
          <div className="flex gap-8 items-stretch h-[1200px]">
            
            {/* LEFT SIDE */}
            <Column matches={leftR32} justify="space-around" />
            <div className="w-8" /> {/* Spacer for visual connectors */}
            <Column matches={leftR16} justify="space-around" />
            <div className="w-8" />
            <Column matches={leftQF} justify="space-around" />
            <div className="w-8" />
            <Column matches={leftSF} justify="space-around" />
            
            {/* CENTER FINAL */}
            <div className="flex items-center justify-center px-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl font-black text-primary tracking-widest uppercase drop-shadow-md">
                  WORLD CHAMPION
                </div>
                <MatchCard match={finalMatch} />
                <div className="mt-4 px-4 py-1.5 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30">
                  JULY 19, 2026 - NEW YORK
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <Column matches={rightSF} justify="space-around" />
            <div className="w-8" />
            <Column matches={rightQF} justify="space-around" />
            <div className="w-8" />
            <Column matches={rightR16} justify="space-around" />
            <div className="w-8" />
            <Column matches={rightR32} justify="space-around" />

          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full bg-background/80 backdrop-blur-sm border-t border-border p-3 text-center text-xs text-muted-foreground z-20 flex items-center justify-center gap-2">
        <span>Click and drag to pan around the bracket. Matches will be updated live as the tournament progresses.</span>
      </div>
    </div>
  );
}
