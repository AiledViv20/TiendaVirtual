<?php
include('conexion.php');
$infoJson = json_decode(file_get_contents('php://input'), true);
$id = (int)$infoJson['id'];
$nombre = $infoJson['nombre'];
$cantidad = (int)$infoJson['cantidad'];

$sql = "UPDATE productos SET nombre = '$nombre', cantidad = $cantidad WHERE id = $id;";

if ($conexion->query($sql) === true) {
    echo json_encode('modificado');
} else {
    echo json_encode('Error al agregar'.$conexion->error);
}