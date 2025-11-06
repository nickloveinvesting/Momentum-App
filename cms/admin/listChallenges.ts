#!/usr/bin/env ts-node

/**
 * CLI tool to list and filter challenges from the database
 * Usage: npm run list-challenges
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface ChallengeRow {
  id: string;
  title: string;
  zone: string;
  difficulty: string;
  estimated_time: number;
  is_active: boolean;
  created_at: Date;
}

async function listChallenges() {
  const args = process.argv.slice(2);
  const zone = args.find((arg) => arg.startsWith('--zone='))?.split('=')[1];
  const difficulty = args.find((arg) => arg.startsWith('--difficulty='))?.split('=')[1];
  const limit = parseInt(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || '50');

  console.log('\n📚 Momentum App Challenge Library\n');

  let query = 'SELECT id, title, zone, difficulty, estimated_time, is_active, created_at FROM challenges';
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (zone) {
    conditions.push(`zone = $${paramCount++}`);
    values.push(zone);
  }

  if (difficulty) {
    conditions.push(`difficulty = $${paramCount++}`);
    values.push(difficulty);
  }

  conditions.push(`is_active = $${paramCount++}`);
  values.push(true);

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY zone, difficulty, created_at DESC';
  query += ` LIMIT $${paramCount}`;
  values.push(limit);

  try {
    const result = await pool.query<ChallengeRow>(query, values);
    const challenges = result.rows;

    if (challenges.length === 0) {
      console.log('No challenges found with the specified filters.\n');
      pool.end();
      return;
    }

    // Group by zone and difficulty
    const grouped: Record<string, Record<string, ChallengeRow[]>> = {};

    challenges.forEach((challenge) => {
      if (!grouped[challenge.zone]) {
        grouped[challenge.zone] = {};
      }
      if (!grouped[challenge.zone][challenge.difficulty]) {
        grouped[challenge.zone][challenge.difficulty] = [];
      }
      grouped[challenge.zone][challenge.difficulty].push(challenge);
    });

    // Print summary
    console.log(`Total Challenges: ${challenges.length}\n`);

    // Print by zone
    Object.entries(grouped).forEach(([zone, difficulties]) => {
      const zoneTotal = Object.values(difficulties).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`\n${getZoneEmoji(zone)} ${zone.toUpperCase()} (${zoneTotal} challenges)`);
      console.log('='.repeat(60));

      Object.entries(difficulties).forEach(([difficulty, items]) => {
        console.log(`\n  ${getDifficultyLabel(difficulty)} (${items.length})`);
        items.forEach((challenge) => {
          const time = challenge.estimated_time;
          console.log(`    • ${challenge.title} (${time}min)`);
        });
      });
    });

    console.log('\n');

    // Print detailed stats
    const stats = {
      byZone: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
    };

    challenges.forEach((c) => {
      stats.byZone[c.zone] = (stats.byZone[c.zone] || 0) + 1;
      stats.byDifficulty[c.difficulty] = (stats.byDifficulty[c.difficulty] || 0) + 1;
    });

    console.log('📊 Statistics:');
    console.log('By Zone:', stats.byZone);
    console.log('By Difficulty:', stats.byDifficulty);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error fetching challenges:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function getZoneEmoji(zone: string): string {
  const emojis: Record<string, string> = {
    social: '🤝',
    physical: '💪',
    professional: '💼',
    emotional: '🧠',
  };
  return emojis[zone] || '📌';
}

function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    low: '🟢 LOW',
    medium: '🟡 MEDIUM',
    high: '🔴 HIGH',
  };
  return labels[difficulty] || difficulty.toUpperCase();
}

console.log('Usage:');
console.log('  npm run list-challenges');
console.log('  npm run list-challenges -- --zone=social');
console.log('  npm run list-challenges -- --difficulty=high');
console.log('  npm run list-challenges -- --zone=physical --difficulty=medium');
console.log('  npm run list-challenges -- --limit=100\n');

listChallenges();
