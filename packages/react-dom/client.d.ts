import type { ReactElement } from 'react';

export interface Root {
  render(element: ReactElement | null): void;
}

export function createRoot(container: Element | DocumentFragment): Root;

declare const ReactDOMClient: {
  createRoot: typeof createRoot;
};

export default ReactDOMClient;
