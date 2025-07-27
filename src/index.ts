import { FileSystemManager } from './fileUtils';
import { loadConfig } from './config';

async function main() {
  console.log('PackRat Starting...');
  
  const config = loadConfig();
  const fsManager = new FileSystemManager();
  
  // Ensure all directories exist
  await fsManager.ensureDirectoryExists(config.bucketsDir);
  await fsManager.ensureDirectoryExists(config.archiveDir);
  await fsManager.ensureDirectoryExists(config.reviewDir);
  
  console.log('Directory structure initialized');
  
  // Discover existing buckets
  const buckets = await fsManager.discoverBuckets(config.bucketsDir);
  console.log(`Found ${buckets.length} buckets:`, buckets.map(b => b.name));
  
  console.log('System ready for processing');
}

if (require.main === module) {
  main().catch(console.error);
}
