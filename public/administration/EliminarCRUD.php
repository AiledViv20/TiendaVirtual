<?php
include('conexion.php');
$id = $_POST['id'];
$sql = "DELETE FROM productos WHERE id = $id;";
$conexion->query($sql);