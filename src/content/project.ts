export interface TeamMember {
  name: string;
  id: string;
  accent: 'cyan' | 'mint' | 'purple' | 'magenta';
}

export interface ProjectAdvisor {
  name: string;
  role: string;
}

export const PROJECT = {
  title: 'Smart Agent Based Platform for Penetration Testing',
  titleLines: ['Smart Agent Based', 'Platform for Penetration Testing'] as const,
  group: 'CS-22057',
  members: [
    { name: 'Rayyan Mirza', id: 'CR-22033', accent: 'cyan' },
    { name: 'Muhammad Umer', id: 'CR-22035', accent: 'mint' },
    { name: 'Faiq-uz-Zaman', id: 'CR-22040', accent: 'purple' },
    { name: 'Hashir Rahman Khan', id: 'CR-22046', accent: 'magenta' },
  ] satisfies TeamMember[],
  supervisor: {
    name: 'Dr. Muhammad Mubashir Khan',
    role: 'Chairman, CSIT- Project Advisor',
  } satisfies ProjectAdvisor,
  coSupervisor: {
    name: 'Ms. Saadia Arshad',
    role: 'Lecturer, CS & IT- Project Co-Advisor',
  } satisfies ProjectAdvisor,
} as const;
