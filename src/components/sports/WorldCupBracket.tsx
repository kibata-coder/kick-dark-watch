import { Card } from "@/components/ui/card";

type Team = {
  name: string;
  flag: string;
};

// Based on the user's reference image
const LEFT_TEAMS: Team[] = [
  { name: "Germany", flag: "https://flagcdn.com/w40/de.png" },
  { name: "Paraguay", flag: "https://flagcdn.com/w40/py.png" },
  { name: "France", flag: "https://flagcdn.com/w40/fr.png" },
  { name: "Sweden", flag: "https://flagcdn.com/w40/se.png" },
  { name: "South Africa", flag: "https://flagcdn.com/w40/za.png" },
  { name: "Canada", flag: "https://flagcdn.com/w40/ca.png" },
  { name: "Netherlands", flag: "https://flagcdn.com/w40/nl.png" },
  { name: "Morocco", flag: "https://flagcdn.com/w40/ma.png" },
  { name: "Portugal", flag: "https://flagcdn.com/w40/pt.png" },
  { name: "Croatia", flag: "https://flagcdn.com/w40/hr.png" },
  { name: "Spain", flag: "https://flagcdn.com/w40/es.png" },
  { name: "Austria", flag: "https://flagcdn.com/w40/at.png" },
  { name: "USA", flag: "https://flagcdn.com/w40/us.png" },
  { name: "Bosnia & H..", flag: "https://flagcdn.com/w40/ba.png" },
  { name: "Belgium", flag: "https://flagcdn.com/w40/be.png" },
  { name: "Senegal", flag: "https://flagcdn.com/w40/sn.png" },
];

const RIGHT_TEAMS: Team[] = [
  { name: "Brazil", flag: "https://flagcdn.com/w40/br.png" },
  { name: "Japan", flag: "https://flagcdn.com/w40/jp.png" },
  { name: "Ivory Coast", flag: "https://flagcdn.com/w40/ci.png" },
  { name: "Norway", flag: "https://flagcdn.com/w40/no.png" },
  { name: "Mexico", flag: "https://flagcdn.com/w40/mx.png" },
  { name: "Ecuador", flag: "https://flagcdn.com/w40/ec.png" },
  { name: "England", flag: "https://flagcdn.com/w40/gb-eng.png" },
  { name: "DR Congo", flag: "https://flagcdn.com/w40/cd.png" },
  { name: "Argentina", flag: "https://flagcdn.com/w40/ar.png" },
  { name: "Cape Verde", flag: "https://flagcdn.com/w40/cv.png" },
  { name: "Australia", flag: "https://flagcdn.com/w40/au.png" },
  { name: "Egypt", flag: "https://flagcdn.com/w40/eg.png" },
  { name: "Switzerland", flag: "https://flagcdn.com/w40/ch.png" },
  { name: "Algeria", flag: "https://flagcdn.com/w40/dz.png" },
  { name: "Colombia", flag: "https://flagcdn.com/w40/co.png" },
  { name: "Ghana", flag: "https://flagcdn.com/w40/gh.png" },
];

// Helper to chunk array into pairs
const chunk = (arr: Team[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const leftPairs = chunk(LEFT_TEAMS, 2);
const rightPairs = chunk(RIGHT_TEAMS, 2);

export function WorldCupBracket() {
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
              
              <div className="flex flex-col gap-2 relative z-10 bg-[#0a2e15]">
                {pair.map((team, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[10px] sm:text-xs font-medium leading-none drop-shadow-md truncate">{team.name}</span>
                    <img src={team.flag} alt={team.name} className="w-6 h-4 sm:w-8 sm:h-5 object-cover rounded-[2px] shadow-sm" />
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
              src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/2026_FIFA_World_Cup.svg/1200px-2026_FIFA_World_Cup.svg.png" 
              alt="Trophy" 
              className="object-contain w-full h-full drop-shadow-2xl opacity-90"
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
              
              <div className="flex flex-col gap-2 relative z-10 bg-[#0a2e15] items-end">
                {pair.map((team, i) => (
                  <div key={i} className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] sm:text-xs font-medium leading-none drop-shadow-md truncate">{team.name}</span>
                    <img src={team.flag} alt={team.name} className="w-6 h-4 sm:w-8 sm:h-5 object-cover rounded-[2px] shadow-sm" />
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
