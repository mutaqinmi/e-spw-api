import { and, eq, ilike } from 'drizzle-orm';
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

// export const getTodayBanner

export const getToko = async () : Promise<Array<any>> => {
    return await db.select().from(table.toko).leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas)).orderBy(table.toko.is_open);
}

export const getProduk = async () : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(eq(table.toko.is_open, true));
}

export const cariProduk = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk).leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko)).where(ilike(table.produk.nama_produk, `%${keywords}%`));
}

export const cariToko = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko).leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas)).where(ilike(table.toko.nama_toko, `%${keywords}%`));
}

export const getTokoById = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko).leftJoin(table.produk, eq(table.produk.id_toko, table.toko.id_toko)).where(eq(table.toko.id_toko, id_toko));
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