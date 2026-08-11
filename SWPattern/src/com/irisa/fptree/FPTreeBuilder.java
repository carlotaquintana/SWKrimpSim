package com.irisa.fptree;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class FPTreeBuilder {

    public FPNode build(List<CtPattern> patterns, int selectedItem) {

        FPNode root = new FPNode(-1, null);

        List<CtPattern> filtered = patterns.stream()
                .filter(p -> p.contains(selectedItem))
                .sorted(Comparator.comparingInt(CtPattern::getUsage).reversed())
                .collect(Collectors.toList());

        for (CtPattern pattern : filtered) {

            List<Integer> items = pattern.getItems();
            int pos = items.indexOf(selectedItem);

            if (pos == -1) continue;

            List<Integer> suffix = new ArrayList<>(items.subList(pos, items.size()));
            insert(root, suffix, pattern.getUsage(), pattern.getSupport());
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