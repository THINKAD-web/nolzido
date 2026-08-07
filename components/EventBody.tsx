import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 행사 본문 마크다운 렌더러. description은 외부 콘텐츠(공공데이터/크롤링/파트너)라
// XSS를 방어해야 한다. react-markdown은 rehype-raw 없이는 원본 HTML을 HTML로
// 해석하지 않고(=<script>, onerror 등이 무해화됨), 위험한 링크 프로토콜도
// 기본 URL transform이 걸러낸다. 그래서 별도 DOMPurify 단계가 필요 없다.
// remark-gfm은 표/취소선/체크박스 등 GFM 문법 지원용(새니타이징과 무관).

interface EventBodyProps {
  markdown: string;
}

export function EventBody({ markdown }: EventBodyProps) {
  return (
    <div className="prose-nolzido space-y-4 text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h2 className="font-display text-2xl font-black">{children}</h2>,
          h2: ({ children }) => <h3 className="font-display text-xl font-black">{children}</h3>,
          h3: ({ children }) => <h4 className="text-lg font-bold">{children}</h4>,
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cobalt underline">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-line pl-4 text-muted">{children}</blockquote>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
