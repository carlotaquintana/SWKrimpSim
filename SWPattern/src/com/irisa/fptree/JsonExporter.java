package com.irisa.fptree;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;

public class JsonExporter {

    public static void export(FPNode root, Path output) throws IOException {

        StringBuilder json = new StringBuilder();

        writeNode(root, json, 0);

        Files.writeString(output, json.toString());
    }

    private static void writeNode(FPNode node,StringBuilder json, int depth) {

        indent(json, depth);
        json.append("{\n");

        indent(json, depth + 1);
        json.append("\"item\": ");

        if (node.isRoot()) {
            json.append("\"ROOT\"");
        } else {
            json.append(node.getItem());
        }

        json.append(",\n");

        indent(json, depth + 1);
        json.append("\"usage\": ")
            .append(node.getUsage())
            .append(",\n");

        indent(json, depth + 1);
        json.append("\"support\": ")
            .append(node.getSupport())
            .append(",\n");

        indent(json, depth + 1);
        json.append("\"children\": [");

        if (!node.getChildren().isEmpty()) {
            json.append("\n");

            Iterator<FPNode> it = node.getChildren().iterator();

            while (it.hasNext()) {

                writeNode(it.next(), json, depth + 2);

                if (it.hasNext()) {
                    json.append(",");
                }

                json.append("\n");
            }

            indent(json, depth + 1);
        }

        json.append("]\n");

        indent(json, depth);
        json.append("}");
    }

    private static void indent(StringBuilder json, int depth) {

        for (int i = 0; i < depth; i++) {
            json.append("    ");
        }
    }

}