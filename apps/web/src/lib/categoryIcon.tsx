import {
  Monitor,
  Tv,
  Flower2,
  Armchair,
  Sofa,
  Lamp,
  Music,
  UtensilsCrossed,
  PartyPopper,
  Tent,
  Camera,
  Wine,
  ChefHat,
  Table,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/**
 * Map of category `iconName` (stored as a plain string in the DB) → a Lucide
 * icon component. Shared by the catalog page and the homepage CategoryCard so
 * the two never drift apart.
 */
export const categoryIconMap: Record<string, LucideIcon> = {
  monitor: Monitor,
  tv: Tv,
  television: Tv,
  flower: Flower2,
  flower2: Flower2,
  sprout: Flower2,
  armchair: Armchair,
  chair: Armchair,
  sofa: Sofa,
  couch: Sofa,
  lamp: Lamp,
  light: Lamp,
  music: Music,
  audio: Music,
  sound: Music,
  utensils: UtensilsCrossed,
  food: UtensilsCrossed,
  catering: UtensilsCrossed,
  party: PartyPopper,
  celebration: PartyPopper,
  tent: Tent,
  outdoor: Tent,
  camera: Camera,
  photo: Camera,
  wine: Wine,
  drinks: Wine,
  bar: Wine,
  chef: ChefHat,
  kitchen: ChefHat,
  table: Table,
  furniture: Table,
  sparkles: Sparkles,
  decor: Sparkles,
  decoration: Sparkles,
};

/** Resolve a category icon name to its Lucide component, if one is mapped. */
export function resolveCategoryIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return categoryIconMap[name.toLowerCase()] ?? null;
}

/** Renders the mapped Lucide icon for a category, or nothing if unmapped. */
export function CategoryIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = resolveCategoryIcon(name);
  if (!Icon) return null;
  return <Icon className={className || 'h-4 w-4'} />;
}
