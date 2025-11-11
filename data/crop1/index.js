// --- Mixin ---
function makeCroppableImage(image) {
  let cropElement = null;
  let cropImage = null;
  let transformer = null;
  let cropTransformer = null;

  const setCropTransform = (value) => {
    if (!cropElement) {
      cropElement = new Konva.Shape();
    }

    cropElement.setAttrs({
      ...value,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const cropEnd = () => {
    if (!cropImage) {
      return;
    }

    transformer?.destroy();
    transformer = null;

    cropTransformer?.destroy();
    cropTransformer = null;

    cropImage.remove();
    cropImage = null;

    image.off("dragmove", cropUpdate);
    image.off("transform", resizeAndCropUpdate);

    image.getLayer()?.draw();
  };

  const cropUpdate = () => {
    setCropTransform(
      image
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(cropImage.getAbsoluteTransform())
        .decompose()
    );

    image.getLayer()?.draw();
  };

  const resize = () => {
    image.setAttrs({
      width: image.width() * image.scaleX(),
      height: image.height() * image.scaleY(),
      scaleX: 1,
      scaleY: 1,
    });
  };

  const resizeAndCropUpdate = () => {
    resize();
    cropUpdate();
  };

  image.cropReset = () => {
    if (cropImage) {
      cropEnd();
    }

    cropElement = null;

    image.getLayer()?.draw();
  };

  const cropStart = () => {
    image
      .getStage()
      ?.find("Transformer")
      .forEach((tr) => tr.destroy());

    if (cropImage) {
      return;
    }

    if (!cropElement) {
      setCropTransform({
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
        rotation: 0,
      });
    }

    const layer = image.getLayer();
    const transform = image.getAbsoluteTransform();
    const transform2 = cropElement.getAbsoluteTransform();
    const transform0 = layer.getAbsoluteTransform();

    const options = transform0
      .copy()
      .invert()
      .multiply(transform) // * imageAbs
      .multiply(transform2) // * cropElementAbs
      .decompose(); // -> {x,y,rotation,scaleX,scaleY,...}

    cropImage = new Konva.Image({
      ...options,
      draggable: true,
      opacity: 0.5,
      image: image.image(),
      stroke: image.stroke(),
      strokeWidth: image.strokeWidth(),
      width: cropElement.width(),
      height: cropElement.height(),
    });
    cropImage.isCroppingElement = true;

    layer.add(cropImage);

    cropTransformer = new Konva.Transformer({
      borderDash: [5, 5],
      anchorSize: 21,
      anchorCornerRadius: 11,
      nodes: [cropImage],
    });

    transformer = new Konva.Transformer({
      nodes: [image],
    });

    layer.add(cropTransformer, transformer);

    cropImage.on("dragmove", cropUpdate);
    cropImage.on("transform", cropUpdate);
    image.on("dragmove", cropUpdate);
    image.on("transform", resizeAndCropUpdate);

    const endOnOutside = (e) => {
      if (e.target !== cropImage && e.target !== image) {
        cropEnd();

        image.getStage()?.off("click tap", endOnOutside);
      }
    };

    image.getStage()?.on("click tap", endOnOutside);

    layer.draw();
  };

  image.on("dblclick", cropStart);

  image.setAttr("sceneFunc", (context) => {
    let width = image.width();
    let height = image.height();
    const img = image.image();

    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.clip();

    if (image.hasFill() || image.hasStroke()) {
      context.fillStrokeShape(image);
    }

    if (img) {
      if (cropElement) {
        context.save();
        width = cropElement.width();
        height = cropElement.height();
        const m = cropElement.getAbsoluteTransform().getMatrix();
        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }

      const cropWidth = image.cropWidth();
      const cropHeight = image.cropHeight();
      let params;

      if (cropWidth && cropHeight) {
        params = [
          img,
          image.cropX(),
          image.cropY(),
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height,
        ];
      } else {
        params = [img, 0, 0, width, height];
      }

      // draw
      context.drawImage.apply(context, params);

      if (cropElement) {
        context.restore();
      }
    }

    context.strokeShape(image);
    context.restore();
  });

  return image;
}

// --- Demo ---
const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

Konva.Image.fromURL("./image.png", (img) => {
  img.setAttrs({
    y: 50,
    x: 350,
    width: 300,
    height: 250,
    draggable: true,
  });

  makeCroppableImage(img);

  layer.add(img);
  layer.draw();
});

let transformer;
let target;

stage.on("click tap", (e) => {
  if (transformer) {
    transformer.destroy();
    transformer = null;
  }

  target = e?.target;

  if (target === stage || target?.isCroppingElement) {
    layer.draw();

    return;
  }

  transformer = new Konva.Transformer({
    nodes: [e.target],
  });

  layer.add(transformer);
  layer.draw();
});
