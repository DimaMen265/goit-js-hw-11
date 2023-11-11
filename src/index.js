import axios from "axios";
import Notiflix from "notiflix";

import simpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

const pagination = document.querySelector(".pagination");
pagination.style.display = "none";

const prev = document.querySelector('.prev');
prev.style.backgroundColor = "lightskyblue";
prev.style.color = "white";
prev.style.border = "none";
prev.style.borderRadius = "50%";
prev.style.width = "32px";
prev.style.height = "32px";

const next = document.querySelector('.next');
next.style.backgroundColor = "lightskyblue";
next.style.color = "white";
next.style.border = "none";
next.style.borderRadius = "50%";
next.style.width = "32px";
next.style.height = "32px";

const bthNum = document.querySelector('.buttons-number');
bthNum.style.margin = "8px";

const backToTop = document.querySelector('.back-to-top');
backToTop.hidden = true;

const countPage = 40;
let page = 1;
let maxPages = page;
let messEndSearchResult = false;

const optionsGallery = {
    sourceAttr: "href",
    captions: true,
    captionsData: "alt",
    captionPosition: "bottom",
    captionDelay: 250,
    disableScroll: false,
    scrollZoom: false,
    doubleTapZoom: false,
};

const lightbox = new simpleLightbox(".gallery a", optionsGallery);

const getImages = async () => {
    const paramsObject = {
        key: "40222608-3820d97c8748fab8cb367624f",
        q: searchInput.value.trim(),
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        per_page: countPage,
        page: page,
    };

    const params = new URLSearchParams(paramsObject);

    return await axios.get(`https://pixabay.com/api/?${params}`);
};

form.addEventListener("submit", event => {
    event.preventDefault();

    removeChildren(gallery);

    page = 1;
    messEndSearchResult = false;

    if (searchInput.value.trim().length === 0) {
        Notiflix.Notify.failure("The search field must be filled!");
        return;
    }

    getImages()
        .then(response => render(response.data))
        .catch(error => getError(error));
});

const render = items => {
    maxPages = Math.ceil(items.totalHits / countPage);

    if (items.hits.length === 0) {
        return getError(error);
    }

    Notiflix.Notify.success(`Hooray! We found ${items.totalHits} images.`);

    if (items.totalHits > 0) {
        const markup = items.hits
            .map(item => {
                return `<a class="photo-card" href="${item.largeImageURL}">
                <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
                <div class="info">
                <p class="info-item">
                <b>Likes</b>
                ${item.likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                ${item.views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                ${item.comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                ${item.downloads}
                </p>
                </div>
                </a>`;
            }).join("");

        gallery.insertAdjacentHTML("beforeend", markup);

        lightbox.refresh();

        renderButtons(items);
    }

    pagination.style.display = "flex";
    pagination.style.flexDirection = "row";
    pagination.style.justifyContent = "center";
    pagination.style.alignItems = "center";
};

const removeChildren = container => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

const getError = error => {
    error = Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");

    pagination.style.display = "none";
};

const renderButtons = items => {
    maxPages = Math.ceil(items.totalHits / countPage);

    let arrayButtons = [];

    for (let i = 0; i < maxPages; i += 1) {
        arrayButtons.push(i + 1);
    }

    bthNum.innerHTML = "";

    arrayButtons.forEach(pageNumber => {
        const button = document.createElement("button");
        button.style.backgroundColor = "lightskyblue";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "50%";
        button.style.width = "32px";
        button.style.height = "32px";
        button.textContent = pageNumber;

        button.addEventListener("click", () => {
            page = pageNumber;
            getImages()
                .then(response => render(response.data))
                .catch(error => getError(error));
        });

        bthNum.appendChild(button);
    });
};

prev.addEventListener("click", () => {
    if (page > 1) {
        page -= 1;

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));
    } else {
        if (!messEndSearchResult) {
            messEndSearchResult = true;

            Notiflix.Notify.info("You're at the beginning of the search results.");

            prev.style.display = "none";
        }
    }
});

next.addEventListener("click", () => {
    if (maxPages > page) {
        page += 1;

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));
    } else {
        if (!messEndSearchResult) {
            messEndSearchResult = true;

            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

            next.style.display = "none";
        }
    }
});

(() => {
    window.addEventListener("scroll", () => {
        if (window.scrollY > window.innerHeight) {
            backToTop.hidden = false;
        } else {
            backToTop.hidden = true;
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
})();
