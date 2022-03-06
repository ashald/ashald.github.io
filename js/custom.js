window.addEventListener("load", function (event) {
    Array.from(document.querySelector("article .post-wrap").children).forEach(makeGalleries);
});

function makeGalleries(block) {
    if (isVideo(block)) {
        resizeVideo(block);
    } else if (allChildrenSingleType(block, "IMG")) {
        if (block.children.length > 1) {
            createOneRowGallery(block);
        } else {
            singleImage(block);
        }
    }
}

function createOneRowGallery(block) {
    let rows = splitImagesIntoRows(block.children);
    let figure = document.createElement("figure");
    figure.classList.add("kg-card", "kg-gallery-card", "kg-width-wide");
    block.parentNode.insertBefore(figure, block);

    let galleryContainer = document.createElement("div");
    galleryContainer.classList.add("kg-gallery-container");
    figure.appendChild(galleryContainer);


    rows.forEach(rowImages => {
        let rowContainer = document.createElement("div");
        rowContainer.classList.add("kg-gallery-row");
        galleryContainer.appendChild(rowContainer);

        rowImages.forEach(img => {
            let imgContainer = document.createElement("div");
            imgContainer.classList.add("kg-gallery-image");
            imgContainer.style.flex = img.width / img.height + " 1 0%";
            rowContainer.appendChild(imgContainer);

            imgContainer.appendChild(img);
        });
    });

    block.parentNode.removeChild(block);
}

function splitImagesIntoRows(images) {
    let result = [[]];

    for (let img of images) {
        result[result.length-1].push(img);
        if (img.src.split("#")[1] === "wrap") {
            result.push([]);
        }
    }

    if (result[result.length-1].length === 0) {
        result.pop()
    }

    return result;
}

function singleImage(block) {
    let img = block.firstChild;

    let figure = document.createElement("figure");
    figure.appendChild(img);

    figure.classList.add("kg-card", "kg-image-card");
    block.parentNode.insertBefore(figure, block);
    block.parentNode.removeChild(block);

    let modifier = img.src.split("#")[1] || "wide";
    switch (modifier) {
        case "left":
        case "right":
            figure.classList.add(modifier);
            break;
        case "full":
        case "wide":
            figure.classList.add("kg-width-" + modifier);
            break;
    }

    if (img.alt) {
        let caption = document.createElement("figcaption");
        caption.textContent = img.alt;
        figure.appendChild(caption);
        figure.classList.add("kg-card-hascaption");
    }
}

function resizeVideo(block) {
    block.classList.add("kg-gallery-container");

    let container = document.createElement("div");
    container.classList.add("kg-card", "kg-gallery-card", "kg-width-wide");
    block.parentNode.insertBefore(container, block);
    container.appendChild(block);
}

function allChildrenSingleType(element, type) {
    return Array.from(element.childNodes).every(node => node.tagName === type || node.data && node.data.trim().length === 0);
}

function isVideo(element) {
    return element.tagName === "FIGURE" && element.querySelector("iframe") !== undefined;
}

// Fix Bash prompts
window.addEventListener("load", function (event) {
    document.querySelectorAll("pre code.language-bash").forEach(fixPrompts);
});

function fixPrompts(code) {
    // Wrap text into spans
    function wrapChildTextNodes(node) {
        if (node.data) { // it's a text node
            let lines = node.data.match(/.+\n?|\n/g);
            lines.forEach(function (line) {
                let newSpan = document.createElement('span');
                newSpan.appendChild(document.createTextNode(line));
                node.parentNode.insertBefore(newSpan, node);
            });
            node.remove();
        } else {
            Array.from(node.childNodes).forEach(wrapChildTextNodes);
        }
    }

    Array.from(code.childNodes).forEach(wrapChildTextNodes);

    // Make prompt spans unselectable
    var newLine = true;

    function excludePrompts(node) {
        var nodeText = node.innerText ? node.innerText : "";
        if (node.innerText && node.innerText.includes('\n')) {
            Array.from(node.childNodes).forEach(excludePrompts);
        }
        if (newLine) {
            if (nodeText.startsWith("$ ")) {
                if (node.innerText.length > 2) {
                    let extension = node.cloneNode(true);
                    extension.innerText = extension.innerText.slice(2);
                    node.parentNode.insertBefore(extension, node.nextSibling);
                }
                node.innerText = "";
                node.setAttribute("data-prompt", "$ ");
                node.classList.add("prompt");
                newLine = false;
            } else if (nodeText.startsWith(">")) {
                if (nodeText.length === 1 && node.nextSibling && node.nextSibling.innerText && node.nextSibling.innerText.startsWith(" ")) {
                    node.innerText += " ";
                    node.nextSibling.innerText = node.nextSibling.innerText.slice(1);
                } else if (nodeText.length > 2) {
                    let extension = node.cloneNode(true);
                    extension.innerText = extension.innerText.slice(2);
                    node.parentNode.insertBefore(extension, node.nextSibling);
                }
                node.innerText = "";
                node.setAttribute("data-prompt", "> ");
                node.classList.add("prompt");
                newLine = false;
            }
        }
        if (nodeText.endsWith("\n")) {
            newLine = true;
        }
    }

    Array.from(code.childNodes).forEach(excludePrompts);
}
