//* --------------------------------- Declaring Modules and Plugins ---------------------------------
const app = require("fastify")();
const path = require("path");
app.register(require("@fastify/formbody"));
app.register(require("@fastify/multipart"));

//* ------------------------------------- Static Files Handling -------------------------------------
app.register(require("@fastify/static"), {
    root: path.join(__dirname, "views"),
    prefix: "/"
})

app.register(require("@fastify/static"), {
    root: path.join(__dirname, "assets"),
    prefix: "/assets/",
    decorateReply: false,
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

app.get("/data", async (req, res) => {
    const data = [{
        "jumlah_kelas": 3,
        "jumlah_kelompok": 18,
        "jumlah_siswa": 2680
    }]
    
    res.send({
        dataBase: data,
    })
})

//* -------------------------------------------- Server ---------------------------------------------
app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at http://localhost:${app.server.address().port}`);
})