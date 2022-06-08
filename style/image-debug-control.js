import * as maplibregl from "maplibre-gl";

const imageObjectToImg = (obj) => {
  const canvas = document.createElement("canvas");
  canvas.width = obj.data.width;
  canvas.height = obj.data.height;

  const ctx = canvas.getContext("2d");
  const imageData = new ImageData(
    new Uint8ClampedArray(obj.data.data),
    obj.data.width,
    obj.data.height
  );
  ctx.putImageData(imageData, 0, 0);

  const image = new Image();
  image.srcset = `${canvas.toDataURL()} ${obj.pixelRatio}x`;
  return image;
};

class ImageDebugControl extends maplibregl.Evented {
  constructor() {
    super();

    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick(event) {
    event.preventDefault();

    if (this._dialog) {
      this._dialog.remove();
    }

    const div = document.createElement("div");
    for (const [id, obj] of Object.entries(
      this._map.style.imageManager.images
    )) {
      const image = imageObjectToImg(obj);
      div.append(JSON.stringify(id), image, document.createElement("br"));
    }

    this._dialog = document.createElement("dialog");
    this._dialog.innerHTML = `<form method="dialog"><button aria-label="Close" style="float:right">❌</button></form>`;
    this._dialog.append(div);
    document.body.append(this._dialog);
    this._dialog.showModal();
  }

  onAdd(map) {
    this._map = map;

    this._button = document.createElement("button");
    this._button.addEventListener("click", this.onButtonClick);
    this._button.textContent = "Images";

    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl";
    this._container.append(this._button);

    return this._container;
  }

  onRemove(map) {
    this._button.removeEventListener("click", this.onButtonClick);
  }
}

export default ImageDebugControl;
