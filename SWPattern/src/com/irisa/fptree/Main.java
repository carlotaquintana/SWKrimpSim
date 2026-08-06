package com.irisa.fptree;

import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.List;

public class Main {

    public static void main(String[] args) throws Exception {

        if (args.length != 3) {

            System.out.println(
                "Usage:\n" +
                "java -jar FPTree.jar <ct-decoded.ct> <selectedItem> <output.json>");

            return;
        }

        Path ct;
        int selectedItem;
        Path output;
 
        try {
            ct = Path.of(args[0]);
        } catch (InvalidPathException e) {
            System.err.println("Error: invalid path for the input file: \"" + args[0] + "\"");
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
            output = Path.of(args[2]);
        } catch (InvalidPathException e) {
            System.err.println("Error: invalid path for the output file: \"" + args[2] + "\"");
            System.exit(1);
            return;
        }
 
        try {
            List<CtPattern> patterns = CtReader.readPatternsFromFile(ct);
 
            if (patterns.stream().noneMatch(p -> p.contains(selectedItem))) {
                System.err.println(
                    "Warning: the selected item " + selectedItem + " is not present in any pattern.");
            }
 
            FPTreeBuilder builder = new FPTreeBuilder();
            FPNode root = builder.build(patterns, selectedItem);
 
            JsonExporter.export(root, output);
 
            System.out.println("JSON generated in " + output);
 
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}