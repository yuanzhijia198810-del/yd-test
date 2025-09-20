import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useAverage, useLogger } from 'yd-hooks';

const e = React.createElement;

const DEFAULT_VALUES = [12, 18, 24, 30];

function formatNumber(value, precision) {
  return value.toFixed(Math.max(0, precision));
}

function App() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [input, setInput] = useState('32');
  const [precision, setPrecision] = useState(2);
  const [error, setError] = useState('');

  const logger = useLogger({ prefix: 'YD Hooks Demo', level: 'debug' });
  const average = useAverage(values, { logger, logLevel: 'info', precision });

  const lastUpdated = useMemo(() => new Date().toLocaleTimeString(), [average]);

  function handleAddValue() {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      setError('请输入一个数字');
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setError('格式不对呀，再试一次');
      return;
    }

    setValues([...values, parsed]);
    setInput('');
    setError('');
  }

  function handleRemoveLast() {
    if (values.length <= 1) {
      return;
    }
    setValues(values.slice(0, values.length - 1));
  }

  function handleReset() {
    setValues(DEFAULT_VALUES);
    setInput('32');
    setPrecision(2);
    setError('');
  }

  function handlePrecisionChange(event) {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) {
      return;
    }
    setPrecision(Math.min(6, Math.max(0, next)));
  }

  const valuePills = values.map((value, index) =>
    e(
      'div',
      {
        className: 'value-pill',
        key: `${value}-${index}`,
      },
      `${value}`,
    ),
  );

  return e(
    'div',
    { className: 'app-card' },
    e('h1', { className: 'app-title' }, 'YD Hooks 数字面板'),
    e(
      'p',
      { className: 'app-description' },
      '通过自研 React Hooks 私仓实时计算平均值，日志输出可以在控制台里看到。',
    ),
    e(
      'div',
      { className: 'controls' },
      e(
        'div',
        { className: 'control-panel' },
        e('label', null, '新增数据'),
        e('input', {
          className: 'text-input',
          type: 'number',
          inputMode: 'decimal',
          value: input,
          onInput: (event) => setInput(event.target.value),
          placeholder: '例如 28.5',
        }),
        e('div', { className: 'button-row' },
          e(
            'button',
            {
              type: 'button',
              className: 'app-button primary',
              onClick: handleAddValue,
            },
            '加入序列',
          ),
          e(
            'button',
            {
              type: 'button',
              className: 'app-button secondary',
              onClick: handleRemoveLast,
              disabled: values.length <= 1,
            },
            '移除末尾',
          ),
        ),
        e('span', { className: 'error-text' }, error),
      ),
      e(
        'div',
        { className: 'control-panel' },
        e('label', null, '保留小数位数'),
        e('input', {
          className: 'text-input',
          type: 'number',
          min: 0,
          max: 6,
          value: String(precision),
          onInput: handlePrecisionChange,
        }),
        e(
          'button',
          {
            type: 'button',
            className: 'app-button secondary',
            onClick: handleReset,
          },
          '恢复默认数据',
        ),
      ),
    ),
    e(
      'div',
      { className: 'stats' },
      e(
        'div',
        { className: 'stat-card' },
        e('h3', null, '当前平均值'),
        e('strong', null, formatNumber(average, precision)),
      ),
      e(
        'div',
        { className: 'stat-card' },
        e('h3', null, '样本数量'),
        e('strong', null, `${values.length}`),
      ),
      e(
        'div',
        { className: 'stat-card' },
        e('h3', null, '上次更新'),
        e('strong', null, lastUpdated),
      ),
    ),
    e(
      'div',
      { className: 'value-grid' },
      ...valuePills,
    ),
    values.length === 0
      ? e('div', { className: 'empty-hint' }, '请至少保留一个数据点，才能计算平均值哦~')
      : null,
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(e(App));
