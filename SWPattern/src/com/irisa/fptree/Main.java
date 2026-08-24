package com.irisa.fptree;

import com.irisa.decode.AnalysisReader;
import com.irisa.decode.CtDecoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

public class Main {

    public static void main(String[] args) throws Exception {

        if (args.length != 2) {
            System.err.println("Usage: java -jar FPTreeBuilder.jar <dataset> <selectedItem>");
            System.exit(1);
        }

        String dataset = args[0];
        Path resultsDir = Paths.get("results", dataset + "-output");

        if (!Files.isDirectory(resultsDir)) {
            System.err.println("Results directory not found:");
            System.err.println(resultsDir);
            System.exit(1);
        }

        
        int selectedItem;

        Path ct = resultsDir.resolve("ct-latest.ct");
        Path analysis = resultsDir.resolve(dataset + ".db.analysis.txt");
        Path idx = resultsDir.resolve("conversionIndex.idx");
        Path ct_decoded = resultsDir.resolve("ct-decoded.ct");
 
        if (!Files.exists(ct)) {
            System.err.println("Error: missing file: " + ct);
            System.exit(1);
            return;
        }

        if (!Files.exists(analysis)) {
            System.err.println("Missing file: " + analysis);
            System.exit(1);
        }

        if (!Files.exists(idx)) {
            System.err.println("Error: missing file: " + idx);
            System.exit(1);
            return;
        }
 
        try {
            selectedItem = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            System.err.println("Error: the selected item must be an integer: \"" + args[1] + "\"");
            System.exit(1);
            return;
        }
 
        try {

            Map<Integer,Integer> conversion = AnalysisReader.readConversionTable(analysis);
            CtDecoder.decode(ct, ct_decoded, conversion);

            System.out.println("Decoded code table written to:");
            System.out.println(ct_decoded); 

            Path output = resultsDir.resolve("fptree-" + selectedItem + ".json");

            List<CtPattern> patterns = CtReader.readPatternsFromFile(ct);
            Map<Integer, ItemTranslation> translations = IdxReader.readTranslationsFromFile(idx);

            if (patterns.stream().noneMatch(p -> p.contains(selectedItem))) {
                System.err.println(
                    "Warning: the selected item " + selectedItem + " is not present in any pattern.");
            }
 
            FPTreeBuilder builder = new FPTreeBuilder();
            FPNode root = builder.build(patterns, selectedItem);
 
            JsonExporter.export(root, translations, conversion, output);
 
            System.out.println("JSON generated in " + output);
 
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}