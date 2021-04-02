var slide_index = 1;
var items_per_slide_width = 2;
var items_per_slide_height;
var items_per_slide;
update_items_per_slide();

function zoom(size) {
    if (size > 0 && items_per_slide_width != 1) {
        items_per_slide_width -= 1; /* Avoid zooming in to zero items */
    }
    else if (size < 0) {
        items_per_slide_width += 1;
    }
    update_items_per_slide();
}

// Resize image on '+' and '-' pressed
document.addEventListener('keydown', function (event) {
    if (event.code == "Plus" ||
        event.code == "Equal" && event.shiftKey == true) {
        zoom(1);
    }
    else if (event.code == "Minus") {
        zoom(-1);
    }
});

// Get the total height of an element, exclude main width if STRIP
function getTotalHeight(element, strip = false) {
    let variables = [strip ? 0 : window.getComputedStyle(element).height,
    window.getComputedStyle(element).borderTopWidth,
    window.getComputedStyle(element).borderBottomWidth,
    window.getComputedStyle(element).paddingTop,
    window.getComputedStyle(element).paddingBottom,
    window.getComputedStyle(element).marginTop,
    window.getComputedStyle(element).marginBottom];
    var result = 0;
    for (var i in variables) {
        let k = parseInt(variables[i]);
        if (!isNaN(k)) {
            result += k;
        }
    }
    return result;
}

// Get the total width of an element, exclude main width if STRIP
function getTotalWidth(element, strip = false) {
    let variables = [strip ? 0 : window.getComputedStyle(element).width,
    window.getComputedStyle(element).borderLeftWidth,
    window.getComputedStyle(element).borderRightWidth,
    window.getComputedStyle(element).paddingLeft,
    window.getComputedStyle(element).paddingRight,
    window.getComputedStyle(element).marginLeft,
    window.getComputedStyle(element).marginRight];
    var result = 0;
    for (var i in variables) {
        let k = parseInt(variables[i]);
        if (!isNaN(k)) {
            result += k;
        }
    }
    return result;
}

function update_items_per_slide() {
    /* Try to maintain this ratio, while avoiding becoming zero */
    items_per_slide_height = Math.max(Math.floor(items_per_slide_width * 2.0 / 3.0), 1);
    let prev_slides = items_per_slide * slide_index;
    items_per_slide = items_per_slide_height * items_per_slide_width;
    if (prev_slides != 0 && !isNaN(prev_slides)) {
        slide_index = Math.ceil(prev_slides / items_per_slide);
    }
    /* Viewport width */
    let docwidth = document.documentElement.clientWidth;
    /* Calculate width of the padding */
    let any_item = document.getElementsByClassName("slider-item")[0];
    let item_extrawidth = getTotalWidth(any_item, true);
    /* Width of every item */
    let width_per_item = docwidth / items_per_slide_width - item_extrawidth;
    /* Height of the header */
    let header = document.getElementsByTagName("header")[0];
    let header_height = getTotalHeight(header);
    let docheight = document.documentElement.clientHeight;
    /* A caption */
    let title = document.getElementsByTagName("figcaption")[0];
    let old_display = title.style.display;
    title.style.display = "block";
    let title_height = getTotalHeight(title);
    /* Restore its display options */
    title.style.display = old_display;
    /* Margin and padding of the figure */
    let item_other = getTotalHeight(document.getElementsByClassName("slider-item")[0], true);
    /* Height of every figure */
    let height_per_item = (docheight - header_height) / items_per_slide_height - title_height - item_other;
    var slides = document.getElementsByClassName("slider-item");
    for (var i = 0; i < slides.length; ++i) {
        slides[i].style.height = Math.floor(height_per_item) + "px";
        slides[i].style.width = Math.floor(width_per_item) + "px";
    }
    displaySlides(slide_index);
}

function getTextRenderedSize(text, font) {
    var tag = document.createElement('div');
    tag.style.position = 'absolute';
    tag.style.top = '-100%';
    tag.style.whiteSpace = 'nowrap';
    tag.style.font = font;
    tag.innerHTML = text;

    document.body.appendChild(tag);
    let result = [tag.clientWidth, tag.clientHeight];
    document.body.removeChild(tag);
    return result;
}

/* Resize all caption texts to fit the parent */
function fitCaptionText() {
    var items = document.getElementsByClassName("slider-title");
    for (var i = 0; i < items.length; ++i) {
        let parentWidth = items[i].clientWidth;
        let parentHeight = items[i].clientHeight;
        /* Filter out hidden elements */
        if (isNaN(parentWidth) || isNaN(parentHeight) || parentWidth == 0 || parentHeight == 0) {
            continue;
        }
        /* First resize tp maximum */
        items[i].style.fontSize = "100%";
        var lastWidth = 0;
        var lastHeight = 0;
        /* Change font size until it fits */
        while (true) {
            let [newWidth, newHeight] = getTextRenderedSize(items[i].innerText, window.getComputedStyle(items[i]).font);
            if ((newWidth == lastWidth || newWidth < parentWidth) && (newHeight == lastHeight || newHeight < parentHeight)) {
                console.log(items[i].innerText, lastWidth, newHeight, lastHeight);
                break;
            }
            lastWidth = newWidth;
            lastHeight = newHeight;
            items[i].style.fontSize = (parseInt(window.getComputedStyle(items[i]).fontSize) - 1) + "px";
        }
    }
}

function nextSlide(n) {
    displaySlides(slide_index += n);
}

function currentSlide(n) {
    displaySlides(slide_index = n);
}

function displaySlides(n) {
    var i, j;
    var slides = document.getElementsByClassName("slider-item");
    /* Loop back if overflow/underflow */
    if (n > Math.ceil(slides.length / items_per_slide)) {
        slide_index = 1;
    }
    if (n < 1) {
        slide_index = Math.ceil(slides.length / items_per_slide);
    }
    for (i = 0; i < (slides.length / items_per_slide); ++i) {
        var display;
        if (i == slide_index - 1)
            display = "block";
        else
            display = "none";
        for (j = 0; j < items_per_slide; ++j) {
            if (i * items_per_slide + j < slides.length) {
                slides[i * items_per_slide + j].style.display = display;
            }
        }
    }
    fitCaptionText();
}
