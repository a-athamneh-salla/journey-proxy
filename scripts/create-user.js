#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt for user input with a question
 * @param {string} question 
 * @returns {Promise<string>}
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('====================================');
    console.log('Salla Proxy - User Creation Utility');
    console.log('====================================\n');
    
    const username = await prompt('Enter username: ');
    if (!username) {
      console.error('Username is required');
      process.exit(1);
    }
    
    const password = await prompt('Enter password: ');
    if (!password || password.length < 8) {
      console.error('Password must be at least 8 characters');
      process.exit(1);
    }
    
    const email = await prompt('Enter email (optional): ');
    const keyName = await prompt('Enter API key name/description: ');
    
    // Generate SQL for user insertion
    const userId = crypto.randomUUID();
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Use wrangler to execute the SQL
    const userSql = `
      INSERT INTO users (id, username, password, email, created_at, updated_at)
      VALUES ('${userId}', '${username}', '${password}', ${email ? `'${email}'` : 'NULL'}, ${timestamp}, ${timestamp});
    `;
    
    const tempSqlFile = path.join(__dirname, 'temp-user-create.sql');
    fs.writeFileSync(tempSqlFile, userSql);
    
    console.log('\nCreating user...');
    execSync(`wrangler d1 execute salla-proxy-db --file=${tempSqlFile}`, { stdio: 'inherit' });
    fs.unlinkSync(tempSqlFile);
    
    // Create API key if requested
    if (keyName) {
      const keyId = crypto.randomUUID();
      const apiKey = crypto.randomUUID();
      
      const keySql = `
        INSERT INTO api_keys (id, user_id, key_name, api_key, created_at, updated_at)
        VALUES ('${keyId}', '${userId}', '${keyName}', '${apiKey}', ${timestamp}, ${timestamp});
      `;
      
      const tempKeySqlFile = path.join(__dirname, 'temp-key-create.sql');
      fs.writeFileSync(tempKeySqlFile, keySql);
      
      console.log('\nCreating API key...');
      execSync(`wrangler d1 execute salla-proxy-db --file=${tempKeySqlFile}`, { stdio: 'inherit' });
      fs.unlinkSync(tempKeySqlFile);
      
      console.log('\n====================================');
      console.log('User and API Key Created Successfully');
      console.log('====================================');
      console.log(`Username: ${username}`);
      console.log(`User ID: ${userId}`);
      console.log(`API Key: ${apiKey}`);
      console.log('Make sure to securely store this API key, as it will not be shown again.');
    } else {
      console.log('\n======================');
      console.log('User Created Successfully');
      console.log('======================');
      console.log(`Username: ${username}`);
      console.log(`User ID: ${userId}`);
    }
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();