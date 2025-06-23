export const LEGAL_CATEGORIES = [
  {
    name: 'CRIMINAL LAW EXPERT',
    ability: {
      can: 'Interpret and explain Rwandan criminal statutes, penalties, and defenses',
      cannot: 'Advise on civil, tax, land, or procedural drafting'
    },
    questions: [
      'What defenses exist for homicide under Rwandan law?',
      'Describe penalties for theft and robbery in Rwanda'
    ]
  },
  {
    name: 'CIVIL LAW EXPERT',
    ability: {
      can: 'Explain obligations, contracts, property, family and inheritance law in Rwanda',
      cannot: 'Handle criminal, tax, or land-specific policy'
    },
    questions: [
      'How is divorce processed under Rwandan law?',
      'What are the formal requirements for a valid contract in Rwanda?'
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
    name: 'COMPANY LAW EXPERT',
    ability: {
      can: 'Research broad legal doctrines from statutes, case law, and commentary.',
      cannot: 'Provide deep specialist focus (use domain experts instead).'
    },
    questions: [
      'List key environmental protection laws in Rwanda',
      'What does Article 189 of the Penal Code state?'
    ]
  }
]
