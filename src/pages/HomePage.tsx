import { useEffect } from 'react';
import { ExperienceRoot } from '@/experience/ExperienceRoot';
import { PROJECT } from '@/content/project';

export function HomePage() {
  useEffect(() => {
    document.title = `${PROJECT.title} · ${PROJECT.group}`;
  }, []);

  return <ExperienceRoot />;
}
