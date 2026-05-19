import './style.css'

const fetchBtn = document.querySelector<HTMLButtonElement>('#fetch-btn')!;
const downloadBtn = document.querySelector<HTMLButtonElement>('#download-btn')!;
const statusEl = document.querySelector<HTMLDivElement>('#status')!;
const logEl = document.querySelector<HTMLPreElement>('#log')!;

let fetchedData: any = null;

function log(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logEl.textContent += `[${timestamp}] ${message}\n`;
  logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(message: string) {
  statusEl.textContent = message;
  log(message);
}

async function fetchTrafficLights() {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';

  // Query to get all traffic signals globally.
  // Note: This might be a very large response.
  const fullQuery = `
    [out:json][timeout:180];
    node["highway"="traffic_signals"];
    out body;
  `;

  try {
    fetchBtn.disabled = true;
    downloadBtn.disabled = true;
    setStatus('Fetching data from Overpass API (this may take a while)...');

    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(fullQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    fetchedData = await response.json();
    const count = fetchedData.elements ? fetchedData.elements.length : 0;

    setStatus(`Successfully fetched ${count} traffic lights.`);
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Fetch error:', error);
    setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
    a.download = 'traffic_lights.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);

    setStatus('Download started.');
  } catch (error) {
    setStatus(`Download error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

fetchBtn.addEventListener('click', fetchTrafficLights);
downloadBtn.addEventListener('click', downloadJson);
