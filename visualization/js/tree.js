const NODE_SEP_Y_MIN = 70;
const NODE_SEP_GAP = 30; // extra breathing room added on top of the tallest cluster
const LEVEL_SEP_X = 60;

const CHAR_WIDTH = 8.2;
const CLUSTER_PAD_X = 22;
const CLUSTER_HEIGHT = 44;
const CLUSTER_MIN_WIDTH = 60;

const LABEL_LINE_HEIGHT = 14;
const LABEL_USAGE_GAP = 18;
const CLUSTER_VPAD = 8; // padding 

let currentTreeRoot = null;

/**
 * Compresses a linear path into a single node
 * A node is compressed while it has exactly one child
 */
function compress(node) {
    const items = [node.item];
    const uris = [node.uri];
    const types = [node.type];

    let current = node;

    while (current.children && current.children.length === 1) {
        current = current.children[0];

        items.push(current.item);
        uris.push(current.uri);
        types.push(current.type);
    }

    const hasBranch = current.children && current.children.length > 1;

    const children = hasBranch ? current.children.map(compress) : [];

    return {
        items,
        uris,
        types,
        usage: current.usage,
        support: current.support,
        children
    };
}


/**
 * Returns the label that should be displayed inside a cluster,
 * one entry per line, depending on the selected view mode
 */
function getClusterLabelLines(data, viewMode) {
    switch (viewMode) {
        case "type":
            return data.types.filter(value => value != null);

        case "uri":
            return data.uris.map(value => value ?? "?");

        case "item":
        default:
            return [data.items.join(",")];
    }
}


/**
 * Computes the vertical layout of a cluster's text content:
 */
function verticalLayout(lineCount) {

    const lineYsRaw = Array.from(
        { length: lineCount },
        (_, i) => (i - (lineCount - 1) / 2) * LABEL_LINE_HEIGHT
    );

    const lastLineYRaw = lineYsRaw[lineCount - 1];
    const usageYRaw = lastLineYRaw + LABEL_USAGE_GAP;

    const topRaw = lineYsRaw[0] - LABEL_LINE_HEIGHT / 2 - CLUSTER_VPAD;
    const bottomRaw = usageYRaw + LABEL_LINE_HEIGHT / 2 + CLUSTER_VPAD;

    const rawHeight = bottomRaw - topRaw;
    const height = Math.max(CLUSTER_HEIGHT, rawHeight);

    const midpoint = (topRaw + bottomRaw) / 2;

    return {
        lineYs: lineYsRaw.map(y => y - midpoint),
        usageY: usageYRaw - midpoint,
        height
    };
}


/**
 * Computes the width of a cluster based on:
 * - the longest displayed line
 * - usage
 * - support
 */
function clusterWidth(d, viewMode = "item") {
    const lines = getClusterLabelLines(d.data, viewMode);
    const usageText = `u:${d.data.usage} s:${d.data.support}`;

    const longestLine = Math.max(0, ...lines.map(line => line.length));
    const longest = Math.max(longestLine, usageText.length);

    return Math.max(CLUSTER_MIN_WIDTH, longest * CHAR_WIDTH + CLUSTER_PAD_X * 2);
}


/**
 * Computes the height of a cluster
 */
function clusterHeight(d, viewMode = "item") {
    const lines = getClusterLabelLines(d.data, viewMode);
    return verticalLayout(lines.length).height;
}


/**
 * Renders the item-label <text> as one or more vertically stacked
 * <tspan> lines and repositions the usage-label right below them.
 */
function renderClusterLabel(nodeGroupSelection, viewMode) {

    nodeGroupSelection.each(function (d) {

        const lines = getClusterLabelLines(d.data, viewMode);
        const layout = verticalLayout(lines.length);
        const sel = d3.select(this);

        const itemLabel = sel.select("text.item-label");
        itemLabel.selectAll("tspan").remove();

        lines.forEach((line, i) => {
            itemLabel.append("tspan")
                .attr("x", 0)
                .attr("y", layout.lineYs[i])
                .text(line);
        });

        sel.select("text.usage-label")
            .attr("y", layout.usageY)
            .text(`u:${d.data.usage} s:${d.data.support}`);
    });
}


/**
 * Recalculates the complete tree layout according to the
 * current cluster widths/heights
 */
function updateTreeLayout(viewMode, root, g) {

    root.each(d => {
        d.clusterWidth = clusterWidth(d, viewMode);
        d.clusterHeight = clusterHeight(d, viewMode);
    });

    const maxClusterHeight = d3.max(root.descendants(), d => d.clusterHeight) || CLUSTER_HEIGHT;
    const nodeSepY = Math.max(NODE_SEP_Y_MIN, maxClusterHeight + NODE_SEP_GAP);

    const treeLayout = d3.tree().nodeSize([nodeSepY, LEVEL_SEP_X]);

    treeLayout(root);

    const levels = d3.groups(root.descendants(), d => d.depth);
    const levelWidths = new Map();

    levels.forEach(([depth, nodes]) => {

        const maxWidth = d3.max(nodes, d => d.clusterWidth) || CLUSTER_MIN_WIDTH;
        levelWidths.set(depth, maxWidth);
    });

    const levelPositions = new Map();

    let currentY = 0;

    const maxDepth = d3.max(root.descendants(), d => d.depth) || 0;

    for (let depth = 0; depth <= maxDepth; depth++) {

        const levelWidth = levelWidths.get(depth) || CLUSTER_MIN_WIDTH;

        if (depth === 0) {

            currentY = levelWidth / 2;

        } else {

            const previousWidth = levelWidths.get(depth - 1) || CLUSTER_MIN_WIDTH;
            currentY += previousWidth / 2 + LEVEL_SEP_X + levelWidth / 2;
        }

        levelPositions.set(depth, currentY);
    }


    root.each(d => {
        d.y = levelPositions.get(d.depth);
    });

    g.selectAll("g.node").attr("transform", d => `translate(${d.y},${d.x})`);

    g.selectAll("rect.cluster")
        .attr("x", d => -clusterWidth(d, viewMode) / 2)
        .attr("y", d => -clusterHeight(d, viewMode) / 2)
        .attr("width", d => clusterWidth(d, viewMode))
        .attr("height", d => clusterHeight(d, viewMode));

    const linkGenerator = d3.linkHorizontal().x(d => d.y).y(d => d.x);

    g.selectAll("path.link")
        .attr("d", d => {

            const sourceWidth = clusterWidth(d.source, viewMode) / 2;

            const targetWidth = clusterWidth(d.target, viewMode) / 2;

            return linkGenerator({
                source: {
                    x: d.source.x,
                    y: d.source.y + sourceWidth
                },

                target: {
                    x: d.target.x,
                    y: d.target.y - targetWidth
                }
            });
        });
}


/**
 * Updates the labels and recalculates the complete layout
 */
function updateClusterLabels(viewMode, g, root) {

    renderClusterLabel(g.selectAll("g.node"), viewMode);
    updateTreeLayout(viewMode, root, g);
}


/**
 * Renders the tree given the root node data
 * The root node is a virtual node that has all the independent groups as children
 */
function renderTree(data, svg, g, zoomBehavior, viewMode) {

    document.getElementById("empty-state").style.display = "none";
    svg.style("display", "block");
    g.selectAll("*").remove();

    const realGroups = (data.children || []).map(compress); // skip -1 root node ROOT
    const virtualRoot = {items: [], uris: [], types: [], usage: 0, support: 0,
        children: realGroups};  // to help d3 calculate positions


    // create D3 hierarchy
    const root = d3.hierarchy(virtualRoot, d => d.children);
    currentTreeRoot = root;
    const realNodes = root.descendants().filter(d => d.depth > 0);

    // maximum usage for the colour scale
    const maxUsage = d3.max(realNodes, d => d.data.usage) || 1;

    const colorScale = d3.scaleSequential()
        .domain([0, maxUsage])
        .interpolator(d3.interpolateRgbBasis([getVar("--accent-cold"), getVar("--accent-hot")]));

    // only render links between real nodes
    const realLinks = root.links().filter(l => l.source.depth > 0); // {source, target}

    g.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(realLinks)
        .join("path")
        .attr("class", "link");

    const nodeGroup = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(realNodes)
        .join("g")
        .attr("class", "node")
        .on("mouseenter", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip);

    nodeGroup.append("rect")
        .attr("class", "cluster")
        .attr("rx", CLUSTER_HEIGHT / 2)
        .attr("ry", CLUSTER_HEIGHT / 2)
        .attr("fill", d => colorScale(d.data.usage))
        .attr("fill-opacity", 0.16)
        .attr("stroke", d => colorScale(d.data.usage));

    nodeGroup.append("text")
        .attr("class", "item-label");

    nodeGroup.append("text")
        .attr("class", "usage-label");

    renderClusterLabel(nodeGroup, viewMode);

    // center the initial view on the first group
    const initialTransform = d3.zoomIdentity.translate(60, window.innerHeight / 2 - 56).scale(1);
    svg.call(zoomBehavior.transform, initialTransform);

    document.getElementById("status").textContent = `${realNodes.length} nodes · max usage: ${maxUsage}`;

    updateTreeLayout(viewMode, currentTreeRoot, g);
}


/**
 * CSS -> JS
 */
function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
