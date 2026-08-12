const NODE_SEP_Y = 70;
const LEVEL_SEP_X = 50;

const CHAR_WIDTH = 8.2;
const CLUSTER_PAD_X = 22;
const CLUSTER_HEIGHT = 44;
const CLUSTER_MIN_WIDTH = 60;

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
 * Computes the width of a cluster based on:
 * - the displayed items
 * - usage
 * - support
 */
function clusterWidth(d, viewMode = "item") {
    const labelText = getClusterLabel(d.data, viewMode);
    const usageText = `u:${d.data.usage} s:${d.data.support}`;

    const longest = Math.max(labelText.length, usageText.length);

    return Math.max(CLUSTER_MIN_WIDTH, longest * CHAR_WIDTH + CLUSTER_PAD_X * 2);
}


/** 
 * Returns the label that should be displayed 
 * inside a cluster depending on the selected view mode
 */ 
function getClusterLabel(data, viewMode) { 
    switch (viewMode) { 
        case "type": 
            return data.types.filter(value => value != null).join(","); 
        
        case "uri": 
            return data.uris.filter(value => value != null).join(","); 

        case "item": 
        default: 
            return data.items.join(","); 
    } 
}


/**
 * Recalculates the complete tree layout according to the
 * current cluster widths
 */
function updateTreeLayout(viewMode, root, g) {

    root.each(d => {
        d.clusterWidth = clusterWidth(d, viewMode);
    });

    const treeLayout = d3.tree().nodeSize([NODE_SEP_Y, LEVEL_SEP_X]);

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
        .attr("width", d => clusterWidth(d, viewMode));

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

    g.selectAll("text.item-label").text(d => getClusterLabel(d.data, viewMode));

    updateTreeLayout(viewMode, root, g);
}


/**
 * Renders the tree given the root node data
 * The root node is a virtual node that has all the independent groups as children
 */
function renderTree(data, svg, g, zoomBehavior) {

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

    // Only render links between real nodes
    const realLinks = root.links().filter(l => l.source.depth > 0); // {source, target}

    const linkGenerator = d3.linkHorizontal().x(d => d.y).y(d => d.x); // horizontal links


    g.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(realLinks)
        .join("path")
        .attr("class", "link")
        .attr("d", d => {
            const sw = clusterWidth(d.source, viewMode) / 2;
            const tw = clusterWidth(d.target, viewMode) / 2;
            return linkGenerator({
                source: { x: d.source.x, y: d.source.y + sw },
                target: { x: d.target.x, y: d.target.y - tw }
            });
        });

    const nodeGroup = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(realNodes)
        .join("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("mouseenter", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip);

    nodeGroup.append("rect")
        .attr("class", "cluster")
        .attr("x", d => -clusterWidth(d, viewMode) / 2)
        .attr("y", -CLUSTER_HEIGHT / 2)
        .attr("width", d => clusterWidth(d, viewMode))
        .attr("height", CLUSTER_HEIGHT)
        .attr("rx", CLUSTER_HEIGHT / 2)
        .attr("ry", CLUSTER_HEIGHT / 2)
        .attr("fill", d => colorScale(d.data.usage))
        .attr("fill-opacity", 0.16)
        .attr("stroke", d => colorScale(d.data.usage));

    nodeGroup.append("text")
        .attr("class", "item-label")
        .attr("y", -7)
        .text(d => getClusterLabel(d.data, viewMode));

    nodeGroup.append("text")
        .attr("class", "usage-label")
        .attr("y", 11)
        .text(d => `u:${d.data.usage} s:${d.data.support}`);


    // Center the initial view on the first group
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
