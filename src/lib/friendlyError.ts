import { Language } from '../types';

/**
 * Converts raw browser/fetch/server errors (such as Safari's "Load failed" or
 * Chrome's "Failed to fetch") into calm, actionable human messages.
 * Guarantees raw technical strings never appear in the UI.
 */
export function toHumanErrorMessage(error: unknown, lang: Language): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const lower = raw.toLowerCase();

  if (
    lower.includes('load failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('aborted') ||
    lower.includes('deadline') ||
    lower.includes('timeout') ||
    lower.includes('504') ||
    lower.includes('502') ||
    lower.includes('503')
  ) {
    return lang === 'hi'
      ? 'सर्वर व्यस्त है या कनेक्शन धीमा है। कृपया नीचे दिए गए बटन से पुनः प्रयास करें।'
      : 'Our assistant is taking longer than usual to respond. Please tap Retry in a moment.';
  }

  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate')) {
    return lang === 'hi'
      ? 'अभी बहुत अधिक अनुरोध आ रहे हैं। कृपया कुछ सेकंड बाद पुनः प्रयास करें।'
      : 'The service is experiencing high traffic right now. Please wait a few seconds and retry.';
  }

  if (
    lower.includes('json') ||
    lower.includes('syntaxerror') ||
    lower.includes('unexpected token')
  ) {
    return lang === 'hi'
      ? 'प्रतिक्रिया को पढ़ने में समस्या आई। कृपया पुनः प्रयास करें।'
      : 'We received an incomplete response from the server. Please tap Retry.';
  }

  // If the server already sent a clean human sentence (without code/JSON braces), allow it
  if (
    raw.length > 6 &&
    raw.length < 180 &&
    !raw.includes('{') &&
    !raw.includes('TypeError') &&
    !lower.includes('load failed')
  ) {
    return raw;
  }

  return lang === 'hi'
    ? 'इस समय यह सुविधा अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।'
    : 'Something went wrong on our end. Please tap Retry to try again.';
}
