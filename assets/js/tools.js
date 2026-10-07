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
    jacksonville:          ['Jacksonville','area-jacksonville.jpg','TBD, confirm with Josh','The core market. Camp Lejeune and MCAS New River drive the calendar, inventory turns on orders rather than on seasons, and the buyer pool refreshes every summer.'],
    sneadsferry:   ['Sneads Ferry','area-sneadsferry.jpg','TBD, confirm with Josh','Jacksonville’s second downtown. Condos and townhomes for people who want to walk to dinner and skip the yard.'],
    surfcity:         ['Surf City','area-surfcity.jpg','TBD, confirm with Josh','Schools, greenways and resale strength. The safest place in Onslow County and the Topsail corridor to park equity.'],
    hubert:         ['Hubert','area-hubert.jpg','TBD','Between Jacksonville and Swansboro. Quiet, and closer to the water than the price suggests.'],
    richlands: ['Richlands','area-richlands.jpg','TBD','North Onslow. Land, acreage and the widest lots in the county at the lowest price per foot.'],
    swansboro:   ['Swansboro','area-swansboro.jpg','TBD','Historic downtown with new neighborhoods behind it. The best square footage per dollar north of Jacksonville.'],
    hollyridge:       ['Holly Ridge','area-hollyridge.jpg','TBD','Ten minutes from the bridge without the beach premium. New neighborhoods going up steadily.'],
    hampstead:      ['Hampstead','area-hampstead.jpg','TBD','Johnston County pricing with a Jacksonville commute. Pharma jobs on 70 keep the demand honest.'],
    maysville:  ['Maysville','area-maysville.jpg','TBD','Small town Jones County line. Land, quiet, and the lowest entry price on this map.'],
    beulaville:       ['Beulaville','area-beulaville.jpg','TBD','Duplin County. Acreage, agriculture and buyers who want distance on purpose.'],
    newbern:   ['New Bern','area-newbern.jpg','TBD','Fifteen minutes to downtown Jacksonville on 64. New neighborhoods, young families, fast turnover.'],
    topsailbeach:      ['Topsail Beach','area-topsailbeach.jpg','TBD','The south end of the island. Quieter than Surf City, and almost entirely second homes.']
  };
  /* scores are in IDS order */
  var S = {
    budget: {
      'under400':  [0,.35,.10,.20,.25,.40,.85,.95,.30,.90,.95,1],
      '400-600':   [.05,.80,.55,.80,.95,.90,1,.90,.95,.95,.90,.80],
      '600-900':   [.55,.80,1,.90,.80,.85,.50,.45,.60,.40,.40,.35],
      '900+':      [1,.70,.85,.60,.50,.60,.25,.20,.30,.15,.15,.15]
    },
    commute: {
      'downtown':  [1,.90,.50,.35,.25,.45,.30,.35,.35,.85,.80,.50],
      'rtp':       [.50,.50,1,.85,.80,.35,.50,.25,1,.40,.30,.20],
      'north':     [.70,1,.50,.35,.25,.95,.20,.20,.45,.35,.50,.40],
      'east':      [.50,.45,.20,.15,.20,.40,.35,1,.15,.60,1,1],
      'wfh':       [.60,.60,.70,.80,.85,.85,.95,.95,.60,.80,.85,1]
    },
    priority: {
      'schools':   [.60,.50,1,.95,.90,.80,.55,.50,.80,.45,.50,.45],
      'walk':      [1,1,.50,.80,.40,.75,.60,.50,.35,.40,.40,.35],
      'space':     [.20,.10,.45,.60,.85,.80,.90,.95,.30,.60,.60,1],
      'newbuild':  [.10,.60,.40,.60,1,.70,.85,.95,.80,.30,.90,.95],
      'value':     [.10,.35,.35,.50,.60,.75,.90,.95,.50,.85,.90,1],
      'character': [1,.30,.40,.70,.20,.80,.60,.35,.20,.55,.20,.25],
      'lowmaint':  [.30,1,.60,.50,.55,.50,.45,.50,.90,.40,.60,.40]
    },
    age: {
      'historic':    [1,.20,.35,.60,.15,.85,.55,.30,.15,.50,.20,.20],
      'established': [.60,.65,1,.85,.45,.65,.50,.40,.70,.90,.45,.30],
      'new':         [.10,.60,.45,.60,1,.75,.85,.95,.85,.30,.90,.95]
    },
    weekend: {
      'dining':     [1,1,.60,.60,.35,.55,.35,.30,.45,.35,.30,.25],
      'greenways':  [.65,.55,1,.80,.85,.70,.60,.60,.85,.75,.70,.60],
      'mainstreet': [.50,.35,.45,1,.50,.95,.90,.80,.25,.50,.45,.75],
      'golf':       [.55,.50,.90,.70,.70,.80,.60,.60,.40,.50,.45,.50]
    }
  };

  var QUESTIONS = [
    { key:'budget', w:3.0, q:'What is the honest top of your budget?',
      opts:[['under400','Under $400,000','The value belt'],['400-600','$400,000 to $600,000','The biggest slice of the market'],
            ['600-900','$600,000 to $900,000','Move-up territory'],['900+','$900,000 and up','Where character costs money']] },
    { key:'commute', w:2.5, q:'Where do you actually have to be on a Tuesday morning?',
      opts:[['downtown','On or near base','Lejeune or New River'],['rtp','Jacksonville proper','In town, short drive'],
            ['north','Toward the water','Sneads Ferry or the island'],['east','Wilmington or points south','Down 17'],
            ['wfh','Nowhere, I work from home','The commute is not the constraint']] },
    { key:'priority', w:2.5, q:'If you could only get one of these, which one?',
      opts:[['schools','Strong school assignment','Confirm it address by address'],['walk','Walk to dinner and coffee','Density buys you this'],
            ['space','Land and elbow room','Acreage moves you outward'],['newbuild','Everything brand new','No renovation projects'],
            ['value','The most house per dollar','Pure price per square foot'],['character','Real architectural character','Pre-1960 housing stock'],
            ['lowmaint','Low maintenance living','Townhome or lock and leave']] },
    { key:'age', w:1.5, q:'What kind of house are you picturing?',
      opts:[['historic','Something with history','1900s to 1960s'],['established','Established, 1990s to 2010s','Mature trees, settled streets'],
            ['new','Brand new construction','2018 and newer']] },
    { key:'weekend', w:1.5, q:'What does a good Saturday look like?',
      opts:[['dining','Restaurants, bars, walkable blocks',''],['greenways','Greenways, parks and trails',''],
            ['mainstreet','Small town main street and a farmers market',''],['golf','Golf course or the lake','']] },
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
