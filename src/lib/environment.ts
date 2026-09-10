export interface DetectedEnvironment {
  browser: string;
  operatingSystem: string;
  device: string;
}

export function detectEnvironment(): DetectedEnvironment {
  const userAgent = navigator.userAgent;
  return {
    browser: detectBrowser(userAgent),
    operatingSystem: detectOperatingSystem(userAgent),
    device: detectDevice(userAgent),
  };
}

function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Edg/')) {
    const version = userAgent.match(/Edg\/([\d.]+)/)?.[1] ?? '';
    return `Edge ${version}`.trim();
  }
  if (userAgent.includes('Chrome/')) {
    const version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
    return `Chrome ${version}`.trim();
  }
  if (userAgent.includes('Firefox/')) {
    const version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
    return `Firefox ${version}`.trim();
  }
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    const version = userAgent.match(/Version\/([\d.]+)/)?.[1] ?? '';
    return `Safari ${version}`.trim();
  }
  return 'Não identificado';
}

function detectOperatingSystem(userAgent: string): string {
  if (userAgent.includes('Windows NT 10.0')) {
    return 'Windows 10/11';
  }
  if (userAgent.includes('Windows')) {
    return 'Windows';
  }
  if (userAgent.includes('Mac OS X')) {
    return 'macOS';
  }
  if (userAgent.includes('Android')) {
    return 'Android';
  }
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'iOS';
  }
  if (userAgent.includes('Linux')) {
    return 'Linux';
  }
  return 'Não identificado';
}

function detectDevice(userAgent: string): string {
  if (userAgent.includes('iPad')) {
    return 'Tablet';
  }
  if (userAgent.includes('Mobi')) {
    return 'Mobile';
  }
  return 'Desktop';
}
