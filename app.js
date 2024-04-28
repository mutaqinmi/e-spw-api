//* --------------------------------- Declaring Modules and Plugins ---------------------------------
const app = require("fastify")();
const path = require("path");
const db = require("./app/connection");
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
//* ---------------------------------------------- Web ----------------------------------------------
app.post('/login-guru', async (req, res) => {
    const nomorInduk = parseInt(req.body.nomorInduk);
    const password = req.body.password;
    
    try {
        const result = await getGuru(nomorInduk);
        
        if(nomorInduk === result.rows[0].nip){
            if(password === result.rows[0].password){
                res.redirect(301, '/guru');
            }
        }

        return res.status(400).send({
            message: 'NIP/NUPTK atau Password salah!',
        })
    } catch (error){
        return error;
    }
})

// //* ---------------------------- Application Programming Interface (API) ----------------------------
// //* -------------------------------------------- Mobile ---------------------------------------------
app.post('/api/login', async (req, res) => {
    const nis = req.body.nis;

    try {
        const dataSiswa = await db.getDataSiswa(nis);
        return res.status(200).send({
            data: dataSiswa
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/banner', async (req, res) => {
    try {
        const dataBanner = await db.getTodayBanner();
        return res.status(200).send({
            data: dataBanner
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/shop', async (req, res) => {
    try {
        const dataToko = await db.getShop();
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/products', async (req, res) => {
    try {
        const dataProduk = await db.getTodayProducts();
        return res.status(200).send({
            data: dataProduk
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.post('/api/search/:query', async (req, res) => {
    const query = req.params.query;

    try {
        const searchProductResult = await db.searchProduct(query);
        const searchShopResult = await db.searchShop(query);
        return res.status(200).send({
            dataProduk: searchProductResult,
            dataToko: searchShopResult
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/shop/:id', async (req, res) => {
    const id_kelompok = req.params.id;

    try {
        const dataToko = await db.getShopDetails(id_kelompok);
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.post('/api/addtocart', async (req, res) => {
    const id_produk = req.query.id;
    const nis = req.query.nis
    
    try {
        await db.addToCart(id_produk, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.post('/api/addtofavorite', async (req, res) => {
    const id_kelompok = req.query.id;
    const nis = req.query.nis;

    try {
        await db.addToFavorite(id_kelompok, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/cart/:nis', async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataKeranjang = await db.getCart(nis);
        return res.status(200).send({
            data: dataKeranjang
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.delete('/api/cart/delete', async (req, res) => {
    const id_produk = req.query.id;
    const nis = req.query.nis;

    try {
        await db.deleteFromCart(id_produk, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/orders', async (req, res) => {
    const nis = req.query.nis;
    const status_pesanan = req.query.status;

    try {
        const dataPesanan = await db.getOrders(nis, status_pesanan);
        return res.status(200).send({
            data: dataPesanan
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/notifications', async (req, res) => {
    const nis = req.query.nis;
    const type = req.query.type;

    try {
        const dataNotifikasi = await db.getNotifications(nis, type);
        return res.status(200).send({
            data: dataNotifikasi
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/chats/:nis', async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataChat = await db.getChat(nis);
        return res.status(200).send({
            data: dataChat
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/chats/message/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const dataPesan = await db.getMessage(id);
        return res.status(200).send({
            data: dataPesan
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/rate/:nis', async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataRating = await db.getRateHistory(nis);
        return res.status(200).send({
            data: dataRating
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/favorite/:nis', async (req, res) => {
    const nis = req.params.nis;
    
    try {
        const dataFavorit = await db.getFavorite(nis);
        return res.status(200).send({
            data: dataFavorit
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.patch('/api/user/:nis/change-password', async (req, res) => {
    const nis = req.params.nis;
    const newPassword = req.body.password;

    try {
        await db.changePassword(nis, newPassword);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.get('/api/user/:nis/address', async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataAlamat = await db.getAddress(nis);
        return res.status(200).send({
            data: dataAlamat
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.post('/api/user/:nis/add-address', async (req, res) => {
    const nis = req.params.nis;
    const address = req.body.address;

    try {
        await db.addAddress(nis, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.patch('/api/user/:nis/edit-address', async (req, res) => {
    const nis = req.params.nis;
    const id_address = req.query.id;
    const address = req.body.address;

    try {
        await db.updateAddress(nis, id_address, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

app.delete('/api/user/:nis/delete-address', async (req, res) => {
    const nis = req.params.nis;
    const id_address = req.query.id;

    try {
        await db.deleteAddress(id_address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
})

//* -------------------------------------------- Server ---------------------------------------------
app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at port ${app.server.address().port}`);
})