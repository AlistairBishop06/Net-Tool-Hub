const hashInput = document.getElementById("hash-input");
const validation = document.querySelector("[data-validation]");

const setResult = (key, value) => {
  const el = document.querySelector(`[data-result="${key}"]`);
  if (el) el.textContent = value || "—";
};

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const shaDigest = async (algorithm, text) => {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return toHex(hashBuffer);
};

const md5 = (text) => {
  const msg = new TextEncoder().encode(text);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const rotateLeft = (x, n) => (x << n) | (x >>> (32 - n));
  const toUint32 = (x) => x >>> 0;

  const padded = (() => {
    const len = msg.length;
    const bitLen = len * 8;
    const paddingLen = ((56 - (len + 1) % 64) + 64) % 64;
    const totalLen = len + 1 + paddingLen + 8;
    const buffer = new Uint8Array(totalLen);
    buffer.set(msg);
    buffer[len] = 0x80;
    const view = new DataView(buffer.buffer);
    view.setUint32(totalLen - 8, bitLen >>> 0, true);
    view.setUint32(totalLen - 4, Math.floor(bitLen / 0x100000000), true);
    return buffer;
  })();

  const chunk = new Uint32Array(16);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j += 1) {
      chunk[j] =
        padded[i + j * 4] |
        (padded[i + j * 4 + 1] << 8) |
        (padded[i + j * 4 + 2] << 16) |
        (padded[i + j * 4 + 3] << 24);
    }

    let aa = a;
    let bb = b;
    let cc = c;
    let dd = d;

    const round = (f, g, s, t) => {
      const temp = dd;
      dd = cc;
      cc = bb;
      const sum = toUint32(aa + f + t + chunk[g]);
      bb = toUint32(bb + rotateLeft(sum, s));
      aa = temp;
    };

    const ff = (x, y, z) => (x & y) | (~x & z);
    const gg = (x, y, z) => (x & z) | (y & ~z);
    const hh = (x, y, z) => x ^ y ^ z;
    const ii = (x, y, z) => y ^ (x | ~z);

    round(ff(bb, cc, dd), 0, 7, 0xd76aa478);
    round(ff(bb, cc, dd), 1, 12, 0xe8c7b756);
    round(ff(bb, cc, dd), 2, 17, 0x242070db);
    round(ff(bb, cc, dd), 3, 22, 0xc1bdceee);
    round(ff(bb, cc, dd), 4, 7, 0xf57c0faf);
    round(ff(bb, cc, dd), 5, 12, 0x4787c62a);
    round(ff(bb, cc, dd), 6, 17, 0xa8304613);
    round(ff(bb, cc, dd), 7, 22, 0xfd469501);
    round(ff(bb, cc, dd), 8, 7, 0x698098d8);
    round(ff(bb, cc, dd), 9, 12, 0x8b44f7af);
    round(ff(bb, cc, dd), 10, 17, 0xffff5bb1);
    round(ff(bb, cc, dd), 11, 22, 0x895cd7be);
    round(ff(bb, cc, dd), 12, 7, 0x6b901122);
    round(ff(bb, cc, dd), 13, 12, 0xfd987193);
    round(ff(bb, cc, dd), 14, 17, 0xa679438e);
    round(ff(bb, cc, dd), 15, 22, 0x49b40821);

    round(gg(bb, cc, dd), 1, 5, 0xf61e2562);
    round(gg(bb, cc, dd), 6, 9, 0xc040b340);
    round(gg(bb, cc, dd), 11, 14, 0x265e5a51);
    round(gg(bb, cc, dd), 0, 20, 0xe9b6c7aa);
    round(gg(bb, cc, dd), 5, 5, 0xd62f105d);
    round(gg(bb, cc, dd), 10, 9, 0x02441453);
    round(gg(bb, cc, dd), 15, 14, 0xd8a1e681);
    round(gg(bb, cc, dd), 4, 20, 0xe7d3fbc8);
    round(gg(bb, cc, dd), 9, 5, 0x21e1cde6);
    round(gg(bb, cc, dd), 14, 9, 0xc33707d6);
    round(gg(bb, cc, dd), 3, 14, 0xf4d50d87);
    round(gg(bb, cc, dd), 8, 20, 0x455a14ed);
    round(gg(bb, cc, dd), 13, 5, 0xa9e3e905);
    round(gg(bb, cc, dd), 2, 9, 0xfcefa3f8);
    round(gg(bb, cc, dd), 7, 14, 0x676f02d9);
    round(gg(bb, cc, dd), 12, 20, 0x8d2a4c8a);

    round(hh(bb, cc, dd), 5, 4, 0xfffa3942);
    round(hh(bb, cc, dd), 8, 11, 0x8771f681);
    round(hh(bb, cc, dd), 11, 16, 0x6d9d6122);
    round(hh(bb, cc, dd), 14, 23, 0xfde5380c);
    round(hh(bb, cc, dd), 1, 4, 0xa4beea44);
    round(hh(bb, cc, dd), 4, 11, 0x4bdecfa9);
    round(hh(bb, cc, dd), 7, 16, 0xf6bb4b60);
    round(hh(bb, cc, dd), 10, 23, 0xbebfbc70);
    round(hh(bb, cc, dd), 13, 4, 0x289b7ec6);
    round(hh(bb, cc, dd), 0, 11, 0xeaa127fa);
    round(hh(bb, cc, dd), 3, 16, 0xd4ef3085);
    round(hh(bb, cc, dd), 6, 23, 0x04881d05);
    round(hh(bb, cc, dd), 9, 4, 0xd9d4d039);
    round(hh(bb, cc, dd), 12, 11, 0xe6db99e5);
    round(hh(bb, cc, dd), 15, 16, 0x1fa27cf8);
    round(hh(bb, cc, dd), 2, 23, 0xc4ac5665);

    round(ii(bb, cc, dd), 0, 6, 0xf4292244);
    round(ii(bb, cc, dd), 7, 10, 0x432aff97);
    round(ii(bb, cc, dd), 14, 15, 0xab9423a7);
    round(ii(bb, cc, dd), 5, 21, 0xfc93a039);
    round(ii(bb, cc, dd), 12, 6, 0x655b59c3);
    round(ii(bb, cc, dd), 3, 10, 0x8f0ccc92);
    round(ii(bb, cc, dd), 10, 15, 0xffeff47d);
    round(ii(bb, cc, dd), 1, 21, 0x85845dd1);
    round(ii(bb, cc, dd), 8, 6, 0x6fa87e4f);
    round(ii(bb, cc, dd), 15, 10, 0xfe2ce6e0);
    round(ii(bb, cc, dd), 6, 15, 0xa3014314);
    round(ii(bb, cc, dd), 13, 21, 0x4e0811a1);
    round(ii(bb, cc, dd), 4, 6, 0xf7537e82);
    round(ii(bb, cc, dd), 11, 10, 0xbd3af235);
    round(ii(bb, cc, dd), 2, 15, 0x2ad7d2bb);
    round(ii(bb, cc, dd), 9, 21, 0xeb86d391);

    a = toUint32(a + aa);
    b = toUint32(b + bb);
    c = toUint32(c + cc);
    d = toUint32(d + dd);
  }

  const output = new DataView(new ArrayBuffer(16));
  output.setUint32(0, a, true);
  output.setUint32(4, b, true);
  output.setUint32(8, c, true);
  output.setUint32(12, d, true);
  return toHex(output.buffer);
};

const updateHashes = async () => {
  const text = hashInput.value;
  if (!text.trim()) {
    validation.textContent = "";
    setResult("md5", "—");
    setResult("sha1", "—");
    setResult("sha256", "—");
    return;
  }

  validation.textContent = "";
  const [sha1, sha256] = await Promise.all([
    shaDigest("SHA-1", text),
    shaDigest("SHA-256", text),
  ]);
  setResult("md5", md5(text));
  setResult("sha1", sha1);
  setResult("sha256", sha256);

  const params = new URLSearchParams({ text });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

hashInput.addEventListener("input", () => {
  updateHashes().catch(() => {
    validation.textContent = "Unable to generate hash.";
  });
});

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  if (text) {
    hashInput.value = text;
    updateHashes();
  }
};

initFromUrl();
