//* --------------------------------- Declaring Modules and Plugins ---------------------------------
const app = require("fastify")();
const path = require("path");
app.register(require("@fastify/formbody"));
app.register(require("@fastify/multipart"));

//* ------------------------------------- Static Files Handling -------------------------------------
app.register(require("@fastify/static"), {
    root: path.resolve(process.cwd(), "public"),
    prefix: "/",
})

app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at http://localhost:${app.server.address().port}`);
})