/**

 * CameraRig — cinematic dolly. Smoothly eases toward scroll keyframes so moves

 * feel deliberate, not snapped or handheld.

 */

import { useFrame, useThree } from '@react-three/fiber';

import { useMemo, useRef } from 'react';

import * as THREE from 'three';

import { sampleCameraPose } from '@/experience/act-model';
import { architectureCameraDampStrength } from '@/experience/architecture-phases';



interface CameraRigProps {

  progressRef: React.MutableRefObject<number>;

}



export function CameraRig({ progressRef }: CameraRigProps) {

  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const look = useMemo(() => new THREE.Vector3(0, 0, -3.8), []);

  const targetLook = useMemo(() => new THREE.Vector3(), []);

  const targetPos = useMemo(() => new THREE.Vector3(), []);

  const fovRef = useRef(camera.fov);



  useFrame((_, delta) => {

    const p = progressRef.current;
    const pose = sampleCameraPose(p);

    const dampStrength = architectureCameraDampStrength(p);
    const damp = 1 - Math.exp(-dampStrength * Math.min(delta, 0.05));



    targetPos.copy(pose.pos);

    targetLook.copy(pose.look);

    camera.position.lerp(targetPos, damp);

    look.lerp(targetLook, damp);

    camera.lookAt(look);



    fovRef.current = THREE.MathUtils.lerp(fovRef.current, pose.fov, damp);

    if (Math.abs(camera.fov - fovRef.current) > 0.02) {

      camera.fov = fovRef.current;

      camera.updateProjectionMatrix();

    }

  });



  return null;

}


