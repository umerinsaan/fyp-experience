/**

 * Architecture act camera — nodes stay fixed; camera docks, travels edges, then zooms out.

 */

import * as THREE from 'three';

import {

  DIAGRAM_Z,

  nodeFocus,

  TRAVERSE_STEP_EDGES,

  traverseEdgeIndex,

  wideDiagramExtents,

} from '@/experience/canvas/scenes/architecture-layout';

import {

  ARCH_WIDE_ZOOM_FRAC,

  architectureEdgeProgress,

  architectureNodeStep,

  architectureNodeSubPhase,

  architecturePhase,

  architectureWideProgress,

} from '@/experience/architecture-phases';

import { ARCH_NODES } from '@/experience/narrative';

import { clamp01, easeInOutCubic, lerp, smoothstep } from '@/story/scroll-math';

import type { CameraPose } from '@/experience/act-model';



const NODE_COUNT = ARCH_NODES.length;

const DOCK_CAM_DISTANCE = 6.4;

/** Blend from last dock into wide during the opening of the wide phase. */
const WIDE_BLEND_FRAC = 0.18;



const _pos = new THREE.Vector3();

const _look = new THREE.Vector3();

const _curvePt = new THREE.Vector3();

const _nextPt = new THREE.Vector3();

const _dockPos = new THREE.Vector3();

const _dockLook = new THREE.Vector3();

const _widePos = new THREE.Vector3();

const _wideLook = new THREE.Vector3();

const _poseOut: CameraPose = { pos: _pos, look: _look, fov: 40 };



function dockPose(nodeIndex: number, fov = 34): void {

  const focus = nodeFocus(nodeIndex, _look);

  _pos.set(focus.x, focus.y, DIAGRAM_Z + DOCK_CAM_DISTANCE);

  _look.set(focus.x, focus.y, DIAGRAM_Z);

  _poseOut.fov = fov;

}



function edgeTravelPose(step: number, edgeT: number): void {

  const t = clamp01(edgeT);



  if (t < 0.05) {

    dockPose(step);

    return;

  }



  const nextStep = step >= NODE_COUNT - 1 ? 0 : step + 1;

  if (t > 0.92) {

    dockPose(nextStep);

    return;

  }



  const curve = TRAVERSE_STEP_EDGES[step]?.curve;

  if (!curve) {

    dockPose(step);

    return;

  }



  curve.getPoint(t, _curvePt);

  curve.getPoint(clamp01(t + 0.04), _nextPt);

  _pos.set(_curvePt.x, _curvePt.y, DIAGRAM_Z + DOCK_CAM_DISTANCE);

  _look.set(_nextPt.x, _nextPt.y, DIAGRAM_Z);

  _poseOut.fov = lerp(34, 33, t);

}



function widePose(t: number, outPos = _pos, outLook = _look): number {

  const ext = wideDiagramExtents();

  const zoomPhase = clamp01(t / ARCH_WIDE_ZOOM_FRAC);

  const zoomT = easeInOutCubic(smoothstep(0, 1, zoomPhase));

  const fov = lerp(35, 33.5, zoomT);

  const fovRad = (fov * Math.PI) / 180;

  const halfSpan = Math.max(ext.width * 0.5, ext.height * 0.52);

  const dist = (halfSpan / Math.tan(fovRad / 2)) * 0.92;



  outPos.set(ext.center.x, ext.center.y, DIAGRAM_Z + dist);

  outLook.set(ext.center.x, ext.center.y, DIAGRAM_Z);

  return fov;

}



/** Sample camera pose for architecture local progress 0..1. */

export function sampleArchitectureCameraPose(archLocal: number): CameraPose {

  const local = clamp01(archLocal);

  const phase = architecturePhase(local);



  if (phase === 'handoff' || phase === 'pullback') {

    dockPose(0, 34);

    return _poseOut;

  }



  if (phase === 'traverse') {

    const step = architectureNodeStep(local);

    const sub = architectureNodeSubPhase(local, step);



    if (sub === 'handoff') {

      edgeTravelPose(step, architectureEdgeProgress(local, traverseEdgeIndex(step)));

      return _poseOut;

    }



    dockPose(step, 34);

    return _poseOut;

  }



  if (phase === 'wide') {

    const t = architectureWideProgress(local);

    const wideFov = widePose(t, _widePos, _wideLook);



    if (t < WIDE_BLEND_FRAC) {

      dockPose(NODE_COUNT - 1, 34);

      _dockPos.copy(_pos);

      _dockLook.copy(_look);

      const blend = easeInOutCubic(smoothstep(0, 1, t / WIDE_BLEND_FRAC));

      _pos.lerpVectors(_dockPos, _widePos, blend);

      _look.lerpVectors(_dockLook, _wideLook, blend);

      _poseOut.fov = lerp(34, wideFov, blend);

      return _poseOut;

    }



    _pos.copy(_widePos);

    _look.copy(_wideLook);

    _poseOut.fov = wideFov;

    return _poseOut;

  }



  if (phase === 'finale') {

    widePose(1);

    return _poseOut;

  }



  dockPose(0);

  return _poseOut;

}

