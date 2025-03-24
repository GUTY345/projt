import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_7TtkomMCFGR6@ep-white-mountain-a1pxih86-pooler.ap-southeast-1.aws.neon.tech/studyhub?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;