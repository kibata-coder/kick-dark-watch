import { Card } from "@/components/ui/card";

type Team = {
  name: string;
  flag: string;
  score?: string;
  isWinner?: boolean;
};

type Pair = [Team, Team];

export function WorldCupBracket({ events = [] }: { events?: any[] }) {
  // Try to cleanly extract 16 knockout matches.
  // If we don't have enough, we'll pad with empty placeholders.
  const knockoutMatches = events.slice(0, 16);
  const leftMatches = knockoutMatches.slice(0, 8);
  const rightMatches = knockoutMatches.slice(8, 16);

  const formatTeam = (competitor: any): Team => {
    if (!competitor || !competitor.team) return { name: "TBD", flag: "" };
    return {
      name: competitor.team.shortDisplayName || competitor.team.displayName || "TBD",
      flag: competitor.team.logo || "",
      score: competitor.score,
      isWinner: competitor.winner,
    };
  };

  const mapToPairs = (eventList: any[]): Pair[] => {
    const pairs: Pair[] = [];
    for (let i = 0; i < 8; i++) {
      if (eventList[i] && eventList[i].competitions && eventList[i].competitions[0]) {
        const competitors = eventList[i].competitions[0].competitors;
        // ESPN order usually places home vs away.
        const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
        const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];
        pairs.push([formatTeam(home), formatTeam(away)]);
      } else {
        pairs.push([{ name: "TBD", flag: "" }, { name: "TBD", flag: "" }]);
      }
    }
    return pairs;
  };

  const leftPairs = mapToPairs(leftMatches);
  const rightPairs = mapToPairs(rightMatches);
  return (
    <div className="relative w-full max-w-4xl mx-auto border border-border rounded-xl overflow-hidden bg-[#0a2e15] text-white">
      {/* Background texture simulation (dark green grass vibe) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #115e2a 0%, #05180a 100%)' }} />
      
      <div className="relative z-10 flex justify-between p-4 sm:p-8 min-h-[800px] overflow-x-auto">
        
        {/* LEFT COLUMN - ROUND OF 32 */}
        <div className="flex flex-col justify-between w-24 sm:w-32 shrink-0">
          {leftPairs.map((pair, idx) => (
            <div key={idx} className="relative flex flex-col h-20 justify-center">
              {/* The connecting bracket `]` */}
              <div className="absolute right-[-16px] top-1/4 bottom-1/4 w-4 border-r-2 border-t-2 border-b-2 border-white/80 rounded-r-sm" />
              
              <div className="flex flex-col gap-2 relative z-10 bg-[#0a2e15] py-1">
                {pair.map((team, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${team.isWinner ? 'text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] font-bold' : ''}`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] sm:text-xs font-medium leading-none drop-shadow-md truncate max-w-[80px]">{team.name}</span>
                      {team.flag ? (
                        <img src={team.flag} alt={team.name} className="w-6 h-4 sm:w-8 sm:h-5 object-cover rounded-[2px] shadow-sm bg-white/10" />
                      ) : (
                        <div className="w-6 h-4 sm:w-8 sm:h-5 bg-white/10 rounded-[2px]" />
                      )}
                    </div>
                    {team.score !== undefined && team.score !== null && (
                      <span className="text-xs font-bold bg-black/40 px-1.5 rounded ml-1">{team.score}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* LEFT COLUMN - ROUND OF 16 CONNECTIONS */}
        <div className="flex flex-col justify-around w-8 shrink-0 relative">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="relative h-40 w-full">
              <div className="absolute left-0 top-1/4 bottom-1/4 w-full border-r-2 border-t-2 border-b-2 border-white/80 rounded-r-sm" />
            </div>
          ))}
        </div>

        {/* LEFT COLUMN - QUARTER FINALS CONNECTIONS */}
        <div className="flex flex-col justify-around w-8 shrink-0 relative">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="relative h-[320px] w-full">
              <div className="absolute left-0 top-1/4 bottom-1/4 w-full border-r-2 border-t-2 border-b-2 border-white/80 rounded-r-sm" />
            </div>
          ))}
        </div>

        {/* CENTER COLUMN */}
        <div className="flex flex-col items-center justify-center flex-1 shrink-0 px-4 relative z-20">
          <div className="absolute top-0 flex flex-col items-center pt-4">
            <div className="bg-white text-black font-black text-xl px-4 py-1 rounded-t-lg">FIFA</div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-center mt-4 drop-shadow-lg leading-tight">
              Road to<br />Final
            </h2>
          </div>
          
          {/* Trophy Placeholder */}
          <div className="relative w-32 h-64 sm:w-48 sm:h-80 mt-20 flex items-center justify-center">
            {/* Connection lines from QF to Center */}
            <div className="absolute left-[-32px] w-8 border-b-2 border-white/80 top-1/2" />
            <div className="absolute right-[-32px] w-8 border-b-2 border-white/80 top-1/2" />
            
            {/* The "?" boxes on sides of trophy */}
            <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white text-black font-bold flex items-center justify-center rounded-full text-sm border-2 border-black/20 shadow-lg z-10">?</div>
            <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 bg-white text-black font-bold flex items-center justify-center rounded-full text-sm border-2 border-black/20 shadow-lg z-10">?</div>
            
            <img 
              src="https://a.espncdn.com/i/leaguelogos/soccer/500/4.png" 
              alt="Trophy" 
              className="object-contain w-full h-full drop-shadow-2xl opacity-90 filter brightness-150 contrast-125"
            />
          </div>
        </div>

        {/* RIGHT COLUMN - QUARTER FINALS CONNECTIONS */}
        <div className="flex flex-col justify-around w-8 shrink-0 relative">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="relative h-[320px] w-full">
              <div className="absolute right-0 top-1/4 bottom-1/4 w-full border-l-2 border-t-2 border-b-2 border-white/80 rounded-l-sm" />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN - ROUND OF 16 CONNECTIONS */}
        <div className="flex flex-col justify-around w-8 shrink-0 relative">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="relative h-40 w-full">
              <div className="absolute right-0 top-1/4 bottom-1/4 w-full border-l-2 border-t-2 border-b-2 border-white/80 rounded-l-sm" />
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN - ROUND OF 32 */}
        <div className="flex flex-col justify-between w-24 sm:w-32 items-end text-right shrink-0">
          {rightPairs.map((pair, idx) => (
            <div key={idx} className="relative flex flex-col h-20 justify-center w-full items-end">
              {/* The connecting bracket `[` */}
              <div className="absolute left-[-16px] top-1/4 bottom-1/4 w-4 border-l-2 border-t-2 border-b-2 border-white/80 rounded-l-sm" />
              
              <div className="flex flex-col gap-2 relative z-10 bg-[#0a2e15] items-end py-1">
                {pair.map((team, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${team.isWinner ? 'text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] font-bold' : ''}`}>
                    {team.score !== undefined && team.score !== null && (
                      <span className="text-xs font-bold bg-black/40 px-1.5 rounded mr-1">{team.score}</span>
                    )}
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[10px] sm:text-xs font-medium leading-none drop-shadow-md truncate max-w-[80px] text-right">{team.name}</span>
                      {team.flag ? (
                        <img src={team.flag} alt={team.name} className="w-6 h-4 sm:w-8 sm:h-5 object-cover rounded-[2px] shadow-sm bg-white/10" />
                      ) : (
                        <div className="w-6 h-4 sm:w-8 sm:h-5 bg-white/10 rounded-[2px]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
