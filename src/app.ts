import fastify from "fastify";
import path from "path";
import * as controller from "./controllers";
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';

const app = fastify({bodyLimit: 5 * 1024 * 1024});

app.register(require("@fastify/formbody"));
app.register(multipart);
app.register(cors, {
    origin: "*"
})

app.register(require("@fastify/static"), {
    root: path.resolve(process.cwd()),
    prefix: "/",
})

//* -------------------------------------------- Mobile ---------------------------------------------
app.post('/api/v2/user/auth/login', controller.getSiswa);
app.post('/api/v2/user/auth/logout', controller.logout);
app.get('/api/v2/user/keranjang', controller.carts);
app.post('/api/v2/user/keranjang/add', controller.addToKeranjang);
app.delete('/api/v2/user/keranjang/delete', controller.deleteFromKeranjang);
app.post('/api/v2/user/keranjang/update', controller.updateKeranjang);
app.post('/api/v2/user/notifikasi', controller.notifications);
app.post('/api/v2/user/notifikasi/add', controller.createNotification);
app.get('/api/v2/user/rate/:nis', controller.userRateHistory);
app.post('/api/v2/user/rate/add/:nis', controller.addUlasan);
app.get('/api/v2/user/favorit/:nis', controller.favorites);
app.post('/api/v2/user/favorit/add/:nis', controller.addToFavorit);
app.post('/api/v2/user/favorit/delete/:nis', controller.deleteFromFavorite);
app.patch('/api/v2/user/update/telepon/:nis', controller.updateTelepon);
app.patch('/api/v2/user/update/password/:nis', controller.changePassword);
app.post('/api/v2/user/update/profile-picture/:nis', controller.updateProfilePicture);
app.get('/api/v2/user/alamat/:nis', controller.addresses);
app.post('/api/v2/user/alamat/add/:nis', controller.addAlamat);
app.patch('/api/v2/user/alamat/update/:nis', controller.editAlamat);
app.post('/api/v2/user/alamat/delete/:nis', controller.deleteAlamat);
app.get('/api/v2/kelas', controller.kelas);
app.get('/api/v2/toko', controller.toko);
app.post('/api/v2/toko/create', controller.createToko);
app.post('/api/v2/toko/delete', controller.deleteToko);
app.patch('/api/v2/toko/update', controller.updateToko);
app.post('/api/v2/toko/update/banner/:id', controller.updateBannerToko);
app.post('/api/v2/toko/update/jadwal', controller.updateJadwal);
app.get('/api/v2/toko/:id', controller.getTokoById);
app.post('/api/v2/toko/orders', controller.ordersByToko);
app.post('/api/v2/toko/rate', controller.shopRateHistory);
app.post('/api/v2/toko/rate-limited', controller.shopRateHistoryLimited);
app.post('/api/v2/toko/notifikasi', controller.tokoNotifications);
app.post('/api/v2/toko/notifikasi/add', controller.createTokoNotification);
app.get('/api/v2/kelompok', controller.kelompok);
app.post('/api/v2/kelompok/all', controller.getDataKelompok);
app.post('/api/v2/kelompok/join', controller.gabungToko);
app.post('/api/v2/kelompok/delete', controller.removeFromKelompok);
app.get('/api/v2/produk', controller.produk);
app.get('/api/v2/produk/:id', controller.getProdukById);
app.post('/api/v2/produk/add', controller.addProduk);
app.post('/api/v2/produk/delete', controller.deleteProduk);
app.patch('/api/v2/produk/update', controller.updateProduk);
app.post('/api/v2/produk/update/foto/:id', controller.updateFotoProduk);
app.post('/api/v2/search', controller.search);
app.post('/api/v2/order', controller.orders);
app.post('/api/v2/order/new', controller.createPesanan);
app.patch('/api/v2/order/update', controller.updateStatusPesanan);

//* ---------------------------------------------- Web ----------------------------------------------
app.post('/api/v2/guru/auth/login', controller.loginGuru);
app.get('/api/v2/guru/all/siswa', controller.getAllDataSiswaByGuru);
app.get('/api/v2/guru/all/kelas', controller.getAllDataKelasByGuru);
app.get('/api/v2/guru/all/kelompok', controller.getAllDataKelompokByGuru);
app.post('/api/v2/guru/kelas/:id', controller.getTokoByIdKelas);

app.listen({ port: Number(process.env.PORT!), host: process.env.HOST }, () => {
    const address = app.server.address();
    console.log(`Server running at port ${typeof address === "string" ? address : address?.port}`);
})