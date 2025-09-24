#!/bin/bash

# Fix @/ imports in all TypeScript/TSX files
find client/src -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Processing $file"
  
  # Fix @/components imports
  sed -i '' 's|@/components/ui/|../ui/|g' "$file"
  sed -i '' 's|@/components/|../|g' "$file"
  
  # Fix @/lib imports  
  sed -i '' 's|@/lib/|../../lib/|g' "$file"
  
  # Fix @/hooks imports
  sed -i '' 's|@/hooks/|../../hooks/|g' "$file"
done

echo "Done fixing imports"
