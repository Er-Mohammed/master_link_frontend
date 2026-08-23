import { ProcessStep } from '../types';

export const processData: ProcessStep[] = [
  {
    number: '01',
    title: 'Discovery & Consultation',
    description: 'Comprehensive analysis of business requirements, technological bottlenecks, and strategic market positioning.',
    details: [
      'In-depth stakeholder briefing & technical discovery sessions',
      'Competitor benchmark audits & conversion gap analysis',
      'Target persona modeling & user journey mapping',
      'Technical feasibility assessment & architecture roadmap'
    ]
  },
  {
    number: '02',
    title: 'Architecture & UI/UX Design',
    description: 'Bespoke design systems, responsive wireframes, user testing, and scalable database schemas.',
    details: [
      'Interactive prototype generation with verified user flows',
      'Design tokens, typography scales, and unified brand design systems',
      'Database normalization, API contracts, and microservice definitions',
      'WCAG AA accessible interface engineering & responsive view states'
    ]
  },
  {
    number: '03',
    title: 'Engineering & Integration',
    description: 'Production-ready codebases with state-of-the-art frameworks, rigorous performance tuning, and continuous integration.',
    details: [
      'Modern TypeScript & React frontends optimized for sub-second rendering',
      'Clean RESTful backend services with automated rate limiting',
      'Integrated payment gateways, CRM connections, and analytics telemetry',
      'End-to-end unit, integration, and cross-browser stress testing'
    ]
  },
  {
    number: '04',
    title: 'Launch & Growth Optimization',
    description: 'Flawless production deployment, continuous SEO indexing, campaign activation, and ongoing performance support.',
    details: [
      'Zero-downtime containerized production deployment & CDN caching',
      'Full technical SEO configuration & structured metadata schemas',
      'Dedicated marketing activation & high-impact campaign scaling',
      'Continuous uptime monitoring, analytics reporting, and ongoing support'
    ]
  }
];
