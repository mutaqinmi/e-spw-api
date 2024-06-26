import { sql } from "drizzle-orm";
import { integer, pgTable, serial, varchar, numeric, boolean, date, timestamp, unique } from "drizzle-orm/pg-core";

export const token = pgTable('token', {
    nomor_induk: varchar('nomor_induk'),
    token: varchar('token'),
})

export const siswa = pgTable('siswa', {
    nis: varchar('nis').primaryKey(),
    nama: varchar('nama', {length: 50}),
    kelas: varchar('id_kelas', {length: 10}).references(() => kelas.id_kelas, {onUpdate: "cascade", onDelete: "cascade"}),
    password: varchar('password'),
    telepon: varchar('telepon', {length: 20}).default(""),
    foto_profil: varchar('foto_profil', {length: 50}).default(""),
})

export const guru = pgTable('guru', {
    nip: varchar('nip').primaryKey(),
    nama: varchar('nama', {length: 50}),
    password: varchar('password', {length: 50}),
})

export const kelas = pgTable('kelas', {
    id_kelas: varchar('id_kelas', {length: 10}).primaryKey(),
    kelas: varchar('kelas', {length: 10}),
    program_keahlian: varchar('program_keahlian', {length: 50}),
    guru: varchar('nip').default("").references(() => guru.nip, {onUpdate: "cascade", onDelete: "cascade"}),
})

export const toko = pgTable('toko', {
    id_toko: varchar('id_toko', {length: 50}).primaryKey(),
    nama_toko: varchar('nama_toko', {length: 20}),
    id_kelas: varchar('id_kelas', {length: 10}).references(() => kelas.id_kelas, {onUpdate: "cascade", onDelete: "cascade"}),
    rating_toko: numeric('rating_toko').default("0.0"),
    deskripsi_toko: varchar('deskripsi_toko', {length: 255}),
    kode_unik: varchar('kode_unik', {length: 6}),
    is_open: boolean('is_open').default(false),
    foto_profil: varchar('foto_profil', {length: 255}).default(""),
}, (t) => ({
    unique: unique().on(t.nama_toko)
}))

export const kelompok = pgTable('kelompok', {
    id_toko: varchar('id_toko', {length: 50}).references(() => toko.id_toko, {onUpdate: "cascade", onDelete: "cascade"}),
    nis: varchar('nis').references(() => siswa.nis),
    tanggal_gabung: date('tanggal_gabung').default('CURRENT_TIMESTAMP'),
})

export const produk = pgTable('produk', {
    id_produk: varchar('id_produk', {length: 50}).primaryKey(),
    id_toko: varchar('id_toko', {length: 50}).references(() => toko.id_toko, {onUpdate: "cascade", onDelete: "cascade"}),
    nama_produk: varchar('nama_produk', {length: 50}),
    deskripsi_produk: varchar('deskripsi_produk', {length: 255}),
    jumlah_terjual: integer('jumlah_terjual').default(0),
    stok: integer('stok').default(0),
    harga: numeric('harga'),
    rating_produk: numeric('rating_produk').default("0.0"),
    foto_produk: varchar('foto_produk', {length: 255}).default(""),
})

export const keranjang = pgTable('keranjang', {
    id_keranjang: serial('id_keranjang').primaryKey(),
    nis: varchar('nis').references(() => siswa.nis),
    id_produk: varchar('id_produk', {length: 50}).references(() => produk.id_produk, {onUpdate: "cascade", onDelete: "cascade"}),
    jumlah: integer('jumlah').default(1),
    catatan: varchar('catatan', {length: 50}),
})

export const banner = pgTable('banner', {
    id_banner: serial('id_banner').primaryKey(),
    foto_banner: varchar('foto_banner', {length: 50}),
    tanggal: timestamp('tanggal').default(sql`CURRENT_TIMESTAMP`),
    id_toko: varchar('id_toko', {length: 50}).references(() => toko.id_toko, {onUpdate: "cascade", onDelete: "cascade"}),
})

export const alamat = pgTable('alamat', {
    id_alamat: serial('id_alamat').primaryKey(),
    nis: varchar('nis').references(() => siswa.nis, {onUpdate: "cascade", onDelete: "cascade"}),
    alamat: varchar('alamat', {length: 255}),
    default: boolean('default').default(true),
})

export const favorit = pgTable('favorit', {
    id_favorit: serial('id_favorit').primaryKey(),
    nis: varchar('nis').references(() => siswa.nis),
    toko: varchar('id_toko', {length: 50}).references(() => toko.id_toko, {onUpdate: "cascade", onDelete: "cascade"}),
})

export const notifikasi = pgTable('notifikasi', {
    id_notifikasi: serial('id_notifikasi').primaryKey(),
    nis: varchar('nis').references(() => siswa.nis, {onUpdate: "cascade", onDelete: "cascade"}),
    jenis_notifikasi: varchar('jenis_notifikasi', {length: 50}),
    waktu: timestamp('waktu', {withTimezone: true}).default(sql`CURRENT_TIMESTAMP`),
    judul_notifikasi: varchar('judul_notifikasi', {length: 255}),
    detail_notifikasi: varchar('detail_notifikasi', {length: 255}),
})

export const notifikasi_toko = pgTable('notifikasi_toko', {
    id_notifikasi: serial('id_notifikasi').primaryKey(),
    id_toko: varchar('id_toko', {length: 50}).references(() => toko.id_toko, {onUpdate: "cascade", onDelete: "cascade"}),
    jenis_notifikasi: varchar('jenis_notifikasi', {length: 50}),
    waktu: timestamp('waktu', {withTimezone: true}).default(sql`CURRENT_TIMESTAMP`),
    judul_notifikasi: varchar('judul_notifikasi', {length: 255}),
    detail_notifikasi: varchar('detail_notifikasi', {length: 255}),
})

export const transaksi = pgTable('transaksi', {
    id_transaksi: varchar('id_transaksi', {length: 50}).primaryKey(),
    nis: varchar('nis').references(() => siswa.nis, {onUpdate: "cascade", onDelete: "cascade"}),
    id_produk: varchar('id_produk', {length: 50}).references(() => produk.id_produk, {onUpdate: "cascade", onDelete: "cascade"}),
    jumlah: integer('jumlah'),
    total_harga: integer('total_harga'),
    status: varchar('status', {length: 50}),
    catatan: varchar('catatan', {length: 50}),
    alamat: varchar('alamat', {length: 255}),
    waktu: timestamp('waktu', {withTimezone: true}).default(sql`CURRENT_TIMESTAMP`),
})

export const ulasan = pgTable('ulasan', {
    id_ulasan: serial('id_ulasan').primaryKey(),
    nis: varchar('nis').references(() => siswa.nis, {onUpdate: "cascade", onDelete: "cascade"}),
    id_produk: varchar('id_produk', {length: 50}).references(() => produk.id_produk, {onUpdate: "cascade", onDelete: "cascade"}),
    id_transaksi: varchar('id_transaksi', {length: 50}).references(() => transaksi.id_transaksi, {onUpdate: "cascade", onDelete: "cascade"}),
    deskripsi_ulasan: varchar('deskripsi_ulasan', {length: 255}),
    jumlah_rating: numeric('jumlah_rating'),
    waktu: timestamp('waktu', {withTimezone: true}).default(sql`CURRENT_TIMESTAMP`),
})