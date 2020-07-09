<?php
include('conexion.php');
$infoJson = json_decode(file_get_contents('php://input'), true);
$categoria = (int)$infoJson['categoria'];
$nombre = $infoJson['nombre'];
$descripcion = $infoJson['descripcion'];
$precio = $infoJson['precio'];
$cantidad = (int)$infoJson['cantidad'];
$colorRgb = $infoJson['color'];
$sql = "INSERT INTO productos(categoria, nombre, descripcion, precio, cantidad, color_rgb) 
VALUES($categoria, '$nombre', '$descripcion', '$precio', $cantidad, '$colorRgb');";

if ($conexion->query($sql) === true) {
    echo json_encode('agregado');
} else {
    echo json_encode('Error al agregar'.$conexion->error);
}
