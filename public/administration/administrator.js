let lienzo1;
let anchoLienzo1;
let alturaLienzo1;
let rTexto;
let gTexto;
let bTexto;

function dibujaCuadroColor() {
    lienzo1.strokeStyle = color(0,0,0);
    lienzo1.fillStyle =   color(rTexto.val(), gTexto.val(), bTexto.val());
    lienzo1.lineWidth = 5;

    lienzo1.beginPath();
    lienzo1.fillRect(0,0,anchoLienzo1, alturaLienzo1);
    lienzo1.strokeRect(0,0,anchoLienzo1, alturaLienzo1);
    lienzo1.closePath();
}

function color(r , g, b) {
    return "rgb("+r+", "+g+", "+b+")";
}

function seleccionar(idProducto) {
    let editarProducto = $('#editar-producto')
    let eliminarProducto = $('#eliminar-producto')
    if (editarProducto.hasClass("active-on")) {
        let txtIdProducto = $('#id-numero-editar')
        let txtProducto = $('#id-producto-editar')
        let txtCantidad = $('#id-cantidad-editar')
        $('#id-numero-editar').val(idProducto)
        let params = "id=" + txtIdProducto.val()
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'GetCRUD.php')
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        xhr.send(params)
        xhr.onload = function() {
            let respuesta = JSON.parse(xhr.responseText)
            for(let item of respuesta) {
                txtProducto.val(item.nombre)
                txtCantidad.val(item.cantidad)
            }
        }
    }
    else if(eliminarProducto.hasClass("active-on")) {
        $('#id-numero-eliminar').val(idProducto)
    }
}

function mostrarProductoCatalogo() {
    let mostrarProductos = $('#mostrar-productos')
    let fila = $('#producto-fila-tabla')
    //AJAX
    let xhr = new XMLHttpRequest()
    xhr.open('POST', 'LeerCRUD.php')
    xhr.send()
    xhr.onload = function() {
        let respuesta = JSON.parse(xhr.responseText)
        let datosHTML = ``;
        for(let item of respuesta) {
            datosHTML += `
            <tr>
                <th scope="row"><button id="${item.id}" onclick="seleccionar(${item.id})" type="button" class="btn btn-link">${item.id}</button></th>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
            </tr>
            `;
        }
        fila.html(datosHTML)
    }
    mostrarProductos.show()
}

$(document).ready(function() {
    let mostrarProductos = $('#mostrar-productos')
    let agregarProducto = $('#agregar-producto')
    let editarProducto = $('#editar-producto')
    let eliminarProducto = $('#eliminar-producto')
    mostrarProductos.hide()
    agregarProducto.hide()
    editarProducto.hide()
    eliminarProducto.hide()
    $('#menu-boton-ver').on('click', function() {
        if (mostrarProductos.hasClass("active-on")) {
            mostrarProductos.hide()
            mostrarProductos.removeClass("active-on")
            mostrarProductos.addClass("active-off")
            let fila = $('#producto-fila-tabla')
            fila.html('')
        }
        else {
            mostrarProductos.removeClass("active-off")
            mostrarProductos.addClass("active-on")
            mostrarProductoCatalogo();  
        }
    });

    $('#menu-boton-agregar').on('click', function() {
        //Ocultar seccion de editar y eliminar
        if (agregarProducto.hasClass("active-on")) {
            agregarProducto.hide()
            agregarProducto.removeClass("active-on")
            agregarProducto.addClass("active-off")
        }
        else {
            agregarProducto.show()
            agregarProducto.removeClass("active-off")
            agregarProducto.addClass("active-on")
            lienzo1 = $('#lienzo1').get(0).getContext('2d');
            anchoLienzo1 = $('#lienzo1').width();
            alturaLienzo1 = $('#lienzo1').height();
            rTexto = $('#rTexto');
            gTexto = $('#gTexto');
            bTexto = $('#bTexto');
            rTexto.val(0);
            gTexto.val(0);
            bTexto.val(0);
            dibujaCuadroColor();
            $('#rRango').change(function() {
                rTexto.val($('#rRango').val());
                dibujaCuadroColor();
            });
            $('#gRango').change(function() {
                gTexto.val($('#gRango').val());
                dibujaCuadroColor();
            });
            $('#bRango').change(function() {
                bTexto.val($('#bRango').val());
                dibujaCuadroColor();
            });
        }
    });

    $('#id-boton-agregar').on('click', function() {
        let nombre = $('#id-producto-agregar').val()
        let descripcion = $('#id-descripcion-agregar').val()
        let categoria = $('#id-categoria-agregar').val()
        let cantidad = $('#id-cantidad-agregar').val()
        let precio = $('#id-precio-agregar').val()
        let r = $('#rTexto').val();
        let g = $('#gTexto').val();
        let b = $('#bTexto').val();
        let color = `rgb(${r}, ${g}, ${b})`;
        let infoJson = JSON.stringify({
            'nombre':nombre,
            'cantidad':cantidad,
            'descripcion': descripcion,
            'categoria':categoria,
            'precio':precio,
            'color':color
        });
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'AgregarCRUD.php');
        xhr.send(infoJson);
        xhr.onload = function() {
            let respuesta = JSON.parse(xhr.responseText);
            swal("Producto Agregado!", "El producto se añadio al catálogo", "success");
            mostrarProductoCatalogo();
        }
        $('#id-producto-agregar').val('')
        $('#id-descripcion-agregar').val('')
        $("#id-categoria-agregar option[value="+ 0 +"]").attr("selected",true);
        $('#id-cantidad-agregar').val('')
        $('#id-precio-agregar').val('')
        rTexto.val(0);
        gTexto.val(0);
        bTexto.val(0);
        dibujaCuadroColor();
    });

    $('#menu-boton-editar').on('click', function() {
        //Ocultar seccion de agregar y eliminar
        if (editarProducto.hasClass("active-on")) {
            editarProducto.hide()
            editarProducto.removeClass("active-on")
            editarProducto.addClass("active-off")
            $('#id-numero-editar').val('')
        }
        else {
            $('#id-numero-editar').val('')
            $('#id-producto-editar').val('')
            $('#id-cantidad-editar').val('')
            editarProducto.show()
            //Mostrar ver productos(crear funcion)
            editarProducto.removeClass("active-off")
            editarProducto.addClass("active-on")
        }
    });

    $('#id-boton-editar').on('click', function() {
        let txtIdProducto = $('#id-numero-editar').val()
        let txtProducto = $('#id-producto-editar').val()
        let txtCantidad = $('#id-cantidad-editar').val()
        let infoJson = JSON.stringify({
            'id':txtIdProducto,
            'nombre':txtProducto,
            'cantidad':txtCantidad
        });
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'EditarCRUD.php');
        xhr.send(infoJson);
        xhr.onload = function() {
            let respuesta = JSON.parse(xhr.responseText);
            $('#id-numero-editar').val('')
            $('#id-producto-editar').val('')
            $('#id-cantidad-editar').val('')
            swal("Producto Editado!", "El producto ha sido modificado correctamente", "success");
            mostrarProductoCatalogo();
        }
    });

    $('#menu-boton-eliminar').on('click', function() {
        //Ocultar seccion de agregar y editar
        if (eliminarProducto.hasClass("active-on")) {
            eliminarProducto.hide()
            eliminarProducto.removeClass("active-on")
            eliminarProducto.addClass("active-off")
            $('#id-numero-eliminar').val('')
        }
        else {
            $('#id-numero-eliminar').val('')
            eliminarProducto.show()
            //Mostrar ver productos(crear funcion)
            eliminarProducto.removeClass("active-off")
            eliminarProducto.addClass("active-on")
        }
    });

    $('#id-boton-eliminar').on('click', function() {
        let txtIdProducto = $('#id-numero-eliminar').val()
        let params = "id=" + txtIdProducto
        let xhr = new XMLHttpRequest()
        xhr.open('POST', 'EliminarCRUD.php')
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        xhr.send(params)
        xhr.onload = function() {
            $('#id-numero-eliminar').val('')
            swal("Producto Eliminado!", "El producto ha sido eliminado correctamente", "success");
            mostrarProductoCatalogo();
        }
    });
    $('#salir-sesion').on('click', function() {
        window.location.href = "http://localhost:8080/login.html";
    });
});