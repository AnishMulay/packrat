import { SystemConfig } from './types';
import * as path from 'path';

export const defaultConfig: SystemConfig = {
  notesFile: 'notes.md',
  bucketsDir: 'buckets',
  archiveDir: 'archive',
  reviewDir: 'review',
  gitEnabled: true,
  gitRemote: 'origin',
  aiProvider: 'amazon-q'
};

export function loadConfig(): SystemConfig {
  // For now, return defaults
  return defaultConfig;
}
