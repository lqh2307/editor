class KonvaImage extends Konva.Image {
	constructor(imageData) {
		super(imageData);
		this.draggable(true);
		this.cropWidth(imageData.image.width);
		this.cropHeight(imageData.image.height);
	}
	/**
	 * transforming
	 */
	handleTransform() {
		this.setAttrs({
			scaleX: 1,
			scaleY: 1,
			width: this.width() * this.scaleX(),
			height: this.height() * this.scaleY(),
		});
	}
}
