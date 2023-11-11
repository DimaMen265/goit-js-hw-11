import axios from "axios";
import Notiflix from "notiflix";
import throttle from "lodash.throttle";

import simpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import Swiper from "swiper";
import "swiper/swiper-bundle.css"

const form = document.querySelector('#search-form');
const searchInput = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');

const moreItems = document.querySelector('.more-items');
moreItems.style.backgroundColor = 'lightskyblue';
moreItems.style.color = 'white';
moreItems.style.border = 'none';
moreItems.style.borderRadius = '4px';
moreItems.style.padding = '4px 8px';
moreItems.style.display = 'none';

const doublePrev = document.querySelector('.double-prev');
doublePrev.style.backgroundColor = 'lightskyblue';
doublePrev.style.color = 'white';
doublePrev.style.border = 'none';
doublePrev.style.borderRadius = '4px';
doublePrev.style.padding = '4px 8px';

const prev = document.querySelector('.prev');
prev.style.backgroundColor = 'lightskyblue';
prev.style.color = 'white';
prev.style.border = 'none';
prev.style.borderRadius = '4px';
prev.style.padding = '4px 8px';

const next = document.querySelector('.next');
next.style.backgroundColor = 'lightskyblue';
next.style.color = 'white';
next.style.border = 'none';
next.style.borderRadius = '4px';
next.style.padding = '4px 8px';

const doubleNext = document.querySelector('.double-next');
doubleNext.style.backgroundColor = 'lightskyblue';
doubleNext.style.color = 'white';
doubleNext.style.border = 'none';
doubleNext.style.borderRadius = '4px';
doubleNext.style.padding = '4px 8px';

const backToTop = document.querySelector(".back-to-top");
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

form.addEventListener("submit", event => {
    event.preventDefault();

    removeChildren(gallery);

    page = 1;
    messEndSearchResult = false;

    if (searchInput.value.trim().length === 0) {
        Notiflix.Notify.failure("The search field must be filled!");
        return;
    };

    getImages()
        .then(responce => render(responce.data))
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

    moreItems.style.display = 'block';
    moreItems.style.margin = '0 auto 16px';
};

const removeChildren = container => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
    };
};

const getError = error => {
    error = Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    
    moreItems.style.display = 'none';
};

moreItems.addEventListener("click", () => {
    if (maxPages > page) {
        page += 1;

        getImages()
            .then(responce => render(responce.data))
            .catch(error => getError(error));
    } else {
        if (!messEndSearchResult) {
            messEndSearchResult = true;

            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");

            moreItems.style.display = 'none';
        };
    };
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
