#!/bin/bash

# Default behavior: empty the logs folder
PRESERVE_LOGS=false

# Parse command line arguments
PLAYWRIGHT_ARGS=()
for arg in "$@"; do
  if [ "$arg" = "-p" ] || [ "$arg" = "--preserve" ]; then
    PRESERVE_LOGS=true
  else
    PLAYWRIGHT_ARGS+=("$arg")
  fi
done

# Create test logs directory if it doesn't exist
mkdir -p test-logs

# Empty the test-logs folder unless preserve flag is set
if [ "$PRESERVE_LOGS" = false ]; then
  echo "Emptying test-logs folder..."
  rm -f test-logs/*
fi

# Generate timestamp for log file
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="test-logs/playwright-test-$TIMESTAMP.log"

# Run the tests with tee to show output in terminal and write to log file
npx playwright test "${PLAYWRIGHT_ARGS[@]}" | tee "$LOG_FILE"

# Print status message
echo "Test run completed. Log saved to $LOG_FILE"
