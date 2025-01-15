#!/bin/bash
echo "Project Structure:"
tree -I 'node_modules|dist'

echo -e "\nChecking critical files:"
for file in \
  "src/App.jsx" \
  "src/index.js" \
  "src/components/Version1MapView.jsx" \
  "webpack.config.js" \
  ".babelrc" \
  "public/index.html"
do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
  fi
done 