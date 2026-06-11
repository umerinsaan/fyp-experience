/**
 * Narrative architecture — single source of truth for the cinematic experience.
 *
 * The whole site is one continuous scroll mapped to global progress 0..1.
 * Each ACT owns a slice of that progress, a dominant accent, a 3D "set",
 * and a sequence of typographic beats revealed one line at a time.
 *
 * Scroll budget is intentional (see DESIGN: cinematic pacing). Architecture
 * is the climax; six key-feature acts follow Technologies; the
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
  | 'technologies'
  | 'jobs'
  | 'pipeline'
  | 'suggestions'
  | 'rbac'
  | 'reports'
  | 'dashboard'
  | 'future-work';

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
  /** When true, the line stays on one row (projector headlines). */
  singleLine?: boolean;
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
 * hero .06 · problem .09 · cost .07 · objective .11 · architecture .14
 * · technologies .22 · jobs .06 · pipeline .06 · suggestions .06
 * · rbac .06 · reports .06 · dashboard .06 · future-work .07
 *
 * Architecture remains the climax; six key-feature acts each get a
 * dedicated scroll chapter with screenshot + info card; future-work
 * closes the film as Act V.
 */
export const ACTS: readonly Act[] = [
  {
    id: 'hero',
    numeral: '',
    name: 'Prologue',
    question: 'What is this?',
    accent: 'cyan',
    weight: 0.06,
    beats: [
      {
        kicker: 'Platform Briefing',
        text: 'Below the Surface',
        weight: 'hero',
      },
    ],
  },
  {
    id: 'problem',
    numeral: 'I',
    name: 'The Problem',
    question: 'Why is penetration testing painful?',
    accent: 'magenta',
    weight: 0.09,
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
    weight: 0.11,
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
    weight: 0.14,
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
        text: 'It is a shared system of intelligence.',
        weight: 'lead',
        accentText: 'shared system of intelligence.',
      },
    ],
  },
  {
    id: 'technologies',
    numeral: 'III',
    name: 'Technologies',
    question: 'What is the stack built on?',
    accent: 'mint',
    weight: 0.22,
    beats: [
      {
        kicker: 'Act III — The stack',
        text: 'Every layer is a deliberate choice.',
        weight: 'lead',
        accentText: 'deliberate choice.',
      },
    ],
  },
  {
    id: 'jobs',
    numeral: 'IV',
    name: 'Jobs Engine',
    question: 'How do hundreds of tools share one system?',
    accent: 'purple',
    weight: 0.06,
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
    weight: 0.06,
    beats: [
      { kicker: 'Act IV — Key feature 02', text: 'Draw the pipeline as a graph.', weight: 'hero', accentText: 'a graph.' },
      {
        text: 'Fork to run in parallel. Join to wait for proof.',
        weight: 'lead',
        accentText: 'in parallel.',
      },
    ],
  },
  {
    id: 'suggestions',
    numeral: 'IV',
    name: 'Suggested Next Steps',
    question: 'What should run next on this asset?',
    accent: 'mint',
    weight: 0.06,
    beats: [
      { kicker: 'Act IV — Key feature 03', text: 'Rule-based hints — never a black box.', weight: 'hero', accentText: 'black box.' },
      {
        text: 'Playbook hints rank the next safe move for each asset.',
        weight: 'lead',
        accentText: 'next safe move',
      },
      {
        text: 'Every recommendation traces back to a rule you can read.',
        weight: 'lead',
        accentText: 'a rule you can read.',
      },
    ],
  },
  {
    id: 'rbac',
    numeral: 'IV',
    name: 'Live RBAC',
    question: 'Who can do what — and can you see it?',
    accent: 'magenta',
    weight: 0.06,
    beats: [
      { kicker: 'Act IV — Key feature 04', text: 'Permissions you can see — and edit in place.', weight: 'hero', accentText: 'edit in place.' },
      {
        text: 'Toggle Live RBAC overlay — every guarded control highlights on the console.',
        weight: 'lead',
        accentText: 'highlights on the console.',
      },
    ],
  },
  {
    id: 'reports',
    numeral: 'IV',
    name: 'Report Library',
    question: 'How does evidence leave the platform?',
    accent: 'amber',
    weight: 0.06,
    beats: [
      {
        kicker: 'Act IV — Key feature 05',
        text: 'Generate once for whole team',
        weight: 'hero',
        accentText: 'whole team',
      },
      {
        text: 'PDFs render in the background and land in the tenant report library.',
        weight: 'lead',
        accentText: 'report library.',
      },
    ],
  },
  {
    id: 'dashboard',
    numeral: 'IV',
    name: 'Security Posture',
    question: 'How do you read posture at a glance?',
    accent: 'cyan',
    weight: 0.06,
    beats: [
      { kicker: 'Act IV — Key feature 06', text: 'Two lenses on the same posture.', weight: 'hero', accentText: 'Two lenses' },
      {
        text: 'Assets mode for inventory. Vulnerabilities mode for risk.',
        weight: 'lead',
        accentText: 'Assets mode',
      },
    ],
  },
  {
    id: 'future-work',
    numeral: 'V',
    name: 'Future Work',
    question: 'What comes next?',
    accent: 'amber',
    weight: 0.07,
    beats: [
      {
        text: 'There is always room for improvement.',
        weight: 'hero',
        isQuote: true,
        kicker: 'Continuous improvement',
      },
      {
        text: 'Shipped today — extended tomorrow.',
        weight: 'lead',
        accentText: 'extended tomorrow.',
      },
    ],
  },
] as const;

/** Act V — forward-looking platform horizons (description only). */
export interface FutureWorkItem {
  id: string;
  label: string;
  detail: string;
}

export const FUTURE_WORK_ITEMS: readonly FutureWorkItem[] = [
  {
    id: 'ai',
    label: 'AI-assisted guidance',
    detail:
      'Machine-assisted prioritisation and narrative on top of today\'s rule-based playbooks — operator-controlled, not autonomous exploitation.',
  },
  {
    id: 'byok',
    label: 'Deeper BYOK & tenant crypto',
    detail:
      'Extend tenant Bring Your Own Key beyond engagement exports — post-quantum key wrapping, shorter unlock sessions, and production vault hardening.',
  },
  {
    id: 'zerotrust',
    label: 'Zero trust maturity',
    detail:
      'Formal maturity scoring on outbound agents, RBAC, and tenant isolation — mTLS for agents, rate limits, and full observability.',
  },
  {
    id: 'maturity',
    label: 'Maturity in reports',
    detail:
      'Assurance maturity bands and trend lines in executive PDFs — extending today\'s index into longitudinal posture reporting.',
  },
  {
    id: 'assets',
    label: 'Cloud & extended assets',
    detail:
      'Import cloud-deployed workloads and non-LAN assets alongside network-discovered hosts — plus a host agent for endpoint posture.',
  },
] as const;

/** Technology identifiers rendered as brand logos across architecture and technologies acts. */
export type TechId =
  | 'dotnet'
  | 'csharp'
  | 'angular'
  | 'python'
  | 'signalr'
  | 'signalrcore'
  | 'keycloak'
  | 'redis'
  | 'minio'
  | 'sqlserver'
  | 'hangfire'
  | 'docker'
  | 'primeng'
  | 'elkjs'
  | 'mediatr'
  | 'serilog'
  | 'requests';

/** Technologies act — one entry per stack choice. */
export interface TechnologyEntry {
  key: string;
  label: string;
  logos: readonly TechId[];
  summary: string;
  impact: string;
  rationale: string;
}

export const TECHNOLOGIES: readonly TechnologyEntry[] = [
  {
    key: 'angular',
    label: 'Angular',
    logos: ['angular'],
    summary: 'Used in FYP.UI — TypeScript SPA framework for the web console.',
    impact: 'Lazy routes, forms, and HTTP power every analyst screen.',
    rationale: 'Enterprise-grade structure with standalone components and long-term support.',
  },
  {
    key: 'primeng',
    label: 'PrimeNG',
    logos: ['primeng'],
    summary: 'Used in FYP.UI — component library for tables, dialogs, and dashboards.',
    impact: 'Consistent UI widgets across engagements, jobs, and reporting views.',
    rationale: 'Rich data-heavy components out of the box — less custom CSS for complex views.',
  },
  {
    key: 'elkjs',
    label: 'ELK.js',
    logos: ['elkjs'],
    summary: 'Used in FYP.UI — automatic graph layout for the pipeline designer.',
    impact: 'Pipeline nodes auto-position into readable DAGs without manual drag alignment.',
    rationale: 'Layered graph algorithm handles fork/join complexity that hand layout cannot scale.',
  },
  {
    key: 'dotnet-stack',
    label: '.NET stack',
    logos: ['csharp', 'dotnet'],
    summary: 'Used in FYP.Backend — C# on .NET 10 with ASP.NET Core and Entity Framework Core.',
    impact: 'REST endpoints, auth, migrations, and domain logic share one typed ecosystem.',
    rationale: 'Mature enterprise stack with first-class async, DI, and EF migrations out of the box.',
  },
  {
    key: 'sqlserver',
    label: 'SQL Server',
    logos: ['sqlserver'],
    summary: 'Used in FYP.Backend — primary relational database for engagements, runs, and findings.',
    impact: 'All platform state persists in one ACID store with EF Core migrations.',
    rationale: 'Proven RDBMS with strong tooling — fits multi-tenant relational data models.',
  },
  {
    key: 'redis',
    label: 'Redis',
    logos: ['redis'],
    summary: 'Used in FYP.Backend — in-memory cache, job queue, and SignalR backplane.',
    impact: 'Scales real-time hubs and absorbs ingest bursts without blocking the API.',
    rationale: 'Single infra piece covers cache, pub/sub, and queue patterns the platform needs.',
  },
  {
    key: 'hangfire',
    label: 'Hangfire',
    logos: ['hangfire'],
    summary: 'Used in FYP.Backend — background job scheduler backed by SQL Server.',
    impact: 'Recurring scans, report generation, and ingest run outside the request path.',
    rationale: 'Reliable scheduling with a dashboard — no custom cron infrastructure required.',
  },
  {
    key: 'keycloak',
    label: 'Keycloak',
    logos: ['keycloak'],
    summary: 'Used in FYP.Backend — OIDC identity provider for console authentication.',
    impact: 'Analysts sign in via SSO; the BFF holds session cookies — no tokens in the browser.',
    rationale: 'Standard OIDC with realm import — separates auth from application code.',
  },
  {
    key: 'minio',
    label: 'MinIO',
    logos: ['minio'],
    summary: 'Used in FYP.Backend — S3-compatible object storage for scan artifacts.',
    impact: 'The Kali agent uploads raw tool output via presigned URLs; ingestion reads from the same bucket.',
    rationale: 'S3 API without cloud lock-in — works in Docker labs and on-prem deployments.',
  },
  {
    key: 'signalr',
    label: 'SignalR',
    logos: ['signalr'],
    summary: 'Used in FYP.Backend for hubs; FYP.UI and the Kali agent connect as outbound clients.',
    impact: 'Dispatch reaches the agent instantly; dashboards update live as runs progress.',
    rationale: 'WebSocket push over outbound connections — no inbound ports required on the scan box.',
  },
  {
    key: 'docker',
    label: 'Docker',
    logos: ['docker'],
    summary: 'Used in FYP.Backend — containerized local infrastructure stack.',
    impact: 'SQL Server, Redis, MinIO, and Keycloak spin up consistently for dev and lab environments.',
    rationale: 'One compose file reproduces the full backend dependency graph on any machine.',
  },
  {
    key: 'mediatr',
    label: 'MediatR',
    logos: ['mediatr'],
    summary: 'Used in FYP.Backend — CQRS request/handler pipeline in the application layer.',
    impact: 'Every API command flows through validated handlers — thin controllers, testable logic.',
    rationale: 'Decouples HTTP from business rules without a heavyweight framework.',
  },
  {
    key: 'serilog',
    label: 'Serilog',
    logos: ['serilog'],
    summary: 'Used in FYP.Backend — structured logging shipped to Seq.',
    impact: 'Runs, dispatches, and ingest events are searchable with full context in dev and ops.',
    rationale: 'Structured logs beat plain text when debugging distributed scan workflows.',
  },
  {
    key: 'python',
    label: 'Python',
    logos: ['python'],
    summary: 'Used in the Kali agent — runtime for scan dispatch and artifact upload.',
    impact: 'Runs allowlisted scanners and uploads results from inside the customer network.',
    rationale: 'Fast to ship, rich subprocess tooling, and familiar to security engineers.',
  },
  {
    key: 'signalrcore',
    label: 'signalrcore',
    logos: ['signalrcore'],
    summary: 'Used in the Kali agent — Python SignalR client for outbound hub connection.',
    impact: 'Receives dispatch, sends heartbeats, and streams run output without inbound ports.',
    rationale: 'Matches the backend hub protocol — one persistent outbound channel from the scan box.',
  },
  {
    key: 'requests',
    label: 'requests',
    logos: ['requests'],
    summary: 'Used in the Kali agent — HTTP client for enrollment and artifact uploads.',
    impact: 'Enrolls with the API, fetches presigned URLs, and PUTs scan output to object storage.',
    rationale: 'Simple, battle-tested HTTP for the few REST calls the agent needs beyond SignalR.',
  },
] as const;

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

/** Named data paths rendered as animated arcs through the diagram. */
export const ARCH_CONNECTIONS: readonly ArchConnection[] = [
  { from: 'console', to: 'api', label: 'Requests & updates', direction: 'bidirectional', accent: 'cyan', stream: 'sync' },
  { from: 'api', to: 'queue', label: 'Enqueue work', direction: 'down', accent: 'purple', stream: 'command' },
  { from: 'queue', to: 'dispatcher', label: 'Ready to route', direction: 'down', accent: 'purple', stream: 'command' },
  { from: 'dispatcher', to: 'channel', label: 'Dispatch to edge', direction: 'down', accent: 'mint', stream: 'command' },
  { from: 'channel', to: 'agent', label: 'Signed command', direction: 'down', accent: 'mint', stream: 'command' },
  { from: 'agent', to: 'storage', label: 'Upload artifacts', direction: 'down', accent: 'mint', stream: 'artifact' },
  { from: 'storage', to: 'ingestion', label: 'Deliver for parsing', direction: 'up', accent: 'purple', stream: 'artifact' },
  { from: 'ingestion', to: 'api', label: 'Structured findings', direction: 'up', accent: 'purple', stream: 'correlation' },
  { from: 'ingestion', to: 'livefeed', label: 'Publish results', direction: 'down', accent: 'cyan', stream: 'finding' },
  { from: 'api', to: 'livefeed', label: 'Status relay', direction: 'down', accent: 'cyan', stream: 'finding' },
  { from: 'livefeed', to: 'console', label: 'Live status', direction: 'up', accent: 'cyan', stream: 'sync' },
] as const;

/** Primary forward edges used during depth-first traverse (node i → node i+1). */
export const ARCH_TRAVERSE_EDGES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/* ----------------------------------------------------------------------------
 * Key-feature act data — drives the six dedicated 3D scenes + info cards.
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
  'Job templates ship with JSON Schema, UI schema, and a command template',
  'Server validates every payload before a run is accepted',
  'Command preview resolves params into the exact argv the agent runs',
  'Config profiles store reusable, safe parameter presets',
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
  'Interactive canvas: drag templates, connect Start → Job nodes',
  'ELK.js auto-layout keeps complex DAGs readable',
  'Client and server both validate acyclic graphs before a run',
  'Orchestrator dispatches wave-by-wave as predecessors succeed',
] as const;

/** Suggestions act — rule engine condition → action, with traceability. */
export interface SuggestionsRule {
  id: string;
  when: string;
  then: string;
  why: string;
  accent: AccentKey;
}

export const SUGGESTIONS_RULES: readonly SuggestionsRule[] = [
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

export const SUGGESTIONS_FACTS: readonly string[] = [
  'PlaybookHintsJson on templates — declarative rules, not ML',
  'Engine scores against asset context: ports, OS, CVEs, recent runs',
  'Every card shows a relevance score and plain-language reasons',
  'Coverage-gap recommendations close assurance holes on the asset hub',
] as const;

export const RBAC_FACTS: readonly string[] = [
  'Tenant-scoped permission keys — reports.view, jobs.create, rbac.manage',
  'Server enforces RBAC on every MediatR command, not just UI hiding',
  'Live RBAC overlay highlights every guarded control on the live console',
  'Click a control → floating inspector shows the permission; edit grants in place',
  'RBAC command centre provides the full role × permission matrix',
] as const;

export const REPORTS_FACTS: readonly string[] = [
  'Analysts with reports.generate queue PDF/CSV generation asynchronously',
  'Worker renders, stores artifacts in MinIO, notifies via SignalR when complete',
  'Any teammate with reports.view opens the same tenant library — no re-generation',
  'Scoped entry points from engagements, assets, and pipeline runs',
] as const;

export const DASHBOARD_FACTS: readonly string[] = [
  'Assets mode: inventory totals, reachability, OS distribution, agent sighting %',
  'Vulnerabilities mode: severity backlog, risk score, remediation pulse',
  'Chip toggle switches modes; network scope filter applies to both',
  'Highest-risk assets list links straight to the asset command centre',
] as const;

export const PROJECT_META = {
  title: 'Smart Agent Based Platform for Penetration Testing',
  short: 'Below the Surface',
  group: 'CS-22057',
} as const;

/** Total scroll height of the experience, in viewport heights. */
export const EXPERIENCE_SCROLL_VH = 2320;
