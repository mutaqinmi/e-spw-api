const { Client } = require('pg');
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

client.connect();

const addToken = async (nis, token) => {
    const result = await client.query(`INSERT INTO token VALUES ('${nis}', '${token}')`);
    return result;
}

const deleteToken = async (nis) => {
    const result = await client.query(`DELETE FROM token WHERE nis = '${nis}'`);
    return result;
}

const getDataSiswa = async (nis) => {
    const result = await client.query(`SELECT * FROM siswa WHERE nis = '${nis}'`);
    return result;
}

const getTodayBanner = async () => {
    const result = await client.query(`SELECT * FROM banner ORDER BY waktu_upload LIMIT 5`);
    return result;
}

const getShop = async () => {
    const result = await client.query(`SELECT * FROM kelompok ORDER BY is_open`);
    return result;
}

const getTodayProducts = async () => {
    const result = await client.query(`SELECT * FROM kelompok WHERE is_open = 'true' LEFT JOIN ON produk`);
    return result;
}

const searchProduct = async (keywords) => {
    const result = await client.query(`SELECT * FROM produk WHERE nama_produk LIKE %${keywords}%`);
    return result;
}

const searchShop = async (keywords) => {
    const result = await client.query(`SELECT * FROM kelompok WHERE nama_kelompok LIKE %${keywords}%`);
    return result;
}

const getShopDetails = async (id_kelompok) => {
    const result = await client.query(`SELECT * FROM kelompok WHERE id_kelompok = '${id_kelompok}'`);
    return result;
}

//! Belum disesuaikan dengan database
//TODO: menyesuaikan query dengan kolom pada database

const addToCart = async (id_produk, nis) => {
    const result = await client.query(`INSERT INTO keranjang() VALUES ('${id_produk}', '${nis}')`);
    return result;
}

const addToFavorite = async (id_kelompok, nis) => {
    const result = await client.query(`INSERT INTO favorit() VALUES ('${id_kelompok}', '${nis}')`);
    return result;
}

const getCart = async (nis) => {
    const result = await client.query(`SELECT * FROM keranjang WHERE nis = '${nis}'`);
    return result;
}

const deleteFromCart = async (id_produk, nis) => {
    const result = await client.query(`DELETE FROM keranjang WHERE id_produk = '${id_produk}' AND nis = '${nis}'`);
    return result;
}

const getOrders = async (nis, status_pesanan) => {
    const result = await client.query(`SELECT * FROM penjualan WHERE nis = '${nis}' AND status = '${status_pesanan}'`);
    return result;
}

const getNotifications = async (nis, type) => {
    const result = await client.query(`SELECT * FROM notifikasi WHERE nis = '${nis}' AND type = '${type}'`);
    return result;
}

const getChat = async (nis) => {
    const result = await client.query(`SELECT * FROM chat WHERE nis = '${nis}'`);
    return result;
}

const getMessage = async (id_chat) => {
    const result = await client.query(`SELECT * FROM pesan WHERE id_chat = '${id_chat}'`);
    return result;
}

const getRateHistory = async (nis) => {
    const result = await client.query(`SELECT * FROM ulasan WHERE nis = '${nis}'`);
    return result;
}

const getFavorite = async (nis) => {
    const result = await client.query(`SELECT * FROM favorit WHERE nis = '${nis}'`);
    return result;
}

const changePassword = async (nis, password) => {
    const result = await client.query(`UPDATE siswa SET password = '${password}' WHERE nis = '${nis}'`);
    return result;
}

const getAddress = async (nis) => {
    const result = await client.query(`SELECT * FROM alamat WHERE nis = '${nis}'`);
    return result;
}

const addAddress = async (nis, address) => {
    const result = await client.query(`INSERT INTO alamat() VALUES ('${nis}', '${address}'`);
    return result;
}

const updateAddress = async (nis, id_address, address) => {
    const result = await client.query(`UPDATE alamat SET alamat = '${address}' WHERE nis = '${nis}' AND id_address = '${id_address}'`);
    return result;
}

const deleteAddress = async (id_address) => {
    const result = await client.query(`DELETE FROM alamat WHERE id_address = '${id_address}'`);
    return result;
}

module.exports = {
    addToken,
    deleteToken,
    getDataSiswa,
    getTodayBanner,
    getShop,
    getTodayProducts,
    searchProduct,
    searchShop,
    getShopDetails,
    addToCart,
    addToFavorite,
    getCart,
    deleteFromCart,
    getOrders,
    getNotifications,
    getChat,
    getMessage,
    getRateHistory,
    getFavorite,
    changePassword,
    getAddress,
    addAddress,
    updateAddress,
    deleteAddress
}