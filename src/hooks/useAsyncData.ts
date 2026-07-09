import { useEffect, useState } from "react";

type AsyncDataState<TData> = {
  data: TData | undefined;
  error: Error | undefined;
  isLoading: boolean;
};

export function useAsyncData<TData>(load: () => Promise<TData>, dependencies: unknown[] = []) {
  const [state, setState] = useState<AsyncDataState<TData>>({
    data: undefined,
    error: undefined,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    setState((current) => ({
      data: current.data,
      error: undefined,
      isLoading: true,
    }));

    load()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setState({
          data,
          error: undefined,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({
          data: undefined,
          error: error instanceof Error ? error : new Error("Unable to load local data."),
          isLoading: false,
        });
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
