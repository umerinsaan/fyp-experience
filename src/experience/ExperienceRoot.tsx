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
import { ImpactMetrics } from '@/experience/overlays/ImpactMetrics';
import { ProblemQuestionBeat } from '@/experience/overlays/ProblemQuestionBeat';
import { ToolSprawlOverlay } from '@/experience/overlays/ToolSprawlOverlay';
import { ToolOutputsOverlay } from '@/experience/overlays/ToolOutputsOverlay';
import { ReportBurdenOverlay } from '@/experience/overlays/ReportBurdenOverlay';
import { CostLoopOverlay } from '@/experience/overlays/CostLoopOverlay';
import { CostManualEffortOverlay } from '@/experience/overlays/CostManualEffortOverlay';
import { CostStitchOverlay } from '@/experience/overlays/CostStitchOverlay';
import { ObjectiveHumanOverlay } from '@/experience/overlays/ObjectiveHumanOverlay';
import { ObjectiveOrbitOverlay } from '@/experience/overlays/ObjectiveOrbitOverlay';
import { ArchitectureIntro } from '@/experience/overlays/ArchitectureBrief';
import { ArchitectureFinale } from '@/experience/overlays/ArchitectureFinale';
import { VisionFinale } from '@/experience/overlays/VisionFinale';
import { WorkflowBrief } from '@/experience/overlays/WorkflowBrief';
import { JobsOverlay } from '@/experience/overlays/JobsOverlay';
import { PipelineOverlay } from '@/experience/overlays/PipelineOverlay';
import { MitreOverlay } from '@/experience/overlays/MitreOverlay';
import { SmartOverlay } from '@/experience/overlays/SmartOverlay';
import { ArchitectureAudioDriver } from '@/experience/audio/ArchitectureAudioDriver';
import { HandoffAudioDriver } from '@/experience/audio/HandoffAudioDriver';
import { LandmarkAudioDriver } from '@/experience/audio/LandmarkAudioDriver';
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
      <ObjectiveHumanOverlay progress={progress} />
      <ObjectiveOrbitOverlay progress={progress} />
      <ComparisonBeat progress={progress} />
      <ArchitectureIntro progress={progress} />
      <ArchitectureFinale progress={progress} />
      <WorkflowBrief progress={progress} />
      <JobsOverlay progress={progress} />
      <PipelineOverlay progress={progress} />
      <MitreOverlay progress={progress} />
      <SmartOverlay progress={progress} />
      <ImpactMetrics progress={progress} />
      <VisionFinale progress={progress} />
      <ArchitectureAudioDriver />
      <HandoffAudioDriver />
      <LandmarkAudioDriver />
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
        aria-label="Below the Surface — an interactive briefing"
      >
        <div className="exp-sticky">
          <Stage reduced={!!reduce} />
        </div>
      </section>
      <Chrome />
    </ExperienceProvider>
  );
}
