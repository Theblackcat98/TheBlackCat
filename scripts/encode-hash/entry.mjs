// Build: npm i @noble/hashes@1.8.0 crypto-api-v1@1.0.0 esbuild, then
//   npx esbuild scripts/encode-hash/entry.mjs --bundle --minify --format=iife --legal-comments=eof --outfile=static/encode-hash/hashes.js
// Bundled into static/encode-hash/hashes.js (see static/encode-hash/README.md).
// @noble/hashes covers SHA-1/2/3, Keccak, SHAKE, cSHAKE, KMAC, MD5 and HMAC;
// crypto-api-v1 covers MD2, MD4 and RIPEMD-128/160/256/320.
import { md5, sha1 } from "@noble/hashes/legacy";
import { sha224, sha256, sha384, sha512, sha512_224, sha512_256 } from "@noble/hashes/sha2";
import { sha3_224, sha3_256, sha3_384, sha3_512, keccak_224, keccak_256, keccak_384, keccak_512, shake128, shake256 } from "@noble/hashes/sha3";
import { cshake128, cshake256, kmac128, kmac256 } from "@noble/hashes/sha3-addons";
import { hmac } from "@noble/hashes/hmac";
import CryptoApi from "crypto-api-v1/src/crypto-api.mjs";

const noble = { md5, sha1, sha224, sha256, sha384, sha512, sha512_224, sha512_256,
  sha3_224, sha3_256, sha3_384, sha3_512, keccak_224, keccak_256, keccak_384, keccak_512 };

function bytesToBinStr(u8) {
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return s;
}
function binStrToBytes(s) {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}
function capi(name, data, key) {
  let h = CryptoApi.getHasher(name);
  if (key) h = CryptoApi.getHmac(bytesToBinStr(key), h);
  h.update(bytesToBinStr(data));
  return binStrToBytes(h.finalize());
}

const CRC16 = (() => { const t = new Uint16Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xa001 : c >>> 1; t[n] = c; } return t; })();
const CRC32 = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc16(d) { let c = 0; for (let i = 0; i < d.length; i++) c = (c >>> 8) ^ CRC16[(c ^ d[i]) & 0xff]; return new Uint8Array([c >>> 8, c & 0xff]); }
function crc32(d) { let c = 0xffffffff; for (let i = 0; i < d.length; i++) c = (c >>> 8) ^ CRC32[(c ^ d[i]) & 0xff]; c = (c ^ 0xffffffff) >>> 0; return new Uint8Array([c >>> 24, (c >>> 16) & 0xff, (c >>> 8) & 0xff, c & 0xff]); }

const enc = new TextEncoder();

/**
 * hash(alg, data, opts) -> Uint8Array
 * opts: hmacKey (Uint8Array) for HMAC-capable algorithms; bits for SHAKE/cSHAKE/KMAC;
 *       functionName and customization (strings) for cSHAKE; kmacKey (Uint8Array) and customization for KMAC.
 */
function hash(alg, data, opts = {}) {
  const key = opts.hmacKey && opts.hmacKey.length ? opts.hmacKey : null;
  if (noble[alg]) return key ? hmac(noble[alg], key, data) : noble[alg](data);
  switch (alg) {
    case "double_sha256": return sha256(sha256(data));
    case "md2": case "md4": case "ripemd128": case "ripemd160": case "ripemd256": case "ripemd320":
      return capi(alg, data, key);
    case "crc16": return crc16(data);
    case "crc32": return crc32(data);
    case "shake128": return shake128(data, { dkLen: Math.ceil((opts.bits || 256) / 8) });
    case "shake256": return shake256(data, { dkLen: Math.ceil((opts.bits || 512) / 8) });
    case "cshake128": case "cshake256": {
      const f = alg === "cshake128" ? cshake128 : cshake256;
      return f(data, { dkLen: Math.ceil((opts.bits || (alg === "cshake128" ? 256 : 512)) / 8),
        NISTfn: enc.encode(opts.functionName || ""), personalization: enc.encode(opts.customization || "") });
    }
    case "kmac128": case "kmac256": {
      const f = alg === "kmac128" ? kmac128 : kmac256;
      return f(opts.kmacKey || new Uint8Array(0), data, { dkLen: Math.ceil((opts.bits || (alg === "kmac128" ? 256 : 512)) / 8),
        personalization: enc.encode(opts.customization || "") });
    }
  }
  throw new Error("Unknown algorithm: " + alg);
}

window.EncodeHash = { hash };
