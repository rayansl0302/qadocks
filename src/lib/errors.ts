const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente em instantes.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
};

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code);
    if (FIREBASE_MESSAGES[code]) {
      return FIREBASE_MESSAGES[code];
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}
