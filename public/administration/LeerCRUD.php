<?php
include('conexion.php');
$sql = "SELECT * FROM productos;";
$resultado = $conexion->query($sql);
$datosJson = array();
if ($resultado->num_rows > 0) {
    while ($row = $resultado->fetch_assoc()) {
        $datosJson[] = array(
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'cantidad' => $row['cantidad']
        );
    }
}
echo json_encode($datosJson);