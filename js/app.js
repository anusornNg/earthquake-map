// Pre-announce map variable
let map, infoWindow;

/**
 * Initialize Google Maps and fetch JSONP document from API as well.
 * A callback function to be called right after Google Maps API downloaded.
 *
 * @return void
 */
async function initMap() {
  // Request needed libraries.
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");

  // Initialize Google Maps
  map = new Map(document.getElementById("map"), {
    center: { lat: 5.0, lng: -180.0 },
    zoom: 3,
    mapTypeId: "terrain",
    mapId: "DEMO_MAP_ID",
    streetViewControl: false,
  });

  // Initialize Global InfoWindow
  infoWindow = new InfoWindow({
    maxWidth: 300,
  });

  // Create a <script> tag and set the USGS URL as the source.
  const script = document.createElement("script");
  script.src = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojsonp";
  document.getElementsByTagName("head")[0].appendChild(script);
}

/**
 * Put marker on maps with each set of coordinate given by API
 *
 * @param string feeds GEOJSON string
 * @return void
 */
async function eqfeed_callback(feeds) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { features } = feeds;

  for (const data of features) {
    const title     = data.properties.place;
    const magnitude = data.properties.mag;
    const datetime  = new Date(data.properties.time);
    const url       = data.properties.url;
    const coords    = data.geometry.coordinates;
    const position  = { lat: coords[1], lng: coords[0] };

    const marker    = new AdvancedMarkerElement({
      map,
      position,
      title,
    });

    // Display marker's properties on InfoWindow
    marker.addListener('click', ({ domEvent, latLng }) => {
      const { target } = domEvent;
      const currentMarkerContent = `
        <div class="infoWindowContent">
          <h4><a href="${url}" target="_blank">${title}</a></h3>
          <p>Magnitude: ${magnitude}</p>
          <p>Coordinates: ${NEWS(position)}</p>
          <p>Time: ${datetime.toUTCString()}</p>
        </div>
      `
      infoWindow.close();
      infoWindow.setContent(currentMarkerContent);
      infoWindow.open(marker.map, marker);
    });
  }
};

/**
 * Translate Coordinates from positive/negative format to unsigned NEWS format
 *
 * @param float lat signed Latitude
 * @param float lng signed Longitude
 * @return string NEWS format coordinated
 */
function NEWS(position) {
  // Parse Number to Float
  const lat = Number.parseFloat(position.lat);
  const lng = Number.parseFloat(position.lng);

  // Coords number suffixes with ° sign
  let latSuffix, lngSuffix;
  latSuffix = lngSuffix = "&deg;";

  // Append Latitude Suffix
  if (lat > 0) latSuffix += "N";
  else if (lat < 0) latSuffix += "S";

  // Append Longitude Suffix
  if (lng > 0) lngSuffix += "E";
  else if (lng < 0) lngSuffix += "W";

  return `${Math.abs(lat).toFixed(4)}${latSuffix}, ${Math.abs(lng).toFixed(4)}${lngSuffix}`;
}

// Make functions global
window.initMap = initMap;
window.eqfeed_callback = eqfeed_callback;
