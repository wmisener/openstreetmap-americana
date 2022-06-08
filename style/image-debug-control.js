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
  onBtnNewClick(event) {
    const w = window.open();
    w.document.head.innerHTML = `
    <meta name=viewport content="width=device-width">
    <style>
    @media screen {
      img {
        background: magenta;
        image-rendering: pixelated;
      }
    }
    @media print {
      .noprint { display: none }
      img {
        border: 0.5px dashed;
        image-rendering: pixelated;
      }
    }
    </style>`;
    w.document.body.innerHTML = `
    <button class=noprint onclick=print()>Print</button>
    `;
    w.document.body.append(this._dialog.querySelector('div'));
  }

  onControlButtonClick(event) {
    event.preventDefault();

    if (this._dialog) {
      this._dialog.remove();
    }

    const div = document.createElement("div");
    for (const [id, obj] of Object.entries(
      this._map.style.imageManager.images
    )) {
      const label = JSON.stringify(id).replace(/^"/, "").replace(/"$/, "");
      const image = imageObjectToImg(obj);
      div.append(image, label, document.createElement("br"));
    }

    this._dialog = document.createElement("dialog");
    this._dialog.className = "image-debug-results";
    this._dialog.innerHTML = `<form method="dialog"><button aria-label="New window" id="btnNew">↗</button><button aria-label="Close">❌</button></form>`;
    this._dialog.firstChild.btnNew.addEventListener("click", (event) => this.onBtnNewClick(event));
    this._dialog.append(div);
    document.body.append(this._dialog);
    this._dialog.showModal();
  }

  onAdd(map) {
    this._map = map;

    this._button = document.createElement("button");
    this._button.addEventListener("click",(event) => this.onControlButtonClick(event));
    this._button.textContent = "Images";

    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl";
    this._container.append(this._button);

    return this._container;
  }
}

export default ImageDebugControl;
