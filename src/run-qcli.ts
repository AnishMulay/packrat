import { spawn } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const execAsync = (command: string, args: string[]): Promise<{stdout: string, stderr: string}> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '', stderr = '';
    child.stdout?.on('data', (data) => stdout += data);
    child.stderr?.on('data', (data) => stderr += data);
    child.on('close', (code) => {
      if (code === 0) resolve({stdout, stderr});
      else reject(new Error(`Command failed with code ${code}: ${stderr}`));
    });
  });
};

export async function runQCLI(): Promise<void> {
  try {
    // Check if QCLI is available
    await execAsync('q', ['--version']);
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

Your task is to read and interpret the following unstructured daily notes, and route and rewrite them into the appropriate knowledge buckets.

Each bucket has a purpose and a specific formatting structure, described in its respective \`description.md\`. You must follow the structural and formatting rules for each bucket strictly, using well-formatted Markdown.

---

🪣 **Available Buckets:**

${bucketDescriptions.join('\n')}

---

📌 **Instructions:**

1. Read the notes provided below.
2. Split the content into logically coherent parts and assign each to the appropriate bucket.
3. For each part:
   - **PRESERVE ALL ORIGINAL CONTENT** - do not summarize, condense, or remove any information.
   - Only restructure and reformat the content according to the Markdown structure specified in that bucket's \`description.md\`.
   - Maintain all original thoughts, reasoning, and detailed content.
4. **IMPORTANT**: Write each processed note to the \`notes.md\` file inside the corresponding bucket folder (e.g., \`buckets/research/notes.md\`, \`buckets/personal-stackoverflow/notes.md\`).
5. Do NOT create separate dated files. All notes go into the single \`notes.md\` file within each bucket.
6. Archive the original content by saving it to \`archive/${currentDate}.md\`.
7. Clear the main \`notes.md\` file after processing.

---

🗒 **Daily notes content:**
${notesContent}

Begin processing now.`;

  // Execute QCLI with the constructed prompt
  console.log('🚀 Running QCLI to process notes...');
  console.log('📋 Command: q chat --no-interactive --trust-all-tools [prompt]\n');
  
  const child = spawn('q', ['chat', '--no-interactive', '--trust-all-tools', '--model', 'claude-3.7-sonnet', prompt]);
  
  // Stream output in real-time
  child.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });
  
  child.stderr?.on('data', (data) => {
    process.stderr.write(data);
  });
  
  // Wait for completion
  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ QCLI processing completed');
        resolve(void 0);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

