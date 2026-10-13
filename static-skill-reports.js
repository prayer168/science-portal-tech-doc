// Read only literal strings; never execute JavaScript fetched from the portal.
function parseStaticSkillReports(html) {
  const match = html.match(/const\s+STATIC_SKILL_REPORTS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  return [...match[1].matchAll(/\{([^{}]*)\}/g)].map(item => {
    const entry = {};
    for (const field of item[1].matchAll(/\b(cat|name|url|icon)\s*:\s*("(?:[^"\\]|\\.)*")/g)) {
      entry[field[1]] = JSON.parse(field[2]);
    }
    return entry;
  }).filter(entry => entry.cat === 'skill' && entry.name && /^https:\/\//.test(entry.url));
}

function mergeStaticSkillReports(materials, reports) {
  const staticUrls = new Set(reports.map(entry => entry.url));
  const seen = new Set();
  const uniqueReports = reports.filter(entry => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
  return [...materials.filter(entry => !staticUrls.has(entry.url)), ...uniqueReports];
}
