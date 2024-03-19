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

//* ---------------------------- Application Programming Interface (API) ----------------------------
app.post('/login', async (req, res) => {
    const nomorInduk = req.body.nomorInduk;
    const password = req.body.password;

    const nip = '12225173';
    const pw = '12345'
    
    if(nomorInduk === nip){
        if(password === pw){
            res.redirect(301, '/guru');
        }
    }

    res.status(400).send({
        message: 'NIP/NUPTK atau Password salah!',
        status: 400
    })
})

//* -------------------------------------------- Server ---------------------------------------------
app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at http://localhost:${app.server.address().port}`);
})