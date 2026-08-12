const svg = d3.select("#svg");
const g = svg.append("g");

const fileInput = document.getElementById("file-input");
const filename = document.getElementById("filename");
const status = document.getElementById("status");

const viewItemButton = document.getElementById("view-item-btn"); 
const viewTypeButton = document.getElementById("view-type-btn"); 
const viewUriButton = document.getElementById("view-uri-btn");

let viewMode = "item"; // view mode: "item", "type" or "uri"

function updateViewModeButtons() {
    viewItemButton.classList.toggle("active", viewMode === "item");
    viewTypeButton.classList.toggle("active", viewMode === "type");
    viewUriButton.classList.toggle("active", viewMode === "uri");
}


viewItemButton.addEventListener("click", () => {setViewMode("item");});
viewTypeButton.addEventListener("click", () => {setViewMode("type");});
viewUriButton.addEventListener("click", () => {setViewMode("uri");});

/**
 * Changes the current view mode
 */ 
function setViewMode(mode) { 
    viewMode = mode; 
    updateClusterLabels(viewMode, g, currentTreeRoot); 
    updateViewModeButtons(); 
}

const zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", event => {g.attr("transform", event.transform);});

svg.call(zoomBehavior);


// JSON loading
fileInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    filename.textContent = file.name;
    status.textContent = "Loading...";

    const reader = new FileReader();

    reader.onload = event => {
      try {

          const data = JSON.parse(event.target.result);
          renderTree(data, svg, g, zoomBehavior, viewMode);
      } catch (error) {
          status.textContent = `Error parsing JSON: ${error.message}`;
      }
    };
    reader.readAsText(file);
});

updateViewModeButtons();
