export const LEGAL_CATEGORIES = [
  {
    name: 'LEGAL PRECEDENT EXPERT',
    ability: {
      can: 'Search case law only and surface the most relevant decisions by following the jurisdiction hierarchy (highest courts first).',
      cannot: 'Provide legal advice, draft pleadings, or use non-case-law sources; ignore jurisdiction or court-level constraints.'
    },
    questions: [
      'Find Supreme Court cases on unlawful termination in Rwanda (2018–present).',
      'List High Court and above decisions on land expropriation disputes in Rwanda.'
    ]
  }
]
