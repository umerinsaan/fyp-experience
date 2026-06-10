/**
 * Trust boundary membrane — Pass 2.5 shader.
 * Cloud (ordered purple) vs edge (organic mint), ripple distortion on crossing.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ACCENTS } from '@/experience/narrative';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uRipple;
  uniform float uOpacity;
  uniform vec3 uCloudColor;
  uniform vec3 uEdgeColor;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    float rippleWave =
      sin(uv.y * 14.0 - uTime * 2.8 + uRipple * 9.0) * uRipple * 0.055 +
      sin(uv.y * 26.0 + uTime * 1.6 + uRipple * 5.0) * uRipple * 0.028;
    uv.x += rippleWave;

    float split = smoothstep(0.3, 0.7, uv.y + rippleWave * 1.8);
    vec3 col = mix(uEdgeColor, uCloudColor, split);

    float band = 1.0 - abs(uv.y - 0.5) * 2.0;
    band = pow(max(band, 0.0), 1.7);

    // Travelling scanline sweep — reads as an active boundary wall.
    float sweep = smoothstep(0.0, 0.04, abs(fract(uv.y * 2.0 - uTime * 0.22) - 0.5) * 0.5);
    float scan = 0.86 + sin(uv.y * 120.0 + uTime * 2.6) * 0.14;
    float fresnel = pow(band, 1.2);

    float alpha = uOpacity * fresnel * scan;
    alpha += (1.0 - sweep) * uOpacity * 0.35 * band;
    alpha += uRipple * 0.55 * fresnel;

    // Brighten the core toward white so the wall glows from inside.
    col = mix(col, vec3(0.92, 0.98, 1.0), fresnel * 0.35);

    gl_FragColor = vec4(col, alpha);
  }
`;

function makeUniforms() {
  return {
    uTime: { value: 0 },
    uRipple: { value: 0 },
    uOpacity: { value: 0 },
    uCloudColor: { value: new THREE.Color(ACCENTS.purple) },
    uEdgeColor: { value: new THREE.Color(ACCENTS.mint) },
  };
}

export interface TrustMembraneProps {
  rippleRef: React.MutableRefObject<number>;
  opacityRef: React.MutableRefObject<number>;
}

export function TrustMembrane({ rippleRef, opacityRef }: TrustMembraneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);

  const coreUniforms = useMemo(() => makeUniforms(), []);
  const glowUniforms = useMemo(() => makeUniforms(), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const op = opacityRef.current;
    group.visible = op > 0.006;
    if (!group.visible) return;

    const t = clock.getElapsedTime();
    const ripple = rippleRef.current;

    const core = matRef.current;
    if (core) {
      core.uniforms.uTime.value = t;
      core.uniforms.uRipple.value = ripple;
      core.uniforms.uOpacity.value = op;
    }

    const glow = glowMatRef.current;
    if (glow) {
      glow.uniforms.uTime.value = t;
      glow.uniforms.uRipple.value = ripple;
      glow.uniforms.uOpacity.value = op * 0.55;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh renderOrder={2}>
        <planeGeometry args={[6.6, 7.8, 1, 48]} />
        <shaderMaterial
          ref={matRef}
          args={[
            {
              uniforms: coreUniforms,
              vertexShader,
              fragmentShader,
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
              blending: THREE.AdditiveBlending,
            },
          ]}
        />
      </mesh>
      <mesh position={[0.05, 0, 0.03]} renderOrder={1}>
        <planeGeometry args={[7.4, 8.8, 1, 24]} />
        <shaderMaterial
          ref={glowMatRef}
          args={[
            {
              uniforms: glowUniforms,
              vertexShader,
              fragmentShader,
              transparent: true,
              depthWrite: false,
              side: THREE.DoubleSide,
              blending: THREE.AdditiveBlending,
            },
          ]}
        />
      </mesh>
    </group>
  );
}
