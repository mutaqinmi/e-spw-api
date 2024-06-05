/*
Ini adalah file pusat pengolahan data dari server API ke Views
Data diambil menggunakan method fetch() yang kemudian dikirim oleh JQuery DOM untuk ditampilkan kepada client

!Penting: File ini bersifat sementara, sampai developer menemukan solusi yang lebih efisien
*/

$(() => {
    fetch("http://localhost:8000/data").then(async res => {
        const data = await res.json();

        $("#jumlah-kelas").html(data.dataBase[0].jumlah_kelas);
        $("#jumlah-kelompok").html(data.dataBase[0].jumlah_kelompok);
        $("#jumlah-siswa").html(data.dataBase[0].jumlah_siswa);
    })
})