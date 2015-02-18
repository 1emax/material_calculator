<?php
spl_autoload_register('my_autoload');

class Calc {
	protected $db = '';

	public function __construct() {
		$this->db = new DB();
	}

	public function add($table, $data) {
		$db = $this->db;
		$db->query = 'INSERT INTO ' . $table; 
		$colNames = '(';
		$colValues = '(';

		foreach($data as $colName => $colValue) {
			$colNames .= '`' . $colName . '`,';
			$colValues .= "'" . $colValue . "',";
		}

		$colNames = rtrim($colNames, ",") . ')';
		$colValues = rtrim($colValues, ",") . ')';

		$db->query .= ' ' . $colNames . ' VALUES ' . $colValues;

		$db->set();
	}

	public function change($table, $id, $params) {
		$db = $this->db;

		$db->query = 'UPDATE '.$table.' SET  ';

		foreach($params as $colName => $colValue) {
			$db->query .= '`'.$colName . '` = ' . "'".$colValue . "', ";
		}

		$db->query = rtrim($db->query, ", ");
		$db->where('id=' . $id);
		$db->set();
	}

	public function getCategories() {
		$db = $this->db;

		$db->select('DISTINCT pc.id,pc.name');		
		$db->table('product_category');
		$db->join('product_material', array('id'=>'category_id'), 'pc'); // could be third parameter like inner, left, right
		return $db->get();

	}

	public function getManufacturers($id) {
		$db = $this->db;		
		$db->select('DISTINCT man.id,man.name');		
		$db->table('manufacturer');
		$db->join('product_material', array('id'=>'manufacturer_id'), 'man');
		$db->where('product_material.id='.$id);
		return $db->get();
	}



	public function getMaterials($id) {
		$db = $this->db;		
		$db->select('id,name');		
		$db->table('product_material');
		$db->where('category_id='.$id);
		$db->query .= ' ORDER BY product_material.id';		
		return $db->get();		
	}


	public function delete($table, $id) {
		$db = $this->db;
		$db->query = 'DELETE FROM '.$table.' WHERE id='.$id;
		$db->set();
	}

	public function MaterialsCharct($sIds, $manufacturer_id = false) {
		$withManufacturer = '';
		if($manufacturer_id > 0) $withManufacturer = ' AND product_features.manufacturer_id =' . intval($manufacturer_id);

		$db = $this->db;
		$db->select('p.id as pid, p.manufacturer_id as manuf_id, product_features.*');		
		$db->table('product_material');
		$db->join('product_features', array('id'=>'product_id'), 'p');
		$db->where('p.id in '."('$sIds')" . $withManufacturer);

		// echo $db->query;

		return $db->get();
	}

	public function showBlock($block, $tag) {
		$blockData = array();
		// echo 55555555;

		switch ($block) {
			case 'category':
				$blockData = $this->getCategories();
				break;
			
			default:
				break;
		}


		foreach($blockData as $val) {
			echo '<'.$tag.' id="'.$block.'-'.$val['id'].'">'.$val['name'].'</'.$tag.'>'."\n";
		}
		// $db->get($block, )
		// Блоки</option>
						// <option>Кирпич</option>
	}

}
























$Calc = new Calc();

function my_autoload($pClassName) {
    include(__DIR__ . '/' . strtolower($pClassName) . '.php');
}



if(basename($_SERVER['PHP_SELF']) == 'index.php') include 'index.html';






?>