const tooltip = d3.select("#tooltip");

/**
 * Shows the tooltip for a tree node.
 *
 * @param {MouseEvent} event
 * @param {Object} d - D3 hierarchy node
 */
function showTooltip(event, d) {
    const itemsText = d.items.join(", ");
    const fullPatternText = d.details ? d.details.map(det => {
        const uri = det.uri ?? "?";
        const type = det.type ?? "?";
        return `${det.item} &nbsp;&nbsp; ${uri} &nbsp;&nbsp; ${type}`;  
    }).join("<br>") : "";

    tooltip
        .html(`
            <div class="head">${itemsText}</div>
            <div class="row">
                <span>Patterns</span>
                <span>${fullPatternText}</span>
            </div>
            <br>
            <div class="row">
                <span>usage</span>
                <span>${d.usage}</span>
            </div>
            <div class="row">
                <span>support</span>
                <span>${d.support}</span>
            </div>
            <div class="row">
                <span>items in chain</span>
                <span>${d.items ? d.items.length : 0}</span>
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

