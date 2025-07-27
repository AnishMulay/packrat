import { exec } from 'child_process';
import { promisify } from 'util';
import { BucketConfig, ProcessingResult } from './types';

const execAsync = promisify(exec);

export interface AIProvider {
  processNotes(content: string, buckets: BucketConfig[]): Promise<ProcessingResult>;
}

export class AmazonQProvider implements AIProvider {
  async processNotes(content: string, buckets: BucketConfig[]): Promise<ProcessingResult> {
    const prompt = this.buildPrompt(content, buckets);
    
    try {
      // Use Amazon Q CLI to process the content
      const { stdout, stderr } = await execAsync(`q chat --no-interactive --trust-all-tools "${prompt}"`);
      
      if (stderr) {
        console.warn('Amazon Q CLI warning:', stderr);
      }
      
      return this.parseAIResponse(stdout, buckets);
    } catch (error) {
      console.error('Error calling Amazon Q CLI:', error);
      // Fallback: return uncategorized content
      return {
        categorizedNotes: new Map(),
        uncategorizedContent: content,
        timestamp: new Date()
      };
    }
  }

  private buildPrompt(content: string, buckets: BucketConfig[]): string {
    const bucketDescriptions = buckets.map(bucket => 
      `**${bucket.name}**: ${bucket.description}`
    ).join('\n');

    return `You are a knowledge management assistant. I have daily notes that need to be categorized into specific buckets.

Available buckets:
${bucketDescriptions}

Daily notes content:
---
${content}
---

Please analyze the content and categorize each relevant piece into appropriate buckets. 

IMPORTANT RESPONSE FORMAT:
For each bucket that should receive content, respond with:
BUCKET: bucket_name
CONTENT:
[the relevant content for this bucket, cleaned and formatted]
END_BUCKET

If any content doesn't fit into existing buckets, include it at the end with:
UNCATEGORIZED:
[uncategorized content]
END_UNCATEGORIZED

Only include content that is meaningful and substantive. Ignore empty lines, timestamps, or metadata unless they provide context.`;
  }

  private parseAIResponse(response: string, buckets: BucketConfig[]): ProcessingResult {
    const categorizedNotes = new Map<string, string>();
    let uncategorizedContent = '';
    
    // Parse the structured response
    const bucketRegex = /BUCKET:\s*(\w+)\s*\nCONTENT:\s*([\s\S]*?)(?=END_BUCKET)/g;
    const uncategorizedRegex = /UNCATEGORIZED:\s*([\s\S]*?)(?=END_UNCATEGORIZED|$)/;
    
    let match;
    while ((match = bucketRegex.exec(response)) !== null) {
      const bucketName = match[1].trim();
      const content = match[2].trim();
      
      // Verify bucket exists
      if (buckets.some(b => b.name === bucketName)) {
        categorizedNotes.set(bucketName, content);
      }
    }
    
    const uncategorizedMatch = uncategorizedRegex.exec(response);
    if (uncategorizedMatch) {
      uncategorizedContent = uncategorizedMatch[1].trim();
    }
    
    return {
      categorizedNotes,
      uncategorizedContent,
      timestamp: new Date()
    };
  }
}

export class MockAIProvider implements AIProvider {
  async processNotes(content: string, buckets: BucketConfig[]): Promise<ProcessingResult> {
    // Simple mock implementation for testing
    console.log('🤖 Using Mock AI Provider');
    
    const categorizedNotes = new Map<string, string>();
    
    // Simple keyword-based categorization for testing
    if (buckets.length > 0) {
      const firstBucket = buckets[0];
      if (content.toLowerCase().includes('project') || content.toLowerCase().includes('work')) {
        categorizedNotes.set(firstBucket.name, content);
      }
    }
    
    return {
      categorizedNotes: categorizedNotes.size > 0 ? categorizedNotes : new Map(),
      uncategorizedContent: categorizedNotes.size > 0 ? '' : content,
      timestamp: new Date()
    };
  }
}

export function createAIProvider(providerType: string): AIProvider {
  switch (providerType) {
    case 'amazon-q':
      return new AmazonQProvider();
    case 'mock':
      return new MockAIProvider();
    default:
      console.warn(`Unknown AI provider: ${providerType}, using mock`);
      return new MockAIProvider();
  }
}
