import { and, desc, eq, ilike } from 'drizzle-orm';
import { client, db } from './connection';
import * as table from './schema';

client.connect();

export const addToken = async (nis: number, token: string) => {
    return await db.insert(table.token).values({
        nis: nis,
        token: token
    });
}

export const deleteToken = async (nis: number) => {
    return await db.delete(table.token).where(eq(table.token.nis, nis));
}

export const getToken = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.token).where(eq(table.token.nis, nis));
}

export const getDataSiswa = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.siswa).leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas)).where(eq(table.siswa.nis, nis));
}

export const updateProfilePicture = async (nis: number, foto_profil: string) => {
    return await db.update(table.siswa).set({ foto_profil: foto_profil }).where(eq(table.siswa.nis, nis)).returning();
}

export const deleteProfilePicture = async (nis: number) => {
    return await db.update(table.siswa).set({ foto_profil: null }).where(eq(table.siswa.nis, nis));
}

export const getKelas = async () : Promise<Array<any>> => {
    return await db.select().from(table.kelas);
}

export const getKelasByName = async (nama_kelas: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelas).where(eq(table.kelas.kelas, nama_kelas));
}

// export const getTodayBanner

export const getToko = async () : Promise<Array<any>> => {
    return await db.select().from(table.toko).leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas)).orderBy(desc(table.toko.is_open));
}

export const getTokoByName = async (nama_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko).where(eq(table.toko.nama_toko, nama_toko));
}

export const getTokoByKode = async (kode_unik: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko).where(eq(table.toko.kode_unik, kode_unik));
}

export const createToko = async (nama_toko: string, id_kelas: string, deskripsi_toko: string) => {
    const id_toko = `shop-${nama_toko.toLowerCase().split(' ').join('')}`;
    const kode_unik = Math.random().toString(36).substring(7).slice(0, 4);

    return await db.insert(table.toko).values({
        "id_toko": id_toko,
        "nama_toko": nama_toko,
        "id_kelas": id_kelas,
        "deskripsi_toko": deskripsi_toko,
        "kode_unik": kode_unik,
    }).returning();
}

export const deleteToko = async (id_toko: string) => {
    return await db.delete(table.toko).where(eq(table.toko.id_toko, id_toko));
}

export const updateJadwal = async (id_toko: string, is_open: boolean) => {
    return await db.update(table.toko).set({ is_open: is_open }).where(eq(table.toko.id_toko, id_toko));
}

export const updateBannerToko = async (id_toko: string, banner_toko: string) => {
    return await db.update(table.toko).set({ banner_toko: banner_toko }).where(eq(table.toko.id_toko, id_toko));
}

export const getProdukById = async (id_produk: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(eq(table.produk.id_produk, id_produk))
}

export const getProduk = async () : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(eq(table.toko.is_open, true));
}

export const cariProduk = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(ilike(table.produk.nama_produk, `%${keywords}%`));
}

export const addProduk = async (nama_produk: string, harga: string, stok: number, deskripsi_produk: string, detail_produk: string, id_toko: string) => {
    const product: {[key: string]: any} = await db.select().from(table.produk).where(eq(table.produk.id_toko, id_toko));
    let increment: number = 1;
    if(product.length > 0){
        increment = product?.length + parseInt(product[0]?.['id_produk'].split('-')[2]) ?? 0 + 1;
    }

    return await db.insert(table.produk).values({
        "id_produk": `product-${id_toko.split('-')[1]}-${increment}`,
        "id_toko": id_toko,
        "nama_produk": nama_produk,
        "detail_produk": detail_produk,
        "deskripsi_produk": deskripsi_produk,
        "stok": stok,
        "harga": harga,
    }).returning();
}

export const updateFotoProduk = async (id_produk: string, foto_produk: string) => {
    return await db.update(table.produk).set({ foto_produk: foto_produk }).where(eq(table.produk.id_produk, id_produk));
}

export const deleteProduk = async (id_produk: string) => {
    return await db.delete(table.produk).where(eq(table.produk.id_produk, id_produk));
}

export const cariToko = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko).leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas)).leftJoin(table.produk, eq(table.produk.id_toko, table.toko.id_toko)).where(ilike(table.toko.nama_toko, `%${keywords}%`));
}

export const getTokoById = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas)).where(eq(table.toko.id_toko, id_toko));
}

export const getAllDataKelompok = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelompok).leftJoin(table.siswa, eq(table.kelompok.nis, table.siswa.nis)).leftJoin(table.toko, eq(table.kelompok.id_toko, table.toko.id_toko)).leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas)).where(eq(table.kelompok.id_toko, id_toko));
}

export const getDataKelompok = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.kelompok).leftJoin(table.siswa, eq(table.kelompok.nis, table.siswa.nis)).leftJoin(table.toko, eq(table.kelompok.id_toko, table.toko.id_toko)).leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas)).where(eq(table.siswa.nis, nis));
}

export const addToKelompok = async (id_toko: string, nis: number) => {
    return await db.insert(table.kelompok).values({
        id_toko: id_toko,
        nis: nis
    });
}

export const removeFromKelompok = async (id_toko: string, nis: number) => {
    return await db.delete(table.kelompok).where(and(eq(table.kelompok.id_toko, id_toko), eq(table.kelompok.nis, nis)));
}

export const addToCart = async (id_produk: string, nis: number, jumlah: number) => {
    return await db.insert(table.keranjang).values({
        nis: nis,
        id_produk: id_produk,
        jumlah: jumlah
    });
}

export const addToFavorite = async (id_toko: string, nis: number) => {
    return await db.insert(table.favorit).values({
        toko: id_toko,
        nis: nis,
    });
}

export const getKeranjang = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.keranjang).leftJoin(table.produk, eq(table.keranjang.id_produk, table.produk.id_produk)).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(eq(table.keranjang.nis, nis));
}

export const deleteFromKeranjang = async (id_keranjang: number, nis: number) => {
    return await db.delete(table.keranjang).where(and(eq(table.keranjang.id_keranjang, id_keranjang), eq(table.keranjang.nis, nis)));
}

export const updateJumlahKeranjang = async (jumlah: number, id_keranjang: number, nis: number) => {
    return await db.update(table.keranjang).set({ jumlah: jumlah }).where(and(eq(table.keranjang.id_keranjang, id_keranjang), eq(table.keranjang.nis, nis)));
}

export const getPesanan = async (nis: number, status_pesanan: string) : Promise<Array<any>> => {
    return await db.select().from(table.transaksi).where(and(eq(table.transaksi.nis, nis), eq(table.transaksi.status, status_pesanan)));
}

export const getNotifikasi = async (nis: number, type: string) : Promise<Array<any>> => {
    return await db.select().from(table.notifikasi).where(and(eq(table.notifikasi.nis, nis), eq(table.notifikasi.jenis_notifikasi, type)));
}

export const getRiwayatUlasan = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.ulasan).where(eq(table.ulasan.nis, nis));
}

export const getFavorit = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.favorit).where(eq(table.favorit.nis, nis));
}

export const updateTelepon = async (nis: number, telepon: string) => {
    return await db.update(table.siswa).set({ telepon: telepon }).where(eq(table.siswa.nis, nis));
}

export const changePassword = async (nis: number, password: string) => {
    return await db.update(table.siswa).set({ password: password }).where(eq(table.siswa.nis, nis));
}

export const getAlamat = async (nis: number) : Promise<Array<any>> => {
    return await db.select().from(table.alamat).where(eq(table.alamat.nis, nis));
}

export const addAlamat = async (nis: number, alamat: string) => {    
    return await db.insert(table.alamat).values({
        nis: nis,
        alamat: alamat
    });
}

export const updateAlamat = async (id_alamat: number, alamat: string) => {
    return await db.update(table.alamat).set({ alamat: alamat }).where(eq(table.alamat.id_alamat, id_alamat));
}

export const deleteAlamat = async (id_alamat: number) => {  
    return await db.delete(table.alamat).where(eq(table.alamat.id_alamat, id_alamat));
}