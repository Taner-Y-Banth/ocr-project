var myLayout;
var labels = {
  1012: {
    name: "Trax2",
    type: "input",
    traces: [
      "Heading",
      "Pitch",
      "Roll",
      "MagX",
      "MagY",
      "MagZ",
      "AccelX",
      "AccelY",
      "AccelZ",
      "GyroX",
      "GyroY",
      "GyroZ",
      "Heading Status",
      "Temperature",
      "Distortion",
    ],
  },
};

function initLayout() {
  const config = {
    labels: {
      popout: false,
    },
    content: [
      {
        type: "stack",
        content: [],
      },
    ],
  };

  myLayout = new GoldenLayout(config);
  myLayout.on("stateChanged", function () {
    try {
      var state = JSON.stringify(myLayout.toConfig());
      localStorage.setItem("savedState", state);
    } catch (e) {
      console.log("layout not saved: " + e);
    }
  });

  myLayout.registerComponent("plots", function (container, componentState) {});

  myLayout.init();
}

initLayout();

var plots = {};
var scatterPlots = {};

function renderEvents(name, events) {
  events.forEach((event) => {
    addEventToPlots(name, event);
    // create scatterPlot for mag indices 3,4,5
    // addEventToScatterPlots(name, event, [3, 4, 5]);
  });
  updatePlots();
}

function updatePlots() {
  for (index in plots) {
    plots[index].update();
  }
  for (index in scatterPlots) {
    scatterPlots[index].update();
  }
}

function clear() {
  plots = {};
  scatterPlots = {};
  myLayout.destroy();
  initLayout();
}

var lastPlotUpdate = 0;
function addEventToPlots(name, event) {
  var plotId = name;
  if (!plots.hasOwnProperty(plotId)) {
    console.log(plots, plotId);
    plots[plotId] = new Plot(plotId, event);
  }
  plots[plotId].addEvent(event);
}

function addEventToScatterPlots(name, event, indices) {
  const plotId = "scatter-" + name;
  if (!scatterPlots.hasOwnProperty(plotId)) {
    scatterPlots[plotId] = new ScatterPlot(plotId, event, indices);
  }
  scatterPlots[plotId].addEvent(event);
}

function takeScreenShot() {
  return html2canvas(document.body, { useCORS: true }).then((canvas) => {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  });
}

class ScatterPlot {
  constructor(id, event, indices) {
    this.id = id;
    this.data = [];
    this.indices = indices;
    this.plotName = event.id;

    let relayout;

    myLayout.registerComponent(this.plotName, function (container, state) {
      relayout = async () => {
        var update = {
          width: container.width,
          height: container.height,
        };
        // Plotly.relayout(container, update);
        if (document.getElementById(state.componentName) != null) {
          try {
            Plotly.relayout(state.componentName, update);
          } catch (e) {}
        }
      };
      container
        .getElement()
        .html('<div id="' + state.componentName + '"></div>');
      container.on("resize", function () {
        relayout();
      });
    });
    myLayout.root.contentItems[0].addChild({
      type: "component",
      componentName: this.plotName,
    });
    Plotly.react(
      this.plotName,
      this.data,
      {},
      {
        displayModeBar: false,
      }
    ).then(() => {
      relayout();
    });
  }

  clearData() {
    for (var i = 0; i < this.data.length; i++) {
      this.data[i].x = [];
      this.data[i].y = [];
      this.data[i].z = [];
    }
    //this.update()
  }

  addEvent(event) {
    if (!this.data[0]) {
      this.data.push({
        x: [],
        y: [],
        z: [],
        type: "scatter3d",
      });
    }
    this.data[0].x.push(event.values[this.indices[0]]);
    this.data[0].y.push(event.values[this.indices[1]]);
    this.data[0].z.push(event.values[this.indices[2]]);
  }
  update() {
    Plotly.react(
      this.plotName,
      this.data,
      { datarevision: Date.now() },
      {
        displayModeBar: false,
      }
    );
  }
}

class Plot {
  constructor(id, event) {
    this.id = id;
    this.plotName = this.id;
    this.eventIdMap = {};
    this.data = [];

    let relayout;

    myLayout.registerComponent(this.plotName, function (container, state) {
      relayout = async () => {
        var update = {
          width: container.width,
          height: container.height,
        };
        // Plotly.relayout(container, update);
        if (document.getElementById(state.componentName) != null) {
          try {
            Plotly.relayout(state.componentName, update);
          } catch (e) {}
        }
      };
      container
        .getElement()
        .html('<div id="' + state.componentName + '"></div>');
      container.on("resize", function () {
        relayout();
      });
    });
    myLayout.root.contentItems[0].addChild({
      type: "component",
      componentName: this.plotName,
    });
    Plotly.react(
      this.plotName,
      this.data,
      {},
      {
        displayModeBar: false,
      }
    ).then(() => {
      relayout();
    });
  }

  clearData() {
    for (var i = 0; i < this.data.length; i++) {
      this.data[i].x = [];
      this.data[i].y = [];
    }
    //this.update()
  }

  addEvent(event) {
    if (!this.eventIdMap.hasOwnProperty(event.id)) {
      this.eventIdMap[event.id] = [];
      for (var i = 0; i < event.values.length; i++) {
        this.eventIdMap[event.id].push(this.data.length);
        const emptyTrace = {
          x: [],
          y: [],
        };
        if (labels.hasOwnProperty(event.id)) {
          if (labels[event.id].traces[i] != null) {
            emptyTrace.name = labels[event.id].traces[i];
          }
        }
        this.data.push(emptyTrace);
      }
    }
    for (var i = 0; i < event.values.length; i++) {
      this.data[this.eventIdMap[event.id][i]].x.push(event.timestamp);
      this.data[this.eventIdMap[event.id][i]].y.push(event.values[i]);
    }
  }
  update() {
    Plotly.react(
      this.plotName,
      this.data,
      { datarevision: Date.now() },
      {
        displayModeBar: false,
      }
    );
  }
}

var nstrumenta;

function initNstrumenta() {
  console.log("initNstrumenta");
  nstrumenta = new Nstrumenta.SandboxClient();

  nstrumenta.addListener("clear", () => {
    console.log("sandbox index.js clear");
  });

  console.log("adding listener inputEvents");
  nstrumenta.addListener("inputEvents", (events) => {
    console.log("sandbox index.js inputEvents");
    renderEvents("inputEvents", events);
  });

  console.log("adding listener outputEvents");
  nstrumenta.addListener("outputEvents", (events) => {
    console.log("sandbox index.js outputEvents", events);
    renderEvents("outputEvents", events);
  });
}
