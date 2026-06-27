import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/ufc/fighters")({
  component: FightersPage,
});

const topFighters = [
  {
    name: "Jon Jones",
    nickname: "Bones",
    weightClass: "Heavyweight Champion",
    record: "27-1-0",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Jon_Jones_2013.jpg/330px-Jon_Jones_2013.jpg",
  },
  {
    name: "Islam Makhachev",
    nickname: "",
    weightClass: "Lightweight Champion",
    record: "25-1-0",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Islam_Makhachev_2021.jpg/330px-Islam_Makhachev_2021.jpg",
  },
  {
    name: "Leon Edwards",
    nickname: "Rocky",
    weightClass: "Welterweight Champion",
    record: "22-3-0",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Leon_Edwards_2021.jpg/330px-Leon_Edwards_2021.jpg",
  },
  {
    name: "Conor McGregor",
    nickname: "The Notorious",
    weightClass: "Lightweight",
    record: "22-6-0",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Conor_McGregor_2018.jpg/330px-Conor_McGregor_2018.jpg",
  },
  {
    name: "Rafael Fiziev",
    nickname: "Ataman",
    weightClass: "Lightweight",
    record: "12-3-0",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rafael_Fiziev.jpg/330px-Rafael_Fiziev.jpg",
  },
  {
    name: "Manuel Torres",
    nickname: "El Loco",
    weightClass: "Lightweight",
    record: "17-3-0",
    image: "/images/manuel_torres.png",
  },
];

function FightersPage() {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topFighters.map((fighter) => (
          <Card key={fighter.name} className="overflow-hidden bg-card/50 backdrop-blur hover:bg-card/80 transition-colors border-primary/20">
            <div className="aspect-square w-full relative overflow-hidden bg-muted/30">
              <img
                src={fighter.image}
                alt={fighter.name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-bold text-xl">{fighter.name}</h3>
                {fighter.nickname && (
                  <p className="text-primary text-sm font-medium">"{fighter.nickname}"</p>
                )}
              </div>
            </div>
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Division</span>
                <span className="text-sm">{fighter.weightClass}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Record</span>
                <Badge variant="secondary" className="mt-1 font-mono">{fighter.record}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
