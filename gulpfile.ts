if (!process.env.NODE_ENV) process.env.NODE_ENV = "production";

import { Assets, GulpHelper, Pug, Rollup, RollupPlugins as RP, Sass, setSeriesFunction, task } from "@keupoz/buildtools";
import { create as bs_create } from "browser-sync";
import { emptyDirSync } from "fs-extra";
import { parallel, series } from "gulp";

const PRODUCTION = process.env.NODE_ENV === "production",

    NAME = "ColorWheel2",

    DEMOSRC = "demo",
    DEMOOUT = "docs",

    LIBSRC = "src",
    LIBOUT = "dist";

const DEMO = {
    assets: new Assets({ inputDir: `${DEMOSRC}/assets`, outputDir: `${DEMOOUT}/assets` }, !PRODUCTION),

    rollup: new Rollup({
        input: `${DEMOSRC}/scripts/main.ts`,
        output: {
            compact: PRODUCTION,
            format: "iife",
            file: `${DEMOOUT}/app.js`
        },
        plugins: [
            RP.get("commonjs")(),
            RP.get("json")(),
            RP.get("typescript")(),
            RP.get("uglify", PRODUCTION)()
        ],
        treeshake: PRODUCTION
    }, !PRODUCTION),

    sass: new Sass({
        file: `${DEMOSRC}/styles/index.sass`,
        outFile: `${DEMOOUT}/index.css`,
        outputStyle: PRODUCTION ? "compressed" : "expanded",
    }, !PRODUCTION),

    pug: new Pug({
        filename: `${DEMOSRC}/index.pug`,
        output: `${DEMOOUT}/index.html`
    }, !PRODUCTION)
};

const LIB = {
    js: new Rollup({
        input: `${LIBSRC}/${NAME}.ts`,
        output: PRODUCTION ? [
            {
                name: NAME,
                file: `${LIBOUT}/${NAME}.js`,
                format: "umd"
            }, {
                name: NAME,
                file: `${LIBOUT}/${NAME}.min.js`,
                compact: true,
                format: "umd"
            }, {
                file: `${LIBOUT}/${NAME}.es.js`,
                format: "es"
            }
        ] : {
                name: NAME,
                file: `${LIBOUT}/${NAME}.js`,
                format: "umd"
            },
        plugins: [
            RP.get("json")(),
            RP.get("typescript")(),
            RP.get("uglify", PRODUCTION)()
        ],
        treeshake: PRODUCTION
    }, !PRODUCTION),

    dts: new Rollup({
        input: `${LIBSRC}/${NAME}.ts`,
        output: {
            file: `${LIBOUT}/${NAME}.d.ts`,
            format: "es"
        },
        plugins: [
            RP.get("dts").default()
        ]
    }, false)
};

setSeriesFunction(series);

const HELPER = new GulpHelper();

const demo_assets = task("demo:assets", () => DEMO.assets.bundle()),
    demo_html = task("demo:html", () => DEMO.pug.bundle()),
    demo_css = task("demo:css", () => DEMO.sass.bundle()),
    demo_js = task("demo:js", () => DEMO.rollup.bundle());

const lib_js = task("lib:js", async () => {
    await LIB.js.bundle();
    await LIB.dts.bundle();
});


function clear(done: () => void): void {
    emptyDirSync(DEMOOUT);
    emptyDirSync(LIBOUT);
    done();
}

function watch(done: () => void) {
    HELPER
        .setCloseCallback(done)

        .add(DEMO.assets, demo_assets)
        .add(DEMO.pug, demo_html)
        .add(DEMO.sass, demo_css)
        .add(DEMO.rollup, demo_js)

        .add(LIB.js, lib_js);

    process.on("SIGINT", () => {
        console.log("Stopping watchers...");
        HELPER.close();
        process.exit();
    });

    bs_create().init({
        server: DEMOOUT,
        files: `${DEMOOUT}/**/*`
    });
}

const build = series(clear, lib_js, parallel(demo_assets, demo_html, demo_css, demo_js)),
    dev = series(build, watch);

export { build, dev };
export default build;
