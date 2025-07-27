import { FileSystemManager } from './fileUtils';
import { AIProvider } from './aiProvider';
import { SystemConfig, BucketConfig, ProcessingResult } from './types';
import * as path from 'path';

export class NotesProcessor {
  constructor(
    private fsManager: FileSystemManager,
    private aiProvider: AIProvider,
    private config: SystemConfig
  ) {}

  async processNotes(): Promise<ProcessingResult> {
    console.log('Reading daily notes...');
    
    // Check if notes file exists and has content
    if (!await this.fsManager.fileExists(this.config.notesFile)) {
      console.log('ℹ️  No notes file found, nothing to process');
      return {
        categorizedNotes: new Map(),
        uncategorizedContent: '',
        timestamp: new Date()
      };
    }

    const notesContent = await this.fsManager.readFile(this.config.notesFile);
    
    if (!notesContent.trim()) {
      console.log('ℹ️  Notes file is empty, nothing to process');
      return {
        categorizedNotes: new Map(),
        uncategorizedContent: '',
        timestamp: new Date()
      };
    }

    console.log(`Processing ${notesContent.length} characters of notes`);

    // Discover buckets
    const buckets = await this.fsManager.discoverBuckets(this.config.bucketsDir);
    console.log(`Found ${buckets.length} buckets for categorization`);

    if (buckets.length === 0) {
      console.warn('No buckets found, all content will be uncategorized');
    }

    // Process with AI
    console.log('Processing notes with AI...');
    const result = await this.aiProvider.processNotes(notesContent, buckets);

    // Save categorized content to buckets
    await this.saveToBuckets(result.categorizedNotes, buckets);

    // Archive original content
    await this.archiveOriginalNotes(notesContent, result.timestamp);

    // Save uncategorized content
    if (result.uncategorizedContent.trim()) {
      await this.saveUncategorizedContent(result.uncategorizedContent, result.timestamp);
    }

    // Clear the original notes file
    await this.fsManager.clearFile(this.config.notesFile);
    console.log('Cleared original notes file');

    return result;
  }

  private async saveToBuckets(categorizedNotes: Map<string, string>, buckets: BucketConfig[]): Promise<void> {
    for (const [bucketName, content] of categorizedNotes) {
      const bucket = buckets.find(b => b.name === bucketName);
      if (!bucket) {
        console.warn(`Bucket '${bucketName}' not found, skipping content`);
        continue;
      }

      console.log(`Adding content to bucket: ${bucketName}`);
      
      const timestamp = new Date().toISOString();
      const formattedContent = `\n\n## ${timestamp}\n\n${content}\n`;
      
      await this.fsManager.appendToFile(bucket.notesPath, formattedContent);
    }
  }

  private async archiveOriginalNotes(content: string, timestamp: Date): Promise<void> {
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const archivePath = path.join(this.config.archiveDir, `${dateStr}.md`);
    
    console.log(`Archiving original content to: ${archivePath}`);
    await this.fsManager.writeFile(archivePath, content);
  }

  private async saveUncategorizedContent(content: string, timestamp: Date): Promise<void> {
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
    const reviewPath = path.join(this.config.reviewDir, `unclassified-${dateStr}.md`);
    
    console.log(`Saving uncategorized content to: ${reviewPath}`);
    await this.fsManager.writeFile(reviewPath, content);
  }
}
