const svg = d3.select("#svg");
const g = svg.append("g");

const fileInput = document.getElementById("file-input");
const filename = document.getElementById("filename");
const status = document.getElementById("status");

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
      renderTree(data, svg, g, zoomBehavior);

    } catch (error) {
      status.textContent = `Error parsing JSON: ${error.message}`;
    }
  };
  reader.readAsText(file);
});
