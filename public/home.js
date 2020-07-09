let socket = io.connect('http://localhost:8080', {'forceNew' : true});
let j = 1;
let bodyTableProducts;

function radianes(grados) {
    return grados*2*Math.PI/360;
}

function dibujaCuadroColor(lienzo, anchoLienzo, alturaLienzo, rgb) {
    lienzo.strokeStyle = rgb;
    lienzo.fillStyle = rgb;
    lienzo.lineWidth = 5;

    lienzo.beginPath();
    lienzo.fillRect(0,0,anchoLienzo, alturaLienzo)
    lienzo.strokeRect(0,0,anchoLienzo, alturaLienzo);
    lienzo.closePath();
}

function updateTable() {
    socket.emit('update-table');
    return false;
}

function updateGraph() {
    socket.emit('update-graph');
    return false;
}

function searchShoppingCart(id) {
    socket.emit('search-shopping-cart', id);
    return false;
}

function addShoppingCart(data) {
    let params = new URLSearchParams(location.search);
    let idUsuario = params.get('id');
    socket.emit('add-shopping-cart', data, idUsuario);
    return false;
}

function showShoppingCart(idUsuario) {
    socket.emit('show-shopping-cart', idUsuario);
    return false;
}

function deteleProductShoppingCart(idProductoCarrito) {
    $("#myModalDeteleShoppingCart").modal("show");
    $('#button-continue-delete-product').click(function() {
        let arrayIdProducto = []
        arrayIdProducto = Array.from(idProductoCarrito.split("-"));
        socket.emit('delete-shopping-cart', parseInt(arrayIdProducto[1]), parseInt(arrayIdProducto[2]), parseInt(arrayIdProducto[3]));
        return false;
    });
}

function payProducts() {
    let params = new URLSearchParams(location.search);
    let idUsuario = params.get('id');
    socket.emit('pay-shopping-cart', idUsuario);
    return false;
}

function showListShoppingCart(data) {
    let tableShoppingCart = $('#shopping-cart-list');
    tableShoppingCart.html('')
    let html = `<h6 class="border-bottom border-gray pb-2 mb-0">Productos en el carrito</h6>`;
    tableShoppingCart.append(html);
    let result = 0;
    $.each(data, function(i, item) {
        html = `
        <div class="media text-muted pt-3">
            <svg class="bd-placeholder-img mr-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: 32x32">
                <title>Placeholder</title>
                <rect width="100%" height="100%" fill="${item.color_rgb}"/>
                <text x="50%" y="50%" fill="${item.color_rgb}" dy=".3em">32x32</text>
            </svg>
            <p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                <strong class="d-block text-gray-dark">${item.nombre}
                    <span class="badge badge-info">$ ${item.precio}</span>
                </strong>
                ${item.descripcion}.
            </p>
            <img src="icon/delete-shopping-cart.png" alt="eliminar" height="42" width="42"
            id="productShopping-${item.venta}-${item.id}-${item.cantidad}" 
            onclick="deteleProductShoppingCart(this.id)"/>
        </div>
        `;
        tableShoppingCart.append(html);
        result += parseFloat(item.precio);
    });
    html = `
    <small class="d-block text-right mt-3">
        <p class="lead" id="total-price">$ ${result.toFixed(2)}</p>
    </small>
    <small class="d-block text-right mt-3">
        <button class="btn btn-md btn-success" type="button" id="button-pay"
        onclick="payProducts()">Pagar</button>
    </small>
    `;
    tableShoppingCart.append(html);
    if (data.length < 1) {
        $('#button-pay').addClass("disabled")
    }
}

function detailsProductTable(id) {
    socket.emit('modal-details', id);
    return false;
}

$(document).ready(function() {
    updateTable();
    updateGraph();
    let params = new URLSearchParams(location.search);
    let idUsuario = params.get('id');
    showShoppingCart(idUsuario);
});

socket.on('update-body-table-store', function(data) {
    let informationTableBody = $('#body-table-store')
    informationTableBody.html('')
    let totalProducts = 0;
    $.each(data, function(i, item) {
        totalProducts += item.cantidad;
    });
    $.each(data, function(i, item) {
        bodyTableProducts = `
            <tr id="row-table-store">
                <th scope="row">${j}</th>
                <td>${item.producto}</td>
                <td>
                    <div class="row">
                        <div class="col text-right">
                            <canvas id="lienzo-${item.id}" class="lienzo-space-table" width="10" height="25"></canvas>
                        </div>
                        <div class="col">${((item.cantidad/totalProducts)*100).toFixed(2)}%</div>
                    </div>
                </td>
                <td>${item.cantidad} pzs.</td>
                <td>
                    <button class="btn btn-link link-button-details" 
                        id="${item.id}" type="button" onclick="detailsProductTable(this.id)">
                            Más detalles
                    </button>
                </td>
            </tr>
        `;
        j++;
        informationTableBody.append(bodyTableProducts);
        let lienzo = $('#lienzo-'+item.id).get(0).getContext('2d');
        let anchoLienzo = $('#lienzo-'+item.id).width();
        let alturaLienzo = $('#lienzo-'+item.id).height();
        let rgb = item.color_rgb; 
        dibujaCuadroColor(lienzo, anchoLienzo, alturaLienzo, rgb);
    });
    j = 1;
});

socket.on('update-body-graph-store', function(data) {
    let lienzoGrafica = $('#lienzoGrafica')
    let lienzo = $('#lienzoGrafica').get(0).getContext('2d');
    lienzoGrafica.width = 250;
    lienzoGrafica.height = 250;
    let total = 0;
    $.each(data, function(i, item) {
        total += item.cantidad;
    });
    let startAngle = 0; 
    let radius = 100;
    let x = lienzoGrafica.width/2;
    let y = lienzoGrafica.height/2;
    
    data.forEach( product => {
        lienzo.fillStyle = product.color_rgb;
        lienzo.lineWidth = 1;
        lienzo.strokeStyle = '#000000';
        lienzo.beginPath();
        let endAngle = ((product.cantidad / total) * Math.PI * 2) + startAngle;
        lienzo.moveTo(x, y);
        lienzo.arc(x, y, radius, startAngle, endAngle, false);
        lienzo.lineTo(x, y);
        lienzo.fill();
        lienzo.stroke();
        lienzo.closePath();
        startAngle = endAngle;
    });
});

socket.on('details-product', function(data) {
    $("#myModal").modal("show");
    data.forEach( details => {
        let modal = $("#myModal");
        modal.find('#modal-title-product').text(details.categoria)
        modal.find('#column-table-name').text(details.nombre)
        modal.find('#column-table-descript').text(details.descripcion)
        let price = `$${details.precio}`;
        modal.find('#column-table-price').text(price)
        modal.find('#modal-footer-store').html('')
        let buttonClose = `<button class="btn btn-danger"  type="button" data-dismiss="modal">Close</button>`;
        let buttonAdd = `<button class="btn btn-success" id="${details.id}" type="button"  onclick="searchShoppingCart(this.id)">
                            Agregar al Carrito
                        </button>`;
        modal.find('#modal-footer-store').append(buttonClose)
        modal.find('#modal-footer-store').append(buttonAdd)
    });
});

socket.on('search-product-shopping-cart', function(data) {
    addShoppingCart(data);
});

socket.on('add-product-shopping-cart', function(idUsuario) {
    swal("Proceso Exitoso!", "Producto agregado al carrito", "success");
    showShoppingCart(idUsuario);
});

socket.on('show-product-shopping-cart', function(data) {
    showListShoppingCart(data);
    updateTable();
    updateGraph();
});

socket.on('delete-product-shopping-cart', () => {
    swal("Proceso Exitoso!", "Producto eliminado", "success");
    let params = new URLSearchParams(location.search);
    let idUsuario = params.get('id');
    showShoppingCart(idUsuario);
    updateTable();
    updateGraph();
});

socket.on('pay-product-shopping-cart', function(idUsuario) {
    swal("Proceso Exitoso!", "Productos Pagados", "success");
    showShoppingCart(idUsuario);
});