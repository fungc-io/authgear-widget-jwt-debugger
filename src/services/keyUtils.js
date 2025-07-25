// Utility functions for key generation and PEM export

// Helper to convert ArrayBuffer to PEM
export function arrayBufferToPem(buffer, type) {
  const b64 = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${type} KEY-----\n${lines}\n-----END ${type} KEY-----`;
}

// Generate RSA key pair
export async function generateRSAKeyPair() {
  return await window.crypto.subtle.generateKey(
    { 
      name: 'RSASSA-PKCS1-v1_5', 
      modulusLength: 2048, 
      publicExponent: new Uint8Array([1, 0, 1]), 
      hash: { name: 'SHA-256' } 
    },
    true,
    ['sign', 'verify']
  );
}

// Generate EC key pair
export async function generateECKeyPair(algorithm) {
  let curve;
  switch (algorithm) {
    case 'ES256':
      curve = 'P-256';
      break;
    case 'ES384':
      curve = 'P-384';
      break;
    case 'ES512':
      curve = 'P-521';
      break;
    default:
      curve = 'P-256'; // Default to P-256
  }

  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: curve
    },
    true,
    ['sign', 'verify']
  );
}

// Export key pair to PEM format
export async function exportKeyPairToPEM(keyPair) {
  const exportedPriv = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  
  return {
    privateKey: arrayBufferToPem(exportedPriv, 'PRIVATE'),
    publicKey: arrayBufferToPem(exportedPub, 'PUBLIC')
  };
}

// Export key pair to JWK format
export async function exportKeyPairToJWK(keyPair) {
  const privateKeyJWK = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const publicKeyJWK = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  
  return {
    privateKey: JSON.stringify(privateKeyJWK, null, 2),
    publicKey: JSON.stringify(publicKeyJWK, null, 2)
  };
}

// Generate RSA key pair and export to PEM
export async function generateAndExportRSAKeyPair() {
  const keyPair = await generateRSAKeyPair();
  const pemKeys = await exportKeyPairToPEM(keyPair);
  return { keyPair, ...pemKeys };
}

// Generate EC key pair and export to PEM
export async function generateAndExportECKeyPair(algorithm) {
  const keyPair = await generateECKeyPair(algorithm);
  const pemKeys = await exportKeyPairToPEM(keyPair);
  return { keyPair, ...pemKeys };
} 