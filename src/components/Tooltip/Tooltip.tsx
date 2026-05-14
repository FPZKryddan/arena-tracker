import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps extends React.PropsWithChildren {
  text?: string;
  extra?: string;
  renderContent?: () => React.ReactNode;
  delay?: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toRem = (value: number): string => {
  const rootFontSize =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return `${value / rootFontSize}rem`;
};

const Tooltip = ({
  text,
  extra,
  children,
  renderContent,
  delay = 100,
}: TooltipProps) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const tooltipElementRef = useRef<HTMLDivElement | null>(null);
  const triggerElementRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsHovering(true), delay);
  };

  const hideTooltip = (): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsHovering(false), 50);
  };

  useLayoutEffect(() => {
    if (isHovering && tooltipElementRef.current && triggerElementRef.current) {
      const tooltipRect = tooltipElementRef.current.getBoundingClientRect();
      const triggerRect = triggerElementRef.current.getBoundingClientRect();

      const hasSpaceAbove = triggerRect.top - tooltipRect.height > 0;
      const gap = 8;
      const maxTop = window.innerHeight - tooltipRect.height;
      const maxLeft = window.innerWidth - tooltipRect.width;

      const top = hasSpaceAbove
        ? triggerRect.top - tooltipRect.height - gap
        : triggerRect.top + triggerRect.height + gap;
      const left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      tooltipElementRef.current.style.top = toRem(clamp(top, 0, maxTop));
      tooltipElementRef.current.style.left = toRem(clamp(left, 0, maxLeft));
    }
  }, [isHovering]);

  return (
    <div
      className="relative group z-10"
      onMouseEnter={() => showTooltip()}
      onMouseLeave={hideTooltip}
      ref={triggerElementRef}
    >
      {children}
      {createPortal(
        <div
          className={`fixed z-100 rounded-md border border-border bg-surface text-fg
          ${isHovering ? "opacity-100" : "opacity-0 pointer-events-none"}
          ${text ? "px-4 py-2" : ""}
          max-w-screen text-nowrap text-sm font-medium transition-opacity duration-150`}
          ref={tooltipElementRef}
        >
          {text && <p>{text}</p>}
          {extra && <p className="text-xs font-normal mt-1">{extra}</p>}
          {isHovering && renderContent && renderContent()}
        </div>
      , document.body)}
    </div>
  );
};

export default Tooltip;
