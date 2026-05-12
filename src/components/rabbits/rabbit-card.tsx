import { calculateAge, formatDate } from "@/lib/utils";
import { Weight, Calendar, Home, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditRabbitForm } from "@/components/forms/edit-rabbit-form";

interface Rabbit {
  id: string;
  name: string;
  identifiant: string;
  race: string;
  sexe: string;
  statut: string;
  poids: number | null;
  couleur: string | null;
  cageNumero: string | null;
  dateNaissance: string | null;
  notes: string | null;
}

const statusConfig = {
  actif: { label: "Actif", className: "bg-forest-100 text-forest-700 border-forest-200" },
  reproducteur: { label: "Reproducteur", className: "bg-sage-100 text-sage-600 border-sage-200" },
  vendu: { label: "Vendu", className: "bg-amber-100 text-amber-700 border-amber-200" },
  decede: { label: "Décédé", className: "bg-red-100 text-red-700 border-red-200" },
};

const sexeConfig = {
  male: { label: "♂ Mâle", className: "bg-blue-100 text-blue-700 border-blue-200" },
  femelle: { label: "♀ Femelle", className: "bg-pink-100 text-pink-700 border-pink-200" },
};

const raceColors: Record<string, string> = {
  "Néo-Zélandais": "from-slate-100 to-slate-50",
  "Californien": "from-orange-50 to-amber-50",
  "Géant Flamand": "from-stone-100 to-stone-50",
};

interface RabbitCardProps {
  rabbit: Rabbit;
  onClick?: () => void;
  onUpdate?: () => void;
}

export function RabbitCard({ rabbit, onClick, onUpdate }: RabbitCardProps) {
  const status = statusConfig[rabbit.statut as keyof typeof statusConfig] ?? statusConfig.actif;
  const sexe = sexeConfig[rabbit.sexe as keyof typeof sexeConfig] ?? sexeConfig.femelle;
  const gradientClass = raceColors[rabbit.race] || "from-cream-100 to-cream-50";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-earth-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5",
        "flex flex-col"
      )}
    >
      {/* Header with color gradient */}
      <div
        className={cn(
          "bg-gradient-to-br h-24 flex items-center justify-center relative",
          gradientClass
        )}
      >
        <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-3xl">🐇</span>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {onUpdate && (
            <EditRabbitForm rabbit={rabbit} onSuccess={onUpdate} />
          )}
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full border",
              status.className
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-foreground text-base">{rabbit.name}</h3>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                sexe.className
              )}
            >
              {sexe.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {rabbit.identifiant}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5 text-earth-400 flex-shrink-0" />
            <span>{rabbit.race}</span>
            <span className="ml-auto font-medium text-foreground">
              {rabbit.couleur}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-earth-400 flex-shrink-0" />
            <span>{rabbit.dateNaissance ? formatDate(rabbit.dateNaissance) : "—"}</span>
            <span className="ml-auto font-semibold text-forest-600">
              {rabbit.dateNaissance ? calculateAge(rabbit.dateNaissance) : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Weight className="h-3.5 w-3.5 text-earth-400 flex-shrink-0" />
            <span>Poids</span>
            <span className="ml-auto font-semibold text-foreground">
              {rabbit.poids} kg
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Home className="h-3.5 w-3.5 text-earth-400 flex-shrink-0" />
            <span>Cage</span>
            <span className="ml-auto font-semibold text-foreground">
              {rabbit.cageNumero}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
