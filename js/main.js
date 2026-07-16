/*
========================================
MAIN JAVASCRIPT - main.js
========================================
This file handles loading your content
(articles, blog posts, about info) and
displaying it on the pages.

You don't need to edit this file unless
you want to change how things work!
========================================
*/


/*
========================================
CONFIGURATION
========================================
List all your content files here.
When you add a new article or post,
add its filename to these lists!
========================================
*/

// List all your article files here (without the .json extension)
// Example: ['my-first-article', 'photography-essay', 'travel-writing']
const ARTICLE_FILES = [
    // Add your writing filenames here (without .json extension)
    // Example: 'my-first-piece', 'photography-essay'
];

// List all your blog post files here (without the .json extension)
// Example: ['my-first-post', 'thoughts-on-writing', 'new-project']
const POST_FILES = [
    'questions-for-maggie-cnossen',
    'chinese-marching-band',
    'dream-job',
    'questions-for-alec',
    'just-passing-through',
    'smoking-sections',
    'questions-for-myself'
];


/*
========================================
HELPER FUNCTIONS
========================================
*/

// Fetch a JSON file and return its contents
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Could not load ${path}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading content:', error);
        return null;
    }
}

// Format a date string nicely (e.g., "January 15, 2025")
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get URL parameters (for loading specific articles/posts)
function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Convert simple text with line breaks to HTML paragraphs
function textToHTML(text) {
    if (!text) return '';

    // Split by double line breaks for paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map(para => {
        // Check if this is an image tag
        if (para.trim().startsWith('[IMAGE:')) {
            const match = para.match(/\[IMAGE:\s*(.+?)\]/);
            if (match) {
                const imagePath = match[1].trim();
                // Check for caption
                const captionMatch = para.match(/\[CAPTION:\s*(.+?)\]/);
                let html = `<img src="${imagePath}" alt="">`;
                if (captionMatch) {
                    html += `<p class="image-caption">${captionMatch[1]}</p>`;
                }
                return html;
            }
        }

        // Check if this is a video tag
        if (para.trim().startsWith('[VIDEO:')) {
            const match = para.match(/\[VIDEO:\s*(.+?)\]/);
            if (match) {
                const videoPath = match[1].trim();
                return `<video controls><source src="${videoPath}" type="video/mp4">Your browser does not support video.</video>`;
            }
        }

        // Check if this is a heading
        if (para.trim().startsWith('## ')) {
            return `<h2>${para.replace('## ', '')}</h2>`;
        }
        if (para.trim().startsWith('### ')) {
            return `<h3>${para.replace('### ', '')}</h3>`;
        }

        // Check if this is a blockquote
        if (para.trim().startsWith('> ')) {
            return `<blockquote>${para.replace('> ', '')}</blockquote>`;
        }

        // Check if this is a bullet list (lines starting with -)
        if (para.trim().startsWith('- ')) {
            const items = para.split('\n').filter(line => line.trim().startsWith('- '));
            const listItems = items.map(item => `<li>${item.trim().substring(2)}</li>`).join('\n');
            return `<ul>${listItems}</ul>`;
        }

        // Regular paragraph
        return `<p>${para}</p>`;
    }).join('\n');
}


/*
========================================
HOMEPAGE FUNCTIONS
========================================
*/

// Load featured articles for the homepage
async function loadFeaturedArticles() {
    const container = document.getElementById('featured-articles');
    if (!container) return;

    container.innerHTML = ''; // Clear loading message

    // Load all articles
    const articles = [];
    for (const filename of ARTICLE_FILES) {
        const article = await fetchJSON(`content/writing/${filename}.json`);
        if (article) {
            article.id = filename;
            articles.push(article);
        }
    }

    // Filter to only featured articles, or show first 3 if none are marked featured
    let featured = articles.filter(a => a.featured);
    if (featured.length === 0) {
        featured = articles.slice(0, 3);
    }

    // Display articles
    featured.forEach(article => {
        container.innerHTML += createArticleCard(article);
    });

    if (featured.length === 0) {
        container.innerHTML = '<p class="loading">No articles yet. Add some to the content/writing folder!</p>';
    }
}

// Load recent blog posts for the homepage
async function loadRecentPosts() {
    const container = document.getElementById('recent-posts');
    if (!container) return;

    container.innerHTML = ''; // Clear loading message

    // Load all posts
    const posts = [];
    for (const filename of POST_FILES) {
        const post = await fetchJSON(`content/posts/${filename}.json`);
        if (post) {
            post.id = filename;
            posts.push(post);
        }
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Show only the 3 most recent
    const recent = posts.slice(0, 3);

    // Display posts
    recent.forEach(post => {
        container.innerHTML += createPostPreview(post);
    });

    if (recent.length === 0) {
        container.innerHTML = '<p class="loading">No blog posts yet. Add some to the content/posts folder!</p>';
    }
}


/*
========================================
ARTICLES PAGE FUNCTIONS
========================================
*/

// Load all articles for the articles listing page
async function loadAllArticles() {
    const container = document.getElementById('all-articles');
    if (!container) return;

    container.innerHTML = '';

    const articles = [];
    for (const filename of ARTICLE_FILES) {
        const article = await fetchJSON(`content/writing/${filename}.json`);
        if (article) {
            article.id = filename;
            articles.push(article);
        }
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    articles.forEach(article => {
        container.innerHTML += createArticleCard(article);
    });

    if (articles.length === 0) {
        container.innerHTML = '<p class="loading">No articles yet. Add some to the content/writing folder!</p>';
    }
}

// Load a single article for the article detail page
async function loadSingleArticle() {
    const container = document.getElementById('article-content');
    if (!container) return;

    const articleId = getURLParameter('id');
    if (!articleId) {
        container.innerHTML = '<p>Article not found. <a href="writing.html">Back to writing</a></p>';
        return;
    }

    const article = await fetchJSON(`content/writing/${articleId}.json`);

    if (!article) {
        container.innerHTML = '<p>Article not found. <a href="writing.html">Back to writing</a></p>';
        return;
    }

    // Update page title
    document.title = `${article.title} | Your Name`;

    // Build the article HTML
    let html = `
        <header class="content-header">
            <h1 class="content-title">${article.title}</h1>
            <p class="content-meta">${formatDate(article.date)}</p>
        </header>
    `;

    // Add featured image if present
    if (article.image) {
        html += `<img src="${article.image}" alt="${article.title}" class="content-featured-image">`;
    }

    // Add the article body
    html += `<div class="content-body">${textToHTML(article.body)}</div>`;

    container.innerHTML = html;
}

// Create an article card HTML
function createArticleCard(article) {
    const imageHTML = article.image
        ? `<img src="${article.image}" alt="${article.title}" class="article-card-image">`
        : `<div class="article-card-image"></div>`;

    return `
        <a href="article.html?id=${article.id}" class="article-card">
            ${imageHTML}
            <h3 class="article-card-title">${article.title}</h3>
            <p class="article-card-excerpt">${article.excerpt || ''}</p>
        </a>
    `;
}


/*
========================================
BLOG PAGE FUNCTIONS
========================================
*/

// Load all posts for the blog page (continuous scroll layout)
async function loadAllPosts() {
    const container = document.getElementById('all-posts');
    if (!container) return;

    container.innerHTML = '';

    const posts = [];
    for (const filename of POST_FILES) {
        const post = await fetchJSON(`content/posts/${filename}.json`);
        if (post) {
            post.id = filename;
            posts.push(post);
        }
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display full content of each post in a continuous scroll
    posts.forEach(post => {
        container.innerHTML += createFullPostBlock(post);
    });

    if (posts.length === 0) {
        container.innerHTML = '<p class="loading">No blog posts yet. Add some to the content/posts folder!</p>';
    }
}

// Create a full post block with cascading layout
function createFullPostBlock(post) {
    // Position patterns for cascading effect
    const positions = ['left', 'right', 'center', 'wide-left', 'wide-right'];
    const imgShapes = ['', 'tall', 'wide', 'square'];

    // Get pseudo-random but consistent positions based on post title
    const seed = post.title.length;
    const getPos = (index) => positions[(seed + index) % positions.length];
    const getShape = (index) => imgShapes[(seed + index) % imgShapes.length];

    let html = '<article class="blog-post-block"><div class="blog-post-inner">';

    // Determine format: auto-detect Q&A from title, or use format field
    const isQA = post.title.includes('Questions for') || post.format === 'qa';
    const isPoem = post.format === 'poem' || post.format === 'centered';

    if (isPoem) {
        // Poem format: title on left, body centered with line breaks preserved
        html += '<div class="blog-block left">';
        html += '<div class="blog-post-content">';
        html += `<h2 class="blog-post-title">${post.title}</h2>`;
        html += '</div></div>';

        html += '<div class="blog-centered">';
        html += '<div class="blog-post-content">';
        const formattedBody = post.body.split('\n\n').map(stanza => {
            return '<p>' + stanza.split('\n').join('<br>') + '</p>';
        }).join('');
        html += `<div class="blog-post-body">${formattedBody}</div>`;
        html += '</div></div>';
    } else if (isQA) {
        // Q&A format: title top right, then Q&A text and image side-by-side below
        html += `<div class="blog-block ${getPos(0)}">`;
        html += `<div class="blog-placeholder-img ${getShape(0)}"></div>`;
        html += '</div>';

        // Title block - right aligned
        html += '<div class="blog-block right">';
        html += '<div class="blog-post-content">';
        html += `<h2 class="blog-post-title">${post.title}</h2>`;
        html += '</div></div>';

        // Q&A text and image side-by-side, top-aligned
        html += '<div class="qa-content-row">';

        // Left: Q&A content
        html += '<div class="qa-text-col">';
        html += '<div class="blog-post-content qa-content">';

        const qaPairs = post.body.split('\n\n');
        qaPairs.forEach(pair => {
            const lines = pair.split('\n');
            if (lines.length >= 2) {
                html += `<div class="qa-pair">`;
                html += `<p class="qa-question">${lines[0]}</p>`;
                html += `<p class="qa-answer">${lines[1]}</p>`;
                html += `</div>`;
            } else if (lines.length === 1 && lines[0].trim()) {
                html += `<p>${lines[0]}</p>`;
            }
        });

        html += '</div></div>';

        // Right: Image
        if (post.image) {
            html += '<div class="qa-image-col">';
            html += `<img src="${post.image}" alt="" class="qa-image">`;
            html += '</div>';
        }

        html += '</div>';
    } else {
        // Default format: title top right, text left, image right (top-aligned)
        html += `<div class="blog-block ${getPos(0)}">`;
        html += `<div class="blog-placeholder-img ${getShape(0)}"></div>`;
        html += '</div>';

        // Title block on right
        html += '<div class="blog-block right">';
        html += '<div class="blog-post-content">';
        html += `<h2 class="blog-post-title">${post.title}</h2>`;
        html += '</div></div>';

        // Body text and image side by side, top-aligned
        html += '<div class="essay-content">';
        html += '<div class="essay-text">';
        html += `<div class="blog-post-body">${textToHTML(post.body)}</div>`;
        html += '</div>';

        if (post.image) {
            html += '<div class="essay-image-col">';
            html += `<img src="${post.image}" alt="" class="essay-image">`;
            html += '</div>';
        }
        html += '</div>';
    }

    html += '</div></article>';
    html += '<div class="blog-divider"></div>';

    return html;
}

// Load a single post for the post detail page
async function loadSinglePost() {
    const container = document.getElementById('post-content');
    if (!container) return;

    const postId = getURLParameter('id');
    if (!postId) {
        container.innerHTML = '<p>Post not found. <a href="blog.html">Back to blog</a></p>';
        return;
    }

    const post = await fetchJSON(`content/posts/${postId}.json`);

    if (!post) {
        container.innerHTML = '<p>Post not found. <a href="blog.html">Back to blog</a></p>';
        return;
    }

    // Update page title
    document.title = `${post.title} | Your Name`;

    // Build the post HTML
    let html = `
        <header class="content-header">
            <h1 class="content-title">${post.title}</h1>
        </header>
    `;

    // Add featured image if present
    if (post.image) {
        html += `<img src="${post.image}" alt="${post.title}" class="content-featured-image">`;
    }

    // Add the post body
    html += `<div class="content-body">${textToHTML(post.body)}</div>`;

    container.innerHTML = html;
}

// Create a post preview HTML (for homepage)
function createPostPreview(post) {
    return `
        <a href="post.html?id=${post.id}" class="post-preview">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-excerpt">${post.excerpt || ''}</p>
        </a>
    `;
}

// Create a full post preview HTML (for blog page, with optional image)
function createPostPreviewFull(post) {
    if (post.image) {
        return `
            <a href="post.html?id=${post.id}" class="post-preview post-preview-with-image">
                <img src="${post.image}" alt="${post.title}" class="post-preview-image">
                <div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt || ''}</p>
                </div>
            </a>
        `;
    }

    return `
        <a href="post.html?id=${post.id}" class="post-preview">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-excerpt">${post.excerpt || ''}</p>
        </a>
    `;
}


/*
========================================
ABOUT PAGE FUNCTION
========================================
*/

async function loadAboutPage() {
    const container = document.getElementById('about-content');
    if (!container) return;

    const about = await fetchJSON('content/about.json');

    if (!about) {
        container.innerHTML = '<p>About content not found. Create a content/about.json file!</p>';
        return;
    }

    // Update page title
    document.title = about.name ? `About | ${about.name}` : 'About';

    // Build the about page HTML
    let html = '';

    // Add profile image if present
    if (about.image) {
        html += `<img src="${about.image}" alt="${about.name}" class="about-image">`;
    }

    html += '<div class="about-content">';
    if (about.name) {
        html += `<h1>${about.name}</h1>`;
    }
    html += textToHTML(about.bio);

    // Add contact links if present
    if (about.links && about.links.length > 0) {
        html += '<div class="contact-links">';
        about.links.forEach(link => {
            html += `<a href="${link.url}" target="_blank">${link.label}</a>`;
        });
        html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
}
