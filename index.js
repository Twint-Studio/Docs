const marked = require('marked');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

const srcPath = path.join(__dirname, 'pages');
const templatesPath = path.join(__dirname, 'templates');

const layout = fs.readFileSync(path.join(templatesPath, 'layout.html'), 'utf-8');

function getFileList(dirName, filter, depth = 0) {
    let files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });

    for (const item of items) {
        const itemPath = path.join(dirName, item.name);

        if (item.isDirectory() && filter.recursively) {
            if (depth >= filter.maxDepth) continue;
            if (filter.exclusion && filter.exclusion.includes(item.name)) continue;

            const subFiles = getFileList(itemPath, filter, depth + 1);
            files = [...files, ...subFiles];
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
    const outputDir = path.join('dist', subfolders ? `wiki/${subfolders}` : "");
    const outputPath = path.join(outputDir, htmlFileName);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, html);
    console.log(`HTML file saved to: ${outputPath}`);
}

const documents = getFileList(srcPath, { type: ".md", recursively: true });

documents.forEach(file => {
    const filePath = path.join(file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const { metadata, body } = extractMetadataAndContent(content);
    const parsedMetadata = yaml.load(metadata);

    let html = layout;

    const includeNavBar = !/\/pages\/index\.md$/.test(file);

    const navigationBar = includeNavBar
        ? `
            <div class="nav-item left">
                <a href="{{ home }}">Home</a>
                <a href="{{ started }}">Get Started</a>
                <a href="{{ navigation }}">Site Navigation</a>
                <a href="{{ faq }}">FAQ</a>
            </div>`
        : '';

    html = html.replace('{{ navigationBar }}', navigationBar);

    if (parsedMetadata && typeof parsedMetadata === 'object') {
        Object.entries(parsedMetadata).forEach(([key, value]) => {
            const placeholder = `{{ ${key} }}`;
            html = html.split(placeholder).join(value);
        });
    }

    html = html.replace('{{ content }}', marked.parse(body));

    generateHtmlOutput(file, html);
});

console.log('Static site generated successfully!');
