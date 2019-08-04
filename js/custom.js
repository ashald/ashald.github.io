// Creates Captions from Alt tags
document.querySelectorAll(".post-wrap p > img").forEach(function(img) {
    let figure = document.createElement("figure");
    img.parentElement.insertBefore(figure, img);
    figure.appendChild(img);

    let side = img.getAttribute("src").split("#")[1];
    if (side) {
        figure.classList.add(side);
    }

    let alt = img.getAttribute("alt");
    if (alt) {
        let caption = document.createElement("figcaption");
        caption.textContent = alt;
        figure.appendChild(caption);
    }
});

function fixPrompts(code) {
    // Wrap text into spans
    function wrapChildTextNodes(node) {
        if (node.data) { // it's a text node
            let lines = node.data.match(/.+\n?|\n/g);
            lines.forEach(function(line) {
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

window.addEventListener("load", function(event) {
    document.querySelectorAll("pre code.language-bash").forEach(fixPrompts);
});

// document.querySelectorAll(".post-wrap h1, .post-wrap h2, .post-wrap h3, .post-wrap h4, .post-wrap h5, .post-wrap h6")
//    wrap into links