<?php
$servidor = "localhost";
$usuario = "root";
$password = "";
$db = "tienda";

$conexion = new mysqli($servidor, $usuario, $password, $db);
if ($conexion->connect_error) {
    exit("Conexion fallida ".$conexion->connect_error);
} else {
    //echo "Conexion exitosa";
}