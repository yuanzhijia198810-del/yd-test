const TEXT_ELEMENT = Symbol('TEXT_ELEMENT');
const Fragment = Symbol('Fragment');

function createTextElement(value) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: value == null ? '' : String(value),
      children: [],
    },
  };
}

function normalizeChild(child, target) {
  if (Array.isArray(child)) {
    child.forEach((nested) => normalizeChild(nested, target));
    return;
  }

  if (child === null || child === undefined || child === false) {
    return;
  }

  if (typeof child === 'object') {
    target.push(child);
    return;
  }

  target.push(createTextElement(child));
}

function createElement(type, props, ...children) {
  const finalProps = { ...(props ?? {}) };
  const normalizedChildren = [];
  const initialChildren = [];

  if (finalProps.children !== undefined) {
    initialChildren.push(finalProps.children);
    delete finalProps.children;
  }

  if (children.length > 0) {
    initialChildren.push(children);
  }

  initialChildren.forEach((child) => normalizeChild(child, normalizedChildren));

  finalProps.children = normalizedChildren;
  return { type, props: finalProps };
}

function ensureRendering(hookName) {
  if (!currentInstance) {
    throw new Error(`${hookName} can only be used while rendering a component.`);
  }
}

function areHookDepsEqual(prevDeps, nextDeps) {
  if (prevDeps === null || nextDeps === null) {
    return false;
  }
  if (prevDeps.length !== nextDeps.length) {
    return false;
  }
  for (let index = 0; index < prevDeps.length; index += 1) {
    if (!Object.is(prevDeps[index], nextDeps[index])) {
      return false;
    }
  }
  return true;
}

function cleanupInstance(instance) {
  if (!instance || !instance.hooks) {
    return;
  }
  instance.hooks.forEach((hook) => {
    if (hook && typeof hook.cleanup === 'function') {
      try {
        hook.cleanup();
      } catch (error) {
        console.error('Error during effect cleanup:', error);
      }
      hook.cleanup = undefined;
    }
  });
}

function setDomProperty(dom, key, value) {
  if (key === 'children' || value === undefined) {
    return;
  }
  if (key === 'className') {
    dom.className = value;
    return;
  }
  if (key === 'style' && value && typeof value === 'object') {
    Object.entries(value).forEach(([styleKey, styleValue]) => {
      if (styleValue !== undefined && styleValue !== null) {
        dom.style[styleKey] = styleValue;
      }
    });
    return;
  }
  if (key === 'dangerouslySetInnerHTML' && value && typeof value === 'object') {
    dom.innerHTML = value.__html ?? '';
    return;
  }
  if (key.startsWith('on') && typeof value === 'function') {
    const eventName = key.slice(2).toLowerCase();
    dom.addEventListener(eventName, value);
    return;
  }
  dom.setAttribute(key, value);
}

function commitChildren(children, parentDom, path, root, prevInstances, nextInstances) {
  children.forEach((child, index) => {
    commitElement(child, parentDom, `${path}.${index}`, root, prevInstances, nextInstances);
  });
}

function commitComponent(element, parentDom, path, root, prevInstances, nextInstances) {
  const prevInstance = prevInstances.get(path);
  const hooks = prevInstance ? prevInstance.hooks : [];
  const instance = {
    hooks,
    pendingEffects: [],
    path,
  };

  nextInstances.set(path, instance);

  const previousInstance = currentInstance;
  const previousHookIndex = currentHookIndex;
  const previousRoot = currentRenderingRoot;

  currentInstance = instance;
  currentHookIndex = 0;
  currentRenderingRoot = root;

  let rendered;
  try {
    rendered = element.type({ ...element.props });
  } finally {
    currentInstance = previousInstance;
    currentHookIndex = previousHookIndex;
    currentRenderingRoot = previousRoot;
  }

  const normalized = [];
  normalizeChild(rendered, normalized);

  commitChildren(normalized, parentDom, path, root, prevInstances, nextInstances);
  root.effectJobs.push(...instance.pendingEffects);
}

function commitElement(element, parentDom, path, root, prevInstances, nextInstances) {
  if (element === null || element === undefined || element === false) {
    return;
  }

  if (Array.isArray(element)) {
    commitChildren(element, parentDom, path, root, prevInstances, nextInstances);
    return;
  }

  const { type, props } = element;

  if (type === TEXT_ELEMENT) {
    const textNode = document.createTextNode(props.nodeValue ?? '');
    parentDom.appendChild(textNode);
    return;
  }

  if (type === Fragment) {
    commitChildren(props.children ?? [], parentDom, path, root, prevInstances, nextInstances);
    return;
  }

  if (typeof type === 'function') {
    commitComponent(element, parentDom, path, root, prevInstances, nextInstances);
    return;
  }

  const dom = document.createElement(type);
  Object.entries(props ?? {}).forEach(([key, value]) => setDomProperty(dom, key, value));
  parentDom.appendChild(dom);

  commitChildren(props?.children ?? [], dom, path, root, prevInstances, nextInstances);
}

function cleanupRemovedInstances(prevInstances, nextInstances) {
  prevInstances.forEach((instance, key) => {
    if (!nextInstances.has(key)) {
      cleanupInstance(instance);
    }
  });
}

function performRender(root) {
  if (!root.element) {
    return;
  }
  if (root.isRendering) {
    root.pending = true;
    return;
  }

  root.isRendering = true;
  const prevInstances = root.instances;
  const nextInstances = new Map();
  root.effectJobs = [];

  root.container.innerHTML = '';
  commitElement(root.element, root.container, '0', root, prevInstances, nextInstances);

  cleanupRemovedInstances(prevInstances, nextInstances);

  root.instances = nextInstances;
  root.isRendering = false;

  const jobs = root.effectJobs;
  root.effectJobs = [];
  jobs.forEach((job) => {
    try {
      job();
    } catch (error) {
      console.error('Error running effect:', error);
    }
  });

  if (root.pending) {
    root.pending = false;
    scheduleRootRender(root);
  }
}

function scheduleRootRender(root) {
  if (root.isRendering) {
    root.pending = true;
    return;
  }
  if (root.scheduled) {
    return;
  }
  root.scheduled = true;
  queueMicrotask(() => {
    root.scheduled = false;
    performRender(root);
  });
}

function createRootState(container) {
  return {
    container,
    element: null,
    instances: new Map(),
    effectJobs: [],
    isRendering: false,
    pending: false,
    scheduled: false,
  };
}

function createRoot(container) {
  if (!container || typeof container.appendChild !== 'function') {
    throw new Error('createRoot expects a valid DOM container.');
  }
  let root = roots.get(container);
  if (!root) {
    root = createRootState(container);
    roots.set(container, root);
  }
  return {
    render(element) {
      root.element = element;
      performRender(root);
    },
  };
}

function useState(initialValue) {
  ensureRendering('useState');
  const hooks = currentInstance.hooks;
  const hookIndex = currentHookIndex;
  currentHookIndex += 1;

  if (!hooks[hookIndex]) {
    const value = typeof initialValue === 'function' ? initialValue() : initialValue;
    const hook = {
      state: value,
      root: currentRenderingRoot,
    };
    hook.setState = (nextValue) => {
      const resolved = typeof nextValue === 'function' ? nextValue(hook.state) : nextValue;
      if (!Object.is(resolved, hook.state)) {
        hook.state = resolved;
        scheduleRootRender(hook.root);
      }
    };
    hooks[hookIndex] = hook;
  } else {
    hooks[hookIndex].root = currentRenderingRoot;
  }

  const hook = hooks[hookIndex];
  return [hook.state, hook.setState];
}

function useRef(initialValue) {
  ensureRendering('useRef');
  const hooks = currentInstance.hooks;
  const hookIndex = currentHookIndex;
  currentHookIndex += 1;

  if (!hooks[hookIndex]) {
    hooks[hookIndex] = { current: initialValue };
  }

  return hooks[hookIndex];
}

function resolveDeps(deps) {
  if (deps === undefined) {
    return null;
  }
  return deps;
}

function useMemo(factory, deps) {
  ensureRendering('useMemo');
  const hooks = currentInstance.hooks;
  const hookIndex = currentHookIndex;
  currentHookIndex += 1;
  const normalizedDeps = resolveDeps(deps);

  let hook = hooks[hookIndex];
  const shouldRecompute =
    !hook ||
    hook.value === undefined ||
    normalizedDeps === null ||
    !areHookDepsEqual(hook.deps, normalizedDeps);

  if (shouldRecompute) {
    const value = factory();
    hook = {
      value,
      deps: normalizedDeps,
    };
    hooks[hookIndex] = hook;
  }

  return hook.value;
}

function useEffect(effect, deps) {
  ensureRendering('useEffect');
  const hooks = currentInstance.hooks;
  const hookIndex = currentHookIndex;
  currentHookIndex += 1;
  const normalizedDeps = resolveDeps(deps);

  let hook = hooks[hookIndex];
  const shouldRun =
    !hook ||
    hook.cleanup === undefined ||
    normalizedDeps === null ||
    !areHookDepsEqual(hook.deps, normalizedDeps);

  if (!hook) {
    hook = {};
    hooks[hookIndex] = hook;
  }

  if (shouldRun) {
    const pendingEffect = () => {
      if (hook.cleanup) {
        try {
          hook.cleanup();
        } catch (error) {
          console.error('Error during effect cleanup:', error);
        }
      }
      const cleanup = effect();
      hook.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
      hook.deps = normalizedDeps;
    };
    currentInstance.pendingEffects.push(pendingEffect);
  }
}

const roots = new Map();
let currentRenderingRoot = null;
let currentInstance = null;
let currentHookIndex = 0;

const React = {
  createElement,
  Fragment,
  useState,
  useMemo,
  useEffect,
  useRef,
};

Object.defineProperty(React, '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED', {
  value: {
    createRoot,
  },
  enumerable: false,
});

export { createElement, Fragment, useEffect, useMemo, useRef, useState };
export { createRoot };
export default React;
