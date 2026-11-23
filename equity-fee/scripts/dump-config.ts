// Prints src/config.ts as JSON so the Python audio tools read the same single source.
import * as c from '../src/config.ts';
process.stdout.write(JSON.stringify(c));
