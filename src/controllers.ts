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
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    
    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };

        if(verify){
            await models.deleteToken(data.nis);
            return res.status(200).send({
                message: 'Success!'
            });
        }
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
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataToko = await models.getToko();
            return res.status(200).send({
                data: dataToko
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const products = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataProduk = await models.getProduk();
            return res.status(200).send({
                data: dataProduk
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const search = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { query: string };
    const query = body.query;

    try {
        const verify = verifyToken(token);
        if(verify){
            const searchProductResult = await models.cariProduk(query);
            const searchShopResult = await models.cariToko(query);
            return res.status(200).send({
                dataProduk: searchProductResult,
                dataToko: searchShopResult
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const shopById = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const params = req.params as { id: string };
    const id_toko = params.id;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataToko = await models.getTokoById(id_toko);
            return res.status(200).send({
                data: dataToko
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addToCart = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id: string; qty: number; token: string; }
    const id_produk = body.id;
    const qty = body.qty;
    
    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        
        if(verify){
            await models.addToCart(id_produk, data.nis, qty);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addToFavorite = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const query = req.query as { id: string; };
    const id_kelompok = query.id;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.addToFavorite(id_kelompok, data.nis);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const carts = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataKeranjang = await models.getKeranjang(data.nis);
            return res.status(200).send({
                data: dataKeranjang
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const deleteFromCart = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id: number; };
    const id_keranjang = body.id;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.deleteFromKeranjang(id_keranjang, data.nis);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const updateCart = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id: number; qty: number;};
    const id_keranjang = body.id;
    const qty = body.qty;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.updateJumlahKeranjang(qty, id_keranjang, data.nis);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const orders = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const query = req.query as { status: string };
    const status_pesanan = query.status;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataPesanan = await models.getPesanan(data.nis, status_pesanan);
            return res.status(200).send({
                data: dataPesanan
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const notifications = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const query = req.query as { type: string };
    const type = query.type;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataNotifikasi = await models.getNotifikasi(data.nis, type);
            return res.status(200).send({
                data: dataNotifikasi
            })
        }
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
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataRating = await models.getRiwayatUlasan(data.nis);
            return res.status(200).send({
                data: dataRating
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const favorites = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    
    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataFavorit = await models.getFavorit(data.nis);
            return res.status(200).send({
                data: dataFavorit
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const changePassword = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { password: string };
    const newPassword = body.password;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.changePassword(data.nis, newPassword);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addresses = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataAlamat = await models.getAlamat(data.nis);
            return res.status(200).send({
                data: dataAlamat
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const addAdress = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { address: string };
    const address = body.address;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.addAlamat(data.nis, address);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const editAddress = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const query = req.query as { id: number };
    const body = req.body as { address: string };
    const id_address = query.id;
    const address = body.address;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateAlamat(id_address, address);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const deleteAddress = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const query = req.query as { id: number };
    const id_address = query.id;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.deleteAlamat(id_address);
            return res.status(200).send({
                message: 'Success!'
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}