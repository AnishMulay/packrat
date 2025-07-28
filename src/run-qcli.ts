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
  
  const prompt = `You are an intelligent knowledge management assistant.

Your task is to read and interpret the following unstructured daily notes, and route and rewrite them into the appropriate knowledge buckets listed below.

Each bucket has a purpose and a specific formatting structure, described in its respective \`description.md\`. You must follow the structural and formatting rules for each bucket strictly, using well-formatted Markdown.

---

🪣 **Available Buckets:**

${bucketDescriptions.join('\n')}

More buckets may be added in the future.

---

📌 **Instructions:**

1. Read the notes provided below.
2. Split the content into logically coherent parts and assign each to the appropriate bucket.
3. For each part:
   - Rephrase, structure, and summarize the content as needed.
   - Format the note using the Markdown structure specified in that bucket's \`description.md\`.
4. Archive the original content in \`archive/${currentDate}.md\`
5. Route unclassifiable or ambiguous content to \`review/unclassified-${currentDate}.md\`
6. Clear \`notes.md\` after processing.

---

🗒 **Daily notes content:**
${notesContent}

Begin processing now.`;

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

