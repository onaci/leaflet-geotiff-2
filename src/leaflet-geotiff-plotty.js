// Depends on:
// https://github.com/santilland/plotty

import plotty from "plotty";

L.LeafletGeotiff.Plotty = L.LeafletGeotiffRenderer.extend({
  options: {
    colorScale: "viridis",
    clampLow: true,
    clampHigh: true,
    displayMin: 0,
    displayMax: 1,
    noDataValue: -9999,
  },

  initialize: function(options) {
    if (typeof plotty === "undefined") {
      throw new Error("plotty not defined");
    }
    this.name = "Plotty";

    L.setOptions(this, options);
    this._preLoadColorScale();
  },

  setColorScale: function(colorScale) {
    this.options.colorScale = colorScale;
    this.parent._reset();
  },

  setDisplayRange: function(min, max) {
    this.options.displayMin = min;
    this.options.displayMax = max;
    this.parent._reset();
  },

  setClamps: function(clampLow, clampHigh) {
    this.options.clampLow = clampLow;
    this.options.clampHigh = clampHigh;
    this.parent._reset();
  },

  getColorbarOptions() {
    return Object.keys(plotty.colorscales);
  },

  addColorScale(name, colorsList,rangeMap) {
    plotty.addColorScale(name, colorsList,rangeMap);
  },

  getColourbarDataUrl(paletteName) {
    const canvas = document.createElement("canvas");
    const plot = new plotty.plot({
      canvas,
      data: [0],
      width: 1,
      height: 1,
      domain: [0, 1],
      colorScale: paletteName,
      clampLow: true,
      clampHigh: true
    });
    dataUrl = plot.colorScaleCanvas.toDataURL();
    canvas.remove();
    return dataUrl;
  },

  _preLoadColorScale: function() {
    var canvas = document.createElement("canvas");
    var plot = new plotty.plot({
      canvas: canvas,
      data: [0],
      width: 1,
      height: 1,
      domain: [this.options.displayMin, this.options.displayMax],
      colorScale: this.options.colorScale,
      clampLow: this.options.clampLow,
      clampHigh: this.options.clampHigh
    });
    this.colorScaleData = plot.colorScaleCanvas.toDataURL();
  },

  render: function(raster, canvas, ctx, args) {
    var plottyCanvas = document.createElement("canvas");
    var plot = new plotty.plot({
      data: raster.data[0], // fix for use with rgb conversion (appending alpha channel)
      width: raster.width,
      height: raster.height,
      domain: [this.options.displayMin, this.options.displayMax],
      colorScale: this.options.colorScale,
      clampLow: this.options.clampLow,
      clampHigh: this.options.clampHigh,
      canvas: plottyCanvas,
      useWebGL: false
    });
    plot.setNoDataValue(this.options.noDataValue);
    plot.render();

    this.colorScaleData = plot.colorScaleCanvas.toDataURL();

    var rasterImageData = plottyCanvas
      .getContext("2d")
      .getImageData(0, 0, plottyCanvas.width, plottyCanvas.height);
    var imageData = this.parent.transform(rasterImageData, args);
    ctx.putImageData(imageData, args.xStart, args.yStart);
  }
});

L.LeafletGeotiff.plotty = function(options) {
  return new L.LeafletGeotiff.Plotty(options);
};
