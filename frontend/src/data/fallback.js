/**
 * Static content used when the PHP API is unreachable or a table is empty.
 * Keeps the marketing pages complete instead of showing holes.
 */

export const FALLBACK_SERVICES = [
  {
    id: 'fb-1',
    name: 'Managed IT Support',
    slug: 'managed-it-support',
    description:
      'Proactive IT support that monitors, patches and fixes your systems before downtime reaches your business.',
    features: '24/7 monitoring,Helpdesk,Patch management',
    benefits: 'Reduced downtime,Improved productivity',
  },
  {
    id: 'fb-2',
    name: 'Cloud Services & Cloud Migration',
    slug: 'cloud-services',
    description:
      'Secure, scalable cloud infrastructure with zero-downtime migration planning and continuous optimisation.',
    features: 'Cloud strategy,Migration planning,Optimization',
    benefits: 'Scalability,Cost efficiency',
  },
  {
    id: 'fb-3',
    name: 'Cybersecurity Solutions',
    slug: 'cybersecurity',
    description:
      'Enterprise-grade defence: threat monitoring, firewall management and continuous security audits.',
    features: 'Threat monitoring,Firewall management,Security audits',
    benefits: 'Risk reduction,Compliance support',
  },
]

export const FALLBACK_POSTS = [
  {
    id: 'fb-p1',
    title: 'Five signs your IT support plan is quietly failing',
    slug: 'five-signs-it-support-is-failing',
    short_description:
      'Recurring outages, slow approvals and nobody owning the roadmap are all symptoms of the same problem. Here is how to spot them early.',
    category: 'Managed IT',
    author: 'MM IT Tech Team',
    published_date: '2026-09-18',
  },
  {
    id: 'fb-p2',
    title: 'Migrating to the cloud without a single minute of downtime',
    slug: 'zero-downtime-cloud-migration',
    short_description:
      'A practical migration plan that sequences cutover, testing and rollback so your team keeps working through the move.',
    category: 'Cloud',
    author: 'MM IT Tech Team',
    published_date: '2026-08-27',
  },
  {
    id: 'fb-p3',
    title: 'The backup your business can actually recover from',
    slug: 'backups-you-can-trust',
    short_description:
      'Backups are worthless without a tested restore. How to design a recovery plan you can verify before you need it.',
    category: 'Security',
    author: 'MM IT Tech Team',
    published_date: '2026-08-05',
  },
  {
    id: 'fb-p4',
    title: 'Why your next cloud bill should not be a surprise',
    slug: 'taming-cloud-costs',
    short_description:
      'Tagging, rightsizing and sensible schedules can cut cloud spend by a third without touching performance.',
    category: 'Cloud',
    author: 'MM IT Tech Team',
    published_date: '2026-07-14',
  },
  {
    id: 'fb-p5',
    title: 'Phishing in 2026: the attacks that actually get clicked',
    slug: 'modern-phishing-attacks',
    short_description:
      'The most convincing social engineering we saw this year, and the three controls that stop all of them.',
    category: 'Security',
    author: 'MM IT Tech Team',
    published_date: '2026-06-30',
  },
  {
    id: 'fb-p6',
    title: 'Building an IT roadmap that finance actually approves',
    slug: 'it-roadmap-finance-approves',
    short_description:
      'Turning technical debt into a costed, phased plan that speaks the language of budgets and risk.',
    category: 'Strategy',
    author: 'MM IT Tech Team',
    published_date: '2026-06-11',
  },
]

export const splitList = (value = '') =>
  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
