export interface JourneyStage {
  id: string
  title: string
  description: string
  cocktailIds: string[]
}

export const journeyStages: JourneyStage[] = [
  {
    id: 'foundations',
    title: 'Stage 1: Foundations',
    description:
      'Six templates that teach balance, dilution, and the core families.',
    cocktailIds: [
      'old-fashioned',
      'daiquiri',
      'margarita',
      'manhattan',
      'martini',
      'negroni',
    ],
  },
  {
    id: 'build-explore',
    title: 'Stage 2: Build and Explore',
    description:
      'Lengthen, sour, and twist the foundations with new techniques.',
    cocktailIds: [
      'whiskey-sour',
      'gold-rush',
      'boulevardier',
      'southside',
      'tom-collins',
      'corn-n-oil',
      'royal-bermuda-yacht-club',
    ],
  },
  {
    id: 'advanced',
    title: 'Stage 3: Advanced Classics',
    description:
      'Richer builds and historic signatures once the foundations feel natural.',
    cocktailIds: [
      'sazerac',
      'mai-tai',
      'jungle-bird',
      'vieux-carre',
      'paper-plane',
      'last-word',
    ],
  },
]
