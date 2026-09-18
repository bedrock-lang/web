const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/bedrock.ico");
  eleventyConfig.addPassthroughCopy("src/images");

  const md = markdownIt({ html: true }).use(markdownItAnchor, {
    slugify: (s) =>
      String(s)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
  });
  eleventyConfig.setLibrary("md", md);

  // Blog posts: every .md file under src/blog/ is a "post".
  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByGlob("src/blog/*.md").sort(
      (a, b) => a.date - b.date
    )
  );

  eleventyConfig.addFilter("byRole", (list, role) =>
    (list || []).filter((item) => item.role === role)
  );

  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("headings", (html) => {
    const out = [];
    const re = /<h([23])[^>]*\sid="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
    let match;
    while ((match = re.exec(html || "")) !== null) {
      out.push({
        level: Number(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]+>/g, ""),
      });
    }
    return out;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
  };
};
