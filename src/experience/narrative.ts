/**
 * Narrative architecture — single source of truth for the cinematic experience.
 *
 * The whole site is one continuous scroll mapped to global progress 0..1.
 * Each ACT owns a slice of that progress, a dominant accent, a 3D "set",
 * and a sequence of typographic beats revealed one line at a time.
 *
 * Scroll budget is intentional (see DESIGN: cinematic pacing). Architecture
 * is the climax; the four key-feature acts each get room to breathe; the
 * problem/objective arc sets up why the platform exists.
 */

export type AccentKey = 'cyan' | 'mint' | 'purple' | 'magenta' | 'amber';

export const ACCENTS: Record<AccentKey, string> = {
  cyan: '#06b6d4',
  mint: '#2dd4bf',
  purple: '#8b5cf6',
  magenta: '#d946ef',
  amber: '#f59e0b',
};

/** Slightly deeper variants for text/edges where the base accent is too light on white. */
export const ACCENTS_DEEP: Record<AccentKey, string> = {
  cyan: '#0e7490',
  mint: '#0d9488',
  purple: '#7c3aed',
  magenta: '#a21caf',
  amber: '#b45309',
};

export type ActId =
  | 'hero'
  | 'problem'
  | 'cost'
  | 'objective'
  | 'architecture'
  | 'workflow'
  | 'agent'
  | 'jobs'
  | 'pipeline'
  | 'mitre'
  | 'smart'
  | 'impact'
  | 'vision';

export interface Beat {
  /** Optional small mono label above the line. */
  kicker?: string;
  /** The line itself. Keep to one sentence. */
  text: string;
  /** Visual weight. `hero` = giant keynote headline; `body` = supporting sentence. */
  weight?: 'hero' | 'lead' | 'body';
  /** Emphasized words rendered in the act accent. */
  accentText?: string;
  /** When true, kicker renders as em-dash attribution below the line (quotes). */
  isQuote?: boolean;
}

export interface Act {
  id: ActId;
  /** Act numeral shown in chrome, e.g. "I". Empty hides it. */
  numeral: string;
  /** Short name shown in the progress rail. */
  name: string;
  /** The single question this act answers. */
  question: string;
  accent: AccentKey;
  /** Fraction of total scroll this act occupies. Must sum to 1 across all acts. */
  weight: number;
  beats: Beat[];
}

/**
 * Pacing allocation (sums to 1.0):
 * hero .07 · problem .10 · cost .07 · objective .12 · architecture .17
 * · workflow .06 · agent .06 · jobs .08 · pipeline .07 · mitre .08
 * · smart .09 · impact .04 · vision .02
 *
 * Architecture remains the climax; the four key-feature acts each get a
 * dedicated, meaningful 3D beat.
 */
export const ACTS: readonly Act[] = [
  {
    id: 'hero',
    numeral: '',
    name: 'Prologue',
    question: 'What is this?',
    accent: 'cyan',
    weight: 0.07,
    beats: [
      {
        kicker: 'Below the Surface',
        text: 'Security work was never meant to feel this fragmented.',
        weight: 'hero',
        accentText: 'fragmented',
      },
    ],
  },
  {
    id: 'problem',
    numeral: 'I',
    name: 'The Problem',
    question: 'Why is penetration testing painful?',
    accent: 'magenta',
    weight: 0.1,
    beats: [
      {
        kicker: 'Act I — Tool sprawl',
        text: 'Every day, security analysts juggle between so many disconnected tools.',
        weight: 'lead',
        accentText: 'disconnected tools.',
      },
      {
        kicker: 'Act I — Format chaos',
        text: 'Some tools speak XML. Some output JSON. Some hand back CSV.',
        weight: 'lead',
        accentText: 'XML. Some output JSON. Some hand back CSV.',
      },
      {
        text: 'Nothing shares a structure.',
        weight: 'hero',
        accentText: 'Nothing shares a structure.',
      },
      {
        text: 'And when the work is done — you write the report from scratch.',
        weight: 'lead',
        accentText: 'from scratch.',
      },
    ],
  },
  {
    id: 'cost',
    numeral: 'I',
    name: 'The Cost',
    question: 'What does the fragmentation cost?',
    accent: 'magenta',
    weight: 0.07,
    beats: [
      { kicker: 'Act I — The cost', text: 'So the work repeats.', weight: 'hero', accentText: 'repeats.' },
      {
        text: 'Every step in between takes manual effort.',
        weight: 'lead',
        accentText: 'manual effort.',
      },
      {
        text: 'Hours go to stitching tools together — not to finding risk.',
        weight: 'lead',
        accentText: 'not to finding risk.',
      },
      {
        text: 'Same chain. Every subnet, every client, every quarter.',
        weight: 'lead',
        accentText: 'Same chain.',
      },
    ],
  },
  {
    id: 'objective',
    numeral: 'II',
    name: 'Our Objective',
    question: 'So what are we actually trying to do?',
    accent: 'cyan',
    weight: 0.12,
    beats: [
      { kicker: 'Act II — The intent', text: 'We are not replacing the pentester.', weight: 'hero', accentText: 'not replacing' },
      {
        text: 'The craft, the judgement, the instinct — those stay human.',
        weight: 'lead',
        accentText: 'stay human.',
      },
      {
        text: 'We remove the redundant work that surrounds it.',
        weight: 'lead',
        accentText: 'redundant work',
      },
      {
        text: 'So we built one.',
        weight: 'hero',
        accentText: 'one.',
      },
      {
        text: 'A job-driven system — configured tools and commands, one click to run.',
        weight: 'lead',
        accentText: 'one click',
      },
      {
        text: 'Chain jobs into pipelines. MITRE mapping, remediation, and reports — built in.',
        weight: 'lead',
        accentText: 'built in.',
      },
    ],
  },
  {
    id: 'architecture',
    numeral: 'III',
    name: 'Architecture',
    question: 'How does the whole system fit together?',
    accent: 'purple',
    weight: 0.17,
    beats: [
      {
        text: 'A single platform — cloud control, edge execution.',
        weight: 'lead',
        accentText: 'cloud control, edge execution.',
      },
      {
        text: 'Every layer carries context to the next.',
        weight: 'lead',
        accentText: 'carries context',
      },
      {
        text: 'A platform is not a collection of tools.',
        weight: 'hero',
        accentText: 'not a collection of tools.',
      },
      {
        text: 'It is a shared system of intelligence.',
        weight: 'lead',
        accentText: 'shared system of intelligence.',
      },
    ],
  },
  {
    id: 'workflow',
    numeral: 'III',
    name: 'Workflow',
    question: 'What does the workflow become?',
    accent: 'mint',
    weight: 0.06,
    beats: [
      {
        kicker: 'Act III — The flow',
        text: 'Every test becomes one connected flow.',
        weight: 'lead',
        accentText: 'one connected flow.',
      },
    ],
  },
  {
    id: 'agent',
    numeral: 'III',
    name: 'The Agent',
    question: 'What does the agent actually do?',
    accent: 'mint',
    weight: 0.06,
    beats: [
      { kicker: 'Act III — The edge', text: 'At the edge, agents do the work.', weight: 'hero', accentText: 'agents' },
      {
        text: 'Dispatched, distributed — reporting back as one.',
        weight: 'lead',
        accentText: 'as one.',
      },
    ],
  },
  {
    id: 'jobs',
    numeral: 'IV',
    name: 'Jobs Engine',
    question: 'How do hundreds of tools share one system?',
    accent: 'purple',
    weight: 0.08,
    beats: [
      { kicker: 'Act IV — Key feature 01', text: 'We did not hand-code every scan.', weight: 'hero', accentText: 'every scan.' },
      {
        text: 'One JSON schema describes any tool.',
        weight: 'lead',
        accentText: 'any tool.',
      },
      {
        text: 'Validated, resolved, dispatched — configurable, never unsafe.',
        weight: 'lead',
        accentText: 'never unsafe.',
      },
    ],
  },
  {
    id: 'pipeline',
    numeral: 'IV',
    name: 'Pipeline Designer',
    question: 'How do you chain work without code?',
    accent: 'cyan',
    weight: 0.07,
    beats: [
      { kicker: 'Act IV — Key feature 02', text: 'Draw the engagement as a graph.', weight: 'hero', accentText: 'a graph.' },
      {
        text: 'Fork to run in parallel. Join to wait for proof.',
        weight: 'lead',
        accentText: 'in parallel.',
      },
    ],
  },
  {
    id: 'mitre',
    numeral: 'IV',
    name: 'MITRE & Remediation',
    question: 'How does a raw finding become a fix?',
    accent: 'magenta',
    weight: 0.08,
    beats: [
      { kicker: 'Act IV — Key feature 03', text: 'Every finding gets its context.', weight: 'hero', accentText: 'its context.' },
      {
        text: 'Mapped to MITRE ATT&CK. Scored by real-world risk.',
        weight: 'lead',
        accentText: 'MITRE ATT&CK.',
      },
      {
        text: 'Then matched to a ranked, verifiable remediation.',
        weight: 'lead',
        accentText: 'remediation.',
      },
    ],
  },
  {
    id: 'smart',
    numeral: 'IV',
    name: 'Smart Behavior',
    question: 'Is it a black box?',
    accent: 'mint',
    weight: 0.09,
    beats: [
      { kicker: 'Act IV — Key feature 04', text: 'The platform reasons. You decide.', weight: 'hero', accentText: 'You decide.' },
      {
        text: 'A rule engine suggests the next move — never hides why.',
        weight: 'lead',
        accentText: 'never hides why.',
      },
      {
        text: 'Every recommendation traces back to a rule you can read.',
        weight: 'lead',
        accentText: 'a rule you can read.',
      },
    ],
  },
  {
    id: 'impact',
    numeral: 'V',
    name: 'Impact',
    question: 'What changes after implementation?',
    accent: 'amber',
    weight: 0.04,
    beats: [
      { kicker: 'Act V — The outcome', text: 'Consistent. Repeatable. Fast.', weight: 'hero', accentText: 'Fast.' },
      { text: 'One source of truth for the whole engagement.', weight: 'lead', accentText: 'One source of truth' },
    ],
  },
  {
    id: 'vision',
    numeral: 'V',
    name: 'Vision',
    question: 'What does the future look like?',
    accent: 'amber',
    weight: 0.02,
    beats: [
      {
        kicker: 'Act V — The vision',
        text: 'One platform. One workflow. Shared context.',
        weight: 'hero',
        accentText: 'Shared context.',
      },
    ],
  },
] as const;

/** Technology identifiers rendered as real brand logos on the architecture. */
export type TechId =
  | 'dotnet'
  | 'angular'
  | 'python'
  | 'signalr'
  | 'keycloak'
  | 'redis'
  | 'minio'
  | 'sqlserver'
  | 'hangfire'
  | 'docker';

/** Semantic packet category — each stream type has distinct motion in the 3D act. */
export type StreamKind = 'command' | 'telemetry' | 'artifact' | 'finding' | 'correlation' | 'sync';

/** A directed data path between two architecture layers. */
export interface ArchConnection {
  from: string;
  to: string;
  label: string;
  direction: 'down' | 'up' | 'bidirectional';
  accent: AccentKey;
  stream: StreamKind;
}

/** Architecture node — depth-first tour stop in Act III. */
export interface ArchNode {
  id: string;
  label: string;
  /** One-line purpose — what this node does in the execution path. */
  role: string;
  detail: string;
  plane: 'cloud' | 'edge';
  accent: AccentKey;
  /** Representative API route or hub method shown in the brief. */
  endpoint?: string;
  /** Lifecycle chip shown when docked on this node. */
  statusChip?: string;
  /** Headline technology (rendered as a real logo). */
  primaryTech?: TechId;
  /** Supporting services (rendered as small logo chips). */
  services?: readonly TechId[];
  /** Optional footnote — secondary path, not primary dispatch. */
  footnote?: string;
  /** Plain-language one-liner — shown in the act brief during traverse. */
  explain?: string;
}

/** @deprecated Use ArchNode */
export type ArchLayer = ArchNode;

/** Depth-first traversal order — maps to real FYP execution path. */
export const ARCH_NODES: readonly ArchNode[] = [
  {
    id: 'console',
    label: 'Frontend',
    role: 'The screen analysts use to plan work and watch progress.',
    detail: 'Start an engagement, pick targets, and follow what is running.',
    explain: 'When something finishes, results show up here without refreshing.',
    plane: 'cloud',
    accent: 'cyan',
    endpoint: 'GET /engagements',
    statusChip: 'Live',
    primaryTech: 'angular',
  },
  {
    id: 'api',
    label: 'API Layer',
    role: 'The front door — every request enters here first.',
    detail: 'Checks who you are, what you may access, and saves the record.',
    explain: 'Nothing moves deeper into the platform until this layer accepts it.',
    plane: 'cloud',
    accent: 'purple',
    endpoint: 'POST /api/runs',
    statusChip: 'Authorized',
    primaryTech: 'dotnet',
    services: ['keycloak'],
  },
  {
    id: 'queue',
    label: 'Work Queue',
    role: 'A waiting line for tasks that are not ready to run yet.',
    detail: 'If one part of the system is busy, work stays here safely.',
    explain: 'Keeps the platform steady when many things happen at once.',
    plane: 'cloud',
    accent: 'purple',
    statusChip: 'Queued',
    primaryTech: 'hangfire',
    services: ['redis'],
  },
  {
    id: 'dispatcher',
    label: 'Dispatcher',
    role: 'Decides where each task should go next.',
    detail: 'Finds an available agent that can handle the work.',
    explain: 'The cloud tells the edge what to run and when.',
    plane: 'cloud',
    accent: 'purple',
    endpoint: 'Hub DispatchJob',
    statusChip: 'Routing',
    primaryTech: 'dotnet',
    services: ['signalr'],
  },
  {
    id: 'channel',
    label: 'Secure Channel',
    role: 'A one-way bridge into the customer network.',
    detail: 'Commands go out to the edge — no inbound ports required.',
    explain: 'Work reaches the agent without opening the network from outside.',
    plane: 'edge',
    accent: 'mint',
    statusChip: 'Outbound only',
    primaryTech: 'signalr',
  },
  {
    id: 'agent',
    label: 'Edge Agent',
    role: 'Runs approved checks inside the customer network.',
    detail: 'Only allowlisted tools, only on in-scope targets.',
    explain: 'The actual testing happens here, close to the assets.',
    plane: 'edge',
    accent: 'mint',
    statusChip: 'In scope',
    primaryTech: 'python',
    services: ['docker'],
  },
  {
    id: 'storage',
    label: 'Artifact Store',
    role: 'Keeps files and output from each run.',
    detail: 'Logs, screenshots, and scan results are stored here.',
    explain: 'Evidence is saved so it can be reviewed and reported on.',
    plane: 'edge',
    accent: 'mint',
    statusChip: 'Stored',
    primaryTech: 'minio',
  },
  {
    id: 'ingestion',
    label: 'Ingestion',
    role: 'Reads raw output and turns it into usable findings.',
    detail: 'Parses files, normalizes them, and links them to the engagement.',
    explain: 'What agents collect becomes structured data the platform understands.',
    plane: 'cloud',
    accent: 'purple',
    statusChip: 'Parsing',
    primaryTech: 'dotnet',
    services: ['sqlserver'],
  },
  {
    id: 'livefeed',
    label: 'Live Feed',
    role: 'Pushes live updates back to the frontend.',
    detail: 'Status changes, logs, and results stream as they happen.',
    explain: 'Analysts see progress in real time while work is still running.',
    plane: 'cloud',
    accent: 'cyan',
    endpoint: 'Hub RunUpdated',
    statusChip: 'Streaming',
    primaryTech: 'signalr',
    services: ['redis'],
  },
] as const;

/** @deprecated Use ARCH_NODES */
export const ARCH_LAYERS = ARCH_NODES;

/** Satellite anchor — not a full scroll stop. */
export const ARCH_TARGET_SATELLITE = {
  id: 'targets',
  label: 'Target Systems',
  role: 'Authorized hosts, apps, and subnets under test',
  detail: 'In-scope assets only',
  plane: 'edge' as const,
  accent: 'amber' as AccentKey,
};

/** Named data paths rendered as animated arcs through the diagram. */
export const ARCH_CONNECTIONS: readonly ArchConnection[] = [
  { from: 'console', to: 'api', label: 'Requests & updates', direction: 'bidirectional', accent: 'cyan', stream: 'sync' },
  { from: 'api', to: 'queue', label: 'Enqueue work', direction: 'down', accent: 'purple', stream: 'command' },
  { from: 'queue', to: 'dispatcher', label: 'Ready to route', direction: 'down', accent: 'purple', stream: 'command' },
  { from: 'dispatcher', to: 'channel', label: 'Dispatch to edge', direction: 'down', accent: 'mint', stream: 'command' },
  { from: 'channel', to: 'agent', label: 'Signed command', direction: 'down', accent: 'mint', stream: 'command' },
  { from: 'agent', to: 'targets', label: 'In-scope assessment', direction: 'down', accent: 'mint', stream: 'command' },
  { from: 'targets', to: 'agent', label: 'Raw telemetry', direction: 'up', accent: 'amber', stream: 'telemetry' },
  { from: 'agent', to: 'storage', label: 'Upload artifacts', direction: 'down', accent: 'mint', stream: 'artifact' },
  { from: 'storage', to: 'ingestion', label: 'Deliver for parsing', direction: 'up', accent: 'purple', stream: 'artifact' },
  { from: 'ingestion', to: 'api', label: 'Structured findings', direction: 'up', accent: 'purple', stream: 'correlation' },
  { from: 'ingestion', to: 'livefeed', label: 'Publish results', direction: 'down', accent: 'cyan', stream: 'finding' },
  { from: 'api', to: 'livefeed', label: 'Status relay', direction: 'down', accent: 'cyan', stream: 'finding' },
  { from: 'livefeed', to: 'console', label: 'Live status', direction: 'up', accent: 'cyan', stream: 'sync' },
] as const;

/** Primary forward edges used during depth-first traverse (node i → node i+1). */
export const ARCH_TRAVERSE_EDGES: readonly number[] = [0, 1, 2, 3, 4, 7, 8, 9, 10, 11] as const;

/** The 8-step engagement workflow used by the Workflow act. */
export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  accent: AccentKey;
}

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  { id: 'scope', label: 'Scope', description: 'Authorized boundaries — what may be tested, and when.', accent: 'cyan' },
  { id: 'targets', label: 'Targets', description: 'Assets in scope — hosts, apps, networks at the edge.', accent: 'mint' },
  { id: 'discovery', label: 'Discovery', description: 'Map the attack surface before deeper assessment.', accent: 'mint' },
  { id: 'assessment', label: 'Assessment', description: 'Scanners and agents execute, strictly in scope.', accent: 'purple' },
  { id: 'findings', label: 'Findings', description: 'Issues with severity, evidence, affected assets.', accent: 'magenta' },
  { id: 'verification', label: 'Verification', description: 'Confirm impact — reduce noise, prove real risk.', accent: 'purple' },
  { id: 'remediation', label: 'Remediation', description: 'Prioritized fix guidance for owners and teams.', accent: 'amber' },
  { id: 'reporting', label: 'Reporting', description: 'Executive and technical output, generated once.', accent: 'cyan' },
] as const;

/* ----------------------------------------------------------------------------
 * Key-feature act data — drives the four dedicated 3D scenes + info cards.
 * ------------------------------------------------------------------------- */

/** Jobs act — the schema → validate → resolve → dispatch chain. */
export interface JobsStage {
  id: string;
  label: string;
  detail: string;
  snippet: string;
  accent: AccentKey;
}

export const JOBS_STAGES: readonly JobsStage[] = [
  {
    id: 'schema',
    label: 'JSON Schema',
    detail: 'Every tool is described by a parameter schema — not bespoke code.',
    snippet: '"target": { "type": "string", "format": "host" }',
    accent: 'cyan',
  },
  {
    id: 'validate',
    label: 'Validation',
    detail: 'User input is validated against the schema before anything runs.',
    snippet: 'draft 2020-12 · bounded, safe, configurable',
    accent: 'mint',
  },
  {
    id: 'resolve',
    label: 'Command Template',
    detail: 'A command template resolves validated params into a real argv.',
    snippet: 'nmap -sV -oX $ARTIFACT_DIR/out.xml {{target}}',
    accent: 'purple',
  },
  {
    id: 'dispatch',
    label: 'Dispatch',
    detail: 'The frozen argv is signed and dispatched to an edge agent.',
    snippet: 'Dispatch(runId, executable, argv) → agent',
    accent: 'amber',
  },
] as const;

/** A short list of facts shown on the Jobs feature card. */
export const JOBS_FACTS: readonly string[] = [
  '600+ seeded job templates across 18+ tools',
  'Add a tool by authoring JSON — zero new code paths',
  'Config profiles store reusable, safe presets',
] as const;

/** Pipeline act — DAG node taxonomy + semantics. */
export interface PipelineNodeSpec {
  id: string;
  label: string;
  detail: string;
  accent: AccentKey;
}

export const PIPELINE_NODES: readonly PipelineNodeSpec[] = [
  { id: 'start', label: 'Start', detail: 'A single entry point, validated and immovable.', accent: 'cyan' },
  { id: 'recon', label: 'Recon scan', detail: 'A job node referencing a template + profile.', accent: 'mint' },
  { id: 'webA', label: 'Web scan', detail: 'Fork — runs in parallel with the host scan.', accent: 'purple' },
  { id: 'hostB', label: 'Host scan', detail: 'Fork — runs in parallel with the web scan.', accent: 'purple' },
  { id: 'verify', label: 'Verify', detail: 'Join — waits until both branches succeed.', accent: 'amber' },
] as const;

export const PIPELINE_FACTS: readonly string[] = [
  'Drag, connect, fork and join — no code',
  'Validated acyclic graph (Kahn) before it can run',
  'Failure policy per node: fail the run, or continue',
  'Dispatched wave-by-wave as predecessors succeed',
] as const;

/** MITRE act — finding enrichment mapping (illustrative, drawn from the mapper). */
export interface MitreMapEntry {
  signal: string;
  technique: string;
  name: string;
  confidence: 'High' | 'Medium' | 'Low';
  accent: AccentKey;
}

export const MITRE_MAP: readonly MitreMapEntry[] = [
  { signal: 'CWE-89', technique: 'T1190', name: 'Exploit Public-Facing App', confidence: 'High', accent: 'magenta' },
  { signal: 'port 445', technique: 'T1021.002', name: 'SMB / Windows Admin Shares', confidence: 'Medium', accent: 'purple' },
  { signal: 'tool: hydra', technique: 'T1110', name: 'Brute Force', confidence: 'Medium', accent: 'cyan' },
] as const;

export interface RemediationRank {
  rank: number;
  title: string;
  score: number;
  accent: AccentKey;
}

export const REMEDIATION_RANKS: readonly RemediationRank[] = [
  { rank: 1, title: 'Patch to fixed version', score: 100, accent: 'amber' },
  { rank: 2, title: 'Restrict SMB exposure', score: 70, accent: 'mint' },
  { rank: 3, title: 'Enforce account lockout', score: 50, accent: 'cyan' },
] as const;

export const MITRE_FACTS: readonly string[] = [
  'CWE → ATT&CK, port heuristics, tool patterns',
  'Priority score blends CVSS · KEV · EPSS · context',
  'Top-3 remediations, each with a re-scan to verify',
] as const;

/** Smart-behavior act — rule engine condition → action, with traceability. */
export interface SmartRule {
  id: string;
  when: string;
  then: string;
  why: string;
  accent: AccentKey;
}

export const SMART_RULES: readonly SmartRule[] = [
  {
    id: 'playbook',
    when: 'anyOpenPorts: [80, 443] · osContains: "Windows"',
    then: 'Suggest web + SMB assessment templates',
    why: 'matched open web ports on a Windows host',
    accent: 'mint',
  },
  {
    id: 'assurance',
    when: 'offensive tool · controls tested < 60%',
    then: 'Block the pipeline from starting',
    why: 'assurance policy gate — prove coverage first',
    accent: 'magenta',
  },
  {
    id: 'coverage',
    when: 'control with no recent evaluation',
    then: 'Recommend the job that evaluates it',
    why: 'coverage gap detected for this control',
    accent: 'cyan',
  },
] as const;

export const SMART_FACTS: readonly string[] = [
  'Rule-based — deterministic, auditable, no black box',
  'Playbook hints rank the next safe move',
  'Assurance policies gate risky actions',
  'Every decision traces to a rule you can read',
] as const;

/** Impact metrics shown as kinetic typography in the Impact act. */
export const IMPACT_METRICS: readonly { value: string; label: string; accent: AccentKey }[] = [
  { value: '18+', label: 'security tools, one platform', accent: 'amber' },
  { value: '600+', label: 'job templates, zero custom code', accent: 'mint' },
  { value: 'One', label: 'workflow — scope to report', accent: 'cyan' },
] as const;

export const PROJECT_META = {
  title: 'Smart Agent Based Platform for Penetration Testing',
  short: 'Below the Surface',
  group: 'CS-22057',
} as const;

/** Total scroll height of the experience, in viewport heights. */
export const EXPERIENCE_SCROLL_VH = 2200;
