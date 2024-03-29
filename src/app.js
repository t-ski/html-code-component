const devConfig = {
    templateIdentifierAttribute: "code-component--template"
};


const { readFileSync, writeFileSync, existsSync } = require("fs");


const templateMarkup = `
    <div class="lines"></div>
    <div class="edit">
        <div class="edit-in" contenteditable data-nosnippet></div>
        <code class="edit-out">
            <slot></slot>
        </code>
    </div>
    <span class="copy">Copy</span>
    <!-- © t-ski@GitHub -->
`.trim();


function insertMarkup(sourceMarkup, insertMarkup) {
    let insertIndex = sourceMarkup.search(/\s*\n?\s*< *(script|\/ *(head|body))( ([^<]|\s)*>|\s|>)/i);

    if(insertIndex <= 0) return sourceMarkup;

    const indentation = (sourceMarkup.slice(insertIndex).match(/ +/) ?? [""])[0];

    return `${sourceMarkup.slice(0, insertIndex)}\n${indentation}${insertMarkup}${sourceMarkup.slice(insertIndex)}`;
}

function renderTemplate(markup, styles) {
    markup = markup
    .replace(new RegExp(`\\s*\\n?\\s*<template ${devConfig.templateIdentifierAttribute}>((?!<\\/template>)(.|\\s))+<\\/template>`, "i"), "");
    
    return insertMarkup(markup, `
        <template ${devConfig.templateIdentifierAttribute}>
            ${templateMarkup}
            ${styles
            ? `<style>${styles}</style>`
            : ""}
        </template>
    `.replace(/\n|\s{2,}/g, ""));
}

/* function renderModule(markup, theme = "min") {
    const themeModulePath = join(__dirname, `./codecomponent.${theme}.js`);

    if(!existsSync(themeModulePath)) throw new ReferenceError(`Referenced theme does not exist '${theme}'`);
    
    const themeModuleScript = String(readFileSync(themeModulePath));

    return insertMarkup(markup, `
        <script>
            ${themeModuleScript}
        </script>
    `);
} */


module.exports.render = function(config = {}) {
    if(!config.sourcePath && !config.sourceCode) throw new ReferenceError("Missing source path or code configuration");

    let markup = config.sourcePath
    ? String(readFileSync(config.sourcePath))
    : config.sourceCode;
    
    markup = renderTemplate(markup, config.styles);

    /* markup = renderModule(markup, config.theme); */

    (config.distCallback instanceof Function)
    && config.distCallback(markup);

    config.distPath
    && writeFileSync(config.distPath, markup);

    return markup;
}