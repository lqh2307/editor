const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const cropTransformer = new Konva.Transformer({
  id: "crop-transformer",
  borderDash: [5, 5],
  anchorSize: 21,
  anchorCornerRadius: 11,
  nodes: [],
});

const transformer = new Konva.Transformer({
  id: "transformer",
  nodes: [],
});

layer.add(cropTransformer, transformer);

let target;

stage.on("click", (e) => {
  target = e?.target;

  if (target === stage) {
    if (!target?.isCroppingElement) {
      transformer.nodes([]);

      cropTransformer.nodes([]);
    }
  }
});

// --- Mixin ---
function makeCroppableImage(image) {
  let cropElement = null;
  let cropImage = null;

  const resizeStart = () => {
    transformer.nodes([image]);
    transformer.moveToTop();
  };

  const cropUpdate = () => {
    const options = image
      .getAbsoluteTransform()
      .copy()
      .invert()
      .multiply(cropImage.getAbsoluteTransform())
      .decompose();

    cropElement.setAttrs({
      ...options,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const resizeAndCropUpdate = () => {
    image.setAttrs({
      width: image.width() * image.scaleX(),
      height: image.height() * image.scaleY(),
      scaleX: 1,
      scaleY: 1,
    });

    cropUpdate();
  };

  cropEnd = () => {
    if (!cropImage) {
      return;
    }

    cropImage.remove();
    cropImage = null;

    image.off("dragmove", cropUpdate);
    image.off("transform", resizeAndCropUpdate);
  };

  image.cropStart = () => {
    if (cropImage) {
      return;
    }

    if (!cropElement) {
      cropElement = new Konva.Shape({
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
      }); // “holder” transform
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

    cropTransformer.nodes([cropImage]);
    cropTransformer.moveToTop();

    cropImage.on("dragmove", cropUpdate);
    cropImage.on("transform", cropUpdate);
    image.on("dragmove", cropUpdate);
    image.on("transform", resizeAndCropUpdate);

    const endOnOutside = (e) => {
      const target = e?.target;

      if (target instanceof Konva.Stage) {
        cropEnd();

        target?.off("click", endOnOutside);
      }
    };

    image.getStage()?.on("click", endOnOutside);
  };

  image.cropReset = () => {
    if (cropImage) {
      cropEnd();
    }

    cropElement = null;
  };

  image.on("click", resizeStart);

  // Overwrite sceneFunc
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

      context.drawImage.apply(
        context,
        cropWidth && cropHeight
          ? [
            img,
            image.cropX(),
            image.cropY(),
            cropWidth,
            cropHeight,
            0,
            0,
            width,
            height,
          ]
          : [img, 0, 0, width, height]
      );

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
});
