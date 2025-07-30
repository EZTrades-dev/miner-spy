#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Miner Spy - Setup Assistant\n');
console.log('This script will help you set up Miner Spy for local development.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    // Check if .env already exists
    if (fs.existsSync('.env')) {
      console.log('✅ .env file already exists');
      const overwrite = await askQuestion('Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled. Your existing .env file is preserved.');
        rl.close();
        return;
      }
    }

    // Get API key from user
    console.log('\n📋 TaoStats API Key Setup');
    console.log('You need a free API key from TaoStats.io to fetch real-time data.');
    console.log('Visit: https://taostats.io/api-docs to get your key.\n');
    
    const apiKey = await askQuestion('Enter your TaoStats API key (or press Enter to skip): ');
    
    // Create .env file
    const envContent = fs.readFileSync('.env.example', 'utf8');
    const newEnvContent = apiKey 
      ? envContent.replace('your_taostats_api_key_here', apiKey)
      : envContent;
    
    fs.writeFileSync('.env', newEnvContent);
    
    if (apiKey) {
      console.log('✅ .env file created with your API key');
    } else {
      console.log('⚠️  .env file created with placeholder API key');
      console.log('   Remember to add your real API key later!');
    }
    
    // Check if node_modules exist
    console.log('\n📦 Installing Dependencies...');
    
    if (!fs.existsSync('node_modules')) {
      console.log('Installing root dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    if (!fs.existsSync('client/node_modules')) {
      console.log('Installing client dependencies...');
      execSync('cd client && npm install', { stdio: 'inherit' });
    }
    
    console.log('✅ Dependencies installed');
    
    // Final instructions
    console.log('\n🚀 Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Select a subnet (1-32) and explore the data!');
    
    if (!apiKey) {
      console.log('\n⚠️  Important: You\'ll need to add your TaoStats API key to .env');
      console.log('   The app will show errors until you configure a valid API key.');
    }
    
    console.log('\nFor help: https://github.com/EZTrades-dev/miner-spy/issues');
    console.log('Follow updates: https://x.com/E_Z_Trades\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nPlease check the error above and try again.');
    console.log('For help: https://github.com/EZTrades-dev/miner-spy/issues');
  } finally {
    rl.close();
  }
}

main();
