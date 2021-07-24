
import yargs from 'yargs';
import axios from 'axios';

interface Job {
  first: string;
  last: string;
}

const person: Job = {
  first: 'Johgnn',
  last: 'Doe',
}

function run(x: string, y: string): string {
  return '';
}

console.log(person)

async function main() {
  const args = yargs.options({
    'url': { type: 'string', demandOption: true, alias: 'u' },
    'api-key': { type: 'string', demandOption: true, alias: 'a' },
    'instructions': { type: 'array', demandOption: true, alias: 'i' },
  }).argv;

  console.log(args);
}

main();
