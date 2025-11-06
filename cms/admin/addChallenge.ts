#!/usr/bin/env ts-node

/**
 * CLI tool to add new challenges to the Momentum App database
 * Usage: npm run add-challenge
 */

import inquirer from 'inquirer';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface ChallengeInput {
  title: string;
  description: string;
  zone: 'social' | 'physical' | 'professional' | 'emotional';
  difficulty: 'low' | 'medium' | 'high';
  estimatedTime: number;
  implementationTrigger: string;
  implementationAction: string;
  identityFrame: string;
  meaningConnection: string;
  evidenceType: 'photo' | 'screenshot' | 'voice' | 'honor';
}

const questions = [
  {
    type: 'input',
    name: 'title',
    message: 'Challenge Title:',
    validate: (input: string) => input.length > 0 || 'Title is required',
  },
  {
    type: 'editor',
    name: 'description',
    message: 'Challenge Description (will open editor):',
    validate: (input: string) => input.length > 10 || 'Description must be detailed',
  },
  {
    type: 'list',
    name: 'zone',
    message: 'Zone:',
    choices: ['social', 'physical', 'professional', 'emotional'],
  },
  {
    type: 'list',
    name: 'difficulty',
    message: 'Difficulty:',
    choices: ['low', 'medium', 'high'],
  },
  {
    type: 'number',
    name: 'estimatedTime',
    message: 'Estimated time (minutes):',
    default: 10,
    validate: (input: number) => input > 0 || 'Must be greater than 0',
  },
  {
    type: 'input',
    name: 'implementationTrigger',
    message: 'Implementation Trigger (When X happens...):',
    validate: (input: string) => input.length > 0 || 'Trigger is required',
  },
  {
    type: 'input',
    name: 'implementationAction',
    message: 'Implementation Action (I will do Y...):',
    validate: (input: string) => input.length > 0 || 'Action is required',
  },
  {
    type: 'input',
    name: 'identityFrame',
    message: 'Identity Frame (This is what [identity] does):',
    default: 'This is what courageous people do',
    validate: (input: string) => input.includes('This is what') || 'Must start with "This is what"',
  },
  {
    type: 'editor',
    name: 'meaningConnection',
    message: 'Meaning Connection (Why this matters - will open editor):',
    validate: (input: string) => input.length > 10 || 'Meaning connection must be detailed',
  },
  {
    type: 'list',
    name: 'evidenceType',
    message: 'Evidence Type:',
    choices: ['photo', 'screenshot', 'voice', 'honor'],
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Add this challenge to the database?',
    default: true,
  },
];

async function addChallenge() {
  console.log('\n🎯 Add New Challenge to Momentum App\n');
  console.log('Identity-First Framing Reminders:');
  console.log('  - Focus on WHO they\'re becoming, not WHAT they\'re achieving');
  console.log('  - Use "This is what [identity] does" not "Good job!"');
  console.log('  - Make it specific and actionable\n');

  const answers = await inquirer.prompt(questions);

  if (!answers.confirm) {
    console.log('❌ Challenge creation cancelled');
    process.exit(0);
  }

  const challenge: ChallengeInput = answers;

  try {
    const query = `
      INSERT INTO challenges (
        title, description, zone, difficulty, estimated_time,
        implementation_trigger, implementation_action,
        identity_frame, meaning_connection, evidence_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;

    const values = [
      challenge.title,
      challenge.description,
      challenge.zone,
      challenge.difficulty,
      challenge.estimatedTime,
      challenge.implementationTrigger,
      challenge.implementationAction,
      challenge.identityFrame,
      challenge.meaningConnection,
      challenge.evidenceType,
    ];

    const result = await pool.query(query, values);

    console.log('\n✅ Challenge created successfully!');
    console.log(`📋 Challenge ID: ${result.rows[0].id}`);
    console.log(`🎯 Zone: ${challenge.zone}`);
    console.log(`⚡ Difficulty: ${challenge.difficulty}`);
    console.log(`⏱️  Time: ${challenge.estimatedTime} minutes\n`);
  } catch (error) {
    console.error('❌ Error creating challenge:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addChallenge();
