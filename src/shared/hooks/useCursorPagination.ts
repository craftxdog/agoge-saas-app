import { useState } from "react";

export const useCursorPagination = (initialLimit = 20) => {
  const [cursor, setCursor] = useState<string | undefined>();
  const [limit, setLimit] = useState(initialLimit);
  const [history, setHistory] = useState<Array<string | null>>([]);

  const reset = () => {
    setCursor(undefined);
    setHistory([]);
  };

  const updateLimit = (nextLimit: number) => {
    setLimit(nextLimit);
    reset();
  };

  const goNext = (nextCursor?: string | null) => {
    if (!nextCursor) return;

    setHistory((current) => [...current, cursor ?? null]);
    setCursor(nextCursor);
  };

  const goPrevious = () => {
    if (!history.length) return;

    const previousCursor = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setCursor(previousCursor ?? undefined);
  };

  return {
    cursor,
    limit,
    hasPreviousCursor: history.length > 0,
    reset,
    updateLimit,
    goNext,
    goPrevious,
  };
};
