const hljs = require('highlight.js');
const marked = require('marked');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

const srcPath = path.join(__dirname, 'pages');
const templatesPath = path.join(__dirname, 'templates');
const layout = fs.readFileSync(path.join(templatesPath, 'layout.html'), 'utf-8');

function getFileList(dirName, filter, depth = 0) {
    const items = fs.readdirSync(dirName, { withFileTypes: true });
    let files = [];

    for (const item of items) {
        const itemPath = path.join(dirName, item.name);

        if (item.isDirectory() && filter.recursively) {
            if (depth >= filter.maxDepth || (filter.exclusion && filter.exclusion.includes(item.name))) continue;

            const subFiles = getFileList(itemPath, filter, depth + 1);
            files.push(...subFiles);
        } else if (item.name.endsWith(filter.type)) files.push(itemPath);
    }

    return files;
}

function extractMetadataAndContent(content) {
    const metaRegex = /^---([\s\S]*?)---/;
    const match = content.match(metaRegex);

    if (match) {
        const metadata = match[1].trim();
        const body = content.slice(match[0].length).trim();
        return { metadata, body };
    }

    return { metadata: '', body: content.trim() };
}

function generateHtmlOutput(file, html) {
    const relativePath = path.relative(process.cwd(), file);
    const subfolders = path.dirname(relativePath).replace(/(^|\/)pages/, '');

    const htmlFileName = path.basename(file, '.md') + '.html';
    const outputDir = path.join('dist', subfolders);
    const outputPath = path.join(outputDir, htmlFileName);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, html);

    console.log(`HTML file saved to: ${outputPath}`);
}

function extensionTOC(markdown) {
    const codeBlockRegex = /(```.*?```|`[^`]*`)/gs;
    const headingRegex = /^(#+)\s+(.*)$/gm;

    function generateTOC(markdown) {
        const headings = [];
        let match;
        while ((match = headingRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            const text = match[2];
            headings.push({ level, text });
        }

        let tocMarkdown = '';
        headings.forEach(heading => {
            const indent = ' '.repeat((heading.level - 1) * 2);
            tocMarkdown += `${indent}- [${heading.text}](#${heading.text.replace(/\s+/g, '-').toLowerCase()})\n`;
        });

        return tocMarkdown;
    }

    return markdown.replace(/\[TOC\]/gi, '[TOC]')
        .replace(/\[TOC\]/g, (match, offset, string) => {
            const isInCodeBlock = codeBlockRegex.test(string.slice(0, offset));
            return isInCodeBlock ? generateTOC(markdown) : match;
        });
}

const renderer = new marked.Renderer();

renderer.image = function(href, title, text) {
    if (/youtube\.com\/watch\?v=([^\s]+)/.test(href) || /youtu\.be\/([^\s]+)/.test(href)) {
        const videoId = href.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|[^#]*[?&]v=|youtu\.be\/)([^\s&]+))/)[1];
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (/vimeo\.com\/([^\s]+)/.test(href)) {
        const videoId = href.match(/vimeo\.com\/([^\s]+)/)[1];
        return `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    } else if (/\.(mp4)$/i.test(href)) return `<video controls><source src="${href}" type="video/mp4">Your browser does not support the video tag.</video>`;
    else if (/\.(mp3)$/i.test(href)) return `<audio controls><source src="${href}" type="audio/mpeg">Your browser does not support the audio tag.</audio>`;

    return marked.Renderer.prototype.image.apply(this, arguments);
};

renderer.code = function(code, language) {
    if (language && hljs.getLanguage(language)) return `<pre><code class="hljs ${language}">${hljs.highlight(code, { language }).value}</code></pre>`;
    else return `<pre><code>${code}</code></pre>`;
};

renderer.heading = function (text, level) {
    const anchor = text.replace(/\s+/g, '-').toLowerCase();
    return `<h${level} id="${anchor}"><a href="#${anchor}">#</a> ${text}</h${level}>`;
};

marked.setOptions({ renderer: renderer });

const documents = getFileList(srcPath, { type: ".md", recursively: true });
for (const file of documents) {
    const filePath = path.join(file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const { metadata, body } = extractMetadataAndContent(content);
    const parsedMetadata = yaml.load(metadata) || {};

    let html = layout;

    for (const [key, value] of Object.entries(parsedMetadata)) {
        const placeholder = `{{ ${key} }}`;
        html = html.split(placeholder).join(value);
    }

    html = html.replace('{{ content }}', marked.parse(extensionTOC(body)));

    generateHtmlOutput(file, html);
}

console.log('Static site generated successfully!');
