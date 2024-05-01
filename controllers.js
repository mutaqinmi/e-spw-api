const models = require('./models');

const login = async (req, res) => {
    const nis = req.body.nis;

    try {
        const dataSiswa = await models.getDataSiswa(nis);
        return res.status(200).send({
            data: dataSiswa
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const todayBaner = async (req, res) => {
    try {
        const dataBanner = await models.getTodayBanner();
        return res.status(200).send({
            data: dataBanner
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const shop = async (req, res) => {
    try {
        const dataToko = await models.getShop();
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const products = async (req, res) => {
    try {
        const dataProduk = await models.getTodayProducts();
        return res.status(200).send({
            data: dataProduk
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const search = async (req, res) => {
    const query = req.query.query;

    try {
        const searchProductResult = await models.searchProduct(query);
        const searchShopResult = await models.searchShop(query);
        return res.status(200).send({
            dataProduk: searchProductResult,
            dataToko: searchShopResult
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const shopById = async (req, res) => {
    const id_kelompok = req.params.id;

    try {
        const dataToko = await models.getShopDetails(id_kelompok);
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const addToCart = async (req, res) => {
    const id_produk = req.query.id;
    const nis = req.query.nis
    
    try {
        await models.addToCart(id_produk, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const addToFavorite = async (req, res) => {
    const id_kelompok = req.query.id;
    const nis = req.query.nis;

    try {
        await models.addToFavorite(id_kelompok, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const carts = async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataKeranjang = await models.getCart(nis);
        return res.status(200).send({
            data: dataKeranjang
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const deleteFromCart = async (req, res) => {
    const id_produk = req.query.id;
    const nis = req.query.nis;

    try {
        await models.deleteFromCart(id_produk, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const orders = async (req, res) => {
    const nis = req.query.nis;
    const status_pesanan = req.query.status;

    try {
        const dataPesanan = await models.getOrders(nis, status_pesanan);
        return res.status(200).send({
            data: dataPesanan
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const notifications = async (req, res) => {
    const nis = req.query.nis;
    const type = req.query.type;

    try {
        const dataNotifikasi = await models.getNotifications(nis, type);
        return res.status(200).send({
            data: dataNotifikasi
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const chats = async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataChat = await models.getChat(nis);
        return res.status(200).send({
            data: dataChat
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const messages = async (req, res) => {
    const id = req.params.id;

    try {
        const dataPesan = await models.getMessage(id);
        return res.status(200).send({
            data: dataPesan
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const userRateHistory = async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataRating = await models.getRateHistory(nis);
        return res.status(200).send({
            data: dataRating
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const favorites = async (req, res) => {
    const nis = req.params.nis;
    
    try {
        const dataFavorit = await models.getFavorite(nis);
        return res.status(200).send({
            data: dataFavorit
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const changePassword = async (req, res) => {
    const nis = req.params.nis;
    const newPassword = req.body.password;

    try {
        await models.changePassword(nis, newPassword);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const addresses = async (req, res) => {
    const nis = req.params.nis;

    try {
        const dataAlamat = await models.getAddress(nis);
        return res.status(200).send({
            data: dataAlamat
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const addAdress = async (req, res) => {
    const nis = req.params.nis;
    const address = req.body.address;

    try {
        await models.addAddress(nis, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const editAddress = async (req, res) => {
    const nis = req.params.nis;
    const id_address = req.query.id;
    const address = req.body.address;

    try {
        await models.updateAddress(nis, id_address, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

const deleteAddress = async (req, res) => {
    const nis = req.params.nis;
    const id_address = req.query.id;

    try {
        await models.deleteAddress(id_address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        return res.status(400).send({
            message: error
        })
    }
}

module.exports = {
    login,
    todayBaner,
    shop,
    products,
    search,
    shopById,
    addToCart,
    addToFavorite,
    carts,
    deleteFromCart,
    orders,
    notifications,
    chats,
    messages,
    userRateHistory,
    favorites,
    changePassword,
    addresses,
    addAdress,
    editAddress,
    deleteAddress
}