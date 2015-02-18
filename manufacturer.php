<?php

class Manufacturer {
	protected $db = '';

	public function __construct() {

		$this->db = new DB();

	}

	public function add($manufacturers) {
		$db = $this->db;
		foreach($manufacturers as $manufacturer) {

			$db->query = "INSERT INTO manufacturer (`name`,`address`,`coordinates`) VALUES('{$manufacturer['name']}','{$manufacturer['address']}','{$manufacturer['coordinates']}')";

			$db->set();
		}
	}
	public function change($id, $manufacturerParams) {
		$db = $this->db;

		$db->query = "UPDATE manufacturer SET  `name` = '{$manufacturerParams['name']}',`address` = '{$manufacturerParams['address']}',`coordinates` = '{$manufacturerParams['coordinates']}' WHERE id=" . $id;
		$db->set();
	}

	public function delete($id) {
		$db = $this->db;
		$db->query = 'DELETE FROM manufacturer WHERE id='.$id;
		$db->set();
	}

	public function get() {

	}

	public function getAll() {
		$db = $this->db;
		$db->select('*');	
		$db->table('manufacturer');
		return $db->get();
	}
}


?>