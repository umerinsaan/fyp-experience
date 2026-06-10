/**
 * Animated SVG threads — Platform hub to chips, tools, and formats.
 */
import { useReducedMotion } from 'framer-motion';
import {
  ORBIT_CHIP_SLOTS,
  ORBIT_FORMAT_SLOTS,
  ORBIT_HUB_POINT,
  ORBIT_TOOL_SLOTS,
  nearestFormatForTool,
  nearestToolForChip,
  orbitCurvePath,
  orbitPointPercent,
} from '@/experience/objective-orbit-layout';

interface OrbitLinksProps {
  hubOp: number;
  chipOp: number;
  toolOp: number;
  formatOp: number;
}

interface LinkDef {
  id: string;
  d: string;
  tier: 'hub-chip' | 'hub-tool' | 'chip-tool' | 'tool-format';
  opacity: number;
  delay: number;
  dur: number;
}

function buildLinks(hubOp: number, chipOp: number, toolOp: number, formatOp: number): LinkDef[] {
  const links: LinkDef[] = [];

  ORBIT_CHIP_SLOTS.forEach((slot, i) => {
    const chipPt = orbitPointPercent(slot);
    links.push({
      id: `hub-chip-${i}`,
      d: orbitCurvePath(ORBIT_HUB_POINT, chipPt, 0.14),
      tier: 'hub-chip',
      opacity: hubOp * chipOp * 0.85,
      delay: i * 0.35,
      dur: 2.6 + (i % 3) * 0.4,
    });
  });

  ORBIT_TOOL_SLOTS.forEach((slot, i) => {
    const toolPt = orbitPointPercent(slot);
    links.push({
      id: `hub-tool-${i}`,
      d: orbitCurvePath(ORBIT_HUB_POINT, toolPt, 0.1),
      tier: 'hub-tool',
      opacity: hubOp * toolOp * 0.42,
      delay: 0.2 + i * 0.22,
      dur: 3.0 + (i % 4) * 0.35,
    });
  });

  ORBIT_CHIP_SLOTS.forEach((chipSlot, i) => {
    const toolIdx = nearestToolForChip(i);
    const chipPt = orbitPointPercent(chipSlot);
    const toolPt = orbitPointPercent(ORBIT_TOOL_SLOTS[toolIdx]);
    links.push({
      id: `chip-tool-${i}-${toolIdx}`,
      d: orbitCurvePath(chipPt, toolPt, 0.18),
      tier: 'chip-tool',
      opacity: chipOp * toolOp * 0.72,
      delay: 0.5 + i * 0.4,
      dur: 2.8 + (i % 2) * 0.5,
    });
  });

  ORBIT_TOOL_SLOTS.forEach((toolSlot, i) => {
    const formatIdx = nearestFormatForTool(i);
    const toolPt = orbitPointPercent(toolSlot);
    const formatPt = orbitPointPercent(ORBIT_FORMAT_SLOTS[formatIdx]);
    links.push({
      id: `tool-format-${i}-${formatIdx}`,
      d: orbitCurvePath(toolPt, formatPt, 0.2),
      tier: 'tool-format',
      opacity: toolOp * formatOp * 0.68,
      delay: 0.8 + i * 0.28,
      dur: 3.2 + (i % 3) * 0.45,
    });
  });

  return links.filter((l) => l.opacity >= 0.03);
}

export function ObjectiveOrbitLinks({ hubOp, chipOp, toolOp, formatOp }: OrbitLinksProps) {
  const reduce = useReducedMotion();
  const links = buildLinks(hubOp, chipOp, toolOp, formatOp);
  const shellOp = Math.max(hubOp, chipOp, toolOp, formatOp);

  if (shellOp < 0.02 || links.length === 0) return null;

  return (
    <svg
      className="exp-objective-orbit__links"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {links.map((link) => (
        <path
          key={link.id}
          d={link.d}
          pathLength={1}
          className={
            reduce
              ? `exp-objective-orbit__path exp-objective-orbit__path--${link.tier}`
              : `exp-objective-orbit__path exp-objective-orbit__path--${link.tier} exp-objective-orbit__path--flow`
          }
          style={{
            opacity: link.opacity,
            ['--link-dur' as string]: `${link.dur}s`,
            ['--link-delay' as string]: `${link.delay}s`,
          }}
        />
      ))}
    </svg>
  );
}
