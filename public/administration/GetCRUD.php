<?php
include('conexion.php');
$id = $_POST['id'];
$sql = "SELECT * FROM productos WHERE id = $id;";
$resultado = $conexion->query($sql);
$datosJson = array();
if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $datosJson[] = array(
            'nombre' => $row['nombre'],
            'cantidad' => $row['cantidad']
        );
    }
}
echo json_encode($datosJson);