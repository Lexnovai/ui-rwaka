import { Briefcase, ClipboardCheck, LandPlot, Users2 } from 'lucide-react'

export const LEGAL_CATEGORIES = [
  {
    name: 'Property',
    icon: LandPlot,
    questions: [
      'How do I transfer land ownership in Rwanda?',
      'Can I buy land as a foreigner?',
      'What is the process for land registration?',
      'How do I resolve a land boundary dispute?',
      'How can I verify a land title?'
    ]
  },
  {
    name: 'Family',
    icon: Users2,
    questions: [
      'What are the legal grounds for divorce in Rwanda?',
      'How is child custody determined?',
      'What rights does a spouse have after separation?',
      'Can a traditional marriage be legally recognized?',
      'What’s the process for child support claims?'
    ]
  },
  {
    name: 'Business',
    icon: Briefcase,
    questions: [
      'How do I register a business in Rwanda?',
      'Can a foreigner own a business in Rwanda?',
      'What licenses are needed to start a shop?',
      'What taxes must a new business pay?',
      'How do I protect my business name or logo?'
    ]
  },
  {
    name: 'Employment',
    icon: ClipboardCheck,
    questions: [
      'What must be included in an employment contract?',
      'Can I be fired without warning?',
      'What are my rights during maternity leave?',
      'Is verbal termination of a job legal?',
      'How do I file a complaint against an employer?'
    ]
  }
]
