import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { client, db } from './connection';
import * as table from './schema';

client.connect();

export const addToken = async (nomor_induk: string, token: string) => {
    return await db.insert(table.token).values({
        nomor_induk: nomor_induk,
        token: token
    });
}

export const removeToken = async (nomor_induk: string) => {
    return await db.delete(table.token)
        .where(eq(table.token.nomor_induk, nomor_induk));
}

export const getToken = async (token: string) : Promise<Array<any>> => {
    return await db.select().from(table.token)
        .where(eq(table.token.token, token));
}

export const getSiswa = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.siswa)
        .leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas))
        .where(eq(table.siswa.nis, nis));
}

export const updateFotoProfilSiswa = async (nis: string, foto_profil: string) => {
    return await db.update(table.siswa).set({ foto_profil: foto_profil })
        .where(eq(table.siswa.nis, nis))
        .returning();
}

export const getKelas = async () : Promise<Array<any>> => {
    return await db.select().from(table.kelas);
}

export const getKelasByNamaKelas = async (nama_kelas: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelas)
        .where(eq(table.kelas.kelas, nama_kelas));
}

export const getToko = async () : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .orderBy(desc(table.toko.is_open));
}

export const getTokoByNamaToko = async (nama_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .where(eq(table.toko.nama_toko, nama_toko));
}

export const getTokoByKodeUnik = async (kode_unik: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .where(eq(table.toko.kode_unik, kode_unik));
}

export const addToko = async (nama_toko: string, id_kelas: string, deskripsi_toko: string) => {
    return await db.insert(table.toko).values({
        "id_toko": `shop-${nama_toko.toLowerCase().split(' ').join('')}`,
        "nama_toko": nama_toko,
        "id_kelas": id_kelas,
        "deskripsi_toko": deskripsi_toko,
        "kode_unik": Math.random().toString(36).substring(7).slice(0, 4),
    }).returning();
}

export const updateDeskripsiToko = async (id_toko: string, deskripsi_toko: string) => {
    return await db.update(table.toko).set({ deskripsi_toko: deskripsi_toko })
        .where(eq(table.toko.id_toko, id_toko));
}

export const removeToko = async (id_toko: string) => {
    return await db.delete(table.toko)
        .where(eq(table.toko.id_toko, id_toko));
}

export const updateJadwalToko = async (id_toko: string, is_open: boolean) => {
    return await db.update(table.toko).set({ is_open: is_open })
        .where(eq(table.toko.id_toko, id_toko));
}

export const updateFotoProfilToko = async (id_toko: string, foto_profil: string) => {
    return await db.update(table.toko).set({ foto_profil: foto_profil })
        .where(eq(table.toko.id_toko, id_toko));
}

export const getProduk = async () : Promise<Array<any>> => {
    return await db.select().from(table.produk)
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .where(eq(table.toko.is_open, true));
}

export const getProdukByIdProduk = async (id_produk: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk)
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .where(eq(table.produk.id_produk, id_produk))
}

export const getProdukByKeywords = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk)
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .where(ilike(table.produk.nama_produk, `%${keywords}%`));
}

export const addProduk = async (nama_produk: string, harga: string, stok: number, deskripsi_produk: string, id_toko: string) => {
    const product: {[key: string]: any} = await db.select().from(table.produk).where(eq(table.produk.id_toko, id_toko));
    let increment: number = 1;
    if(product.length > 0){
        increment = product?.length + parseInt(product[0]?.['id_produk'].split('-')[2]) ?? 0 + 1;
    }

    return await db.insert(table.produk).values({
        "id_produk": `product-${id_toko.split('-')[1]}-${increment}`,
        "id_toko": id_toko,
        "nama_produk": nama_produk,
        "deskripsi_produk": deskripsi_produk,
        "stok": stok,
        "harga": harga,
    }).returning();
}

export const updateFotoProduk = async (id_produk: string, foto_produk: string) => {
    return await db.update(table.produk).set({ foto_produk: foto_produk })
        .where(eq(table.produk.id_produk, id_produk));
}

export const updateProduk = async (id_produk: string, nama_produk: string, harga: string, stok: number, deskripsi_produk: string) => {
    return await db.update(table.produk).set({ nama_produk: nama_produk, harga: harga, stok: stok, deskripsi_produk: deskripsi_produk })
        .where(eq(table.produk.id_produk, id_produk));
}

export const removeProduk = async (id_produk: string) => {
    return await db.delete(table.produk)
        .where(eq(table.produk.id_produk, id_produk));
}

export const getTokoByKeywords = async (keywords: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .leftJoin(table.produk, eq(table.produk.id_toko, table.toko.id_toko))
        .where(ilike(table.toko.nama_toko, `%${keywords}%`));
}

export const getTokoByIdToko = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.produk)
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .where(eq(table.toko.id_toko, id_toko));
}

export const getKelompok = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelompok)
        .leftJoin(table.siswa, eq(table.kelompok.nis, table.siswa.nis))
        .leftJoin(table.toko, eq(table.kelompok.id_toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas))
        .where(eq(table.kelompok.id_toko, id_toko));
}

export const getSelfKelompok = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelompok)
        .leftJoin(table.siswa, eq(table.kelompok.nis, table.siswa.nis))
        .leftJoin(table.toko, eq(table.kelompok.id_toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas))
        .where(eq(table.siswa.nis, nis));
}

export const addToKelompok = async (id_toko: string, nis: string) => {
    return await db.insert(table.kelompok).values({
        id_toko: id_toko,
        nis: nis
    });
}

export const removeFromKelompok = async (id_toko: string, nis: string) => {
    return await db.delete(table.kelompok)
        .where(and(eq(table.kelompok.id_toko, id_toko), eq(table.kelompok.nis, nis)));
}

export const addToKeranjang = async (id_produk: string, nis: string, jumlah: number, catatan: string) => {
    return await db.insert(table.keranjang).values({
        nis: nis,
        id_produk: id_produk,
        jumlah: jumlah,
        catatan: catatan
    });
}

export const getKeranjang = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.keranjang)
        .leftJoin(table.produk, eq(table.keranjang.id_produk, table.produk.id_produk))
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .where(eq(table.keranjang.nis, nis));
}

export const removeFromKeranjang = async (id_keranjang: number, nis: string) => {
    return await db.delete(table.keranjang)
        .where(and(eq(table.keranjang.id_keranjang, id_keranjang), eq(table.keranjang.nis, nis)));
}

export const clearKeranjang = async (nis: string) => {
    return await db.delete(table.keranjang)
        .where(eq(table.keranjang.nis, nis));
}

export const updateJumlahKeranjang = async (jumlah: number, id_keranjang: number, nis: string) => {
    return await db.update(table.keranjang).set({ jumlah: jumlah })
        .where(and(eq(table.keranjang.id_keranjang, id_keranjang), eq(table.keranjang.nis, nis)));
}

export const getPesanan = async (nis: string, status_pesanan: string) : Promise<Array<any>> => {
    return await db.select().from(table.transaksi)
        .leftJoin(table.produk, eq(table.transaksi.id_produk, table.produk.id_produk))
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .where(and(eq(table.transaksi.nis, nis), eq(table.transaksi.status, status_pesanan)))
        .orderBy(desc(table.transaksi.waktu))
}

export const getPesananByToko = async (id_toko: string, status_pesanan: string) : Promise<Array<any>> => {
    return await db.select().from(table.transaksi)
        .leftJoin(table.produk, eq(table.transaksi.id_produk, table.produk.id_produk))
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .leftJoin(table.siswa, eq(table.transaksi.nis, table.siswa.nis))
        .where(and(eq(table.toko.id_toko, id_toko), eq(table.transaksi.status, status_pesanan)))
        .orderBy(desc(table.transaksi.waktu));
}

export const addPesanan = async (id_transaksi: string, nis: string, id_produk: string, jumlah: number, total_harga: number, catatan: string, alamat: string) => {
    return await db.insert(table.transaksi).values({
        id_transaksi: id_transaksi,
        nis: nis,
        id_produk: id_produk,
        jumlah: jumlah,
        total_harga: total_harga,
        status: 'Menunggu Konfirmasi',
        catatan: catatan,
        alamat: alamat,
    }).returning();
}

export const updateJumlahTerjual = async (id_produk: string, jumlah: number) => {
    return await db.update(table.produk).set({ jumlah_terjual: sql`${table.produk.jumlah_terjual} + ${jumlah}` })
        .where(eq(table.produk.id_produk, id_produk));
}

export const updateStatusPesanan = async (id_transaksi: string, status: string) => {
    return await db.update(table.transaksi).set({ status: status })
        .where(eq(table.transaksi.id_transaksi, id_transaksi));
}

export const getNotifikasi = async (nis: string, type: string) : Promise<Array<any>> => {
    return await db.select().from(table.notifikasi)
        .where(and(eq(table.notifikasi.nis, nis), eq(table.notifikasi.jenis_notifikasi, type)))
        .orderBy(desc(table.notifikasi.waktu));
}

export const addNotifikasi = async (nis: string, jenis_notifikasi: string, judul_notifikasi: string, detail_notifikasi: string) => {
    return await db.insert(table.notifikasi).values({
        nis: nis,
        jenis_notifikasi: jenis_notifikasi,
        judul_notifikasi: judul_notifikasi,
        detail_notifikasi: detail_notifikasi
    });
}

export const getNotifikasiToko = async (id_toko: string, type: string) : Promise<Array<any>> => {
    return await db.select().from(table.notifikasi_toko)
        .where(and(eq(table.notifikasi_toko.id_toko, id_toko), eq(table.notifikasi.jenis_notifikasi, type)))
        .orderBy(desc(table.notifikasi.waktu));
}

export const addNotifikasiToko = async (id_toko: string, jenis_notifikasi: string, judul_notifikasi: string, detail_notifikasi: string) => {
    return await db.insert(table.notifikasi_toko).values({
        id_toko: id_toko,
        jenis_notifikasi: jenis_notifikasi,
        judul_notifikasi: judul_notifikasi,
        detail_notifikasi: detail_notifikasi
    });
}

export const getUlasan = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.ulasan)
        .leftJoin(table.transaksi, eq(table.ulasan.id_transaksi, table.transaksi.id_transaksi))
        .leftJoin(table.produk, eq(table.ulasan.id_produk, table.produk.id_produk))
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .where(eq(table.ulasan.nis, nis))
        .orderBy(desc(table.transaksi.waktu));
}

export const getUlasanByToko = async (id_toko: string) : Promise<Array<any>> => {
    return await db.select().from(table.ulasan)
        .leftJoin(table.transaksi, eq(table.ulasan.id_transaksi, table.transaksi.id_transaksi))
        .leftJoin(table.produk, eq(table.ulasan.id_produk, table.produk.id_produk))
        .leftJoin(table.toko, eq(table.produk.id_toko, table.toko.id_toko))
        .leftJoin(table.siswa, eq(table.ulasan.nis, table.siswa.nis))
        .leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas))
        .where(eq(table.toko.id_toko, id_toko))
        .orderBy(desc(table.transaksi.waktu));
}

export const updateUlasan = async (id_toko: string, jumlah_rating: string) => {
    return await db.update(table.toko).set({ rating_toko: jumlah_rating })
        .where(eq(table.toko.id_toko, id_toko));
}

export const addUlasan = async (nis: string, id_produk: string, id_transaksi: string, deskripsi_ulasan: string, jumlah_rating: string) => {
    return await db.insert(table.ulasan).values({
        nis: nis,
        id_produk: id_produk,
        id_transaksi: id_transaksi,
        deskripsi_ulasan: deskripsi_ulasan,
        jumlah_rating: jumlah_rating
    }).returning();
}

export const getFavorit = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.favorit)
        .leftJoin(table.toko, eq(table.favorit.toko, table.toko.id_toko))
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .where(eq(table.favorit.nis, nis));
}

export const addToFavorit = async (id_toko: string, nis: string) => {
    return await db.insert(table.favorit).values({
        toko: id_toko,
        nis: nis,
    });
}

export const removeFromFavorit = async (id_toko: string, nis: string) => {
    return await db.delete(table.favorit)
        .where(and(eq(table.favorit.toko, id_toko), eq(table.favorit.nis, nis)));
}

export const updateTelepon = async (nis: string, telepon: string) => {
    return await db.update(table.siswa).set({ telepon: telepon })
        .where(eq(table.siswa.nis, nis));
}

export const updatePassword = async (nis: string, password: string) => {
    return await db.update(table.siswa).set({ password: password })
        .where(eq(table.siswa.nis, nis));
}

export const getAlamat = async (nis: string) : Promise<Array<any>> => {
    return await db.select().from(table.alamat)
        .where(eq(table.alamat.nis, nis));
}

export const addAlamat = async (nis: string, alamat: string) => {    
    return await db.insert(table.alamat).values({
        nis: nis,
        alamat: alamat
    });
}

export const updateAlamat = async (id_alamat: number, alamat: string) => {
    return await db.update(table.alamat).set({ alamat: alamat })
        .where(eq(table.alamat.id_alamat, id_alamat));
}

export const removeAlamat = async (id_alamat: number) => {  
    return await db.delete(table.alamat)
        .where(eq(table.alamat.id_alamat, id_alamat));
}

export const getGuru = async (nip: string) : Promise<Array<any>> => {
    return await db.select().from(table.guru)
        .where(eq(table.guru.nip, nip));
}

export const getSiswaByGuru = async (nip: string) : Promise<Array<any>> => {
    return await db.select().from(table.siswa)
        .leftJoin(table.kelas, eq(table.siswa.kelas, table.kelas.id_kelas))
        .where(eq(table.kelas.guru, nip));
}

export const getKelasByGuru = async (nip: string) : Promise<Array<any>> => {
    return await db.select().from(table.kelas)
        .where(eq(table.kelas.guru, nip));
}

export const getKelompokByGuru = async (nip: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .where(eq(table.kelas.guru, nip));
}

export const getTokoByIdKelas = async (id_kelas: string) : Promise<Array<any>> => {
    return await db.select().from(table.toko)
        .leftJoin(table.kelas, eq(table.toko.id_kelas, table.kelas.id_kelas))
        .where(eq(table.kelas.id_kelas, id_kelas));
}