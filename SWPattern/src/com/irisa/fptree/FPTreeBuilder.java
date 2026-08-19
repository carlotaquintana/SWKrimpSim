package com.irisa.fptree;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class FPTreeBuilder {

    private long maxSupport;

    public long getMaxSupport() {
        return maxSupport;
    }

    public FPNode build(List<CtPattern> patterns, int selectedItem) {

        FPNode root = new FPNode(-1, null);
        maxSupport = 0;

        List<CtPattern> filtered = patterns.stream()
                .filter(p -> p.contains(selectedItem))
                .sorted(Comparator.comparingInt(CtPattern::getUsage).reversed())
                .collect(Collectors.toList());

        for (CtPattern pattern : filtered) {

            List<Integer> items = pattern.getItems();

            if (items.size() == 1){
                maxSupport = Math.max(maxSupport, pattern.getSupport());

                if (pattern.getUsage() <= 0) continue;
            }

            insert(root, items, pattern.getUsage(), pattern.getSupport());
        }

        return root;
    }

    private void insert(FPNode root, List<Integer> items, long usage, long support) {

        FPNode current = root;

        for (Integer item : items) {
            current = current.getOrCreateChild(item);
            current.addCounts(usage, support);
        }
    }

    
}