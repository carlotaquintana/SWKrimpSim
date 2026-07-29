#!/bin/bash
# args:
# $1 name of the database without the extension (should be .dat)

EXEC_FILENAME=fic

# Here is where the fic exec and its configuration files are
BIN_PATH=/opt/slim/bin

# Our datadir and experiments dir
# Don't forget in the script to put the last slash => they require it
DATA_DIR=/opt/slim/data/
EXP_DIR=/opt/slim/xps/

# We usually use -cls-1d (closed freq itemsets with minsupport = 1 and desdecing order)
OPTIONS_DIR=-cls-1d
PRUNE_STRATEGY=pop
ALGORITHM=slimCS-coverpartial-orderly-alt-length
ESTIMATION_STRATEGY=ngainct

# Original name provided by the user
ORIGINAL_DATABASE_NAME=$1

# Dots are replaced by underscores
DATABASE_NAME="${ORIGINAL_DATABASE_NAME//./_}"

INPUT_FILE="/work/${ORIGINAL_DATABASE_NAME}.dat"

OUTPUT_DIR="/work/results/${ORIGINAL_DATABASE_NAME}-output"
HOURS=1

# Helper to update configuration files
set_conf() {
    local file="$1"
    local key="$2"
    local value="$3"

    if grep -qE "^[[:space:]]*${key}[[:space:]]*=" "$file"; then
        sed -i "s|^[[:space:]]*${key}[[:space:]]*=.*|${key} = ${value}|" "$file"
    else
        sed -i "/^EndConfig/i ${key} = ${value}" "$file"
    fi
}

set_conf "$BIN_PATH/datadir.conf" "dataDir" "${DATA_DIR}datasets/"
set_conf "$BIN_PATH/datadir.conf" "expDir" "${EXP_DIR}"

# we move the database to the dataDir 
if [ -f "$INPUT_FILE" ]; then
	echo Copying ${ORIGINAL_DATABASE_NAME}.dat to "${DATA_DIR}"datasets
	cp ${INPUT_FILE} "${DATA_DIR}"datasets/${DATABASE_NAME}.dat
else
    echo Database ${ORIGINAL_DATABASE_NAME}.dat not found in the current directory
    exit 1
fi

# First we convert the .dat to their format
set_conf "$BIN_PATH/convertdb.conf" "dbName" "${DATABASE_NAME}"
set_conf "$BIN_PATH/convertdb.conf" "dataDir" "${DATA_DIR}"

echo Executing the conversion ...
$BIN_PATH/$EXEC_FILENAME $BIN_PATH/convertdb.conf

if [ -f ""$DATA_DIR"datasets/"$DATABASE_NAME".db" ]
then
    echo Database created successfully
else
    echo Wrong ...
    exit -1
fi

# we analyse the database 
echo Analysing the database ...
set_conf "$BIN_PATH/analysedb.conf" "dbName" "${DATABASE_NAME}"
set_conf "$BIN_PATH/analysedb.conf" "dataDir" "${DATA_DIR//\//\\/}"

$BIN_PATH/$EXEC_FILENAME $BIN_PATH/analysedb.conf
echo Done

# we update the compress.conf file 
set_conf "$BIN_PATH/compress.conf" "dbName" "${DATABASE_NAME}"
set_conf "$BIN_PATH/compress.conf" "dataDir" "${DATA_DIR//\//\\/}"
set_conf "$BIN_PATH/compress.conf" "iscName" "${DATABASE_NAME}${OPTIONS_DIR}"
set_conf "$BIN_PATH/compress.conf" "pruneStrategy" "${PRUNE_STRATEGY}"
set_conf "$BIN_PATH/compress.conf" "estStrategy" "${ESTIMATION_STRATEGY}"
set_conf "$BIN_PATH/compress.conf" "algo" "${ALGORITHM}"
set_conf "$BIN_PATH/compress.conf" "writeReportFile" "yes"
set_conf "$BIN_PATH/compress.conf" "maxTime" "${HOURS}"

echo Executing the SLIM algorithm ...
$BIN_PATH/$EXEC_FILENAME $BIN_PATH/compress.conf
RET=$?

if [ $RET -ne 0 ]; then
    echo "Compression failed."
    exit $RET
fi

echo Retrieving all the information ...
NEW_DIR=$( ls -td -- "$EXP_DIR"compress_ng/* | head -n 1)

mkdir -p "$OUTPUT_DIR"

cp "$NEW_DIR"/*.ct "$OUTPUT_DIR/"
cp "$NEW_DIR"/*.csv "$OUTPUT_DIR/"

cp "$DATA_DIR"datasets/"$DATABASE_NAME".db "$OUTPUT_DIR/${ORIGINAL_DATABASE_NAME}.db"
cp "$DATA_DIR"datasets/"$DATABASE_NAME".db.analysis.txt "$OUTPUT_DIR/${ORIGINAL_DATABASE_NAME}.db.analysis.txt"
cp "$DATA_DIR"datasets/"$DATABASE_NAME".dat "$OUTPUT_DIR/${ORIGINAL_DATABASE_NAME}.dat"

echo Done. All the results are in $OUTPUT_DIR

# we clean the experiments directory
rm -fr "$EXP_DIR"compress_ng/*
