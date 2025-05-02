#!/bin/bash

# Script to update or create .file-structure.txt with all JavaScript and TypeScript files in the project
# This helps maintain an up-to-date view of the project structure

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
OUTPUT_FILE="$SCRIPT_DIR/.file-structure.txt"

echo "Updating file structure in $OUTPUT_FILE..."

# Find all JavaScript and TypeScript files, sort them, and write to the output file
find "$SCRIPT_DIR" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" \) | sort > "$OUTPUT_FILE"

# Count the number of files found
COUNT=$(wc -l < "$OUTPUT_FILE")
echo "Found $COUNT JavaScript/TypeScript files in the project."
echo "File structure updated successfully at $(date)."