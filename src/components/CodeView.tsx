import { useState, useEffect, useRef } from 'react';

interface CodeViewProps {
  code: string;
  streaming?: boolean;
}

export function CodeView({ code, streaming = false }: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const blockRef = useRef<HTMLPreElement>(null);

  // 스트리밍 중에는 새 코드가 도착할 때마다 맨 아래로 스크롤한다.
  useEffect(() => {
    if (streaming && blockRef.current) {
      blockRef.current.scrollTop = blockRef.current.scrollHeight;
    }
  }, [code, streaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-panel">
      <pre className="code-block" ref={blockRef}>
        <code>{code}</code>
        {streaming && <span className="code-cursor" aria-hidden="true" />}
      </pre>
      <button className="btn btn--primary btn-copy" onClick={handleCopy} disabled={streaming}>
        {streaming ? '생성 중...' : copied ? '복사됨!' : '코드 복사'}
      </button>
    </div>
  );
}
