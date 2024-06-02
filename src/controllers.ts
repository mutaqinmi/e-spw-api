import { FastifyReply, FastifyRequest } from "fastify";
import * as models from "./models";
import * as jwt from "jsonwebtoken";
import fs from "fs/promises";
import * as luxon from "luxon";

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
            const token = generateToken(dataSiswa[0]['siswa']);
            models.addToken(dataSiswa[0]['siswa']['nis'], token);
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

export const kelas = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const dataKelas = await models.getKelas();
        return res.status(200).send({
            data: dataKelas
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }

}

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

export const createShop = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const file = await req.file();
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[i][1] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    const get_id_kelas = await models.getKelasByName(body[1]['id_kelas']);

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const toko = await models.createToko(body[0]['nama_toko'], get_id_kelas[0]['id_kelas'], body[2]['deskripsi_toko']);

            const get_id_toko = await models.getTokoByName(body[0]['nama_toko']);
            await models.addToKelompok(get_id_toko[0]['id_toko'], data.nis);

            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${get_id_toko[0]['id_toko']}-${timestamp}.jpeg`;
                const banner_toko = await file.toBuffer();
                await fs.writeFile(`./assets/public/${filename}`, banner_toko);
                await models.updateBannerToko(get_id_toko[0]['id_toko'], `${filename}`);
            }

            return res.status(200).send({
                message: 'Success!',
                toko: toko
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const updateShopBanner = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const file = await req.file();
    const token = headers.authorization?.split(' ')[1];
    const params = req.params as { id: string };
    const id_toko = params.id;
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[0][i] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }
    
    try {
        const verify = verifyToken(token);
        if(verify){
            await fs.rm(`./assets/public/${body[1]['old_image']}`);
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${id_toko}-${timestamp}.jpeg`;
                const banner_toko = await file.toBuffer();
                await fs.writeFile(`./assets/public/${filename}`, banner_toko);
                await models.updateBannerToko(id_toko, `${filename}`);
            }
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

export const updateShop = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string, nama_toko: string; deskripsi_toko: string; };
    const id_toko = body.id_toko;
    const deskripsi_toko = body.deskripsi_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateShop(id_toko, deskripsi_toko);
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

export const joinShop = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { kode_unik: string; };
    const kode_unik = body.kode_unik;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const toko: {[key: string]: any} = await models.getTokoByKode(kode_unik);
            const kelompok = await models.getDataKelompok(data.nis);
            if(kelompok.length > 0){
                for(let i = 0; i < kelompok.length; i++){
                    if(kelompok[i]?.['toko']?.['id_toko'] === toko[0]['id_toko']){
                        return res.status(400).send({
                            message: `Anda sudah bergabung dengan ${kelompok[0]['toko']['nama_toko']}`,
                            nama_toko: kelompok[0]['toko']['nama_toko']
                        })
                    }
                }
            }
            if(!toko[0]){
                return res.status(400).send({
                    message: 'Kode unik tidak ditemukan!'
                })
            }
            await models.addToKelompok(toko[0]['id_toko'], data.nis);
            return res.status(200).send({
                message: 'Success!',
                id_toko: toko[0]['id_toko'],
                nama_toko: toko[0]['nama_toko']
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const getDataKelompok = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataKelompok = await models.getAllDataKelompok(id_toko);
            return res.status(200).send({
                data: dataKelompok
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const removeFromKelompok = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.removeFromKelompok(id_toko, data.nis);
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

export const deleteToko = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.deleteToko(id_toko);
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

export const updateJadwal = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string, is_open: boolean; };
    const id_toko = body.id_toko;
    const is_open = body.is_open;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateJadwal(id_toko, is_open);
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

export const kelompok = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataKelompok = await models.getDataKelompok(data.nis);
            return res.status(200).send({
                data: dataKelompok
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

export const getProductById = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const params = req.params as { id: string };
    const id = params.id;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataProduk = await models.getProdukById(id);
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

export const addProduct = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const file = await req.file();
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[i][1] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    try {
        const verify = verifyToken(token);
        if(verify){
            const produk: {[key: string]: any} = await models.addProduk(body[0]['nama_produk'], body[1]['harga'], body[2]['stok'], body[3]['deskripsi_produk'], body[4]['detail_produk'], body[5]['id_toko']);
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${produk[0]?.['id_produk']}-${timestamp}.jpeg`;
                const foto_produk = await file.toBuffer();
                await fs.writeFile(`./assets/public/${filename}`, foto_produk);
                await models.updateFotoProduk(produk[0]?.['id_produk'], `${filename}`);
            }

            return res.status(200).send({
                message: 'Success!',
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const updateFotoProduk = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const file = await req.file();
    const token = headers.authorization?.split(' ')[1];
    const params = req.params as { id: string };
    const id_produk = params.id;
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[0][i] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    try {
        const verify = verifyToken(token);
        if(verify){
            await fs.rm(`./assets/public/${body[1]['old_image']}`);
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${id_produk}-${timestamp}.jpeg`;
                const foto_produk = await file.toBuffer();
                await fs.writeFile(`./assets/public/${filename}`, foto_produk);
                await models.updateFotoProduk(id_produk, `${filename}`);
            }
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

export const updateProduk = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_produk: string; nama_produk: string; harga: string; stok: number; deskripsi_produk: string; detail_produk: string; };
    const id_produk = body.id_produk;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateProduk(id_produk, body.nama_produk, body.harga, body.stok, body.deskripsi_produk, body.detail_produk);
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

export const deleteProduk = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_produk: string };
    const id_produk = body.id_produk;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.deleteProduk(id_produk);
            await fs.rm(`./assets/public/${id_produk}.jpeg`);
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

export const createOrder = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_produk: string; jumlah: number; total_harga: number; catatan: string };

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
            const pesanan = await models.createPesanan(`transaction-${data.nis}-${timestamp}`, data.nis, body.id_produk, body.jumlah, body.total_harga, body.catatan);
            await models.deleteFromKeranjangByNIS(data.nis);
            return res.status(200).send({
                message: 'Success!',
                pesanan: pesanan,
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

export const addToFavorite = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.addToFavorite(id_toko, data.nis);
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

export const deleteFromFavorite = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.deleteFromFavorite(id_toko, data.nis);
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

export const updateTelepon = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { telepon: string };
    const telepon = body.telepon;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.updateTelepon(data.nis, telepon);
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

export const updateProfilePicture = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const file = await req.file();
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[0][i] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            if(body[1]['old_image'] != ''){
                await fs.rm(`./assets/public/${body[1]['old_image']}`);
            }
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const foto_profil = await file.toBuffer();
                const filename = `${data.nis}-${timestamp}.jpeg`;
                await fs.writeFile(`./assets/public/${filename}`, foto_profil);
                const siswa = await models.updateProfilePicture(data.nis, `${filename}`);
                return res.status(200).send({
                    message: 'Success!',
                    siswa: siswa,
                })
            }
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
    const body = req.body as { id_address: number };
    const id_address = body.id_address;

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