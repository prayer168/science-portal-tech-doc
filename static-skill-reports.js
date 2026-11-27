// Read only literal strings; never execute JavaScript fetched from the portal.
function parseStaticSkillReports(html) {
  const match = html.match(/const\s+STATIC_SKILL_REPORTS\s*=\s*\[([\s\S]*?)\];/);
  const fixedEntries = html.match(/function\s+staticPortalEntries\(\)\s*\{([\s\S]*?)\n\}/);
  const literals = (match?.[1] || "") + (fixedEntries?.[1] || "");
  return [...literals.matchAll(/\{([^{}]*)\}/g)].map(item => {
    const entry = {};
    for (const field of item[1].matchAll(/\b(cat|name|url|icon)\s*:\s*("(?:[^"\\]|\\.)*")/g)) {
      entry[field[1]] = JSON.parse(field[2]);
    }
    return entry;
  }).filter(entry => entry.cat && entry.name && /^https:\/\//.test(entry.url));
}

function mergeStaticSkillReports(materials, reports) {
  // The same repository can intentionally appear once in each category.
  const key = entry => JSON.stringify([entry.cat, entry.url]);
  const staticKeys = new Set(reports.map(key));
  const seen = new Set();
  const uniqueReports = reports.filter(entry => {
    if (seen.has(key(entry))) return false;
    seen.add(key(entry));
    return true;
  });
  return [...materials.filter(entry => !staticKeys.has(key(entry))), ...uniqueReports];
}
