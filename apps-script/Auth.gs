// The only Google account allowed to read/write through this Web App.
// This repo is private and single-owner by design, so it's safe to
// hardcode here rather than store in Script Properties — update it to
// the Google account that owns your budget spreadsheet.
var OWNER_EMAIL = 'crdelapena04@gmail.com'

/**
 * Verifies a Google ID token (issued client-side by Google Identity
 * Services) proves the request came from OWNER_EMAIL. Apps Script has no
 * built-in JWT verification, so this checks the token against Google's own
 * tokeninfo endpoint rather than validating the signature by hand.
 */
function verifyIdToken(idToken) {
  if (!idToken) throw new Error('Missing idToken.')

  var oauthClientId = PropertiesService.getScriptProperties().getProperty('OAUTH_CLIENT_ID')
  if (!oauthClientId) throw new Error('Server is missing the OAUTH_CLIENT_ID script property.')

  // Cache verified tokens so each request doesn't cost a UrlFetch call
  // (daily quota is ~20k on free accounts).
  var cache = CacheService.getScriptCache()
  var cacheKey = 'tok_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idToken),
  )
  if (cache.get(cacheKey) === OWNER_EMAIL) return OWNER_EMAIL

  var response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true },
  )
  if (response.getResponseCode() !== 200) {
    throw new Error('Invalid idToken.')
  }

  var info = JSON.parse(response.getContentText())
  if (info.aud !== oauthClientId) {
    throw new Error('Token audience mismatch.')
  }
  if (info.email !== OWNER_EMAIL || info.email_verified !== 'true') {
    throw new Error('Unauthorized email.')
  }

  // Tokens live ~1 hour; cache for less than that and never past expiry.
  var ttl = Math.min(3000, Math.max(0, Number(info.exp) - Math.floor(Date.now() / 1000) - 60))
  if (ttl > 0) cache.put(cacheKey, info.email, ttl)

  return info.email
}
