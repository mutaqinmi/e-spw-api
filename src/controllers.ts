import { FastifyReply, FastifyRequest } from "fastify";
import * as models from "./models";
import * as jwt from "jsonwebtoken";

const generateToken = (payload: Object) => {
    return jwt.sign(payload, process.env.SECRET_KEY!);
}

const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.SECRET_KEY!);
}

export const login = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { nis: number };
    const nis = body.nis;

    try {
        const dataSiswa = await models.getDataSiswa(nis);
        if(dataSiswa.length === 1){
            const token = generateToken(dataSiswa[0]);
            models.addToken(dataSiswa[0]['nis'], token);
            return res.status(200).send({
                data: dataSiswa[0],
                token: token
            })
        }

        return res.status(400).send({
            message: 'NIS tidak ditemukan!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const logout = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { token: string };
    const token = body.token;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };

        await models.deleteToken(data.nis);
        return res.status(200).send({
            message: 'Success!'
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

// const todayBaner = async (req: FastifyRequest, res: FastifyReply) => {
//     try {
//         const dataBanner = await models.getTodayBanner() as { rows: any[]};
//         return res.status(200).send({
//             data: dataBanner
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             message: error
//         })
//     }
// }

export const shop = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const dataToko = await models.getToko();
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const products = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const dataProduk = await models.getProduk();
        return res.status(200).send({
            data: dataProduk
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const search = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { query: string };
    const query = body.query;

    try {
        const searchProductResult = await models.cariProduk(query);
        const searchShopResult = await models.cariToko(query);
        return res.status(200).send({
            dataProduk: searchProductResult,
            dataToko: searchShopResult
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const shopById = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { id: string };
    const id_toko = params.id;

    try {
        const dataToko = await models.getTokoById(id_toko);
        return res.status(200).send({
            data: dataToko
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addToCart = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id: string; qty: number; token: string; }
    const id_produk = body.id;
    const qty = body.qty;
    const token = body.token;
    
    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        
        await models.addToCart(id_produk, data.nis, qty);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addToFavorite = async (req: FastifyRequest, res: FastifyReply) => {
    const query = req.query as { id: string; nis: number; };

    const id_kelompok = query.id;
    const nis = query.nis;

    try {
        await models.addToFavorite(id_kelompok, nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const carts = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { token: string; };
    const token = body.token;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        const dataKeranjang = await models.getKeranjang(data.nis);
        return res.status(200).send({
            data: dataKeranjang
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const deleteFromCart = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id: number; token: string; };
    const id_keranjang = body.id;
    const token = body.token;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        await models.deleteFromKeranjang(id_keranjang, data.nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const updateCart = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id: number; qty: number; token: string; };
    const id_keranjang = body.id;
    const qty = body.qty;
    const token = body.token;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        await models.updateJumlahKeranjang(qty, id_keranjang, data.nis);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const orders = async (req: FastifyRequest, res: FastifyReply) => {
    const query = req.query as { nis: number; status: string };
    const nis = query.nis;
    const status_pesanan = query.status;

    try {
        const dataPesanan = await models.getPesanan(nis, status_pesanan);
        return res.status(200).send({
            data: dataPesanan
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const notifications = async (req: FastifyRequest, res: FastifyReply) => {
    const query = req.query as { nis: number; type: string };
    const nis = query.nis;
    const type = query.type;

    try {
        const dataNotifikasi = await models.getNotifikasi(nis, type);
        return res.status(200).send({
            data: dataNotifikasi
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

// const chats = async (req: FastifyRequest, res: FastifyReply) => {
//     const params = req.params as { nis: number };
//     const nis = params.nis;

//     try {
//         const dataChat = await models.getChat(nis);
//         return res.status(200).send({
//             data: dataChat
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             message: error
//         })
//     }
// }

// const messages = async (req: FastifyRequest, res: FastifyReply) => {
//     const params = req.params as { id: string };
//     const id = params.id;

//     try {
//         const dataPesan = await models.getMessage(id);
//         return res.status(200).send({
//             data: dataPesan
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             message: error
//         })
//     }
// }

export const userRateHistory = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const nis = params.nis;

    try {
        const dataRating = await models.getRiwayatUlasan(nis);
        return res.status(200).send({
            data: dataRating
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const favorites = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const nis = params.nis;
    
    try {
        const dataFavorit = await models.getFavorit(nis);
        return res.status(200).send({
            data: dataFavorit
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const changePassword = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number; password: string };
    const body = req.body as { nis: number; password: string };
    const nis = params.nis;
    const newPassword = body.password;

    try {
        await models.changePassword(nis, newPassword);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addresses = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const nis = params.nis;

    try {
        const dataAlamat = await models.getAlamat(nis);
        return res.status(200).send({
            data: dataAlamat
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addAdress = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const body = req.body as { address: string };
    const nis = params.nis;
    const address = body.address;

    try {
        await models.addAlamat(nis, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const editAddress = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const query = req.query as { id: number };
    const body = req.body as { address: string };
    const nis = params.nis;
    const id_address = query.id;
    const address = body.address;

    try {
        await models.updateAlamat(id_address, address);
        return res.status(200).send({
            message: 'Success!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const deleteAddress = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { nis: number };
    const query = req.query as { id: number };
    const nis = params.nis;
    const id_address = query.id;

    try {
        await models.deleteAlamat(id_address);
        return res.status(200).send({
            message: 'Success!'
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}