import axios from "axios";
import Notiflix from "notiflix";

import simpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

const pagination = document.querySelector(".pagination");
pagination.classList.add("visually-hidden");

const prev = document.querySelector('.prev');

const next = document.querySelector('.next');

const backToTop = document.querySelector('.back-to-top');
backToTop.hidden = true;

let countPage = 40;
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
    };

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
    };

    if (items.totalHits <= countPage) {
        pagination.classList.add("visually-hidden");
    } else {
        pagination.classList.remove("visually-hidden");
    };
};

const removeChildren = container => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    };
};

const getError = error => {
    error = Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");

    pagination.classList.add("visually-hidden")
};

prev.addEventListener("click", () => {
    if (page > 1) {
        page -= 1;

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));

        lightbox.refresh();
    } else {
        Notiflix.Notify.info("You're at the beginning of the search results.");
        
        prev.classList.add("visually-hidden") 
    };

    next.classList.remove("visually-hidden");
});

next.addEventListener("click", () => {
    if (maxPages > page) {
        page += 1;

        getImages()
            .then(response => render(response.data))
            .catch(error => getError(error));
        
        lightbox.refresh();
    } else if (!messEndSearchResult) {
        messEndSearchResult = true;

        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

        next.classList.add("visually-hidden");
    };
    
    prev.classList.remove("visually-hidden");
});

(() => {
    window.addEventListener("scroll", () => {
        if (window.scrollY > window.innerHeight) {
            backToTop.hidden = false;
        } else {
            backToTop.hidden = true;
        };
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
})();
