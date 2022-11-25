declare let window: any;

const heapScript = (id: string | number) => `
  window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
  heap.load("${id}");
`;

const initialize = (id: string | number) => {
  if (!id) {
    throw new Error('No heap application id was provided.');
  }

  if (!document) {
    return;
  }

  const hasScript = !!document.getElementById('heap-script');

  if (hasScript) {
    return;
  }

  const script = document.createElement('script');

  script.innerHTML = heapScript(id);
  script.id = 'heap-script';
  script.async = true;

  document.body.appendChild(script);
};

initialize(process.env.REACT_APP_HEAP_APP_ID);

export const heapTrack = (event: string, properties?: Object) => {
  window.heap.track(event, properties);
};
