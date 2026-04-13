import 'dotenv/config';
import app from './app';
import { createTables } from './config/schema';

const PORT = process.env.PORT || 3000;

async function start() {
    await createTables();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
