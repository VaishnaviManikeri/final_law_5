const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Dashboard Setup Script');
console.log('=========================');

const setup = async () => {
    try {
        console.log('\n1. Starting MongoDB...');
        // Try to start MongoDB (adjust for your OS)
        try {
            execSync('mongod --version', { stdio: 'pipe' });
            console.log('✅ MongoDB is installed');
        } catch {
            console.log('❌ MongoDB not found. Please install MongoDB first.');
            console.log('   Download from: https://www.mongodb.com/try/download/community');
            process.exit(1);
        }

        console.log('\n2. Installing backend dependencies...');
        execSync('cd backend && npm install', { stdio: 'inherit' });

        console.log('\n3. Installing frontend dependencies...');
        execSync('cd frontend && npm install', { stdio: 'inherit' });

        console.log('\n4. Creating admin user...');
        execSync('cd backend && node createAdmin.js', { stdio: 'inherit' });

        console.log('\n✅ Setup completed!');
        console.log('\n📋 Next steps:');
        console.log('   1. Start backend: cd backend && npm run dev');
        console.log('   2. Start frontend: cd frontend && npm run dev');
        console.log('   3. Open browser: http://localhost:5173/admin/login');
        console.log('   4. Login with: admin / admin123');

        rl.close();
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        rl.close();
        process.exit(1);
    }
};

setup();