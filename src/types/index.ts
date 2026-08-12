interface ICandidate {
  content: IContent;
}

interface IContent {
  parts: IPart[];
}

interface IPart {
  text: string;
}

export interface IGeminiResponse {
  candidates: ICandidate[];
}

export interface ChatEntry {
  question: string;
  answer: string;
}

export type Category =
  | 'history'
  | 'services'
  | 'projects'
  | 'memory'
  | 'smalltalk'
  | 'tech'
  | 'pricing'
  | 'contacts'
  | 'other';