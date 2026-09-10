export type VersionPart = 'major' | 'minor' | 'patch';

export function parseVersion(value: string): { major: number; minor: number; patch: number } | null {
  const match = value.trim().replace(/^v/i, '').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
  };
}

export function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

export function bumpVersion(value: string, part: VersionPart, fallback = ''): string {
  const parsed = parseVersion(value) ?? parseVersion(fallback);
  if (!parsed) {
    if (part === 'major') {
      return '1.0.0';
    }
    if (part === 'minor') {
      return '0.1.0';
    }
    return '0.0.1';
  }
  if (part === 'major') {
    return formatVersion(parsed.major + 1, 0, 0);
  }
  if (part === 'minor') {
    return formatVersion(parsed.major, parsed.minor + 1, 0);
  }
  return formatVersion(parsed.major, parsed.minor, parsed.patch + 1);
}
