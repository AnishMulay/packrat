export interface BucketConfig {
    name: string;
    description: string;
    notesPath: string;
  }
  
  export interface SystemConfig {
    notesFile: string;
    bucketsDir: string;
    archiveDir: string;
    reviewDir: string;
    gitEnabled: boolean;
    gitRemote: string;
    aiProvider: 'amazon-q';
  }
  
  export interface ProcessingResult {
    categorizedNotes: Map<string, string>;
    uncategorizedContent: string;
    timestamp: Date;
  }
  