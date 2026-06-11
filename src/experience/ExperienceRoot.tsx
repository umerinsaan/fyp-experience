/**
 * ExperienceRoot — one sticky viewport, native scroll, no parallax layers.
 */
import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ExperienceProvider, useExperience } from '@/experience/ExperienceContext';
import { CanvasErrorBoundary } from '@/experience/canvas/CanvasErrorBoundary';
import { ExperienceCanvas } from '@/experience/canvas/ExperienceCanvas';
import { AccentDriver } from '@/experience/overlays/AccentDriver';
import { ActCopy } from '@/experience/overlays/ActCopy';
import { ComparisonBeat } from '@/experience/overlays/ComparisonBeat';
import { HeroTitle } from '@/experience/overlays/HeroTitle';
import { ProblemQuestionBeat } from '@/experience/overlays/ProblemQuestionBeat';
import { ToolSprawlOverlay } from '@/experience/overlays/ToolSprawlOverlay';
import { ToolOutputsOverlay } from '@/experience/overlays/ToolOutputsOverlay';
import { ReportBurdenOverlay } from '@/experience/overlays/ReportBurdenOverlay';
import { CostLoopOverlay } from '@/experience/overlays/CostLoopOverlay';
import { CostManualEffortOverlay } from '@/experience/overlays/CostManualEffortOverlay';
import { CostStitchOverlay } from '@/experience/overlays/CostStitchOverlay';
import { ObjectiveOrbitOverlay } from '@/experience/overlays/ObjectiveOrbitOverlay';
import { ArchitectureFinale } from '@/experience/overlays/ArchitectureFinale';
import { ArchitectureScrimDriver } from '@/experience/overlays/ArchitectureScrimDriver';
import { TechnologiesStack } from '@/experience/overlays/TechnologiesStack';
import { JobsOverlay } from '@/experience/overlays/JobsOverlay';
import { PipelineOverlay } from '@/experience/overlays/PipelineOverlay';
import { SuggestionsOverlay } from '@/experience/overlays/SuggestionsOverlay';
import { RbacOverlay } from '@/experience/overlays/RbacOverlay';
import { ReportsOverlay } from '@/experience/overlays/ReportsOverlay';
import { DashboardOverlay } from '@/experience/overlays/DashboardOverlay';
import { FutureWorkOverlay } from '@/experience/overlays/FutureWorkOverlay';
import { FinaleOverlay } from '@/experience/overlays/FinaleOverlay';
import { VivaDemoDriver } from '@/experience/viva/VivaDemoDriver';
import { VivaShipCheck } from '@/experience/viva/VivaShipCheck';
import { KeyboardNavDriver } from '@/experience/KeyboardNavDriver';
import { Chrome } from '@/experience/ui/Chrome';
import { EXPERIENCE_SCROLL_VH } from '@/experience/narrative';

function Stage({ reduced }: { reduced: boolean }) {
  const { progress, progressRef } = useExperience();
  return (
    <>
      <div className="exp-stage">
        <CanvasErrorBoundary>
          <ExperienceCanvas progressRef={progressRef} reduced={reduced} />
        </CanvasErrorBoundary>
      </div>
      <div className="exp-scrim" />
      <AccentDriver progress={progress} />
      <HeroTitle progress={progress} />
      <CostManualEffortOverlay progress={progress} />
      <CostStitchOverlay progress={progress} />
      <ActCopy progress={progress} />
      <ProblemQuestionBeat progress={progress} />
      <ToolSprawlOverlay progress={progress} />
      <ToolOutputsOverlay progress={progress} />
      <ReportBurdenOverlay progress={progress} />
      <CostLoopOverlay progress={progress} />
      <ObjectiveOrbitOverlay progress={progress} />
      <ComparisonBeat progress={progress} />
      <ArchitectureFinale progress={progress} />
      <ArchitectureScrimDriver progress={progress} />
      <TechnologiesStack progress={progress} />
      <JobsOverlay progress={progress} />
      <PipelineOverlay progress={progress} />
      <SuggestionsOverlay progress={progress} />
      <RbacOverlay progress={progress} />
      <ReportsOverlay progress={progress} />
      <DashboardOverlay progress={progress} />
      <FutureWorkOverlay progress={progress} />
      <FinaleOverlay progress={progress} />
      <VivaDemoDriver />
      <KeyboardNavDriver />
      <VivaShipCheck />
    </>
  );
}

export function ExperienceRoot() {
  const rootRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  return (
    <ExperienceProvider targetRef={rootRef}>
      <section
        ref={rootRef}
        className="exp-root"
        style={{ height: `${EXPERIENCE_SCROLL_VH}vh` }}
        aria-label="Below the Surface — platform briefing"
      >
        <div className="exp-sticky">
          <Stage reduced={!!reduce} />
        </div>
      </section>
      <Chrome />
    </ExperienceProvider>
  );
}
