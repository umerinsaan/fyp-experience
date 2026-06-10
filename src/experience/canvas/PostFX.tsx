/**
 * PostFX — scroll-driven bloom/vignette; DOF disabled during Act III (see postFxState).
 * Uses primitive effect objects so refs are not passed into wrapEffect (JSON.stringify crash).
 */
import { EffectComposer } from '@react-three/postprocessing';
import { BloomEffect, DepthOfFieldEffect, MaskFunction, NoiseEffect, VignetteEffect } from 'postprocessing';
import { BlendFunction } from 'postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { postFxState } from '@/experience/architecture-phases';

interface PostFXProps {
  progressRef: React.MutableRefObject<number>;
}

export function PostFX({ progressRef }: PostFXProps) {
  const { camera } = useThree();
  const mountAt = useMemo(() => performance.now(), []);

  const dof = useMemo(() => {
    const effect = new DepthOfFieldEffect(camera, {
      worldFocusDistance: 14,
      focusRange: 10,
      bokehScale: 0.85,
      height: 480,
    });
    const maskPass = (effect as unknown as { maskPass?: { maskFunction: MaskFunction } }).maskPass;
    if (maskPass) maskPass.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
    return effect;
  }, [camera]);

  const bloom = useMemo(
    () =>
      new BloomEffect({
        intensity: 0.36,
        luminanceThreshold: 0.8,
        luminanceSmoothing: 0.9,
        mipmapBlur: true,
        radius: 0.42,
      }),
    [],
  );

  const noise = useMemo(() => {
    const effect = new NoiseEffect({ blendFunction: BlendFunction.SOFT_LIGHT });
    effect.blendMode.opacity.value = 0.016;
    return effect;
  }, []);

  const vignette = useMemo(
    () => new VignetteEffect({ eskil: false, offset: 0.26, darkness: 0 }),
    [],
  );

  useEffect(() => {
    return () => {
      dof.dispose();
      bloom.dispose();
      noise.dispose();
      vignette.dispose();
    };
  }, [bloom, dof, noise, vignette]);

  useFrame(() => {
    const state = postFxState(progressRef.current);
    const warm = Math.min(1, (performance.now() - mountAt) / 900);

    bloom.intensity = state.bloomIntensity * warm;
    bloom.mipmapBlurPass.radius = state.bloomRadius;
    vignette.darkness = state.vignetteDarkness * warm;

    if (!dof.cocMaterial || !dof.blurPass) return;

    const active = state.dofStrength > 0.12;
    dof.blurPass.enabled = active;
    if (!active) return;

    try {
      dof.cocMaterial.focusDistance = state.worldFocusDistance;
      dof.cocMaterial.focusRange = state.focusRange;
      dof.bokehScale = state.bokehScale * state.dofStrength;
    } catch {
      dof.blurPass.enabled = false;
    }
  });

  return (
    <EffectComposer multisampling={4}>
      <primitive object={dof} />
      <primitive object={bloom} />
      <primitive object={noise} />
      <primitive object={vignette} />
    </EffectComposer>
  );
}
