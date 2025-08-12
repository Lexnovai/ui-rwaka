export const LEGAL_CATEGORIES = [
  {
    name: 'NORWAY LAW EXPERT',
    ability: {
      can: 'Interpret and explain Norwegian criminal statutes, penalties, and defenses',
      cannot: 'Advise on civil, tax, land, or procedural drafting'
    },
    questions: [
      'What defenses exist for homicide under Norwegian law?',
      'Describe penalties for theft and robbery in Norway'
    ]
  },
  {
    name: 'SEARCH LAWYER EXPERT',
    ability: {
      can: 'Find and recommend the top 3 lawyers in Norway based on location and legal specialization',
      cannot: 'Provide legal advice or represent clients in court proceedings'
    },
    questions: [
      'Can you find me a criminal defense lawyer in Oslo?',
      'I need a family law attorney in Bergen who speaks English with specialty in divorce law'
    ]
  },
  {
    name: 'LAND LAW EXPERT',
    ability: {
      can: 'Detail Rwandan land policy, use planning, registration, consolidation, and conflict resolution.',
      cannot: 'Cover tax, criminal, or civil law beyond land issues'
    },
    questions: [
      'What steps are required to register a land title?',
      'Explain the land consolidation process in rural Rwanda.'
    ]
  },
  {
    name: 'COURT SUBMISSIONS EXPERT',
    ability: {
      can: 'Draft complaints, motions, and other court filings under Rwandan civil procedure',
      cannot: 'Offer strategy or negotiate settlements'
    },
    questions: [
      'Draft a summons for unpaid debt recovery',
      'Prepare a motion to compel discovery'
    ]
  },
  {
    name: 'CONTRACT ANALYSIS EXPERT',
    ability: {
      can: 'Review and draft employment contracts under Rwandan labor law; identify risks',
      cannot: 'Handle non-employment contracts like land or taxation'
    },
    questions: [
      'Identify compliance issues in this employment agreement.',
      "Draft a probation clause under Rwanda's labor law."
    ]
  },
  {
    name: 'RRA EXPERT',
    ability: {
      can: 'Advise on Rwanda Revenue Authority regulations—VAT, income tax, customs, and compliance',
      cannot: 'Address non-tax matters'
    },
    questions: [
      'How do I file VAT returns with the RRA?',
      'What is the individual income tax rate for residents?'
    ]
  },
  {
    name: 'USERS LEGAL EXPERT',
    ability: {
      can: 'Answer general legal questions across multiple domains based on the knowledge',
      cannot:
        'Provide highly specialized guidance; will state when info is unavailable.'
    },
    questions: [
      'What are theft and robbery penalties in Rwanda?',
      'How is divorce processed in Rwanda?'
    ]
  },
  {
    name: 'JURIST LEGAL EXPERT',
    ability: {
      can: 'Research broad legal doctrines from statutes, case law, and commentary.',
      cannot: 'Provide deep specialist focus (use domain experts instead).'
    },
    questions: [
      'Criminal laws in Rwanda',
      'Someone is trying not to payback my money, what can I do?'
    ]
  },
  {
    name: 'LEGAL PRECEDENT EXPERT',
    ability: {
      can: 'Research broad legal doctrines from statutes, case law, and commentary.',
      cannot: 'Provide deep specialist focus (use domain experts instead).'
    },
    questions: [
      'Criminal laws in Rwanda',
      'Someone is trying not to payback my money, what can I do?'
    ]
  },
  {
    name: 'LEGAL PRECEDENT EXPERT',
    ability: {
      can: 'Locate and analyze judicial precedents relevant to specific legal issues in Rwanda; summarize holdings and reasoning for legal argument support.',
      cannot:
        'Provide definitive legal representation or strategy advice beyond precedent summaries.'
    },
    questions: [
      'Which Supreme Court decisions define negligence in Rwanda?',
      'Summarize the precedent set in the Court of Appeal regarding land expropriation.'
    ]
  },
  {
    name: 'COMPANY LAW EXPERT',
    ability: {
      can: 'Research broad legal doctrines from statutes, case law, and commentary.',
      cannot: 'Provide deep specialist focus (use domain experts instead).'
    },
    questions: [
      'List key environmental protection laws in Rwanda',
      'What does Article 189 of the Penal Code state?'
    ]
  },
  {
    name: 'DATA PROTECTION EXPERT',
    ability: {
      can: "Interpret Rwanda's data protection and privacy law; advise on lawful collection, processing, storage, and cross-border transfer of personal data.",
      cannot:
        'Provide technical cybersecurity implementation or IT system audits.'
    },
    questions: [
      "What are the consent requirements under Rwanda's data protection law?",
      'Can personal data be transferred outside Rwanda and under what conditions?'
    ]
  }
]
