const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\sampa\\OneDrive\\Desktop\\KHOJGHAR\\frontend\\src\\pages';

try {
  // Delete old About.jsx
  const aboutOldPath = path.join(baseDir, 'About.jsx');
  if (fs.existsSync(aboutOldPath)) {
    fs.unlinkSync(aboutOldPath);
    console.log('✓ Deleted About.jsx');
  } else {
    console.log('! About.jsx not found');
  }

  // Rename About_new.jsx to About.jsx
  const aboutNewPath = path.join(baseDir, 'About_new.jsx');
  if (fs.existsSync(aboutNewPath)) {
    fs.renameSync(aboutNewPath, aboutOldPath);
    console.log('✓ Renamed About_new.jsx to About.jsx');
  } else {
    console.log('! About_new.jsx not found');
  }

  // Delete old ListProperty.jsx
  const listPropOldPath = path.join(baseDir, 'ListProperty.jsx');
  if (fs.existsSync(listPropOldPath)) {
    fs.unlinkSync(listPropOldPath);
    console.log('✓ Deleted ListProperty.jsx');
  } else {
    console.log('! ListProperty.jsx not found');
  }

  // Rename ListProperty_new.jsx to ListProperty.jsx
  const listPropNewPath = path.join(baseDir, 'ListProperty_new.jsx');
  if (fs.existsSync(listPropNewPath)) {
    fs.renameSync(listPropNewPath, listPropOldPath);
    console.log('✓ Renamed ListProperty_new.jsx to ListProperty.jsx');
  } else {
    console.log('! ListProperty_new.jsx not found');
  }

  console.log('\n✓ All file operations completed successfully!');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
