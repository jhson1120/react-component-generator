import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const streaming = !!component.streaming;
  const [activeTab, setActiveTab] = useState<Tab>(streaming ? 'code' : 'preview');
  const [wasStreaming, setWasStreaming] = useState(streaming);
  const [previewKey, setPreviewKey] = useState(0);

  // 스트리밍 시작/종료 시점에만 탭을 자동 전환한다 (렌더 중 상태 조정 패턴).
  if (streaming !== wasStreaming) {
    setWasStreaming(streaming);
    setActiveTab(streaming ? 'code' : 'preview');
  }
  const createdAt = component.createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="window component-window">
      <div className="titlebar">
        <button
          className="close-box"
          onClick={() => onRemove(component.id)}
          title="삭제"
          aria-label="삭제"
        />
        <h2>{createdAt}에 생성</h2>
      </div>

      <div className="window-body card-head">
        <p className="card-prompt">{component.prompt}</p>
        <div className="card-actions">
          <button
            className="btn btn--square"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
            aria-label="미리보기 새로고침"
          >
            ↻
          </button>
          <button
            className="btn"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'preview'}
          className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          미리보기
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'code'}
          className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          코드
        </button>
      </div>

      <div className="card-content" role="tabpanel">
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={component.code} />
        ) : (
          <CodeView code={component.code} streaming={streaming} />
        )}
      </div>
    </article>
  );
}
