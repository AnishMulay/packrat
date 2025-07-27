import * as fs from 'fs-extra';
import * as path from 'path';
import { BucketConfig } from './types';

export class FileSystemManager {
  constructor(private baseDir: string = process.cwd()) {}

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    const fullPath = path.resolve(this.baseDir, dirPath);
    await fs.ensureDir(fullPath);
  }

  async readFile(filePath: string): Promise<string> {
    const fullPath = path.resolve(this.baseDir, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.baseDir, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async appendToFile(filePath: string, content: string): Promise<void> {
    const fullPath = path.resolve(this.baseDir, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.appendFile(fullPath, content, 'utf-8');
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.resolve(this.baseDir, filePath);
    return await fs.pathExists(fullPath);
  }

  async clearFile(filePath: string): Promise<void> {
    await this.writeFile(filePath, '');
  }

  async discoverBuckets(bucketsDir: string): Promise<BucketConfig[]> {
    const buckets: BucketConfig[] = [];
    const bucketsPath = path.resolve(this.baseDir, bucketsDir);
    
    if (!await fs.pathExists(bucketsPath)) {
      return buckets;
    }

    const entries = await fs.readdir(bucketsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const bucketPath = path.join(bucketsPath, entry.name);
        const descriptionPath = path.join(bucketPath, 'description.md');
        
        if (await fs.pathExists(descriptionPath)) {
          const description = await fs.readFile(descriptionPath, 'utf-8');
          buckets.push({
            name: entry.name,
            description: description.trim(),
            notesPath: path.join(bucketPath, 'notes.md')
          });
        }
      }
    }

    return buckets;
  }
}
