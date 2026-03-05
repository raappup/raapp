(function() {
  const { JOINT_GROUPS, ALL_JOINTS, SEVERITY_LEVELS, SEVERITY_LABELS,
          SEVERITY_NAMES, defaultJointStatus, saveDay, getDay, getAllDays } = RAapp;

  let currentDate = todayString();
  let jointStatuses = {};

  function todayString() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function formatDateForDisplay(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function shiftDate(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  function renderJointGroups() {
    const container = document.getElementById('joints-container');
    container.innerHTML = '';

    for (const group of JOINT_GROUPS) {
      const section = document.createElement('section');
      section.className = 'joint-group';

      const heading = document.createElement('h2');
      heading.textContent = group.name;
      section.appendChild(heading);

      if (group.layout === 'grid') {
        section.appendChild(renderAnatomicalGrid(group));
      } else if (group.layout === 'paired') {
        section.appendChild(renderPairedGrid(group));
      } else {
        section.appendChild(renderWrapGrid(group));
      }

      container.appendChild(section);
    }
  }

  function renderAnatomicalGrid(group) {
    var table = document.createElement('div');
    table.className = 'anatomical-grid';
    table.style.gridTemplateColumns = 'auto repeat(' + group.columns.length + ', 1fr)';

    // Column headers
    var corner = document.createElement('div');
    corner.className = 'grid-header grid-corner';
    table.appendChild(corner);
    for (var c = 0; c < group.columns.length; c++) {
      var colHdr = document.createElement('div');
      colHdr.className = 'grid-header';
      colHdr.textContent = group.columns[c];
      table.appendChild(colHdr);
    }

    // Rows
    for (var r = 0; r < group.rows.length; r++) {
      var rowLabel = document.createElement('div');
      rowLabel.className = 'grid-row-label';
      rowLabel.textContent = group.rowLabels[r];
      table.appendChild(rowLabel);

      for (var c = 0; c < group.rows[r].length; c++) {
        var key = group.rows[r][c];
        if (key) {
          table.appendChild(makeJointCard(key, null));
        } else {
          var empty = document.createElement('div');
          empty.className = 'grid-empty';
          table.appendChild(empty);
        }
      }
    }

    return table;
  }

  function renderWrapGrid(group) {
    var grid = document.createElement('div');
    grid.className = 'joint-grid';
    for (var i = 0; i < group.joints.length; i++) {
      grid.appendChild(makeJointCard(group.joints[i].key, group.joints[i].label));
    }
    return grid;
  }

  function renderPairedGrid(group) {
    var grid = document.createElement('div');
    grid.className = 'paired-grid';
    for (var i = 0; i < group.pairs.length; i++) {
      var pair = group.pairs[i];
      grid.appendChild(makeWideJointCard(pair.left.key, pair.left.label));
      grid.appendChild(makeWideJointCard(pair.right.key, pair.right.label));
    }
    return grid;
  }

  function makeWideJointCard(key, label) {
    var card = document.createElement('div');
    card.className = 'joint-card-wide';
    card.dataset.key = key;

    var name = document.createElement('div');
    name.className = 'joint-name';
    name.textContent = label;
    card.appendChild(name);

    var controls = document.createElement('div');
    controls.className = 'joint-controls-wide';

    for (var d = 0; d < 2; d++) {
      var dim = d === 0 ? 'swollen' : 'painful';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'severity-btn ' + dim + '-btn';
      btn.dataset.key = key;
      btn.dataset.dimension = dim;
      btn.dataset.level = '0';
      btn.textContent = (dim === 'swollen' ? 'S' : 'P') + ': 0';
      (function(k, dm) {
        btn.addEventListener('click', function() { cycleSeverity(k, dm); });
      })(key, dim);
      controls.appendChild(btn);
    }

    card.appendChild(controls);
    return card;
  }

  function makeJointCard(key, label) {
    var card = document.createElement('div');
    card.className = 'joint-card';
    card.dataset.key = key;

    if (label) {
      var name = document.createElement('div');
      name.className = 'joint-name';
      name.textContent = label;
      card.appendChild(name);
    }

    var controls = document.createElement('div');
    controls.className = 'joint-controls';

    for (var d = 0; d < 2; d++) {
      var dim = d === 0 ? 'swollen' : 'painful';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'severity-btn ' + dim + '-btn';
      btn.dataset.key = key;
      btn.dataset.dimension = dim;
      btn.dataset.level = '0';
      btn.textContent = (dim === 'swollen' ? 'S' : 'P') + ': 0';
      (function(k, dm) {
        btn.addEventListener('click', function() { cycleSeverity(k, dm); });
      })(key, dim);
      controls.appendChild(btn);
    }

    card.appendChild(controls);
    return card;
  }

  function cycleSeverity(key, dimension) {
    if (!jointStatuses[key]) jointStatuses[key] = defaultJointStatus();
    const current = jointStatuses[key][dimension];
    const idx = SEVERITY_LEVELS.indexOf(current);
    jointStatuses[key][dimension] = SEVERITY_LEVELS[(idx + 1) % SEVERITY_LEVELS.length];
    updateJointCard(key);
  }

  function updateJointCard(key) {
    var card = document.querySelector('.joint-card[data-key="' + key + '"]') ||
               document.querySelector('.joint-card-wide[data-key="' + key + '"]');
    if (!card) return;
    var status = jointStatuses[key] || defaultJointStatus();

    for (var d = 0; d < 2; d++) {
      var dim = d === 0 ? 'swollen' : 'painful';
      var btn = card.querySelector('.' + dim + '-btn');
      var level = status[dim];
      btn.dataset.level = String(level);
      btn.textContent = (dim === 'swollen' ? 'S' : 'P') + ': ' + SEVERITY_LABELS[level];
      btn.title = (dim === 'swollen' ? 'Swollen' : 'Painful') + ': ' + SEVERITY_NAMES[level];
    }
  }

  function updateAllJointCards() {
    for (const joint of ALL_JOINTS) {
      updateJointCard(joint.key);
    }
  }

  async function loadDay(date) {
    currentDate = date;

    document.getElementById('current-date').textContent = formatDateForDisplay(date);
    document.getElementById('next-day').disabled = (date >= todayString());

    const entry = await getDay(date);
    if (entry) {
      jointStatuses = {};
      for (const k of Object.keys(entry.joints)) {
        jointStatuses[k] = { swollen: entry.joints[k].swollen, painful: entry.joints[k].painful };
      }
      document.getElementById('medications').value = entry.medications || '';
      document.getElementById('notes').value = entry.notes || '';
    } else {
      const yesterday = shiftDate(date, -1);
      const prevEntry = await getDay(yesterday);
      jointStatuses = {};
      if (prevEntry) {
        for (const k of Object.keys(prevEntry.joints)) {
          jointStatuses[k] = { swollen: prevEntry.joints[k].swollen, painful: prevEntry.joints[k].painful };
        }
      }
      document.getElementById('medications').value = '';
      document.getElementById('notes').value = '';
    }

    for (const joint of ALL_JOINTS) {
      if (!jointStatuses[joint.key]) {
        jointStatuses[joint.key] = defaultJointStatus();
      }
    }

    updateAllJointCards();
  }

  async function save() {
    try {
      var data = {
        joints: {},
        medications: document.getElementById('medications').value,
        notes: document.getElementById('notes').value
      };
      for (var k of Object.keys(jointStatuses)) {
        data.joints[k] = { swollen: jointStatuses[k].swollen, painful: jointStatuses[k].painful };
      }

      await saveDay(currentDate, data);

      var el = document.getElementById('save-status');
      el.textContent = '✓ Saved';
      el.style.color = '#16a34a';
      el.classList.add('visible');
      setTimeout(function() { el.classList.remove('visible'); }, 2000);
    } catch (err) {
      console.error('Save failed:', err);
      var el = document.getElementById('save-status');
      el.textContent = '✗ Save failed: ' + err.message;
      el.style.color = '#dc2626';
      el.classList.add('visible');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    renderJointGroups();
    loadDay(todayString());

    document.getElementById('prev-day').addEventListener('click', function() {
      loadDay(shiftDate(currentDate, -1));
    });

    document.getElementById('next-day').addEventListener('click', function() {
      if (currentDate < todayString()) {
        loadDay(shiftDate(currentDate, 1));
      }
    });

    document.getElementById('save-btn').addEventListener('click', save);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    document.getElementById('import-file').addEventListener('change', importCSV);
  });

  async function exportCSV() {
    try {
      var days = await getAllDays();
      if (days.length === 0) {
        alert('No data to export.');
        return;
      }

      var jointKeys = ALL_JOINTS.map(function(j) { return j.key; });

      // Header row
      var headers = ['date'];
      for (var i = 0; i < jointKeys.length; i++) {
        headers.push(jointKeys[i] + '_swollen');
        headers.push(jointKeys[i] + '_painful');
      }
      headers.push('medications', 'notes');

      var rows = [headers.join(',')];

      for (var d = 0; d < days.length; d++) {
        var day = days[d];
        var cols = [day.date];
        for (var j = 0; j < jointKeys.length; j++) {
          var jk = jointKeys[j];
          var js = day.joints && day.joints[jk] ? day.joints[jk] : { swollen: 0, painful: 0 };
          cols.push(js.swollen);
          cols.push(js.painful);
        }
        cols.push(csvEscape(day.medications || ''));
        cols.push(csvEscape(day.notes || ''));
        rows.push(cols.join(','));
      }

      var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'raapp-export-' + todayString() + '.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    }
  }

  function csvEscape(str) {
    if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  async function importCSV(evt) {
    var file = evt.target.files[0];
    if (!file) return;

    var statusEl = document.getElementById('import-status');

    try {
      var text = await file.text();
      var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
      if (lines.length < 2) {
        statusEl.textContent = '✗ CSV has no data rows';
        statusEl.style.color = '#dc2626';
        statusEl.classList.add('visible');
        return;
      }

      var headers = parseCSVRow(lines[0]);
      var dateIdx = headers.indexOf('date');
      if (dateIdx === -1) {
        statusEl.textContent = '✗ CSV missing "date" column';
        statusEl.style.color = '#dc2626';
        statusEl.classList.add('visible');
        return;
      }

      var jointKeys = ALL_JOINTS.map(function(j) { return j.key; });
      var imported = 0;

      for (var i = 1; i < lines.length; i++) {
        var cols = parseCSVRow(lines[i]);
        var date = cols[dateIdx];
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

        var joints = {};
        for (var j = 0; j < jointKeys.length; j++) {
          var sIdx = headers.indexOf(jointKeys[j] + '_swollen');
          var pIdx = headers.indexOf(jointKeys[j] + '_painful');
          joints[jointKeys[j]] = {
            swollen: sIdx !== -1 ? parseInt(cols[sIdx], 10) || 0 : 0,
            painful: pIdx !== -1 ? parseInt(cols[pIdx], 10) || 0 : 0
          };
        }

        var medIdx = headers.indexOf('medications');
        var noteIdx = headers.indexOf('notes');

        await saveDay(date, {
          joints: joints,
          medications: medIdx !== -1 ? (cols[medIdx] || '') : '',
          notes: noteIdx !== -1 ? (cols[noteIdx] || '') : ''
        });
        imported++;
      }

      statusEl.textContent = '✓ Imported ' + imported + ' day(s)';
      statusEl.style.color = '#16a34a';
      statusEl.classList.add('visible');
      setTimeout(function() { statusEl.classList.remove('visible'); }, 3000);

      // Reload current day to reflect imported data
      loadDay(currentDate);
    } catch (err) {
      console.error('Import failed:', err);
      statusEl.textContent = '✗ Import failed: ' + err.message;
      statusEl.style.color = '#dc2626';
      statusEl.classList.add('visible');
    }

    // Reset file input so same file can be re-imported
    evt.target.value = '';
  }

  function parseCSVRow(row) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < row.length; i++) {
      var ch = row[i];
      if (inQuotes) {
        if (ch === '"' && i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }
})();
