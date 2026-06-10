/**
 * ExperienceCanvas — the one and only WebGL context for the whole film.
 * Hosts the camera rig, shared atmosphere, every act scene (self-hiding by
 * scroll window), and the post-processing grade. Signals the preloader when
 * the first frame is on screen.
 */
import { Canvas } from '@react-three/fiber';
import { memo, Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePreload } from '@/app/PreloadContext';
import { CANVAS_CLEAR } from '@/experience/canvas/canvas-theme';
import { Atmosphere } from '@/experience/canvas/Atmosphere';
import { CameraRig } from '@/experience/canvas/CameraRig';
import { PostFX } from '@/experience/canvas/PostFX';
import { HeroScene } from '@/experience/canvas/scenes/HeroScene';
import { ProblemScene } from '@/experience/canvas/scenes/ProblemScene';
import { CostScene } from '@/experience/canvas/scenes/CostScene';
import { ObjectiveScene } from '@/experience/canvas/scenes/ObjectiveScene';
import { ArchitectureScene } from '@/experience/canvas/scenes/ArchitectureScene';
import { WorkflowScene } from '@/experience/canvas/scenes/WorkflowScene';
import { AgentScene } from '@/experience/canvas/scenes/AgentScene';
import { JobsScene } from '@/experience/canvas/scenes/JobsScene';
import { PipelineScene } from '@/experience/canvas/scenes/PipelineScene';
import { MitreScene } from '@/experience/canvas/scenes/MitreScene';
import { SmartScene } from '@/experience/canvas/scenes/SmartScene';
import { VisionScene } from '@/experience/canvas/scenes/VisionScene';

interface ExperienceCanvasProps {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}

/** Memoized — act/overlays re-render on chapter change; WebGL tree must stay mounted. */
export const ExperienceCanvas = memo(function ExperienceCanvas({ progressRef, reduced = false }: ExperienceCanvasProps) {
  const { signalWebGLReady } = usePreload();
  const signaled = useRef(false);
  const [postFxReady, setPostFxReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPostFxReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleCreated = ({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) => {
    gl.setClearColor(CANVAS_CLEAR, 1);
    scene.background = new THREE.Color(CANVAS_CLEAR);
    if (signaled.current) return;
    signaled.current = true;
    requestAnimationFrame(() => requestAnimationFrame(() => signalWebGLReady()));
  };

  return (
    <Canvas
      className="exp-canvas"
      camera={{ position: [0, 0.4, 9.2], fov: 46, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={handleCreated}
    >
      <Suspense fallback={null}>
        <Atmosphere progressRef={progressRef} reduced={reduced} />
        <CameraRig progressRef={progressRef} />

        <HeroScene progressRef={progressRef} />
        <ProblemScene progressRef={progressRef} />
        <CostScene progressRef={progressRef} />
        <ObjectiveScene progressRef={progressRef} />
        <ArchitectureScene progressRef={progressRef} reduced={reduced} />
        <WorkflowScene progressRef={progressRef} reduced={reduced} />
        <AgentScene progressRef={progressRef} reduced={reduced} />
        <JobsScene progressRef={progressRef} />
        <PipelineScene progressRef={progressRef} />
        <MitreScene progressRef={progressRef} />
        <SmartScene progressRef={progressRef} />
        <VisionScene progressRef={progressRef} />

        {!reduced && postFxReady ? <PostFX progressRef={progressRef} /> : null}
      </Suspense>
    </Canvas>
  );
});
