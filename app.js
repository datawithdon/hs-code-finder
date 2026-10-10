(function () {
  "use strict";

  var input = document.getElementById("q");
  var resultsEl = document.getElementById("results");
  var statusEl = document.getElementById("status");
  var hintEl = document.getElementById("hint");

  var fuse = null;
  var dataLoaded = false;
  var debounceTimer = null;
  var MIN_QUERY_LENGTH = 2;
  var MAX_RESULTS = 25;

  function setStatus(text) {
    statusEl.textContent = text || "";
  }

  function setHint(text) {
    if (text) {
      hintEl.textContent = text;
      hintEl.style.display = "";
    } else {
      hintEl.style.display = "none";
    }
  }

  function clearResults() {
    while (resultsEl.firstChild) {
      resultsEl.removeChild(resultsEl.firstChild);
    }
  }

  function buildResultItem(entry) {
    var li = document.createElement("li");
    li.className = "result";

    var main = document.createElement("div");
    main.className = "result-main";

    var codeEl = document.createElement("span");
    codeEl.className = "code";
    codeEl.textContent = entry.code;

    var descEl = document.createElement("div");
    descEl.className = "desc";
    descEl.textContent = entry.description;

    main.appendChild(codeEl);
    main.appendChild(descEl);

    if (entry.heading || entry.section) {
      var metaEl = document.createElement("div");
      metaEl.className = "meta";
      var parts = [];
      if (entry.section) parts.push(entry.section);
      if (entry.heading && entry.heading !== entry.description) parts.push(entry.heading);
      metaEl.textContent = parts.join(" • ");
      main.appendChild(metaEl);
    }

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", function () {
      copyToClipboard(entry.code, copyBtn);
    });

    li.appendChild(main);
    li.appendChild(copyBtn);
    return li;
  }

  function copyToClipboard(text, btn) {
    var done = function () {
      var original = "Copy";
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      /* clipboard unavailable; silently ignore */
    }
    document.body.removeChild(ta);
  }

  function renderResults(matches, query) {
    clearResults();
    if (!matches.length) {
      setHint('No matches for "' + query + '". Try a simpler or more general term.');
      setStatus("");
      return;
    }
    setHint(null);
    setStatus(matches.length + (matches.length === MAX_RESULTS ? "+" : "") + " result" + (matches.length === 1 ? "" : "s"));
    matches.slice(0, MAX_RESULTS).forEach(function (m) {
      resultsEl.appendChild(buildResultItem(m.item));
    });
  }

  function runSearch() {
    var query = input.value.trim();

    if (!dataLoaded) {
      setStatus("Loading HS code data...");
      return;
    }

    if (query.length < MIN_QUERY_LENGTH) {
      clearResults();
      setStatus("");
      setHint("Start typing a product or commodity name above.");
      return;
    }

    var matches = fuse.search(query);
    renderResults(matches, query);
  }

  input.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 150);
  });

  setStatus("Loading HS code data...");

  fetch("data/hs-codes.json")
    .then(function (resp) {
      if (!resp.ok) throw new Error("Failed to load data (" + resp.status + ")");
      return resp.json();
    })
    .then(function (data) {
      fuse = new Fuse(data, {
        keys: [
          { name: "description", weight: 0.7 },
          { name: "heading", weight: 0.2 },
          { name: "rawCode", weight: 0.1 }
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2
      });
      dataLoaded = true;
      setStatus("");
      runSearch();
    })
    .catch(function (err) {
      setStatus("");
      setHint("Could not load HS code data. Please reload the page.");
      // eslint-disable-next-line no-console
      console.error(err);
    });
})();
