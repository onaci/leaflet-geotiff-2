(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('plotty')) :
  typeof define === 'function' && define.amd ? define(['plotty'], factory) :
  (global = global || self, factory(global.plotty));
}(this, (function (plotty) { 'use strict';

  plotty = plotty && Object.prototype.hasOwnProperty.call(plotty, 'default') ? plotty['default'] : plotty;

  // Depends on:
  L.LeafletGeotiff.Plotty = L.LeafletGeotiffRenderer.extend({
    options: {
      applyDisplayRange: true,
      colorScale: "viridis",
      clampLow: true,
      clampHigh: true,
      displayMin: 0,
      displayMax: 1,
      noDataValue: -9999,
      useWebGL: false
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
    getColourbarDataUrl: function getColourbarDataUrl(paletteName) {
      var canvas = document.createElement("canvas");
      var plot = new plotty.plot({
        canvas: canvas,
        data: [0],
        width: 1,
        height: 1,
        domain: [0, 1],
        colorScale: paletteName,
        clampLow: true,
        clampHigh: true,
        useWebGL: this.options.useWebGL
      });
      dataUrl = plot.colorScaleCanvas.toDataURL();
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
        clampHigh: this.options.clampHigh,
        useWebGL: this.options.useWebGL
      });
      this.colorScaleData = plot.colorScaleCanvas.toDataURL();
    },
    render: function render(raster, canvas, ctx, args) {
      var plottyCanvas = document.createElement("canvas");
      var matrixTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1];

      if (this.options.useWebGL) {
        matrixTransform = [1, 0, 0, 0, -1, 0, 0, raster.height, 1];
      }

      var plot = new plotty.plot({
        data: raster.data[0],
        // fix for use with rgb conversion (appending alpha channel)
        width: raster.width,
        height: raster.height,
        domain: [this.options.displayMin, this.options.displayMax],
        displayRange: [this.options.displayMin, this.options.displayMax],
        applyDisplayRange: this.options.applyDisplayRange,
        colorScale: this.options.colorScale,
        clampLow: this.options.clampLow,
        clampHigh: this.options.clampHigh,
        canvas: plottyCanvas,
        matrix: matrixTransform,
        useWebGL: this.options.useWebGL
      });
      plot.setNoDataValue(this.options.noDataValue);
      plot.render();
      this.colorScaleData = plot.colorScaleCanvas.toDataURL();
      var rasterImageData;

      if (this.options.useWebGL) {
        var imageDataArray = new Uint8ClampedArray(raster.width * raster.height * 4);
        var gl = plottyCanvas.getContext("webgl");
        gl.readPixels(0, 0, raster.width, raster.height, gl.RGBA, gl.UNSIGNED_BYTE, imageDataArray);
        rasterImageData = new ImageData(imageDataArray, raster.width, raster.height);
      } else {
        rasterImageData = plottyCanvas.getContext("2d").getImageData(0, 0, plottyCanvas.width, plottyCanvas.height);
      }

      var imageData = this.parent.transform(rasterImageData, args);
      ctx.putImageData(imageData, args.xStart, args.yStart);
    }
  });

  L.LeafletGeotiff.plotty = function (options) {
    return new L.LeafletGeotiff.Plotty(options);
  };

})));
