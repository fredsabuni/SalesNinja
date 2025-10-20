/**
 * Test phone number normalization
 */

function normalizePhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('0')) {
    // 0714276444 -> 714276444 -> +255714276444
    cleaned = '255' + cleaned.substring(1);
  } else if (cleaned.startsWith('255')) {
    // 255714276444 -> +255714276444 (already correct)
    cleaned = cleaned;
  } else if (cleaned.length === 9) {
    // 714276444 -> +255714276444
    cleaned = '255' + cleaned;
  } else {
    // Default: assume it needs 255 prefix
    cleaned = '255' + cleaned;
  }
  
  return '+' + cleaned;
}

// Test cases
const testCases = [
  '0714276444',
  '714276444', 
  '+255714276444',
  '255714276444',
  '0754123456',
  '754123456'
];

console.log('Testing phone number normalization:');
testCases.forEach(phone => {
  const normalized = normalizePhoneNumber(phone);
  console.log(`${phone} -> ${normalized}`);
});

// Expected output:
// 0714276444 -> +255714276444
// 714276444 -> +255714276444
// +255714276444 -> +255714276444
// 255714276444 -> +255714276444
// 0754123456 -> +255754123456
// 754123456 -> +255754123456