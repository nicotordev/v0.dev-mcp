#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔒 Security Check for v0-mcp-ts Build');
console.log('=====================================\n');

const buildFile = join(process.cwd(), 'dist', 'index.js');

try {
  const content = readFileSync(buildFile, 'utf8');

  console.log('📁 Build file:', buildFile);
  console.log('📊 File size:', Math.round(content.length / 1024), 'KB\n');

  // Check for environment variable references
  const envRefs = content.match(/process\.env\[['"][\w_]+['"]\]/g) || [];
  console.log('🔍 Environment variable references found:');
  if (envRefs.length === 0) {
    console.log(
      '   ❌ No process.env references found (this might be a problem)'
    );
  } else {
    envRefs.forEach((ref) => {
      console.log(`   ✅ ${ref} (runtime reference - secure)`);
    });
  }

  // Check for potential API key patterns
  const suspiciousPatterns = [
    /v1:[a-zA-Z0-9]{20,}/g, // v0dev API keys
    /sk-[a-zA-Z0-9]{20,}/g, // OpenAI keys
    /pk_[a-zA-Z0-9]{20,}/g, // Stripe keys
    /rk_[a-zA-Z0-9]{20,}/g, // Other API keys
    /[a-zA-Z0-9]{32,}/g, // Long strings that could be secrets
  ];

  console.log('\n🚨 Checking for hardcoded secrets:');
  let foundSecrets = false;

  suspiciousPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern) || [];
    if (matches.length > 0) {
      foundSecrets = true;
      console.log(
        `   ⚠️  Found ${matches.length} potential secrets matching pattern ${
          index + 1
        }`
      );
      matches.slice(0, 3).forEach((match) => {
        console.log(`      ${match.substring(0, 10)}...`);
      });
    }
  });

  if (!foundSecrets) {
    console.log('   ✅ No hardcoded secrets detected');
  }

  // Check for NODE_ENV references
  const nodeEnvRefs = content.match(/NODE_ENV/g) || [];
  console.log(`\n🌍 NODE_ENV references: ${nodeEnvRefs.length}`);
  if (nodeEnvRefs.length > 0) {
    console.log('   ✅ NODE_ENV usage is normal and expected');
  }

  // Final assessment
  console.log('\n📋 Security Assessment:');
  console.log('======================');

  if (envRefs.length > 0 && !foundSecrets) {
    console.log(
      '✅ PASS: Environment variables are referenced but not hardcoded'
    );
    console.log('✅ PASS: No API keys or secrets found in build');
    console.log('✅ PASS: Variables will be loaded at runtime');
    console.log(
      '\n🎉 Your build is secure! Environment variables are properly handled.'
    );
  } else if (foundSecrets) {
    console.log('❌ FAIL: Potential secrets found in build');
    console.log(
      '⚠️  WARNING: Review the output above and remove any hardcoded secrets'
    );
    process.exit(1);
  } else {
    console.log('⚠️  WARNING: No environment variable references found');
    console.log('   This might indicate a build problem');
  }
} catch (error) {
  console.error('❌ Error reading build file:', error.message);
  process.exit(1);
}
