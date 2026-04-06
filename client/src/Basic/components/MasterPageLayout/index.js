import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

const MasterPageLayout = ({
  title,
  addButtonLabel,
  onAdd,
  onKeyDown,
  children,
  className = "",
  titleClassName = "text-2xl font-bold text-gray-800",
  headerActions = null,
}) => {
  const pageContainerRef = useRef(null);
  const [availableViewportHeight, setAvailableViewportHeight] = useState(null);

  const syncAvailableViewportHeight = useCallback(() => {
    if (typeof window === "undefined" || !pageContainerRef.current) {
      return;
    }

    const { top } = pageContainerRef.current.getBoundingClientRect();
    const nextHeight = Math.max(window.innerHeight - Math.max(top, 0), 320);

    setAvailableViewportHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight
    );
  }, []);

  useLayoutEffect(() => {
    syncAvailableViewportHeight();

    if (typeof window === "undefined") {
      return undefined;
    }

    const scheduleSync = () => {
      window.requestAnimationFrame(syncAvailableViewportHeight);
    };

    window.addEventListener("resize", scheduleSync);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleSync);

      if (pageContainerRef.current?.parentElement) {
        resizeObserver.observe(pageContainerRef.current.parentElement);
      }

      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", scheduleSync);
      resizeObserver?.disconnect();
    };
  }, [syncAvailableViewportHeight]);

  return (
    <div
      ref={pageContainerRef}
      onKeyDown={onKeyDown}
      className={`flex min-h-0 flex-col p-1 pb-3 ${className}`}
      style={availableViewportHeight ? { height: `${availableViewportHeight}px` } : undefined}
    >
      <div className="flex w-full shrink-0 items-center justify-between bg-white p-1">
        <h5 className={titleClassName}>{title}</h5>
        {headerActions ? (
          <div className="flex items-center gap-4">{headerActions}</div>
        ) : (
          <div className="flex items-center">
            <button
              onClick={onAdd}
              className="flex items-center gap-2 rounded-md border border-indigo-600 bg-white px-4 py-1 text-sm text-indigo-600 shadow transition-colors duration-200 hover:bg-indigo-700 hover:text-white"
            >
              {addButtonLabel}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
};

export default MasterPageLayout;
