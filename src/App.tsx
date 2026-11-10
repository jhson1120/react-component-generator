import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { TreeMark, MorningScene } from './components/Illustrations';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { useApiSettings } from './hooks/useApiSettings';
import { usePromptHistory } from './hooks/usePromptHistory';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const { provider, setProvider, apiKey, setApiKey, rememberKey, setRememberKey } = useApiSettings();
  const { history, addPrompt, clearHistory } = usePromptHistory();
  const [showKey, setShowKey] = useState(false);
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];
  const keyReady = hasEnvKey || apiKey.trim().length > 0;

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    addPrompt(prompt);
    generate(prompt, apiKey || undefined, provider);
  };

  return (
    <div className="app">
      <header className="menubar">
        <h1 className="brand">
          <TreeMark />
          React 컴포넌트 생성기
        </h1>

        <div className="menu-field">
          <label htmlFor="provider">제공자</label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="menu-field menu-field--key">
          <label htmlFor="api-key">API 키</label>
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasEnvKey ? '서버 키 사용 중' : PROVIDER_CONFIG[provider].placeholder}
            autoComplete="off"
          />
          <button className="btn" onClick={() => setShowKey(!showKey)} type="button">
            {showKey ? '숨기기' : '보기'}
          </button>
          <label
            className="menu-check"
            title="켜면 이 브라우저의 localStorage에 키가 평문으로 저장됩니다. 공용 PC에서는 켜지 마세요."
          >
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
            />
            이 브라우저에 키 저장
          </label>
        </div>

        <p className={`key-status ${keyReady ? 'key-status--ready' : ''}`} role="status">
          <span className="key-lamp" aria-hidden="true" />
          {hasEnvKey
            ? '.env 키 연결됨'
            : apiKey.trim()
              ? '입력한 키 사용'
              : '키가 필요합니다'}
        </p>

        <div className="menu-end">
          <span>컴포넌트 {components.length}개</span>
          {components.length > 0 && (
            <button className="btn btn--danger" onClick={clearAll}>
              전체 삭제
            </button>
          )}
        </div>
      </header>

      <main className="desktop">
        <section className="window composer" aria-label="새 요청">
          <div className="titlebar">
            <h2>새 요청</h2>
          </div>
          <PromptInput
            onGenerate={handleGenerate}
            isLoading={isLoading}
            history={history}
            onClearHistory={clearHistory}
          />
        </section>

        <section className="results" aria-label="생성 결과">
          {error && (
            <div className="alert" role="alert">
              <strong>오류</strong>
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="window loading" role="status">
              <div className="titlebar">
                <h2>생성 중</h2>
              </div>
              <div className="window-body">
                <p>컴포넌트를 생성하고 있습니다...</p>
                <div className="progress" aria-hidden="true" />
              </div>
            </div>
          )}

          {components.length === 0 && !isLoading && (
            <div className="window empty">
              <div className="window-body">
                <div className="empty-screen">
                  <MorningScene />
                </div>
                <h2>아직 만든 컴포넌트가 없습니다</h2>
                <p>왼쪽에 요청을 입력하고 생성하면, 이곳에 미리보기 창이 열립니다.</p>
              </div>
            </div>
          )}

          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
