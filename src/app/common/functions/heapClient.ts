declare let window: any;

export const heapTrack = (event: string, properties?: Object) => {
  window.heap.track(event, properties);
};
