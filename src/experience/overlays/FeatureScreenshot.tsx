/**
 * FeatureScreenshot — fixed-frame UI screenshot for key-feature acts.
 */
import { useState } from 'react';
import { screenshotSrc, type FeatureScreenshotSpec } from '@/content/key-features';
import { ACCENTS, type AccentKey, type ActId } from '@/experience/narrative';

interface FeatureScreenshotProps {
  actId: ActId;
  accent: AccentKey;
  spec: FeatureScreenshotSpec;
}

export function FeatureScreenshot({ accent, spec }: FeatureScreenshotProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const src = screenshotSrc(spec.filename);
  const fit = spec.fit ?? 'cover';
  const fitClass = fit === 'contain' ? 'exp-feature__shot-img--contain' : 'exp-feature__shot-img--cover';

  return (
    <figure className="exp-feature__shot" style={{ ['--feat-accent' as string]: ACCENTS[accent] }} aria-hidden>
      <div className={`exp-feature__shot-frame${fit === 'contain' ? ' exp-feature__shot-frame--contain' : ''}`}>
        {failed || !loaded ? (
          <div className="exp-feature__shot-placeholder" aria-hidden={loaded}>
            <span className="exp-feature__shot-label">Screenshot</span>
            <code className="exp-feature__shot-filename">{spec.filename}</code>
            <p className="exp-feature__shot-caption">{spec.caption}</p>
          </div>
        ) : null}
        <img
          src={src}
          alt={spec.alt}
          className={`exp-feature__shot-img ${fitClass}`}
          loading="eager"
          decoding="async"
          style={{ opacity: loaded && !failed ? 1 : 0 }}
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      </div>
    </figure>
  );
}
