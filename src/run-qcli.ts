import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

export async function runQCLI(): Promise<void> {
  try {
    // Check if QCLI is available
    await execAsync('q --version');
  } catch (error) {
    throw new Error('QCLI is not installed or not found in PATH. Please install it before running this script.');
  }

  const rootDir = process.cwd();
  
  // Read notes.md content
  const notesPath = join(rootDir, 'notes.md');
  const notesContent = await readFile(notesPath, 'utf-8');
  
  // Read all bucket descriptions
  const bucketsDir = join(rootDir, 'buckets');
  const bucketFolders = await readdir(bucketsDir);
  
  const bucketDescriptions: string[] = [];
  for (const folder of bucketFolders) {
    const descriptionPath = join(bucketsDir, folder, 'description.md');
    const description = await readFile(descriptionPath, 'utf-8');
    bucketDescriptions.push(`**${folder}**: ${description.trim()}`);
  }
  
  // Construct the prompt
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const prompt = `You are a knowledge management assistant. Process the following daily notes and categorize them into the appropriate buckets.

Available buckets:
${bucketDescriptions.join('\n')}

Daily notes content:
---
${notesContent}
---

Instructions:
1. Parse the contents of notes.md above
2. Route content to the correct bucket/notes.md files based on the bucket descriptions
3. Structure content according to each bucket's format requirements
4. Archive the full raw contents to archive/${currentDate}.md
5. Route any unclassifiable content to review/unclassified-${currentDate}.md
6. Clear notes.md after processing

Please execute these actions now.`;

  // Execute QCLI with the constructed prompt
  const command = `q chat --no-interactive --trust-all-tools "${prompt.replace(/"/g, '\\"')}"`;
  
  console.log('🚀 Running QCLI to process notes...');
  const { stdout, stderr } = await execAsync(command);
  
  if (stderr) {
    console.warn('QCLI warnings:', stderr);
  }
  
  console.log('✅ QCLI processing completed');
  if (stdout) {
    console.log('Output:', stdout);
  }
}

