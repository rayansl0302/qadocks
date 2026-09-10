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
    return 'Edge';
  }
  if (userAgent.includes('Chrome/')) {
    return 'Chrome';
  }
  if (userAgent.includes('Firefox/')) {
    return 'Firefox';
  }
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    return 'Safari';
  }
  return '';
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
    return 'Celular';
  }
  return 'Desktop';
}
