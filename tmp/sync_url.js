const fs = require('fs');
const path = require('path');

// 1. Refactor biyoritim/page.tsx
const bioPath = 'src/app/biyoritim/page.tsx';
let bio = fs.readFileSync(bioPath, 'utf8');

if (!bio.includes('useSearchParams')) {
  bio = bio.replace(
    /import \{ useState, useMemo, useEffect \} from "react";/,
    `import { useState, useMemo, useEffect, Suspense } from "react";\nimport { useSearchParams, useRouter } from "next/navigation";`
  );

  bio = bio.replace(
    /export default function BiyoritimPage\(\) \{/,
    `function BiyoritimContent() {`
  );

  bio = bio.replace(
    /const defaultToday = new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\];/,
    `const router = useRouter();\n  const searchParams = useSearchParams();\n\n  const defaultToday = new Date().toISOString().split("T")[0];`
  );

  bio = bio.replace(
    /const \[targetDateInput, setTargetDateInput\] = useState\(defaultToday\);/,
    `const [targetDateInput, setTargetDateInput] = useState(searchParams?.get("target") || defaultToday);`
  );

  bio = bio.replace(
    /const \[birthDate, setBirthDate\] = useState\(""\);/,
    `const [birthDate, setBirthDate] = useState(searchParams?.get("birth") || "");`
  );

  bio = bio.replace(
    /const \[showResult, setShowResult\] = useState\(false\);/,
    `const [showResult, setShowResult] = useState(!!searchParams?.get("birth"));`
  );

  bio = bio.replace(
    /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?if \(parsedBirth\) setShowResult\(true\);\s*\};/,
    `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedBirth) {
      router.push(\`?birth=\${birthDate}&target=\${targetDateInput}\`, { scroll: false });
      setShowResult(true);
    }
  };`
  );

  // Since we renamed BiyoritimPage to BiyoritimContent, wrap it at the end
  bio += `\n\nexport default function BiyoritimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen cosmic-gradient" />}>
      <BiyoritimContent />
    </Suspense>
  );
}\n`;

  fs.writeFileSync(bioPath, bio);
  console.log("Patched Biyoritim.");
}

// 2. Refactor uyumluluk/page.tsx (Synchronize Sign1 and Sign2)
const compatPath = 'src/app/uyumluluk/page.tsx';
let compat = fs.readFileSync(compatPath, 'utf8');

if (!compat.includes('useSearchParams')) {
  compat = compat.replace(
    /import \{ useState, useMemo, useEffect \} from "react";/,
    `import { useState, useMemo, useEffect, Suspense } from "react";\nimport { useSearchParams, useRouter } from "next/navigation";`
  );

  compat = compat.replace(
    /export default function UyumlulukPage\(\) \{/,
    `function UyumlulukContent() {`
  );

  compat = compat.replace(
    /const \{ t, language \} = useTranslation\(\);/,
    `const { t, language } = useTranslation();\n  const router = useRouter();\n  const searchParams = useSearchParams();`
  );

  compat = compat.replace(
    /const \[activeTab, setActiveTab\] = useState<"simple" \| "personal" \| "matrix">\("simple"\);/,
    `const [activeTab, setActiveTab] = useState<"simple" | "personal" | "matrix">((searchParams?.get("tab") as any) || "simple");`
  );

  compat = compat.replace(
    /const \[sign1, setSign1\] = useState(?:<string>)?\(""\);/,
    `const [sign1, setSign1] = useState(searchParams?.get("s1") || "");`
  );

  compat = compat.replace(
    /const \[sign2, setSign2\] = useState(?:<string>)?\(""\);/,
    `const [sign2, setSign2] = useState(searchParams?.get("s2") || "");`
  );

  // Sync state into useEffect
  const useEffectSync = `
  useEffect(() => {
    if (searchParams?.get("s1") && searchParams?.get("s2") && activeTab === "simple") {
       handleSimpleCalculate();
    }
  }, [searchParams]);

  const pushState = (s1: string, s2: string) => {
    router.push(\`?tab=simple&s1=\${s1}&s2=\${s2}\`, { scroll: false });
  };
`;
  compat = compat.replace(
    /const handleSimpleCalculate = async \(\) => \{/,
    `${useEffectSync}\n  const handleSimpleCalculate = async () => {`
  );

  compat = compat.replace(
    /const res = await fetch\(`\/api\/compatibility\?lang=\$\{language\}`/,
    `pushState(sign1, sign2);\n      const res = await fetch(\`/api/compatibility?lang=\${language}\``
  );

  // Wrapper
  compat += `\n\nexport default function UyumlulukPage() {
  return (
    <Suspense fallback={<div className="min-h-screen cosmic-gradient" />}>
      <UyumlulukContent />
    </Suspense>
  );
}\n`;

  fs.writeFileSync(compatPath, compat);
  console.log("Patched Uyumluluk.");
}

