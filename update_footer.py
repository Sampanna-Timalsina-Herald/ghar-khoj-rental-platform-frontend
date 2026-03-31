#!/usr/bin/env python3
import sys

file_path = r"c:\Users\sampa\OneDrive\Desktop\KHOJGHAR\frontend\src\pages\ListProperty.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The old footer content
old_footer = """      {/* Footer (You can reuse the footer from Home.js) */}
      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">
        <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
      </footer>"""

# The new footer content
new_footer = """      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-6 text-center">
        <Link to="/">
          <img src={gharkhojLogo} alt="Gharkhoj" className="h-12 w-auto object-contain mx-auto mb-3" />
        </Link>
        <p>© {new Date().getFullYear()} Gharkhoj. All Rights Reserved. Built for Kathmandu Valley.</p>
      </footer>"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Footer updated successfully!")
else:
    print("✗ Old footer pattern not found in the file")
    sys.exit(1)
