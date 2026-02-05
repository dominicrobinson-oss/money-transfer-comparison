const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/app.db');

console.log('\n=== LIVE_QUOTES TABLE ===');
db.all("SELECT * FROM live_quotes ORDER BY fetchedAt DESC LIMIT 10", (err, rows) => {
  if (err) console.error(err);
  else {
    if (rows.length === 0) {
      console.log('(empty)');
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
  }
  
  console.log('\n=== PROVIDER_CLICKS TABLE (Latest 10) ===');
  db.all("SELECT * FROM provider_clicks ORDER BY createdAt DESC LIMIT 10", (err, rows) => {
    if (err) console.error(err);
    else {
      if (rows.length === 0) {
        console.log('(empty)');
      } else {
        console.log(JSON.stringify(rows, null, 2));
      }
    }
    
    console.log('\n=== PROVIDER_CLICKS COUNT BY PROVIDER ===');
    db.all("SELECT providerId, COUNT(*) as clicks FROM provider_clicks GROUP BY providerId ORDER BY clicks DESC", (err, rows) => {
      if (err) console.error(err);
      else {
        rows.forEach(row => {
          console.log(`${row.providerId}: ${row.clicks} clicks`);
        });
      }
      db.close();
    });
  });
});
