const numColumns = 2;
const sendElement = document.getElementById("send");
const imageInput = document.getElementById("imageInput");
const galleryCont = document.getElementById("gallery");
const loadingBuffer = document.getElementById("loading");
const infoCont = document.getElementById("imageInfo");

const artImg = document.getElementById("artImg");
const fileLabel = document.getElementById("fileLabel");
const leftCont = document.getElementById("leftCont");

imageInput.addEventListener("change", () => {
  if (imageInput.files.length === 0) {
    console.log("No image uploaded");
    fileLabel.style.background = "red";
    fileLabel.innerHTML = "error";
  } else {
    console.log("Image uploaded");
    fileLabel.style.background = "green";
    fileLabel.innerHTML = "uploaded";
  }
});

sendElement.addEventListener("click", async () => {
  infoCont.innerHTML = "";
  artImg.src = "";
  loadingBuffer.style.display = "block";

  if (imageInput.files.length === 0) {
    console.log("No image uploaded");
  } else {
    await sendImage();
  }
});

async function sendImage() {
  const reader = new FileReader();
  console.log("hi");
  reader.readAsDataURL(imageInput.files[0]);
  reader.onload = async function () {
    try {
      console.log("reader loaded");
      console.log(reader.result.slice(0, 50));
      const response = await fetch("/api/image", {
        method: "POST",
        body: JSON.stringify({ image: reader.result }),
      });
      const artData = await response.json();
      await createGallery(artData);
      artImg.src = reader.result;
      infoCont.innerHTML = artData[0].query;

      fileLabel.style.background = "black";
      fileLabel.innerHTML = "choose file";
    } catch (error) {
      console.error(error);
    }
  };
}

function setImageURL(id) {
  return `https://www.artic.edu/iiif/2/${id}/full/843,/0/default.jpg`;
}

function createGrid() {
  const columns = [];
  for (let i = 0; i < numColumns; i++) {
    const col = document.createElement("div");
    col.classList.add("column");
    columns.push(col);
    galleryCont.appendChild(col);
  }

  return columns;
}

async function createGallery(artData) {
  galleryCont.innerHTML = "";

  const infoArr = artData;
  loadingBuffer.style.display = "none";
  const columns = createGrid();

  for (let i = 1; i < infoArr.length; i++) {
    const info = infoArr[i];
    const div = document.createElement("div");
    const caption = document.createElement("div");
    const artLink = `https://www.artic.edu/artworks/${info.artic_id}`;
    div.classList.add("gallery-cont");
    caption.classList.add("caption");
    const image = document.createElement("img");
    image.src = setImageURL(info.image);
    div.appendChild(image);
    if (info.title === null) {
      info.title = "Untitled";
    }
    if (info.artist === null) {
      info.artist = "Unknown";
    }
    if (info.date === null) {
      info.date = "n.d.";
    }
    caption.innerHTML += `<p class="artist">${info.artist}</p><p><span class="title">${info.title}</span><br>${info.date}</p><br><p>${info.collection}</p><p><a href="${artLink}" target="_blank">→ original</a></p>`;
    div.appendChild(caption);
    columns[i % numColumns].appendChild(div);
  }
}
