import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Markdown seguro: react-markdown no interpreta HTML crudo y filtra URLs peligrosas (javascript:, data:). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-estratec">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" decoding="async" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
