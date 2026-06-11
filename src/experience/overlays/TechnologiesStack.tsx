/**
 * TechnologiesStack — explosion scatter, then simultaneous deal into scroll list.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { ACTS, TECHNOLOGIES, type TechnologyEntry } from '@/experience/narrative';
import { TECH_EXPLOSION_POSITIONS } from '@/experience/tech-explosion-layout';
import {
  TECH_BADGE_BURST,
  TECH_HEADLINE_FADE,
  TECH_HEADLINE_HOLD_END,
  TECH_HEADLINE_IN,
  TECH_HEADLINE_OUT,
  techBadgeBurstAt,
  techCardState,
  techDealPosition,
  techListLocal,
  techScrollLocal,
} from '@/experience/technologies-phases';
import { TechLogoGroup, techEntryColor } from '@/experience/ui/TechLogo';
import { clamp01, interp } from '@/story/scroll-math';

const TECH_BEAT = ACTS.find((a) => a.id === 'technologies')!.beats[0]!;

interface StagePoint {
  x: number;
  y: number;
}

export function TechnologiesStack({ progress }: { progress: MotionValue<number> }) {
  const { start, end } = actWindowById('technologies');
  const span = end - start;
  const explosionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [mounted, setMounted] = useState(false);
  const [local, setLocal] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scatterPts, setScatterPts] = useState<Record<string, StagePoint>>({});
  const [rowPts, setRowPts] = useState<Record<string, StagePoint>>({});
  const [stageCenter, setStageCenter] = useState<StagePoint>({ x: 0, y: 0 });
  const [maxScroll, setMaxScroll] = useState(0);

  const measure = useCallback(() => {
    const shell = explosionRef.current;
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!shell || !viewport || !list) return;

    const shellR = shell.getBoundingClientRect();
    setStageCenter({ x: shellR.width * 0.5, y: shellR.height * 0.5 });

    const nextScatter: Record<string, StagePoint> = {};
    for (const entry of TECHNOLOGIES) {
      const pos = TECH_EXPLOSION_POSITIONS[entry.key]!;
      nextScatter[entry.key] = {
        x: shellR.width * (parseFloat(pos.left) / 100),
        y: shellR.height * (parseFloat(pos.top) / 100),
      };
    }
    setScatterPts(nextScatter);

    const nextRows: Record<string, StagePoint> = {};
    TECHNOLOGIES.forEach((entry, i) => {
      const row = rowRefs.current[i];
      const head = row?.querySelector('.exp-tech-row__head');
      if (!head) return;
      const headR = head.getBoundingClientRect();
      nextRows[entry.key] = {
        x: headR.left - shellR.left + 20,
        y: headR.top - shellR.top + headR.height / 2,
      };
    });
    setRowPts(nextRows);

    setMaxScroll(Math.max(0, list.scrollHeight - viewport.clientHeight + 48));
  }, []);

  useLayoutEffect(() => {
    measure();
    const raf = requestAnimationFrame(() => measure());
    const ro = new ResizeObserver(() => measure());
    if (explosionRef.current) ro.observe(explosionRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (listRef.current) ro.observe(listRef.current);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, mounted]);

  const applyProgress = useCallback(
    (p: number) => {
      if (p < start || p >= end) {
        setMounted(false);
        setOpacity(0);
        setLocal(0);
        setTranslateY(0);
        return;
      }
      setMounted(true);
      const actLocal = clamp01((p - start) / span);
      const listLocal = techListLocal(actLocal);
      const scrollL = techScrollLocal(listLocal);
      const fadeIn = interp(actLocal, [0, 0.035], [0.92, 1]);
      const fadeOut = interp(actLocal, [0.94, 1], [1, 0]);
      setOpacity(fadeIn * fadeOut);
      setLocal(actLocal);
      setTranslateY(-scrollL * maxScroll);
    },
    [start, end, span, maxScroll],
  );

  useMotionValueEvent(progress, 'change', applyProgress);

  useLayoutEffect(() => {
    applyProgress(progress.get());
    if (mounted) measure();
  }, [applyProgress, maxScroll, measure, mounted, progress]);

  if (!mounted) return null;

  return (
    <>
      <div className="exp-tech-headline-wrap" aria-hidden>
        <TechHeadline progress={progress} start={start} span={span} />
      </div>
      <div ref={explosionRef} className="exp-tech-explosion-wrap" style={{ opacity }} aria-hidden>
        {TECHNOLOGIES.map((entry, index) => (
          <TechFlyingCard
            key={`fly-${entry.key}`}
            entry={entry}
            index={index}
            local={local}
            center={stageCenter}
            scatter={scatterPts[entry.key]}
            target={rowPts[entry.key]}
          />
        ))}
      </div>
      <div className="exp-tech-stack" style={{ opacity }} aria-hidden>
        <div ref={stageRef} className="exp-tech-stack__stage">
        <div ref={viewportRef} className="exp-tech-stack__viewport">
          <ul ref={listRef} className="exp-tech-stack__list" style={{ transform: `translateY(${translateY}px)` }}>
            {TECHNOLOGIES.map((entry, index) => (
              <TechRow
                key={entry.key}
                entry={entry}
                index={index}
                local={local}
                setRef={(el) => {
                  rowRefs.current[index] = el;
                }}
              />
            ))}
          </ul>
        </div>
        </div>
      </div>
    </>
  );
}

function renderTechHeadline() {
  const { text, accentText } = TECH_BEAT;
  if (!accentText || !text.includes(accentText)) return text;
  const [before, after] = text.split(accentText);
  return (
    <>
      {before}
      <span className="exp-accent">{accentText}</span>
      {after}
    </>
  );
}

function TechHeadline({
  progress,
  start,
  span,
}: {
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  const reduce = useReducedMotion();
  const inAt = start + span * TECH_HEADLINE_IN;
  const outStart = start + span * TECH_HEADLINE_HOLD_END;
  const outEnd = start + span * TECH_HEADLINE_OUT;
  const range = [inAt, inAt + span * TECH_HEADLINE_FADE, outStart, outEnd];
  const [headOpacity, setHeadOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setHeadOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (headOpacity < 0.02) return null;
  const lift = (1 - headOpacity) * (reduce ? 0 : 14);

  return (
    <div
      className="exp-tech-explosion__headline"
      style={{ opacity: headOpacity, transform: `translateY(${lift}px)` }}
    >
      {TECH_BEAT.kicker ? <span className="exp-kicker">{TECH_BEAT.kicker}</span> : null}
      <p className="exp-line exp-line--lead">{renderTechHeadline()}</p>
    </div>
  );
}

function TechFlyingCard({
  entry,
  index,
  local,
  center,
  scatter,
  target,
}: {
  entry: TechnologyEntry;
  index: number;
  local: number;
  center: StagePoint;
  scatter?: StagePoint;
  target?: StagePoint;
}) {
  const reduce = useReducedMotion();
  const burstAt = techBadgeBurstAt(index);
  let burstT = 0;
  if (local >= burstAt) burstT = clamp01((local - burstAt) / TECH_BADGE_BURST);

  const card = techCardState(local, index, burstT);
  if (card.phase === 'dealt') return null;

  const listStarted = techListLocal(local) > 0;
  const color = techEntryColor(entry.logos);
  let x = center.x;
  let y = center.y;
  let rotate = 0;
  let scale = 0.35 + burstT * 0.65;
  let cardOpacity = interp(burstT, [0, 0.35, 1], [0, 1, 1]);
  let pillFade = 0;
  let nameFade = 0;

  if (card.phase === 'dealing' && scatter) {
    if (target) {
      const pos = techDealPosition(scatter, target, card.dealT);
      x = pos.x;
      y = pos.y;
      rotate = pos.rotate;
      scale = pos.scale;
      pillFade = pos.pillFade;
      nameFade = pos.nameFade;
      cardOpacity = 1 - interp(card.dealT, [0.78, 0.96], [0, 1]);
    } else {
      x = scatter.x;
      y = scatter.y;
      scale = 1;
      cardOpacity = 1;
    }
  } else if (card.phase === 'scatter' && scatter) {
    x = scatter.x;
    y = scatter.y;
    scale = 1;
    cardOpacity = 1;
  } else if (scatter) {
    const scatterX = scatter.x;
    const scatterY = scatter.y;
    if (listStarted) {
      x = scatterX;
      y = scatterY;
      scale = 1;
      cardOpacity = 1;
    } else {
      x = center.x + (scatterX - center.x) * burstT;
      y = center.y + (scatterY - center.y) * burstT;
    }
  }

  const dur = 5.5 + (index % 4) * 1.1;
  const delay = -(index * 0.75);
  const floatClass =
    !reduce && card.phase === 'scatter' && !listStarted ? ' exp-tech-badge--float' : '';

  return (
    <span
      className={`exp-tech-badge${floatClass}`}
      style={{
        left: x,
        top: y,
        opacity: cardOpacity,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
        animationDuration: floatClass ? `${dur}s` : undefined,
        animationDelay: floatClass ? `${delay}s` : undefined,
        ['--tech-color' as string]: color,
        ['--tech-pill-fade' as string]: String(pillFade),
        ['--tech-name-fade' as string]: String(nameFade),
        zIndex: card.phase === 'dealing' ? 6 : 3,
      }}
    >
      <span className="exp-tech-badge__icon">
        <TechLogoGroup ids={entry.logos} size={28} />
      </span>
      <span className="exp-tech-badge__name">{entry.label}</span>
    </span>
  );
}

function TechRow({
  entry,
  index,
  local,
  setRef,
}: {
  entry: TechnologyEntry;
  index: number;
  local: number;
  setRef: (el: HTMLLIElement | null) => void;
}) {
  const burstAt = techBadgeBurstAt(index);
  const burstT = local >= burstAt ? clamp01((local - burstAt) / TECH_BADGE_BURST) : 0;
  const card = techCardState(local, index, burstT);
  const dealt = card.phase === 'dealt';
  const dealing = card.phase === 'dealing';
  const headOpacity = dealt ? 1 : dealing ? interp(card.dealT, [0.38, 0.82], [0, 1]) : 0;
  const bodyOpacity = dealt ? 1 : dealing ? interp(card.dealT, [0.52, 0.92], [0, 1]) : 0;

  return (
    <li
      ref={setRef}
      className={`exp-tech-row${dealt ? ' exp-tech-row--dealt' : ''}${dealing ? ' exp-tech-row--dealing' : ''}`}
    >
      <div className="exp-tech-row__head" style={{ opacity: headOpacity }}>
        <span className="exp-tech-row__icon" style={{ ['--tech-color' as string]: techEntryColor(entry.logos) }}>
          <TechLogoGroup ids={entry.logos} size={26} />
        </span>
        <span className="exp-tech-row__label">{entry.label}</span>
      </div>
      <div className="exp-tech-row__body" style={{ opacity: bodyOpacity }} aria-hidden={!(dealt || dealing)}>
        <dl className="exp-tech-detail__grid">
          <div className="exp-tech-detail__row">
            <dt>Summary</dt>
            <dd>{entry.summary}</dd>
          </div>
          <div className="exp-tech-detail__row">
            <dt>Impact</dt>
            <dd>{entry.impact}</dd>
          </div>
          <div className="exp-tech-detail__row">
            <dt>Why we chose it</dt>
            <dd>{entry.rationale}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
