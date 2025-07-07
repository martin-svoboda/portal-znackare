<?php

namespace PortalZnackare\Repositories;

use PortalZnackare\Models\ReportModel;
use PortalZnackareDeps\Wpify\Model\CustomTableRepository;

class ReportRepository extends CustomTableRepository {
	public function __construct() {
		parent::__construct( true, true );
	}

	public function table_name(): string {
		return 'zp_reports';
	}

	public function model(): string {
		return ReportModel::class;
	}

	public function find_by_zp_and_user( int $id_zp, int $int_adr ) {
		return $this->find(
			array(
				'where' => array(
					'id_zp'   => $id_zp,
					'int_adr' => $int_adr,
				),
			)
		);
	}
}
