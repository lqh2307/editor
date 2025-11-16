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
  anchorSize: 20,
  anchorCornerRadius: 10,
  nodes: [],
});

const transformer = new Konva.Transformer({
  id: "transformer",
  nodes: [],
});

layer.add(cropTransformer, transformer);

let nodeTarget;

// --- Mixin ---
function makeCroppableImage(image, cropTransformer, transformer) {
  let cropElement = null;
  let cropImage = null;

  const updateCropElement = () => {
    if (!cropElement || !cropImage) {
      return;
    }

    const options = image
      .getAbsoluteTransform()
      .copy()
      .invert()
      .multiply(cropImage.getAbsoluteTransform())
      .decompose();

    cropElement.setAttrs(options);
  };

  const resizeAndUpdateCropElement = () => {
    image.setAttrs({
      width: image.width() * image.scaleX(),
      height: image.height() * image.scaleY(),
      scaleX: 1,
      scaleY: 1,
    });

    updateCropElement();
  };

  image.cropStart = () => {
    if (cropImage) {
      return;
    }

    if (!cropElement) {
      cropElement = new Konva.Shape({
        width: image.width(),
        height: image.height(),
        skewX: image.skewX(),
        skewY: image.skewY(),
      });
    }

    const layer = image.getLayer();

    const options = layer
      .getAbsoluteTransform()
      .copy()
      .invert()
      .multiply(image.getAbsoluteTransform())
      .multiply(cropElement.getAbsoluteTransform())
      .decompose();

    cropImage = new Konva.Image({
      draggable: true,
      opacity: 0.5,
      ...options,
      image: image.image(),
      width: cropElement.width(),
      height: cropElement.height(),
    });

    cropImage.on("dragmove", updateCropElement);
    cropImage.on("transform", updateCropElement);
    image.on("dragmove", updateCropElement);
    image.on("transform", resizeAndUpdateCropElement);

    layer.add(cropImage);

    cropTransformer.nodes([cropImage]);
    cropTransformer.moveToTop();
  };

  image.cropEnd = (restore) => {
    if (cropImage) {
      cropTransformer.nodes([]);

      cropImage.remove();
      cropImage = null;

      image.off("dragmove", updateCropElement);
      image.off("transform", resizeAndUpdateCropElement);
    }

    if (restore && cropElement) {
      cropElement.remove();
      cropElement = null;
    }

    image.getLayer().batchDraw();
  };

  image.sceneFunc((context, shape) => {
    const img = shape.image();
    if (!img) {
      return;
    }

    let width = shape.width();
    let height = shape.height();

    context.save();

    context.beginPath();
    context.rect(0, 0, width, height);
    context.clip();

    if (cropElement) {
      context.save();

      const m = cropElement.getAbsoluteTransform().getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

      context.drawImage(img, 0, 0, cropElement.width(), cropElement.height());

      context.restore();
    } else {
      context.drawImage(img, 0, 0, width, height);
    }

    context.save();
    context.shadowColor = context.shadowColor;
    context.shadowBlur = context.shadowBlur;
    context.shadowOffsetX = context.shadowOffsetX;
    context.shadowOffsetY = context.shadowOffsetY;

    context.beginPath();
    context.rect(0, 0, width, height);
    context.fillStrokeShape(shape);
    context.restore();

    context.restore();
  });
}

// --- Demo with 2 images ---
Konva.Image.fromURL("./image.png", (img) => {
  img.setAttrs({
    y: 50,
    x: 50,
    width: 300,
    height: 250,
    shadowColor: "rgba(255,125,125,0.5)",
    shadowOffsetX: 50,
    shadowOffsetY: 50,
    stroke: "#000000",
    fill: "rgba(125,125,125,0.5)",
  });

  makeCroppableImage(img, cropTransformer, transformer);

  layer.add(img);
});

Konva.Image.fromURL("./image.png", (img) => {
  img.setAttrs({
    y: 250,
    x: 650,
    width: 300,
    height: 250,
  });

  makeCroppableImage(img, cropTransformer, transformer);

  layer.add(img);
});

stage.on(("click"), e => {
  const target = e?.target;

  if (target !== nodeTarget) {
    nodeTarget?.draggable(false);

    transformer.nodes([]);

    nodeTarget?.cropEnd();
  }

  if (target !== stage) {
    nodeTarget = target;

    target.draggable(true);

    transformer.nodes([target]);
    transformer.moveToTop();
  }
})
