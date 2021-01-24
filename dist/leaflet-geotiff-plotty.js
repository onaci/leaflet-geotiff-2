(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('plotty')) :
  typeof define === 'function' && define.amd ? define(['plotty'], factory) :
  (global = global || self, factory(global.plotty));
}(this, (function (plotty) { 'use strict';

  plotty = plotty && plotty.hasOwnProperty('default') ? plotty['default'] : plotty;

  // Depends on:
  L.LeafletGeotiff.Plotty = L.LeafletGeotiffRenderer.extend({
    options: {
      colorScale: "viridis",
      clampLow: true,
      clampHigh: true,
      displayMin: 0,
      displayMax: 1,
      noDataValue: -9999
    },
    initialize: function initialize(options) {
      if (typeof plotty === "undefined") {
        throw new Error("plotty not defined");
      }

      this.name = "Plotty";
      L.setOptions(this, options);

      this._preLoadColorScale();
    },
    setColorScale: function setColorScale(colorScale) {
      this.options.colorScale = colorScale;

      this.parent._reset();
    },
    setDisplayRange: function setDisplayRange(min, max) {
      this.options.displayMin = min;
      this.options.displayMax = max;

      this.parent._reset();
    },
    setClamps: function setClamps(clampLow, clampHigh) {
      this.options.clampLow = clampLow;
      this.options.clampHigh = clampHigh;

      this.parent._reset();
    },
    getColorbarOptions: function getColorbarOptions() {
      return Object.keys(plotty.colorscales);
    },
    addColorScale: function addColorScale(name, colorsList, rangeMap) {
      plotty.addColorScale(name, colorsList, rangeMap);
    },
    getColorbarDataUrl: function getColorbarDataUrl(paletteName) {
      var canvas = document.createElement("canvas");
      var plot = new plotty.plot({
        canvas: canvas,
        data: [0],
        width: 1,
        height: 1,
        domain: [0, 1],
        colorScale: paletteName,
        clampLow: true,
        clampHigh: true
      });
      var dataUrl = plot.colorScaleCanvas.toDataURL();
      canvas.remove();
      return dataUrl;
    },
    _preLoadColorScale: function _preLoadColorScale() {
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
    render: function render(raster, canvas, ctx, args) {
      var plottyCanvas = document.createElement("canvas");
      var plot = new plotty.plot({
        data: raster.data[0],
        // fix for use with rgb conversion (appending alpha channel)
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
      var rasterImageData = plottyCanvas.getContext("2d").getImageData(0, 0, plottyCanvas.width, plottyCanvas.height);
      var imageData = this.parent.transform(rasterImageData, args);
      ctx.putImageData(imageData, args.xStart, args.yStart);
    }
  });

  L.LeafletGeotiff.plotty = function (options) {
    return new L.LeafletGeotiff.Plotty(options);
  };

})));
