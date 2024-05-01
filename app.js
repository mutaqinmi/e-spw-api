//* --------------------------------- Declaring Modules and Plugins ---------------------------------
const app = require("fastify")();
const path = require("path");
const controller = require("./controllers");
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

//* ---------------------------- Application Programming Interface (API) ----------------------------
//* -------------------------------------------- Mobile ---------------------------------------------
app.post('/api/login', controller.login);
app.get('/api/banner', controller.todayBaner);
app.get('/api/shop', controller.shop);
app.get('/api/products', controller.products);
app.post('/api/search', controller.search);
app.get('/api/shop/:id', controller.shopById);
app.post('/api/add-to-cart', controller.addToCart);
app.post('/api/add-to-favorite', controller.addToFavorite);
app.get('/api/cart/:nis', controller.carts);
app.delete('/api/cart/delete', controller.deleteFromCart);
app.get('/api/orders', controller.orders);
app.get('/api/notifications', controller.notifications);
app.get('/api/chats/:nis', controller.chats);
app.get('/api/chats/message/:id', controller.messages);
app.get('/api/rate/:nis', controller.userRateHistory);
app.get('/api/favorite/:nis', controller.favorites);
app.patch('/api/user/:nis/change-password', controller.changePassword);
app.get('/api/user/:nis/address', controller.addresses);
app.post('/api/user/:nis/add-address', controller.addAddress);
app.patch('/api/user/:nis/edit-address', controller.editAddress);
app.delete('/api/user/:nis/delete-address', controller.deleteAddress);

//* -------------------------------------------- Server ---------------------------------------------
app.listen({port: process.env.PORT, host: process.env.HOST}, () => {
    console.log(`Server running at port ${app.server.address().port}`);
})