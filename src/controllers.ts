import { FastifyReply, FastifyRequest } from "fastify";
import * as models from "./query";
import * as jwt from "jsonwebtoken";
import fs from "fs/promises";
import * as luxon from "luxon";

const generateToken = (payload: Object) => {
    return jwt.sign(payload, process.env.SECRET_KEY!);
}

const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.SECRET_KEY!);
}

const updateRatingToko = async (id_toko: string) => {
    const allUlasan = await models.getRiwayatUlasanByToko(id_toko);
    let jumlahRating = 0;
    for(let i = 0; i < allUlasan.length; i++){
        jumlahRating += parseInt(allUlasan[i]['ulasan']['jumlah_rating']);
    }
    await models.updateRatingToko(id_toko, (jumlahRating / allUlasan.length).toString().slice(0, 3));
}

export const getSiswa = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { nis: number };
    const nis = body.nis;

    try {
        const dataSiswa = await models.getSiswa(nis);
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

export const toko = async (req: FastifyRequest, res: FastifyReply) => {
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

export const createToko = async (req: FastifyRequest, res: FastifyReply) => {
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
                await fs.writeFile(`./public/${filename}`, banner_toko);
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

export const updateBannerToko = async (req: FastifyRequest, res: FastifyReply) => {
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
            await fs.rm(`./public/${body[1]['old_image']}`);
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${id_toko}-${timestamp}.jpeg`;
                const banner_toko = await file.toBuffer();
                await fs.writeFile(`./public/${filename}`, banner_toko);
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

export const updateToko = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string, nama_toko: string; deskripsi_toko: string; };
    const id_toko = body.id_toko;
    const deskripsi_toko = body.deskripsi_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateToko(id_toko, deskripsi_toko);
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

export const gabungToko = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { kode_unik: string; };
    const kode_unik = body.kode_unik;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const toko: {[key: string]: any} = await models.getTokoByKode(kode_unik);
            const kelompok = await models.getKelompok(data.nis);
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
            await models.updateJadwalToko(id_toko, is_open);
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
            const dataKelompok = await models.getKelompok(data.nis);
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

export const produk = async (req: FastifyRequest, res: FastifyReply) => {
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

export const getProdukById = async (req: FastifyRequest, res: FastifyReply) => {
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

export const addProduk = async (req: FastifyRequest, res: FastifyReply) => {
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
                await fs.writeFile(`./public/${filename}`, foto_produk);
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
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${id_produk}-${timestamp}.jpeg`;
                const foto_produk = await file.toBuffer();
                await fs.writeFile(`./public/${filename}`, foto_produk);
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
            const searchProductResult = await models.searchProduk(query);
            const searchShopResult = await models.searchToko(query);
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

export const getTokoById = async (req: FastifyRequest, res: FastifyReply) => {
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

export const addToKeranjang = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id: string; qty: number; catatan: string; }
    const id_produk = body.id;
    const qty = body.qty;
    const catatan = body.catatan;
    
    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        
        if(verify){
            await models.addToKeranjang(id_produk, data.nis, qty, catatan);
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

export const deleteFromKeranjang = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id: number; };
    const id_keranjang = body.id;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.removeFromKeranjang(id_keranjang, data.nis);
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

export const updateKeranjang = async (req: FastifyRequest, res: FastifyReply) => {
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
    const body = req.body as { status: string };
    const status_pesanan = body.status;

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

export const ordersByToko = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; status: string };
    const id_toko = body.id_toko;
    const status_pesanan = body.status;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataPesanan = await models.getPesananByToko(id_toko, status_pesanan);
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

export const createPesanan = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_produk: string; jumlah: number; total_harga: number; catatan: string; alamat: string;};

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
            const kode_unik = Math.random().toString(36).substring(7).slice(0, 4);
            const pesanan = await models.createPesanan(`transaction-${data.nis}-${timestamp}${kode_unik}`, data.nis, body.id_produk, body.jumlah, body.total_harga, body.catatan, body.alamat);
            await models.updateJumlahTerjual(body.id_produk, body.jumlah);
            await models.emptyKeranjang(data.nis);
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

export const updateStatusPesanan = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_transaksi: string; status: string; };

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.updateStatusPesanan(body.id_transaksi, body.status);
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

export const notifications = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { type: string };
    const type = body.type;

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

export const createNotification = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { type: string; title: string; description: string; };

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.createNotifikasi(data.nis, body.type, body.title, body.description);
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

export const tokoNotifications = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { type: string };
    const type = body.type;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            const dataNotifikasi = await models.getNotifikasiToko(data.nis, type);
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

export const createTokoNotification = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; type: string; title: string; description: string; };

    try {
        const verify = verifyToken(token);
        if(verify){
            await models.createNotifikasiToko(body.id_toko, body.type, body.title, body.description);
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

export const shopRateHistory = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataRating = await models.getRiwayatUlasanByToko(id_toko);
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

export const shopRateHistoryLimited = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        if(verify){
            const dataRating = await models.getRiwayatUlasanByTokoLimited(id_toko);
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

export const addUlasan = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_produk: string; id_transaksi: string; ulasan: string; rating: string; id_toko: string };

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.addUlasan(data.nis, body.id_produk, body.id_transaksi, body.ulasan, body.rating)
            await updateRatingToko(body.id_toko);
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

export const addToFavorit = async (req: FastifyRequest, res: FastifyReply) => {
    const headers = req.headers as { authorization: string };
    const token = headers.authorization?.split(' ')[1];
    const body = req.body as { id_toko: string; };
    const id_toko = body.id_toko;

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            await models.addToFavorit(id_toko, data.nis);
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
            await models.deleteFromFavorit(id_toko, data.nis);
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
            await models.updatePassword(data.nis, newPassword);
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

    try {
        const verify = verifyToken(token);
        const data = verify as { nis: number };
        if(verify){
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const foto_profil = await file.toBuffer();
                const filename = `${data.nis}-${timestamp}.jpeg`;
                await fs.writeFile(`./public/${filename}`, foto_profil);
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

export const addAlamat = async (req: FastifyRequest, res: FastifyReply) => {
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

export const editAlamat = async (req: FastifyRequest, res: FastifyReply) => {
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

export const deleteAlamat = async (req: FastifyRequest, res: FastifyReply) => {
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

export const loginGuru = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { nip: string; password: string; };

    try {
        const guru = await models.getGuru(body.nip);
        if(guru.length === 1){
            if(guru[0]['password'] === body.password){
                const token = generateToken(guru[0]['guru']);
                return res.status(200).send({
                    message: 'Success!',
                    data: guru,
                    token: token
                })
            }
        }

        return res.status(400).send({
            message: 'NIP/NUPTK atau Password salah!'
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}