#!/bin/bash

# Default behavior: empty the logs folder
PRESERVE_LOGS=false
GENERATE_ALLURE=true

# Parse command line arguments
PLAYWRIGHT_ARGS=()
for arg in "$@"; do
  if [ "$arg" = "-p" ] || [ "$arg" = "--preserve" ]; then
    PRESERVE_LOGS=true
  elif [ "$arg" = "--no-allure" ]; then
    GENERATE_ALLURE=false
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

# Create or clean allure-results directory
if [ "$GENERATE_ALLURE" = true ]; then
  echo "Preparing Allure results directory..."
  mkdir -p allure-results
fi

# Generate timestamp for log file
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="test-logs/playwright-test-$TIMESTAMP.log"

# Run the tests with tee to show output in terminal and write to log file
npx playwright test "${PLAYWRIGHT_ARGS[@]}" | tee "$LOG_FILE"

# Store the exit code from Playwright
TEST_EXIT_CODE=${PIPESTATUS[0]}

# Generate and serve Allure report if requested
if [ "$GENERATE_ALLURE" = true ]; then
  echo "Generating Allure report..."
  npx allure generate allure-results --clean -o allure-report
  
  # Ask user if they want to serve the report
  echo ""
  read -p "Do you want to open the Allure report now? (y/n): " SERVE_ALLURE
  if [[ $SERVE_ALLURE =~ ^[Yy]$ ]]; then
    npx allure open allure-report
  else
    echo "Allure report generated at: $(pwd)/allure-report"
    echo "To view it later, run: npx allure open allure-report"
  fi
fi

# Print status message
echo "Test run completed. Log saved to $LOG_FILE"

# Exit with the same exit code as the test run
exit $TEST_EXIT_CODE
