(function() {
  const db = new Dexie('RAapp');

  db.version(1).stores({
    days: 'date',
    settings: 'key'
  });

  RAapp.saveDay = async function(date, data) {
    await db.days.put({
      date,
      joints: data.joints,
      medications: data.medications || '',
      notes: data.notes || '',
      updatedAt: new Date().toISOString()
    });
  };

  RAapp.getDay = async function(date) {
    return await db.days.get(date);
  };

  RAapp.getAllDays = async function() {
    return await db.days.orderBy('date').toArray();
  };

  RAapp.getSetting = async function(key) {
    const row = await db.settings.get(key);
    return row ? row.value : null;
  };

  RAapp.setSetting = async function(key, value) {
    await db.settings.put({ key, value });
  };
})();
