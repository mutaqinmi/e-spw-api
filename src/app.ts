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
app.post('/v3/user', controller.getDataSiswa);
app.post('/v3/user/auth/login', controller.signin);
app.post('/v3/user/auth/logout', controller.signout);
app.get('/v3/user/keranjang', controller.getKeranjang);
app.post('/v3/user/keranjang/add', controller.addToKeranjang);
app.delete('/v3/user/keranjang/delete', controller.deleteFromKeranjang);
app.post('/v3/user/keranjang/update', controller.updateKeranjang);
app.post('/v3/user/notifikasi', controller.getNotifikasi);
app.post('/v3/user/notifikasi/add', controller.addNotifikasi);
app.get('/v3/user/rate/:nis', controller.getUlasan);
app.post('/v3/user/rate/add/:nis', controller.addUlasan);
app.get('/v3/user/favorit/:nis', controller.getFavorit);
app.post('/v3/user/favorit/add/:nis', controller.addToFavorit);
app.post('/v3/user/favorit/delete/:nis', controller.deleteFromFavorite);
app.patch('/v3/user/update/telepon/:nis', controller.updateTelepon);
app.patch('/v3/user/update/password/:nis', controller.changePassword);
app.post('/v3/user/update/profile-picture/:nis', controller.updateFotoProfilSiswa);
app.get('/v3/user/alamat/:nis', controller.getAlamat);
app.post('/v3/user/alamat/add/:nis', controller.addAlamat);
app.patch('/v3/user/alamat/update/:nis', controller.updateAlamat);
app.post('/v3/user/alamat/delete/:nis', controller.deleteAlamat);
app.get('/v3/kelas', controller.getDataKelas);
app.get('/v3/toko', controller.getDataToko);
app.post('/v3/toko/create', controller.createToko);
app.post('/v3/toko/delete', controller.deleteToko);
app.patch('/v3/toko/update', controller.updateDeskripsiToko);
app.post('/v3/toko/update/banner/:id', controller.updateFotoProfilToko);
app.post('/v3/toko/update/jadwal', controller.updateJadwalToko);
app.get('/v3/toko/:id', controller.getTokoByIdToko);
app.post('/v3/toko/orders', controller.getPesananByToko);
app.post('/v3/toko/rate', controller.getUlasanByToko);
app.post('/v3/toko/notifikasi', controller.getNotifikasiToko);
app.post('/v3/toko/notifikasi/add', controller.addNotifikasiToko);
app.get('/v3/kelompok', controller.getSelfKelompok);
app.post('/v3/kelompok/all', controller.getDataKelompok);
app.post('/v3/kelompok/join', controller.gabungToko);
app.post('/v3/kelompok/delete', controller.removeFromKelompok);
app.get('/v3/produk', controller.getDataProduk);
app.get('/v3/produk/:id', controller.getProdukByIdProduk);
app.post('/v3/produk/add', controller.addProduk);
app.post('/v3/produk/delete', controller.deleteProduk);
app.patch('/v3/produk/update', controller.updateProduk);
app.post('/v3/produk/update/foto/:id', controller.updateFotoProduk);
app.post('/v3/search', controller.search);
app.post('/v3/order', controller.getPesanan);
app.post('/v3/order/new', controller.createPesanan);
app.patch('/v3/order/update', controller.updateStatusPesanan);

//* ---------------------------------------------- Web ----------------------------------------------
app.post('/v3/guru/auth/login', controller.signinGuru);
app.get('/v3/guru/all/siswa', controller.getAllDataSiswaByGuru);
app.get('/v3/guru/all/kelas', controller.getAllDataKelasByGuru);
app.get('/v3/guru/all/kelompok', controller.getAllDataKelompokByGuru);
app.get('/v3/guru/kelas/:id', controller.getTokoByIdKelas);

app.listen({ port: Number(process.env.PORT!), host: process.env.HOST }, () => {
    const address = app.server.address();
    console.log(`Server running at port ${typeof address === "string" ? address : address?.port}`);
})