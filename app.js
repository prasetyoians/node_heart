const express = require('express')
const app = express();
const port = 3000;
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const http = require('http');


const cors = require('cors');

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);






//page
app.get('/dashboard', require("./controller/response").index);
app.get('/detak', require("./controller/response").detak);
app.get('/nafas', require("./controller/response").nafas);
app.get('/suhu', require("./controller/response").suhu);
app.get('/akselo', require("./controller/response").akselo);
app.get('/jadwal', require("./controller/response").jadwal);




app.get('/senddatatosps', require("./controller/response").sendDataToSps);
app.get('/getdata', require("./controller/response").getData);
app.get('/reload', require("./controller/response").reload);
app.get('/heartnew', require("./controller/response").heartNew);
app.get('/oxynew', require("./controller/response").oxyNew);
app.get('/geraknew', require("./controller/response").gerakNew);
app.get('/suhunew', require("./controller/response").suhuNew);
app.get('/grafikhr', require("./controller/response").grafikHr);
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


app.get('/tes', (req, res) => {
http.createServer(function (req, res){

	fs.readFile("views/index.html",function (err, data){
		 if (err) {
		 	res.writeHead(404,{'Content-type':'text/html'});
		 	res.write("404 halaman tidak ditemukan");
		 	return res.end();
		 }else{
		 	res.writeHead(200,{'Content-type':'text/html'});
		 	res.write(data);
		 	return res.end();	
		 }
	});
});
});

app.listen(port, () => {
  console.log(`Example app listening on port 3000}`)
})
