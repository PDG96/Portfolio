/**
 * Runs on every Pages request. Reads the visitor's country from the
 * Cloudflare-provided `cf.country` field and sets a `default_lang` cookie
 * (pt for Lusophone/Latin America, en for everywhere else). The cookie is
 * advisory, the client JS always lets a saved localStorage preference win,
 * so this only matters on a visitor's first arrival.
 */

const PT_COUNTRIES = new Set([
  // Lusophone
  'BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL',
  // Spanish-speaking Latin America (close enough to default to PT over EN
  // since the project copy is Portuguese-first and most LatAm visitors
  // read Portuguese more comfortably than English)
  'AR', 'CL', 'UY', 'PY', 'BO', 'PE', 'EC', 'CO', 'VE',
  'MX', 'CR', 'PA', 'DO', 'CU', 'HN', 'GT', 'NI', 'SV'
]);

export const onRequest = async (context) => {
  const country = (context.request.cf && context.request.cf.country) || '';
  const defaultLang = PT_COUNTRIES.has(country) ? 'pt' : 'en';

  const response = await context.next();

  // Only set the cookie if the visitor doesn't already have one, so a
  // language switch in the UI (which writes to localStorage) stays sticky
  // across pages without us overwriting their intent.
  const cookieHeader = context.request.headers.get('cookie') || '';
  if (!/(?:^|;\s*)default_lang=/.test(cookieHeader)) {
    response.headers.append(
      'Set-Cookie',
      `default_lang=${defaultLang}; Path=/; Max-Age=2592000; SameSite=Lax`
    );
  }

  return response;
};
