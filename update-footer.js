const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ListProperty.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Find and replace the footer section
const oldFooter = `      {/* Footer (You can reuse the footer from Home.js) */}
      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">
        <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
      </footer>`;

const newFooter = `      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">
        <Link to="/">
          <img src={gharkhojLogo} alt="Gharkhoj" className="h-12 w-auto object-contain mx-auto mb-3" />
        </Link>
        <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
      </footer>`;

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Footer updated successfully!');
} else {
  console.log('Old footer pattern not found. Trying alternative approach...');
  // Try line by line replacement
  const lines = content.split('\n');
  let updated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Footer (You can reuse the footer from Home.js)')) {
      lines[i] = '      {/* Footer */}';
      // Update the footer content
      if (i + 3 < lines.length && lines[i + 2].includes('<p>©')) {
        lines[i + 1] = '      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">';
        lines.splice(i + 2, 0, '        <Link to="/">');
        lines.splice(i + 3, 0, '          <img src={gharkhojLogo} alt="Gharkhoj" className="h-12 w-auto object-contain mx-auto mb-3" />');
        lines.splice(i + 4, 0, '        </Link>');
        updated = true;
        break;
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log('Footer updated successfully with line-by-line approach!');
  } else {
    console.log('Could not find the footer to update.');
    process.exit(1);
  }
}
