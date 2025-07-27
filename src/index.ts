import { FileSystemManager } from './fileUtils';
import { loadConfig } from './config';
import { createAIProvider } from './aiProvider';
import { NotesProcessor } from './processor';

async function main() {
  console.log('🚀 Knowledge Management System Starting...');
  
  const config = loadConfig();
  const fsManager = new FileSystemManager();
  
  // Ensure all directories exist
  await fsManager.ensureDirectoryExists(config.bucketsDir);
  await fsManager.ensureDirectoryExists(config.archiveDir);
  await fsManager.ensureDirectoryExists(config.reviewDir);
  
  console.log('Directory structure initialized');
  
  // Initialize AI provider (use mock for testing)
  const aiProvider = createAIProvider('mock'); // Change to 'amazon-q' when ready
  
  // Create processor
  const processor = new NotesProcessor(fsManager, aiProvider, config);
  
  // Process notes
  const result = await processor.processNotes();
  
  console.log('\nProcessing Summary:');
  console.log(`  Categorized into ${result.categorizedNotes.size} buckets`);
  console.log(`  Uncategorized content: ${result.uncategorizedContent ? 'Yes' : 'No'}`);
  console.log(`  Processed at: ${result.timestamp.toLocaleString()}`);
  
  console.log('\nProcessing complete!');
}

if (require.main === module) {
  main().catch(console.error);
}
