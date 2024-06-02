import fastify from "fastify";
import path from "path";
import * as controller from "./controllers";
import multipart from '@fastify/multipart';

const app = fastify({bodyLimit: 5 * 1024 * 1024});

app.register(require("@fastify/formbody"));
app.register(multipart);

app.register(require("@fastify/static"), {
    root: path.resolve(process.cwd(), "views"),
    prefix: "/"
})

app.register(require("@fastify/static"), {
    root: path.resolve(process.cwd(), "assets"),
    prefix: "/assets/",
    decorateReply: false,
})

//* ---------------------------------------------- Web ----------------------------------------------
// app.post('/login-guru', async (req, res) => {
//     const body = req.body as { nomorInduk: string; password: string; };

//     const nomorInduk = parseInt(body.nomorInduk);
//     const password = body.password;
    
//     try {
//         const result = await controller.getGuru(nomorInduk);
        
//         if(nomorInduk === result.rows[0].nip){
//             if(password === result.rows[0].password){
//                 res.redirect(301, '/guru');
//             }
//         }

//         return res.status(400).send({
//             message: 'NIP/NUPTK atau Password salah!',
//         })
//     } catch (error){
//         return error;
//     }
// })

//* -------------------------------------------- Mobile ---------------------------------------------
app.post('/api/login', controller.login);
app.post('/api/logout', controller.logout);
app.get('/api/kelas', controller.kelas);
// app.get('/api/banner', controller.todayBaner);
app.get('/api/shop', controller.shop);
app.post('/api/shop/create', controller.createShop);
app.post('/api/shop/delete', controller.deleteToko);
app.patch('/api/shop/update', controller.updateShop);
app.post('/api/shop/:id/update-profile-picture', controller.updateShopBanner);
app.post('/api/shop/update-jadwal', controller.updateJadwal);
app.get('/api/kelompok', controller.kelompok);
app.post('/api/kelompok/all', controller.getDataKelompok);
app.post('/api/kelompok/join', controller.joinShop);
app.post('/api/kelompok/remove', controller.removeFromKelompok);
app.get('/api/products', controller.products);
app.get('/api/products/:id', controller.getProductById);
app.post('/api/products/add', controller.addProduct);
app.post('/api/products/delete', controller.deleteProduk);
app.patch('/api/products/update', controller.updateProduk);
app.post('/api/products/:id/update-profile-picture', controller.updateFotoProduk);
app.post('/api/search', controller.search);
app.get('/api/shop/:id', controller.shopById);
app.post('/api/add-to-cart', controller.addToCart);
app.post('/api/add-to-favorite', controller.addToFavorite);
app.get('/api/cart', controller.carts);
app.delete('/api/cart/delete', controller.deleteFromCart);
app.post('/api/cart/update', controller.updateCart);
app.get('/api/orders', controller.orders);
app.get('/api/notifications', controller.notifications);
// app.get('/api/chats/:nis', controller.chats);
// app.get('/api/chats/message/:id', controller.messages);
app.get('/api/rate/:nis', controller.userRateHistory);
app.get('/api/favorite/:nis', controller.favorites);
app.patch('/api/user/:nis/update-telepon', controller.updateTelepon);
app.patch('/api/user/:nis/change-password', controller.changePassword);
app.post('/api/user/:nis/update-profile-picture', controller.updateProfilePicture);
app.get('/api/user/:nis/address', controller.addresses);
app.post('/api/user/:nis/add-address', controller.addAdress);
app.patch('/api/user/:nis/edit-address', controller.editAddress);
app.delete('/api/user/:nis/delete-address', controller.deleteAddress);

app.listen({ port: Number(process.env.PORT!), host: process.env.HOST }, () => {
    const address = app.server.address();
    console.log(`Server running at port ${typeof address === "string" ? address : address?.port}`);
})