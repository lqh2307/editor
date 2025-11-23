const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth,
  height: window.innerHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const cropper = new Konva.Transformer({
  id: "cropper",
  borderDash: [5, 5],
  anchorSize: 20,
  anchorCornerRadius: 10,
  nodes: [],
});

const transformer = new Konva.Transformer({
  id: "transformer",
  nodes: [],
});

layer.add(cropper, transformer);

let nodeTarget;

// --- Mixin ---
function makeCroppableImage(image) {
  let cropElement = null;
  let cropImage = null;

  const updateCropElement = () => {
    if (cropElement && cropImage) {
      cropElement.setAttrs(image
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(cropImage.getAbsoluteTransform())
        .decompose());
    }
  };

  image.cropStart = () => {
    if (!cropElement) {
      cropElement = new Konva.Shape({
        width: image.width(),
        height: image.height(),
      });
    }

    const layer = image.getLayer();

    cropImage = new Konva.Image({
      ...layer
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(image.getAbsoluteTransform())
        .multiply(cropElement.getAbsoluteTransform())
        .decompose(),
      draggable: true,
      opacity: 0.5,
      image: image.image(),
      width: cropElement.width(),
      height: cropElement.height(),
    });

    cropImage.on("dragmove transform", updateCropElement);

    layer.add(cropImage);

    const cropper = layer.findOne("#cropper");
    if (cropper) {
      cropper.nodes([cropImage]);

      cropper.moveToTop();
    }
  };

  image.cropEnd = (restore) => {
    (image.getLayer().findOne("#cropper"))?.nodes([]);

    if (cropImage) {
      cropImage.remove();
      cropImage = null;
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

    const width = shape.width();
    const height = shape.height();

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

    context.fillStrokeShape(shape);

    context.restore();
  });

  image.on("dragmove transform", updateCropElement);
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

  makeCroppableImage(img);

  layer.add(img);
});

Konva.Image.fromURL("./image.png", (img) => {
  img.setAttrs({
    y: 250,
    x: 650,
    width: 300,
    height: 250,
  });

  makeCroppableImage(img);

  layer.add(img);
});

stage.on(("click"), e => {
  const target = e?.target;

  if (target !== nodeTarget) {
    nodeTarget?.draggable(false);

    transformer.nodes([]);

    nodeTarget?.cropEnd?.();
  }

  if (target !== stage) {
    nodeTarget = target;

    target.draggable(true);

    transformer.nodes([target]);
    transformer.moveToTop();
  }
})
