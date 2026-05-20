const KEY_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function randomKeyBody(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let key = "";
  for (let i = 0; i < length; i++) {
    key += KEY_CHARS[bytes[i] % KEY_CHARS.length];
  }
  return key;
}

/** Short human-readable key (~8–10 chars), alphanumeric with optional hyphen. */
export function generateTeacherKey(): string {
  const body = randomKeyBody(8);
  const withHyphen = crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0;
  if (!withHyphen) {
    return body;
  }
  const splitAt = 4;
  return `${body.slice(0, splitAt)}-${body.slice(splitAt)}`;
}
