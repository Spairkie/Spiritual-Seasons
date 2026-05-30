import type { SeasonId } from './common';

export interface DayEntry {
  day: number;
  scriptureRef: string;
  scriptureText: string;
  prompt: string;
  pdfPage: number; // vestigial — physical book page, not used in app
}

export interface BookSeason {
  id: SeasonId;
  title: string;
  name: string;
  emoji: string;
  days: DayEntry[];
}

export interface SeasonalOverview {
  title: string;
  description: string;
  theme: string;
  scripture: string;
}

export interface BookData {
  title: string;
  subtitle: string;
  author: string;
  description: string;
  acknowledgements: string;
  aboutAuthor: string;
  frontMatter: {
    introduction: {
      text: string;
      scripture: string;
    };
    howToUse: {
      steps: string[];
    };
  };
  seasons: BookSeason[];
  seasonalOverviews: Record<SeasonId, SeasonalOverview>;
}
