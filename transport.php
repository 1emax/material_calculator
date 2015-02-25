<?php

class Transport {
	protected $db = '';

	public function __construct() {

		$this->db = new DB();

	}

	public function add($transports) {
		$db = $this->db;
		foreach($transports as $transport) {

			$db->query = "INSERT INTO transport (`name`,`capacity`,`dimensions`,`pallets`,`rate`,`mcad`,`inside_mcad`,`inside_ttk`,`inside_sad_kolco`) VALUES('{$transport['name']}','{$transport['capacity']}','{$transport['dimensions']}','{$transport['pallets']}','".preg_replace('/[^0-9]*/', '', $transport['rate'])."','{$transport['mcad']}','{$transport['inside_mcad']}','{$transport['inside_ttk']}','{$transport['inside_sad_kolco']}')";

			$db->set();
		}
	}

	public function change($id, $transportParams) {
		$db = $this->db;

		$db->query = "UPDATE transport SET  `name` = '{$transportParams['name']}',`capacity` = '{$transportParams['capacity']}',`dimensions` = '{$transportParams['dimensions']}',`pallets` = '{$transportParams['pallets']}',`rate` = '{$transportParams['rate']}',`mcad` = '{$transportParams['mcad']}',`inside_mcad` = '{$transportParams['inside_mcad']}',`inside_ttk` = '{$transportParams['inside_ttk']}',`inside_sad_kolco` = '{$transportParams['inside_sad_kolco']}' WHERE id=" . $id;
		$db->set();
	}

	public function delete($id) {
		$db = $this->db;
		$db->query = 'DELETE FROM transport WHERE id='.$id;
		$db->set();
	}

	public function get() {

	}

	public function getAll($cols = '*') {
		$db = $this->db;
		$db->select($cols);	
		$db->table('transport');
		return $db->get();
	}

	public function closeConnection() {
		$this->db->close();
	}
}


?>