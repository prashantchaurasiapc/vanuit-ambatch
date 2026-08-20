try {
  const sharp = await import('sharp');
  console.log('sharp available');
} catch (e) {
  console.log('sharp not installed');
}

try {
  const canvas = await import('canvas');
  console.log('canvas available');
} catch (e) {
  console.log('canvas not installed');
}
