import chalk from 'chalk';

interface SubagentResult {
  id: number;
  role: string;
  approach: string;
  quality: number; // 0-100
  notes: string;
}

export async function demoCommand(scenario: string = 'subagents') {
  console.log(chalk.bold('\nGrok Build Showcase — Parallel Subagent Demo\n'));
  console.log(chalk.dim('This simulates the best-of-n + worktree isolation pattern used by real Grok Build subagents.'));
  console.log(chalk.dim('In a real session you would use spawn_subagent + isolation: "worktree" + wait_commands_or_subagents.\n'));

  if (scenario === 'subagents' || scenario === 'best-of-n' || !scenario) {
    await runSubagentTournament();
  } else {
    console.log(chalk.yellow(`Unknown scenario "${scenario}". Running default subagents demo.`));
    await runSubagentTournament();
  }
}

async function runSubagentTournament() {
  const task = 'Implement a small "readiness scorer" module that turns audit signals into a 0-100 score with justification.';

  console.log(chalk.bold('Task:'), task);
  console.log(chalk.bold('Spawning 3 candidates in parallel (simulated worktree isolation)...\n'));

  const candidates: Promise<SubagentResult>[] = [
    simulateCandidate(1, 'explorer-first', 300),
    simulateCandidate(2, 'heuristic-heavy', 420),
    simulateCandidate(3, 'minimal-correct', 260)
  ];

  // Parallel execution like real subagents
  const results = await Promise.all(candidates);

  console.log(chalk.bold('\n--- Candidate Results ---\n'));

  const table = results.map(r => ({
    '#': r.id,
    Role: r.role,
    Quality: r.quality,
    Approach: r.approach.slice(0, 42) + (r.approach.length > 42 ? '...' : '')
  }));
  console.table(table);

  console.log('\n' + chalk.bold('Detailed notes:'));
  for (const r of results) {
    const qColor = r.quality >= 85 ? chalk.green : r.quality >= 70 ? chalk.yellow : chalk.red;
    console.log(`${chalk.bold('Candidate ' + r.id)} (${r.role}) — ${qColor(r.quality)}`);
    console.log(`  ${r.notes}`);
    console.log('');
  }

  // "Best of n" selection (like the skill)
  const winner = results.reduce((best, cur) => (cur.quality > best.quality ? cur : best));

  console.log(chalk.green.bold(`WINNER: Candidate ${winner.id} (${winner.role})`));
  console.log(chalk.green(`Selected for quality (${winner.quality}) and completeness.`));
  console.log(chalk.dim('\nIn a real best-of-n run the winner\'s worktree changes would be applied to the main workspace.'));
  console.log(chalk.dim('See the "best-of-n" skill and subagents guide for the exact spawn + resume + apply flow.\n'));
}

function simulateCandidate(id: number, style: string, delayMs: number): Promise<SubagentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (style === 'explorer-first') {
        resolve({
          id,
          role: 'explorer + implementer',
          approach: 'Deep research of existing signals first, then clean scoring fn + tests.',
          quality: 88,
          notes: 'Excellent structure and tests. Slightly slower because of thorough exploration. Handles edge cases well.'
        });
      } else if (style === 'heuristic-heavy') {
        resolve({
          id,
          role: 'implementer',
          approach: 'Hard-coded weights + lots of ifs for every signal observed in the wild.',
          quality: 71,
          notes: 'Fast but overfit. Brittle when new signal types appear. Good for quick prototypes.'
        });
      } else {
        resolve({
          id,
          role: 'minimalist',
          approach: 'Small, pure function. Clear types. Let caller provide weights.',
          quality: 91,
          notes: 'Cleanest. Easiest to test and evolve. Slightly less "smart" out of the box but best long-term.'
        });
      }
    }, delayMs);
  });
}
