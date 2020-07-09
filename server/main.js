let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
const bodyParser = require("body-parser");
let mysql = require('mysql');

let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tienda'
});

db.connect(function(error){
    if(error){
       throw error;
    }else{
       console.log('Successful Connection');
    }
});

app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', function(req, res){
    let sql = `SELECT id, email, password, tipo FROM usuario WHERE email = '${req.body.email}' 
    and password = '${req.body.password}'`;
    db.query(sql, (error, result) => { 
        if(error) {
            console.log(error);
            throw error;
        } else {
            if (result.length > 0) {
                let urlHome = ``;
                result.forEach( details => {
                    if (details.tipo === 'ADMINISTRADOR') {
                        res.redirect('http://localhost/TiendaOnline/sockets/public/administration/administrator.html')
                    } else {
                        urlHome = `/home.html?id=${details.id}`;
                        res.redirect(urlHome);
                    }
                });
            } else {
                res.redirect('/login.html');
            }
        }
    });
});

io.on('connection', function(socket) {
    console.log('Alguien se ha conectado con Sockets');
    socket.on('update-table', () => {
        let sql = `SELECT pdts.id, pdts.nombre producto, cat.nombre categoria, 
        pdts.descripcion, pdts.cantidad, pdts.color_rgb
        FROM productos pdts INNER JOIN categoria cat on pdts.categoria = cat.id ORDER BY pdts.id ASC;`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('update-body-table-store', result);
            }
        });
    });
    socket.on('update-graph', () => {
        let sql = `SELECT id, nombre, cantidad, color_rgb FROM productos;`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('update-body-graph-store', result);
            }
        });
    });
    socket.on('modal-details', function(idProduct) {
        let sql = `SELECT pdts.id, pdts.nombre, pdts.descripcion, pdts.precio, cat.nombre categoria
        FROM productos pdts INNER JOIN categoria cat on pdts.categoria = cat.id
        WHERE pdts.id = ${idProduct};`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('details-product', result);
            }
        });
    });
    socket.on('search-shopping-cart', function(idProduct) {
        let sql = `SELECT id, nombre, cantidad FROM productos WHERE id = ${idProduct};`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('search-product-shopping-cart', result);
            }
        });
    });
    socket.on('add-shopping-cart', function(data, idUsuario) {
        let sql = ``;
        let sqlUpdateProductsTable = ``;
        let remainingProduct = 0;
        let idProduct = 0;
        data.forEach( details => {
            remainingProduct = details.cantidad - 1;
            idProduct = details.id;
            sql = `INSERT INTO venta(id_producto, id_usuario)
            VALUES(${idProduct}, ${idUsuario});`;
        });
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                console.log('Producto agregado al carrito');
            }
        });
        sqlUpdateProductsTable = `UPDATE productos SET cantidad = ${remainingProduct} WHERE id = ${idProduct};`
        db.query(sqlUpdateProductsTable, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('add-product-shopping-cart', idUsuario);
            }
        });
    });
    socket.on('show-shopping-cart', function(idUsuario) {
        let sql = `SELECT pdts.id, pdts.nombre, pdts.descripcion, pdts.precio, pdts.color_rgb, pdts.cantidad,
        vt.id venta FROM productos pdts INNER JOIN venta vt on pdts.id = vt.id_producto
        WHERE vt.id_usuario = ${idUsuario}`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('show-product-shopping-cart', result);
            }
        });
    });
    socket.on('delete-shopping-cart', function(idVenta, idProducto, cantidad) {
        let totalProductos = parseInt(cantidad + 1);
        let sql = `UPDATE productos SET cantidad = ${totalProductos} WHERE id = ${idProducto};`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                console.log('Producto sumado a la tabla');
            }
        });
        sql = `DELETE FROM venta WHERE id = ${idVenta};`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                io.sockets.emit('delete-product-shopping-cart');
            }
        });
    });
    socket.on('pay-shopping-cart', function(idUsuario) {
        let sql = `DELETE FROM venta WHERE id_usuario = ${idUsuario};`;
        db.query(sql, (error, result) => {
            if(error) {
                console.log(error);
                throw error;
            } else {
                console.log('Productos pagados');
                io.sockets.emit('pay-product-shopping-cart', idUsuario);
            }
        });
    });
});

server.listen(8080, function() {
    console.log("Servidor corriendo en http://localhost:8080");
});