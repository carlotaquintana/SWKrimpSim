package com.irisa.fptree;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public class JsonExporter {

    public static void export(FPNode root, Map<Integer, ItemTranslation> translations, 
                                Map<Integer, Integer> conversion, Path output) throws IOException {

        List<FPNode> nodeList = new ArrayList<>();
        Map<FPNode, String> nodeIds = new IdentityHashMap<>();
        Set<String> linkSet = new LinkedHashSet<>();
        List<String[]> linkList = new ArrayList<>();

        Queue<FPNode> queue = new LinkedList<>();

        for (FPNode startNode : root.getChildren()) {
            if (!nodeIds.containsKey(startNode)) {
                String id = "node_" + nodeList.size();
                nodeIds.put(startNode, id);
                nodeList.add(startNode);
                queue.add(startNode);
            }
        }

        while (!queue.isEmpty()) {
            FPNode curr = queue.poll();
            String currId = nodeIds.get(curr);

            for (FPNode child : curr.getChildren()) {
                if (!nodeIds.containsKey(child)) {
                    String childId = "node_" + nodeList.size();
                    nodeIds.put(child, childId);
                    nodeList.add(child);
                    queue.add(child);
                }
                String childId = nodeIds.get(child);
                String linkKey = currId + "-" + childId;
                if (linkSet.add(linkKey)) {
                    linkList.add(new String[]{currId, childId});
                }
            }
        }

        StringBuilder json = new StringBuilder();
        json.append("{\n");

        // Nodes
        json.append("  \"nodes\": [\n");
        for (int i = 0; i < nodeList.size(); i++) {
            FPNode node = nodeList.get(i);
            String id = nodeIds.get(node);

            json.append("    {\n");
            json.append("      \"id\": \"").append(id).append("\",\n");

            // Items in the compress patterns
            json.append("      \"items\": [");
            List<Integer> items = node.getItems();
            for (int j = 0; j < items.size(); j++) {
                json.append(items.get(j));
                if (j < items.size() - 1) json.append(", ");
            }
            json.append("],\n");

            // Item translation
            json.append("      \"details\": [\n");
            for (int j = 0; j < items.size(); j++) {
                int vreekenItem = items.get(j);
                Integer originalItem = conversion.get(vreekenItem);
                ItemTranslation tr = translations.get(vreekenItem);

                json.append("        {\n");
                json.append("          \"item\": ").append(vreekenItem).append(",\n");
                json.append("          \"originalItem\": ").append(originalItem != null ? originalItem : "null").append(",\n");
                json.append("          \"uri\": ").append(tr != null ? "\"" + escapeJson(tr.getURI()) + "\"" : "null").append(",\n");
                json.append("          \"type\": ").append(tr != null ? "\"" + escapeJson(tr.getType()) + "\"" : "null").append("\n");
                json.append("        }").append(j < items.size() - 1 ? ",\n" : "\n");
            }
            json.append("      ],\n");
            json.append("      \"rawUsage\": ").append(node.getUsage()).append(",\n");
            json.append("      \"usage\": ").append(String.format(Locale.US, "%.6f", node.getNormalizedUsage())).append(",\n");
            json.append("      \"isStart\": ").append(node.isStart()).append(",\n");
            json.append("      \"isEnd\": ").append(node.isEnd()).append("\n");
            json.append("    }").append(i < nodeList.size() - 1 ? ",\n" : "\n");
        }
        json.append("  ],\n");

        // Links
        json.append("  \"links\": [\n");
        for (int i = 0; i < linkList.size(); i++) {
            String[] link = linkList.get(i);
            json.append("    {\n");
            json.append("      \"source\": \"").append(link[0]).append("\",\n");
            json.append("      \"target\": \"").append(link[1]).append("\"\n");
            json.append("    }").append(i < linkList.size() - 1 ? ",\n" : "\n");
        }
        json.append("  ]\n");
        json.append("}\n");

        Files.writeString(output, json.toString());
    }

    private static String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}