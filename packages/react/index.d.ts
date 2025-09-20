export type ReactNode = ReactElement | string | number | boolean | null | undefined;

export interface ReactElement<P = any, T = any> {
  readonly type: T;
  readonly props: P & { children?: ReactNode[] };
}

export interface RefObject<T> {
  current: T;
}

export function createElement<P>(
  type: any,
  props?: P | null,
  ...children: ReactNode[]
): ReactElement<P>;

export const Fragment: unique symbol;

export function useState<S>(
  initialState: S | (() => S),
): [S, (value: S | ((prev: S) => S)) => void];

export function useMemo<T>(factory: () => T, deps?: ReadonlyArray<any>): T;

export function useEffect(
  effect: () => void | (() => void),
  deps?: ReadonlyArray<any>,
): void;

export function useRef<T>(initialValue: T): RefObject<T>;

export interface Root {
  render(element: ReactElement | ReactNode): void;
}

export function createRoot(container: Element | DocumentFragment): Root;

declare const React: {
  createElement: typeof createElement;
  Fragment: typeof Fragment;
  useState: typeof useState;
  useMemo: typeof useMemo;
  useEffect: typeof useEffect;
  useRef: typeof useRef;
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    createRoot: typeof createRoot;
  };
};

export default React;

export namespace JSX {
  interface Element extends ReactElement {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
