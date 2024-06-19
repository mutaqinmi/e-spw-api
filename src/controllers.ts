import { FastifyReply, FastifyRequest } from "fastify";
import * as models from "./query";
import * as jwt from "jsonwebtoken";
import fs from "fs/promises";
import * as luxon from "luxon";

const generateToken = (payload: Object) => {
    return jwt.sign(payload, process.env.SECRET_KEY!);
}

const getToken = (req: FastifyRequest) => {
    const headers = req.headers as { authorization: string };
    if(headers.authorization.startsWith('Bearer')){
        return headers.authorization?.split(' ')[1];
    }
}

const verifyToken = (req: FastifyRequest) => {
    return jwt.verify(getToken(req)!, process.env.SECRET_KEY!);
}

const updateUlasanToko = async (id_toko: string) => {
    const allUlasan = await models.getUlasanByToko(id_toko);
    let jumlahRating = 0;
    for(let i = 0; i < allUlasan.length; i++){
        jumlahRating += parseInt(allUlasan[i]['ulasan']['jumlah_rating']);
    }
    
    await models.updateUlasan(id_toko, (jumlahRating / allUlasan.length).toString().slice(0, 3));
}

export const getDataSiswa = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { nis: string };
    const nis = body.nis;

    try {
        const dataSiswa = await models.getSiswa(nis);
        if(dataSiswa.length === 1){
            const token = generateToken(dataSiswa[0]['siswa']);
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

export const signin = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addToken(data.nis, getToken(req)!);
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

export const signout = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.removeToken(data.nis);
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

export const getDataKelas = async (req: FastifyRequest, res: FastifyReply) => {
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

export const getDataToko = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        if(verifyToken(req)){
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
    const file = await req.file();
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[i][1] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    const get_id_kelas = await models.getKelasByNamaKelas(body[1]['id_kelas']);

    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const toko = await models.addToko(body[0]['nama_toko'], get_id_kelas[0]['id_kelas'], body[2]['deskripsi_toko']);

            const get_id_toko = await models.getTokoByNamaToko(body[0]['nama_toko']);
            await models.addToKelompok(get_id_toko[0]['id_toko'], data.nis);

            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${get_id_toko[0]['id_toko']}-${timestamp}.jpeg`;
                const banner_toko = await file.toBuffer();
                await fs.writeFile(`./public/${filename}`, banner_toko);
                await models.updateFotoProfilToko(get_id_toko[0]['id_toko'], `${filename}`);
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

export const updateFotoProfilToko = async (req: FastifyRequest, res: FastifyReply) => {
    const file = await req.file();
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
        if(verifyToken(req)){
            await fs.rm(`./public/${body[1]['old_image']}`);
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const filename = `${id_toko}-${timestamp}.jpeg`;
                const banner_toko = await file.toBuffer();
                await fs.writeFile(`./public/${filename}`, banner_toko);
                await models.updateFotoProfilToko(id_toko, `${filename}`);
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

export const updateDeskripsiToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string, nama_toko: string; deskripsi_toko: string; };
    try {
        if(verifyToken(req)){
            await models.updateDeskripsiToko(body.id_toko, body.deskripsi_toko);
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
    const body = req.body as { kode_unik: string; };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const toko: {[key: string]: any} = await models.getTokoByKodeUnik(body.kode_unik);
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
    const body = req.body as { id_toko: string };
    try {
        if(verifyToken(req)){
            const dataKelompok = await models.getKelompok(body.id_toko);
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
    const body = req.body as { id_toko: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.removeFromKelompok(body.id_toko, data.nis);
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
    const body = req.body as { id_toko: string };
    try {
        if(verifyToken(req)){
            await models.removeToko(body.id_toko);
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

export const updateJadwalToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string, is_open: boolean; };
    try {
        if(verifyToken(req)){
            await models.updateJadwalToko(body.id_toko, body.is_open);
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

export const getSelfKelompok = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const dataKelompok = await models.getSelfKelompok(data.nis);
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

export const getDataProduk = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        if(verifyToken(req)){
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

export const getProdukByIdProduk = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { id: string };
    try {
        if(verifyToken(req)){
            const dataProduk = await models.getProdukByIdProduk(params.id);
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
    const file = await req.file();
    const field = file as { fields: any };
    const fieldobject = Object.entries(field.fields);
    let body: {[key: string]: any} = [];
    for(let i = 0; i < fieldobject.length; i++){
        const data = fieldobject[i][1] as { fieldname: string; value: string; };
        body.push({ [data.fieldname]: data.value });
    }

    try {
        if(verifyToken(req)){
            const produk: {[key: string]: any} = await models.addProduk(body[0]['nama_produk'], body[1]['harga'], body[2]['stok'], body[3]['deskripsi_produk'], body[5]['id_toko']);
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
    const file = await req.file();
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
        if(verifyToken(req)){
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
    const body = req.body as { id_produk: string; nama_produk: string; harga: string; stok: number; deskripsi_produk: string; detail_produk: string; };

    try {
        if(verifyToken(req)){
            await models.updateProduk(body.id_produk, body.nama_produk, body.harga, body.stok, body.deskripsi_produk);
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
    const body = req.body as { id_produk: string };
    try {
        if(verifyToken(req)){
            await models.removeProduk(body.id_produk);
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
    const body = req.body as { query: string };
    try {
        if(verifyToken(req)){
            const searchProductResult = await models.getProdukByKeywords(body.query);
            const searchShopResult = await models.getTokoByKeywords(body.query);
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

export const getTokoByIdToko = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { id: string };
    try {
        if(verifyToken(req)){
            const dataToko = await models.getTokoByIdToko(params.id);
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
    const body = req.body as { id: string; qty: number; catatan: string; }
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addToKeranjang(body.id, data.nis, body.qty, body.catatan);
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

export const getKeranjang = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
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
    const body = req.body as { id: number; };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.removeFromKeranjang(body.id, data.nis);
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
    const body = req.body as { id: number; qty: number;};
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.updateJumlahKeranjang(body.qty, body.id, data.nis);
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

export const getPesanan = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { status: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const dataPesanan = await models.getPesanan(data.nis, body.status);
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

export const getPesananByToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string; status: string };
    try {
        if(verifyToken(req)){
            const dataPesanan = await models.getPesananByToko(body.id_toko, body.status);
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
    const body = req.body as { id_produk: string; jumlah: number; total_harga: number; catatan: string; alamat: string;};
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
            const kode_unik = Math.random().toString(36).substring(7).slice(0, 4);
            const pesanan = await models.addPesanan(`transaction-${data.nis}-${timestamp}${kode_unik}`, data.nis, body.id_produk, body.jumlah, body.total_harga, body.catatan, body.alamat);
            await models.updateJumlahTerjual(body.id_produk, body.jumlah);
            await models.clearKeranjang(data.nis);
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
    const body = req.body as { id_transaksi: string; status: string; };
    try {
        if(verifyToken(req)){
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

export const getNotifikasi = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { type: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const dataNotifikasi = await models.getNotifikasi(data.nis, body.type);
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

export const addNotifikasi = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { type: string; title: string; description: string; };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addNotifikasi(data.nis, body.type, body.title, body.description);
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

export const getNotifikasiToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string; type: string };
    try {
        if(verifyToken(req)){
            const dataNotifikasi = await models.getNotifikasiToko(body.id_toko, body.type);
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

export const addNotifikasiToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string; type: string; title: string; description: string; };
    try {
        if(verifyToken(req)){
            await models.addNotifikasiToko(body.id_toko, body.type, body.title, body.description);
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

export const getUlasan = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            const dataRating = await models.getUlasan(data.nis);
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

export const getUlasanByToko = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { id_toko: string; };
    try {
        if(verifyToken(req)){
            const dataRating = await models.getUlasanByToko(body.id_toko);
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
    const body = req.body as { id_produk: string; id_transaksi: string; ulasan: string; rating: string; id_toko: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addUlasan(data.nis, body.id_produk, body.id_transaksi, body.ulasan, body.rating)
            await updateUlasanToko(body.id_toko);
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

export const getFavorit = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
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
    const body = req.body as { id_toko: string; };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addToFavorit(body.id_toko, data.nis);
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
    const body = req.body as { id_toko: string; };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.removeFromFavorit(body.id_toko, data.nis);
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
    const body = req.body as { telepon: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.updateTelepon(data.nis, body.telepon);
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
    const body = req.body as { password: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.updatePassword(data.nis, body.password);
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

export const updateFotoProfilSiswa = async (req: FastifyRequest, res: FastifyReply) => {
    const file = await req.file();
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            if(file){
                const timestamp = luxon.DateTime.now().toFormat('yyyyLLddHHmmss');
                const foto_profil = await file.toBuffer();
                const filename = `${data.nis}-${timestamp}.jpeg`;
                await fs.writeFile(`./public/${filename}`, foto_profil);
                const siswa = await models.updateFotoProfilSiswa(data.nis, `${filename}`);
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

export const getAlamat = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
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
    const body = req.body as { address: string };
    try {
        const verify = verifyToken(req);
        const data = verify as { nis: string };
        if(verify){
            await models.addAlamat(data.nis, body.address);
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

export const updateAlamat = async (req: FastifyRequest, res: FastifyReply) => {
    const query = req.query as { id: number };
    const body = req.body as { address: string };
    try {
        if(verifyToken(req)){
            await models.updateAlamat(query.id, body.address);
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
    const body = req.body as { id_address: number };
    try {
        if(verifyToken(req)){
            await models.removeAlamat(body.id_address);
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

export const signinGuru = async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { nip: string; password: string; };
    try {
        const guru = await models.getGuru(body.nip);
        if(guru.length === 1){
            if(guru[0]['password'] === body.password){
                const token = generateToken(guru[0]);
                return res.status(200).send({
                    message: 'Success!',
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

export const getAllDataSiswaByGuru = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nip: string }
        if(verify){
            const datas = await models.getSiswaByGuru(data.nip);
            return res.status(200).send({
                data: datas
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const getAllDataKelasByGuru = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nip: string }
        if(verify){
            const datas = await models.getKelasByGuru(data.nip);
            return res.status(200).send({
                data: datas
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const getAllDataKelompokByGuru = async (req: FastifyRequest, res: FastifyReply) => {
    try {
        const verify = verifyToken(req);
        const data = verify as { nip: string }
        if(verify){
            const datas = await models.getKelompokByGuru(data.nip);
            return res.status(200).send({
                data: datas
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}

export const getTokoByIdKelas = async (req: FastifyRequest, res: FastifyReply) => {
    const params = req.params as { id: string }
    try {
        const verify = verifyToken(req);
        if(verify){
            const toko = await models.getTokoByIdKelas(params.id);
            return res.status(200).send({
                data: toko
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            message: error
        })
    }
}