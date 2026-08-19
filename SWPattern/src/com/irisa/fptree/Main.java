package com.irisa.fptree;

import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public class Main {

    public static void main(String[] args) throws Exception {

        if (args.length != 4) {

            System.out.println(
                "Usage:\n" +
                "java -jar FPTreeBuilder.jar <ct-decoded.ct> <idx-file.idx> <selectedItem> <output.json>");

            return;
        }

        Path ct, idx, output;
        int selectedItem;
 
        try {
            ct = Path.of(args[0]);
        } catch (InvalidPathException e) {
            System.err.println("Error: invalid path for the .ct file: \"" + args[0] + "\"");
            System.exit(1);
            return;
        }

        try {
            idx = Path.of(args[1]);
        } catch (InvalidPathException e) {
            System.err.println("Error: invalid path for the idx file: \"" + args[1] + "\"");
            System.exit(1);
            return;
        }
 
        try {
            selectedItem = Integer.parseInt(args[2]);
        } catch (NumberFormatException e) {
            System.err.println("Error: the selected item must be an integer: \"" + args[2] + "\"");
            System.exit(1);
            return;
        }
 
        try {
            output = Path.of(args[3]);
        } catch (InvalidPathException e) {
            System.err.println("Error: invalid path for the output file: \"" + args[3] + "\"");
            System.exit(1);
            return;
        }
 
        try {
            List<CtPattern> patterns = CtReader.readPatternsFromFile(ct);
            Map<Integer, ItemTranslation> translations = IdxReader.readTranslationsFromFile(idx);

            if (patterns.stream().noneMatch(p -> p.contains(selectedItem))) {
                System.err.println(
                    "Warning: the selected item " + selectedItem + " is not present in any pattern.");
            }
 
            FPTreeBuilder builder = new FPTreeBuilder();
            FPNode root = builder.build(patterns, selectedItem);
            long maxSupport = builder.getMaxSupport();
 
            JsonExporter.export(root, translations, output);
 
            System.out.println("JSON generated in " + output);
 
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}