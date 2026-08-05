package com.irisa.fptree;

import java.nio.file.Path;
import java.util.List;

public class Main {

    public static void main(String[] args) throws Exception {

        if (args.length != 3) {

            System.out.println(
                "Usage:\n" +
                "java -jar FPTree.jar <ct-original.ct> <selectedItem> <output.json>");

            return;
        }

        Path ct = Path.of(args[0]);

        int selectedItem = Integer.parseInt(args[1]);

        Path output = Path.of(args[2]);

        List<CtPattern> patterns = CtReader.readPatternsFromFile(ct);

        FPTreeBuilder builder = new FPTreeBuilder();

        FPNode root = builder.build(patterns, selectedItem);

        JsonExporter exporter = new JsonExporter();

        exporter.export(root, output);

        System.out.println("JSON generated in " + output);
    }

}