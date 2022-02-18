import layers from "./layers.js";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function decimalToPercent(x) {
  return x ? Math.floor(x * 100) + "%" : "N/A";
}

function abbreviateNumber(num, fixed) {
  if (num === null) {
    return null;
  } // terminate early
  if (num === 0) {
    return "0";
  } // terminate early
  fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
  var b = num.toPrecision(2).split("e"), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c =
      k < 1
        ? num.toFixed(0 + fixed)
        : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ["", "K", "M", "B", "T"][k]; // append power
  return e;
}

var activeLayers = [];

function generateLegend() {
    var allColors = ["#FFE39F", "#F5C47C", "#E7A55D", "#D78742", "#C66A2C", "#B24C1A"];
    var firstNumberRemoved = [4,16,64,256,1024,0];
    var html = `
      <div class="legend-container legend-step">
        <div class="legend-header">Legend</div>
        <div class="legend-description">Population for selected categories</div>
        <div class="legend-colors">
          ${allColors
            .map(
              (color) =>
                `<div class="legend-color" style="background-color: ${color}"></div>`
            )
            .join("")}
        </div>
        <div class="legend-numbers">
        ${firstNumberRemoved
          .map(
            (number) =>
              `<div class="legend-number">${number}</div>`
          )
          .join("")}
        </div>
      </div>
    `;
  document.getElementById("legend").innerHTML = html;
}


function changeBasemap(index) {

  var layersDisplay = [];

  document
    .getElementById("layer-picker-demographics")
    .querySelectorAll('input[type=checkbox]:checked')
    .forEach(l=>{
      layersDisplay.push(l.value)
    });

  const filterLayers = layersDisplay.map(l=>{
    return ["to-number", ['get', l]]
  })

  var propLineColor =
    [
      'step', // arg 1
      ['+', 0, ...filterLayers] , // arg 2
      ...blockBorderColors
    ]

  var propLineOverlay =
    [
      'case',
      ['boolean', ['>', ['+', 0, ...filterLayers], 0]],
      .6,
      0
    ]

  console.log('changeBasemap, prop ', propLineColor)
  map.setPaintProperty('block-borders', 'line-color', propLineColor)
  map.setPaintProperty('block-borders', 'line-opacity', propLineOverlay)
}

function generateLayerPicker() {
  var numberOfCanopyLayers = layers.filter(
    (layer) => layer.type === "canopy" || layer.type === "canopy-none"
  ).length;

  var layerPickerBasemap = layers
    .map((item, index) => {
      return `<label><input ${
        index === 0 ? "checked" : ""
      } value="${item.identifier}" name="${item.display} "type="checkbox" onclick="changeBasemap(${
        index + numberOfCanopyLayers
      })">${item.display}</label>`;
    })
    .join("");
  document.getElementById("layer-picker-demographics").innerHTML =
    layerPickerBasemap;
}

function updateLayerPicker() {
  const inputs = document
    .getElementById("layer-picker-demographics")
    .querySelectorAll("input");
}

const blockBorderColors = [
"#FFE39F",
0, "#F5C47C",
4, "#E7A55D",
16, "#D78742",
64, "#C66A2C",
256, "#B24C1A",
1024, "#9E2B0E"]


const initialMapFilter = ["to-number", ['get',  layers[0].identifier]]

maplibregl.accessToken = 'pk.eyJ1IjoibHVrZW1ja2luc3RyeSIsImEiOiJjajU0ODRsNmMwMHg2MndxeWsxMXhpY3k5In0.yM_-IJxaryqd9i5Rt6k8LA';

const map = new maplibregl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-95.8,38.89],
  zoom: 3.93,
  bearing: 0,
  pitch: 0,
  minZoom: 3,
  maxZoom: 20,
  hash: true,
  showCompass: true,
  showZoom: true,
});

map.addControl(new maplibregl.NavigationControl());
 
map.on('load', () => {
  map.addSource('group-quarters', {
    'type': 'vector',
    'tiles': [window.location.origin + "/tiles/{z}/{x}/{y}.pbf"],
    'minzoom': 3,
    'maxzoom': 18
  });
  map.addLayer(
    {
      'id': 'block-borders', // Layer ID
      'type': 'line',
      'source': 'group-quarters', // ID of the tile source created above
      'source-layer': 'blocks',
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-opacity': [
          'case',
          ['boolean', ['>', ['+', 0, initialMapFilter], 0]],
          .6,
          0
        ],
        //'line-color': 'rgb(53, 175, 109)',
        //'line-color': ['get', ["to-number", "P5_001N"]], 
        'line-color': [
          'step', // arg 1
          ['+', 0, initialMapFilter] , // arg 2
          ...blockBorderColors
          ],
        'line-width': 4
    }
  });
  map.addLayer(
    {
      id: "blocks-polygons",
      type: "fill",
      source: "group-quarters",
      "source-layer": "blocks",
      paint: {
        "fill-opacity-transition": {
          duration: 0,
          delay: 0,
        },
        "fill-color": '#000',
        "fill-opacity": [
          "match",
          ["feature-state", "highlight"],
          "true",
          .4,
          0
         ]
      },
    });
});


document.onkeydown = function (e) {
  if (e.key === "Escape") {
    if ($body.classList.contains("modal-open")) hideModal();
    if (map.getLayer("raster-tiles")) returnToPrimary(true);
  }
};

function showModal() {
  bodyElement.className += " modal-open";
}

function hideModal() {
  bodyElement.classList.remove("modal-open");
}

window.oldHighlightId = undefined;
window.closedOnClick = undefined;

var tooltipEl = document.getElementById("tooltip");

const popup = new maplibregl.Popup({
  closeButton: false,
  closeOnClick: false,
  anchor: "top",
});

popup.addTo(map);

let innerWidth = window.innerWidth;

window.onresize = function () {
  innerWidth = window.innerWidth;
};

function getLocation(point) {
  return {
    x:
      point.x < 120
        ? 120
        : point.x > innerWidth - 440
        ? innerWidth - 440
        : point.x,
    y: point.y,
  };
}

function addLeadingZeroIfNeeded(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function getTooltipValue(match, id, prop, layer) {
  const num =
    prop.parse === "number"
      ? abbreviateNumber(parseInt(match[prop.prop]), 0)
      : match[prop.prop];
  return `${prop.before}${num}${prop.after}`;
}

function updatePopupBlock(e) {

  const properties = e.features[0].properties;
  const id = properties.id;

  var layersDisplay = [];

  document
    .getElementById("layer-picker-demographics")
    .querySelectorAll('input[type=checkbox]:checked')
    .forEach(l=>{
      console.log(l.name)
      layersDisplay.push({label:l.name,value:l.value})
    });
  var allCatPop = layersDisplay.reduce((p,l)=>p+parseInt(properties[l.value]),0);

  if (!allCatPop) {return;}

  if (!popup.isOpen()) {
    popup.addTo(map);
  }

  popup.setLngLat(e.lngLat);

    if (id !== oldHighlightId) {

      const feature_id = map.queryRenderedFeatures(
        [e.point.x, e.point.y],
        {layers: ['blocks-polygons']}
        )[0].id;

      const content = `
        <h3 class="tooltip-header">Census Block: ${properties.id} </h3>
        <table class="tooltip-table">
        ${layersDisplay
          .map(
            (l) =>
              `<tr><th>${l.label}</th><td>${properties[l.value]}</td></tr>`
          )
          .join("")}
        </table>
      `;

      popup.setHTML(content);

      map.setFeatureState(
        {
          source: "group-quarters",
          sourceLayer: "blocks",
          id: String(oldHighlightId),
        },
        {
          highlight: "false",
        }
      );

      map.setFeatureState(
        {
          source: "group-quarters",
          sourceLayer: "blocks",
          id: feature_id,
        },
        {
          highlight: "true",
        }
      );

      if (oldHighlightId) {
        closedOnClick = true;
      } else {
        closedOnClick = false;
      }

      window.oldHighlightId = feature_id;
    }
}


function getCategoryColor(ramp, colors, value) {
  return colors[ramp.indexOf(value)];
}

function getChoroplethColor(ramp, colors, value) {
  if (value <= ramp[1]) {
    return colors[0];
  } else if (value <= ramp[2]) {
    return colors[1];
  } else if (value <= ramp[3]) {
    return colors[2];
  } else if (value <= ramp[4]) {
    return colors[3];
  } else if (value <= ramp[5]) {
    return colors[4];
  } else if (value <= ramp[6]) {
    return colors[5];
  } else if (value <= ramp[7]) {
    return colors[6];
  } else {
    return "transparent";
  }
}

const updateMapFeatureState = (map, layer) => {
  ncfnData.forEach((county) => {
    const value = county[layer.key];
    map.setFeatureState(
      {
        source: "trf",
        sourceLayer: "clst_us_counties_polygons_albersusa",
        id: Number(county.GEOID),
      },
      {
        value:
          layer.type === "step"
            ? getChoroplethColor(layer.ramp, layer.color, value)
            : getCategoryColor(layer.ramp, layer.color, value),
      }
    );
  });
};

function mouseOutBlock() {
  popup.remove();
  map.setFeatureState(
    {
      source: "group-quarters",
      sourceLayer: "blocks",
      id: String(oldHighlightId),
    },
    {
      highlight: "false",
    }
  );

  window.oldHighlightId = undefined;
}

map.on("style.load", function () {

  generateLayerPicker();
  generateLegend()
  map.on("mousemove", "blocks-polygons", updatePopupBlock);
  map.on("mouseout", "blocks-polygons", mouseOutBlock);

  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

});


window.changeBasemap = changeBasemap;
window.map = map;
