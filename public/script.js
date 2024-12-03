const sendButton = document.getElementById("send");
const imageInput = document.getElementById("imageInput");
const galleryCont = document.getElementById("gallery");
const loadingBuffer = document.getElementById("loading");
const imageInfo = document.getElementById("imageInfo");

const artImg = document.getElementById("artImg");
const fileLabel = document.getElementById("fileLabel");
const leftCont = document.getElementById("leftCont");

const showInfo = document.getElementById("showInfo");

const imgContainer = document.getElementById("imgContainer");

const errorMessage = document.getElementById("errorMessage");

sendButton.disabled = true;

const numColumns = 3;

imageInput.addEventListener("change", async () => {
  if (imageInput.files.length === 0) {
    console.log("No image uploaded");
  } else {
    console.log("Image uploaded");
    await sendImage();
    // sendButton.style.opacity = 1;
    // sendButton.disabled = false;
    // sendButton.style.display = "block";
    // sendButton.classList.add("active");
    // errorMessage.style.display = "none";
  }
});

showInfo.addEventListener("click", () => {
  imageInfo.classList.toggle("hidden");
  if (imageInfo.classList.contains("hidden")) {
    showInfo.innerHTML = "query <span class='arrow'>↗</span>";
  } else {
    showInfo.innerHTML = "query <span class='arrow'>↘</span>";
  }
});

sendButton.addEventListener("click", async () => {
  if (imageInput.files.length === 0) {
    console.log("No image uploaded");
  } else {
    await sendImage();
  }
});

async function sendImage() {
  await hideStuff();
  await new Promise((resolve) => setTimeout(resolve, 800));
  loadingBuffer.style.display = "block";

  const reader = new FileReader();
  reader.readAsDataURL(imageInput.files[0]);
  reader.onload = async function () {
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        body: JSON.stringify({ image: reader.result }),
      });

      const artData = await response.json();

      if (artData.hasOwnProperty("error")) {
        errorMessage.style.display = "block";
        loadingBuffer.style.display = "none";
        loadingBuffer.style.opacity = 1;
        fileLabel.style.display = "block";
        return;
      }

      await createGallery(artData);
      artImg.src = reader.result;
      imageInfo.innerHTML = artData[0].query;

      loadingBuffer.style.display = "none";

      leftCont.style.left = "calc(30vw)";
      leftCont.style.top = "50px";
      leftCont.style.transform = "translateX(-100%)";
      document.getElementById("line").style.height = "90vh";
      document.getElementById("header").style.marginBottom = "10px";

      await new Promise((resolve) => setTimeout(resolve, 800));

      galleryCont.style.opacity = 1;
      artImg.style.opacity = 1;
      imgContainer.style.opacity = 1;
      fileLabel.style.display = "block";
      fileLabel.style.opacity = 1;
    } catch (error) {
      console.error(error);
      errorMessage.style.display = "block";
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
  showInfo.style.opacity = 1;
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
    if (info.title === "") {
      info.title = "Untitled";
    }
    if (info.artist === "") {
      info.artist = "Unknown";
    }
    if (info.date === "") {
      info.date = "n.d.";
    }
    caption.innerHTML += `<div class="score">${info.score}</div><p class="artist">${info.artist}</p><p><span class="title">${info.title}</span><br>${info.date}</p><br><p>${info.collection}</p><p><a href="${artLink}" target="_blank">original <span class="arrow">↗</span></a></p>`;
    div.appendChild(caption);
    columns[(i - 1) % numColumns].appendChild(div);
  }
}

async function hideStuff() {
  document.getElementById("line").style.height = "0";
  galleryCont.style.opacity = 0;
  imgContainer.style.opacity = 0;
  showInfo.style.opacity = 0;
  imageInfo.innerHTML = "";
  artImg.src = "";
  fileLabel.style.opacity = 0;
  fileLabel.style.display = "none";
}
