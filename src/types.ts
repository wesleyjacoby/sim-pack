export type Group = 'memorise' | 'reference' | 'review';
export type CoverMode = 'none' | 'values' | 'blocks';

export interface Page {
  id: string;
  title: string;
  group: Group;
  order: number;
  summary: string;
  cover: CoverMode;
  md: string;
}

export interface Pack {
  format: 1;
  builtAt: string;
  pages: Page[];
}

/** page id -> time it was marked as read */
export type ReadMap = Record<string, number>;

export const GROUP_LABEL: Record<Group, string> = {
  memorise: 'Memorise',
  reference: 'Reference',
  review: 'Technical review',
};
export const GROUP_ORDER: Group[] = ['memorise', 'reference', 'review'];
