package com.irisa.fptree;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;

public class JsonExporter {

    public static void export(FPNode root, Map<Integer, ItemTranslation> translations, Path output) throws IOException {

        StringBuilder json = new StringBuilder();

        writeNode(root, translations, json, 0);

        Files.writeString(output, json.toString());
    }

    private static void writeNode(FPNode node, Map<Integer, ItemTranslation> translations, StringBuilder json, int depth) {

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

        if (!node.isRoot()) {

            ItemTranslation translation = translations.get(node.getItem());

            indent(json, depth + 1);
            json.append("\"uri\": ")
                .append(translation != null ? "\"" + translation.getURI() + "\"" : "null")
                .append(",\n");

            indent(json, depth + 1);
            json.append("\"type\": ")
                .append(translation != null ? "\"" + translation.getType() + "\"" : "null")
                .append(",\n");
        }

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

                writeNode(it.next(), translations, json, depth + 2);

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