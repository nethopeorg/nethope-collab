const days = [
  '0904',
  '0905',
  '0906',
  '0907',
  '0908',
  '0909',
  '0910',
  '0911',
  '0912',
  '0913',
  '0914',
  '0915',
  '0916',
  '0917',
  '0918',
  '0919',
  '0920',
  '0921',
  '0922',
  '0923',
  '0924',
  '0925',
  '0926',
  '0927',
  '0928',
  '0929',
  '0930',
  '1001',
  '1002',
  '1003',
  '1004',
  '1005',
  '1006',
  '1007',
  '1008',
  '1009',
  '1010',
  '1011',
  '1012',
  '1013',
  '1014',
  '1015',
  '1016',
  '1017',
  '1018',
  '1019',
  '1020',
  '1021',
  '1022',
  '1023',
  '1024',
  '1025',
  '1026',
  '1027',
  '1028',
  '1029',
  '1030',
  '1031',
  '1101',
  '1102',
  '1103',
  '1104',
  '1105',
  '1106',
  '1107',
  '1108',
  '1109',
  '1110',
  '1111',
  '1112',
  '1113',
  '1114',
  '1115',
  '1116',
  '1117',
  '1118',
  '1119',
  '1120',
  '1121',
  '1122',
  '1123',
  '1124',
  '1125',
  '1126',
  '1127',
  '1128',
  '1129',
  '1130',
  '1201',
  '1202',
  '1203',
  '1204',
  '1205',
  '1206',
  '1207',
  '1208',
  '1209',
  '1210',
  '1211',
  '1212'
];
const range = document.getElementById('slider');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const spinner = document.getElementById('spinner');
// change this to toggle optimized or non-optimzed version.
const optimized = false;
let currentlyPlaying;
let timing;
if (optimized) {
  timing = 2000;
} else {
  timing = 5000;
}

const paintProperties = {
  'circle-opacity-transition': {
    'duration': 100,
    'delay': 0
  },
  'circle-opacity': 0,
  'circle-radius': 2.5
};

const paintPropertiesSquare = {
  'fill-outline-color': 'rgba(255, 255, 255, 0)',
  'fill-opacity': 0
};

mapboxgl.accessToken = 'pk.eyJ1IjoibG9iZW5pY2hvdSIsImEiOiJjajdrb2czcDQwcHR5MnFycmhuZmo4eWwyIn0.nUf9dWGNVRnMApuhQ44VSw';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/lobenichou/cjc9u76h70a0f2slad1ndspxk',
});

const mapReset = () => {
  const settings = geoViewport.viewport([-67.49464527562915, 17.512917536440412, -65.39172688458267, 18.77166940195589], [window.innerHeight, window.innerWidth]);
  map.setCenter(settings.center);
  map.setZoom(settings.zoom);
}

const getRamp = (day) => {
  return [
    'interpolate',
    ['linear'],
    ['number', ['get', day]],
    -4, 'rgb(0, 61, 84)',
    2, 'rgb(223, 235, 240)',
    4, 'rgb(223, 235, 240)',
  ];
};

const getRampBlur = (day) => {
  return [
    'interpolate', ['linear'],
    ['number', ['get', day]],
    -4, 0,
    -2, 1,
    2, 1,
    4, 0
  ];
};

const setupKey = () => {
  // legend
  const svg = d3.select('#legend')
    .append('svg')
    .attr('width', 300)
    .attr('height', 30);

  const colorRange = ['rgb(223, 235, 240)', 'rgb(223, 235, 240)', 'rgb(223, 235, 240)', 'rgb(0, 61, 84)', 'rgb(0, 61, 84)'];

  const colorScale = d3.scaleLinear()
    .range(colorRange);

  const defs = svg.append('defs');

  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradient.selectAll("stop")
    .data(colorScale.range())
    .enter().append("stop")
    .attr("offset", function(d, i) {
      return i / (colorScale.range().length - 1);
    })
    .attr("stop-color", function(d) {
      return d;
    });

  svg.append("rect")
    .attr("width", 300)
    .attr("height", 300)
    .style("fill", "url(#linear-gradient)");

  svg.append("text")
    .text("Peaks")
    .attr('class', 'legend legend--top')

  svg.append("text")
    .text("Average")
    .attr('class', 'legend legend--middle')

  svg.append("text")
    .text("Drops")
    .attr('class', 'legend legend--bottom')
}


  const updateDate = (dateIndex) => {
    // Set the label to the month
    const month = days[dateIndex].split('')[0] + days[dateIndex].split('')[1];
    const day = days[dateIndex].split('')[2] + days[dateIndex].split('')[3];
    const newdate = `${month}/${day}/2017`
    const formattedDate = dateFns.format(newdate, 'Do [of] MMMM YYYY');
    document.getElementById('day').textContent = formattedDate;
    if (days[dateIndex] === '0921') {
      document.getElementById('event').textContent = 'Hurricane Maria hits Puerto Rico';
    } else if (days[dateIndex] === '1004') {
      document.getElementById('event').textContent = 'First hotspot installed';
    } else {
      document.getElementById('event').textContent = '';
    }
  };


d3.json('hotspots.json', (err, data) => {
  const hotspots = data;

  const filterBy = (dateIndex) => {
    spinner.classList.remove('hide');
    const filters = ['has', days[dateIndex]];
    const ramp = getRamp(days[dateIndex]);
    const rampBlur = getRampBlur(days[dateIndex]);
    const filteredFeatures = hotspots.features.filter((feature) => {
      return feature.properties.date < parseInt(days[dateIndex]);
    });
    const geojson = {
      'type': 'FeatureCollection',
      'features': filteredFeatures
    };

    map.getSource('hotspots').setData(geojson);
    if ( optimized ) {
      map.setFilter('connectivity-squares-1', filters)
      map.setPaintProperty('connectivity-squares-1', 'fill-color', ramp);
    } else {
      map.setFilter('connectivity-circle-1', filters)
      map.setPaintProperty('connectivity-circle-1', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-1', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-2a', filters)
      map.setPaintProperty('connectivity-circle-2a', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-2a', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-2b', filters)
      map.setPaintProperty('connectivity-circle-2b', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-2b', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-3a', filters)
      map.setPaintProperty('connectivity-circle-3a', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-3a', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-3b', filters)
      map.setPaintProperty('connectivity-circle-3b', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-3b', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-4', filters)
      map.setPaintProperty('connectivity-circle-4', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-4', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-5a', filters)
      map.setPaintProperty('connectivity-circle-5a', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-5a', 'circle-blur', rampBlur);
      map.setFilter('connectivity-circle-5b', filters)
      map.setPaintProperty('connectivity-circle-5b', 'circle-color', ramp);
      map.setPaintProperty('connectivity-circle-5b', 'circle-blur', rampBlur);
    }


    checkIfLoaded();
  };

  const play = (dateIndex) => {
    range.value = dateIndex;
    setOpacity(0);
    filterBy(dateIndex);
    updateDate(dateIndex);
  };

  const continuousPlay = () => {
    let currentDateIndex = parseInt(range.value, 10);

    if (currentDateIndex >= days.length - 1) {
      currentDateIndex = 0;
    } else {
      currentDateIndex += 1;
    }

    play(currentDateIndex);

    currentlyPlaying = setTimeout(() => {

      continuousPlay();
    }, timing);
  };

  const setOpacity = (index) => {
    if ( optimized ) {
      map.setPaintProperty('connectivity-squares-1', 'fill-opacity', index);
    } else {
      map.setPaintProperty('connectivity-circle-1', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-2a', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-2b', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-3a', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-3b', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-4', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-5a', 'circle-opacity', index);
      map.setPaintProperty('connectivity-circle-5b', 'circle-opacity', index);
    }
  }

  const checkIfLoaded = () => {
    if (map.loaded()) {
      spinner.classList.add('hide');
      setOpacity(1)
    } else {
      setTimeout(() => {
        checkIfLoaded();
      }, 100);
    }
  }


  map.on('load', () => {
    setupKey();
    mapReset();
    map.setPaintProperty('background', 'background-color', 'rgb(135, 130, 130)')
    map.setPaintProperty('water', 'fill-color', 'rgb(11, 25, 47)')
    spinner.classList.remove('hide');

    if (optimized) {
      map.addLayer({
        'id': 'connectivity-squares-1',
        'type': 'fill',
        'source': {
          'type': 'vector',
          'url': 'mapbox://lobenichou.6pyahl92'
        },
        'source-layer': 'alldata',
        'paint': paintPropertiesSquare,
      }, 'water');
    } else {
      map.addLayer({
       'id': 'connectivity-circle-1',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.d1ftz8lo'
       },
       'source-layer': 'geojson_centroid_rounded_1',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-2a',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.4zcdn5as'
       },
       'source-layer': 'geojson_centroid_rounded_2a',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-2b',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.0ifw5242'
       },
       'source-layer': 'geojson_centroid_rounded_2b',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-3a',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.4fz09x7h'
       },
       'source-layer': 'geojson_centroid_rounded_3a',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-3b',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.1o92rw04'
       },
       'source-layer': 'geojson_centroid_rounded_3b',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-4',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.5yw68x7k'
       },
       'source-layer': 'geojson_centroid_rounded_4',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-5a',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.5ciqsjkr'
       },
       'source-layer': 'geojson_centroid_rounded_5a',
       'paint': paintProperties,
     }, 'water');

     map.addLayer({
       'id': 'connectivity-circle-5b',
       'type': 'circle',
       'source': {
         'type': 'vector',
         'url': 'mapbox://lobenichou.77zbr53e'
       },
       'source-layer': 'geojson_centroid_rounded_5b',
       'paint': paintProperties,
     }, 'water');
    }



    map.addSource("hotspots", {
      type: "geojson",
      data: hotspots,
      cluster: true,
      clusterMaxZoom: 10, // Max zoom to cluster points on
      clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
      'id': 'connectivity-hotspots',
      'type': 'circle',
      'source': 'hotspots',
      'paint': {
        'circle-color': [
          'interpolate', ['linear'],
          ['number', ["get", "point_count"]],
          1, 'rgba(29, 199, 191, .8)',
          3, 'rgba(29, 199, 191, .5)',
          5, 'rgba(29, 199, 191, .5)'
        ],
        'circle-radius': 10,
        'circle-opacity': 1,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(255, 255, 255, 1)',
        "circle-radius": [
          "step", ["get", "point_count"],
          10,
          1,
          15,
          3,
          20,
          5,
          30
        ]
      },
      'filter': ['has', 'point_count']
    });

    map.addLayer({
      'id': 'connectivity-hotspots-unclustered',
      'type': 'circle',
      'source': 'hotspots',
      'paint': {
        'circle-color': 'rgba(29, 199, 191, 1)',
        'circle-radius': 10,
        'circle-opacity': 1,
        'circle-stroke-width': 1,
        'circle-stroke-color': 'rgba(255, 255, 255, 1)'
      },
      'filter': ['!has', 'point_count']
    });

    map.addLayer({
      'id': 'connectivity-hotspots-unclustered-count',
      'type': "symbol",
      'source': 'hotspots',
      'paint': {
        'text-color': 'rgba(255, 255, 255, 1)'
      },
      'layout': {
        "text-field": "1",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12
      },
      'filter': ['!has', 'point_count']
    });


    map.addLayer({
      'id': "cluster-count",
      'type': "symbol",
      'source': 'hotspots',
      'paint': {
        'text-color': 'rgba(255, 255, 255, 1)'
      },
      'layout': {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12
      },
      'filter': ['has', 'point_count']
    });


    play(0);

    range.addEventListener('input', (e) => {
      const dateIndex = parseInt(e.target.value, 10);
      spinner.classList.remove('hide');
      play(dateIndex);
    });

    window.addEventListener('resize', () => {
      mapReset();
    })

    playButton.addEventListener('click', () => {
        continuousPlay();
        playButton.classList.add('hide');
        pauseButton.classList.remove('hide');
    });

    pauseButton.addEventListener('click', () => {
      clearTimeout(currentlyPlaying);
      playButton.classList.remove('hide');
      pauseButton.classList.add('hide');
    })
  });
});
