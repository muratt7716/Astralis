const fs = require('fs');
const path = require('path');

const routes = [
  'src/app/api/horoscope/[sign]/route.ts',
  'src/app/api/calculate-synastry/route.ts',
  'src/app/api/divination/route.ts',
  'src/app/api/dream-analysis/route.ts',
  'src/app/api/interpret-transits/route.ts',
  'src/app/api/compatibility/route.ts'
];

for (const rp of routes) {
  const fullPath = path.join(process.cwd(), rp);
  if (!fs.existsSync(fullPath)) {
    console.log("Not found:", fullPath);
    continue;
  }
  
  let code = fs.readFileSync(fullPath, 'utf8');

  // Insert import if not exists
  if (!code.includes('checkRateLimit')) {
    code = `import { checkRateLimit } from "@/lib/rate-limit";\n` + code;
  }

  const rateLimitCheck = `
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
`;

  // Inject into GET
  if (code.includes('export async function GET(') && !code.includes('checkRateLimit(request)')) {
    code = code.replace(
      /export async function GET\([\s\S]*?\{/,
      (match) => match + rateLimitCheck
    );
  }

  // Inject into POST
  if (code.includes('export async function POST(') && !code.includes('checkRateLimit(request)')) {
    code = code.replace(
      /export async function POST\([\s\S]*?\{/,
      (match) => match + rateLimitCheck
    );
  }

  fs.writeFileSync(fullPath, code);
  console.log('Applied rate limit to', rp);
}

console.log('Rate Limit integration complete.');
