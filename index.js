const fs = require('fs').promises;
const marked = require('marked');
const yaml = require('js-yaml');
const path = require('path');

const srcPath = path.join(__dirname, 'pages');
const templatesPath = path.join(__dirname, 'templates');
const layout = fs.readFileSync(path.join(templatesPath, 'layout.html'), 'utf-8');

async function getFileList(dirName, filter, depth = 0) {
    const items = await fs.readdir(dirName, { withFileTypes: true });
    let files = [];

    for (const item of items) {
        const itemPath = path.join(dirName, item.name);

        if (item.isDirectory() && filter.recursively) {
            if (depth >= filter.maxDepth || (filter.exclusion && filter.exclusion.includes(item.name))) continue;

            const subFiles = await getFileList(itemPath, filter, depth + 1);
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

async function generateHtmlOutput(file, html) {
    const relativePath = path.relative(process.cwd(), file);
    const subfolders = path.dirname(relativePath).replace(/(^|\/)pages/, '');

    const htmlFileName = path.basename(file, '.md') + '.html';
    const outputDir = path.join('dist', subfolders);
    const outputPath = path.join(outputDir, htmlFileName);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, html);

    console.log(`HTML file saved to: ${outputPath}`);
}

(async () => {
    const documents = await getFileList(srcPath, { type: ".md", recursively: true });

    for (const file of documents) {
        const filePath = path.join(file);
        const content = await fs.readFile(filePath, 'utf-8');

        const { metadata, body } = extractMetadataAndContent(content);
        const parsedMetadata = yaml.load(metadata) || {};

        let html = layout;

        const includeNavBar = !/\/pages\/index\.md$/.test(file);
        const navigationBar = includeNavBar ? `
            <div class="nav-item left">
                <a href="{{ home }}">Home</a>
                <a href="{{ started }}">Get Started</a>
                <a href="{{ navigation }}">Site Navigation</a>
                <a href="{{ faq }}">FAQ</a>
            </div>` : '';

        html = html.replace('{{ navigationBar }}', navigationBar);

        for (const [key, value] of Object.entries(parsedMetadata)) {
            const placeholder = `{{ ${key} }}`;
            html = html.split(placeholder).join(value);
        }

        html = html.replace('{{ content }}', marked.parse(body));

        await generateHtmlOutput(file, html);
    }

    console.log('Static site generated successfully!');
})();
