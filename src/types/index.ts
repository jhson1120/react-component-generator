export type Provider = 'anthropic' | 'google';

export interface GeneratedComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: Date;
  /** LLM 응답을 스트리밍으로 받는 중이면 true */
  streaming?: boolean;
}
