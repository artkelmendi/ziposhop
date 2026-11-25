export const collectionPosition = track => track.evaluate(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41);

// Observe rendered pixels, independent of how the carousel is animated.
export const collectionSpeed = (track, milliseconds = 100) => track.evaluate(async (node, delay) => {
  const period = node.firstElementChild.getBoundingClientRect().width;
  const x = () => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41;
  const before = x();
  const start = performance.now();
  await new Promise(resolve => setTimeout(resolve, delay));
  let delta = x() - before;
  if (delta > period / 2) delta -= period;
  if (delta < -period / 2) delta += period;
  return -delta / ((performance.now() - start) / 1000);
}, milliseconds);
