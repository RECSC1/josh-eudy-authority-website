/* Josh Eudy service area map. Mapbox GL JS.
   Replaces the hand drawn SVG. Markers carry the same data attributes the
   rest of the site expects, and drive the legend and the town cards. */
(function () {
  var el = document.getElementById('area-map');
  if (!el || typeof mapboxgl === 'undefined') return;

  mapboxgl.accessToken = 'pk.eyJ1IjoiZW13eWF0dDEyODIiLCJhIjoiY212eHpnbDRrMWMzZjJ4b3VhZWt0czVqcSJ9.XKFNT-QecHe3zyhRjB1hSA';

  var TOWNS = [
  {
    "n": "Jacksonville",
    "t": "card-jacksonville",
    "k": "primary",
    "x": -77.4302,
    "y": 34.7541,
    "d": "The core market. Camp Lejeune and MCAS New River drive the calendar, inventory turns on orders rather than on seasons, and the buyer pool refreshes every summer."
  },
  {
    "n": "Sneads Ferry",
    "t": "card-sneadsferry",
    "k": "primary",
    "x": -77.3938,
    "y": 34.5527,
    "d": "Between the base and the beach, and growing on both sides of that. Boat access, newer construction, and buyers who want water without Topsail pricing."
  },
  {
    "n": "Surf City",
    "t": "card-surfcity",
    "k": "primary",
    "x": -77.5461,
    "y": 34.4274,
    "d": "The Topsail corridor. Second homes, short term rentals, and a completely different set of questions: flood zone, insurance, and what the town allows you to rent."
  },
  {
    "n": "Hubert",
    "t": "card-hubert",
    "k": "secondary",
    "x": -77.2169,
    "y": 34.7177,
    "d": "Onslow County, on NC-24 and NC-172 between Jacksonville and Swansboro. Quiet, close to the back side of base, and closer to the water than the price suggests."
  },
  {
    "n": "Richlands",
    "t": "card-richlands",
    "k": "secondary",
    "x": -77.5469,
    "y": 34.8985,
    "d": "North Onslow County, off NC-24 and US-258. Small town feel, land and acreage, and room to spread out."
  },
  {
    "n": "Swansboro",
    "t": "card-swansboro",
    "k": "secondary",
    "x": -77.1191,
    "y": 34.6879,
    "d": "Historic waterfront downtown on the White Oak. Small, walkable, and tightly held."
  },
  {
    "n": "Holly Ridge",
    "t": "card-hollyridge",
    "k": "secondary",
    "x": -77.5541,
    "y": 34.4938,
    "d": "Onslow County, on US-17 minutes from the Surf City bridge, without the island price. New neighborhoods going up steadily."
  },
  {
    "n": "Hampstead",
    "t": "card-hampstead",
    "k": "secondary",
    "x": -77.7108,
    "y": 34.3671,
    "d": "Pender County, and the pull toward Wilmington starts here. Golf, water access and a longer commute north."
  },
  {
    "n": "Maysville",
    "t": "card-maysville",
    "k": "secondary",
    "x": -77.23,
    "y": 34.9032,
    "d": "A small Jones County town on US-17, at the edge of the Croatan National Forest. Land, quiet, and lower entry prices than the coast."
  },
  {
    "n": "Beulaville",
    "t": "card-beulaville",
    "k": "secondary",
    "x": -77.7739,
    "y": 34.9238,
    "d": "Duplin County. Acreage, agriculture and buyers who want distance on purpose."
  },
  {
    "n": "New Bern",
    "t": "card-newbern",
    "k": "secondary",
    "x": -77.0441,
    "y": 35.1085,
    "d": "Historic downtown at the Neuse and the Trent. A different market, and a regular referral direction."
  },
  {
    "n": "Topsail Beach",
    "t": "card-topsailbeach",
    "k": "secondary",
    "x": -77.6358,
    "y": 34.3738,
    "d": "Pender County. The quiet south end of Topsail Island, mostly second homes and rentals."
  }
];

  var map = new mapboxgl.Map({
    container: 'area-map',
    style: 'mapbox://styles/mapbox/light-v11',
    bounds: [[-77.95, 34.26], [-76.90, 35.24]],
    fitBoundsOptions: { padding: { top: 40, bottom: 40, left: 40, right: 90 } },
    cooperativeGestures: true,
    attributionControl: true,
    dragRotate: false,
    pitchWithRotate: false
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

  /* Tint the base style toward the brand palette. Wrapped because layer
     names can change between Mapbox style versions. */
  map.on('load', function () {
    var tint = [
      ['land', 'background-color', '#F4EFE1'],
      ['water', 'fill-color', '#8FBDCC'],
      ['waterway', 'line-color', '#8FBDCC'],
      ['national-park', 'fill-color', '#CBDCB4'],
      ['landuse', 'fill-color', '#E8E9D6']
    ];
    tint.forEach(function (t) {
      try { map.setPaintProperty(t[0], t[1], t[2]); } catch (e) {}
    });
  });

  var legendName = document.getElementById('legend-name');
  var legendCopy = document.getElementById('legend-copy');
  var all = [];

  TOWNS.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mb-pin map-pin tier-' + t.k;
    b.setAttribute('data-name', t.n);
    b.setAttribute('data-note', t.d);
    b.setAttribute('data-target', t.t);
    b.setAttribute('aria-label', t.n + ' service area');
    b.innerHTML = '<i></i><span>' + t.n + '</span>';

    function activate() {
      all.forEach(function (p) { p.classList.remove('active'); });
      b.classList.add('active');
      if (legendName) legendName.textContent = t.n;
      if (legendCopy) legendCopy.textContent = t.d;
      var card = document.getElementById(t.t);
      if (card) {
        document.querySelectorAll('.area-card').forEach(function (c) { c.style.outline = ''; });
        card.style.outline = '2px solid #8C6B22';
        card.style.outlineOffset = '3px';
      }
    }
    b.addEventListener('mouseenter', activate);
    b.addEventListener('focus', activate);
    b.addEventListener('click', function () {
      activate();
      var card = document.getElementById(t.t);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    all.push(b);
    new mapboxgl.Marker({ element: b, anchor: 'center' })
      .setLngLat([t.x, t.y]).addTo(map);
  });
})();
