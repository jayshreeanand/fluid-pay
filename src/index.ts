import { Command } from 'commander';
import dotenv from 'dotenv';
import * as example from './example.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const program = new Command();

program
  .option('--project <project>', 'Specify which project to run (e.g., payments-hub)')
  .option('--simulate <simulate>', 'Whether to run in simulation mode')
  .parse(process.argv);

const options = program.opts();

// Run the appropriate example based on the project option
if (options.project === 'payments-hub') {
  console.log('Running payments-hub example in', options.simulate === 'true' ? 'simulation mode' : 'real mode');
  // The example will automatically run from the import
} else {
  console.log('Please specify a valid project to run. Example: --project payments-hub');
} 