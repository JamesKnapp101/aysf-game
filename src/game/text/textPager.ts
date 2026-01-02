import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type UseTextPagerArgs = {
  text: string;
  containerRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
};

type PagerState = {
  pages: string[];
  pageIndex: number;
  hasMore: boolean;
  expanded: boolean;
  expand: () => void;
  nextPage: () => void;
  reset: () => void;
};

export function useTextPager({
  text,
  containerRef,
  enabled = true,
}: UseTextPagerArgs): PagerState {
  const measurerRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [pages, setPages] = useState<string[]>([text]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setPageIndex(0);
    setPages([text]);
  }, [text]);

  useLayoutEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.left = "-99999px";
    el.style.top = "0";
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";
    el.style.overflowWrap = "anywhere";
    document.body.appendChild(el);

    measurerRef.current = el;

    return () => {
      document.body.removeChild(el);
      measurerRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!enabled) {
      setPages([text]);
      setPageIndex(0);
      return;
    }

    if (expanded) {
      setPages([text]);
      setPageIndex(0);
      return;
    }

    const container = containerRef.current;
    const measurer = measurerRef.current;

    if (!container || !measurer) return;

    const compute = () => {
      const viewportHeight = container.clientHeight;

      if (viewportHeight <= 0) {
        setPages([text]);
        setPageIndex(0);
        return;
      }

      const cs = window.getComputedStyle(container);

      measurer.style.boxSizing = cs.boxSizing;
      measurer.style.width = `${container.clientWidth}px`;
      measurer.style.font = cs.font;
      measurer.style.letterSpacing = cs.letterSpacing;
      measurer.style.lineHeight = cs.lineHeight;
      measurer.style.padding = cs.padding;
      measurer.style.whiteSpace = "pre-wrap";
      measurer.style.wordBreak = "break-word";
      measurer.style.overflowWrap = "anywhere";

      const fits = (s: string) => {
        measurer.textContent = s;
        return measurer.scrollHeight <= viewportHeight;
      };
      const domOverflows = container.scrollHeight > container.clientHeight;

      if (!domOverflows && fits(text)) {
        setPages([text]);
        setPageIndex(0);
        return;
      }

      const out: string[] = [];
      let remaining = text;

      while (remaining.length > 0) {
        let lo = 1;
        let hi = remaining.length;
        let best = 1;

        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const candidate = remaining.slice(0, mid);
          if (fits(candidate)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        const raw = remaining.slice(0, best);
        const boundary = Math.max(raw.lastIndexOf("\n"), raw.lastIndexOf(" "));
        let chunk = raw;

        if (boundary > Math.max(10, Math.floor(best * 0.7))) {
          const nicer = raw.slice(0, boundary + 1);
          chunk = fits(nicer) ? nicer : raw;
        }

        out.push(chunk.trimEnd());
        remaining = remaining.slice(chunk.length).trimStart();

        if (out.length > 200) break;
      }

      setPages(out.length ? out : [text]);
      setPageIndex(0);
    };

    compute();

    const raf = requestAnimationFrame(compute);

    const ro = new ResizeObserver(() => compute());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, enabled, expanded, containerRef]);

  const nextPage = () => setPageIndex((i) => Math.min(i + 1, pages.length - 1));
  const reset = () => setPageIndex(0);
  const expand = () => setExpanded(true);

  return {
    pages,
    pageIndex,
    hasMore: !expanded && pageIndex < pages.length - 1,
    expanded,
    expand,
    nextPage,
    reset,
  };
}
