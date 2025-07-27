import { runQCLI } from './run-qcli';

async function main() {
  console.log('🚀 Knowledge Management System Starting...');
  await runQCLI();
  console.log('\nProcessing complete!');
}

if (require.main === module) {
  main().catch(console.error);
}
