#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 v0-mcp-ts Setup\n');

  try {
    // Step 1: Check if .env exists
    const envPath = join(cwd(), '.env');
    let apiKey = '';

    if (existsSync(envPath)) {
      console.log('📄 Found existing .env file');
      const envContent = readFileSync(envPath, 'utf8');
      const apiKeyMatch = envContent.match(/V0_API_KEY=(.+)/);
      if (apiKeyMatch) {
        apiKey = apiKeyMatch[1];
        console.log('✅ V0_API_KEY found in .env');
      }
    }

    // Step 2: Get API key if not found
    if (!apiKey || apiKey === 'your_v0_api_key_here') {
      console.log('\n🔑 v0.dev API Key Setup');
      console.log('You need a v0.dev API key to use this server.');
      console.log(
        'Get your API key from: https://v0.dev (requires Premium or Team plan)\n'
      );

      apiKey = await question(
        'Enter your v0.dev API key (or press Enter to skip): '
      );

      if (apiKey) {
        writeFileSync(envPath, `V0_API_KEY=${apiKey}\nDEBUG=false\n`);
        console.log('✅ API key saved to .env file');
      } else {
        writeFileSync(
          envPath,
          `V0_API_KEY=your_v0_api_key_here\nDEBUG=false\n`
        );
        console.log('⚠️  Please edit .env file and add your API key later');
      }
    }

    // Step 3: Build the project
    console.log('\n🔨 Building the project...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');

    // Step 4: Test the server
    console.log('\n🧪 Testing the server...');
    try {
      execSync('npm run test:run', { stdio: 'inherit' });
      console.log('✅ All tests passed');
    } catch (error) {
      console.log('⚠️  Some tests failed, but the server should still work');
    }

    // Step 5: Generate Claude Desktop config
    const configPath = join(cwd(), 'claude-desktop-config.json');
    const distPath = join(cwd(), 'dist', 'index.js');

    const claudeConfig = {
      mcpServers: {
        v0.dev: {
          command: 'node',
          args: [distPath],
          env: {
            V0_API_KEY: apiKey || 'your_v0_api_key_here',
          },
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(claudeConfig, null, 2));
    console.log(`\n📝 Generated Claude Desktop config: ${configPath}`);

    // Step 6: Instructions
    console.log('\n🎉 Setup completed successfully!\n');
    console.log('Next steps:');
    console.log(
      '1. Copy the contents of claude-desktop-config.json to your Claude Desktop configuration'
    );
    console.log(
      '2. Or manually add the server to your MCP client configuration'
    );
    console.log('3. Start using the v0.dev tools in your MCP client!\n');

    console.log('Available tools:');
    console.log('- generate_webapp: Create complete web applications');
    console.log('- enhance_code: Improve existing code');
    console.log('- debug_code: Debug and fix code issues');
    console.log('- generate_component: Create reusable components\n');

    console.log('For more information, see README.md');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error);
