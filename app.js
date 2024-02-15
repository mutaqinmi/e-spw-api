const app = require("fastify")();
const path = require("path");
app.register(require("@fastify/static"), {
    root: path.resolve(process.cwd(), "public"),
    prefix: "/",
})
app.register(require("@fastify/formbody"));
app.register(require("@fastify/multipart"));

app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at port ${app.server.address().port}`)
})