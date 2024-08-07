const axios = require('axios');
const fs = require('fs');
const pool = require('../koneksi_db/koneksi');
const http = require('http');

var url = require('url');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const secretKey = "yourSecretKey"; // Ganti dengan kunci rahasia yang kuat






// Konfigurasi passport untuk otentikasi lokal

function count_user_pass(username,password){

  var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT count(*) as counts FROM users WHERE username='"+username+"' AND  password ='"+password+"' ", (err, result) => {
  console.log( result);

  const hasil = result.rows[0].counts;

   resolve(hasil);

    });
  });
}


function count_user_pass_super_admin(username,password){

  var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT count(*) as counts FROM super_users WHERE username='"+username+"' AND  password ='"+password+"' ", (err, result) => {
  console.log( result);

  const hasil = result.rows[0].counts;

   resolve(hasil);

    });
  });
}


async function login(req,res){
 pool.query('SELECT a.* FROM alat as a  LEFT JOIN users as b on a.id_alat = b.id_alat WHERE b.id_alat IS NULL', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function 


res.render('views/login',{
  data:data,
});
});


}


async function login_super_admin(req,res){

  // Pass data to your HTML rendering function 


res.render('views/super_admin/login_super_admin');



}


async function login_form_super_admin(req,res){
  const username = req.body.username;
  const password = req.body.password;

console.log("username: "+username);
console.log("pass: "+password);


let c = await count_user_pass_super_admin(username,password);

console.log(c);
  if (c > 0) {

    pool.query("SELECT * FROM super_users WHERE username='"+username+"' AND  password ='"+password+"' ORDER BY id_super_user DESC LIMIT 1", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = result.rows;
   
     req.session.super_admin = { id_super_user: data[0].id_user, username: data[0].username,userpot: data[0].username.substring(0, 1) };
    res.status(200).json({pesan:"LOGIN BERHASIL",status:1});

  });



}else{
  console.log("username pass salah");
    res.status(200).json({pesan:"LOGIN GAGAL",status:0});

}

}



async function logout_super_admin(req,res){
     req.session = null;

  // Redirect atau lakukan tindakan lain sesuai kebutuhan
  res.redirect('/login_super_admin');
}

async function login_form(req,res){
  const username = req.body.username;
  var password = req.body.password;
 password = crypto.createHash('md5').update(password).digest('hex');

console.log("username: "+username);
console.log("pass: "+password);


let c = await count_user_pass(username,password);

console.log(c);
  if (c > 0) {

    pool.query("SELECT * FROM users WHERE username='"+username+"' AND  password ='"+password+"' ORDER BY id_user DESC LIMIT 1", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = result.rows;
   
     req.session.user = { id_user: data[0].id_user, username: data[0].username,userpot: data[0].username.substring(0, 1) };
    res.status(200).json({pesan:"LOGIN BERHASIL",status:1});

  });



}else{
  console.log("username pass salah");
    res.status(200).json({pesan:"LOGIN BERHASIL",status:0});

}

}

async function logout(req,res){
     req.session = null;

  // Redirect atau lakukan tindakan lain sesuai kebutuhan
  res.redirect('/login');
}


async function register(req,res){
  pool.query('SELECT a.* FROM alat as a  LEFT JOIN users as b on a.id_alat = b.id_alat WHERE b.id_alat IS NULL', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function 


res.render('views/register',{
  data:data,
});
});

}


async function show_kode_alat(username){
 return new Promise((resolve, reject) => {
  pool.query("SELECT * from alat ", (err, result) => {
 
  const hasil = result.rows;
   resolve(hasil);

    });
  });
}


async function show_users(username){
 return new Promise((resolve, reject) => {
  pool.query("SELECT * from users ", (err, result) => {
 
  const hasil = result.rows;
   resolve(hasil);

    });
  });
}


async function show_jenis_olahraga(){
 return new Promise((resolve, reject) => {
  pool.query("SELECT * from jenis_olahraga ", (err, result) => {
 
  const hasil = result.rows;
   resolve(hasil);

    });
  });
}

async function profil(req,res){
   const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;
let id_user = req.session.user.id_user;
let kode_alat = await show_kode_alat();
   if (!req.session.user) {
     res.redirect('/login');
   }else{
     pool.query('SELECT * from users WHERE id_user='+id_user, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
  const data = result.rows;
  // Pass data to your HTML rendering function 

res.render('views/profil',{ currentPath: '/profil' ,session:userData,data:data,kode_alat:kode_alat});
});
   }
}


async function save_profil(req,res){
    const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;
let id_user = req.session.user.id_user;

 const username = req.body.username;
  var password = req.body.password;
 password = crypto.createHash('md5').update(password).digest('hex');

  const nama = req.body.nama;
  const usia = req.body.usia;
  const jenis_kelamin = req.body.jenis_kelamin;
  const id_alat = req.body.id_alat;


  const updateQuery = "UPDATE users SET username ='"+username+"',password ='"+password+"',nama ='"+nama+"',usia ='"+usia+"',id_alat ='"+id_alat+"',jenis_kelamin ='"+jenis_kelamin+"' WHERE id_user = "+id_user;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Data berhasil diperbarui" });
  } catch (error) {
    console.error("data gagal diubah", error);
  console.log(updateQuery);

    res.status(500).json({ message: "Gagal memperbarui data" });
  }

}


async function cek_user_ada(username){
 return new Promise((resolve, reject) => {
  pool.query("SELECT count(*) as counts FROM users WHERE nama='"+username+"' ", (err, result) => {
 
  const hasil = result.rows[0].counts;
   resolve(hasil);

    });
  });
}

async function register_form(req,res){
 const username = req.body.username;
  var password = req.body.password;
  const nama = req.body.nama;
  const usia = req.body.usia;
  const jenis_kelamin = req.body.jenis_kelamin;
  const id_alat = req.body.id_alat;

var password = crypto.createHash('md5').update(password).digest('hex');


const insertQuery = 'INSERT INTO users(username, password,nama,usia,jenis_kelamin,id_alat) VALUES($1,$2,$3,$4,$5,$6) RETURNING *';

 const kirim = await pool.query(insertQuery, [username, password,nama,usia,jenis_kelamin,id_alat]);
    // console.log(insertQuery);
  console.log(kirim);
  if (kirim.rowCount !== 1) {
 
     res.json({pesan:"REG GAGAL",status:0});
  } else {
    res.status(200).json({pesan:"REG BERHASIL",status:1});

  }
  // pool.end();


  }



async function index_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;


let jenis_olahraga = await show_jenis_olahraga();
let users = await show_users();

   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/index_super_admin',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga,users:users});

   }



}



//users
async function user_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;


let kode_alat = await show_kode_alat();

   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/user_super_admin',{ currentPath: '/' ,session:userData,kode_alat:kode_alat});

   }



}



async function show_table_user_super_admin(req,res){
var search = req.query.search;

if (search == "") {
pool.query("SELECT a.nama,a.username,a.id_user,a.jenis_kelamin,a.usia,d.kode_alat FROM users as a INNER JOIN mulai_olahraga as b on a.id_user = b.id_user INNER JOIN heart as c on b.id_mulai_olahraga = c.id_mulai_olahraga INNER JOIN alat as d on a.id_alat = d.id_alat GROUP BY a.id_user,d.kode_alat  ORDER BY a.nama ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}else{

 pool.query("SELECT a.nama,a.username,a.id_user,a.jenis_kelamin,a.usia,d.kode_alat FROM users as a INNER JOIN mulai_olahraga as b on a.id_user = b.id_user INNER JOIN heart as c on b.id_mulai_olahraga = c.id_mulai_olahraga INNER JOIN alat as d on a.id_alat = d.id_alat WHERE a.nama LIKE '%"+search+"%'  OR a.username LIKE '%"+search+"%' OR d.kode_alat LIKE '%"+search+"%' OR a.jenis_kelamin LIKE '%"+search+"%'  GROUP BY a.id_user, d.kode_alat    ORDER BY a.nama ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

 

}


async function show_modal_detail_user_super_admin(req,res){

id_user = req.query.id_user;

pool.query("SELECT AVG(c.hr) as avghr,AVG(c.spo2) as avgoxy,AVG(c.suhu)  as avgsuhu,MAX(hr) as maxhr,MAX(spo2) as maxoxy,MAX(suhu) as maxsuhu,MIN(hr) as minhr,MIN(spo2) as minoxy,MIN(suhu) as minsuhu, a.nama,a.username,a.id_user,a.jenis_kelamin,a.usia,d.kode_alat FROM users as a INNER JOIN mulai_olahraga as b on a.id_user = b.id_user INNER JOIN heart as c on b.id_mulai_olahraga = c.id_mulai_olahraga INNER JOIN alat as d on a.id_alat = d.id_alat WHERE a.id_user = "+id_user+" GROUP BY a.id_user,d.kode_alat ORDER BY a.nama ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}



async function edit_user_super_admin(req,res){

id_user = req.query.id_user;

pool.query("SELECT * FROM users WHERE id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}


async function update_user_super_admin(req, res) {
  const id_user = req.query.id_user;
  const nama = req.query.nama;
  const username = req.query.username;
  const usia = req.query.usia;
  const jenis_kelamin = req.query.jenis_kelamin;
  const id_alat = req.query.id_alat;

  const updateQuery = "UPDATE users SET nama ='"+nama+"',username ='"+username+"',usia ='"+usia+"',jenis_kelamin ='"+jenis_kelamin+"',id_alat ="+id_alat+" WHERE id_user = "+id_user;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}



async function delete_user_super_admin(req, res) {
  const id_user = req.query.id_user;

  const updateQuery = "DELETE FROM users WHERE id_user="+id_user;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}


//end user

//alat

async function alat_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;



   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/alat_super_admin',{ currentPath: '/' ,session:userData});

   }



}



async function show_table_alat_super_admin(req,res){
var search = req.query.search;

if (search == "") {
pool.query("SELECT * FROM alat ORDER BY id_alat ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}else{

 pool.query("SELECT * FROM alat WHERE kode_alat LIKE '%"+search+"%'  OR nama_alat LIKE '%"+search+"%'   ORDER BY id_alat ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

 

}

async function edit_alat_super_admin(req,res){

id_alat = req.query.id_alat;

pool.query("SELECT * FROM alat WHERE id_alat="+id_alat, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}



async function tambah_alat_super_admin(req, res) {

  const kode_alat = req.query.kode_alat;
  const nama_alat = req.query.nama_alat;

  const updateQuery = "INSERT INTO alat (nama_alat,kode_alat) VALUES ('"+nama_alat+"','"+kode_alat+"')";
  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}

async function update_alat_super_admin(req, res) {
  const id_alat = req.query.id_alat;
  const kode_alat = req.query.kode_alat;
  const nama_alat = req.query.nama_alat;

  const updateQuery = "UPDATE alat SET kode_alat ='"+kode_alat+"',nama_alat ='"+nama_alat+"' WHERE id_alat = "+id_alat;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}



async function delete_alat_super_admin(req, res) {
  const id_alat = req.query.id_alat;

  const updateQuery = "DELETE FROM alat WHERE id_alat="+id_alat;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}


//end alat

//admin jenis olahraga


async function jenis_olahraga_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;



   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/jenis_olahraga_super_admin',{ currentPath: '/' ,session:userData});

   }



}



async function show_table_jenis_olahraga_super_admin(req,res){
var search = req.query.search;

if (search == "") {
pool.query("SELECT * FROM jenis_olahraga ORDER BY id_jenis_olahraga ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}else{

 pool.query("SELECT * FROM jenis_olahraga WHERE keterangan LIKE '%"+search+"%'  OR nama_olahraga LIKE '%"+search+"%'   ORDER BY id_jenis_olahraga ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

 

}

async function edit_jenis_olahraga_super_admin(req,res){

id_jenis_olahraga = req.query.id_jenis_olahraga;

pool.query("SELECT * FROM jenis_olahraga WHERE id_jenis_olahraga="+id_jenis_olahraga, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});

}



async function tambah_jenis_olahraga_super_admin(req, res) {

  const keterangan = req.query.keterangan;
  const nama_olahraga = req.query.nama_olahraga;

  const updateQuery = "INSERT INTO jenis_olahraga (nama_olahraga,keterangan) VALUES ('"+nama_olahraga+"','"+keterangan+"')";
  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}

async function update_jenis_olahraga_super_admin(req, res) {
  const id_jenis_olahraga = req.query.id_jenis_olahraga;
  const keterangan = req.query.keterangan;
  const nama_olahraga = req.query.nama_olahraga;

  const updateQuery = "UPDATE jenis_olahraga SET keterangan ='"+keterangan+"',nama_olahraga ='"+nama_olahraga+"' WHERE id_jenis_olahraga = "+id_jenis_olahraga;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}



async function delete_jenis_olahraga_super_admin(req, res) {
  const id_jenis_olahraga = req.query.id_jenis_olahraga;

  const updateQuery = "DELETE FROM jenis_olahraga WHERE id_jenis_olahraga="+id_jenis_olahraga;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Sukses" });
  } catch (error) {
    console.error("Gagal ", error);
    res.status(500).json({ message: "Gagal " });
  }
}

//end jenis olahraga


async function jantung_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;


let jenis_olahraga = await show_jenis_olahraga();
let users = await show_users();

   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/jantung_super_admin',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga,users:users});

   }



}


async function oxy_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;


let jenis_olahraga = await show_jenis_olahraga();
let users = await show_users();

   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/oxy_super_admin',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga,users:users});

   }



}



async function suhu_super_admin(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.super_admin;


let jenis_olahraga = await show_jenis_olahraga();
let users = await show_users();

   if (!req.session.super_admin) {
     res.redirect('/login_super_admin');
   }else{

res.render('views/super_admin/suhu_super_admin',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga,users:users});

   }



}



async function index(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  
let jenis_olahraga = await show_jenis_olahraga();

   if (!req.session.user) {
     res.redirect('/login');
   }else{

res.render('views/index',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga});

   }


}

async function bantuan(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

   if (!req.session.user) {
     res.redirect('/login');
   }else{

res.render('views/bantuan',{ currentPath: '/' ,session:userData});

   }



}


async function mulai_olahraga(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

let jenis_olahraga = await show_jenis_olahraga();

   if (!req.session.user) {
     res.redirect('/login');
   }else{

res.render('views/mulai_olahraga',{ currentPath: '/' ,session:userData,jenis_olahraga:jenis_olahraga});

   }



}




async function riwayat_olahraga(req,res){
  const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

   if (!req.session.user) {
     res.redirect('/login');
   }else{

res.render('views/riwayat_olahraga',{ currentPath: '/' ,session:userData});

   }



}

async function add_mulai_olahraga(req,res){
  const {  tempat, id_jenis_olahraga_mulai_olahraga,status } = req.body;
let id_user = req.session.user.id_user;


  const insertQuery =
    "INSERT INTO mulai_olahraga ( tempat,id_jenis_olahraga,status,id_user) VALUES ($1, $2,$3,$4) RETURNING id_mulai_olahraga";
console.log(insertQuery);
  try {
    const result = await pool.query(insertQuery, [
      
      tempat,
      id_jenis_olahraga_mulai_olahraga,
      status,
      id_user,
    ]);

    const id_mulai_olahraga = result.rows[0].id_mulai_olahraga;
    const response = {
      message: "Mulai Olahraga berhasil ditambahkan",
      id_mulai_olahraga: id_mulai_olahraga,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Gagal menambahkan mulai olahraga", error);
    res.status(500).json({ message: "Gagal menambahkan mulai olahraga" });
  }
}


async function stop_olahraga(req, res) {
  const id_mulai_olahraga = req.query.id_mulai_olahraga;

  const updateQuery = "UPDATE mulai_olahraga SET status ='Berhenti' WHERE id_mulai_olahraga = "+id_mulai_olahraga;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Olahraga telah dihentikan" });
  } catch (error) {
    console.error("Gagal memperbarui olahraga", error);
    res.status(500).json({ message: "Gagal memperbarui olahraga" });
  }
}


async function insertDataToHeart(req,res){




  const data = req.body;

  var hr = req.query.hr;
  var spo2 = req.query.spo2;
  var suhu = req.query.suhu;
  var kode_alat = req.query.kode_alat;
  var runtime = req.query.runtime;



var id_user = await cari_user_by_kode_alat(kode_alat);
var id_mulai_olahraga = await cari_id_mulai_olahraga_terakhir_by_id_user(id_user);

var status = await cek_status_mulai_olahraga(id_mulai_olahraga);


if (status == "Dimulai") {



const json = {
      "hr": hr,
      "spo2": spo2,
      "suhu": suhu,
      "id_user": id_user,
      "id_mulai_olahraga": id_mulai_olahraga,
      "runtime": runtime,
     
      
    
  };






const insertQuery = 'INSERT INTO heart (hr, spo2,suhu,id_user,id_mulai_olahraga,runtime) VALUES($1,$2,$3,$4,$5,$6) RETURNING *';



await pool.query(insertQuery, [hr, spo2, suhu,id_user,id_mulai_olahraga,runtime], (err, res) => {
    console.log(insertQuery);
  
  if (err) {
    console.error(err);
  } else {
    console.log(`Inserted row with ID: ${res.rows[0].id}`);
  }
  // pool.end();
});


console.log(json);;
res.status(200).json(json);


}else{
  const json = {
      "pesan": "gagal",
    
  };

console.log(json);;
res.status(200).json(json);


}

 


}



async function getData(req,res){
let id_user = req.session.user.id_user;
	pool.query('SELECT * FROM heart WHERE id_user='+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function 


res.render('views/fromdb',{
	data:data,
});

});


}



async function reload(req,res){

  var dari = req.query.dari;
  var sampai = req.query.sampai;

let id_user = req.session.user.id_user;
  

	pool.query("SELECT * FROM heart WHERE timestamp >='"+dari+"' AND timestamp <='"+sampai+"' AND  id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function


	res.status(200).json(data);


});


}


async function heartNew(req,res){
let id_user = req.session.user.id_user;

	pool.query('SELECT hr,timestamp FROM heart WHERE id_user='+id_user+' order by id DESC LIMIT 1', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

	res.status(200).json(heart);


});


}


async function oxyNew(req,res){
let id_user = req.session.user.id_user;

  pool.query('SELECT spo2 FROM heart WHERE id_user='+id_user+' order by id DESC LIMIT 1', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});


}



async function suhuNew(req,res){
let id_user = req.session.user.id_user;

  pool.query('SELECT suhu FROM heart WHERE id_user='+id_user+' order by id DESC LIMIT 1', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});


}



async function gerakNew(req,res){
let id_user = req.session.user.id_user;

  pool.query('SELECT nomor FROM akselo  WHERE id_user='+id_user+' order by id_akselo DESC LIMIT 1', (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});


}



function count_users(nama){

  var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT count(*) as counts FROM users WHERE nama='"+nama+"' ", (err, result) => {
 
  const hasil = result.rows[0].counts;
   resolve(hasil);

    });
  });
}

async function cari_user_by_kode_alat(kode_alat){
 var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT b.id_user FROM alat as a INNER JOIN users as b on a.id_alat = b.id_alat  WHERE a.kode_alat='"+kode_alat+"' ", (err, result) => {
 
  const id_user = result.rows[0].id_user;
   resolve(id_user);

    });
  });

}


async function cari_id_mulai_olahraga_terakhir_by_id_user(id_user){
 var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT id_mulai_olahraga from mulai_olahraga WHERE id_user ="+id_user+" ORDER BY id_mulai_olahraga DESC LIMIT 1", (err, result) => {
 
  const id_mulai_olahraga = result.rows[0].id_mulai_olahraga;
   resolve(id_mulai_olahraga);

    });
  });

}





async function cek_status_mulai_olahraga(id_mulai_olahraga){
 var arr_hasil = [];
  return new Promise((resolve, reject) => {
  pool.query("SELECT status FROM mulai_olahraga WHERE id_mulai_olahraga="+id_mulai_olahraga, (err, result) => {
 
  const status = result.rows[0].status;
   resolve(status);

    });
  });

}


async function sendDataToSps(req,res){




	const data = req.body;

  var spo2 = req.query.spo2;
  var hr = req.query.hr;
  var akselox = req.query.akselox;
  var akseloy = req.query.akseloy;
  var akseloz = req.query.akseloz;
  var suhu = req.query.suhu;
  var encoded = req.query.encoded;

//const response = await axios.get("https://script.google.com/macros/s/AKfycbwhi0FRPnUyq_5dFZkBcD4na8z0sB1DFYtJ-05DIn_C8l4ezb2NV5CMB_gmeDl2Urv3cg/exec?hr="+hr+"&spo2="+spo2+"&akselox="+akselox+"&akseloy="+akseloy+"&akseloz="+akseloz);



  let decoded = verifyToken(encoded);
  //tambahono fungsi nggo nge count data heart seng podo jeneng e ian
  var id_user = await cari_user_by_kode_alat(decoded.kode_alat);


if (id_user !== null) {

  


const json = {
			"spo2": spo2,
			"hr": hr,
			"akselox": akselox,
			"akseloy": akseloy,
			"akseloz": akseloz,
      "suhu": suhu,
      "kode_alat": decoded.kode_alat,
      "encoded": encoded,
      "decoded": decoded,
      "pesan": "username ada, anda boleh memasukan data",
		
	};



const insertQuery = 'INSERT INTO heart(hr, spo2,akselox,akseloy,akseloz,suhu,id_user) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *';

const userData = {
			spo2: spo2,
			hr: hr,
			akselox: akselox,
			akseloy: akseloy,
			akseloz: akseloz,
      suhu: suhu,
			id_user:  id_user,
		
	};


await pool.query(insertQuery, [hr, spo2, akselox,akseloy,akseloz,suhu,id_user], (err, res) => {
    // console.log(insertQuery);
	
  if (err) {
    console.error(err);
  } else {
    console.log(`Inserted row with ID: ${res.rows[0].id}`);
  }
  // pool.end();
});


console.log(json);;
res.status(200).json(json);
}else{
res.status(200).json({pesan:"Username tidak ada, anda tidak boleh memasukan data."});

}


 


}




async function show_grafik_detak_oxy_suhu(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;

if(id_jenis_olahraga == 0){
 pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"'  AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}else{
   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

}



async function show_by_jenis_olahraga(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND a.id_user="+id_user;

}else{
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user;

}

 pool.query("SELECT COUNT(a.id_mulai_olahraga) as counts,b.nama_olahraga FROM mulai_olahraga as a INNER JOIN jenis_olahraga as b on a.id_jenis_olahraga = b.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY a.id_jenis_olahraga,b.id_jenis_olahraga,b.nama_olahraga", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_rata_by_jenis_olahraga(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

 pool.query("SELECT AVG(a.hr) as avg_jantung,AVG(a.spo2) as avg_oxy,AVG(suhu) as avg_suhu,c.nama_olahraga FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY c.id_jenis_olahraga,c.nama_olahraga", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_rata_by_usia(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

 pool.query("SELECT AVG(a.hr) as avg_jantung,AVG(a.spo2) as avg_oxy,AVG(suhu) as avg_suhu,c.usia FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY c.id_user,c.usia", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function show_rata_by_jenis_kelamin(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

 pool.query("SELECT AVG(a.hr) as avg_jantung,AVG(a.spo2) as avg_oxy,AVG(suhu) as avg_suhu,c.jenis_kelamin FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY c.jenis_kelamin", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_hasil_pengukuran(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

 pool.query("SELECT a.hr,a.spo2,a.suhu,a.timestamp FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a.id DESC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function show_total_rata(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var avg = "";
if (diambil == "jantung") {
  avg = "hr";
}else if (diambil == "oxy") {
  avg = "spo2";
}else if (diambil == "suhu") {
  avg = "suhu";
}
 pool.query("SELECT AVG(a."+avg+") as avgs FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_max(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var max = "";
if (diambil == "jantung") {
  max = "hr";
}else if (diambil == "oxy") {
  max = "spo2";
}else if (diambil == "suhu") {
  max = "suhu";
}

pool.query("SELECT a."+max+",c.username,b.tempat,d.nama_olahraga,a.timestamp FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user INNER JOIN jenis_olahraga as d on b.id_jenis_olahraga = d.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a."+max+" DESC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function show_min(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var min = "";
if (diambil == "jantung") {
  min = "hr";
}else if (diambil == "oxy") {
  min = "spo2";
}else if (diambil == "suhu") {
  min = "suhu";
}

pool.query("SELECT a."+min+",c.username,b.tempat,d.nama_olahraga,a.timestamp FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user INNER JOIN jenis_olahraga as d on b.id_jenis_olahraga = d.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a."+min+" ASC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function show_table_admin(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

 pool.query("SELECT a.hr,a.spo2,a.suhu,a.timestamp,d.nama_olahraga,c.username,c.jenis_kelamin,c.usia,b.tempat FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user INNER JOIN jenis_olahraga as d on b.id_jenis_olahraga = d.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a.id DESC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}




async function show_by_jenis_kelamin(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND a.id_user="+id_user;

}else{
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user;

}

 pool.query("SELECT COUNT(a.id_mulai_olahraga) as counts,b.jenis_kelamin FROM mulai_olahraga as a INNER JOIN users as b on a.id_user = b.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY b.jenis_kelamin", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_by_usia(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND a.id_user="+id_user;

}else{
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user;

}

 pool.query("SELECT COUNT(a.id_mulai_olahraga) as counts,b.usia FROM mulai_olahraga as a INNER JOIN users as b on a.id_user = b.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY b.usia", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function show_by_user(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.query.id_user;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND a.id_user="+id_user;

}else{
  queryString=" AND a.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user;

}

 pool.query("SELECT COUNT(a.id_mulai_olahraga) as counts,b.username FROM mulai_olahraga as a INNER JOIN users as b on a.id_user = b.id_user WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" GROUP BY b.username", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}



async function show_bar_atas(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;

if(id_jenis_olahraga == 0){
 pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"'  AND a.id_user="+id_user+" ORDER BY id DESC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}else{
   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user+" ORDER BY id DESC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

 




}



async function total_olahraga(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;

if(id_jenis_olahraga == 0){
 pool.query("SELECT COUNT(*) as total FROM mulai_olahraga WHERE timestamp >='"+dari+"' AND timestamp  <='"+sampai+"' ", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}else{
   pool.query("SELECT COUNT(*) as total FROM mulai_olahraga WHERE timestamp >='"+dari+"' AND timestamp  <='"+sampai+"' AND id_jenis_olahraga="+id_jenis_olahraga, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

}




async function show_table_index(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;

if(id_jenis_olahraga == 0){
 pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"'  AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}else{
   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,c.nama_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

}




async function detak_oxy_suhu_mulai_olahraga(req,res){


var id_mulai_olahraga = req.query.id_mulai_olahraga;
let id_user = req.session.user.id_user;


   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga WHERE  b.id_mulai_olahraga="+id_mulai_olahraga+" AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = result.rows;
    // Pass data to your HTML rendering function
    

    res.status(200).json(data);



  });


}




async function detak_oxy_suhu_mulai_olahraga_now(req,res){


var id_mulai_olahraga = req.query.id_mulai_olahraga;
let id_user = req.session.user.id_user;


   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,a.timestamp,a.id_user FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga WHERE  b.id_mulai_olahraga="+id_mulai_olahraga+" AND a.id_user="+id_user+" ORDER BY id DESC LIMIT 1", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = result.rows;
    // Pass data to your HTML rendering function
    

    res.status(200).json(data);



  });


}



async function table_mulai_olahraga(req,res){


var id_mulai_olahraga = req.query.id_mulai_olahraga;
let id_user = req.session.user.id_user;


   pool.query("SELECT a.hr,a.spo2,a.suhu,a.id_mulai_olahraga,b.id_jenis_olahraga,a.timestamp,a.id_user,c.nama_olahraga FROM heart as a INNER JOIN mulai_olahraga as b ON a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN jenis_olahraga as c on b.id_jenis_olahraga = c.id_jenis_olahraga WHERE  b.id_mulai_olahraga="+id_mulai_olahraga+" AND a.id_user="+id_user+" ORDER BY id ASC", (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    const data = result.rows;
    // Pass data to your HTML rendering function
    

    res.status(200).json(data);



  });


}





async function table_riwayat_olahraga(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;

if(id_jenis_olahraga == 0){
 pool.query("SELECT a.id_mulai_olahraga, b.nama_olahraga, a.timestamp,a.tempat FROM mulai_olahraga as a INNER JOIN jenis_olahraga as b on a.id_jenis_olahraga = b.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"'  AND a.id_user="+id_user+" ORDER BY id_mulai_olahraga DESC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}else{
   pool.query("SELECT a.id_mulai_olahraga, b.nama_olahraga, a.timestamp,a.tempat FROM mulai_olahraga as a INNER JOIN jenis_olahraga as b on a.id_jenis_olahraga = b.id_jenis_olahraga WHERE a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' AND a.id_jenis_olahraga ="+id_jenis_olahraga+"  AND a.id_user="+id_user+" ORDER BY id_mulai_olahraga DESC", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});
}

}






async function keaktifan_1(req,res){



  var dari = req.query.dari;
  var sampai = req.query.sampai;

let id_user = req.session.user.id_user;


  pool.query("SELECT nomor, COUNT(id_akselo) AS counts FROM akselo WHERE created_at >='"+dari+"' AND created_at <='"+sampai+"' AND id_user="+id_user+" GROUP BY nomor", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


  });

}



async function keaktifan_2(req,res){

  var dari = req.query.dari;
  var sampai = req.query.sampai;
let id_user = req.session.user.id_user;

  pool.query("SELECT nomor, COUNT(nomor) AS counts FROM akselo WHERE created_at >='"+dari+"' AND created_at <='"+sampai+"' AND id_user="+id_user+" GROUP BY nomor ORDER BY counts DESC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const heart = result.rows;

  res.status(200).json(heart);


});

}



async function maxs(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var max = "";
if (diambil == "jantung") {
  max = "hr";
}else if (diambil == "oxy") {
  max = "spo2";
}else if (diambil == "suhu") {
  max = "suhu";
}

pool.query("SELECT a."+max+",c.username,b.tempat,d.nama_olahraga,a.timestamp FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user INNER JOIN jenis_olahraga as d on b.id_jenis_olahraga = d.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a."+max+" DESC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function mins(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var min = "";
if (diambil == "jantung") {
  min = "hr";
}else if (diambil == "oxy") {
  min = "spo2";
}else if (diambil == "suhu") {
  min = "suhu";
}

pool.query("SELECT a."+min+",c.username,b.tempat,d.nama_olahraga,a.timestamp FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga INNER JOIN users as c on b.id_user = c.id_user INNER JOIN jenis_olahraga as d on b.id_jenis_olahraga = d.id_jenis_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ORDER BY a."+min+" ASC LIMIT 1", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}


async function avgs(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
  var id_jenis_olahraga = req.query.id_jenis_olahraga;
let id_user = req.session.user.id_user;
let diambil = req.query.diambil;


let queryString="";
if (id_jenis_olahraga == 0 && id_user == 0) {

  queryString=" ";

}else if(id_jenis_olahraga != 0 && id_user == 0){
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga;

}else if(id_jenis_olahraga == 0 && id_user != 0){
  queryString=" AND b.id_user="+id_user;

}else{
  queryString=" AND b.id_jenis_olahraga="+id_jenis_olahraga+" AND b.id_user="+id_user;

}

var avg = "";
if (diambil == "jantung") {
  avg = "hr";
}else if (diambil == "oxy") {
  avg = "spo2";
}else if (diambil == "suhu") {
  avg = "suhu";
}
 pool.query("SELECT AVG(a."+avg+") as avgs FROM heart as a INNER JOIN mulai_olahraga as b on a.id_mulai_olahraga = b.id_mulai_olahraga WHERE 1=1 and a.timestamp >='"+dari+"' AND a.timestamp <='"+sampai+"' "+queryString+" ", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const data = result.rows;
  // Pass data to your HTML rendering function
  

  res.status(200).json(data);



});


}





async function hrMax(req,res){

  var dari = req.query.dari;
  var sampai = req.query.sampai;
let id_user = req.session.user.id_user;

  pool.query("SELECT max(hr) as max FROM heart  WHERE timestamp >='"+dari+"' AND timestamp <='"+sampai+"' AND id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});
}



async function hrMin(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
let id_user = req.session.user.id_user;


  pool.query("SELECT min(hr) as min FROM heart  WHERE timestamp >='"+dari+"' AND timestamp <='"+sampai+"' AND id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});

}




async function oxyMax(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;
let id_user = req.session.user.id_user;



  pool.query("SELECT max(spo2) as max FROM heart  WHERE timestamp >='"+dari+"' AND timestamp <='"+sampai+"' AND id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});

}

async function oxyMin(req,res){


  var dari = req.query.dari;
  var sampai = req.query.sampai;

let id_user = req.session.user.id_user;

  pool.query("SELECT min(spo2) as min FROM heart  WHERE timestamp >='"+dari+"' AND timestamp <='"+sampai+"' AND id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  const heart = result.rows;

  res.status(200).json(heart);


});

}


async function sendAkselo(req,res){




  const data = req.body;

  var modus = req.query.modus;
  var nomor = req.query.nomor;
  var enc = req.query.enc;

var keterangan = "";

if (nomor == 1) {
  keterangan = "Tidak Aktif Bergerak";
}else if(nomor == 2){
  keterangan = "Normal";
}else{
  keterangan = "Aktif Bergerak";
}


  let decoded = verifyToken(enc);

var id_user = await cari_user_by_kode_alat(decoded.kode_alat);

const json = {
      "modus": modus,
      "keterangan": keterangan,
      "nomor": nomor,
      "enc": enc,
      "enc_kode_alat": decoded.kode_alat,
      "id_user": decoded.id_user,
      
    
  };






const insertQuery = 'INSERT INTO akselo (modus, keterangan,nomor,id_user) VALUES($1,$2,$3,$4) RETURNING *';



await pool.query(insertQuery, [modus, keterangan, nomor,id_user], (err, res) => {
    console.log(insertQuery);
  
  if (err) {
    console.error(err);
  } else {
    console.log(`Inserted row with ID: ${res.rows[0].id}`);
  }
  // pool.end();
});


console.log(json);;
res.status(200).json(json);


 


}








async function pergerakan_sekarang(req,res){
let id_user = req.session.user.id_user;

  var dari = req.query.dari;
  var sampai = req.query.sampai;
  pool.query("SELECT * FROM akselo WHERE created_at >='"+dari+"' AND created_at <='"+sampai+"' and id_user="+id_user, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const heart = result.rows;

  res.status(200).json(heart);


});

}




async function buatJadwal(req,res){
  const {  judul_kegiatan, uraian_kegiatan,waktu_alarm } = req.body;
let id_user = req.session.user.id_user;


  const insertQuery =
    "INSERT INTO jadwal ( judul_kegiatan, uraian_kegiatan,waktu_alarm,status,id_user) VALUES ($1, $2,$3,0,$4) RETURNING id_jadwal";
console.log(insertQuery);
  try {
    const result = await pool.query(insertQuery, [
      
      judul_kegiatan,
      uraian_kegiatan,
      waktu_alarm,
      id_user,
    ]);

    const id_jadwal = result.rows[0].id_jadwal;
    const response = {
      message: "Jadwal berhasil ditambahkan",
      id_jadwal: id_jadwal,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Gagal menambahkan jadwal", error);
    res.status(500).json({ message: "Gagal menambahkan jadwal" });
  }
}

async function getAllJadwal(req, res) {

  var dari = req.query.dari;
  var sampai = req.query.sampai;
let id_user = req.session.user.id_user;

  
  const selectQuery = "SELECT * FROM jadwal WHERE waktu_alarm >='"+dari+"' AND waktu_alarm <='"+sampai+"' AND id_user="+id_user+"  ORDER BY id_jadwal DESC ";
  console.log(selectQuery);
  try {
    const result = await pool.query(selectQuery);
    const jadwal = result.rows;
    res.status(200).json(jadwal);
  } catch (error) {
    console.error("Gagal mengambil jadwal", error);
    res.status(500).json({ message: "Gagal mengambil jadwal" });
  }
}

async function getJadwalById(req,res){

  const id = req.params.id;
  const selectQuery = "SELECT * FROM jadwal WHERE id_jadwal = "+id;

  try {
    const result = await pool.query(selectQuery);
    const jadwal = result.rows;
    res.status(200).json(jadwal);
  } catch (error) {
    console.error("Gagal mengambil jadwal", error);
    res.status(500).json({ message: "Gagal mengambil jadwal" });
  }


}

async function updateJadwal(req, res) {
  const id = req.query.id;
  const judul_kegiatan = req.query.judul_kegiatan;
  const uraian_kegiatan = req.query.uraian_kegiatan;
  const waktu_alarm = req.query.waktu_alarm;

  const data = [id,judul_kegiatan,uraian_kegiatan];
  const updateQuery = "UPDATE jadwal SET judul_kegiatan =' "+judul_kegiatan+"', uraian_kegiatan = ' "+uraian_kegiatan+"', waktu_alarm = '"+waktu_alarm+"' WHERE id_jadwal = "+id;

  console.log(updateQuery);
  try {
    await pool.query(updateQuery);
    res.status(200).json({ message: "Jadwal berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal memperbarui jadwal", error);
    res.status(500).json({ message: "Gagal memperbarui jadwal" });
  }
}

async function deleteJadwal(req, res) {
  const id = req.query.id;
  const deleteQuery = "DELETE FROM jadwal WHERE id_jadwal = "+id;

  try {
    const result = await pool.query(deleteQuery);
    if (result.rowCount === 1) {
      res.status(200).json({ message: "Jadwal berhasil dihapus" });
    } else {
      res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }
  } catch (error) {
    console.error("Gagal menghapus jadwal", error);
    res.status(500).json({ message: "Gagal menghapus jadwal" });
  }
}




async function detak(req,res){

const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  if (!req.session.user) {
    res.redirect('/login');
  }else{
res.render('views/detak',{ currentPath: '/detak' ,session:userData});

  }



}



async function nafas(req,res){

const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  if (!req.session.user) {
    res.redirect('/login');
  }else{
res.render('views/nafas',{ currentPath: '/nafas' ,session:userData});

  }


}


async function suhu(req,res){


const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  if (!req.session.user) {
    res.redirect('/login');
  }else{
res.render('views/suhu',{ currentPath: '/suhu' ,session:userData});

  }


}


async function akselo(req,res){


const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  if (!req.session.user) {
    res.redirect('/login');
  }else{
res.render('views/akselo',{ currentPath: '/akselo' ,session:userData});

  }


}

async function jadwal(req,res){


const userDataKosong =  { id: null, username: 'Guest' };
  const userData = req.session.user;

  if (!req.session.user) {
    res.redirect('/login');
  }else{
res.render('views/jadwal',{ currentPath: '/jadwal' ,session:userData});

  }


}

async function cek(req,res){


  res.status(200).json({data:'data'});


}


async function cek_jadwal(req,res){

  var encoded = req.query.encoded;

  var decoded = verifyToken(encoded);

  var id_user = await cari_user_by_kode_alat(decoded.kode_alat);

  const date = new Date();

// Mendapatkan tanggal
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear());
  const hours = String(date.getHours()+7).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');


var timenow = `${day}-${month}-${year} ${hours}:${minutes}`;

    var array_waktu = [];
  pool.query("SELECT * FROM jadwal WHERE id_user ="+id_user+" and status=0", (err, result) => {
  if (err) {
    console.error(err);
    return;
  }

  const data = result.rows;


  for(i = 0; i < data.length; i++){
    var waktu = dateFormatToData(data[i].waktu_alarm);
    var statusnya = data[i].status;
    var judul = data[i].judul_kegiatan;

    console.log("waktu="+waktu);
    console.log("timenow="+timenow);

    if(waktu == timenow && statusnya == 0){
       var json_response = "1";

        update_cek_jadwal(data[i].waktu_alarm,json_response);
    
    }else{
      var json_response = "0";
    }


  }
  // Pass data to your HTML rendering function

    // console.log(array_waktu);

  res.status(200).json([{json_response:json_response,judul:judul,waktu:waktu,timenow:timenow}]);


});

async function update_cek_jadwal(waktu,status){
     await pool.query("UPDATE jadwal SET status = "+status+" WHERE waktu_alarm ='"+waktu+"' "  , (err, result) => {
      
        if (err) {
          console.error(err);
          return;
        }
      });
}



}


function dateFormatToData(inputDate) {
  const date = new Date(inputDate);
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}




// Function to verify a JWT
function verifyToken(token) {
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, secretKey);

    // If verification is successful, return the decoded payload
    return decoded;
  } catch (error) {
    // If verification fails (token is invalid or expired), throw an error
    throw error;
  }
}


function generateToken(payload) {
  // Create a token with the given payload and sign it with the secret key
  const token = jwt.sign(payload, secretKey); // Token expires in 1 hour

  return token;
}






module.exports = {
  sendDataToSps,
  reload,
  getData,
  index,
  mulai_olahraga,
  add_mulai_olahraga,
  insertDataToHeart,
  detak_oxy_suhu_mulai_olahraga,
  detak_oxy_suhu_mulai_olahraga_now,
  table_mulai_olahraga,
  table_riwayat_olahraga,
  stop_olahraga,
  riwayat_olahraga,
  heartNew,
  oxyNew,
  gerakNew,
  suhuNew,
  show_grafik_detak_oxy_suhu,
  show_table_index,
  show_bar_atas,
  total_olahraga,
  maxs,
  mins,
  avgs,
  keaktifan_1,
  keaktifan_2,
  hrMax,
  hrMin,
  oxyMax,
  oxyMin,
  sendAkselo,
  buatJadwal,
  getAllJadwal,
  updateJadwal,
  deleteJadwal,
  detak,
  nafas,
  suhu,
  akselo,
  pergerakan_sekarang,
  jadwal,
  getJadwalById,
  cek,
  cek_jadwal,
  login,
  login_form,
  logout,
  register,
  register_form,
  bantuan,
  profil,
  save_profil,
  login_super_admin,
  logout_super_admin,
  login_form_super_admin,
  index_super_admin,
  show_by_jenis_olahraga,
  show_by_jenis_kelamin,
  show_by_usia,
  show_by_user,
  jantung_super_admin,
  show_rata_by_jenis_olahraga,
  show_rata_by_usia,
  show_rata_by_jenis_kelamin,
  show_hasil_pengukuran,
  show_total_rata,
  show_max,
  show_min,
  show_table_admin,
  oxy_super_admin,
  suhu_super_admin,
  user_super_admin,
  show_table_user_super_admin,
  show_modal_detail_user_super_admin,
  edit_user_super_admin,
  update_user_super_admin,
  delete_user_super_admin,
  alat_super_admin,
  show_table_alat_super_admin,
  edit_alat_super_admin,
  tambah_alat_super_admin,
  update_alat_super_admin,
  delete_alat_super_admin,
  jenis_olahraga_super_admin,
  show_table_jenis_olahraga_super_admin,
  edit_jenis_olahraga_super_admin,
  tambah_jenis_olahraga_super_admin,
  update_jenis_olahraga_super_admin,
  delete_jenis_olahraga_super_admin,
};
