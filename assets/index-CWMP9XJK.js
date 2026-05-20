(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=document.querySelector(`#fetch-btn`),t=document.querySelector(`#download-btn`),n=document.querySelector(`#status`),r=document.querySelector(`#log`),i=document.querySelector(`#country`),a=document.querySelector(`#south`),o=document.querySelector(`#west`),s=document.querySelector(`#north`),c=document.querySelector(`#east`),l=null;function u(e){let t=new Date().toLocaleTimeString();r.textContent+=`[${t}] ${e}\n`,r.scrollTop=r.scrollHeight}function d(e,t=!1){n.textContent=e,n.style.color=t?`#ff4646`:`#646cff`,u(e)}async function f(){let n=i.value.trim(),r=a.value,u=o.value,f=s.value,p=c.value,m=``,h=``;if(n)h=`for "${n}"`,m=`
      [out:json][timeout:180];
      area["name"="${n}"]->.searchArea;
      (
        node["highway"="traffic_signals"](area.searchArea);
      );
      out body;
    `;else if(r&&u&&f&&p){let e=`(${r},${u},${f},${p})`;h=`for area ${e}`,m=`
      [out:json][timeout:180];
      node["highway"="traffic_signals"]${e};
      out body;
    `}else h=`globally (this may take a while and might timeout)`,m=`
      [out:json][timeout:180];
      node["highway"="traffic_signals"];
      out body;
    `;try{e.disabled=!0,t.disabled=!0,l=null,d(`Fetching data from Overpass API ${h}...`);let n=await fetch(`https://overpass-api.de/api/interpreter`,{method:`POST`,body:`data=${encodeURIComponent(m)}`});if(!n.ok)throw Error(`HTTP error! status: ${n.status}`);let r=await n.json();if(r.remark)throw Error(`Overpass Error: ${r.remark}`);l=r,d(`Successfully fetched ${l.elements?l.elements.length:0} traffic lights.`),t.disabled=!1}catch(e){console.error(`Fetch error:`,e),d(`Error: ${e instanceof Error?e.message:String(e)}`,!0)}finally{e.disabled=!1}}function p(){if(l)try{d(`Preparing JSON for download...`);let e=JSON.stringify(l,null,2),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n;let a=i.value.trim()?`traffic_lights_${i.value.trim().replace(/\\s+/g,`_`)}.json`:`traffic_lights.json`;r.download=a,document.body.appendChild(r),r.click(),setTimeout(()=>{document.body.removeChild(r),window.URL.revokeObjectURL(n)},0),d(`Download started: ${a}`)}catch(e){d(`Download error: ${e instanceof Error?e.message:String(e)}`,!0)}}e.addEventListener(`click`,f),t.addEventListener(`click`,p);