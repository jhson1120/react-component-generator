import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentCard } from './ComponentCard';
import type { GeneratedComponent } from '../types';

vi.mock('./LivePreview', () => ({
  LivePreview: ({ code }: { code: string }) => <div data-testid="live-preview">{code}</div>,
}));

const base: GeneratedComponent = {
  id: '1',
  prompt: '버튼',
  code: 'const A',
  createdAt: new Date(),
};

const renderCard = (component: GeneratedComponent) =>
  render(
    <ComponentCard component={component} onRemove={() => {}} onRegenerate={() => {}} isLoading={false} />,
  );

describe('ComponentCard 스트리밍 탭 전환', () => {
  it('스트리밍 중이면 코드 탭이 선택되고 누적된 코드를 보여준다', () => {
    renderCard({ ...base, streaming: true });

    expect(screen.getByRole('tab', { name: '코드' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('const A')).toBeInTheDocument();
    expect(screen.queryByTestId('live-preview')).not.toBeInTheDocument();
  });

  it('스트리밍이 끝나면 미리보기 탭으로 자동 전환한다', () => {
    const { rerender } = renderCard({ ...base, streaming: true });

    rerender(
      <ComponentCard
        component={{ ...base, code: 'const A = 1;', streaming: false }}
        onRemove={() => {}}
        onRegenerate={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByRole('tab', { name: '미리보기' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
  });

  it('스트리밍이 아닌 컴포넌트는 처음부터 미리보기 탭이다', () => {
    renderCard(base);

    expect(screen.getByRole('tab', { name: '미리보기' })).toHaveAttribute('aria-selected', 'true');
  });
});
