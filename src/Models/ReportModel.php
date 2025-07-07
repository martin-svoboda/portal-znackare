<?php

namespace PortalZnackare\Models;

use PortalZnackareDeps\Wpify\Model\Attributes\Column;
use PortalZnackareDeps\Wpify\Model\Model;

class ReportModel extends Model {

	#[Column( type: Column::INT, auto_increment: true, primary_key: true )]
	public int $id = 0;

	#[Column( type: Column::INT )]
	public int $id_zp = 0;

	#[Column( type: Column::VARCHAR, params: 255 )]
	public string $cislo_zp = '';

	#[Column( type: Column::INT )]
	public int $int_adr = 0;

	#[Column( type: Column::BOOLEAN )]
	public bool $je_vedouci = false;

	#[Column( type: Column::TEXT )]
	public string $data_a = '';

	#[Column( type: Column::TEXT )]
	public string $data_b = '';

	#[Column( type: Column::TEXT )]
	public string $calculation = '';

	#[Column( type: Column::VARCHAR, params: 255 )]
	public string $state = '';

	#[Column( type: Column::TIMESTAMP )]
	public string $date_send = '';

	#[Column( type: Column::TIMESTAMP, nullable: false, default: 'NOW()' )]
	public ?string $date_created = null;

	#[Column( type: Column::TIMESTAMP, on_update: 'CURRENT_TIMESTAMP' )]
	public string $date_updated = '';

}
