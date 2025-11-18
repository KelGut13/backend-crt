const { pool } = require('./config/database');

async function checkTableStructure() {
  try {
    const [columns] = await pool.query('DESCRIBE users');
    console.log('\n📋 Estructura de la tabla users:\n');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - ${col.Key}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
