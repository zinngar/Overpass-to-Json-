import './style.css'

const fetchBtn = document.querySelector<HTMLButtonElement>('#fetch-btn')!;
const downloadBtn = document.querySelector<HTMLButtonElement>('#download-btn')!;
const statusEl = document.querySelector<HTMLDivElement>('#status')!;
const logEl = document.querySelector<HTMLPreElement>('#log')!;

const countryInput = document.querySelector<HTMLInputElement>('#country')!;
const southInput = document.querySelector<HTMLInputElement>('#south')!;
const westInput = document.querySelector<HTMLInputElement>('#west')!;
const northInput = document.querySelector<HTMLInputElement>('#north')!;
const eastInput = document.querySelector<HTMLInputElement>('#east')!;

let fetchedData: any = null;

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logEl.textContent += `[${timestamp}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(message: string, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#ff4646' : '#646cff';
  log(message);
}

async function fetchTrafficLights() {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';

  const country = countryInput.value.trim();
  const s = southInput.value;
  const w = westInput.value;
  const n = northInput.value;
  const e = eastInput.value;

  let query = '';
  let areaInfo = '';

  if (country) {
    areaInfo = `for "${country}"`;
    query = `
      [out:json][timeout:180];
      area["name"="${country}"]->.searchArea;
      (
        node["highway"="traffic_signals"](area.searchArea);
      );
      out body;
    `;
  } else if (s && w && n && e) {
    const bbox = `(${s},${w},${n},${e})`;
    areaInfo = `for area ${bbox}`;
    query = `
      [out:json][timeout:180];
      node["highway"="traffic_signals"]${bbox};
      out body;
    `;
  } else {
    areaInfo = 'globally (this may take a while and might timeout)';
    query = `
      [out:json][timeout:180];
      node["highway"="traffic_signals"];
      out body;
    `;
  }

  try {
    fetchBtn.disabled = true;
    downloadBtn.disabled = true;
    fetchedData = null;
    setStatus(`Fetching data from Overpass API ${areaInfo}...`);

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.remark) {
      throw new Error(`Overpass Error: ${data.remark}`);
    }

    fetchedData = data;
    const count = fetchedData.elements ? fetchedData.elements.length : 0;

    setStatus(`Successfully fetched ${count} traffic lights.`);
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Fetch error:', error);
    setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`, true);
  } finally {
    fetchBtn.disabled = false;
  }
}

function downloadJson() {
  if (!fetchedData) return;

  try {
    setStatus('Preparing JSON for download...');
    const jsonString = JSON.stringify(fetchedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const filename = countryInput.value.trim() ? `traffic_lights_${countryInput.value.trim().replace(/\\s+/g, '_')}.json` : 'traffic_lights.json';
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);

    setStatus(`Download started: ${filename}`);
  } catch (error) {
    setStatus(`Download error: ${error instanceof Error ? error.message : String(error)}`, true);
  }
}

fetchBtn.addEventListener('click', fetchTrafficLights);
downloadBtn.addEventListener('click', downloadJson);
