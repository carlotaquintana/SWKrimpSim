const tooltip = d3.select("#tooltip");

/**
 * Shows the tooltip for a tree node.
 *
 * @param {MouseEvent} event
 * @param {Object} d - D3 hierarchy node
 */
function showTooltip(event, d) {
    const itemsText = d.data.items.join(", ");
    const urisText = d.data.uris.map(v => v ?? "?").join("<br>");
    const typesText = d.data.types.map(v => v ?? "?").join("<br>");

    tooltip
        .html(`
            <div class="head">${itemsText}</div>
            <div class="row">
                <span>uri</span>
                <span>${urisText}</span>
            </div>
            <div class="row">
                <span>type</span>
                <span>${typesText}</span>
            </div>
            <div class="row">
                <span>usage</span>
                <span>${d.data.usage}</span>
            </div>
            <div class="row">
                <span>support</span>
                <span>${d.data.support}</span>
            </div>
            <div class="row">
                <span>items in chain</span>
                <span>${d.data.items.length}</span>
            </div>
            <div class="row">
                <span>next branches</span>
                <span>${d.children ? d.children.length : 0}</span>
            </div>
        `)
    .style("display", "block");

    moveTooltip(event);
}

/**
 * Moves the tooltip next to the mouse cursor.
 *
 * @param {MouseEvent} event
 */
function moveTooltip(event) {
  tooltip.style("left", `${event.clientX + 16}px`)
         .style("top", `${event.clientY + 16}px`);
}

/**
 * Hides the tooltip.
 */
function hideTooltip() {
    tooltip.style("display", "none");
}

