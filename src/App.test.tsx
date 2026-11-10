import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/storage';

function mockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/config') {
        return { ok: true, json: async () => ({ envKeys: { anthropic: false, google: false } }) };
      }
      return { ok: true, json: async () => ({ code: 'render(<div />);' }) };
    }),
  );
}

describe('App 설정 보존', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('저장된 제공자로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByLabelText('제공자')).toHaveValue('anthropic');
  });

  it('제공자를 바꾸면 다음 방문에도 유지된다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.selectOptions(screen.getByLabelText('제공자'), 'anthropic');
    first.unmount();

    render(<App />);
    expect(screen.getByLabelText('제공자')).toHaveValue('anthropic');
  });

  it('키 저장을 켜고 입력하면 다시 열어도 키가 채워져 있다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByLabelText('이 브라우저에 키 저장'));
    await user.type(screen.getByLabelText('API 키'), 'AIza-test');
    first.unmount();

    render(<App />);
    expect(screen.getByLabelText('API 키')).toHaveValue('AIza-test');
  });

  it('키 저장이 꺼져 있으면 다시 열었을 때 키가 비어 있다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByLabelText('API 키'), 'AIza-test');
    first.unmount();

    render(<App />);
    expect(screen.getByLabelText('API 키')).toHaveValue('');
  });

  it('생성한 요청이 최근 요청에 남고 다시 열어도 유지된다', async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByLabelText('API 키'), 'AIza-test');
    await user.type(screen.getByRole('textbox', { name: '무엇을 만들까요?' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    expect(await screen.findByRole('button', { name: '프로필 카드' })).toBeInTheDocument();
    first.unmount();

    render(<App />);
    expect(screen.getByRole('button', { name: '프로필 카드' })).toBeInTheDocument();
  });
});
