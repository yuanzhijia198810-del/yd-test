import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Logger } from 'yd-libs';
import { useAverage, useLogger } from './index';

describe('useLogger', () => {
  it('creates memoized logger instances', () => {
    const { result, rerender } = renderHook((props: { prefix?: string }) =>
      useLogger({ prefix: props.prefix, level: 'info' }),
      { initialProps: { prefix: 'first' } },
    );

    const firstInstance = result.current;
    rerender({ prefix: 'first' });
    expect(result.current).toBe(firstInstance);

    rerender({ prefix: 'second' });
    expect(result.current).not.toBe(firstInstance);
  });
});

describe('useAverage', () => {
  it('calculates the average using yd-libs', () => {
    const { result } = renderHook(({ values }: { values: number[] }) => useAverage(values), {
      initialProps: { values: [1, 2, 3, 4] },
    });

    expect(result.current).toBe(2.5);
  });

  it('logs the calculated average when a logger is provided', () => {
    const logger = new Logger({ level: 'debug' });
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

    const { rerender } = renderHook(
      ({ values }: { values: number[] }) => useAverage(values, { logger, logLevel: 'info' }),
      {
        initialProps: { values: [1, 2] },
      },
    );

    expect(infoSpy).toHaveBeenCalledWith('Average: 1.5');

    rerender({ values: [4, 5] });
    expect(infoSpy).toHaveBeenCalledWith('Average: 4.5');
  });
});
