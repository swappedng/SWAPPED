import {
  Layers,
  CardSim,
  BatteryPlus,
  ScanFace,
  Smartphone,
  Phone,
  RectangleVertical as MirrorRectangular,
} from 'lucide-react';

export function getGroupIcon(key: string, label: string) {
  const k = (key || '').toUpperCase();
  const l = (label || '').toLowerCase();

  if (k.includes('SIM') || l.includes('sim')) return CardSim;
  if (k.includes('BATTERY') || l.includes('battery')) return BatteryPlus;
  if (k.includes('FACE') || l.includes('face')) return ScanFace;
  if (k.includes('BACK') || k.includes('GLASS') || l.includes('back') || l.includes('glass')) return MirrorRectangular;
  if (k.includes('SCREEN') || l.includes('screen') || l.includes('display')) return Smartphone;
  if (k.includes('BODY') || l.includes('body') || l.includes('neatness')) return Phone;

  return Layers;
}
