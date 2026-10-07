/* =========================================================================
   Eudy Tools — Neighborhood Matcher, Net Proceeds, Payment & Affordability
   Vanilla JS, no dependencies.
   ========================================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var usd = function (n, dec) {
    return '$' + (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
    });
  };
  var num = function (el) { return parseFloat(String(el.value).replace(/[^0-9.\-]/g, '')) || 0; };

  /* ---------------------------------------------------------------
     1. NEIGHBORHOOD MATCHER
     --------------------------------------------------------------- */
  var IDS = ['jacksonville','sneadsferry','surfcity','hubert','richlands','swansboro','hollyridge','hampstead','maysville','beulaville','newbern','topsailbeach'];
  var META = {
    jacksonville: ['Jacksonville','area-jacksonville.jpg','Core market · Onslow County','The core market. Camp Lejeune and MCAS New River drive the calendar, inventory turns on orders rather than on seasons, and the buyer pool refreshes every summer.'],
    sneadsferry:  ['Sneads Ferry','area-sneadsferry.jpg','Water access · Stone Bay and Courthouse Bay','A working fishing town on the New River, minutes from the Stone Bay and Courthouse Bay areas of Lejeune and the bridge to North Topsail. Waterfront lots, newer neighborhoods and real boat access.'],
    surfcity:     ['Surf City','area-surfcity.jpg','Topsail Island · Onslow and Pender','The heart of Topsail Island, on both sides of the Onslow and Pender line. Full time residents, second homes and short term rentals, all priced by distance to the sand. Flood zone and insurance come first here.'],
    hubert:       ['Hubert','area-hubert.jpg','Between Jacksonville and Swansboro','Between Jacksonville and Swansboro off 24 and 172. Quiet, close to the back side of base, and closer to the water than the price suggests.'],
    richlands:    ['Richlands','area-richlands.jpg','North Onslow · Land and new builds','North Onslow. Small town feel, land and acreage, and a lot of the new construction that has pushed out of Jacksonville.'],
    swansboro:    ['Swansboro','area-swansboro.jpg','Historic waterfront · White Oak River','Historic waterfront town on the White Oak River, with the Bogue Inlet and Emerald Isle across the bridge. A real downtown, newer neighborhoods inland, and demand that holds.'],
    hollyridge:   ['Holly Ridge','area-hollyridge.jpg','Near the bridge · New construction','Minutes from the Surf City bridge without the island price. A lot of the newest construction in the county is going up here.'],
    hampstead:    ['Hampstead','area-hampstead.jpg','Pender County · On 17','Pender County, on 17 between Jacksonville and Wilmington. Soundside neighborhoods, golf communities and households that split a commute between the two.'],
    maysville:    ['Maysville','area-maysville.jpg','Jones County · Croatan edge','A small Jones County town on 17, at the edge of the Croatan National Forest. Land, quiet, and the lowest entry price on this map.'],
    beulaville:   ['Beulaville','area-beulaville.jpg','Duplin County · Acreage','Duplin County. Acreage, agriculture and buyers who want distance on purpose.'],
    newbern:      ['New Bern','area-newbern.jpg','Craven County · Cherry Point side','Craven County, about forty five minutes up 17. A historic downtown where the Neuse and Trent meet, Cherry Point families, and real waterfront at inland prices.'],
    topsailbeach: ['Topsail Beach','area-topsailbeach.jpg','South end of the island · Pender','The quiet south end of Topsail Island. Mostly second homes and rentals, almost no commercial strip, and a slower pace on purpose.']
  };
  /* scores are in IDS order:
     jacksonville, sneadsferry, surfcity, hubert, richlands, swansboro,
     hollyridge, hampstead, maysville, beulaville, newbern, topsailbeach
     Directional only. Calibrated Oct 2026 for Onslow County and the coast. Review with Josh. */
  var S = {
    budget: {
      'under250': [.90,.30,.10,.50,.80,.30,.60,.20,1,1,.80,0],
      '250-400':  [1,.70,.40,.90,.90,.70,.95,.60,.60,.60,.90,.10],
      '400-650':  [.60,.90,.80,.70,.50,.90,.70,.95,.30,.30,.60,.50],
      '650+':     [.30,.80,1,.40,.30,.80,.40,.90,.10,.10,.40,1]
    },
    commute: {
      'base':    [1,.85,.40,.90,.70,.60,.55,.30,.50,.40,.20,.30],
      'town':    [1,.50,.35,.75,.85,.60,.45,.30,.60,.50,.25,.25],
      'water':   [.30,1,1,.60,.10,.70,.90,.60,.10,.10,.20,1],
      'south':   [.20,.50,.75,.20,.10,.20,.85,1,.05,.30,0,.70],
      'cherry':  [.20,.10,0,.35,.30,.55,0,0,.85,.20,1,0],
      'wfh':     [.60,.80,.90,.70,.70,.85,.75,.80,.70,.70,.75,.90]
    },
    priority: {
      'water':     [.30,1,1,.70,0,.90,.60,.85,.10,0,.70,1],
      'walk':      [.60,.30,.70,.10,.30,.90,.20,.20,.30,.30,1,.60],
      'space':     [.30,.50,.10,.60,1,.50,.50,.60,.90,1,.50,0],
      'newbuild':  [.70,.60,.50,.70,.90,.60,1,.80,.40,.30,.60,.30],
      'value':     [.90,.40,.20,.70,.90,.40,.70,.40,1,1,.80,.10],
      'character': [.30,.50,.40,.30,.30,1,.20,.40,.40,.30,1,.60],
      'lowmaint':  [.80,.50,.80,.50,.40,.50,.60,.50,.30,.20,.60,.70]
    },
    age: {
      'historic':    [.30,.30,.30,.30,.30,1,.10,.30,.50,.40,1,.50],
      'established': [.90,.70,.70,.80,.60,.70,.40,.70,.60,.70,.70,.70],
      'new':         [.70,.60,.50,.70,.90,.60,1,.80,.40,.30,.50,.30]
    },
    weekend: {
      'dining':     [.80,.40,.70,.30,.30,.80,.30,.40,.20,.20,1,.50],
      'greenways':  [.80,.50,.50,.60,.60,.70,.50,.50,.80,.50,.70,.40],
      'mainstreet': [.40,.50,.60,.30,.80,1,.40,.30,.60,.80,.90,.60],
      'boat':       [.40,1,1,.70,.10,.90,.60,.80,.20,.10,.70,1]
    }
  };

  var QUESTIONS = [
    { key:'budget', w:3.0, q:'What is the honest top of your budget?',
      opts:[['under250','Under $250,000','Starter homes and land'],['250-400','$250,000 to $400,000','Where most of the county trades'],
            ['400-650','$400,000 to $650,000','Move-up and near the water'],['650+','$650,000 and up','Waterfront and the island']] },
    { key:'commute', w:2.5, q:'Where do you actually have to be on a Tuesday morning?',
      opts:[['base','Camp Lejeune or New River','Main Gate, Piney Green, Stone Bay and the rest'],['town','Jacksonville proper','In town, short drive'],
            ['water','Toward the water','Sneads Ferry or the island'],['south','Wilmington or points south','Down 17'],
            ['cherry','Cherry Point or New Bern','Up 17 toward Havelock'],['wfh','Nowhere, I work from home','The commute is not the constraint']] },
    { key:'priority', w:2.5, q:'If you could only get one of these, which one?',
      opts:[['water','Water, a boat ramp or the beach','Coastal living first'],['walk','Walk to dinner and coffee','A real downtown'],
            ['space','Land and elbow room','Acreage moves you inland'],['newbuild','Everything brand new','No renovation projects'],
            ['value','The most house per dollar','Pure price per square foot'],['character','Real architectural character','Historic districts'],
            ['lowmaint','Low maintenance living','Townhome or lock and leave']] },
    { key:'age', w:1.5, q:'What kind of house are you picturing?',
      opts:[['historic','Something with history','Older homes and historic districts'],['established','Established, 1990s to 2010s','Mature trees, settled streets'],
            ['new','Brand new construction','2018 and newer']] },
    { key:'weekend', w:1.5, q:'What does a good Saturday look like?',
      opts:[['dining','Restaurants, bars, walkable blocks',''],['greenways','Parks, trails and the forest',''],
            ['mainstreet','Small town main street and a festival',''],['boat','On the water: boat, beach or fishing','']] },
    { key:'timeline', w:0, q:'When are you hoping to be in the new place?',
      opts:[['Within 30 days','Within 30 days',''],['One to three months','One to three months',''],
            ['Three to six months','Three to six months',''],['Later this year or next','Later this year or next','']] }
  ];

  var quiz = $('#matcher');
  if (quiz) {
    var answers = {}, labels = {}, step = 0;
    var stepsWrap = $('#quiz-steps'), bar = $('#quiz-bar'), results = $('#quiz-results');
    var introHTML = results.innerHTML;

    function renderSteps() {
      stepsWrap.innerHTML = '';
      QUESTIONS.forEach(function (Q, i) {
        var d = document.createElement('div');
        d.className = 'quiz-step' + (i === 0 ? ' active' : '');
        var opts = Q.opts.map(function (o) {
          return '<button class="opt" type="button" data-key="' + Q.key + '" data-val="' + o[0] + '" data-label="' + o[1] + '">' +
                 '<span>' + o[1] + '</span>' + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</button>';
        }).join('');
        d.innerHTML = '<p class="quiz-count">Question ' + (i + 1) + ' of ' + QUESTIONS.length + '</p>' +
                      '<p class="quiz-q">' + Q.q + '</p><div class="opts">' + opts + '</div>' +
                      (i > 0 ? '<div class="quiz-nav"><button class="quiz-back" type="button">&larr; Back</button></div>' : '');
        stepsWrap.appendChild(d);
      });
    }
    renderSteps();

    function show(i) {
      step = i;
      $$('.quiz-step', stepsWrap).forEach(function (s, n) { s.classList.toggle('active', n === i); });
      bar.style.width = (i / QUESTIONS.length * 100) + '%';
    }

    stepsWrap.addEventListener('click', function (e) {
      if (e.target.closest('.quiz-back')) { show(Math.max(0, step - 1)); return; }
      var b = e.target.closest('.opt');
      if (!b) return;
      $$('.opt', b.closest('.opts')).forEach(function (o) { o.classList.remove('sel'); });
      b.classList.add('sel');
      answers[b.getAttribute('data-key')] = b.getAttribute('data-val');
      labels[b.getAttribute('data-key')] = b.getAttribute('data-label');
      if (step < QUESTIONS.length - 1) setTimeout(function () { show(step + 1); }, 190);
      else setTimeout(score, 220);
    });

    function score() {
      bar.style.width = '100%';
      var max = QUESTIONS.reduce(function (t, q) { return t + q.w; }, 0);
      var ranked = IDS.map(function (id, idx) {
        var s = 0;
        QUESTIONS.forEach(function (Q) {
          if (!Q.w || !answers[Q.key] || !S[Q.key]) return;
          var arr = S[Q.key][answers[Q.key]];
          if (arr) s += Q.w * arr[idx];
        });
        return { id: id, pct: Math.round(s / max * 100) };
      }).sort(function (x, y) { return y.pct - x.pct; });

      var html = '<p class="eyebrow">Your Matches</p>' +
        '<h3 style="color:var(--black);margin-bottom:1.4rem">Start with these three.</h3>';
      ranked.slice(0, 3).forEach(function (r, i) {
        var m = META[r.id];
        html += '<div class="match">' +
          '<img src="assets/img/' + m[1] + '" alt="' + m[0] + '">' +
          '<div class="match-b"><span class="match-rank">0' + (i + 1) + '</span>' +
          '<h3>' + m[0] + '</h3><p>' + m[3] + '</p>' +
          '<div class="match-score"><i style="width:' + Math.max(r.pct * 0.85, 14) + 'px"></i>' +
          r.pct + '% fit &middot; ' + m[2] + '</div></div></div>';
      });
      var runners = ranked.slice(3, 6).map(function (r) { return META[r.id][0] + ' (' + r.pct + '%)'; }).join(', ');
      html += '<p class="tool-note" style="margin-top:16px">Also worth a look: ' + runners + '.</p>' +
        '<div class="quiz-nav" style="margin-top:18px">' +
        '<a class="btn" href="contact.html">Send me listings in these areas</a>' +
        '<button class="quiz-back" type="button" id="quiz-restart">Start over</button></div>' +
        '<p class="tool-note">A starting point, not a verdict. School assignment, HOA rules and flood zones all change the answer at the address level, and that is a conversation, not a calculator.</p>';
      results.innerHTML = html;

      var recap = '<p class="quiz-count">Your answers</p><ul class="breakdown" style="margin-bottom:22px">';
      QUESTIONS.forEach(function (Q) {
        if (labels[Q.key]) recap += '<li><span>' + Q.q.replace(/\?$/, '') + '</span><b>' + labels[Q.key] + '</b></li>';
      });
      recap += '</ul><button class="btn btn-ghost btn-sm" type="button" id="quiz-restart-2">Change my answers</button>';
      stepsWrap.innerHTML = recap;

      [$('#quiz-restart'), $('#quiz-restart-2')].forEach(function (el) {
        if (el) el.addEventListener('click', reset);
      });
      results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function reset() {
      answers = {}; labels = {};
      renderSteps(); show(0);
      results.innerHTML = introHTML;
    }
  }

  /* ---------------------------------------------------------------
     2. SELLER NET PROCEEDS  (North Carolina)
     --------------------------------------------------------------- */
  var net = $('#netsheet');
  if (net) {
    var f = {
      price: $('#ns-price'), payoff: $('#ns-payoff'), comp: $('#ns-comp'),
      conc: $('#ns-conc'), prep: $('#ns-prep'), attorney: $('#ns-attorney'), other: $('#ns-other')
    };
    function calcNet() {
      var price = num(f.price), payoff = num(f.payoff);
      var compPct = num(f.comp) / 100;
      var compensation = price * compPct;
      var excise = Math.ceil(price / 500) * 1;          // NC excise tax: $1.00 per $500 of value
      var conc = num(f.conc), prep = num(f.prep), atty = num(f.attorney), other = num(f.other);
      var costs = compensation + excise + conc + prep + atty + other;
      var netP = price - payoff - costs;

      $('#ns-total').textContent = usd(netP);
      $('#ns-lines').innerHTML =
        row('Sale price', usd(price)) +
        row('Loan payoff', '-' + usd(payoff), true) +
        row('Agent compensation (' + (compPct * 100).toFixed(2).replace(/\.?0+$/, '') + '%)', '-' + usd(compensation), true) +
        row('NC excise tax (revenue stamps)', '-' + usd(excise), true) +
        row('Buyer concessions', '-' + usd(conc), true) +
        row('Prep, repairs and staging', '-' + usd(prep), true) +
        row('Attorney and closing fees', '-' + usd(atty), true) +
        row('Other and prorations', '-' + usd(other), true) +
        '<li class="total"><span>Estimated net to you</span><b>' + usd(netP) + '</b></li>';

      var segs = [['#0A0A0A', payoff], ['#C8102E', compensation], ['#8A8A8A', excise + conc + prep + atty + other], ['#B5ADA3', Math.max(netP, 0)]];
      var tot = segs.reduce(function (t, s) { return t + Math.max(s[1], 0); }, 0) || 1;
      $('#ns-bar').innerHTML = segs.map(function (s) {
        return '<i style="background:' + s[0] + ';width:' + (Math.max(s[1], 0) / tot * 100) + '%"></i>';
      }).join('');
    }
    function row(label, val, neg) {
      return '<li' + (neg ? ' class="neg"' : '') + '><span>' + label + '</span><b>' + val + '</b></li>';
    }
    Object.keys(f).forEach(function (k) { if (f[k]) f[k].addEventListener('input', calcNet); });
    calcNet();
  }

  /* ---------------------------------------------------------------
     3. PAYMENT + AFFORDABILITY
     --------------------------------------------------------------- */
  var pay = $('#payment');
  if (pay) {
    var p = {
      price: $('#p-price'), down: $('#p-down'), downOut: $('#p-down-out'), rate: $('#p-rate'),
      term: $('#p-term'), tax: $('#p-tax'), ins: $('#p-ins'), hoa: $('#p-hoa')
    };
    function calcPay() {
      var price = num(p.price), downPct = num(p.down);
      p.downOut.textContent = downPct + '%  (' + usd(price * downPct / 100) + ')';
      var loan = price * (1 - downPct / 100);
      var r = num(p.rate) / 100 / 12, n = num(p.term) * 12;
      var pi = r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      var tax = price * (num(p.tax) / 100) / 12;
      var ins = num(p.ins) / 12;
      var hoa = num(p.hoa);
      var pmi = downPct < 20 ? loan * 0.005 / 12 : 0;
      var total = pi + tax + ins + hoa + pmi;

      $('#p-total').textContent = usd(total);
      $('#p-lines').innerHTML =
        row2('Principal and interest', usd(pi)) +
        row2('Property tax', usd(tax)) +
        row2('Homeowners insurance', usd(ins)) +
        (pmi ? row2('Mortgage insurance', usd(pmi)) : '') +
        (hoa ? row2('HOA dues', usd(hoa)) : '') +
        '<li class="total"><span>Total monthly payment</span><b>' + usd(total) + '</b></li>';
      $('#p-loan').textContent = usd(loan);
      $('#p-income').textContent = usd(total / 0.28 * 12);
      $('#p-interest').textContent = usd(pi * n - loan);

      var segs = [['#0A0A0A', pi], ['#C8102E', tax], ['#8A8A8A', ins], ['#C9C4BE', pmi + hoa]];
      var tot = segs.reduce(function (t, s) { return t + s[1]; }, 0) || 1;
      $('#p-bar').innerHTML = segs.map(function (s) {
        return '<i style="background:' + s[0] + ';width:' + (s[1] / tot * 100) + '%"></i>';
      }).join('');
    }
    function row2(label, val) { return '<li><span>' + label + '</span><b>' + val + '</b></li>'; }
    Object.keys(p).forEach(function (k) { if (p[k] && p[k].tagName !== 'SPAN') p[k].addEventListener('input', calcPay); });
    calcPay();
  }
})();
