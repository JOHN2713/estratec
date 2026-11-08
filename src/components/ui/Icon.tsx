import {
  AppWindow, Boxes, Compass, Contact, Gamepad2, MonitorSmartphone, Smartphone, Workflow,
  Zap, Network, Repeat, Target, Handshake, Trophy, Lightbulb, Layers, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Boxes, AppWindow, Smartphone, MonitorSmartphone, Workflow, Contact, Gamepad2, Compass,
  Zap, Network, Repeat, Target, Handshake, Trophy, Lightbulb, Layers,
};
export const ICON_NAMES = Object.keys(ICONS);

export function ServiceIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Layers;
  return <I className={className} aria-hidden="true" strokeWidth={1.75} />;
}
