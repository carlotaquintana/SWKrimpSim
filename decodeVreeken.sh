#!/bin/bash

set -e

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <dataset-name>"
    exit 1
fi

DATASET="$1"
RESULTS_DIR="./results/${DATASET}-output"

CT_FILE="$RESULTS_DIR/ct-latest.ct"
ANALYSIS_FILE="$RESULTS_DIR/${DATASET}.db.analysis.txt"
OUTPUT_FILE="$RESULTS_DIR/ct-original.dat"

JAR="./DecodeVreeken.jar"

if [[ ! -d "$RESULTS_DIR" ]]; then
    echo "Results directory not found:"
    echo "  $RESULTS_DIR"
    exit 1
fi

if [[ ! -f "$CT_FILE" ]]; then
    echo "Code table not found:"
    echo "  $CT_FILE"
    exit 1
fi

if [[ ! -f "$ANALYSIS_FILE" ]]; then
    echo "Analysis file not found:"
    echo "  $ANALYSIS_FILE"
    exit 1
fi

if [[ ! -f "$JAR" ]]; then
    echo "Decoder jar not found:"
    echo "  $JAR"
    exit 1
fi

echo "Decoding code table..."
java -jar "$JAR" "$DATASET"
echo "Exit code: $?"

echo
echo "Done."
echo "Decoded file:"
echo "  $OUTPUT_FILE"