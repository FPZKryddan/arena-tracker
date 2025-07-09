import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps extends React.PropsWithChildren {
  text?: string;
  extra?: string;
  renderContent?: () => React.ReactNode;
  delay?: number;
}

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
      console.log("HUBBE", tooltipRect.height);

      const hasSpaceAbove = triggerRect.top - tooltipRect.height > 0;
      const gap = 8;

      if (hasSpaceAbove) {
        tooltipElementRef.current.style.top = `clamp(0px, ${triggerRect.top - tooltipRect.height - gap}px, ${window.innerHeight - tooltipRect.height}px)`;
      } else {
        tooltipElementRef.current.style.top = `clamp(0px, ${triggerRect.top + triggerRect.height + gap}px, ${window.innerHeight - tooltipRect.height}px)`;
      }

      tooltipElementRef.current.style.left = `clamp(0px, ${triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2}px, ${window.innerWidth - tooltipRect.width}px)`;
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
          className={`fixed z-10 bg-gray-300 rounded-2xl shadow-2xl
          ${isHovering ? "opacity-100" : "opacity-0 pointer-events-none"} 
          ${text ? "px-4 py-2" : ""}
          transition-opacity duration-150 delay-[${delay}] text-black text-[14px] text-nowrap font-medium max-w-screen shadow-md`}
          ref={tooltipElementRef}
        >
          {text && <p>{text}</p>}
          {extra && <p className="text-[12px] font-normal mt-[4px]">{extra}</p>}
          {isHovering && renderContent && renderContent()}
        </div>
      , document.body)}
    </div>
  );
};

export default Tooltip;
