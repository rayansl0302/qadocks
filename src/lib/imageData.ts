export async function imageToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return url;
  }
  if (!url || url.includes('firebasestorage.googleapis.com')) {
    throw new Error('Evidência indisponível.');
  }
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a evidência.'));
    reader.readAsDataURL(blob);
  });
}
