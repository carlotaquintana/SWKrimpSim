package com.irisa.fptree;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

public class FPNode {
    private final int item;
    private long usage;
    private long support;
    private final int depth;
    private final FPNode parent;
    private final Map<Integer, FPNode> children = new LinkedHashMap<>();


    public FPNode(int item, FPNode parent) {
        this.item = item;
        this.parent = parent;
        this.depth = (parent == null) ? 0 : parent.depth + 1;
    }

    public int getItem() {
        return item;
    }

    public long getUsage() {
        return usage;
    }

    public long getSupport() {
        return support;
    }

    public int getDepth() {
        return depth;
    }

    public FPNode getParent() {
        return parent;
    }

    public Collection<FPNode> getChildren() {
        return children.values();
    }

    public boolean hasChildren() {
        return !children.isEmpty();
    }

    public boolean isRoot() {
        return parent == null;
    }

    public FPNode getChild(int item) {
        return children.get(item);
    }

    public FPNode getOrCreateChild(int item) {
        return children.computeIfAbsent(item, k -> new FPNode(k, this));
    }

    public void addCounts(long usage, long support) {
        this.usage += usage;
        this.support += support;
    }
}