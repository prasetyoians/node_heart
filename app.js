const express = require('express')
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const http = require('http');

const ejs = require('ejs');



const session = require('cookie-session');
// const cors = require('cors');

// app.use(cors());

app.use(session({
  name: 'session',
    keys: ['yourSecretKey'],
    maxAge: 24 * 60 * 60 * 1000, 
  // Jika menggunakan store eksternal (contoh: Redis), tambahkan konfigurasi store di sini
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);






//page
app.get('/', require("./controller/response").index);
app.get('/mulai_olahraga', require("./controller/response").mulai_olahraga);
app.get('/login', require("./controller/response").login);
app.get('/logout', require("./controller/response").logout);
app.post('/login_form', require("./controller/response").login_form);
app.get('/detak', require("./controller/response").detak);
app.get('/nafas', require("./controller/response").nafas);
app.get('/suhu', require("./controller/response").suhu);
app.get('/akselo', require("./controller/response").akselo);
app.get('/jadwal', require("./controller/response").jadwal);
app.get('/register', require("./controller/response").register);
app.post('/register_form', require("./controller/response").register_form);




app.get('/senddatatosps', require("./controller/response").sendDataToSps);
app.get('/getdata', require("./controller/response").getData);
app.get('/reload', require("./controller/response").reload);
app.get('/heartnew', require("./controller/response").heartNew);
app.get('/oxynew', require("./controller/response").oxyNew);
app.get('/geraknew', require("./controller/response").gerakNew);
app.get('/suhunew', require("./controller/response").suhuNew);
app.get('/show_grafik_detak_oxy_suhu', require("./controller/response").show_grafik_detak_oxy_suhu);
app.get('/show_bar_atas', require("./controller/response").show_bar_atas);
app.get('/show_table_index', require("./controller/response").show_table_index);
app.get('/total_olahraga', require("./controller/response").total_olahraga);
app.get('/detak_oxy_suhu_mulai_olahraga', require("./controller/response").detak_oxy_suhu_mulai_olahraga);
app.get('/detak_oxy_suhu_mulai_olahraga_now', require("./controller/response").detak_oxy_suhu_mulai_olahraga_now);
app.get('/table_mulai_olahraga', require("./controller/response").table_mulai_olahraga);
app.get('/riwayat_olahraga', require("./controller/response").riwayat_olahraga);
app.get('/table_riwayat_olahraga', require("./controller/response").table_riwayat_olahraga);
app.get('/keaktifan_1', require("./controller/response").keaktifan_1);
app.get('/keaktifan_2', require("./controller/response").keaktifan_2);
app.get('/hrmax', require("./controller/response").hrMax);
app.get('/hrmin', require("./controller/response").hrMin);
app.get('/oxymax', require("./controller/response").oxyMax);
app.get('/oxymin', require("./controller/response").oxyMin);
app.get('/pergerakan_sekarang', require("./controller/response").pergerakan_sekarang);

app.get('/sendakselo', require("./controller/response").sendAkselo);



//CRUD
// Endpoint untuk membuat jadwal
app.post('/tambah-jadwal', require("./controller/response").buatJadwal);
// Endpoint untuk mengambil semua jadwal
app.get('/getAll-jadwal', require("./controller/response").getAllJadwal);
// Endpoint untuk mengambil jadwal berdasarkan ID
app.get('/get-jadwal-by-id/:id', require("./controller/response").getJadwalById);
// Endpoint untuk memperbarui jadwal berdasarkan ID
app.get('/update-jadwal', require("./controller/response").updateJadwal);
// Endpoint untuk menghapus jadwal berdasarkan ID
app.get('/del-jadwal', require("./controller/response").deleteJadwal);



app.post('/add_mulai_olahraga', require("./controller/response").add_mulai_olahraga);
app.get('/stop_olahraga', require("./controller/response").stop_olahraga);
app.get('/insertDataToHeart', require("./controller/response").insertDataToHeart);


//cek jadwal
app.get('/cek_jadwal', require("./controller/response").cek_jadwal);

app.get('/bantuan', require("./controller/response").bantuan);
app.get('/profil', require("./controller/response").profil);
app.post('/save_profil', require("./controller/response").save_profil);


//Super admin

app.get('/login_super_admin', require("./controller/response").login_super_admin);
app.get('/logout_super_admin', require("./controller/response").logout_super_admin);
app.post('/login_form_super_admin', require("./controller/response").login_form_super_admin);
app.get('/index_super_admin', require("./controller/response").index_super_admin);
app.get('/show_by_jenis_olahraga', require("./controller/response").show_by_jenis_olahraga);
app.get('/show_by_jenis_kelamin', require("./controller/response").show_by_jenis_kelamin);
app.get('/show_by_usia', require("./controller/response").show_by_usia);
app.get('/show_by_user', require("./controller/response").show_by_user);

app.get('/jantung_super_admin', require("./controller/response").jantung_super_admin);
app.get('/show_rata_by_jenis_olahraga', require("./controller/response").show_rata_by_jenis_olahraga);
app.get('/show_rata_by_usia', require("./controller/response").show_rata_by_usia);
app.get('/show_rata_by_jenis_kelamin', require("./controller/response").show_rata_by_jenis_kelamin);
app.get('/show_hasil_pengukuran', require("./controller/response").show_hasil_pengukuran);
app.get('/show_total_rata', require("./controller/response").show_total_rata);
app.get('/show_max', require("./controller/response").show_max);
app.get('/show_min', require("./controller/response").show_min);
app.get('/show_table_admin', require("./controller/response").show_table_admin);

app.get('/oxy_super_admin', require("./controller/response").oxy_super_admin);
app.get('/suhu_super_admin', require("./controller/response").suhu_super_admin);
app.get('/user_super_admin', require("./controller/response").user_super_admin);
app.get('/show_table_user_super_admin', require("./controller/response").show_table_user_super_admin);
app.get('/show_modal_detail_user_super_admin', require("./controller/response").show_modal_detail_user_super_admin);



app.listen(port, () => {
  console.log(`Example app listening on port 3000}`)
})


function replaceIncludes(content, headerFileName, footerFileName) {
  // Read the content of the include files and replace the placeholders
  const headerPath = path.join(__dirname, 'views', headerFileName);
  const footerPath = path.join(__dirname, 'views', footerFileName);
  
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const footerContent = fs.readFileSync(footerPath, 'utf8');

  const headerPathSuperAdmin = path.join(__dirname, 'views/super_admin', headerFileName);
  const footerPathSuperAdmin = path.join(__dirname, 'views/super_admin', footerFileName);
  
  const headerContentSuperAdmin = fs.readFileSync(headerPathSuperAdmin, 'utf8');
  const footerContentSuperAdmin = fs.readFileSync(footerPathSuperAdmin, 'utf8');
  
  // Replace placeholders in the main content
  content = content.replace(/<%- include\('header.html'\) %>/g, headerContent);
  content = content.replace(/<%- include\('footer.html'\) %>/g, footerContent);
  content = content.replace(/<%- include\('header_super_admin.html'\) %>/g, headerContentSuperAdmin);
  content = content.replace(/<%- include\('footer_super_admin.html'\) %>/g, footerContentSuperAdmin);

  return content;
}
