const fs = require('fs');

const files = [
  'src/app/api/calculate-synastry/route.ts',
  'src/app/api/compatibility/route.ts',
  'src/app/api/divination/route.ts',
  'src/app/api/dream-analysis/route.ts',
  'src/app/api/horoscope/[sign]/route.ts',
  'src/app/api/interpret-transits/route.ts'
];

for (const rp of files) {
  let code = fs.readFileSync(rp, 'utf8');

  // STEP 1: Wipe the botched injected strings completely
  code = code.replace(/\n\s*const rateLimitResponse = checkRateLimit\(request\);\n\s*if \(rateLimitResponse\) return rateLimitResponse;\n/g, '');

  // STEP 2: Properly inject into the body of the function.
  // We match `export async function GET(` followed by characters until `) {` or `) : Promise<NextResponse> {` etc.
  // Regex: match the end of parameters, which is usually `) {` or `) : ... {`
  // A safer way is to match `export async function GET(request: NextRequest` and find the first `{` AFTER the `)`
  
  if (code.includes('export async function GET')) {
    code = code.replace(/(export\s+async\s+function\s+GET\s*\([^)]*\)(?:\s*:\s*[^{]+)?\s*\{)/g, 
      (match) => match + '\n  const rateLimitResponse = checkRateLimit(request);\n  if (rateLimitResponse) return rateLimitResponse;\n'
    );
  }
  if (code.includes('export async function POST')) {
    code = code.replace(/(export\s+async\s+function\s+POST\s*\([^)]*\)(?:\s*:\s*[^{]+)?\s*\{)/g, 
      (match) => match + '\n  const rateLimitResponse = checkRateLimit(request);\n  if (rateLimitResponse) return rateLimitResponse;\n'
    );
  }

  fs.writeFileSync(rp, code);
  console.log('Fixed', rp);
}
