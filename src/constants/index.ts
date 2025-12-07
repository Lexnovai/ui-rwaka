export const LEGAL_CATEGORIES = [
  {
    name: 'LEGAL PRECEDENT EXPERT',
    ability: {
      can: 'Search case law only and surface the most relevant decisions by following the jurisdiction hierarchy (highest courts first).',
      cannot:
        'Provide legal advice, draft pleadings, or use non-case-law sources; ignore jurisdiction or court-level constraints.'
    },
    questions: [
      'Find Supreme Court cases on unlawful termination in Rwanda (2018–present).',
      'List High Court and above decisions on land expropriation disputes in Rwanda.'
    ]
  },
  {
    name: 'JURIST LEGAL EXPERT',
    ability: {
      can: 'Answer legal questions by surveying recent statutes, regulations, case law, and commentary, prioritizing the most current authoritative sources with citations.',
      cannot:
        'Offer personalized legal advice, draft binding documents, or skip citation support when referencing laws and precedents.'
    },
    questions: [
      'Summarize the latest Rwandan data-protection statute changes and their effective dates.',
      'Provide cited sources on recent case law interpreting cross-border merger regulations in Rwanda.'
    ]
  }
]
